// app/(panitia)/events/[id]/schedule-form.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { Colors, Spacing, Radius } from "../../constants/theme";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../constants/query";
import {
  createSchedule, updateSchedule, getSchedulesByEvent, uploadScheduleDresscode,
} from "../../services/panitia/events.service";
import DateTimePicker from "@react-native-community/datetimepicker";
import { toDateString } from "../../utils/date";

export function ScheduleForm({
  targetEventId,
  targetSchId,
}: {
  targetEventId: string;
  targetSchId?: string;
}) {
  const queryClient = useQueryClient();

  const isEdit = !!targetSchId;

  const [dayLabel, setDayLabel] = useState("");
  const [date, setDate] = useState("");
  const [dresscodeText, setDresscodeText] = useState("");
  const [dresscodeImage, setDresscodeImage] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());

  const [fetching, setFetching] = useState(isEdit);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ dayLabel?: string; date?: string; general?: string }>({});

  useEffect(() => {
    async function load() {
      if (!targetEventId || !targetSchId) return;
      try {
        const schs = await getSchedulesByEvent(targetEventId);
        const existing = schs.find((s) => s.id === targetSchId);
        if (existing) {
          setDayLabel(existing.dayLabel);
          setDate(toDateString(existing.date));
          setDresscodeText(existing.dresscodeText);
          // Sync dateObj
          const parsed = new Date(existing.date);
          if (!isNaN(parsed.getTime())) setDateObj(parsed);
        }
      } catch {
        setErrors({ general: "Gagal memuat detail jadwal." });
      } finally {
        setFetching(false);
      }
    }
    load();
  }, [targetEventId, targetSchId]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateObj(selectedDate);
      const isoString = selectedDate.toISOString().split("T")[0];
      setDate(isoString);
      setErrors((e) => ({ ...e, date: undefined }));
    }
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!dayLabel.trim()) errs.dayLabel = "Nama aktivitas / hari wajib diisi.";
    if (!date.trim()) {
      errs.date = "Tanggal kegiatan wajib diisi.";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      errs.date = "Format tanggal harus YYYY-MM-DD.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goBackToEvent = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!validate() || !targetEventId) return;
    setLoading(true);
    setErrors({});

    const dto = {
      dayLabel: dayLabel.trim(),
      date: date.trim(),
      dresscodeText: dresscodeText.trim() || "-",
    };

    try {
      let scheduleId = targetSchId;
      if (isEdit && targetSchId) {
        await updateSchedule(targetSchId, dto);
      } else {
        scheduleId = (await createSchedule(targetEventId, dto)).id;
      }
      if (dresscodeImage && scheduleId) await uploadScheduleDresscode(scheduleId, dresscodeImage);

      // Sinkronkan cache: detail event panitia & siswa ter-update.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.panitiaEventDetail(targetEventId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.eventDetail(targetEventId) }),
      ]);

      setLoading(false);
      Alert.alert(
        "Sukses",
        `Jadwal kegiatan berhasil ${isEdit ? "diperbarui" : "ditambahkan"}!`,
        [
          {
            text: "OK",
            // Gunakan replace agar tidak stack halaman — kembali ke detail event
            onPress: goBackToEvent,
          },
        ]
      );
    } catch (e: any) {
      setLoading(false);
      setErrors({ general: e?.formattedMessage || e?.message || "Gagal menyimpan jadwal." });
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={goBackToEvent} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? "Edit Jadwal" : "Tambah Jadwal Baru"}</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 60 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {errors.general ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.primary} />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : null}

          {/* Nama Aktivitas / Day Label */}
          <Text style={styles.label}>Nama Aktivitas / Agenda *</Text>
          <TextInput
            style={[styles.input, errors.dayLabel ? styles.inputError : null]}
            placeholder="Contoh: Technical Meeting, Pembukaan, Babak Penyisihan"
            placeholderTextColor="#9E9E9E"
            value={dayLabel}
            onChangeText={(t) => { setDayLabel(t); setErrors((e) => ({ ...e, dayLabel: undefined })); }}
          />
          {errors.dayLabel && <Text style={styles.errHint}>{errors.dayLabel}</Text>}

          {/* Tanggal dengan Calendar Picker */}
          <Text style={styles.label}>Tanggal Kegiatan *</Text>
          <View style={styles.dateInputWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }, errors.date ? styles.inputError : null]}
              placeholder="Contoh: 2026-08-17"
              placeholderTextColor="#9E9E9E"
              value={date}
              onChangeText={(t) => { setDate(t); setErrors((e) => ({ ...e, date: undefined })); }}
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.calendarBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={dateObj}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              accentColor={Colors.primary}
              onChange={onDateChange}
            />
          )}
          {errors.date && <Text style={styles.errHint}>{errors.date}</Text>}

          {/* Catatan / Dresscode */}
          <Text style={styles.label}>Catatan & Ketentuan (Waktu, Dresscode, Lokasi)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Contoh: Pukul 08.00 WIB di Aula Utama. Pakaian Batik bebas rapi."
            placeholderTextColor="#9E9E9E"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={dresscodeText}
            onChangeText={setDresscodeText}
          />
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={async () => {
              const picker = require('expo-image-picker');
              const permission = await picker.requestMediaLibraryPermissionsAsync();
              if (!permission.granted) return Alert.alert('Izin Ditolak', 'Akses galeri diperlukan.');
              const result = await picker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
              if (!result.canceled) setDresscodeImage(result.assets[0].uri);
            }}
          >
            <Ionicons name={dresscodeImage ? 'checkmark-circle' : 'image-outline'} size={20} color={Colors.primary} />
            <Text style={styles.imagePickerText}>{dresscodeImage ? 'Gambar dresscode dipilih' : 'Pilih contoh gambar dresscode'}</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Simpan Jadwal</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: Spacing.base, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E1E1E" },
  imagePicker: { marginTop: Spacing.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primarySoft },
  imagePickerText: { color: Colors.primary, fontWeight: '700' },
  scroll: { padding: Spacing.base, paddingBottom: 40 },
  errorBox: {
    flexDirection: "row", gap: 8, backgroundColor: "#FFEBEE", borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.base, alignItems: "center",
  },
  errorText: { flex: 1, fontSize: 13, color: Colors.primary },
  label: { fontSize: 13, fontWeight: "600", color: "#424242", marginTop: Spacing.md, marginBottom: 6 },
  input: {
    backgroundColor: "#F5F5F5", borderRadius: Radius.lg, paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 10, fontSize: 14, color: "#1E1E1E", borderWidth: 1, borderColor: "transparent",
  },
  inputError: { borderColor: Colors.primary, backgroundColor: "#FFF8F8" },
  errHint: { fontSize: 12, color: Colors.primary, marginTop: 4 },
  dateInputWrapper: { flexDirection: "row", alignItems: "center", gap: 8 },
  calendarBtn: {
    width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: "#FEE2E2",
    alignItems: "center", justifyContent: "center",
  },
  textArea: { minHeight: 90, paddingTop: 12 },
  bottomBar: {
    padding: Spacing.base, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F0F0F0",
    paddingBottom: Platform.OS === "ios" ? 28 : Spacing.base,
  },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, height: 50, alignItems: "center", justifyContent: "center" },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

export default ScheduleForm;
