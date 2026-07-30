// app/daftar-lomba.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius } from '../constants/theme';

const MOKLET_CUP_BRANCHES = [
  { id: '1', name: 'Basket (Putra)', type: 'Kelompok', minMax: 'Min. 4 anggota, Maks. 5 anggota', icon: 'basketball-outline' },
  { id: '2', name: 'Futsal (Campuran)', type: 'Kelompok', minMax: 'Min. 5 anggota, Maks. 7 anggota', icon: 'football-outline' },
  { id: '3', name: 'E-Sport Mobile Legends', type: 'Kelompok', minMax: 'Min. 5 anggota, Maks. 6 anggota', icon: 'game-controller-outline' },
  { id: '4', name: 'Tarik Tambang', type: 'Kelompok', minMax: 'Min. 6 anggota, Maks. 8 anggota', icon: 'people-outline' },
  { id: '5', name: 'Voli Campuran', type: 'Kelompok', minMax: 'Min. 6 anggota, Maks. 8 anggota', icon: 'fitness-outline' },
];

const EVENT_NAMES: Record<string, string> = {
  '1': 'Moklet Cup 2024',
  '2': 'Turnamen Basket Antar Sekolah',
  '3': 'Lomba Robotik Nasional',
  '4': 'Festival Seni Budaya Tahunan',
};

type Branch = (typeof MOKLET_CUP_BRANCHES)[0];

export default function DaftarLombaScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const currentEventId = eventId || '1';
  const eventName = EVENT_NAMES[currentEventId] || 'Moklet Cup 2024';

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showEnterCodeModal, setShowEnterCodeModal] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const branches = currentEventId === '1' ? MOKLET_CUP_BRANCHES : [];

  const handleBranchClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowChoiceModal(true);
  };

  const handlePressEnterCode = () => {
    setShowChoiceModal(false);
    setTimeout(() => {
      setShowEnterCodeModal(true);
    }, 200);
  };

  const handlePressCreateRoom = () => {
    setShowChoiceModal(false);
    router.push({ pathname: '/room-tim', params: { mode: 'create' } });
  };

  const handleGabungRoom = () => {
    setShowEnterCodeModal(false);
    router.push({ pathname: '/room-tim', params: { mode: 'join' } });
  };

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
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Daftar Lomba</Text>
          <Text style={styles.headerSub}>{eventName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {branches.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {branches.map((branch, index) => (
            <View key={branch.id}>
              <TouchableOpacity
                style={styles.branchItem}
                activeOpacity={0.7}
                onPress={() => handleBranchClick(branch)}
              >
                <View style={styles.branchLeft}>
                  <View style={styles.branchIcon}>
                    <Ionicons name={branch.icon as any} size={20} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.branchName}>{branch.name}</Text>
                    <View style={styles.typeRow}>
                      <Ionicons name="people-outline" size={12} color={Colors.textSubtitle} />
                      <Text style={styles.branchType}>{branch.type}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.daftarBtn}
                  onPress={() => handleBranchClick(branch)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.daftarBtnText}>Daftar</Text>
                </TouchableOpacity>
              </TouchableOpacity>
              {index < branches.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="trophy-outline" size={48} color={Colors.textPlaceholder} />
          </View>
          <Text style={styles.emptyStateTitle}>Belum Ada Cabang Lomba</Text>
          <Text style={styles.emptyStateText}>
            Belum ada cabang lomba yang dibuka untuk event "{eventName}". Silakan cek kembali secara berkala.
          </Text>
        </View>
      )}

      {/* MODAL 1: Choice Modal (Masukkan Kode Room vs Buat Room) */}
      <Modal
        visible={showChoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChoiceModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowChoiceModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.choiceTitle}>{selectedBranch?.name || 'Basket (Putra)'}</Text>
            <Text style={styles.choiceSubtitle}>
              {selectedBranch?.minMax || 'Min. 4 anggota, Maks. 5 anggota'}
            </Text>

            {/* Side-by-Side Action Buttons */}
            <View style={styles.choiceButtonRow}>
              <TouchableOpacity
                style={styles.enterCodeOutlineBtn}
                activeOpacity={0.8}
                onPress={handlePressEnterCode}
              >
                <Text style={styles.enterCodeOutlineText}>Masukkan Kode Room</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createRoomSolidBtn}
                activeOpacity={0.85}
                onPress={handlePressCreateRoom}
              >
                <Text style={styles.createRoomSolidText}>Buat Room</Text>
              </TouchableOpacity>
            </View>

            {/* Batal Button */}
            <TouchableOpacity
              style={styles.cancelFullBtn}
              activeOpacity={0.8}
              onPress={() => setShowChoiceModal(false)}
            >
              <Text style={styles.cancelFullText}>Batal</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 2: Enter Code Modal (Masukkan Kode Room) */}
      <Modal
        visible={showEnterCodeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEnterCodeModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowEnterCodeModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.enterCodeTitle}>Masukkan Kode Room</Text>
            <Text style={styles.enterCodeDesc}>
              Masukkan 6 digit kode yang diberikan oleh pembuat room.
            </Text>

            <TextInput
              style={styles.codeInputBox}
              placeholder="000000"
              placeholderTextColor="#94A3B8"
              value={roomCodeInput}
              onChangeText={setRoomCodeInput}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity
              style={styles.gabungRoomBtn}
              activeOpacity={0.85}
              onPress={handleGabungRoom}
            >
              <Text style={styles.gabungRoomText}>Gabung Room</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelFullBtn}
              activeOpacity={0.8}
              onPress={() => setShowEnterCodeModal(false)}
            >
              <Text style={styles.cancelFullText}>Batal</Text>
            </TouchableOpacity>
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
    backgroundColor: '#F5F7FA',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSubtitle,
  },
  list: {
    padding: Spacing.base,
  },
  branchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.lg,
  },
  branchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  branchIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 2,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  branchType: {
    fontSize: 12,
    color: Colors.textSubtitle,
  },
  daftarBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: Radius.round,
  },
  daftarBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: Spacing.base,
  },

  // Empty state
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: Colors.textSubtitle,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Modals Styling
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },

  // Choice Modal
  choiceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 6,
    textAlign: 'center',
  },
  choiceSubtitle: {
    fontSize: 13,
    color: Colors.textSubtitle,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  choiceButtonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    marginBottom: Spacing.md,
  },
  enterCodeOutlineBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#B81414',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterCodeOutlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B81414',
    textAlign: 'center',
    lineHeight: 18,
  },
  createRoomSolidBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#B81414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createRoomSolidText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  cancelFullBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelFullText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMain,
  },

  // Enter Code Modal
  enterCodeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  enterCodeDesc: {
    fontSize: 13,
    color: Colors.textSubtitle,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  codeInputBox: {
    width: '100%',
    height: 52,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textMain,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: Spacing.md,
  },
  gabungRoomBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#B81414',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  gabungRoomText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
