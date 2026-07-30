// app/(tabs)/info.tsx
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
import { Colors, Spacing, Radius } from '../../constants/theme';

const ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Jadwal Ujian Akhir Semester Ganjil 2023/2024',
    description:
      'Pelaksanaan UAS Ganjil akan dimulai pada tanggal 4 Desember 2023. Diharapkan seluruh siswa mempersiapkan diri.',
    date: '15 Nov 2023',
    statusColor: '#C62828',
    statusBg: '#FFEBEE',
    icon: 'school-outline',
    category: 'Akademik',
  },
  {
    id: '2',
    title: 'Pemenang Lomba Cerdas Cermat Hari Pahlawan',
    description:
      'Selamat kepada tim dari kelas XI RPL 2 yang telah memenangkan juara pertama pada perlombaan cerdas cermat.',
    date: '12 Nov 2023',
    statusColor: '#D97706',
    statusBg: '#FEF3C7',
    icon: 'trophy-outline',
    category: 'Lomba',
  },
  {
    id: '3',
    title: 'Informasi Kegiatan Study Tour Kelas X',
    description:
      'Study tour kelas X akan dilaksanakan ke Yogyakarta pada bulan Januari. Pendaftaran dapat dilakukan melalui wali kelas.',
    date: '05 Nov 2023',
    statusColor: '#059669',
    statusBg: '#D1FAE5',
    icon: 'bus-outline',
    category: 'Kegiatan',
  },
  {
    id: '4',
    title: 'Perubahan Jadwal Ekstrakurikuler Pramuka',
    description:
      'Sehubungan dengan persiapan Akreditasi Sekolah, jadwal pramuka minggu ini dipindahkan ke hari Jumat.',
    date: '28 Okt 2023',
    statusColor: '#059669',
    statusBg: '#D1FAE5',
    icon: 'time-outline',
    category: 'Kegiatan',
  },
  {
    id: '5',
    title: 'Perubahan Jadwal Sertifikat Turnamen',
    description:
      'Pengambilan sertifikat turnamen Moklet Cup 2024 diundur ke tanggal 25 November 2024 di Aula Utama.',
    date: '15 Nov 2024',
    statusColor: '#C62828',
    statusBg: '#FFEBEE',
    icon: 'alert-circle-outline',
    category: 'Akademik',
  },
  {
    id: '6',
    title: 'Pendaftaran Ditutup Sementara',
    description:
      'Pendaftaran cabang Futsal ditutup sementara karena kuota telah terpenuhi. Informasi lebih lanjut akan diumumkan.',
    date: '17 Nov 2024',
    statusColor: '#D97706',
    statusBg: '#FEF3C7',
    icon: 'close-circle-outline',
    category: 'Lomba',
  },
];

export default function InfoScreen() {
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
        <Text style={styles.headerTitle}>Arsip Pengumuman</Text>
        <Text style={styles.headerSub}>Cari dan temukan pengumuman penting sebelumnya.</Text>
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
            <View style={styles.annHeaderRow}>
              <Text style={styles.annTitle} numberOfLines={2}>
                {ann.title}
              </Text>
              <View style={[styles.categoryBadge, { backgroundColor: ann.statusBg }]}>
                <Text style={[styles.categoryText, { color: ann.statusColor }]}>
                  {ann.category}
                </Text>
              </View>
            </View>

            <Text style={styles.annDesc} numberOfLines={3}>
              {ann.description}
            </Text>

            <View style={styles.annFooter}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textSubtitle} />
              <Text style={styles.annDate}>{ann.date}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSubtitle,
    marginTop: 2,
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
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 46,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMain,
  },
  list: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  annCard: {
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
  annHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  annTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
    lineHeight: 21,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  annDesc: {
    fontSize: 13,
    color: Colors.textSubtitle,
    lineHeight: 19,
    marginBottom: 12,
  },
  annFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  annDate: {
    fontSize: 12,
    color: Colors.textSubtitle,
    fontWeight: '500',
  },
});
