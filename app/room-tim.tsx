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
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius } from '../constants/theme';

const TEAM_CODE = 'MKL123';

export default function RoomTimScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  // Mode: 'join' (default or joined via code) vs 'create' (created new room as leader)
  const isCreateMode = mode === 'create';

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveTeam = () => {
    Alert.alert(
      'Konfirmasi',
      'Apakah kamu yakin ingin keluar dari tim ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  // Data anggota sesuai image request (3/4 jika mode join, 1/4 jika mode create)
  const memberCount = isCreateMode ? '1/4' : '3/4';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#B81414" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Tim</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Top Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeSubtitle}>KODE BERGABUNG TIM</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{TEAM_CODE}</Text>
            <TouchableOpacity
              style={[styles.copyPill, copied && styles.copyPillActive]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={16}
                color={copied ? '#2E7D32' : '#1E293B'}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.codeDesc}>
            Bagikan kode ini ke temanmu agar mereka bisa bergabung.
          </Text>
        </View>

        {/* Section Header & Count Badge */}
        <View style={styles.membersHeader}>
          <Text style={styles.sectionTitle}>Anggota Tim</Text>
          <View style={styles.badgePill}>
            <Ionicons name="people" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>{memberCount}</Text>
          </View>
        </View>

        {/* Member List Card */}
        <View style={styles.membersCard}>
          {/* Member 1: Ahmad (Leader) */}
          <View style={styles.memberRow}>
            <View style={styles.leaderAvatar}>
              <Text style={styles.leaderAvatarText}>A</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>Ahmad</Text>
              <Text style={styles.leaderTag}>★ Leader</Text>
            </View>
          </View>

          {!isCreateMode && (
            <>
              <View style={styles.divider} />

              {/* Member 2: Siti */}
              <View style={styles.memberRow}>
                <View style={styles.sitiAvatar}>
                  <Text style={styles.memberAvatarText}>S</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>Siti</Text>
                  <Text style={styles.memberRole}>Anggota</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Member 3: Budi */}
              <View style={styles.memberRow}>
                <View style={styles.budiAvatar}>
                  <Text style={styles.memberAvatarText}>B</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>Budi</Text>
                  <Text style={styles.memberRole}>Anggota</Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.divider} />

          {/* Member Slot Kosong */}
          <View style={styles.memberRow}>
            <View style={styles.waitingAvatar}>
              <Ionicons name="person-add-outline" size={18} color="#94A3B8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.waitingText}>Menunggu Anggota...</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Actions */}
      <View style={styles.bottomContainer}>
        <Text style={styles.noticeText}>
          Tim membutuhkan minimal 4 anggota untuk dikunci.
        </Text>

        <TouchableOpacity style={styles.lockTeamDisabledBtn} activeOpacity={0.9} disabled>
          <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={{ marginRight: 6 }} />
          <Text style={styles.lockTeamDisabledText}>Lock Team</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.leaveTeamOutlineBtn}
          activeOpacity={0.8}
          onPress={handleLeaveTeam}
        >
          <Ionicons name="exit-outline" size={18} color="#B81414" style={{ marginRight: 6 }} />
          <Text style={styles.leaveTeamOutlineText}>Keluar dari Tim</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B81414',
  },
  content: {
    padding: Spacing.base,
    paddingBottom: 160,
  },
  codeCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: Spacing.lg,
  },
  codeSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#757575',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#B81414',
    letterSpacing: 4,
  },
  copyPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  copyPillActive: {
    backgroundColor: '#E8F5E9',
  },
  codeDesc: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMain,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B81414',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  membersCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },

  // Avatars
  leaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderAvatarText: {
    color: '#B81414',
    fontSize: 18,
    fontWeight: '800',
  },
  sitiAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  budiAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
  },

  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 2,
  },
  leaderTag: {
    fontSize: 12,
    color: '#B81414',
    fontWeight: '700',
  },
  memberRole: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  waitingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  waitingText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 12,
    color: '#B81414',
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontWeight: '500',
  },
  lockTeamDisabledBtn: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  lockTeamDisabledText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
  },
  leaveTeamOutlineBtn: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#B81414',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveTeamOutlineText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B81414',
  },
});
