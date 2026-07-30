// app/(tabs)/events.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '../../constants/theme';
import api from '../../services/api';

export interface EventItem {
  id: string;
  name: string;
  description?: string;
  eventDate: string;
  status?: string;
  bannerUrl?: string;
}

export default function EventsScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const res: any = await api.get('/events');
      const list = Array.isArray(res) ? res : res?.data || [];
      setEvents(list);
    } catch (err) {
      console.warn('Error fetching events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const filtered = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Semua Event</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textPlaceholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama event..."
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loaderText}>Memuat daftar event...</Text>
          </View>
        ) : filtered.length > 0 ? (
          filtered.map((event) => {
            const isClosed = event.status === 'CLOSED';
            return (
              <TouchableOpacity
                key={event.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/event-detail', params: { eventId: event.id } })}
              >
                {/* Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{
                      uri:
                        event.bannerUrl ||
                        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
                    }}
                    style={styles.eventImage}
                  />
                  {event.status ? (
                    <View
                      style={[
                        styles.newBadge,
                        { backgroundColor: isClosed ? '#757575' : Colors.primary },
                      ]}
                    >
                      <Text style={styles.newBadgeText}>{event.status}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Body */}
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{event.name}</Text>
                      <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={13} color={Colors.textSubtitle} />
                        <Text style={styles.dateText}>{formatDate(event.eventDate)}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.registerBtn, isClosed && styles.closedBtn]}
                      activeOpacity={0.8}
                      onPress={() => router.push({ pathname: '/event-detail', params: { eventId: event.id } })}
                    >
                      <Text style={styles.registerBtnText}>{isClosed ? 'Detail' : 'Daftar'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={48} color={Colors.textSubtitle} />
            <Text style={styles.emptyTitle}>Tidak ada event ditemukan</Text>
            <Text style={styles.emptySubtitle}>
              {search ? 'Coba cari dengan kata kunci lain.' : 'Belum ada event yang dipublikasikan.'}
            </Text>
          </View>
        )}
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
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
  },
  searchRow: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
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
    padding: Spacing.xl,
    gap: Spacing.base,
  },
  loaderContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: Colors.textSubtitle,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMain,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSubtitle,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: Spacing.base,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSubtitle,
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.round,
  },
  closedBtn: {
    backgroundColor: '#757575',
  },
  registerBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
