// app/(tabs)/history.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../../constants/theme';

const HISTORY = [
  {
    id: '1',
    event: 'Moklet Cup 2024',
    branch: 'Futsal Putra',
    status: 'Terdaftar',
    statusColor: '#2E7D32',
    statusBg: '#E8F5E9',
    date: '05 Agustus 2024',
    team: 'Tim Garuda FC',
    icon: 'football-outline',
  },
  {
    id: '2',
    event: 'Moklet Cup 2024',
    branch: 'Bulutangkis',
    status: 'Menunggu',
    statusColor: '#F57C00',
    statusBg: '#FFF3E0',
    date: '07 Agustus 2024',
    team: 'Individu',
    icon: 'accessibility-outline',
  },
  {
    id: '3',
    event: 'Lomba Robotik Nasional',
    branch: 'Kategori SMA/SMK',
    status: 'Ditolak',
    statusColor: Colors.primary,
    statusBg: Colors.primaryLight,
    date: '01 September 2024',
    team: 'Tim Robot Alpha',
    icon: 'hardware-chip-outline',
  },
  {
    id: '4',
    event: 'Festival Seni Budaya',
    branch: 'Tari Tradisional',
    status: 'Terdaftar',
    statusColor: '#2E7D32',
    statusBg: '#E8F5E9',
    date: '10 Oktober 2024',
    team: 'Kelompok Budaya XII RPL 1',
    icon: 'musical-notes-outline',
  },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Pendaftaran</Text>
        <Text style={styles.headerSub}>Semua pendaftaran event Anda</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {HISTORY.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.85}>
            {/* Top row: event + badge */}
            <View style={styles.cardTop}>
              <View style={[styles.iconBox, { backgroundColor: item.statusBg }]}>
                <Ionicons name={item.icon as any} size={20} color={item.statusColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventName}>{item.event}</Text>
                <Text style={styles.branchName}>{item.branch}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: item.statusBg }]}>
                <Text style={[styles.badgeText, { color: item.statusColor }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Bottom row: date + team */}
            <View style={styles.cardBottom}>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textSubtitle} />
                <Text style={styles.metaText}>{item.date}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="people-outline" size={13} color={Colors.textSubtitle} />
                <Text style={styles.metaText}>{item.team}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty padding bottom */}
        <View style={{ height: 16 }} />
      </ScrollView>
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
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSubtitle,
    textAlign: 'center',
    marginTop: 2,
  },
  list: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
  },
  branchName: {
    fontSize: 13,
    color: Colors.textSubtitle,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: Spacing.md,
  },
  cardBottom: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSubtitle,
  },
});
