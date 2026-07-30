// app/event-detail.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius } from '../constants/theme';

// Data dummy per event — hanya event '1' punya data lengkap
const EVENTS_DATA: Record<string, {
  title: string;
  dateRange: string;
  tags: string[];
  image: string;
  details: { icon: string; label: string; value: string }[];
  organizer: string;
  organizerRole: string;
  organizerInitials: string;
  organizerPhone: string;
  organizerEmail: string;
}> = {
  '1': {
    title: 'Moklet Cup 2024',
    dateRange: '05 - 09 Agustus 2024',
    tags: ['Sports', 'Internal'],
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&q=80',
    details: [
      { icon: 'people-outline', label: 'Kuota Peserta', value: '256 Tim' },
      { icon: 'trophy-outline', label: 'Jumlah Cabang Lomba', value: '8 Cabang' },
      { icon: 'checkmark-circle-outline', label: 'Tim / Peserta Terdaftar', value: '187 Tim' },
      { icon: 'cash-outline', label: 'Total Hadiah', value: 'Rp 15.000.000' },
      { icon: 'location-outline', label: 'Lokasi Pelaksanaan', value: 'Sport Hall SMKN 4 Malang' },
    ],
    organizer: 'OSIS Moklet',
    organizerRole: 'Panitia Moklet Cup 2024',
    organizerInitials: 'OS',
    organizerPhone: '+62 812 3456 7890',
    organizerEmail: 'osismoklet@example.com',
  },
  '2': {
    title: 'Turnamen Basket Antar Sekolah',
    dateRange: '15 - 20 Agustus 2024',
    tags: ['Sports', 'Eksternal'],
    image: 'https://images.unsplash.com/photo-1546519638405-a7cd81e7c2f7?w=1000&q=80',
    details: [
      { icon: 'people-outline', label: 'Kuota Peserta', value: '32 Tim' },
      { icon: 'trophy-outline', label: 'Jumlah Cabang Lomba', value: '2 Cabang' },
      { icon: 'checkmark-circle-outline', label: 'Tim / Peserta Terdaftar', value: '28 Tim' },
      { icon: 'cash-outline', label: 'Total Hadiah', value: 'Rp 5.000.000' },
      { icon: 'location-outline', label: 'Lokasi Pelaksanaan', value: 'GOR Kediri' },
    ],
    organizer: 'Ekskul Basket',
    organizerRole: 'Panitia Basket 2024',
    organizerInitials: 'EB',
    organizerPhone: '+62 812 9876 5432',
    organizerEmail: 'basket@example.com',
  },
  '3': {
    title: 'Lomba Robotik Nasional',
    dateRange: '5 September 2024',
    tags: ['Akademik', 'Nasional'],
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000&q=80',
    details: [
      { icon: 'people-outline', label: 'Kuota Peserta', value: '50 Tim' },
      { icon: 'trophy-outline', label: 'Jumlah Kategori', value: '3 Kategori' },
      { icon: 'checkmark-circle-outline', label: 'Tim Terdaftar', value: '41 Tim' },
      { icon: 'cash-outline', label: 'Total Hadiah', value: 'Rp 20.000.000' },
      { icon: 'location-outline', label: 'Lokasi', value: 'Balai Kota Malang' },
    ],
    organizer: 'Tim IT Moklet',
    organizerRole: 'Koordinator Lomba Robotik',
    organizerInitials: 'IT',
    organizerPhone: '+62 813 1111 2222',
    organizerEmail: 'robotik@example.com',
  },
  '4': {
    title: 'Festival Seni Budaya Tahunan',
    dateRange: '12 - 14 Oktober 2024',
    tags: ['Seni', 'Internal'],
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1000&q=80',
    details: [
      { icon: 'people-outline', label: 'Kuota Peserta', value: 'Tidak Terbatas' },
      { icon: 'trophy-outline', label: 'Jumlah Cabang', value: '5 Cabang' },
      { icon: 'checkmark-circle-outline', label: 'Peserta Terdaftar', value: '120 Orang' },
      { icon: 'cash-outline', label: 'Total Hadiah', value: 'Rp 3.000.000' },
      { icon: 'location-outline', label: 'Lokasi', value: 'Aula Utama Moklet' },
    ],
    organizer: 'OSIS Moklet',
    organizerRole: 'Panitia Festival Seni 2024',
    organizerInitials: 'OS',
    organizerPhone: '+62 812 3456 7890',
    organizerEmail: 'seni@example.com',
  },
};

