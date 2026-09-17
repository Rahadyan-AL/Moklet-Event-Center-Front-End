// app/(panitia)/events/[id]/index.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  PanResponder,
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  BackHandler,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, Radius } from "../../constants/theme";
import { cacheTime, queryKeys } from '../../constants/query';
import {
  getEventById,
  getCategoriesByEvent,
  getSchedulesByEvent,
  getCommittee,
  deleteCategory,
  deleteSchedule,
  removeCommitteeMember,
  addCommitteeMember,
  exportCategoryReport, exportEventReport,
  getTeamsByCategory,
  disqualifyTeam,
  ManagedTeamItem,
  EventItem,
  CategoryItem,
  ScheduleItem,
  CommitteeMemberItem,
} from "../../services/panitia/events.service";
import { getStudents, StudentItem } from "../../services/admin/students.service";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  AnnouncementItem,
} from "../../services/panitia/announcements.service";
import { formatDate } from "../../utils/date";
import { getCategoryIconStyled } from "../../utils/icons";
import { downloadOrOpenGuidebook, getFileUrl } from "../../utils/url";

type ActiveTab = "info" | "jadwal" | "panitia" | "pengumuman" | "lomba";

function getInitials(name: string): string {
  const parts = (name || "").trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name || "P").substring(0, 2).toUpperCase();
}

function getInitialColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: "#F59E0B", text: "#FFFFFF" }, // Amber / Gold
    { bg: "#059669", text: "#FFFFFF" }, // Emerald green
    { bg: "#2563EB", text: "#FFFFFF" }, // Blue
    { bg: "#7C3AED", text: "#FFFFFF" }, // Purple
    { bg: "#DB2777", text: "#FFFFFF" }, // Pink
    { bg: "#DC2626", text: "#FFFFFF" }, // Red
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── Swipeable Bottom Sheet Modal ────────────────────────────────────────────
function SwipeableBottomModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 10 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onMoveShouldSetPanResponderCapture: (_, gs) => gs.dy > 15 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80) {
          Animated.timing(translateY, { toValue: 500, duration: 200, useNativeDriver: true }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={ms.kav}>
        {/* Backdrop */}
        <TouchableOpacity style={ms.overlay} activeOpacity={1} onPress={onClose} />
        <Animated.View
          {...panResponder.panHandlers}
          style={[ms.sheet, { transform: [{ translateY }] }]}
        >
          {/* Drag handle */}
          <View style={{ paddingTop: 8, paddingBottom: 4, alignItems: "center" }}>
            <View style={ms.handle} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
type EventManageMode = "panitia" | "komite";

/**
 * View manajemen satu event. Dipakai dua area:
 * - mode "panitia": host route (panitia)/events/[id] (PANITIA/ADMIN).
 * - mode "komite": host route (komite)/manage (SISWA committee) -- supaya
 *   committee tidak perlu masuk grup panitia (dan kena tab-bar/dashboard
 *   panitia) sama sekali.
 */
export function EventManageView({
  eventId,
  mode = "panitia",
}: {
  eventId: string;
  mode?: EventManageMode;
}) {
  const queryClient = useQueryClient();
  const isKomite = mode === "komite";

  // Route tujuan form mengikuti area host, jadi navigasi tidak pernah
  // melintasi grup (tidak ada lagi "tiba-tiba di dashboard panitia").
  const formRoutes = isKomite
    ? {
        edit: "/(komite)/edit",
        categoryForm: "/(komite)/category-form",
        scheduleForm: "/(komite)/schedule-form",
      }
    : {
        edit: "/(panitia)/events/[id]/edit",
        categoryForm: "/(panitia)/events/[id]/category-form",
        scheduleForm: "/(panitia)/events/[id]/schedule-form",
      };

  const goBack = () => {
    if (isKomite) router.back();
    else router.navigate("/(panitia)/events");
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>("info");

  // Modal Tambah Panitia state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Modal Kelola Tim state
  const [teamCategory, setTeamCategory] = useState<CategoryItem | null>(null);
  const [managedTeams, setManagedTeams] = useState<ManagedTeamItem[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const {
    data,
    isLoading,
    isRefetching,
    error: queryError,
    refetch,
  } = useQuery<{
    event: EventItem | null;
    categories: CategoryItem[];
    schedules: ScheduleItem[];
    committee: CommitteeMemberItem[];
  }>({
    queryKey: queryKeys.panitiaEventDetail(eventId),
    enabled: !!eventId,
    staleTime: cacheTime.reactive,
    queryFn: async () => {
      const [evRes, catRes, schRes, comRes] = await Promise.allSettled([
        getEventById(eventId!),
        getCategoriesByEvent(eventId!),
        getSchedulesByEvent(eventId!),
        getCommittee(eventId!),
      ]);

      return {
        event: evRes.status === 'fulfilled' ? evRes.value : null,
        categories:
          catRes.status === 'fulfilled' ? catRes.value : [],
        schedules:
          schRes.status === 'fulfilled' ? schRes.value : [],
        committee:
          comRes.status === 'fulfilled' ? comRes.value : [],
      };
    },
  });

  const event = data?.event || null;
  const categories = data?.categories || [];
  const schedules = data?.schedules || [];
  const committee = data?.committee || [];
  const addedStudentIds = new Set(committee.map((c) => c.studentId));

  // ─── Pengumuman event (event-scoped, termasuk oleh committee) ───
  const {
    data: annData,
    isLoading: annLoading,
    isError: annError,
    refetch: refetchAnnouncements,
  } = useQuery<AnnouncementItem[]>({
    queryKey: ["eventAnnouncements", eventId],
    enabled: !!eventId,
    staleTime: cacheTime.warm,
    queryFn: async () => {
      const res = await getAnnouncements(1, 50, eventId);
      return res.data;
    },
  });
  const eventAnnouncements = annData || [];

  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annEditId, setAnnEditId] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annSubmitting, setAnnSubmitting] = useState(false);
  // Lomba yang sedang dibuka menu aksinya (bottom sheet)
  const [actionCat, setActionCat] = useState<CategoryItem | null>(null);

  const invalidateAnnouncementData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["eventAnnouncements", eventId] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.announcementsList }),
      queryClient.invalidateQueries({ queryKey: ["home"] }),
    ]);
  };

  const openAnnouncementModal = () => {
    setAnnEditId(null);
    setAnnTitle("");
    setAnnContent("");
    setShowAnnModal(true);
  };

  const handleDeleteAnnouncement = (ann: AnnouncementItem) => {
    Alert.alert("Hapus Pengumuman", `Hapus "${ann.title}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAnnouncement(ann.id);
            await invalidateAnnouncementData();
          } catch (e: any) {
            Alert.alert("Gagal", e?.formattedMessage || "Gagal menghapus pengumuman.");
          }
        },
      },
    ]);
  };

  const handleSubmitAnnouncement = async () => {
    if (!annTitle.trim() || !annContent.trim()) {
      Alert.alert("Data Kurang", "Judul dan isi pengumuman wajib diisi.");
      return;
    }
    setAnnSubmitting(true);
    try {
      if (annEditId) {
        await updateAnnouncement(annEditId, { title: annTitle.trim(), content: annContent.trim() });
      } else {
        await createAnnouncement({ title: annTitle.trim(), content: annContent.trim(), eventId });
      }
      setShowAnnModal(false);
      await invalidateAnnouncementData();
    } catch (e: any) {
      Alert.alert("Gagal", e?.formattedMessage || "Gagal menyimpan pengumuman.");
    } finally {
      setAnnSubmitting(false);
    }
  };

  // Hardware back mengikuti mode host: komite -> pop balik (home siswa /
  // list yang membuka), panitia -> daftar event.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      goBack();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKomite]);

  const loading = isLoading;
  const error = eventId
    ? queryError
      ? "Gagal memuat data event."
      : data && !event
        ? "Gagal memuat detail event."
        : ""
    : "";

  // Sinkronkan semua data turunan event ini di seluruh layar.
  const invalidateEventDetailData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.panitiaEventDetail(eventId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.managedEvents }),
      queryClient.invalidateQueries({ queryKey: ['events'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.eventDetail(eventId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.eventCategories(eventId) }),
      queryClient.invalidateQueries({ queryKey: ['home'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.registrationHistory }),
    ]);
  };

  // Search students for Add Member Modal
  const handleSearchStudents = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setStudents([]);
      return;
    }
    setSearchingStudents(true);
    try {
      const res = await getStudents(1, 50);
      const filtered = res.data.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.nis.includes(query)
      );
      setStudents(filtered);
    } catch {
      setStudents([]);
    } finally {
      setSearchingStudents(false);
    }
  };

  const handleAddMember = async (studentId: string) => {
    if (!eventId) return;
    setAddingId(studentId);
    try {
      await addCommitteeMember(eventId, studentId);
      await invalidateEventDetailData();
      Alert.alert("Berhasil", "Anggota komite berhasil ditambahkan.");
    } catch (e: any) {
      Alert.alert("Gagal", e?.formattedMessage || "Gagal menambahkan panitia.");
    } finally {
      setAddingId(null);
    }
  };

  const handleRemoveMember = (studentId: string, name: string) => {
    Alert.alert("Konfirmasi", `Keluarkan ${name} dari kepanitiaan?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluarkan",
        style: "destructive",
        onPress: async () => {
          if (!eventId) return;
          try {
            await removeCommitteeMember(eventId, studentId);
            await invalidateEventDetailData();
            Alert.alert("Sukses", "Anggota berhasil dikeluarkan.");
          } catch {
            Alert.alert("Error", "Gagal mengeluarkan panitia.");
          }
        },
      },
    ]);
  };

  const handleDeleteCategory = (catId: string, name: string) => {
    Alert.alert("Hapus Lomba", `Apakah kamu yakin ingin menghapus lomba "${name}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(catId);
            await invalidateEventDetailData();
            Alert.alert("Sukses", "Cabang lomba berhasil dihapus.");
          } catch {
            Alert.alert("Error", "Gagal menghapus cabang lomba.");
          }
        },
      },
    ]);
  };

  // Menu aksi lomba pakai bottom sheet, bukan Alert.alert -- AlertDialog
  // native Android cuma muat 3 tombol, sisanya dibuang diam-diam.
  const handleCategoryAction = (cat: CategoryItem) => {
    setActionCat(cat);
  };

  const closeCategoryAction = () => setActionCat(null);

  const handleViewCategoryTeams = async (cat: CategoryItem) => {
    closeCategoryAction();
    setTeamCategory(cat);
    setLoadingTeams(true);
    try {
      const res = await getTeamsByCategory(cat.id);
      setManagedTeams(res);
    } catch {
      setManagedTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleExportCategoryReport = async (cat: CategoryItem) => {
    closeCategoryAction();
    try {
      await exportCategoryReport(cat.id);
    } catch {
      Alert.alert("Error", "Gagal mengunduh laporan kategori.");
    }
  };

  const handleEditCategory = (cat: CategoryItem) => {
    closeCategoryAction();
    router.push({
      pathname: formRoutes.categoryForm,
      params: { eventId: event?.id, categoryId: cat.id },
    } as any);
  };

  const handleDeleteSchedule = (schId: string, label: string) => {
    Alert.alert("Hapus Jadwal", `Hapus agenda "${label}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSchedule(schId);
            await invalidateEventDetailData();
          } catch {
            Alert.alert("Error", "Gagal menghapus jadwal.");
          }
        },
      },
    ]);
  };

  const handleExportData = async () => {
    if (!eventId) return;
    try {
      await exportEventReport(eventId);
    } catch {
      Alert.alert(
        "Gagal Ekspor",
        "Laporan tidak dapat diunduh. Coba login ulang lalu ulangi."
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <><SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.primary} />
          <Text style={styles.errorTitle}>Detail Event Tidak Ditemukan</Text>
          <Text style={styles.errorSub}>{error || "Event tidak ada atau telah dihapus."}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={goBack}>
            <Text style={styles.retryText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView><TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity></>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Banner Section */}
        <View style={styles.bannerWrapper}>
          {event.bannerUrl ? (
            <Image
              source={{ uri: getFileUrl(event.bannerUrl) }}
              style={styles.bannerImg}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Ionicons name="image-outline" size={36} color="#94A3B8" />
              <Text style={styles.bannerPlaceholderText}>Banner tidak tersedia</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.backFab}
            onPress={goBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Title & Date */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{event.name}</Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={15} color="#757575" />
                <Text style={styles.dateText}>{formatDate(event.eventDate)}</Text>
              </View>
            </View>
            {/* Satu-satunya pintu edit: deskripsi, banner/guidebook, status */}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() =>
                router.push({
                  pathname: formRoutes.edit,
                  params: { id: event.id },
                } as any)
              }
              activeOpacity={0.85}
            >
              <Ionicons name="pencil-outline" size={16} color="#fff" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Download Data Button */}
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={handleExportData}
            activeOpacity={0.85}
          >
            <Ionicons name="download-outline" size={18} color="#fff" />
            <Text style={styles.exportBtnText}>Download Seluruh Data Lomba</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs Bar -- slot proporsional memenuhi lebar layar; tab Pengumuman
            dapet porsi lebih besar supaya labelnya muat satu baris tanpa wrap */}
        <View style={styles.tabBar}>
          {(["info", "jadwal", "pengumuman", "panitia", "lomba"] as ActiveTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const labels: Record<ActiveTab, string> = {
              info: "Info",
              jadwal: "Jadwal",
              pengumuman: "Pengumuman",
              panitia: "Panitia",
              lomba: "Lomba",
            };
            const weights: Record<ActiveTab, number> = {
              info: 0.85,
              jadwal: 1,
              pengumuman: 1.6,
              panitia: 1,
              lomba: 0.85,
            };
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  { flexGrow: weights[tab], flexBasis: 0 },
                  isActive ? styles.tabItemActive : null,
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}
                >
                  {labels[tab]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {/* TAB 1: INFO (Screenshot 5) */}
          {activeTab === "info" && (
            <View style={{ gap: Spacing.base }}>
              {/* Deskripsi Event Card */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                    <Text style={styles.cardTitle}>Deskripsi Event</Text>
                  </View>
                </View>
                <Text style={styles.cardBodyText}>
                  {event.description || "Belum ada deskripsi untuk event ini."}
                </Text>
              </View>

              {/* Guidebook Peserta Card */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <View style={styles.pdfIconBadge}>
                      <Ionicons name="book" size={16} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.cardTitle}>Guidebook Peserta</Text>
                      <Text style={styles.cardSubText}>
                        {event.guidebookUrl ? "PDF, Dokumen Panduan Lengkap" : "Belum diunggah"}
                      </Text>
                    </View>
                  </View>
                </View>

                {event.guidebookUrl ? (
                  <TouchableOpacity
                    style={styles.guidebookBtn}
                    onPress={() => downloadOrOpenGuidebook(event.guidebookUrl, event.name)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="open-outline" size={16} color={Colors.primary} />
                    <Text style={styles.guidebookText}>Lihat & Unduh PDF Guidebook</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Kontak Panitia Inti Card — berisi kontak yang diisi di form
                  event, BUKAN daftar anggota komite (itu ada di tab Panitia) */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <Ionicons name="help-circle-outline" size={20} color={Colors.primary} />
                    <Text style={styles.cardTitle}>Kontak Panitia Inti</Text>
                  </View>
                </View>

                {event.contactInfo ? (
                  <View style={styles.contactRow}>
                    <View style={styles.contactIconCircle}>
                      <Ionicons name="call-outline" size={16} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactName}>{event.contactInfo}</Text>
                      <Text style={styles.contactSub}>Hubungi panitia bila ada pertanyaan</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.cardBodyText}>
                    Belum ada kontak panitia. Tambahkan lewat tombol Edit.
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* TAB 2: JADWAL */}
          {activeTab === "jadwal" && (
            <View style={{ gap: Spacing.md }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>
                  Daftar Kegiatan ({schedules.length})
                </Text>
                <TouchableOpacity
                  style={styles.addSmallBtn}
                  onPress={() =>
                    router.push({
                      pathname: formRoutes.scheduleForm,
                      params: { eventId: event.id },
                    } as any)
                  }
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addSmallText}>Tambah Jadwal</Text>
                </TouchableOpacity>
              </View>

              {schedules.length > 0 ? (
                schedules.map((sch) => (
                  <View key={sch.id} style={styles.scheduleCard}>
                    <View style={styles.scheduleHeader}>
                      <Text style={styles.scheduleDay}>{sch.dayLabel}</Text>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                          onPress={() =>
                            router.push({
                              pathname: formRoutes.scheduleForm,
                              params: { eventId: event.id, scheduleId: sch.id },
                            } as any)
                          }
                        >
                          <Ionicons name="pencil-outline" size={18} color="#757575" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteSchedule(sch.id, sch.dayLabel)}
                        >
                          <Ionicons name="trash-outline" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.scheduleMeta}>
                      <Ionicons name="calendar-outline" size={13} color="#9E9E9E" />
                      <Text style={styles.scheduleDate}>{formatDate(sch.date)}</Text>
                    </View>
                    <Text style={styles.scheduleText}>{sch.dresscodeText}</Text>
                    {sch.dresscodeImageUrl ? (
                      <Image
                        source={{ uri: getFileUrl(sch.dresscodeImageUrl) }}
                        style={styles.dresscodeImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    ) : null}
                  </View>
                ))
              ) : (
                <View style={styles.emptyTabBox}>
                  <Ionicons name="calendar-outline" size={40} color="#BDBDBD" />
                  <Text style={styles.emptyText}>Belum ada jadwal kegiatan.</Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 2.5: PENGUMUMAN (event-scoped, bisa oleh committee) */}
          {activeTab === "pengumuman" && (
            <View style={{ gap: Spacing.md }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>
                  Pengumuman Event ({eventAnnouncements.length})
                </Text>
                <TouchableOpacity
                  style={styles.addSmallBtn}
                  onPress={openAnnouncementModal}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addSmallText}>Buat</Text>
                </TouchableOpacity>
              </View>

              {annLoading ? (
                <View style={{ paddingVertical: 24, alignItems: "center" }}>
                  <ActivityIndicator color={Colors.primary} />
                </View>
              ) : annError ? (
                <View style={styles.annErrorBox}>
                  <Ionicons name="cloud-offline-outline" size={28} color="#DC2626" />
                  <Text style={styles.annErrorText}>
                    Gagal memuat pengumuman. Periksa koneksi atau server, lalu coba lagi.
                  </Text>
                  <TouchableOpacity
                    style={styles.annRetryBtn}
                    onPress={() => refetchAnnouncements()}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="refresh" size={15} color="#fff" />
                    <Text style={styles.annRetryBtnText}>Coba Lagi</Text>
                  </TouchableOpacity>
                </View>
              ) : eventAnnouncements.length === 0 ? (
                <View style={styles.card}>
                  <Text style={styles.cardBodyText}>
                    Belum ada pengumuman untuk event ini. Ketuk "Buat" untuk mempublikasikan
                    info baru khusus peserta event.
                  </Text>
                </View>
              ) : (
                eventAnnouncements.map((ann) => (
                  <View key={ann.id} style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.cardTitle}>{ann.title}</Text>
                        <Text style={styles.cardSubText}>
                          {ann.authorName} • {formatDate(ann.createdAt, { showTime: true })}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 4 }}>
                        <TouchableOpacity
                          style={{ padding: 4 }}
                          onPress={() => {
                            setAnnEditId(ann.id);
                            setAnnTitle(ann.title);
                            setAnnContent(ann.content);
                            setShowAnnModal(true);
                          }}
                        >
                          <Ionicons name="pencil-outline" size={18} color="#757575" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ padding: 4 }}
                          onPress={() => handleDeleteAnnouncement(ann)}
                        >
                          <Ionicons name="trash-outline" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.cardBodyText}>{ann.content}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 3: PANITIA (Screenshot 2) */}
          {activeTab === "panitia" && (
            <View style={{ gap: Spacing.md }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>
                  Daftar Panitia ({committee.length})
                </Text>
                {/* Tambah anggota komite = hak ketua event (backend assertOwner),
                    jadi disembunyikan di mode komite */}
                {!isKomite && (
                  <TouchableOpacity
                    style={styles.addSmallBtn}
                    onPress={() => {
                      setShowAddMemberModal(true);
                      setStudents([]);
                      setSearchQuery("");
                    }}
                  >
                    <Ionicons name="person-add-outline" size={15} color="#fff" />
                    <Text style={styles.addSmallText}>Tambah Anggota</Text>
                  </TouchableOpacity>
                )}
              </View>

              {committee.length > 0 ? (
                committee.map((mem) => {
                  const initials = getInitials(mem.name);
                  const colorScheme = getInitialColor(mem.name);

                  return (
                    <View key={mem.studentId} style={styles.memberCard}>
                      {mem.photoUrl ? (
                        <Image source={mem.photoUrl} style={styles.memberAvatarImg} cachePolicy="memory-disk" />
                      ) : (
                        <View
                          style={[
                            styles.memberAvatarCircle,
                            { backgroundColor: colorScheme.bg },
                          ]}
                        >
                          <Text style={[styles.avatarInitialsText, { color: colorScheme.text }]}>
                            {initials}
                          </Text>
                        </View>
                      )}

                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{mem.name}</Text>
                        <Text style={styles.memberSub}>
                          {mem.classLabel || (mem.nis && mem.nis !== "-" ? `NIS ${mem.nis}` : "Siswa Moklet")}
                        </Text>
                      </View>

                      <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{mem.role || "Anggota"}</Text>
                      </View>

                      {!isKomite && (
                        <TouchableOpacity
                          onPress={() => handleRemoveMember(mem.studentId, mem.name)}
                          style={{ paddingLeft: 4 }}
                        >
                          <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyTabBox}>
                  <Ionicons name="people-outline" size={40} color="#BDBDBD" />
                  <Text style={styles.emptyText}>Belum ada anggota panitia ditambahkan.</Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 4: LOMBA (Screenshot 1) */}
          {activeTab === "lomba" && (
            <View style={{ gap: Spacing.md }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>
                  Daftar Lomba ({categories.length})
                </Text>
                <TouchableOpacity
                  style={styles.addSmallBtn}
                  onPress={() =>
                    router.push({
                      pathname: formRoutes.categoryForm,
                      params: { eventId: event.id },
                    } as any)
                  }
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addSmallText}> Tambah Lomba</Text>
                </TouchableOpacity>
              </View>

              {categories.length > 0 ? (
                categories.map((cat) => {
                  const iconInfo = getCategoryIconStyled(cat.name);
                  const isIndividual = cat.maxMember === 1;
                  const typeLabel = isIndividual
                    ? "Individu"
                    : `Tim (${cat.maxMember} Orang)`;

                  // Kuota kategori dihitung per TIM (maxTotalTeams /
                  // maxTeamsPerGroup). Untuk lomba individu, 1 tim = 1
                  // peserta, jadi totalRegistrations (orang) juga akurat.
                  const maxQuota = cat.maxTotalTeams || cat.maxTeamsPerGroup || 32;
                  const isFull =
                    (isIndividual
                      ? cat.totalRegistrations
                      : cat.totalTeams) >= maxQuota && maxQuota > 0;
                  const unitLabel = isIndividual ? "Orang" : "Tim";
                  const filledCount = isIndividual ? cat.totalRegistrations : cat.totalTeams;

                  return (
                    <View key={cat.id} style={styles.categoryCard}>
                      <View style={styles.catTopRow}>
                        {/* Left Icon */}
                        <View style={[styles.catIconBox, { backgroundColor: iconInfo.bg }]}>
                          <Ionicons name={iconInfo.name} size={22} color={iconInfo.color} />
                        </View>

                        {/* Title & Tag */}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.catName}>{cat.name}</Text>
                          <View style={styles.catTypePill}>
                            <Text style={styles.catTypePillText}>{typeLabel}</Text>
                          </View>
                        </View>

                        {/* 3-dots Menu Button */}
                        <TouchableOpacity
                          onPress={() => handleCategoryAction(cat)}
                          style={{ padding: 4 }}
                        >
                          <Ionicons name="ellipsis-vertical" size={18} color="#757575" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.catDivider} />

                      {/* Bottom Registration & Status */}
                      <View style={styles.catBottomRow}>
                        <View>
                          <Text style={styles.pendaftarSub}>Pendaftar</Text>
                          <Text style={styles.pendaftarTotal}>
                            {filledCount}/{maxQuota} {unitLabel}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.catStatusBadge,
                            isFull ? styles.catStatusFull : styles.catStatusOpen,
                          ]}
                        >
                          <Text
                            style={[
                              styles.catStatusText,
                              isFull ? styles.catStatusFullText : styles.catStatusOpenText,
                            ]}
                          >
                            {isFull ? "Penuh" : "Buka"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyTabBox}>
                  <Ionicons name="trophy-outline" size={40} color="#BDBDBD" />
                  <Text style={styles.emptyText}>Belum ada cabang lomba dibuat.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal Tambah Anggota Panitia — dengan swipe-to-close */}
      <SwipeableBottomModal
        visible={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
      >
        <View style={ms.sheetHeader}>
          <Text style={ms.sheetTitle}>Tambah Anggota Komite</Text>
          <TouchableOpacity onPress={() => setShowAddMemberModal(false)}>
            <Ionicons name="close" size={24} color="#757575" />
          </TouchableOpacity>
        </View>

        <View style={ms.searchBox}>
          <Ionicons name="search" size={18} color="#9E9E9E" />
          <TextInput
            style={ms.searchInput}
            placeholder="Cari nama atau NIS siswa..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={handleSearchStudents}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(""); setStudents([]); }}>
              <Ionicons name="close-circle" size={18} color="#9E9E9E" />
            </TouchableOpacity>
          )}
        </View>

        {searchingStudents ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(s) => s.id}
            style={{ maxHeight: 300, marginTop: 8 }}
            renderItem={({ item }) => {
              const isAdded = addedStudentIds.has(item.id);
              const isPending = addingId === item.id;
              const classLabel = item.class ? `${item.class.grade} ${item.class.name}` : "";
              return (
                <View style={ms.studentRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={ms.studentName}>{item.name}</Text>
                    <Text style={ms.studentSub}>
                      {classLabel ? `${classLabel} • ` : ""}NIS: {item.nis || "-"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[ms.addMemberBtn, isAdded ? ms.addedBtn : null]}
                    onPress={() => handleAddMember(item.id)}
                    disabled={isAdded || isPending}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={[ms.addMemberBtnText, isAdded ? ms.addedText : null]}>
                        {isAdded ? "Ditambahkan" : "Tambahkan"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Text style={{ fontSize: 13, color: "#9E9E9E" }}>
                  {searchQuery ? "Siswa tidak ditemukan." : "Ketik nama siswa untuk mencari."}
                </Text>
              </View>
            }
          />
        )}
      </SwipeableBottomModal>

      {/* Modal Kelola Tim */}
      <SwipeableBottomModal
        visible={Boolean(teamCategory)}
        onClose={() => setTeamCategory(null)}
      >
        <View style={ms.sheetHeader}>
          <View style={{ flex: 1 }}>
            <Text style={ms.sheetTitle}>Kelola Tim Lomba</Text>
            <Text style={styles.scheduleDate}>{teamCategory?.name} • {managedTeams.length} tim terdaftar</Text>
          </View>
          <TouchableOpacity onPress={() => setTeamCategory(null)}>
            <Ionicons name="close" size={24} color="#757575" />
          </TouchableOpacity>
        </View>

        {loadingTeams ? (
          <View style={{ paddingVertical: 32, alignItems: "center" }}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : managedTeams.length === 0 ? (
          <View style={{ paddingVertical: 32, alignItems: "center", gap: 8 }}>
            <Ionicons name="people-outline" size={40} color="#BDBDBD" />
            <Text style={styles.emptyText}>Belum ada tim yang mendaftar di cabang lomba ini.</Text>
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 380, marginTop: 8 }} showsVerticalScrollIndicator={false}>
            {managedTeams.map((team) => (
              <View key={team.id} style={[styles.memberCard, { marginBottom: Spacing.sm }]}>
                <View style={styles.memberInfo}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.memberName}>{team.name}</Text>
                    <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: "#475569" }}>{team.code}</Text>
                    </View>
                  </View>
                  <Text style={styles.memberSub}>
                    {team.teamMembers.length} Anggota • Status: {team.status}
                  </Text>
                </View>

                {team.status !== "DISQUALIFIED" ? (
                  <TouchableOpacity
                    style={[styles.addSmallBtn, { backgroundColor: Colors.error }]}
                    onPress={() => {
                      Alert.alert(
                        "Diskualifikasi Tim",
                        `Apakah Anda yakin ingin mendiskualifikasi tim "${team.name}"?`,
                        [
                          { text: "Batal", style: "cancel" },
                          {
                            text: "Diskualifikasi",
                            style: "destructive",
                            onPress: async () => {
                              try {
                                await disqualifyTeam(team.id);
                                setManagedTeams((prev) =>
                                  prev.map((t) => (t.id === team.id ? { ...t, status: "DISQUALIFIED" } : t))
                                );
                                await invalidateEventDetailData();
                                Alert.alert("Sukses", `Tim "${team.name}" telah didiskualifikasi.`);
                              } catch {
                                Alert.alert("Error", "Gagal mendiskualifikasi tim.");
                              }
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Ionicons name="ban-outline" size={14} color="#fff" />
                    <Text style={styles.addSmallText}>DQ</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.roleBadge, { backgroundColor: "#FFEBEE" }]}>
                    <Text style={[styles.roleBadgeText, { color: "#C62828" }]}>Didiskualifikasi</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </SwipeableBottomModal>

      {/* Modal Buat/Edit Pengumuman Event */}
      <SwipeableBottomModal
        visible={showAnnModal}
        onClose={() => setShowAnnModal(false)}
      >
        <View style={ms.sheetHeader}>
          <Text style={ms.sheetTitle}>
            {annEditId ? "Edit Pengumuman" : "Buat Pengumuman Event"}
          </Text>
          <TouchableOpacity onPress={() => setShowAnnModal(false)}>
            <Ionicons name="close" size={24} color="#757575" />
          </TouchableOpacity>
        </View>

        <Text style={ms.fieldLabel}>Judul Pengumuman *</Text>
        <TextInput
          style={ms.fieldInput}
          placeholder="Contoh: Perubahan Waktu Technical Meeting"
          placeholderTextColor="#9E9E9E"
          value={annTitle}
          onChangeText={setAnnTitle}
        />

        <Text style={ms.fieldLabel}>Isi Pengumuman *</Text>
        <TextInput
          style={[ms.fieldInput, ms.fieldTextArea]}
          placeholder="Tuliskan isi detail pengumuman untuk peserta event ini..."
          placeholderTextColor="#9E9E9E"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={annContent}
          onChangeText={setAnnContent}
        />

        <TouchableOpacity
          style={[ms.submitBtn, annSubmitting && { opacity: 0.6 }]}
          onPress={handleSubmitAnnouncement}
          disabled={annSubmitting}
          activeOpacity={0.85}
        >
          {annSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={ms.submitBtnText}>{annEditId ? "Simpan Perubahan" : "Publikasikan"}</Text>
          )}
        </TouchableOpacity>
      </SwipeableBottomModal>

      {/* Modal Aksi Lomba (bottom sheet) -- pengganti Alert.alert yang di
          Android cuma muat 3 tombol */}
      <SwipeableBottomModal
        visible={!!actionCat}
        onClose={closeCategoryAction}
      >
        <View style={ms.sheetHeader}>
          <Text style={ms.sheetTitle} numberOfLines={1}>
            {actionCat?.name}
          </Text>
          <TouchableOpacity onPress={closeCategoryAction}>
            <Ionicons name="close" size={24} color="#757575" />
          </TouchableOpacity>
        </View>
        <Text style={ms.actionSheetSubtitle}>
          Pilih tindakan untuk cabang lomba ini:
        </Text>

        <TouchableOpacity
          style={ms.actionRow}
          activeOpacity={0.7}
          onPress={() => actionCat && handleViewCategoryTeams(actionCat)}
        >
          <Ionicons name="people-outline" size={20} color={Colors.primary} />
          <Text style={ms.actionRowText}>Lihat &amp; Kelola Tim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={ms.actionRow}
          activeOpacity={0.7}
          onPress={() => actionCat && handleExportCategoryReport(actionCat)}
        >
          <Ionicons name="download-outline" size={20} color={Colors.primary} />
          <Text style={ms.actionRowText}>Ekspor Laporan Kategori</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={ms.actionRow}
          activeOpacity={0.7}
          onPress={() => actionCat && handleEditCategory(actionCat)}
        >
          <Ionicons name="create-outline" size={20} color={Colors.primary} />
          <Text style={ms.actionRowText}>Edit Cabang Lomba</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={ms.actionRowLast}
          activeOpacity={0.7}
          onPress={() => {
            if (!actionCat) return;
            closeCategoryAction();
            handleDeleteCategory(actionCat.id, actionCat.name);
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
          <Text style={[ms.actionRowText, ms.actionRowTextDanger]}>Hapus Lomba</Text>
        </TouchableOpacity>
      </SwipeableBottomModal>
    </SafeAreaView>
  );
}

export default EventManageView;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    gap: 12,
  },
  errorTitle: { fontSize: 16, fontWeight: "700", color: "#424242" },
  errorSub: { fontSize: 13, color: "#9E9E9E", textAlign: "center" },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  bannerWrapper: { width: "100%", height: 180, position: "relative" },
  bannerImg: { width: "100%", height: "100%" },
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
  backFab: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    backgroundColor: "#fff",
    padding: Spacing.base,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  eventTitle: { fontSize: 22, fontWeight: "800", color: "#1E1E1E" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontSize: 13, color: "#757575" },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    marginTop: 8,
  },
  exportBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tabItem: {
    paddingHorizontal: 4,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: { borderBottomColor: Colors.primary },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#757575",
    includeFontPadding: false,
  },
  annErrorBox: {
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    padding: Spacing.base,
    alignItems: "center",
    gap: 10,
  },
  annErrorText: {
    fontSize: 13,
    color: "#757575",
    textAlign: "center",
  },
  annRetryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  annRetryBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  tabLabelActive: { color: Colors.primary, fontWeight: "800" },
  tabContent: { padding: Spacing.base },
  card: {
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1E1E1E" },
  cardSubText: { fontSize: 12, color: "#757575", marginTop: 1 },
  cardBodyText: { fontSize: 13, color: "#424242", lineHeight: 20 },
  pdfIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  guidebookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF5F5",
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  guidebookText: { fontSize: 13, color: Colors.primary, fontWeight: "700" },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  contactIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  contactName: { fontSize: 13, fontWeight: "700", color: "#1E1E1E" },
  contactSub: { fontSize: 11, color: "#757575" },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionHeaderTitle: { fontSize: 16, fontWeight: "800", color: "#1E1E1E" },
  addSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addSmallText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  scheduleCard: {
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: 6,
    elevation: 1,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleDay: { fontSize: 15, fontWeight: "700", color: "#1E1E1E" },
  scheduleMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  scheduleDate: { fontSize: 12, color: "#9E9E9E" },
  scheduleText: { fontSize: 13, color: "#424242", marginTop: 4 },
  dresscodeImage: { width: '100%', height: 160, borderRadius: Radius.lg, marginTop: Spacing.sm },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    padding: Spacing.base,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  memberAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialsText: {
    fontSize: 16,
    fontWeight: "800",
  },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontSize: 15, fontWeight: "700", color: "#1E1E1E" },
  memberSub: { fontSize: 12, color: "#757575" },
  roleBadge: {
    backgroundColor: "#F0F4F8",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.round,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    padding: Spacing.base,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  catTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  catIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E1E1E",
    marginBottom: 4,
  },
  catTypePill: {
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  catTypePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  catDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: Spacing.sm,
  },
  catBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendaftarSub: {
    fontSize: 11,
    color: "#757575",
    fontWeight: "500",
  },
  pendaftarTotal: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 2,
  },
  catStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  catStatusOpen: {
    backgroundColor: "#ECFDF5",
  },
  catStatusFull: {
    backgroundColor: "#FEE2E2",
  },
  catStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  catStatusOpenText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  catStatusFullText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
  },
  emptyTabBox: { alignItems: "center", paddingVertical: 36, gap: 8 },
  emptyText: { fontSize: 13, color: "#9E9E9E" },
});

const ms = StyleSheet.create({
  kav: { flex: 1, justifyContent: "flex-end" },
  overlay: {
    flex: 1,
    // Overlay sekarang absolute fill agar backdrop dan sheet bisa overlap
    backgroundColor: "rgba(0,0,0,0.5)",
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.base,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: "#1E1E1E" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1E1E1E" },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  studentName: { fontSize: 14, fontWeight: "600", color: "#1E1E1E" },
  studentSub: { fontSize: 12, color: "#757575" },
  addMemberBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addedBtn: { backgroundColor: "#E8F5E9" },
  addMemberBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  addedText: { color: "#2E7D32" },
  // Form pengumuman
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#424242", marginTop: 12, marginBottom: 6 },
  fieldInput: {
    backgroundColor: "#F5F5F5", borderRadius: 12, paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10, fontSize: 14, color: "#1E1E1E",
  },
  fieldTextArea: { minHeight: 100, paddingTop: 12 },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, height: 48,
    alignItems: "center", justifyContent: "center", marginTop: 16, marginBottom: 24,
  },
  submitBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  // Menu aksi lomba (bottom sheet)
  actionSheetSubtitle: {
    fontSize: 13,
    color: "#757575",
    marginBottom: Spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  actionRowLast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  actionRowText: { fontSize: 15, fontWeight: "600", color: "#1E1E1E" },
  actionRowTextDanger: { color: "#DC2626" },
});
