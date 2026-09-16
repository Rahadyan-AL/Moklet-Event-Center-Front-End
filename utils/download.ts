import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_URL, tokenStorage } from '../services/api';

export async function downloadAuthenticated(path: string, fileName: string): Promise<void> {
  const token = await tokenStorage.getItem();
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  if (Platform.OS === 'web') {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Download gagal (${response.status})`);
    const objectUrl = URL.createObjectURL(await response.blob());
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    return;
  }

  const target = `${FileSystem.cacheDirectory}${fileName}`;
  const result = await FileSystem.downloadAsync(url, target, { headers });
  if (result.status < 200 || result.status >= 300) throw new Error(`Download gagal (${result.status})`);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Simpan laporan Excel',
    });
  }
}
