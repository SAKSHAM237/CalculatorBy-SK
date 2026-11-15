import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LayoutProfile } from '../types';

interface KeypadProps {
  scientificVisible: boolean;
  onToggleScientific: () => void;
  onInsertToken: (token: string) => void;
  onDeleteBackward: () => void;
  onClear: () => void;
  onEvaluate: () => void;
  onAns: () => void;
  angleUnit: 'DEG' | 'RAD' | 'GRAD';
  onToggleAngleUnit: () => void;
  layoutProfile?: LayoutProfile;
}

interface ButtonItem {
  label: string;
  token?: string;
  type: 'num' | 'op' | 'action' | 'equal' | 'sci';
  onPressCustom?: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  scientificVisible,
  onToggleScientific,
  onInsertToken,
  onDeleteBackward,
  onClear,
  onEvaluate,
  onAns,
  angleUnit,
  onToggleAngleUnit,
  layoutProfile = 'ENGINEERING',
}) => {
  const isPocket = layoutProfile === 'POCKET';
  // Scientific Tray Buttons
  const scientificRows: ButtonItem[][] = [
    [
      { label: angleUnit, type: 'sci', onPressCustom: onToggleAngleUnit },
      { label: 'sin', token: '\\sin(', type: 'sci' },
      { label: 'cos', token: '\\cos(', type: 'sci' },
      { label: 'tan', token: '\\tan(', type: 'sci' },
      { label: 'log', token: '\\log(', type: 'sci' },
    ],
    [
      { label: 'ln', token: '\\ln(', type: 'sci' },
      { label: 'asin', token: '\\arcsin(', type: 'sci' },
      { label: 'acos', token: '\\arccos(', type: 'sci' },
      { label: 'atan', token: '\\arctan(', type: 'sci' },
      { label: 'x²', token: '^2', type: 'sci' },
    ],
    [
      { label: 'xʸ', token: '^{#?}', type: 'sci' },
      { label: '√', token: '\\sqrt{#?}', type: 'sci' },
      { label: '∛', token: '\\sqrt[3]{#?}', type: 'sci' },
      { label: 'x!', token: '!', type: 'sci' },
      { label: 'mod', token: '\\pmod{#?}', type: 'sci' },
    ],
    [
      { label: 'π', token: '\\pi', type: 'sci' },
      { label: 'e', token: 'e', type: 'sci' },
      { label: '|x|', token: '|#?|', type: 'sci' },
      { label: '1/x', token: '1/{#?}', type: 'sci' },
      { label: 'Ans', type: 'sci', onPressCustom: onAns },
    ],
  ];

  // Standard Basic Calculator Pad
  const basicRows: ButtonItem[][] = [
    [
      { label: 'AC', type: 'action', onPressCustom: onClear },
      { label: '(', token: '(', type: 'action' },
      { label: ')', token: ')', type: 'action' },
      { label: '÷', token: '/', type: 'op' },
    ],
    [
      { label: '7', token: '7', type: 'num' },
      { label: '8', token: '8', type: 'num' },
      { label: '9', token: '9', type: 'num' },
      { label: '×', token: '\\times', type: 'op' },
    ],
    [
      { label: '4', token: '4', type: 'num' },
      { label: '5', token: '5', type: 'num' },
      { label: '6', token: '6', type: 'num' },
      { label: '−', token: '-', type: 'op' },
    ],
    [
      { label: '1', token: '1', type: 'num' },
      { label: '2', token: '2', type: 'num' },
      { label: '3', token: '3', type: 'num' },
      { label: '+', token: '+', type: 'op' },
    ],
    [
      { label: '0', token: '0', type: 'num' },
      { label: '.', token: '.', type: 'num' },
      { label: '⌫', type: 'action', onPressCustom: onDeleteBackward },
      { label: '=', type: 'equal', onPressCustom: onEvaluate },
    ],
  ];

  const handlePress = (btn: ButtonItem) => {
    if (btn.onPressCustom) {
      btn.onPressCustom();
    } else if (btn.token) {
      onInsertToken(btn.token);
    }
  };

  return (
    <View style={[styles.container, isPocket && styles.pocketContainer]}>
      {/* Quick Scientific Drawer Bar - Only shown in Engineering Mode */}
      {!isPocket && (
        <View style={styles.topControlBar}>
          <TouchableOpacity
            style={[styles.sciToggleBtn, scientificVisible && styles.sciToggleBtnActive]}
            onPress={onToggleScientific}
            activeOpacity={0.7}
          >
            <Text style={[styles.sciToggleText, scientificVisible && styles.sciToggleTextActive]}>
              {scientificVisible ? '▼ Scientific' : '▲ Scientific'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scientific Drawer Tray - Only in Engineering Mode */}
      {!isPocket && scientificVisible && (
        <View style={styles.scientificGrid}>
          {scientificRows.map((row, rIdx) => (
            <View key={`sci-row-${rIdx}`} style={styles.row}>
              {row.map((btn, cIdx) => (
                <TouchableOpacity
                  key={`sci-btn-${rIdx}-${cIdx}`}
                  style={[styles.btn, styles.sciBtn]}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.sciBtnText}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Basic Grid */}
      <View style={styles.basicGrid}>
        {basicRows.map((row, rIdx) => (
          <View key={`basic-row-${rIdx}`} style={[styles.row, isPocket && styles.pocketRow]}>
            {row.map((btn, cIdx) => {
              const btnStyle = [
                styles.btn,
                isPocket && styles.pocketBtn,
                btn.type === 'num' && styles.numBtn,
                btn.type === 'op' && styles.opBtn,
                btn.type === 'action' && styles.actionBtn,
                btn.type === 'equal' && styles.equalBtn,
              ];
              const textStyle = [
                styles.btnText,
                isPocket && styles.pocketBtnText,
                btn.type === 'num' && styles.numText,
                btn.type === 'op' && (isPocket ? styles.pocketOpText : styles.opText),
                btn.type === 'action' && styles.actionText,
                btn.type === 'equal' && (isPocket ? styles.pocketEqualText : styles.equalText),
              ];
              return (
                <TouchableOpacity
                  key={`basic-btn-${rIdx}-${cIdx}`}
                  style={btnStyle}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.6}
                >
                  <Text style={textStyle}>{btn.label}</Text>
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
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  sciToggleBtn: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  sciToggleBtnActive: {
    backgroundColor: '#0A84FF22',
    borderColor: '#0A84FF',
  },
  sciToggleText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sciToggleTextActive: {
    color: '#0A84FF',
  },
  scientificGrid: {
    marginBottom: 8,
    backgroundColor: '#0E0E10',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  basicGrid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 4,
  },
  btn: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 24,
    fontWeight: '400',
  },
  numBtn: {
    backgroundColor: '#1C1C1E',
  },
  numText: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  opBtn: {
    backgroundColor: '#2C2C2E',
  },
  opText: {
    color: '#FF9F0A',
    fontSize: 28,
    fontWeight: '500',
  },
  actionBtn: {
    backgroundColor: '#3A3A3C',
  },
  actionText: {
    color: '#E5E5EA',
    fontSize: 20,
    fontWeight: '500',
  },
  equalBtn: {
    backgroundColor: '#FF9F0A',
  },
  equalText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '600',
  },
  sciBtn: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1A1A1E',
    marginHorizontal: 2,
  },
  sciBtnText: {
    color: '#64D2FF',
    fontSize: 14,
    fontWeight: '500',
  },
  pocketContainer: {
    paddingBottom: 24,
  },
  pocketRow: {
    marginVertical: 6,
  },
  pocketBtn: {
    height: 72,
    borderRadius: 36,
  },
  pocketBtnText: {
    fontSize: 28,
    fontWeight: '500',
  },
  pocketOpText: {
    fontSize: 32,
    fontWeight: '600',
  },
  pocketEqualText: {
    fontSize: 34,
    fontWeight: '700',
  },
});
