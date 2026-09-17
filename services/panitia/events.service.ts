// services/panitia/events.service.ts
import api, { API_URL } from '../api';
import { downloadAuthenticated } from '../../utils/download';

/**
 * Get URL for exporting category report (GET /export/categories/:categoryId).
 */
export function getExportCategoryUrl(categoryId: string): string {
  return `${API_URL}/export/categories/${categoryId}`;
}

/**
 * Trigger category report export download via Linking.
 */
export async function exportCategoryReport(categoryId: string): Promise<void> {
  try {
    await downloadAuthenticated(`/export/categories/${categoryId}`, `laporan-kategori-${categoryId}.xlsx`);
  } catch (error: any) {
    console.error(`[ERROR exportCategoryReport] Category ID ${categoryId}:`, error);
    throw error;
  }
}

export interface RawEvent {
  id: string;
  name: string;
  description?: string | null;
  contactInfo?: string | null;
  eventDate?: string | null;
  status?: string;
  bannerUrl?: string | null;
  guidebookUrl?: string | null;
  creatorId?: string;
  createdById?: string;
  created_by?: string;
  owner_id?: string;
  ownerId?: string;
  creator_id?: string;
  createdBy?: { id: string; [key: string]: any } | null;
  creator?: { id: string; [key: string]: any } | null;
  owner?: { id: string; [key: string]: any } | null;
  createdAt?: string;
  _count?: { categories?: number; registrations?: number; teams?: number };
  categories?: RawCategory[];
  eventCommitteeMembers?: RawCommitteeMember[];
}

export interface RawCategory {
  id: string;
  name: string;
  minMember: number;
  maxMember: number;
  teamCompositionMode: 'FREE' | 'PER_CLASS' | 'PER_ANGKATAN';
  maxTeamsPerGroup?: number | null;
  maxTotalTeams?: number | null;
  excludeGrade12: boolean;
  eventId?: string;
  _count?: { teams?: number; registrations?: number };
}

export interface RawSchedule {
  id: string;
  date: string;
  dayLabel: string;
  dresscodeText: string;
  dresscodeImageUrl?: string | null;
  eventId?: string;
}

export interface RawCommitteeMember {
  studentId: string;
  role?: string | null;
  student?: {
    id: string;
    name: string;
    nis?: string;
    photoUrl?: string | null;
    class?: { grade: string; name: string } | null;
  };
}

// ─── Normalized Internal Shapes ────────────────────────────────────────────────
export interface EventItem {
  id: string; name: string; description: string; contactInfo: string | null;
  eventDate: string;
  status: string; bannerUrl: string | null; guidebookUrl: string | null;
  creatorId: string;
  createdById?: string;
  created_by?: string;
  owner_id?: string;
  createdAt: string;
  totalRegistrations?: number;
  totalCategories?: number;
  committeeAvatars: { studentId: string; name: string; photoUrl: string | null }[];
}

export interface CategoryItem {
  id: string; name: string; minMember: number; maxMember: number;
  teamCompositionMode: 'FREE' | 'PER_CLASS' | 'PER_ANGKATAN';
  maxTeamsPerGroup: number | null; maxTotalTeams: number | null;
  excludeGrade12: boolean; totalRegistrations: number; totalTeams: number;
}

export interface ScheduleItem {
  id: string; date: string; dayLabel: string; dresscodeText: string;
  dresscodeImageUrl: string | null;
}

export interface CommitteeMemberItem {
  studentId: string; role: string; name: string; nis: string;
  photoUrl: string | null; classLabel: string;
}

export interface ManagedTeamItem {
  id: string; name: string; code: string; status: string;
  teamMembers: { student: { id: string; name: string } }[];
}

