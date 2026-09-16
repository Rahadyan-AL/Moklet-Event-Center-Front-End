// app/(tabs)/events.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Radius } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import { cacheTime, queryKeys } from '../../constants/query';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/date';
import { getFileUrl } from '../../utils/url';
import {
  getEvents,
  getManagedEventsForStudent,
  EventItem,
} from '../../services/panitia/events.service';

export default function EventsScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: queryKeys.events(user?.student?.id, user?.id),
    staleTime: cacheTime.warm,
    queryFn: async () => {
      const [allRes, managedRes] = await Promise.allSettled([
        getEvents(1, 100),
        getManagedEventsForStudent(user?.student?.id, user?.id),
      ]);

      const events: EventItem[] = allRes.status === 'fulfilled' ? allRes.value : [];
      const managedEventIds = new Set(
        managedRes.status === 'fulfilled' ? managedRes.value.map((e) => e.id) : [],
      );
      return { events, managedEventIds };
    },
  });

  const events = data?.events || [];
  const managedEventIds = data?.managedEventIds || new Set<string>();

  const filtered = events.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
  );

  const renderEvent = ({ item }: { item: EventItem }) => {
    const isManaged = managedEventIds.has(item.id) || user?.role === 'PANITIA';
    const isOngoing = item.status === 'ONGOING';
    const bannerUri = getFileUrl(item.bannerUrl);

    return (
      <View style={styles.card}>
        <View style={styles.bannerWrapper}>
          {bannerUri ? (
            <Image
              source={{ uri: bannerUri }}
              style={styles.banner}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Ionicons name="image-outline" size={32} color={Colors.textPlaceholder} />
              <Text style={styles.bannerPlaceholderText}>Banner tidak tersedia</Text>
            </View>
          )}
          <StatusBadge
            status={item.status}
            style={styles.statusBadge}
          />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.cardMeta}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSubtitle} />
            <Text style={styles.cardDate}>{formatDate(item.eventDate)}</Text>
          </View>

          <View style={styles.cardActionRow}>
            {isManaged ? (
              <TouchableOpacity
                style={styles.kelolaBtn}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/(panitia)/events/[id]', params: { id: item.id } } as any)}
              >
                <Ionicons name="settings-outline" size={14} color={Colors.white} />
                <Text style={styles.kelolaBtnText}>Kelola Event</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.detailBtn}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/event-detail', params: { eventId: item.id } })}
              >
                <Text style={styles.detailBtnText}>Lihat Detail</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Semua Event</Text>
        <Text style={styles.headerSub}>Temukan dan ikuti kegiatan seru di sekolah</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textPlaceholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari event atau kompetisi..."
            placeholderTextColor={Colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textPlaceholder} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isLoading && !data ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat daftar event...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.base }} />}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={(
            <View style={styles.centerBox}>
              <Ionicons name="calendar-outline" size={48} color={Colors.textPlaceholder} />
              <Text style={styles.emptyTitle}>{search ? 'Event tidak ditemukan' : 'Belum ada event'}</Text>
              <Text style={styles.emptySub}>
                {search ? 'Coba gunakan kata kunci pencarian lain.' : 'Event yang akan datang akan muncul di sini.'}
              </Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textMain,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSubtitle,
    marginTop: 2,
  },
  searchRow: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMain,
  },
  list: {
    padding: Spacing.base,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  bannerWrapper: {
    width: '100%',
    height: 160,
    position: 'relative',
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
    gap: 4,
  },
  bannerPlaceholderText: {
    fontSize: 12,
    color: Colors.textSubtitle,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: Spacing.base,
    gap: 6,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textMain,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
    color: Colors.textSubtitle,
  },
  cardActionRow: {
    alignItems: 'flex-end',
    marginTop: 2,
  },
  kelolaBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.lg,
  },
  kelolaBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  detailBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  centerBox: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSubtitle,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMain,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSubtitle,
    textAlign: 'center',
  },
});
