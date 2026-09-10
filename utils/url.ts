// utils/url.ts
import { Linking, Platform, Alert } from 'react-native';
import { API_URL } from '../services/api';

/**
 * Mendapatkan URL absolut untuk berkas media (banner, guidebook, avatar, lampiran).
 * Jika path berupa path relatif (misal: /uploads/guidebooks/abc.pdf),
 * fungsi ini akan menambahkan base URL backend.
 */
export function getFileUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return '';
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return '';

  // Jika sudah merupakan URL absolut atau data/blob URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('file:')
  ) {
    return trimmed;
  }

  // Bersihkan slash ganda di awal dan gabungkan dengan API_URL
  const cleanPath = trimmed.replace(/^\/+/, '');
  return `${API_URL}/${cleanPath}`;
}

/**
 * Membuka tautan eksternal di peramban (browser) web atau mobile.
 */
export async function openExternalUrl(url?: string | null): Promise<void> {
  if (!url) return;
  const fullUrl = getFileUrl(url);
  if (!fullUrl) return;

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const opened = window.open(fullUrl, '_blank');
        if (!opened) {
          window.location.href = fullUrl;
        }
      }
      return;
    }

    const canOpen = await Linking.canOpenURL(fullUrl);
    if (canOpen) {
      await Linking.openURL(fullUrl);
    } else {
      await Linking.openURL(fullUrl);
    }
  } catch (error) {
    console.warn('[openExternalUrl] Gagal membuka URL:', fullUrl, error);
    Alert.alert('Gagal Membuka Tautan', 'Tidak dapat membuka tautan ini di browser.');
  }
}

/**
 * Mengunduh atau membuka berkas Guidebook PDF acara.
 * Pada Web: membuka di tab baru sehingga browser mengunduh/menampilkan PDF.
 * Pada Mobile (Android/iOS): membuka URL berkas di browser eksternal/PDF viewer.
 */
export async function downloadOrOpenGuidebook(
  guidebookUrl?: string | null,
  eventTitle?: string
): Promise<void> {
  if (!guidebookUrl) {
    Alert.alert(
      'Guidebook Belum Tersedia',
      `Panitia belum mengunggah dokumen guidebook untuk event ${eventTitle ? `"${eventTitle}"` : 'ini'}.`
    );
    return;
  }

  const fullUrl = getFileUrl(guidebookUrl);
  if (!fullUrl) {
    Alert.alert('Tautan Tidak Valid', 'Tautan berkas guidebook tidak valid.');
    return;
  }

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const opened = window.open(fullUrl, '_blank');
        if (!opened) {
          window.location.href = fullUrl;
        }
      }
      return;
    }

    const canOpen = await Linking.canOpenURL(fullUrl);
    if (canOpen) {
      await Linking.openURL(fullUrl);
    } else {
      await Linking.openURL(fullUrl);
    }
  } catch (error) {
    console.error('[downloadOrOpenGuidebook] Gagal membuka guidebook:', error);
    Alert.alert(
      'Gagal Membuka Guidebook',
      'Tidak dapat membuka berkas guidebook. Pastikan perangkat Anda memiliki koneksi internet dan aplikasi pembaca PDF terpasang.'
    );
  }
}