// ─── Normalisers ───────────────────────────────────────────────────────────────
export function normalizeEvent(raw: RawEvent): EventItem {
  const count = raw._count;
  const cats = raw.categories || [];
  // 1 Registration = 1 peserta (individu maupun anggota tim).
  // JANGAN jumlahkan dengan teams -- itu double counting.
  let totalRegistrations = count?.registrations ?? 0;
  if (!totalRegistrations && cats.length > 0) {
    totalRegistrations = cats.reduce(
      (acc, c) => acc + (c._count?.registrations ?? 0),
      0
    );
  }

  const resolvedCreatorId =
    raw.creatorId ||
    raw.createdById ||
    raw.created_by ||
    raw.owner_id ||
    raw.ownerId ||
    raw.creator_id ||
    raw.createdBy?.id ||
    raw.creator?.id ||
    raw.owner?.id ||
    '';

  return {
    id: raw.id,
    name: raw.name || '',
    description: raw.description || '',
    contactInfo: raw.contactInfo || null,
    eventDate: raw.eventDate || '',
    status: raw.status || 'ONGOING',
    bannerUrl: raw.bannerUrl || null,
    guidebookUrl: raw.guidebookUrl || null,
    creatorId: resolvedCreatorId,
    createdById: resolvedCreatorId,
    created_by: resolvedCreatorId,
    owner_id: resolvedCreatorId,
    createdAt: raw.createdAt || '',
    totalRegistrations,
    totalCategories: count?.categories ?? cats.length,
    committeeAvatars: (raw.eventCommitteeMembers || []).map((m) => ({
      studentId: m.studentId,
      name: m.student?.name || '',
      photoUrl: m.student?.photoUrl || null,
    })),
  };
}


export function normalizeCategory(raw: RawCategory): CategoryItem {
  const count = raw._count;
  return {
    id: raw.id, name: raw.name || '', minMember: raw.minMember ?? 1,
    maxMember: raw.maxMember ?? 1, teamCompositionMode: raw.teamCompositionMode || 'FREE',
    maxTeamsPerGroup: raw.maxTeamsPerGroup ?? null, maxTotalTeams: raw.maxTotalTeams ?? null,
    excludeGrade12: raw.excludeGrade12 ?? true,
    totalRegistrations: count?.registrations ?? 0,
    totalTeams: count?.teams ?? 0,
  };
}

export function normalizeSchedule(raw: RawSchedule): ScheduleItem {
  return {
    id: raw.id, date: raw.date || '', dayLabel: raw.dayLabel || '',
    dresscodeText: raw.dresscodeText || '', dresscodeImageUrl: raw.dresscodeImageUrl || null,
  };
}

export function normalizeCommitteeMember(raw: RawCommitteeMember): CommitteeMemberItem {
  const st = raw.student;
  return {
    studentId: raw.studentId, role: raw.role || 'Anggota', name: st?.name || '',
    nis: st?.nis || '', photoUrl: st?.photoUrl || null,
    classLabel: st?.class ? `${st.class.grade} ${st.class.name}`.trim() : '',
  };
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface CreateEventDto { name: string; eventDate: string; description?: string; contactInfo?: string; }
export type UpdateEventDto = Partial<CreateEventDto>;

export interface CreateCategoryDto {
  name: string; minMember: number; maxMember: number;
  teamCompositionMode: 'FREE' | 'PER_CLASS' | 'PER_ANGKATAN';
  maxTeamsPerGroup?: number;
  maxTotalTeams?: number;
  excludeGrade12?: boolean;
}
export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export interface CreateScheduleDto { date: string; dayLabel: string; dresscodeText: string; }
export type UpdateScheduleDto = Partial<CreateScheduleDto>;

export interface EventFilterOptions {
  creatorId?: string;
  created_by?: string;
  owner_id?: string;
  [key: string]: any;
}

// ─── Events CRUD ───────────────────────────────────────────────────────────────
export async function getEvents(
  page = 1,
  limit = 50,
  status?: 'ONGOING' | 'CLOSED' | 'ALL',
  filter?: EventFilterOptions
): Promise<EventItem[]> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);

  const creator = filter?.created_by || filter?.creatorId || filter?.owner_id;
  if (creator) {
    // Kirim parameter query ke endpoint /events sesuai konvensi backend:
    // ?created_by=... (snake_case)
    // ?creatorId=... (camelCase)
    // ?owner_id=... (alternative ownership)
    if (filter?.created_by) params.set('created_by', filter.created_by);
    else params.set('created_by', creator);

    if (filter?.creatorId) params.set('creatorId', filter.creatorId);
    else params.set('creatorId', creator);

    if (filter?.owner_id) params.set('owner_id', filter.owner_id);
  }

  const res: any = await api.get(`/events?${params.toString()}`);
  const raw: RawEvent[] = Array.isArray(res) ? res : (res?.data ?? []);
  return raw.map(normalizeEvent);
}

export async function getEventById(id: string): Promise<EventItem> {
  const res: any = await api.get(`/events/${id}`);
  const raw: RawEvent = res?.data ?? res;
  return normalizeEvent(raw);
}

export async function createEvent(dto: CreateEventDto): Promise<EventItem> {
  const res: any = await api.post('/events', dto);
  const raw: RawEvent = res?.data ?? res;
  return normalizeEvent(raw);
}

