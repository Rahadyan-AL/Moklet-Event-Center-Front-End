// app/(tabs)/home.tsx
// CATATAN: Header menggunakan ikon LONCENG (notifications-outline) — BUKAN logout.
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { userState } from '../../constants/userState';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - Spacing.xl * 2;

const DUMMY_BANNERS = [
  {
    id: '1',
    title: 'Moklet Cup 2024',
    tag: 'MOKLET CUP',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    dateRange: '15 - 20 Agustus 2024',
    location: 'Sport Hall SMKN 4 Malang',
  },
  {
    id: '2',
    title: 'Pekan Raya Akademik',
    tag: 'AKADEMIK',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    dateRange: '25 - 28 Agustus 2024',
    location: 'Aula Utama',
  },
  {
    id: '3',
    title: 'Moklet Hackathon',
    tag: 'HACKATHON',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    dateRange: '02 - 05 Sep 2024',
    location: 'Lab Komputer',
  },
];

const DUMMY_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Perubahan Jadwal Lomba',
    description: 'Jadwal babak semifinal Moklet Cup 2024 diubah menjadi pukul 08.00 WIB.',
    date: '12-11-2024',
    statusColor: '#C62828',
    statusBg: '#FFEBEE',
  },
  {
    id: '2',
    title: 'Pendaftaran Ditutup Sementara',
    description: 'Pendaftaran cabang Futsal ditutup sementara hingga kuota tersedia.',
    date: '17-11-2024',
    statusColor: '#F57C00',
    statusBg: '#FFF3E0',
  },
  {
    id: '3',
    title: 'Jadwal Technical Meeting',
    description: 'Technical meeting akan dilaksanakan pada Kamis, 14 November 2024.',
    date: '08-11-2024',
    statusColor: '#2E7D32',
    statusBg: '#E8F5E9',
  },
  {
    id: '4',
    title: 'Daftar Ulang Peserta Turnamen',
    description: 'Peserta wajib melakukan daftar ulang sebelum tanggal 15 November 2024.',
    date: '10-11-2024',
    statusColor: '#1565C0',
    statusBg: '#E3F2FD',
  },
];

export default function HomeScreen() {
  const username = userState.getNama() || 'Siswa';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <Ionicons name="school" size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.headerGreeting}>Selamat datang,</Text>
              <Text style={styles.headerName}>{username} 👋</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textMain} />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* EVENT BANNER */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Event Terdekat</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/events')}
          >
            <Text style={styles.sectionLink}>Lihat Semua →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={BANNER_WIDTH + Spacing.md}
          contentContainerStyle={styles.bannerContainer}
        >
          {DUMMY_BANNERS.map((banner) => (
            <TouchableOpacity
              key={banner.id}
              style={[styles.bannerCard, { width: BANNER_WIDTH }]}
              activeOpacity={0.93}
              onPress={() => router.push({ pathname: '/event-detail', params: { eventId: banner.id } })}
            >
              <Image source={{ uri: banner.image }} style={styles.bannerImage} />
              {/* Dark overlay */}
              <View style={styles.bannerOverlay} />
              {/* Tag */}
              <View style={styles.bannerTag}>
                <Text style={styles.bannerTagText}>{banner.tag}</Text>
              </View>
              {/* Bottom info */}
              <View style={styles.bannerBottom}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <View style={styles.bannerMeta}>
                  <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.bannerMetaText}>{banner.dateRange}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* PENGUMUMAN TERBARU */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pengumuman Terbaru</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/arsip-pengumuman')}
          >
            <Text style={styles.sectionLink}>Lihat Semua →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.announceList}>
          {DUMMY_ANNOUNCEMENTS.map((ann) => (
            <TouchableOpacity key={ann.id} style={styles.annCard} activeOpacity={0.85}>
              <View style={[styles.annDot, { backgroundColor: ann.statusBg }]}>
                <View style={[styles.annDotInner, { backgroundColor: ann.statusColor }]} />
              </View>
              <View style={styles.annBody}>
                <Text style={styles.annTitle} numberOfLines={1}>
                  {ann.title}
                </Text>
                <Text style={styles.annDesc} numberOfLines={2}>
                  {ann.description}
                </Text>
                <View style={styles.annFooter}>
                  <Ionicons name="calendar-outline" size={11} color={Colors.textSubtitle} />
                  <Text style={styles.annDate}>{ann.date}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#BDBDBD" />
            </TouchableOpacity>
          ))}
        </View>
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
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGreeting: {
    fontSize: 12,
    color: Colors.textSubtitle,
    fontWeight: '400',
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textMain,
  },
  sectionLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Banners
  bannerContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  bannerCard: {
    height: 200,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  bannerTag: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  bannerTagText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  bannerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },

  // Announcements
  announceList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  annCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  annDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  annDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  annBody: {
    flex: 1,
  },
  annTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 3,
  },
  annDesc: {
    fontSize: 12,
    color: Colors.textSubtitle,
    lineHeight: 17,
    marginBottom: 6,
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
