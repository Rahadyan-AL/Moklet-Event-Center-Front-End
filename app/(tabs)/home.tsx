// app/(tabs)/home.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { cacheTime, queryKeys } from '../../constants/query';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatDate } from '../../utils/date';
import {
  getManagedEventsForStudent,
  getEvents,
  EventItem,
} from '../../services/panitia/events.service';
import {
  getAnnouncements,
  AnnouncementItem,
} from '../../services/panitia/announcements.service';
import { getFileUrl } from '../../utils/url';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - Spacing.xl * 2;

// ─── Avatar stack panitia (home komite) ──────────────────────────────────────
const STACK_COLORS = ['#EF5350', '#AB47BC', '#5C6BC0', '#26A69A', '#FFA726', '#8D6E63', '#42A5F5'];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return STACK_COLORS[Math.abs(hash) % STACK_COLORS.length];
}

function initialsOf(name: string): string {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || 'P').substring(0, 2).toUpperCase();
}

const MAX_STACK = 4;

function CommitteeAvatarStack({
  members,
}: {
  members: { studentId: string; name: string; photoUrl: string | null }[];
}) {
  const total = members.length;
  if (total === 0) {
    return (
      <View style={avatarStyles.stack}>
        <View style={[avatarStyles.bubble, avatarStyles.soloFallback]}>
          <Ionicons name="people-outline" size={14} color="#94A3B8" />
        </View>
        <Text style={avatarStyles.fallbackText}>Belum ada panitia</Text>
      </View>
    );
  }

  const shown = members.slice(0, MAX_STACK);
  const extra = total - shown.length;

  return (
    <View style={avatarStyles.stack}>
      {shown.map((m, i) => (
        <View
          key={m.studentId}
          style={[avatarStyles.bubble, avatarStyles.bordered, { zIndex: MAX_STACK - i, marginLeft: i === 0 ? 0 : -10 }]}
        >
          {m.photoUrl ? (
            <Image
              source={{ uri: getFileUrl(m.photoUrl) }}
              style={avatarStyles.photo}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[avatarStyles.photo, { backgroundColor: avatarColor(m.name) }]}>
              <Text style={avatarStyles.initials}>{initialsOf(m.name)}</Text>
            </View>
          )}
        </View>
      ))}
      {extra > 0 && (
        <View style={[avatarStyles.bubble, avatarStyles.bordered, avatarStyles.moreBubble, { marginLeft: -10 }]}>
          <Text style={avatarStyles.moreText}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

function formatRelativeTime(isoStr: string): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `Hari ini, ${hours}:${mins}`;
    } else if (diffDays === 1) {
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `Kemarin, ${hours}:${mins}`;
    } else {
      return `${diffDays} Hari lalu`;
    }
  } catch {
    return isoStr;
  }
}

function getAnnouncementIcon(index: number): { name: any; bg: string; color: string } {
  const icons = [
    { name: 'megaphone', bg: '#FEE2E2', color: Colors.primary },
    { name: 'time', bg: '#FEF3C7', color: '#D97706' },
    { name: 'people', bg: '#D1FAE5', color: '#059669' },
    { name: 'information-circle', bg: '#E0E7FF', color: '#4F46E5' },
  ];
  return icons[index % icons.length];
}

