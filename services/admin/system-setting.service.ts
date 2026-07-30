// services/admin/system-setting.service.ts
import api from '../api';

export interface SystemSetting {
  id?: string;
  currentTopAngkatan: number;
  currentAcademicYear: string;
  updatedAt?: string;
}

export interface UpdateSystemSettingDto {
  currentTopAngkatan?: number;
  currentAcademicYear?: string;
}

export async function getSystemSetting(): Promise<SystemSetting> {
  const res: any = await api.get('/system-setting');
  return res?.data || res;
}

export async function updateSystemSetting(dto: UpdateSystemSettingDto): Promise<SystemSetting> {
  const res: any = await api.patch('/system-setting', dto);
  return res?.data || res;
}
