// services/admin/panitia.service.ts
import api from '../api';

export interface PanitiaItem {
  id: string;
  email: string;
  isActive?: boolean;
  role: 'PANITIA';
  createdAt?: string;
}

export interface CreatePanitiaDto {
  email: string;
  password: string;
}

/**
 * Buat akun panitia baru. Endpoint ini sudah tersedia.
 */
export async function createPanitia(dto: CreatePanitiaDto): Promise<any> {
  const res: any = await api.post('/auth/panitia', dto);
  return res?.data || res;
}

/**
 * TODO(backend gap #1): Endpoint GET /auth/panitia BELUM ADA.
 * Minta backend membuat: GET /auth/panitia (list + pagination)
 * dan PATCH /auth/panitia/:id/status (toggle aktif/non-aktif).
 *
 * Saat ini fungsi ini akan throw NotImplementedError sehingga UI
 * bisa menampilkan state "menunggu endpoint backend" secara eksplisit.
 */
export async function getPanitia(): Promise<PanitiaItem[]> {
  // TODO(backend gap #1): Uncomment setelah endpoint tersedia
  // const res: any = await api.get('/auth/panitia');
  // return Array.isArray(res) ? res : res?.data || [];
  throw new Error('ENDPOINT_NOT_AVAILABLE');
}

/**
 * TODO(backend gap #1): Toggle status panitia.
 * Endpoint: PATCH /auth/panitia/:id/status belum tersedia.
 */
export async function togglePanitiaStatus(id: string, isActive: boolean): Promise<void> {
  // TODO(backend gap #1): Uncomment setelah endpoint tersedia
  // await api.patch(`/auth/panitia/${id}/status`, { isActive });
  throw new Error('ENDPOINT_NOT_AVAILABLE');
}
