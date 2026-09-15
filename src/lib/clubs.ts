import { z } from 'zod';
import { apiFetch } from '@/lib/api';

export const publicClubSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  slug: z.string(),
  zoneId: z.string().nullable(),
});
export type PublicClub = z.infer<typeof publicClubSchema>;

const publicClubListSchema = z.object({ items: z.array(publicClubSchema), total: z.number() });

export async function fetchPublicClubs(zoneId?: string): Promise<PublicClub[]> {
  const qs = zoneId ? `?zoneId=${encodeURIComponent(zoneId)}` : '';
  const res = await apiFetch(`/public/clubs${qs}`, { schema: publicClubListSchema });
  return res.items;
}

export const zoneSchema = z.object({ id: z.string(), name: z.string(), order: z.number(), clubCount: z.number().optional() });
export type Zone = z.infer<typeof zoneSchema>;

export async function fetchZones(): Promise<Zone[]> {
  return apiFetch('/zones', { schema: z.array(zoneSchema) });
}

export const clubSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  zone: z.string().nullable().optional(),
  zoneId: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  president: z.string().nullable().optional(),
  isDirector: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  rotaryId: z.string().nullable().optional(),
  secretary: z.string().nullable().optional(),
  secretaryEmail: z.string().nullable().optional(),
  secretaryPhone: z.string().nullable().optional(),
  charterDate: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  meetingInfo: z.string().nullable().optional(),
  socialLinks: z.record(z.string(), z.string()).nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  memberCount: z.number().default(0),
});
export type Club = z.infer<typeof clubSchema>;

const clubListResponseSchema = z.object({
  items: z.array(clubSchema),
  total: z.number(),
});

export async function fetchAdminClubs(params?: {
  zoneId?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Club[]; total: number }> {
  const qp = new URLSearchParams();
  if (params?.zoneId) qp.set('zoneId', params.zoneId);
  if (params?.q) qp.set('q', params.q);
  if (params?.page) qp.set('page', String(params.page));
  if (params?.pageSize) qp.set('pageSize', String(params.pageSize));
  const query = qp.toString() ? `?${qp.toString()}` : '';
  return apiFetch(`/clubs${query}`, { schema: clubListResponseSchema });
}

export async function fetchClub(id: string): Promise<Club> {
  return apiFetch(`/clubs/${encodeURIComponent(id)}`, { schema: clubSchema.passthrough() });
}

export async function createClub(payload: Partial<Club>): Promise<Club> {
  return apiFetch('/clubs', {
    method: 'POST',
    body: JSON.stringify(payload),
    schema: clubSchema.passthrough(),
  });
}

export async function updateClub(id: string, payload: Partial<Club>): Promise<Club> {
  return apiFetch(`/clubs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    schema: clubSchema.passthrough(),
  });
}

export async function deleteClub(id: string): Promise<{ ok: boolean }> {
  return apiFetch(`/clubs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    schema: z.object({ ok: z.boolean() }),
  });
}