export default function HomeScreen() {
  const { user } = useAuth();
  const studentName = user?.student?.name || user?.email?.split('@')[0] || 'Siswa';
  const classLabel = user?.student?.class
    ? `${user.student.class.grade} ${user.student.class.name}`
    : user?.role || 'Siswa';

  const {
    data: homeData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.home(user?.student?.id, user?.id),
    staleTime: cacheTime.warm,
    queryFn: async () => {
      const [managedRes, eventsRes, annRes] = await Promise.allSettled([
        getManagedEventsForStudent(user?.student?.id, user?.id),
        getEvents(1, 10),
        getAnnouncements(1, 4),
      ]);

      const managed: EventItem[] =
        managedRes.status === 'fulfilled' ? managedRes.value : [];
      const general: EventItem[] =
        eventsRes.status === 'fulfilled' ? eventsRes.value : [];
      const annList: AnnouncementItem[] =
        annRes.status === 'fulfilled' ? annRes.value.data : [];

      return {
        managedEvents: managed,
        generalEvents: general,
        announcements: annList,
      };
    },
  });

  const managedEvents = homeData?.managedEvents || [];
  const generalEvents = homeData?.generalEvents || [];
  const announcements = homeData?.announcements || [];

  const isCommittee = managedEvents.length > 0;

  const onRefresh = () => {
    refetch();
  };

  const managedEventNames = managedEvents.map((e) => e.name).join(', ');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── CASE 1: SISWA IS A COMMITTEE MEMBER (DASHBOARD KOMITE EVENT - Screenshot 4) ─── */}
      {isCommittee ? (
        <>
          {/* Header — komponen sama dengan admin/dashboard & panitia/dashboard */}
          <PageHeader />

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
              />
            }
          >
            {isLoading && !homeData ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : (
              <>
                {/* Welcome Card */}
                <View style={styles.welcomeCard}>
                  <Text style={styles.greeting}>Halo, {studentName}</Text>
                  <Text style={styles.subtitle}>
                    Selamat datang dan selamat bekerja. Kamu jadi anggota komite event [
                    {managedEventNames}].
                  </Text>
                </View>

                {/* Section: Event yang Dikelola */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Event yang Dikelola</Text>
                </View>

                {managedEvents.map((ev) => {
                  const isOngoing = ev.status === 'ONGOING';
                  return (
                    <View key={ev.id} style={styles.eventCard}>
                      <View style={styles.bannerWrapper}>
                        {ev.bannerUrl ? (
                          <Image
                            source={{ uri: getFileUrl(ev.bannerUrl) }}
                            style={styles.eventBanner}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            transition={150}
                          />
                        ) : (
                          <View style={styles.bannerPlaceholder}>
                            <Ionicons name="image-outline" size={32} color="#94A3B8" />
                            <Text style={styles.bannerPlaceholderText}>Banner tidak tersedia</Text>
                          </View>
                        )}
                        <StatusBadge
                          status={ev.status}
                          style={styles.statusBadgeOverlay}
                        />
                      </View>

                      <View style={styles.eventBody}>
                        <Text style={styles.eventName}>{ev.name}</Text>
                        <View style={styles.dateRow}>
                          <Ionicons name="calendar-outline" size={13} color="#757575" />
                          <Text style={styles.dateText}>{formatDate(ev.eventDate)}</Text>
                        </View>

                        <View style={styles.eventBottomRow}>
                          <CommitteeAvatarStack members={ev.committeeAvatars} />
                          <TouchableOpacity
                            style={styles.kelolaBtn}
                            activeOpacity={0.85}
                            onPress={() =>
                              router.push({
                                pathname: '/(komite)/manage',
                                params: { eventId: ev.id },
                              } as any)
                            }
                          >
                            <Text style={styles.kelolaBtnText}>Kelola</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}

                {/* Section: Pengumuman Terbaru */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Pengumuman Terbaru</Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/info')}>
                    <Text style={styles.seeAllText}>Lihat Semua {'->'}</Text>
                  </TouchableOpacity>
                </View>

                {announcements.length > 0 ? (
                  announcements.map((ann, index) => {
                    const iconInfo = getAnnouncementIcon(index);
                    return (
                      <View key={ann.id} style={styles.announcementCard}>
                        <View style={[styles.annIconBox, { backgroundColor: iconInfo.bg }]}>
                          <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} />
                        </View>
                        <View style={styles.annContent}>
                          <Text style={styles.annTitle} numberOfLines={1}>
                            {ann.title}
                          </Text>
                          <Text style={styles.annBody} numberOfLines={2}>
                            {ann.content}
                          </Text>
                          <Text style={styles.annTime}>{formatRelativeTime(ann.createdAt)}</Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyBoxSmall}>
                    <Text style={styles.emptySubtitle}>Belum ada pengumuman terbaru.</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </>
      ) : (
        /* ─── CASE 2: REGULAR SISWA (NOT A COMMITTEE MEMBER) ─── */
        <>
          {/* Header — komponen sama dengan admin/dashboard & panitia/dashboard */}
          <PageHeader />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
        >

          {/* Event Banner Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Event Terdekat</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/events')}>
              <Text style={styles.sectionLink}>Lihat Semua {'->'}</Text>
            </TouchableOpacity>
          </View>

          {isLoading && !homeData ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loaderText}>Memuat event...</Text>
            </View>
          ) : generalEvents.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={BANNER_WIDTH + Spacing.md}
              contentContainerStyle={styles.bannerContainer}
            >
              {generalEvents.map((banner) => (
                <TouchableOpacity
                  key={banner.id}
                  style={[styles.bannerCard, { width: BANNER_WIDTH }]}
                  activeOpacity={0.93}
                  onPress={() =>
                    router.push({ pathname: '/event-detail', params: { eventId: banner.id } })
                  }
                >
                  {banner.bannerUrl ? (
                    <Image
                      source={{ uri: getFileUrl(banner.bannerUrl) }}
                      style={styles.bannerImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={150}
                    />
                  ) : (
                    <View style={styles.bannerPlaceholder}>
                      <Ionicons name="image-outline" size={32} color="#94A3B8" />
                      <Text style={styles.bannerPlaceholderText}>Banner tidak tersedia</Text>
                    </View>
                  )}
                  <View style={styles.bannerOverlay} />
                  <StatusBadge status={banner.status} style={styles.bannerTag} />
                  <View style={styles.bannerBottom}>
                    <Text style={styles.bannerTitle} numberOfLines={1}>
                      {banner.name}
                    </Text>
                    <View style={styles.bannerMeta}>
                      <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.85)" />
                      <Text style={styles.bannerMetaText}>{formatDate(banner.eventDate)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada event tersedia saat ini.</Text>
            </View>
          )}

          {/* Pengumuman Terbaru Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pengumuman Terbaru</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/info')}>
              <Text style={styles.sectionLink}>Lihat Semua {'->'}</Text>
            </TouchableOpacity>
          </View>

          {announcements.length > 0 ? (
            announcements.map((ann, idx) => (
              <View key={ann.id || idx} style={styles.newsCard}>
                <View style={styles.newsIconBox}>
                  <Ionicons name="megaphone" size={18} color={Colors.primary} />
                </View>
                <View style={styles.newsContent}>
                  <Text style={styles.newsTitle} numberOfLines={1}>
                    {ann.title}
                  </Text>
                  <Text style={styles.newsBody} numberOfLines={2}>
                    {ann.content}
                  </Text>
                  <Text style={styles.newsTime}>{formatRelativeTime(ann.createdAt)}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada pengumuman terbaru.</Text>
            </View>
          )}
        </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1E1E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1E1E',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerWrapper: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  eventBanner: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  bannerPlaceholderText: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748B',
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusOngoing: {
    backgroundColor: 'rgba(220, 252, 231, 0.95)',
  },
  statusClosed: {
    backgroundColor: 'rgba(243, 244, 246, 0.95)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  eventBody: {
    padding: Spacing.base,
    gap: 4,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1E1E',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
  },
  eventBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  pendaftarLabel: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '500',
  },
  pendaftarVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  kelolaBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: Radius.lg,
  },
  kelolaBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  announcementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  annIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  annContent: {
    flex: 1,
    gap: 3,
  },
  annTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  annBody: {
    fontSize: 12,
    color: '#757575',
    lineHeight: 18,
  },
  annTime: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },
  loaderBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyBoxSmall: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
  },

  // Regular Siswa Styles — header sudah di atas, styles lama profileCard dihapus
  scrollContainer: { flex: 1 },
  scrollContent: { padding: Spacing.base, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionLink: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  bannerContainer: { gap: Spacing.md, paddingVertical: 4 },
  bannerCard: {
    height: 180,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bannerTag: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  bannerTagText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  bannerBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    gap: 4,
  },
  bannerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  bannerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bannerMetaText: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  loaderContainer: { paddingVertical: 30, alignItems: 'center', gap: 8 },
  loaderText: { fontSize: 12, color: '#757575' },
  emptyContainer: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#9E9E9E' },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    alignItems: 'center',
  },
  newsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsContent: { flex: 1, gap: 2 },
  newsTitle: { fontSize: 14, fontWeight: '700', color: '#1E1E1E' },
  newsBody: { fontSize: 12, color: '#757575', lineHeight: 17 },
  newsTime: { fontSize: 10, color: '#9E9E9E', marginTop: 2 },
});

const avatarStyles = StyleSheet.create({
  stack: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  soloFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  fallbackText: { fontSize: 11, color: '#94A3B8', marginLeft: 6 },
  photo: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 11, fontWeight: '800', color: '#fff' },
  moreBubble: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: { fontSize: 10, fontWeight: '800', color: '#475569' },
});
