// app/(tabs)/events.tsx
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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '../../constants/theme';

const EVENTS = [
  {
    id: '1',
    title: 'Moklet Cup 2024',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    dateRange: '05 - 09 Agustus 2024',
    organizer: 'OSIS Moklet',
    quotaFull: false,
    isNew: false,
    category: 'Olahraga',
  },
  {
    id: '2',
    title: 'Turnamen Basket Antar Sekolah',
    image: 'https://images.unsplash.com/photo-1546519638405-a7cd81e7c2f7?w=800&q=80',
    dateRange: '15 - 20 Agustus 2024',
    organizer: 'Ekskul Basket',
    quotaFull: true,
    isNew: false,
    category: 'Olahraga',
  },
  {
    id: '3',
    title: 'Lomba Robotik Nasional',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    dateRange: '5 September 2024',
    organizer: 'Tim IT Moklet',
    quotaFull: false,
    isNew: true,
    category: 'Akademik',
  },
  {
    id: '4',
    title: 'Festival Seni Budaya Tahunan',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    dateRange: '12 - 14 Oktober 2024',
    organizer: 'OSIS Moklet',
    quotaFull: false,
    isNew: false,
    category: 'Seni',
  },
];

export default function EventsScreen() {
  const [search, setSearch] = useState('');

  const filtered = EVENTS.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer.toLowerCase().includes(search.toLowerCase())
  );

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
            placeholder="Cari event..."
            placeholderTextColor={Colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: '/event-detail', params: { eventId: event.id } })}
          >
            {/* Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              {event.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>Baru</Text>
                </View>
              )}
              {event.quotaFull && (
                <View style={styles.quotaOverlay}>
                  <Text style={styles.quotaOverlayText}>QUOTA PENUH</Text>
                </View>
              )}
            </View>

            {/* Body */}
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{event.title}</Text>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={13} color={Colors.textSubtitle} />
                    <Text style={styles.dateText}>{event.dateRange}</Text>
                  </View>
                  <View style={styles.orgRow}>
                    <Ionicons name="person-outline" size={13} color={Colors.textSubtitle} />
                    <Text style={styles.orgText}>{event.organizer}</Text>
                  </View>
                </View>
                {event.quotaFull ? (
                  <View style={styles.quotaBadge}>
                    <Text style={styles.quotaBadgeText}>Quota Full</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.registerBtn}
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/event-detail', params: { eventId: event.id } })}
                  >
                    <Text style={styles.registerBtnText}>Daftar Sekarang</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.round,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  quotaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quotaOverlayText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  cardBody: {
    padding: Spacing.base,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    marginBottom: 3,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSubtitle,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  orgText: {
    fontSize: 12,
    color: Colors.textSubtitle,
  },
  quotaBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  quotaBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.round,
  },
  registerBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
