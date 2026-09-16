// app/event-detail.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Radius } from '../constants/theme';
import { cacheTime, queryKeys } from '../constants/query';
import { getEventById, getCategoriesByEvent, EventItem, CategoryItem } from '../services/panitia/events.service';
import { formatDate } from '../utils/date';
import { getFileUrl, downloadOrOpenGuidebook } from '../utils/url';
import { getCategoryIcon } from '../utils/icons';
import StatusBadge from '../components/StatusBadge';

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const currentEventId = eventId || '';

  const {
    data,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<{ event: EventItem | null; categories: CategoryItem[] }>({
    queryKey: queryKeys.eventDetail(currentEventId),
    enabled: !!currentEventId,
    staleTime: cacheTime.cold,
    queryFn: async () => {
      const [ev, cats] = await Promise.all([
        getEventById(currentEventId).catch(() => null),
        getCategoriesByEvent(currentEventId).catch(() => []),
      ]);
      return { event: ev, categories: cats };
    },
  });

  const event = data?.event || null;
  const categories = data?.categories || [];

  const errorMsg = !currentEventId
    ? 'ID Event tidak valid atau tidak ditemukan.'
    : error
      ? 'Gagal memuat detail event dari server.'
      : null;

  const handleDownloadGuidebook = () => {
    if (!event) return;
    downloadOrOpenGuidebook(event.guidebookUrl, event.name);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color={Colors.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Event</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat informasi event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg || !event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color={Colors.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Event</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={54} color={Colors.error} />
          <Text style={styles.errorTextTitle}>Event Tidak Ditemukan</Text>
          <Text style={styles.errorTextSub}>{errorMsg || 'Event yang Anda cari tidak tersedia.'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.85}>
            <Ionicons name="refresh" size={16} color={Colors.white} />
            <Text style={styles.retryBtnText}>Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isClosed = event.status === 'CLOSED';
  const bannerUri = getFileUrl(event.bannerUrl);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Detail Event</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[Colors.primary]}
          />
        }
      >
        {/* 1. Event Hero Banner */}
        <View style={styles.bannerContainer}>
          {bannerUri ? (
            <Image
              source={{ uri: bannerUri }}
              style={styles.banner}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Ionicons name="image-outline" size={48} color={Colors.textPlaceholder} />
              <Text style={styles.bannerPlaceholderText}>Banner Acara Moklet</Text>
            </View>
          )}
          <View style={styles.bannerStatusOverlay}>
            <StatusBadge
              status={event.status}
              label={isClosed ? 'Pendaftaran Ditutup' : 'Aktif'}
              style={styles.statusBadge}
            />
          </View>
        </View>

        {/* 2. Judul & Tanggal Pelaksanaan */}
        <View style={styles.mainInfoCard}>
          <Text style={styles.eventTitle}>{event.name}</Text>
          <View style={styles.metaInfoRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{formatDate(event.eventDate, { monthStyle: 'long' })}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="trophy-outline" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{categories.length} Cabang Lomba</Text>
            </View>
          </View>
        </View>

        {/* 3. Deskripsi Acara */}
        {event.description ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Tentang Acara</Text>
            </View>
            <Text style={styles.descText}>{event.description}</Text>
          </View>
        ) : null}

        {/* 4. Dokumen Guidebook Resmi */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="book-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Guidebook & Panduan Resmi</Text>
          </View>
          <Text style={styles.guidebookDesc}>
            Unduh petunjuk teknis, syarat & ketentuan, jadwal babak, serta kriteria penilaian lomba.
          </Text>
          
          <TouchableOpacity
            style={[
              styles.downloadBtn,
              !event.guidebookUrl && styles.downloadBtnDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleDownloadGuidebook}
          >
            <View style={styles.downloadIconBadge}>
              <Ionicons
                name={event.guidebookUrl ? 'document-text' : 'lock-closed'}
                size={18}
                color={event.guidebookUrl ? Colors.white : Colors.textPlaceholder}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.downloadBtnTitle}>
                {event.guidebookUrl ? 'Unduh Dokumen Guidebook (PDF)' : 'Guidebook Belum Diunggah'}
              </Text>
              <Text style={styles.downloadBtnSub}>
                {event.guidebookUrl
                  ? 'Klik untuk membuka & menyimpan file PDF panduan'
                  : 'Panitia belum merilis dokumen panduan untuk event ini'}
              </Text>
            </View>
            {event.guidebookUrl && (
              <Ionicons name="download-outline" size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* 5. Daftar Cabang Lomba */}
        {categories.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="grid-outline" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Cabang Lomba ({categories.length})</Text>
            </View>

            {categories.map((cat, idx) => (
              <View key={cat.id || idx} style={styles.categoryCard}>
                <View style={styles.categoryIconBox}>
                  <Ionicons name={getCategoryIcon(cat.name)} size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <View style={styles.categoryBadgeRow}>
                    <View style={styles.categoryBadge}>
                      <Ionicons name="people-outline" size={12} color={Colors.textSubtitle} />
                      <Text style={styles.categoryBadgeText}>
                        {cat.maxMember === 1
                          ? 'Individu (1 Orang)'
                          : `${cat.minMember} - ${cat.maxMember} Anggota`}
                      </Text>
                    </View>
                    {cat.teamCompositionMode && (
                      <View style={styles.categoryBadgeMode}>
                        <Text style={styles.categoryBadgeModeText}>
                          {cat.teamCompositionMode === 'PER_CLASS'
                            ? 'Per Kelas'
                            : cat.teamCompositionMode === 'PER_ANGKATAN'
                              ? 'Per Angkatan'
                              : 'Bebas / Lintas'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[styles.ctaBtn, isClosed && styles.ctaBtnDisabled]}
          activeOpacity={0.88}
          disabled={isClosed}
          onPress={() =>
            router.push({ pathname: '/daftar-lomba', params: { eventId: event.id } })
          }
        >
          <Ionicons
            name={isClosed ? 'close-circle-outline' : 'paper-plane-outline'}
            size={18}
            color={Colors.white}
          />
          <Text style={styles.ctaBtnText}>
            {isClosed ? 'Pendaftaran Ditutup' : 'Ajukan Pendaftaran Lomba'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textMain,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSubtitle,
  },
  errorTextTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textMain,
    marginTop: 8,
  },
  errorTextSub: {
    fontSize: 14,
    color: Colors.textSubtitle,
    textAlign: 'center',
    maxWidth: 280,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  retryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#E2E8F0',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    gap: 6,
  },
  bannerPlaceholderText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSubtitle,
  },
  bannerStatusOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.round,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mainInfoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    marginTop: -20,
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
  eventTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textMain,
    lineHeight: 26,
    marginBottom: 10,
  },
  metaInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textMain,
  },
  descText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  guidebookDesc: {
    fontSize: 13,
    color: Colors.textSubtitle,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  downloadBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    borderRadius: Radius.lg,
  },
  downloadBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  downloadIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  downloadBtnSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 4,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSubtitle,
  },
  categoryBadgeMode: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  categoryBadgeModeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.round,
  },
  ctaBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  ctaBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