// Fallback jika eventId tidak dikenal
const DEFAULT_EVENT = EVENTS_DATA['1'];

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const event = (eventId && EVENTS_DATA[eventId]) ? EVENTS_DATA[eventId] : DEFAULT_EVENT;
  const resolvedEventId = (eventId && EVENTS_DATA[eventId]) ? eventId : '1';

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
        <Text style={styles.headerTitle}>Detail Event</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 1. Banner */}
        <Image source={{ uri: event.image }} style={styles.banner} />

        {/* 2. Judul & Tanggal Event */}
        <View style={styles.titleCard}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={15} color={Colors.textSubtitle} />
            <Text style={styles.dateText}>{event.dateRange}</Text>
          </View>
          <View style={styles.tagsRow}>
            {event.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3. Guidebook */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Guidebook</Text>
          <Text style={styles.guidebookDesc}>
            Silakan pelajari peraturan dan panduan lengkap acara {event.title} sebelum mendaftar.
          </Text>
          <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.85}>
            <Ionicons name="download-outline" size={20} color={Colors.white} />
            <Text style={styles.downloadBtnText}>Unduh Guidebook (PDF)</Text>
          </TouchableOpacity>
          {/* Thumbnail preview */}
          <View style={styles.pdfPreview}>
            <View style={styles.pdfIconBox}>
              <Ionicons name="document-text-outline" size={32} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pdfName}>Guidebook_{event.title.replace(/ /g, '_')}.pdf</Text>
              <Text style={styles.pdfSize}>1.2 MB · PDF Dokumen</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
          </View>
        </View>

        {/* 4. Informasi Event */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Event</Text>
          {event.details.map((d, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.rowDivider} />}
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Ionicons name={d.icon as any} size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{d.label}</Text>
                  <Text style={styles.infoValue}>{d.value}</Text>
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* 5. Penyelenggara */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Penyelenggara</Text>
          <View style={styles.organizerRow}>
            <View style={styles.orgAvatar}>
              <Text style={styles.orgAvatarText}>{event.organizerInitials}</Text>
            </View>
            <View>
              <Text style={styles.orgName}>{event.organizer}</Text>
              <Text style={styles.orgSub}>{event.organizerRole}</Text>
            </View>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={16} color={Colors.textSubtitle} />
            <Text style={styles.contactText}>{event.organizerEmail}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={16} color={Colors.textSubtitle} />
            <Text style={styles.contactText}>{event.organizerPhone}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push({ pathname: '/daftar-lomba', params: { eventId: resolvedEventId } })
          }
        >
          <Text style={styles.ctaBtnText}>Ajukan Pendaftaran</Text>
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
    fontWeight: '700',
    color: Colors.primary,
  },
  banner: {
    width: '100%',
    height: 220,
  },
  titleCard: {
    backgroundColor: Colors.white,
    margin: Spacing.base,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSubtitle,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: Spacing.md,
  },
  // Guidebook styles
  guidebookDesc: {
    fontSize: 13,
    color: Colors.textSubtitle,
    lineHeight: 19,
    marginBottom: Spacing.base,
  },
  downloadBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: Radius.round,
    marginBottom: Spacing.md,
  },
  downloadBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  pdfPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  pdfIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMain,
    marginBottom: 2,
  },
  pdfSize: {
    fontSize: 11,
    color: Colors.textSubtitle,
  },
  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSubtitle,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
  },
  // Organizer
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  orgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgAvatarText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  orgName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
  },
  orgSub: {
    fontSize: 12,
    color: Colors.textSubtitle,
    marginTop: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textSubtitle,
  },
  // Sticky CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.base,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  ctaBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: Radius.round,
    alignItems: 'center',
  },
  ctaBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
