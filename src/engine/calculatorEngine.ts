import { create, all, type MathJsStatic } from 'mathjs';
import Decimal from 'decimal.js';
import { AngleUnit } from '../types';

let currentPrecision = 64;
let mathInstance: MathJsStatic = create(all, {
  number: 'BigNumber',
  precision: currentPrecision,
});

export const configureEnginePrecision = (precision: number) => {
  currentPrecision = precision;
  Decimal.set({ precision });
  mathInstance = create(all, {
    number: 'BigNumber',
    precision,
  });
};

/**
 * Validates an expression for obviously broken patterns before evaluation.
 * Returns an error message string if invalid, or null if okay.
 */
const preValidate = (expr: string): string | null => {
  // Empty
  if (!expr || !expr.trim()) return null;

  // Trailing binary operator (but allow unary minus/plus at start)
  if (/[+\-*/^%,]\s*$/.test(expr)) return 'Incomplete expression';

  // Multiple consecutive operators (e.g. "5 ++ 3", "5 */ 3")
  if (/[+*/^%]{2,}/.test(expr)) return 'Invalid operator sequence';

  // Multiple decimal points in a single number (e.g. "1.2.3")
  if (/\d+\.\d+\.\d+/.test(expr)) return 'Invalid number format';

  // Check balanced parentheses
  let depth = 0;
  for (const ch of expr) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth < 0) return 'Mismatched parentheses';
  }
  if (depth !== 0) return 'Unclosed parenthesis';

  return null;
};

/**
 * Preprocesses ASCII-Math from MathLive so that it matches MathJS syntax.
 */
export const sanitizeAsciiMath = (raw: string): string => {
  if (!raw || !raw.trim()) return '';

  let expr = raw.trim();

  // Normalize multiplication symbols to mathjs *
  expr = expr.replace(/⋅|×|\\times|\bast\b|\bcdot\b/g, '*');

  // Normalize division
  expr = expr.replace(/÷|\\div/g, '/');

  // Normalize minus (Unicode "−" vs ASCII "-")
  expr = expr.replace(/−/g, '-');

  // MathLive greek constants
  expr = expr.replace(/\\pi\b|π/g, 'pi');
  expr = expr.replace(/\\infty\b/g, 'Infinity');

  // MathLive trig functions: \sin( → sin(
  expr = expr.replace(/\\(sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|asin|acos|atan)\b/g, '$1');

  // MathLive \log → log, \ln → log with implicit base e
  expr = expr.replace(/\\log\b/g, 'log');
  expr = expr.replace(/\\ln\b/g, 'log');

  // MathLive \sqrt{x} → sqrt(x)
  expr = expr.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');

  // MathLive \sqrt[3]{x} → cbrt(x)  — cube root
  expr = expr.replace(/\\sqrt\[3\]\{([^}]+)\}/g, 'cbrt($1)');

  // MathLive factorial: n! → factorial(n)
  expr = expr.replace(/(\d+)!/g, 'factorial($1)');

  // MathLive pmod: \pmod{x} → mod x (strip, handled by mathjs mod operator)
  expr = expr.replace(/\\pmod\{([^}]+)\}/g, ' mod $1');

  // MathLive absolute value bars |x| → abs(x)
  // Simple single-level replacement
  expr = expr.replace(/\|([^|]+)\|/g, 'abs($1)');

  // MathLive superscript: ^{expr} → ^(expr) for mathjs
  expr = expr.replace(/\^\{([^}]+)\}/g, '^($1)');

  // MathLive implicit fraction: \frac{a}{b} → (a)/(b)
  expr = expr.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');

  // Remove leftover backslashes
  expr = expr.replace(/\\/g, '');

  // MathLive placeholder #? → remove (incomplete expression)
  expr = expr.replace(/#\?/g, '');

  // Normalize whitespace
  expr = expr.replace(/\s+/g, ' ').trim();

  return expr;
};

/**
 * Handles angle mode conversions for trigonometric functions.
 */
