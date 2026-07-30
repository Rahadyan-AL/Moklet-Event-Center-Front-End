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
  { id: '1', name: 'Basket (Putra)', type: 'Kelompok', icon: 'basketball-outline' },
  { id: '2', name: 'Futsal (Campuran)', type: 'Kelompok', icon: 'football-outline' },
  { id: '3', name: 'E-Sport Mobile Legends', type: 'Kelompok', icon: 'game-controller-outline' },
  { id: '4', name: 'Tarik Tambang', type: 'Kelompok', icon: 'people-outline' },
  { id: '5', name: 'Voli Campuran', type: 'Kelompok', icon: 'fitness-outline' },
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTeamCodeModal, setShowTeamCodeModal] = useState(false);
  const [teamCode, setTeamCode] = useState('');

  // Hanya event teratas (id === '1') yang memiliki data cabang lomba dummy
  const branches = currentEventId === '1' ? MOKLET_CUP_BRANCHES : [];

  const handleDaftar = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowConfirmModal(true);
  };

  const handleConfirmDaftar = () => {
    setShowConfirmModal(false);
    if (selectedBranch?.type === 'Kelompok') {
      setTimeout(() => setShowTeamCodeModal(true), 300);
    } else {
      router.push('/room-tim');
    }
  };

  const handleGabungTim = () => {
    setShowTeamCodeModal(false);
    router.push('/room-tim');
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
                onPress={() => handleDaftar(branch)}
              >
                <View style={styles.branchLeft}>
                  <View style={styles.branchIcon}>
                    <Ionicons name={branch.icon as any} size={20} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.branchName}>{branch.name}</Text>
                    <View style={styles.typeRow}>
                      <Ionicons
                        name={branch.type === 'Kelompok' ? 'people-outline' : 'person-outline'}
                        size={12}
                        color={Colors.textSubtitle}
                      />
                      <Text style={styles.branchType}>{branch.type}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.daftarBtn}
                  onPress={() => handleDaftar(branch)}
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

      {/* Confirm Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowConfirmModal(false)}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalIconBox}>
              <Ionicons name="trophy-outline" size={30} color={Colors.primary} />
            </View>
            <Text style={styles.modalTitle}>{selectedBranch?.name}</Text>
            <Text style={styles.modalDesc}>
              Kamu akan mendaftarkan diri sebagai peserta pada cabang lomba ini.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmDaftar}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnText}>Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Team Code Modal */}
      <Modal
        visible={showTeamCodeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTeamCodeModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowTeamCodeModal(false)}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalIconBox, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="key-outline" size={30} color="#1565C0" />
            </View>
            <Text style={styles.modalTitle}>Masukkan Kode Tim</Text>
            <Text style={styles.modalDesc}>
              Masukkan kode tim yang telah dibagikan oleh ketua tim untuk bergabung.
            </Text>
            <TextInput
              style={styles.codeInput}
              placeholder="Contoh: MKL123"
              placeholderTextColor={Colors.textPlaceholder}
              value={teamCode}
              onChangeText={setTeamCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.confirmBtn, { width: '100%', marginTop: 0 }]}
              onPress={handleGabungTim}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>Gabung Tim</Text>
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

  // Empty State
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
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 14,
    color: Colors.textSubtitle,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: Spacing.xl,
  },
  codeInput: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textMain,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: Spacing.base,
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
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.round,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
