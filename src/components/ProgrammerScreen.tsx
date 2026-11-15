import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ProgrammerBase, ProgrammerOp } from '../types';

export const ProgrammerScreen: React.FC = () => {
  const [currentBase, setCurrentBase] = useState<ProgrammerBase>(10);
  const [currentValue, setCurrentValue] = useState<bigint>(0n);
  const [pendingOp, setPendingOp] = useState<ProgrammerOp | null>(null);
  const [storedValue, setStoredValue] = useState<bigint | null>(null);
  const [isNewEntry, setIsNewEntry] = useState<boolean>(true);

  // Mask to 64-bit unsigned/signed
  const MASK_64 = 0xffffffffffffffffn;
  const to64 = (val: bigint): bigint => BigInt.asIntN(64, val);
  const toUint64 = (val: bigint): bigint => BigInt.asUintN(64, val);

  // Formatting representations
  const hexStr = toUint64(currentValue).toString(16).toUpperCase();
  const decStr = to64(currentValue).toString(10);
  const octStr = toUint64(currentValue).toString(8);
  const binRaw = toUint64(currentValue).toString(2).padStart(64, '0');
  // Chunk binary in groups of 4 for clean reading
  const binChunks = binRaw.match(/.{1,4}/g)?.join(' ') || binRaw;

  // Check valid digits for the active base
  const isValidDigit = (char: string): boolean => {
    const code = char.toUpperCase().charCodeAt(0);
    if (currentBase === 2) return char === '0' || char === '1';
    if (currentBase === 8) return code >= 48 && code <= 55; // 0-7
    if (currentBase === 10) return code >= 48 && code <= 57; // 0-9
    if (currentBase === 16) {
      return (code >= 48 && code <= 57) || (code >= 65 && code <= 70); // 0-9, A-F
    }
    return false;
  };

  const handleDigit = (char: string) => {
    if (!isValidDigit(char)) return;

    if (isNewEntry) {
      const parsed = BigInt(parseInt(char, currentBase));
      setCurrentValue(to64(parsed));
      setIsNewEntry(false);
    } else {
      const baseBig = BigInt(currentBase);
      const digitBig = BigInt(parseInt(char, currentBase));
      const nextVal = to64(currentValue * baseBig + digitBig);
      setCurrentValue(nextVal);
    }
  };

  const handleClear = () => {
    setCurrentValue(0n);
    setStoredValue(null);
    setPendingOp(null);
    setIsNewEntry(true);
  };

  const handleBackspace = () => {
    if (isNewEntry) return;
    const baseBig = BigInt(currentBase);
    const nextVal = currentValue / baseBig;
    setCurrentValue(to64(nextVal));
  };

  const executeOp = (op: ProgrammerOp, a: bigint, b: bigint): bigint => {
    switch (op) {
      case 'AND':
        return to64(a & b);
      case 'OR':
        return to64(a | b);
      case 'XOR':
        return to64(a ^ b);
      case 'NAND':
        return to64(~(a & b));
      case 'NOR':
        return to64(~(a | b));
      case 'SHL': {
        const shift = Number(b & 63n);
        return to64(a << BigInt(shift));
      }
      case 'SHR': {
        const shift = Number(b & 63n);
        return to64(a >> BigInt(shift));
      }
      case 'ROL': {
        const s = BigInt(Number(b & 63n));
        const uA = toUint64(a);
        const rolled = ((uA << s) | (uA >> (64n - s))) & MASK_64;
        return to64(rolled);
      }
      case 'ROR': {
        const s = BigInt(Number(b & 63n));
        const uA = toUint64(a);
        const rolled = ((uA >> s) | (uA << (64n - s))) & MASK_64;
        return to64(rolled);
      }
      default:
        return b;
    }
  };

  const handleOpPress = (op: ProgrammerOp) => {
    if (op === 'NOT') {
      setCurrentValue(to64(~currentValue));
      return;
    }

    if (storedValue !== null && pendingOp) {
      const res = executeOp(pendingOp, storedValue, currentValue);
      setCurrentValue(res);
      setStoredValue(res);
    } else {
      setStoredValue(currentValue);
    }
    setPendingOp(op);
    setIsNewEntry(true);
  };

  const handleEqual = () => {
    if (storedValue !== null && pendingOp) {
      const res = executeOp(pendingOp, storedValue, currentValue);
      setCurrentValue(res);
      setStoredValue(null);
      setPendingOp(null);
      setIsNewEntry(true);
    }
  };

  const bitwiseRow1: ProgrammerOp[] = ['AND', 'OR', 'XOR', 'NOT', 'NAND'];
  const bitwiseRow2: ProgrammerOp[] = ['NOR', 'SHL', 'SHR', 'ROL', 'ROR'];

  const hexDigits = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <View style={styles.container}>
      {/* 4-Base Live Conversion Display */}
      <View style={styles.displayCard}>
        {[
          { label: 'HEX', base: 16 as ProgrammerBase, val: hexStr },
          { label: 'DEC', base: 10 as ProgrammerBase, val: decStr },
          { label: 'OCT', base: 8 as ProgrammerBase, val: octStr },
        ].map(item => (
          <TouchableOpacity
            key={item.label}
            style={[styles.baseRow, currentBase === item.base && styles.activeBaseRow]}
            onPress={() => setCurrentBase(item.base)}
            activeOpacity={0.7}
          >
            <Text style={[styles.baseLabel, currentBase === item.base && styles.activeBaseLabel]}>
              {item.label}
            </Text>
            <Text
              style={[styles.baseValue, currentBase === item.base && styles.activeBaseValue]}
              numberOfLines={1}
            >
              {item.val}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Binary viewer */}
        <TouchableOpacity
          style={[styles.baseRow, currentBase === 2 && styles.activeBaseRow]}
          onPress={() => setCurrentBase(2)}
          activeOpacity={0.7}
        >
          <Text style={[styles.baseLabel, currentBase === 2 && styles.activeBaseLabel]}>
            BIN
          </Text>
          <Text
            style={[styles.binValue, currentBase === 2 && styles.activeBaseValue]}
            numberOfLines={2}
          >
            {binChunks}
          </Text>
        </TouchableOpacity>

        {pendingOp && (
          <Text style={styles.opIndicator}>
            Active Op: {pendingOp} (A = {storedValue?.toString(currentBase).toUpperCase()})
          </Text>
        )}
      </View>

      {/* Bitwise operations */}
      <View style={styles.bitOpsContainer}>
        <View style={styles.opRow}>
          {bitwiseRow1.map(op => (
            <TouchableOpacity
              key={op}
              style={[styles.bitOpBtn, pendingOp === op && styles.activeBitOpBtn]}
              onPress={() => handleOpPress(op)}
            >
              <Text style={styles.bitOpText}>{op}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.opRow}>
          {bitwiseRow2.map(op => (
            <TouchableOpacity
              key={op}
              style={[styles.bitOpBtn, pendingOp === op && styles.activeBitOpBtn]}
              onPress={() => handleOpPress(op)}
            >
              <Text style={styles.bitOpText}>{op}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* HEX Digits A-F */}
      <View style={styles.hexRow}>
        {hexDigits.map(d => {
          const enabled = currentBase === 16;
          return (
            <TouchableOpacity
              key={d}
              disabled={!enabled}
              style={[styles.hexBtn, !enabled && styles.btnDisabled]}
              onPress={() => handleDigit(d)}
            >
              <Text style={[styles.hexText, !enabled && styles.textDisabled]}>{d}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Standard Keypad for Programmer Mode */}
      <View style={styles.numGrid}>
        {[
          ['7', '8', '9', '⌫'],
          ['4', '5', '6', 'AC'],
          ['1', '2', '3', '='],
          ['0'],
        ].map((row, rIdx) => (
          <View key={`row-${rIdx}`} style={styles.row}>
            {row.map(k => {
              if (k === '⌫') {
                return (
                  <TouchableOpacity
                    key={k}
                    style={[styles.numBtn, styles.actionBtn]}
                    onPress={handleBackspace}
                  >
                    <Text style={styles.actionText}>⌫</Text>
                  </TouchableOpacity>
                );
              }
              if (k === 'AC') {
                return (
                  <TouchableOpacity
                    key={k}
                    style={[styles.numBtn, styles.actionBtn]}
                    onPress={handleClear}
                  >
                    <Text style={styles.actionText}>AC</Text>
                  </TouchableOpacity>
                );
              }
              if (k === '=') {
                return (
                  <TouchableOpacity
                    key={k}
                    style={[styles.numBtn, styles.equalBtn]}
                    onPress={handleEqual}
                  >
                    <Text style={styles.equalText}>=</Text>
                  </TouchableOpacity>
                );
              }

              const enabled = isValidDigit(k);
              return (
                <TouchableOpacity
                  key={k}
                  disabled={!enabled}
                  style={[styles.numBtn, !enabled && styles.btnDisabled, k === '0' && styles.zeroBtn]}
                  onPress={() => handleDigit(k)}
                >
                  <Text style={[styles.numText, !enabled && styles.textDisabled]}>{k}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#000000',
  },
  displayCard: {
    backgroundColor: '#121214',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#242428',
    marginBottom: 8,
  },
  baseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeBaseRow: {
    backgroundColor: '#0A84FF20',
  },
  baseLabel: {
    width: 44,
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
  },
  activeBaseLabel: {
    color: '#0A84FF',
  },
  baseValue: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 17,
    color: '#D1D1D6',
    textAlign: 'right',
  },
  binValue: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#D1D1D6',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  activeBaseValue: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  opIndicator: {
    marginTop: 6,
    fontSize: 11,
    color: '#FF9F0A',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  bitOpsContainer: {
    gap: 4,
    marginBottom: 6,
  },
  opRow: {
    flexDirection: 'row',
    gap: 4,
  },
  bitOpBtn: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  activeBitOpBtn: {
    borderColor: '#FF9F0A',
    backgroundColor: '#FF9F0A22',
  },
  bitOpText: {
    color: '#FF9F0A',
    fontSize: 11,
    fontWeight: '700',
  },
  hexRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  hexBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#242426',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexText: {
    color: '#64D2FF',
    fontSize: 16,
    fontWeight: '600',
  },
  numGrid: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  numBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zeroBtn: {
    flex: 2,
  },
  numText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
  },
  actionBtn: {
    backgroundColor: '#3A3A3C',
  },
  actionText: {
    color: '#E5E5EA',
    fontSize: 18,
    fontWeight: '600',
  },
  equalBtn: {
    backgroundColor: '#FF9F0A',
  },
  equalText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
  },
  btnDisabled: {
    backgroundColor: '#141416',
    opacity: 0.3,
  },
  textDisabled: {
    color: '#48484A',
  },
});
