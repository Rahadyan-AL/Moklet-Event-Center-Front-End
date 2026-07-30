// app/(admin)/akademik.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../../constants/theme';
import {
  getClasses,
  createClass,
  deleteClass,
  ClassItem,
  GradeOption,
} from '../../services/admin/classes.service';
import {
  getSystemSetting,
  updateSystemSetting,
  SystemSetting,
} from '../../services/admin/system-setting.service';

// ─── Modal Tambah Kelas ────────────────────────────────────────────────────────

interface AddClassModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GRADE_OPTIONS: GradeOption[] = ['X', 'XI', 'XII'];

function AddClassModal({ visible, onClose, onSuccess }: AddClassModalProps) {
  const [grade, setGrade] = useState<GradeOption>('X');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setGrade('X'); setName(''); setError(''); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Nama kelas wajib diisi.'); return; }

    setLoading(true);
    setError('');
    try {
      await createClass({ grade, name: name.trim() });
      reset();
      onSuccess();
    } catch (e: any) {
      setError(e?.message || 'Gagal menambah kelas. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={ms.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%' }}
        >
          <View style={ms.sheet}>
            <View style={ms.handle} />
            <View style={ms.sheetHeader}>
              <Text style={ms.sheetTitle}>Tambah Kelas</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#607D8B" />
              </TouchableOpacity>
            </View>

            {/* Grade Selector */}
            <Text style={ms.label}>Grade *</Text>
            <View style={ms.gradeRow}>
              {GRADE_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[ms.gradeBtn, grade === g && ms.gradeBtnActive]}
                  onPress={() => setGrade(g)}
                >
                  <Text style={[ms.gradeBtnText, grade === g && ms.gradeBtnTextActive]}>
                    Kelas {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Nama Kelas */}
            <Text style={ms.label}>Nama Kelas *</Text>
            <TextInput
              style={ms.input}
              placeholder={`Contoh: ${grade} RPL 1`}
              placeholderTextColor="#9E9E9E"
              value={name}
              onChangeText={setName}
            />

            {error ? <Text style={ms.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[ms.submitBtn, (loading || !name.trim()) && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={loading || !name.trim()}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={ms.submitBtnText}>Simpan Kelas</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Modal Konfirmasi Ganti Tahun Ajaran ───────────────────────────────────────

interface ChangeAcademicYearModalProps {
  visible: boolean;
  current?: SystemSetting;
  onClose: () => void;
  onSuccess: (updated: SystemSetting) => void;
}

function ChangeAcademicYearModal({ visible, current, onClose, onSuccess }: ChangeAcademicYearModalProps) {
  const [newYear, setNewYear] = useState('');
  const [newAngkatan, setNewAngkatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill dari nilai saat ini
  useEffect(() => {
    if (visible && current) {
      // Suggest next year (e.g., "2024/2025" → "2025/2026")
      const parts = current.currentAcademicYear.split('/');
      if (parts.length === 2) {
        const nextStart = parseInt(parts[0]) + 1;
        const nextEnd = parseInt(parts[1]) + 1;
        setNewYear(`${nextStart}/${nextEnd}`);
      } else {
        setNewYear(current.currentAcademicYear);
      }
      setNewAngkatan(String(current.currentTopAngkatan - 1));
    }
  }, [visible, current]);

  const reset = () => { setNewYear(''); setNewAngkatan(''); setError(''); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!newYear.trim()) { setError('Tahun ajaran baru wajib diisi.'); return; }
    const angkatanNum = parseInt(newAngkatan);
    if (isNaN(angkatanNum)) { setError('Angkatan tertinggi baru harus berupa angka.'); return; }

    setLoading(true);
    setError('');
    try {
      const updated = await updateSystemSetting({
        currentAcademicYear: newYear.trim(),
        currentTopAngkatan: angkatanNum,
      });
      reset();
      onSuccess(updated);
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan pengaturan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={ms.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%' }}
        >
          <View style={ms.sheet}>
            <View style={ms.handle} />
            <View style={ms.sheetHeader}>
              <Text style={ms.sheetTitle}>⚠️ Ganti Tahun Ajaran</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#607D8B" />
              </TouchableOpacity>
            </View>

            {/* Warning Box */}
            <View style={ms.warningBox}>
              <Ionicons name="warning" size={20} color="#B71C1C" />
              <Text style={ms.warningText}>
                Mengganti tahun ajaran akan mempengaruhi seluruh data kelas dan siswa aktif. Tindakan ini{' '}
                <Text style={{ fontWeight: '800' }}>tidak bisa dibatalkan</Text>. Pastikan data sudah
                dibackup sebelum melanjutkan.
              </Text>
            </View>

            {/* Tahun Ajaran Sekarang (readonly info) */}
            {current && (
              <View style={ms.currentInfoRow}>
                <Text style={ms.currentInfoLabel}>Saat ini:</Text>
                <Text style={ms.currentInfoValue}>
                  {current.currentAcademicYear} • Angkatan {current.currentTopAngkatan}
                </Text>
              </View>
            )}

            {/* Tahun Ajaran Baru */}
            <Text style={ms.label}>Tahun Ajaran Baru *</Text>
            <TextInput
              style={ms.input}
              placeholder="Contoh: 2025/2026"
              placeholderTextColor="#9E9E9E"
              value={newYear}
              onChangeText={setNewYear}
            />

            {/* Angkatan Tertinggi Baru */}
            <Text style={ms.label}>Angkatan Tertinggi Baru *</Text>
            <TextInput
              style={ms.input}
              placeholder="Contoh: 2023"
              placeholderTextColor="#9E9E9E"
              keyboardType="numeric"
              value={newAngkatan}
              onChangeText={setNewAngkatan}
            />
            <Text style={ms.hintText}>
              ⓘ Angkatan tertinggi = tahun masuk kelas XII saat ini. Contoh: jika kelas XII masuk 2023, isi 2023.
            </Text>

            {error ? <Text style={ms.errorText}>{error}</Text> : null}

            {/* Actions */}
            <View style={ms.btnRow}>
              <TouchableOpacity style={ms.cancelBtn} onPress={handleClose}>
                <Text style={ms.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ms.dangerBtn, loading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={ms.dangerBtnText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function AkademikScreen() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [systemSetting, setSystemSetting] = useState<SystemSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showChangeYearModal, setShowChangeYearModal] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [classesRes, settingRes] = await Promise.all([
        getClasses(),
        getSystemSetting(),
      ]);
      setClasses(classesRes);
      setSystemSetting(settingRes);
    } catch (e) {
      console.warn('Akademik fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const handleDeleteClass = (cls: ClassItem) => {
    Alert.alert(
      'Hapus Kelas',
      `Yakin ingin menghapus "${cls.grade} — ${cls.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClass(cls.id);
              setClasses((prev) => prev.filter((c) => c.id !== cls.id));
            } catch (e: any) {
              Alert.alert('Gagal', e?.message || 'Tidak dapat menghapus kelas.');
            }
          },
        },
      ]
    );
  };

  // Group classes by grade
  const grouped: { [key: string]: ClassItem[] } = { X: [], XI: [], XII: [] };
  classes.forEach((c) => {
    if (grouped[c.grade]) grouped[c.grade].push(c);
  });

  const renderClass = (cls: ClassItem) => (
    <View key={cls.id} style={styles.classCard}>
      <View style={styles.classGradeBadge}>
        <Text style={styles.classGradeText}>{cls.grade}</Text>
      </View>
      <Text style={styles.className}>{cls.name}</Text>
      {cls._count?.students !== undefined && (
        <Text style={styles.classStudentCount}>
          {cls._count.students} siswa
        </Text>
      )}
      <TouchableOpacity
        style={styles.classDeleteBtn}
        onPress={() => handleDeleteClass(cls)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={16} color="#EF5350" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Akademik</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* ── Tahun Ajaran ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tahun Ajaran</Text>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : systemSetting ? (
          <View style={styles.settingCard}>
            <View style={styles.settingCardRow}>
              <View>
                <Text style={styles.settingLabel}>Tahun Ajaran Aktif</Text>
                <Text style={styles.settingValue}>{systemSetting.currentAcademicYear}</Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>✓ Aktif</Text>
              </View>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingCardRow}>
              <View>
                <Text style={styles.settingLabel}>Angkatan Tertinggi (Kelas XII)</Text>
                <Text style={styles.settingValue}>Angkatan {systemSetting.currentTopAngkatan}</Text>
              </View>
            </View>
            {systemSetting.updatedAt && (
              <Text style={styles.settingUpdated}>
                Terakhir diperbarui:{' '}
                {new Date(systemSetting.updatedAt).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            )}

            <TouchableOpacity
              style={styles.dangerActionBtn}
              onPress={() => setShowChangeYearModal(true)}
            >
              <Ionicons name="warning-outline" size={16} color="#B71C1C" />
              <Text style={styles.dangerActionBtnText}>Ganti Tahun Ajaran / Naik Kelas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>Gagal memuat pengaturan sistem.</Text>
            <TouchableOpacity onPress={fetchAll}>
              <Text style={{ color: Colors.primary, fontWeight: '700' }}>Coba lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Kelola Kelas ── */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>Kelola Kelas</Text>
          <TouchableOpacity
            style={styles.addClassBtn}
            onPress={() => setShowAddClassModal(true)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addClassBtnText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.emptyClasses}>
            <Ionicons name="library-outline" size={40} color="#BDBDBD" />
            <Text style={styles.emptyClassesText}>Belum ada kelas. Ketuk "Tambah" untuk mulai.</Text>
          </View>
        ) : (
          <>
            {(['X', 'XI', 'XII'] as GradeOption[]).map((g) =>
              grouped[g].length > 0 ? (
                <View key={g}>
                  <Text style={styles.gradeGroupLabel}>Kelas {g}</Text>
                  {grouped[g].map(renderClass)}
                </View>
              ) : null
            )}
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <AddClassModal
        visible={showAddClassModal}
        onClose={() => setShowAddClassModal(false)}
        onSuccess={() => {
          setShowAddClassModal(false);
          fetchAll();
        }}
      />
      <ChangeAcademicYearModal
        visible={showChangeYearModal}
        current={systemSetting || undefined}
        onClose={() => setShowChangeYearModal(false)}
        onSuccess={(updated) => {
          setSystemSetting(updated);
          setShowChangeYearModal(false);
          Alert.alert(
            'Berhasil',
            `Tahun ajaran berhasil diubah ke ${updated.currentAcademicYear}.`,
            [{ text: 'OK' }]
          );
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1E1E',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  loaderContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  // Tahun Ajaran Card
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  settingCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 6,
  },
  settingLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 3,
  },
  settingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: Radius.round,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  settingUpdated: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 8,
  },
  dangerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#FFEBEE',
  },
  dangerActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B71C1C',
  },
  errorCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: Radius.xl,
    padding: Spacing.base,
    alignItems: 'center',
    gap: 8,
  },
  errorCardText: {
    fontSize: 14,
    color: '#E65100',
  },
  // Kelola Kelas
  addClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 4,
  },
  addClassBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  gradeGroupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9E9E9E',
    marginBottom: 6,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: Spacing.sm,
  },
  classGradeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  classGradeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  className: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  classStudentCount: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  classDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyClasses: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyClassesText: {
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

// Modal styles
const ms = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.base,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1E1E',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    marginTop: Spacing.md,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 14,
    color: '#1E1E1E',
  },
  hintText: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
    fontStyle: 'italic',
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gradeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  gradeBtnActive: {
    backgroundColor: Colors.primary,
  },
  gradeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
  },
  gradeBtnTextActive: {
    color: '#fff',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 3,
    borderLeftColor: '#B71C1C',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#B71C1C',
    lineHeight: 20,
  },
  currentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  currentInfoLabel: {
    fontSize: 12,
    color: '#757575',
  },
  currentInfoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  errorText: {
    color: Colors.primary,
    fontSize: 13,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.base,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#607D8B',
  },
  dangerBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    backgroundColor: '#B71C1C',
    alignItems: 'center',
  },
  dangerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: 16,
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
