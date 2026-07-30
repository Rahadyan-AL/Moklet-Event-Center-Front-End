// app/(tabs)/home.tsx
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
  Modal,
  Pressable,
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
  const username = userState.getNama() || 'Dimas Saputra';
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP PROFILE CARD HEADER */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBorder}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' }}
              style={styles.avatarImage}
            />
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{username}</Text>
            <Text style={styles.profileSubtitle}>XII RPL 1 • Angkatan 2024</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutIconButton}
            activeOpacity={0.7}
            onPress={() => setShowLogoutModal(true)}
          >
            <Ionicons name="exit-outline" size={24} color="#3D2723" />
          </TouchableOpacity>
        </View>

        {/* EVENT BANNER SECTION */}
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

        {/* PENGUMUMAN TERBARU SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pengumuman Terbaru</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/info')}
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

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowLogoutModal(false)}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
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
    backgroundColor: '#F5F7FA',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // Profile Card Header
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E53935',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 2,
  },
  profileSubtitle: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '400',
  },
  logoutIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