export async function updateEvent(id: string, dto: UpdateEventDto): Promise<EventItem> {
  const res: any = await api.patch(`/events/${id}`, dto);
  const raw: RawEvent = res?.data ?? res;
  return normalizeEvent(raw);
}

export async function updateEventStatus(id: string, status: 'ONGOING' | 'CLOSED'): Promise<void> {
  await api.patch(`/events/${id}/status`, { status });
}

export async function uploadBanner(id: string, uri: string): Promise<void> {
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'banner.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  formData.append('file', { uri, name: filename, type } as any);
  await api.patch(`/events/${id}/banner`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export async function uploadGuidebook(id: string, uri: string): Promise<void> {
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'guidebook.pdf';
  formData.append('file', { uri, name: filename, type: 'application/pdf' } as any);
  await api.patch(`/events/${id}/guidebook`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

// ─── Categories ────────────────────────────────────────────────────────────────
export async function getCategoriesByEvent(eventId: string): Promise<CategoryItem[]> {
  const res: any = await api.get(`/events/${eventId}/categories`);
  const raw: RawCategory[] = Array.isArray(res) ? res : (res?.data ?? []);
  return raw.map(normalizeCategory);
}

export async function createCategory(eventId: string, dto: CreateCategoryDto): Promise<CategoryItem> {
  const res: any = await api.post(`/events/${eventId}/categories`, dto);
  return normalizeCategory(res?.data ?? res);
}

export async function updateCategory(id: string, dto: UpdateCategoryDto): Promise<CategoryItem> {
  const res: any = await api.patch(`/categories/${id}`, dto);
  return normalizeCategory(res?.data ?? res);
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export async function getTeamsByCategory(id: string): Promise<ManagedTeamItem[]> {
  const res: any = await api.get(`/categories/${id}/teams`);
  return Array.isArray(res) ? res : (res?.data ?? []);
}

export async function disqualifyTeam(id: string): Promise<void> {
  await api.patch(`/teams/${id}/status`, { status: 'DISQUALIFIED' });
}

// ─── Schedules ─────────────────────────────────────────────────────────────────
export async function getSchedulesByEvent(eventId: string): Promise<ScheduleItem[]> {
  const res: any = await api.get(`/events/${eventId}/schedules`);
  const raw: RawSchedule[] = Array.isArray(res) ? res : (res?.data ?? []);
  return raw.map(normalizeSchedule);
}

export async function createSchedule(eventId: string, dto: CreateScheduleDto): Promise<ScheduleItem> {
  const res: any = await api.post(`/events/${eventId}/schedules`, dto);
  return normalizeSchedule(res?.data ?? res);
}

export async function updateSchedule(id: string, dto: UpdateScheduleDto): Promise<ScheduleItem> {
  const res: any = await api.patch(`/schedules/${id}`, dto);
  return normalizeSchedule(res?.data ?? res);
}

export async function deleteSchedule(id: string): Promise<void> {
  await api.delete(`/schedules/${id}`);
}

// ─── Committee ─────────────────────────────────────────────────────────────────
export async function getCommittee(eventId: string): Promise<CommitteeMemberItem[]> {
  const res: any = await api.get(`/events/${eventId}/committee`);
  const raw: RawCommitteeMember[] = Array.isArray(res) ? res : (res?.data ?? []);
  return raw.map(normalizeCommitteeMember);
}

export async function addCommitteeMember(eventId: string, studentId: string): Promise<void> {
  await api.post(`/events/${eventId}/committee`, { studentId });
}

export async function removeCommitteeMember(eventId: string, studentId: string): Promise<void> {
  await api.delete(`/events/${eventId}/committee/${studentId}`);
}

export async function getManagedEventsForStudent(
  _studentId?: string,
  _userId?: string
): Promise<EventItem[]> {
  const res: any = await api.get('/events/managed/me');
  const raw: RawEvent[] = Array.isArray(res) ? res : (res?.data ?? []);
  return raw.map(normalizeEvent);
}

export async function uploadScheduleDresscode(id: string, uri: string): Promise<void> {
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'dresscode.jpg';
  const extension = filename.split('.').pop() || 'jpeg';
  formData.append('file', { uri, name: filename, type: `image/${extension}` } as any);
  await api.patch(`/schedules/${id}/dresscode-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function exportEventReport(eventId: string): Promise<void> {
  await downloadAuthenticated(`/export/events/${eventId}`, `laporan-event-${eventId}.xlsx`);
}

