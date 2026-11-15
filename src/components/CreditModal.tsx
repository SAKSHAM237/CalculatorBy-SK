import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
  Image,
} from 'react-native';
import { SocialLink } from '../types';
import { OFFICIAL_ICONS } from '../assets/socialIcons';

interface CreditModalProps {
  visible: boolean;
  onClose: () => void;
}

export const OFFICIAL_LINKS: SocialLink[] = [
  // 1. PROFESSIONAL & DEVELOPMENT (TIER 1)
  {
    category: 'Professional & Development',
    label: 'LinkedIn',
    iconKey: 'linkedin',
    handle: 'saksham237',
    url: 'https://www.linkedin.com/in/saksham237/',
  },
  {
    category: 'Professional & Development',
    label: 'GitHub',
    iconKey: 'github',
    handle: 'SAKSHAM237',
    url: 'https://github.com/SAKSHAM237',
  },
  // 2. COMPETITIVE PROGRAMMING & DSA (TIER 2)
  {
    category: 'Competitive Programming & DSA',
    label: 'LeetCode',
    iconKey: 'leetcode',
    handle: 'Saksham237',
    url: 'https://leetcode.com/u/Saksham237/',
  },
  {
    category: 'Competitive Programming & DSA',
    label: 'CodeChef',
    iconKey: 'codechef',
    handle: 'dark_polymath',
    url: 'https://www.codechef.com/users/dark_polymath',
  },
  // 3. SOCIAL & NETWORKING (TIER 3)
  {
    category: 'Social & Networking',
    label: 'X (Twitter)',
    iconKey: 'x',
    handle: '@s_k_sharma237',
    url: 'https://x.com/s_k_sharma237',
  },
  {
    category: 'Social & Networking',
    label: 'Instagram (Primary)',
    iconKey: 'instagram',
    handle: '@237saksham',
    url: 'https://www.instagram.com/237saksham/',
  },
  {
    category: 'Social & Networking',
    label: 'Instagram (Alt)',
    iconKey: 'instagram',
    handle: '@silent.polymath',
    url: 'https://www.instagram.com/silent.polymath/',
  },
];

export const CreditModal: React.FC<CreditModalProps> = ({ visible, onClose }) => {
  const handleOpenUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.warn('Could not open url', err);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.quotePill}>Engineered by</Text>
              <Text style={styles.nameTitle}>Saksham Sharma</Text>
              <Text style={styles.subtitle}>Engineering Calculator Architect</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {OFFICIAL_LINKS.map((item, idx) => (
              <TouchableOpacity
                key={`social-${idx}`}
                style={styles.linkCard}
                onPress={() => handleOpenUrl(item.url)}
                activeOpacity={0.7}
              >
                <View style={styles.iconBadge}>
                  <Image
                    source={{ uri: OFFICIAL_ICONS[item.iconKey] }}
                    style={styles.officialIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.linkInfo}>
                  <Text style={styles.linkLabel}>{item.label}</Text>
                  <Text style={styles.linkHandle}>{item.handle}</Text>
                </View>
                <Text style={styles.arrowIcon}>↗</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.licenseBadge}>
              <Text style={styles.licenseText}>
                Crafted with High Precision • MathJS & MathLive Engine
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
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  quotePill: {
    color: '#FF9F0A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nameTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    marginTop: 4,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242426',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  officialIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
  },
  linkInfo: {
    flex: 1,
  },
  linkLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  linkHandle: {
    color: '#0A84FF',
    fontSize: 12,
    marginTop: 1,
  },
  arrowIcon: {
    color: '#8E8E93',
    fontSize: 18,
    fontWeight: '700',
  },
  licenseBadge: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  licenseText: {
    color: '#636366',
    fontSize: 11,
    textAlign: 'center',
  },
});
