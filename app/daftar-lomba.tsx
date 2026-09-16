// app/daftar-lomba.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, Radius } from '../constants/theme';
import { cacheTime, queryKeys } from '../constants/query';
import {
  getCategoriesByEvent,
  getEventById,
  CategoryItem,
  EventItem,
} from '../services/panitia/events.service';
import {
  registerIndividual,
  createTeam,
  joinTeam,
} from '../services/registration.service';
import { getCategoryIcon } from '../utils/icons';
import { downloadOrOpenGuidebook } from '../utils/url';

export default function DaftarLombaScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const currentEventId = eventId || '';
  const queryClient = useQueryClient();

  // Modal States
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showEnterCodeModal, setShowEnterCodeModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

  // Form Inputs
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [teamNameInput, setTeamNameInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<{ eventData: EventItem | null; categories: CategoryItem[] }>({
    queryKey: queryKeys.eventCategories(currentEventId),
    enabled: !!currentEventId,
    staleTime: cacheTime.hot,
    queryFn: async () => {
      const [ev, cats] = await Promise.all([
        getEventById(currentEventId).catch(() => null),
        getCategoriesByEvent(currentEventId).catch(() => []),
      ]);
      return { eventData: ev, categories: cats };
    },
  });

  const eventData = data?.eventData || null;
  const categories = data?.categories || [];

  const errorMsg = !currentEventId
    ? 'ID Event tidak valid.'
    : error
      ? (error as any)?.formattedMessage || 'Gagal memuat cabang lomba.'
      : null;

  const invalidateRegistrationData = async (teamId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.registrationHistory }),
      queryClient.invalidateQueries({ queryKey: queryKeys.eventCategories(currentEventId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.eventDetail(currentEventId) }),
      queryClient.invalidateQueries({ queryKey: ['home'] }),
      teamId
        ? queryClient.invalidateQueries({ queryKey: queryKeys.team(teamId) })
        : Promise.resolve(),
    ]);
  };

  const handleCategoryPress = (category: CategoryItem) => {
    setSelectedCategory(category);
    setModalError(null);

    if (category.maxMember === 1) {
      // Pendaftaran Individu
      Alert.alert(
        'Daftar Lomba Individu',
        `Apakah Anda yakin ingin mendaftar ke cabang lomba "${category.name}"?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Daftar Sekarang',
            onPress: () => handleIndividualRegistration(category.id),
          },
        ]
      );
    } else {
      // Pendaftaran Kelompok/Tim
      setShowChoiceModal(true);
    }
  };

  const handleIndividualRegistration = async (categoryId: string) => {
    setSubmitting(true);
    try {
      await registerIndividual(categoryId);
      await invalidateRegistrationData();
      Alert.alert(
        'Pendaftaran Berhasil!',
        'Anda telah berhasil mendaftar ke cabang lomba ini.',
        [
          {
            text: 'Lihat Riwayat',
            onPress: () => router.replace('/(tabs)/history'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'Pendaftaran Gagal',
        err?.formattedMessage || err?.message || 'Gagal melakukan pendaftaran. Silakan coba lagi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePressEnterCode = () => {
    setShowChoiceModal(false);
    setRoomCodeInput('');
    setModalError(null);
    setTimeout(() => {
      setShowEnterCodeModal(true);
    }, 200);
  };

  const handlePressCreateRoom = () => {
    setShowChoiceModal(false);
    setTeamNameInput('');
    setModalError(null);
    setTimeout(() => {
      setShowCreateTeamModal(true);
    }, 200);
  };

  const handleJoinTeamSubmit = async () => {
    const cleanCode = roomCodeInput.trim();
    if (!cleanCode) {
      setModalError('Kode room tim wajib diisi.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      const team = await joinTeam(cleanCode);
      await invalidateRegistrationData(team.id);
      setShowEnterCodeModal(false);
      Alert.alert('Berhasil Bergabung!', `Kamu telah bergabung dengan tim "${team.name}".`, [
        {
          text: 'Masuk ke Room Tim',
          onPress: () => router.push({ pathname: '/room-tim', params: { teamId: team.id } }),
        },
      ]);
    } catch (err: any) {
      setModalError(err?.formattedMessage || err?.message || 'Kode room tidak ditemukan atau kuota tim sudah penuh.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTeamSubmit = async () => {
    const cleanName = teamNameInput.trim();
    if (!cleanName || cleanName.length < 3) {
      setModalError('Nama tim minimal 3 karakter.');
      return;
    }
    if (!selectedCategory) {
      setModalError('Cabang lomba tidak valid.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      const team = await createTeam(cleanName, selectedCategory.id);
      await invalidateRegistrationData(team.id);
      setShowCreateTeamModal(false);
      Alert.alert('Room Tim Dibuat!', `Tim "${team.name}" berhasil dibuat. Kode tim: ${team.code}`, [
        {
          text: 'Masuk ke Room Tim',
          onPress: () => router.push({ pathname: '/room-tim', params: { teamId: team.id } }),
        },
      ]);
    } catch (err: any) {
      setModalError(err?.formattedMessage || err?.message || 'Gagal membuat room tim.');
    } finally {
      setSubmitting(false);
    }
  };

  const eventName = eventData?.name || 'Moklet Event';

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
        <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 8 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>Pilih Cabang Lomba</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{eventName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat cabang lomba...</Text>
        </View>
      ) : categories.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[Colors.primary]}
            />
          }
        >
          {/* Guidebook Banner Quick Action */}
          {eventData?.guidebookUrl && (
            <TouchableOpacity
              style={styles.guidebookBanner}
              activeOpacity={0.85}
              onPress={() => downloadOrOpenGuidebook(eventData.guidebookUrl, eventData.name)}
            >
              <View style={styles.guidebookBannerIcon}>
                <Ionicons name="book" size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guidebookBannerTitle}>Unduh Guidebook PDF</Text>
                <Text style={styles.guidebookBannerSub}>
                  Pelajari panduan dan aturan sebelum memilih cabang lomba
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionHeading}>Daftar Kategori ({categories.length})</Text>

          {categories.map((branch) => {
            const isIndividual = branch.maxMember === 1;
            const memberLabel = isIndividual
              ? 'Individu (1 orang)'
              : `Kelompok (${branch.minMember} - ${branch.maxMember} anggota)`;

            return (
              <View key={branch.id} style={styles.branchCard}>
                <View style={styles.branchIcon}>
                  <Ionicons
                    name={getCategoryIcon(branch.name)}
                    size={22}
                    color={Colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.branchName}>{branch.name}</Text>
                  <View style={styles.typeRow}>
                    <Ionicons
                      name={isIndividual ? 'person-outline' : 'people-outline'}
                      size={13}
                      color={Colors.textSubtitle}
                    />
                    <Text style={styles.branchType}>{memberLabel}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.daftarBtn}
                  onPress={() => handleCategoryPress(branch)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.daftarBtnText}>Daftar</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="trophy-outline" size={48} color={Colors.textPlaceholder} />
          </View>
          <Text style={styles.emptyStateTitle}>Belum Ada Cabang Lomba</Text>
          <Text style={styles.emptyStateText}>
            Belum ada cabang lomba yang dibuka untuk event "{eventName}". Silakan periksa kembali nanti.
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
            <View style={styles.modalIconTop}>
              <Ionicons name="people" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.choiceTitle}>{selectedCategory?.name || 'Cabang Lomba'}</Text>
            <Text style={styles.choiceSubtitle}>
              Kategori Tim (Min. {selectedCategory?.minMember}, Maks. {selectedCategory?.maxMember} anggota)
            </Text>

            {/* Side-by-Side Action Buttons */}
            <View style={styles.choiceButtonRow}>
              <TouchableOpacity
                style={styles.enterCodeOutlineBtn}
                activeOpacity={0.8}
                onPress={handlePressEnterCode}
              >
                <Ionicons name="key-outline" size={18} color={Colors.primary} />
                <Text style={styles.enterCodeOutlineText}>Masukkan Kode Tim</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createRoomSolidBtn}
                activeOpacity={0.85}
                onPress={handlePressCreateRoom}
              >
                <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
                <Text style={styles.createRoomSolidText}>Buat Tim Baru</Text>
              </TouchableOpacity>
            </View>

            {/* Batal Button */}
            <TouchableOpacity
              style={styles.cancelFullBtn}
              activeOpacity={0.8}
              onPress={() => setShowChoiceModal(false)}
            >
              <Text style={styles.cancelFullText}>Tutup</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 2: Enter Room Code Modal */}
      <Modal
        visible={showEnterCodeModal}
        transparent
        animationType="fade"
        onRequestClose={() => !submitting && setShowEnterCodeModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => !submitting && setShowEnterCodeModal(false)}
          >
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.enterCodeTitle}>Masukkan Kode Tim</Text>
              <Text style={styles.enterCodeDesc}>
                Masukkan kode tim 6 karakter yang diberikan oleh ketua tim (leader).
              </Text>

              {modalError ? (
                <View style={styles.modalErrorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                  <Text style={styles.modalErrorText}>{modalError}</Text>
                </View>
              ) : null}

              <TextInput
                style={styles.codeInputBox}
                placeholder="KODE TIM"
                placeholderTextColor={Colors.textPlaceholder}
                value={roomCodeInput}
                onChangeText={(t) => {
                  setRoomCodeInput(t);
                  if (modalError) setModalError(null);
                }}
                autoCapitalize="characters"
                autoFocus
                editable={!submitting}
              />

              <TouchableOpacity
                style={[styles.gabungRoomBtn, (!roomCodeInput.trim() || submitting) && { opacity: 0.6 }]}
                activeOpacity={0.85}
                onPress={handleJoinTeamSubmit}
                disabled={!roomCodeInput.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.gabungRoomText}>Gabung ke Tim</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelFullBtn}
                activeOpacity={0.8}
                onPress={() => setShowEnterCodeModal(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelFullText}>Batal</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 3: Create Team Modal */}
      <Modal
        visible={showCreateTeamModal}
        transparent
        animationType="fade"
        onRequestClose={() => !submitting && setShowCreateTeamModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => !submitting && setShowCreateTeamModal(false)}
          >
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.enterCodeTitle}>Buat Tim Baru</Text>
              <Text style={styles.enterCodeDesc}>
                Tentukan nama tim untuk cabang lomba "{selectedCategory?.name}". Anda otomatis terdaftar sebagai Leader tim.
              </Text>

              {modalError ? (
                <View style={styles.modalErrorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                  <Text style={styles.modalErrorText}>{modalError}</Text>
                </View>
              ) : null}

              <TextInput
                style={[styles.codeInputBox, { letterSpacing: 0, fontSize: 15, textAlign: 'left', paddingHorizontal: 16 }]}
                placeholder="Contoh: Tim Moklet Juara"
                placeholderTextColor={Colors.textPlaceholder}
                value={teamNameInput}
                onChangeText={(t) => {
                  setTeamNameInput(t);
                  if (modalError) setModalError(null);
                }}
                autoFocus
                editable={!submitting}
              />

              <TouchableOpacity
                style={[styles.gabungRoomBtn, (!teamNameInput.trim() || submitting) && { opacity: 0.6 }]}
                activeOpacity={0.85}
                onPress={handleCreateTeamSubmit}
                disabled={!teamNameInput.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.gabungRoomText}>Buat Tim Sekarang</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelFullBtn}
                activeOpacity={0.8}
                onPress={() => setShowCreateTeamModal(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelFullText}>Batal</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
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
  headerSub: {
    fontSize: 12,
    color: Colors.textSubtitle,
    marginTop: 1,
  },
  list: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  guidebookBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  guidebookBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidebookBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  guidebookBannerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMain,
    marginTop: 4,
    marginBottom: -4,
  },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderRadius: Radius.xl,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  branchIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  branchType: {
    fontSize: 12,
    color: Colors.textSubtitle,
    fontWeight: '500',
  },
  daftarBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.round,
  },
  daftarBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSubtitle,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: {
    flex: 1,
    color: Colors.error,
    fontSize: 13,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 13,
    color: Colors.textSubtitle,
    textAlign: 'center',
    lineHeight: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconTop: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  choiceTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 4,
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
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  enterCodeOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  createRoomSolidBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  createRoomSolidText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  cancelFullBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: Radius.lg,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelFullText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  enterCodeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textMain,
    marginBottom: 6,
    textAlign: 'center',
  },
  enterCodeDesc: {
    fontSize: 13,
    color: Colors.textSubtitle,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.sm,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    width: '100%',
  },
  modalErrorText: {
    color: Colors.error,
    fontSize: 12,
    flex: 1,
  },
  codeInputBox: {
    width: '100%',
    height: 50,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMain,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: Spacing.base,
  },
  gabungRoomBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
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
