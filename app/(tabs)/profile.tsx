// app/(tabs)/profile.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { userState } from '../../constants/userState';

export default function ProfileScreen() {
  const username = userState.getNama() || 'Siswa Google';
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Red banner header */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Profil Saya</Text>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={42} color={Colors.primary} />
          </View>
        </View>
      </View>

      {/* Name section */}
      <View style={styles.nameSection}>
        <Text style={styles.userName}>{username}</Text>
        <Text style={styles.userSub}>XII RPL 1 · SMKN 4 Malang</Text>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="settings-outline" size={20} color="#1565C0" />
            </View>
            <Text style={styles.menuLabel}>Pengaturan Akun</Text>
            <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#2E7D32" />
            </View>
            <Text style={styles.menuLabel}>Privasi & Keamanan</Text>
            <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setShowLogoutModal(true)}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors.primary }]}>Keluar</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* App version */}
      <Text style={styles.version}>Moklet Event Center v1.0.0</Text>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowLogoutModal(false)}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            {/* Icon */}
            <View style={styles.modalIcon}>
              <Ionicons name="log-out-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Keluar Akun</Text>
            <Text style={styles.modalDesc}>
              Apakah kamu yakin ingin keluar dari akun ini?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutBtnText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  banner: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'android' ? 48 : 24,
    paddingBottom: 48,
    alignItems: 'center',
    position: 'relative',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.lg,
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -38,
    alignSelf: 'center',
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  nameSection: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: Spacing.xl,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textMain,
  },
  userSub: {
    fontSize: 13,
    color: Colors.textSubtitle,
    marginTop: 4,
  },
  menuSection: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMain,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: Spacing.base,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSubtitle,
    marginTop: Spacing.xl,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: Spacing.sm,
  },
  modalDesc: {
    fontSize: 14,
    color: Colors.textSubtitle,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.round,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
  },
  logoutBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.round,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
