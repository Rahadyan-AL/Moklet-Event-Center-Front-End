import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Radius } from "../../../constants/theme";
import { cacheTime, queryKeys } from '../../../constants/query';
import { useAuth } from "../../../context/AuthContext";
import { getEvents, EventItem } from "../../../services/panitia/events.service";
import { formatDate } from "../../../utils/date";
import { getFileUrl } from "../../../utils/url";
import StatusBadge from "../../../components/StatusBadge";

export default function EventsListScreen() {
  const [search, setSearch] = useState("");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  // Warm cache: daftar event yang dibuat/dikelola panitia yang sedang login
  const { data: events = [], isLoading, isRefetching, error, refetch } = useQuery<EventItem[]>({
    queryKey: [...queryKeys.managedEvents, userId || 'guest'],
    staleTime: cacheTime.warm,
    enabled: !!userId,
    queryFn: () =>
      getEvents(
        1,
        50,
        undefined,
        userId ? { created_by: userId, creatorId: userId, owner_id: userId } : undefined
      ),
  });

  useFocusEffect(
    useCallback(() => {
      // Membersihkan pencarian saat berpindah halaman (unfocus / blur)
      return () => {
        setSearch("");
      };
    }, [])
  );

  const loadError = error ? 'Gagal memuat event. Tarik untuk mencoba ulang.' : '';

  // Filter hanya menampilkan event yang dibuat / dimiliki oleh panitia yang sedang login
  const myEvents = useMemo(() => {
    if (!userId) return [];
    return events.filter((ev) => {
      const creator =
        ev.creatorId ||
        ev.created_by ||
        ev.owner_id ||
        (ev as any).createdById ||
        (ev as any).createdBy?.id ||
        (ev as any).creator?.id;
      return creator === userId;
    });
  }, [events, userId]);

  const filteredEvents = useMemo(() => {
    return myEvents.filter((ev) =>
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      (ev.description && ev.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [myEvents, search]);

  const isPageLoading = authLoading || (isLoading && !!userId);

  const renderItem = ({ item }: { item: EventItem }) => {
    const isOngoing = item.status === "ONGOING";
    return (
      <View style={styles.card}>
        {/* Banner with Badge */}
        <View style={styles.bannerWrapper}>
          {item.bannerUrl ? (
            <Image
              source={{ uri: getFileUrl(item.bannerUrl) }}
              style={styles.banner}
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
            status={item.status}
            style={styles.statusBadgeOverlay}
          />
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.cardMeta}>
            <Ionicons name="calendar-outline" size={13} color="#757575" />
            <Text style={styles.cardDate}>{formatDate(item.eventDate)}</Text>
          </View>

          <View style={styles.cardActionRow}>
            <TouchableOpacity
              style={styles.kelolaBtn}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/(panitia)/events/[id]",
                  params: { id: item.id },
                } as any)
              }
            >
              <Text style={styles.kelolaBtnText}>Kelola</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Semua Event</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/(panitia)/events/create" as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Buat Event</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#9E9E9E" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari event..."
            placeholderTextColor="#9E9E9E"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#9E9E9E" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isPageLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#BDBDBD" />
          <Text style={styles.errorTitle}>Gagal Memuat</Text>
          <Text style={styles.errorSub}>{loadError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="calendar-outline" size={52} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>
                {!isAuthenticated || !userId
                  ? "Belum Masuk"
                  : search
                  ? "Event tidak ditemukan"
                  : "Belum ada event"}
              </Text>
              <Text style={styles.emptySub}>
                {!isAuthenticated || !userId
                  ? "Silakan login terlebih dahulu untuk melihat event yang Anda kelola."
                  : search
                  ? "Coba kata kunci pencarian lain."
                  : 'Ketuk tombol "+" di atas untuk membuat event baru.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    minHeight: 62,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1E1E",
    flex: 1,
    textAlign: "left",
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary,
    borderRadius: Radius.xl, paddingHorizontal: 14, paddingVertical: 8, gap: 4,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  searchWrapper: {
    backgroundColor: "#fff",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E1E1E",
  },
  list: {
    padding: Spacing.base,
    paddingBottom: 32,
    gap: Spacing.base,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  bannerWrapper: {
    width: "100%",
    height: 160,
    position: "relative",
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  bannerPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
  },
  bannerPlaceholderText: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
  },
  statusBadgeOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  cardBody: {
    padding: Spacing.base,
    gap: 6,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E1E1E",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
    color: "#757575",
  },
  cardActionRow: {
    alignItems: "flex-end",
    marginTop: 2,
  },
  kelolaBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: Radius.lg,
  },
  kelolaBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    gap: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#424242",
  },
  errorSub: {
    fontSize: 13,
    color: "#9E9E9E",
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#424242",
  },
  emptySub: {
    fontSize: 13,
    color: "#9E9E9E",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
