import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { DisplayWebView, DisplayWebViewRef } from './src/components/DisplayWebView';
import { Keypad } from './src/components/Keypad';
import { ProgrammerScreen } from './src/components/ProgrammerScreen';
import { SettingsDrawer } from './src/components/SettingsDrawer';
import { CreditModal } from './src/components/CreditModal';
import { evaluateAsciiMath } from './src/engine/calculatorEngine';
import { AppSettings, CalculatorMode } from './src/types';

// Binary operators that should CHAIN from previous result after `=`
const OPERATOR_TOKENS = new Set(['+', '-', '\\times', '/', '^', '\\pmod{#?}', '%']);
// Digits and decimal that should start a FRESH calculation after `=`
const DIGIT_TOKENS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']);
// Postfix operations that apply directly to previous result after `=`
const POSTFIX_TOKENS = new Set(['^2', '!']);

export default function App() {
  const displayRef = useRef<DisplayWebViewRef>(null);

  // Application Settings
  const [settings, setSettings] = useState<AppSettings>({
    precision: 64,
    angleUnit: 'DEG',
    layoutProfile: 'ENGINEERING',
    hapticsEnabled: true,
  });

  // UI States
  const [mode, setMode] = useState<CalculatorMode>('SCIENTIFIC');
  const [scientificVisible, setScientificVisible] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showCredit, setShowCredit] = useState<boolean>(false);

  // Single Source of Truth for Expression & Evaluation State
  const [expression, setExpression] = useState<string>('');
  const [justEvaluated, setJustEvaluated] = useState<boolean>(false);
  const [evaluatedResult, setEvaluatedResult] = useState<string>('0');
  const [lastAns, setLastAns] = useState<string>('0');

  const isPocket = settings.layoutProfile === 'POCKET';

  // Helper to update expression, notify display, and recalculate live preview
  const updateExpr = (nextExpr: string, isEvaluatedState = false) => {
    setExpression(nextExpr);
    setJustEvaluated(isEvaluatedState);
    displayRef.current?.setValue(nextExpr);

    if (nextExpr && nextExpr.trim().length > 0) {
      const out = evaluateAsciiMath(nextExpr, settings.angleUnit, settings.precision);
      if (out.success) {
        setEvaluatedResult(out.result);
      }
    } else {
      setEvaluatedResult('0');
    }
  };

  // Safe multi-char backspace
  const removeLastToken = (str: string): string => {
    if (!str || str.length === 0) return '';
    const trimmed = str.endsWith(' ') ? str.slice(0, -1) : str;
    const multiTokens = [
      '\\sin(', '\\cos(', '\\tan(', '\\log(', '\\ln(',
      '\\arcsin(', '\\arccos(', '\\arctan(',
      '\\times', '\\pmod{#?}', '\\pmod{',
      '\\sqrt[3]{#?}', '\\sqrt{#?}', '\\sqrt{',
      '^{#?}', '^2', '1/{#?}', '|#?|', '\\pi'
    ];
    for (const t of multiTokens) {
      if (trimmed.endsWith(t)) {
        return trimmed.slice(0, -t.length).trimEnd();
      }
    }
    return trimmed.slice(0, -1).trimEnd();
  };

  // Keypad Actions
  const handleInsertToken = (token: string) => {
    if (justEvaluated) {
      if (DIGIT_TOKENS.has(token)) {
        // Fresh number entry after '=': replace expression
        const fresh = token === '.' ? '0.' : token;
        updateExpr(fresh, false);
        return;
      } else if (OPERATOR_TOKENS.has(token)) {
        // Chain from committed result: result + operator
        const chained = expression + ' ' + token + ' ';
        updateExpr(chained, false);
        return;
      } else if (POSTFIX_TOKENS.has(token)) {
        // Apply postfix operator (e.g. ^2 or !) directly to previous result
        const chained = expression + token;
        updateExpr(chained, false);
        return;
      } else {
        // Function entry (e.g. sin, sqrt): start fresh with function
        updateExpr(token, false);
        return;
      }
    }

    // Normal typing
    if (expression === '' && OPERATOR_TOKENS.has(token) && token !== '-') {
      // If user types an operator first, chain from lastAns
      updateExpr(lastAns + ' ' + token + ' ', false);
      return;
    }

    const next = expression + token;
    updateExpr(next, false);
  };

  const handleDeleteBackward = () => {
    if (justEvaluated) {
      handleClear();
      return;
    }
    const next = removeLastToken(expression);
    updateExpr(next, false);
  };

  const handleClear = () => {
    setExpression('');
    setEvaluatedResult('0');
    setJustEvaluated(false);
    displayRef.current?.setValue('');
  };

  const handleEvaluate = () => {
    if (!expression || !expression.trim()) return;
    const out = evaluateAsciiMath(expression, settings.angleUnit, settings.precision);
    if (out.success && out.result !== 'Error') {
      const res = out.result;
      setEvaluatedResult(res);
      setLastAns(res);
      setExpression(res);
      setJustEvaluated(true);
      displayRef.current?.setValue(res);
    } else {
      setEvaluatedResult('Error');
      setJustEvaluated(false);
    }
  };

  const handleAns = () => {
    if (justEvaluated) {
      updateExpr(lastAns, false);
    } else {
      updateExpr(expression + lastAns, false);
    }
  };

  const handleToggleAngleUnit = () => {
    setSettings(prev => ({
      ...prev,
      angleUnit: prev.angleUnit === 'DEG' ? 'RAD' : prev.angleUnit === 'RAD' ? 'GRAD' : 'DEG',
    }));
  };

  // Safe fallback if DisplayWebView sends ready event
  const handleDisplayReady = useCallback(() => {
    if (expression) {
      displayRef.current?.setValue(expression);
    }
  }, [expression]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        {/* Settings button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowSettings(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.iconButtonText}>⚙️</Text>
        </TouchableOpacity>

        {/* Mode Selector Pill - Only shown in Engineering Mode */}
        {!isPocket ? (
          <View style={styles.modePillContainer}>
            <TouchableOpacity
              style={[
                styles.modePillOption,
                mode !== 'PROGRAMMER' && styles.modePillOptionActive,
              ]}
              onPress={() => setMode('SCIENTIFIC')}
            >
              <Text
                style={[
                  styles.modePillText,
                  mode !== 'PROGRAMMER' && styles.modePillTextActive,
                ]}
              >
                Math
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modePillOption,
                mode === 'PROGRAMMER' && styles.modePillOptionActive,
              ]}
              onPress={() => setMode('PROGRAMMER')}
            >
              <Text
                style={[
                  styles.modePillText,
                  mode === 'PROGRAMMER' && styles.modePillTextActive,
                ]}
              >
                Programmer
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.pocketHeaderTitle}>Calculator</Text>
        )}

        {/* Credit Section Badge */}
        <TouchableOpacity
          style={styles.creditBadge}
          onPress={() => setShowCredit(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.creditBadgeText}>Credit</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {mode === 'PROGRAMMER' && !isPocket ? (
        <ProgrammerScreen />
      ) : (
        <View style={styles.calcContainer}>
          {/* Display Area */}
          <View style={[styles.displaySection, isPocket && styles.displaySectionPocket]}>
            {/* Technical Badges - Only in Engineering Mode */}
            {!isPocket && (
              <View style={styles.displayMetaRow}>
                <Text style={styles.angleTag}>{settings.angleUnit}</Text>
                <Text style={styles.precisionTag}>{settings.precision}-bit BigNum</Text>
              </View>
            )}

            {/* Offline MathLive WebView (Strictly read-only) */}
            <View style={styles.webViewWrapper}>
              <DisplayWebView
                ref={displayRef}
                onExpressionChange={() => {}}
                onReady={handleDisplayReady}
              />
            </View>

            {/* Evaluated Result Preview */}
            <View style={styles.resultRow}>
              <Text
                style={[styles.resultText, isPocket && styles.resultTextPocket]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                = {evaluatedResult}
              </Text>
            </View>
          </View>

          {/* Native Keypad */}
          <View style={[styles.keypadSection, isPocket && styles.keypadSectionPocket]}>
            <Keypad
              scientificVisible={scientificVisible}
              onToggleScientific={() => setScientificVisible(v => !v)}
              onInsertToken={handleInsertToken}
              onDeleteBackward={handleDeleteBackward}
              onClear={handleClear}
              onEvaluate={handleEvaluate}
              onAns={handleAns}
              angleUnit={settings.angleUnit}
              onToggleAngleUnit={handleToggleAngleUnit}
              layoutProfile={settings.layoutProfile}
            />
          </View>
        </View>
      )}

      {/* Settings Drawer */}
      <SettingsDrawer
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={partial => setSettings(prev => ({ ...prev, ...partial }))}
      />

      {/* Credit Modal */}
      <CreditModal visible={showCredit} onClose={() => setShowCredit(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 18,
  },
  modePillContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 3,
  },
  modePillOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 17,
  },
  modePillOptionActive: {
    backgroundColor: '#2C2C2E',
  },
  modePillText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  modePillTextActive: {
    color: '#FFFFFF',
  },
  pocketHeaderTitle: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  creditBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#FF9F0A22',
    borderWidth: 1,
    borderColor: '#FF9F0A',
  },
  creditBadgeText: {
    color: '#FF9F0A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  calcContainer: {
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  displaySection: {
    height: '28%',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1E',
  },
  displaySectionPocket: {
    height: '24%',
    justifyContent: 'flex-end',
  },
  displayMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  angleTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A84FF',
    backgroundColor: '#0A84FF18',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  precisionTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#30D158',
    backgroundColor: '#30D15818',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  webViewWrapper: {
    flex: 1,
    pointerEvents: 'none',
  },
  resultRow: {
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  resultText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#30D158',
  },
  resultTextPocket: {
    fontSize: 42,
    fontWeight: '700',
    color: '#30D158',
  },
  keypadSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keypadSectionPocket: {
    justifyContent: 'center',
  },
});
