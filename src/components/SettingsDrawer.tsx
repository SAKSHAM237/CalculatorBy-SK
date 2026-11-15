import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { AppSettings, AngleUnit, LayoutProfile } from '../types';

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  visible,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const precisionOptions = [16, 32, 64, 100];
  const angleOptions: AngleUnit[] = ['DEG', 'RAD', 'GRAD'];
  const layoutOptions: { key: LayoutProfile; label: string; desc: string }[] = [
    {
      key: 'ENGINEERING',
      label: 'Engineering Mode',
      desc: 'Full tiered view with scientific drawer and shortcuts',
    },
    {
      key: 'POCKET',
      label: 'Pocket Mode',
      desc: 'Minimal single-hand grid for quick arithmetic',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Calculator Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Precision Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DECIMAL PRECISION (BIG NUMBER)</Text>
              <Text style={styles.sectionDesc}>
                Configures mathjs and decimal.js base-10 calculation precision.
              </Text>
              <View style={styles.chipRow}>
                {precisionOptions.map(p => {
                  const selected = settings.precision === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.chip, selected && styles.chipActive]}
                      onPress={() => onUpdateSettings({ precision: p })}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                        {p} Digits
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Angle Mode Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ANGLE UNIT</Text>
              <View style={styles.chipRow}>
                {angleOptions.map(a => {
                  const selected = settings.angleUnit === a;
                  return (
                    <TouchableOpacity
                      key={a}
                      style={[styles.chip, selected && styles.chipActive]}
                      onPress={() => onUpdateSettings({ angleUnit: a })}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                        {a}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Layout Profile */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>LAYOUT PROFILE</Text>
              {layoutOptions.map(item => {
                const selected = settings.layoutProfile === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.optionCard, selected && styles.optionCardActive]}
                    onPress={() => onUpdateSettings({ layoutProfile: item.key })}
                  >
                    <View style={styles.radioDot}>
                      {selected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionLabel}>{item.label}</Text>
                      <Text style={styles.optionDesc}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Haptics */}
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Haptic Feedback</Text>
                  <Text style={styles.toggleDesc}>Subtle vibration on key presses</Text>
                </View>
                <Switch
                  value={settings.hapticsEnabled}
                  onValueChange={val => onUpdateSettings({ hapticsEnabled: val })}
                  trackColor={{ false: '#3A3A3C', true: '#30D158' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.footerNote}>
              <Text style={styles.footerText}>
                Engine: MathJS + Decimal.js (BigNumber 64-bit) & MathLive AST
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#636366',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#0A84FF',
  },
  chipText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: '#0A84FF',
    backgroundColor: '#0A84FF15',
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0A84FF',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  optionDesc: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleDesc: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  footerNote: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  footerText: {
    color: '#48484A',
    fontSize: 11,
    textAlign: 'center',
  },
});
