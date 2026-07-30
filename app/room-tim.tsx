// app/room-tim.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '../constants/theme';

const TEAM_CODE = 'MKL123';

const AVATAR_COLORS = ['#C62828', '#1565C0', '#2E7D32', '#F57C00', '#6A1B9A'];

const MEMBERS = [
  { id: '1', name: 'Dimas Saputra', role: 'Ketua Tim', initial: 'DS', avatarBg: '#C62828' },
  { id: '2', name: 'Rina Maharani', role: 'Anggota', initial: 'RM', avatarBg: '#1565C0' },
  { id: '3', name: 'Budi Santoso', role: 'Anggota', initial: 'BS', avatarBg: '#2E7D32' },
  { id: '4', name: 'Anisa Putri', role: 'Anggota', initial: 'AP', avatarBg: '#F57C00' },
];

export default function RoomTimScreen() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // In a real app, use Clipboard.setStringAsync(TEAM_CODE)
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDaftarkan = () => {
    Alert.alert(
      'Konfirmasi',
      'Daftarkan tim ini ke Basket (Putra)?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Daftarkan',
          onPress: () => router.replace('/(tabs)/history'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Tim</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Team Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeSub}>Kode Tim Anda</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{TEAM_CODE}</Text>
            <TouchableOpacity
              style={[styles.copyBtn, copied && styles.copyBtnActive]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={18}
                color={copied ? '#2E7D32' : Colors.primary}
              />
              <Text style={[styles.copyBtnText, copied && { color: '#2E7D32' }]}>
                {copied ? 'Tersalin!' : 'Salin'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.instructionRow}>
            <Ionicons name="information-circle-outline" size={15} color={Colors.textSubtitle} />
            <Text style={styles.instructionText}>
              Bagikan kode ini ke anggota tim lainnya untuk bergabung.
            </Text>
          </View>
        </View>

        {/* Branch info */}
        <View style={styles.branchInfo}>
          <Ionicons name="trophy-outline" size={16} color={Colors.primary} />
          <Text style={styles.branchInfoText}>Basket (Putra) · Moklet Cup 2024</Text>
        </View>

        {/* Members */}
        <View style={styles.membersCard}>
          <View style={styles.membersHeader}>
            <Text style={styles.membersTitle}>Anggota Tim</Text>
            <View style={styles.memberCountBadge}>
              <Text style={styles.memberCountText}>{MEMBERS.length} / 10</Text>
            </View>
          </View>

          {MEMBERS.map((member, index) => (
            <View key={member.id}>
              {index > 0 && <View style={styles.memberDivider} />}
              <View style={styles.memberRow}>
                <View style={[styles.memberAvatar, { backgroundColor: member.avatarBg }]}>
                  <Text style={styles.memberInitial}>{member.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
                {member.role === 'Ketua Tim' && (
                  <View style={styles.leaderBadge}>
                    <Text style={styles.leaderBadgeText}>Ketua Tim</Text>
                  </View>
                )}
                {member.role === 'Anggota' && (
                  <View style={styles.memberBadge}>
                    <Text style={styles.memberBadgeText}>Siap</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTAs */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.leaveBtn} activeOpacity={0.8}>
          <Text style={styles.leaveBtnText}>Keluar dari Tim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerBtn}
          activeOpacity={0.85}
          onPress={handleDaftarkan}
        >
          <Text style={styles.registerBtnText}>Daftarkan Tim</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: 120,
    gap: Spacing.md,
  },
  codeCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  codeSub: {
    fontSize: 13,
    color: Colors.textSubtitle,
    marginBottom: Spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    marginBottom: Spacing.md,
  },
  codeText: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 6,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.round,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  copyBtnActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  instructionText: {
    fontSize: 12,
    color: Colors.textSubtitle,
    flex: 1,
    textAlign: 'center',
  },
  branchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.round,
    alignSelf: 'center',
  },
  branchInfoText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  membersCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  membersTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
  },
  memberCountBadge: {
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.round,
  },
  memberCountText: {
    fontSize: 12,
    color: Colors.textSubtitle,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
  },
  memberRole: {
    fontSize: 12,
    color: Colors.textSubtitle,
    marginTop: 1,
  },
  memberDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
  },
  leaderBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  leaderBadgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  memberBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  memberBadgeText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '700',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.base,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: Spacing.md,
  },
  leaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.round,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  leaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSubtitle,
  },
  registerBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: Radius.round,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  registerBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
  },
});