const wrapTrigForAngleUnit = (expr: string, angleUnit: AngleUnit): string => {
  if (angleUnit === 'RAD') return expr;

  const toRadFactor = angleUnit === 'DEG' ? '(pi / 180)' : '(pi / 200)';
  const fromRadFactor = angleUnit === 'DEG' ? '(180 / pi)' : '(200 / pi)';

  // Forward trig: sin(arg) → sin((arg) * factor)
  let transformed = expr.replace(
    /\b(sin|cos|tan|sec|csc|cot)\s*\(([^()]+)\)/g,
    `$1(($2) * ${toRadFactor})`
  );

  // Inverse trig: asin(val) → asin(val) * fromRadFactor
  transformed = transformed.replace(
    /\b(arcsin|arccos|arctan|asin|acos|atan|asec|acsc|acot)\s*\(([^()]+)\)/g,
    `($1($2) * ${fromRadFactor})`
  );

  return transformed;
};

/**
 * Formats a result number string cleanly:
 * - Strips trailing zeros after decimal
 * - Caps extremely long decimals to precision digits
 * - Converts Infinity / NaN to meaningful strings
 */
const formatResult = (value: any, precision: number): string => {
  if (value === null || value === undefined) return '0';

  // BigNumber from mathjs
  if (typeof value === 'object' && value.isBigNumber) {
    if (!value.isFinite()) {
      return value.isNaN() ? 'Error' : (value.isNegative() ? '-∞' : '∞');
    }
    let str = value.toFixed();
    // Strip trailing decimal zeros
    if (str.includes('.')) {
      str = str.replace(/\.?0+$/, '');
    }
    // Truncate extremely long strings to precision digits
    const dotIdx = str.indexOf('.');
    if (dotIdx >= 0 && str.length - dotIdx - 1 > precision) {
      str = value.toSignificantDigits(precision).toFixed();
      if (str.includes('.')) str = str.replace(/\.?0+$/, '');
    }
    return str || '0';
  }

  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 'Error';
    if (!Number.isFinite(value)) return value > 0 ? '∞' : '-∞';
    return value.toString();
  }

  return String(value);
};

export interface EvaluationOutput {
  success: boolean;
  result: string;
  error?: string;
}

/**
 * Evaluates an ASCII-Math expression extracted from MathLive using mathjs BigNumber.
 */
export const evaluateAsciiMath = (
  rawAsciiMath: string,
  angleUnit: AngleUnit = 'DEG',
  precision: number = 64
): EvaluationOutput => {
  if (!rawAsciiMath || !rawAsciiMath.trim()) {
    return { success: true, result: '0' };
  }

  try {
    if (precision !== currentPrecision) {
      configureEnginePrecision(precision);
    }

    const sanitized = sanitizeAsciiMath(rawAsciiMath);

    if (!sanitized) {
      return { success: true, result: '0' };
    }

    // Pre-validate for obviously bad patterns
    const validationErr = preValidate(sanitized);
    if (validationErr) {
      return { success: false, result: 'Error', error: validationErr };
    }

    const withAngles = wrapTrigForAngleUnit(sanitized, angleUnit);

    const evaluated = mathInstance.evaluate(withAngles);

    if (evaluated === undefined || evaluated === null) {
      return { success: true, result: '0' };
    }

    const resultStr = formatResult(evaluated, precision);

    // Treat divide-by-zero / Infinity as error for display purposes
    if (resultStr === '∞' || resultStr === '-∞') {
      return { success: false, result: 'Division by zero', error: 'Division by zero' };
    }

    return {
      success: resultStr !== 'Error',
      result: resultStr || '0',
    };
  } catch (err: any) {
    const msg: string = err?.message || 'Invalid Expression';
    // Surface friendly divide-by-zero message
    if (msg.toLowerCase().includes('divide') || msg.toLowerCase().includes('zero')) {
      return { success: false, result: 'Division by zero', error: msg };
    }
    return {
      success: false,
      result: 'Error',
      error: msg,
    };
  }
};
