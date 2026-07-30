// app/arsip-pengumuman.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '../constants/theme';

const ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Perubahan Jadwal Sertifikat Turnamen',
    description:
      'Pengambilan sertifikat turnamen Moklet Cup 2024 diundur ke tanggal 25 November 2024 di Aula Utama.',
    date: '15 Nov 2024',
    statusColor: '#C62828',
    statusBg: '#FFEBEE',
    icon: 'alert-circle-outline',
    category: 'Penting',
  },
  {
    id: '2',
    title: 'Pemenang Lomba Futsal Putra',
    description:
      'Selamat kepada Tim Garuda FC yang telah memenangkan juara pertama cabang Futsal Putra pada Moklet Cup 2024.',
    date: '12 Nov 2024',
    statusColor: '#2E7D32',
    statusBg: '#E8F5E9',
    icon: 'trophy-outline',
    category: 'Pengumuman',
  },
  {
    id: '3',
    title: 'Pendaftaran Jadwal Sertifikasi',
    description:
      'Pendaftaran jadwal sertifikasi untuk peserta yang belum mendaftar dibuka kembali mulai 10 November 2024.',
    date: '08 Nov 2024',
    statusColor: '#F57C00',
    statusBg: '#FFF3E0',
    icon: 'time-outline',
    category: 'Info',
  },
  {
    id: '4',
    title: 'Pendaftaran Jadwal Perlombaan',
    description:
      'Jadwal perlombaan Moklet Cup 2024 telah dirilis. Peserta diminta memperhatikan jadwal masing-masing cabang.',
    date: '10 Nov 2024',
    statusColor: '#1565C0',
    statusBg: '#E3F2FD',
    icon: 'calendar-outline',
    category: 'Jadwal',
  },
  {
    id: '5',
    title: 'Perubahan Jadwal Lomba',
    description:
      'Jadwal babak semifinal Basket Putra diubah menjadi pukul 08.00 WIB di Lapangan Indoor.',
    date: '12 Nov 2024',
    statusColor: '#C62828',
    statusBg: '#FFEBEE',
    icon: 'refresh-circle-outline',
    category: 'Penting',
  },
  {
    id: '6',
    title: 'Pendaftaran Ditutup Sementara',
    description:
      'Pendaftaran cabang Futsal ditutup sementara karena kuota telah terpenuhi. Informasi lebih lanjut akan diumumkan.',
    date: '17 Nov 2024',
    statusColor: '#F57C00',
    statusBg: '#FFF3E0',
    icon: 'close-circle-outline',
    category: 'Info',
  },
  {
    id: '7',
    title: 'Jadwal Technical Meeting',
    description:
      'Technical meeting untuk semua cabang lomba akan dilaksanakan pada Kamis, 14 November 2024 pukul 13.00 WIB.',
    date: '08 Nov 2024',
    statusColor: '#6A1B9A',
    statusBg: '#F3E5F5',
    icon: 'people-outline',
    category: 'Kegiatan',
  },
  {
    id: '8',
    title: 'Daftar Ulang Peserta Turnamen',
    description:
      'Peserta yang sudah terdaftar wajib melakukan daftar ulang sebelum tanggal 15 November 2024.',
    date: '10 Nov 2024',
    statusColor: '#2E7D32',
    statusBg: '#E8F5E9',
    icon: 'checkmark-circle-outline',
    category: 'Penting',
  },
];

export default function ArsipPengumumanScreen() {
  const [search, setSearch] = useState('');

  const filtered = ANNOUNCEMENTS.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

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
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Arsip Pengumuman</Text>
          <Text style={styles.headerSub}>Cari dan temukan pengumuman sebelumnya.</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textPlaceholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari pengumuman..."
            placeholderTextColor={Colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.map((ann) => (
          <TouchableOpacity key={ann.id} style={styles.annCard} activeOpacity={0.85}>
            {/* Status icon */}
            <View style={[styles.annIconWrapper, { backgroundColor: ann.statusBg }]}>
              <Ionicons name={ann.icon as any} size={22} color={ann.statusColor} />
            </View>

            {/* Content */}
            <View style={styles.annContent}>
              <View style={styles.annTopRow}>
                <Text style={styles.annTitle} numberOfLines={2}>
                  {ann.title}
                </Text>
                <View style={[styles.categoryBadge, { backgroundColor: ann.statusBg }]}>
                  <Text style={[styles.categoryText, { color: ann.statusColor }]}>
                    {ann.category}
                  </Text>
                </View>
              </View>
              <Text style={styles.annDesc} numberOfLines={2}>
                {ann.description}
              </Text>
              <View style={styles.annFooter}>
                <Ionicons name="calendar-outline" size={11} color={Colors.textSubtitle} />
                <Text style={styles.annDate}>{ann.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
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
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textSubtitle,
    marginTop: 1,
  },
  searchRow: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMain,
  },
  list: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  annCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  annIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  annContent: {
    flex: 1,
  },
  annTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 5,
  },
  annTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
    lineHeight: 20,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.round,
    flexShrink: 0,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  annDesc: {
    fontSize: 12,
    color: Colors.textSubtitle,
    lineHeight: 17,
    marginBottom: 8,
  },
  annFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  annDate: {
    fontSize: 11,
    color: Colors.textSubtitle,
    fontWeight: '500',
  },
});
