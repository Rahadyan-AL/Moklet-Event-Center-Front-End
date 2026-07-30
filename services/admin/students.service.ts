// services/admin/students.service.ts
import api from '../api';

export interface StudentItem {
  id: string;
  name: string;
  nis: string;
  angkatan?: number | string; // TODO(backend gap #3): field ini belum ada di CreateStudentDto
  class?: {
    id: string;
    grade: string;
    name: string;
  };
  classId?: string;
  avatarUrl?: string;
  account?: {
    id: string;
    email: string;
  } | null;
}

export interface PaginatedStudents {
  data: StudentItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateStudentDto {
  name: string;
  nis: string;
  classId: string;
  // TODO(backend gap #3): angkatan belum didukung CreateStudentDto — simpan di state lokal saja
  // angkatan?: number;
}

export interface UpdateStudentDto {
  name?: string;
  nis?: string;
  classId?: string;
}

export interface ImportResult {
  successCount?: number;
  failedCount?: number;
  errors?: string[];
  message?: string;
}

/**
 * Ambil daftar siswa dengan paginasi.
 * TODO(backend gap #4): search param belum didukung backend.
 * Filter nama/kelas dilakukan client-side dari data yang sudah di-fetch.
 */
export async function getStudents(page = 1, limit = 50): Promise<PaginatedStudents> {
  const res: any = await api.get(`/students?page=${page}&limit=${limit}`);
  // Handle berbagai bentuk response
  if (res?.data && Array.isArray(res.data)) {
    return { data: res.data, meta: res.meta || { total: res.data.length, page, limit, totalPages: 1 } };
  }
  if (Array.isArray(res)) {
    return { data: res, meta: { total: res.length, page, limit, totalPages: 1 } };
  }
  return { data: [], meta: { total: 0, page, limit, totalPages: 1 } };
}

export async function createStudent(dto: CreateStudentDto): Promise<StudentItem> {
  const res: any = await api.post('/students', dto);
  return res?.data || res;
}

export async function updateStudent(id: string, dto: UpdateStudentDto): Promise<StudentItem> {
  const res: any = await api.patch(`/students/${id}`, dto);
  return res?.data || res;
}

export async function deleteStudent(id: string): Promise<void> {
  await api.delete(`/students/${id}`);
}

/**
 * Upload file Excel siswa ke POST /students/import (multipart/form-data).
 */
export async function importStudentsExcel(fileUri: string, fileName: string, mimeType: string): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as any);

  const res: any = await api.post('/students/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res?.data || res;
}
