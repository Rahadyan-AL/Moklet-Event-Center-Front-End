// app/(tabs)/info.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { cacheTime, queryKeys } from '../../constants/query';
import { formatDate } from '../../utils/date';
import { getAnnouncements, AnnouncementItem } from '../../services/panitia/announcements.service';

export default function InfoScreen() {
  const [search, setSearch] = useState('');

  const { data, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: queryKeys.announcements(undefined, 1),
    staleTime: cacheTime.warm,
    queryFn: () => getAnnouncements(1, 50),
  });

  const announcements = data?.data || [];

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Arsip Pengumuman</Text>
        <Text style={styles.headerSub}>Informasi penting dan update seputar kegiatan sekolah</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textPlaceholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari pengumuman atau info..."
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
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.stateText}>Memuat pengumuman...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={44} color={Colors.error} />
          <Text style={styles.stateText}>Gagal memuat daftar pengumuman.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item: ann }) => (
            <View style={styles.annCard}>
              <View style={styles.annHeaderRow}>
                <View style={styles.iconTag}>
                  <Ionicons name="megaphone" size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.annTitle}>{ann.title}</Text>
                  {ann.eventName && (
                    <Text style={styles.annEventTag}>Event: {ann.eventName}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.annDesc}>{ann.content}</Text>
              <View style={styles.annFooter}>
                <View style={styles.footerItem}>
                  <Ionicons name="person-outline" size={13} color={Colors.textSubtitle} />
                  <Text style={styles.annAuthor}>{ann.authorName}</Text>
                </View>
                <View style={styles.footerItem}>
                  <Ionicons name="calendar-outline" size={13} color={Colors.textSubtitle} />
                  <Text style={styles.annDate}>{formatDate(ann.createdAt, { dayStyle: '2-digit' })}</Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={(
            <View style={styles.centerState}>
              <Ionicons name="megaphone-outline" size={44} color={Colors.textPlaceholder} />
              <Text style={styles.emptyTitle}>
                {search ? 'Pengumuman tidak ditemukan' : 'Belum Ada Pengumuman'}
              </Text>
              <Text style={styles.stateText}>
                {search ? 'Coba cari dengan kata kunci lain.' : 'Pengumuman resmi dari panitia atau sekolah akan muncul di sini.'}
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
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
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
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textMain,
    marginTop: 6,
  },
  stateText: {
    fontSize: 13,
    color: Colors.textSubtitle,
    textAlign: 'center',
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  retryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  list: {
    padding: Spacing.base,
    paddingBottom: 32,
  },
  annCard: {
    backgroundColor: Colors.white,
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
  annHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  iconTag: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  annTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textMain,
    lineHeight: 20,
  },
  annEventTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  annDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  annFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  annAuthor: {
    fontSize: 12,
    color: Colors.textSubtitle,
    fontWeight: '600',
  },
  annDate: {
    fontSize: 12,
    color: Colors.textSubtitle,
    fontWeight: '500',
  },
});
