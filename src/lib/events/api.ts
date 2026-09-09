import { z } from 'zod';
import { apiFetch } from '@/lib/api';

// ---- types ----
export const eventAdminSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  startsAt: z.string(),
  endsAt: z.string().nullable(),
  location: z.string().nullable(),
  description: z.string().nullable(),
  coverUrl: z.string().nullable(),
  isDistrictEvent: z.boolean(),
  clubId: z.string().nullable(),
  projectKey: z.string().nullable(),
  rsvpOpen: z.boolean(),
  capacity: z.number().nullable(),
  photos: z.array(z.string()),
});
export type EventAdmin = z.infer<typeof eventAdminSchema>;

const listSchema = z.object({
  items: z.array(eventAdminSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

// ---- fetch helpers ----
export function fetchAdminEvents(params?: {
  from?: Date;
  to?: Date;
  clubId?: string;
  isDistrictEvent?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ items: EventAdmin[]; total: number; page: number; pageSize: number }> {
  const q = new URLSearchParams();
  if (params?.from) q.set('filter[from]', params.from.toISOString());
  if (params?.to) q.set('filter[to]', params.to.toISOString());
  if (params?.clubId) q.set('filter[clubId]', params.clubId);
  if (params?.isDistrictEvent !== undefined)
    q.set('filter[isDistrictEvent]', String(params.isDistrictEvent));
  if (params?.page) q.set('page', String(params.page));
  if (params?.pageSize) q.set('pageSize', String(params.pageSize));
  const qs = q.toString();
  return apiFetch(`/events${qs ? `?${qs}` : ''}`, { schema: listSchema });
}

export function createEvent(dto: {
  title: string;
  slug: string;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  isDistrictEvent: boolean;
  rsvpOpen?: boolean;
  capacity?: number | null;
}): Promise<EventAdmin> {
  return apiFetch('/events', {
    method: 'POST',
    body: JSON.stringify(dto),
    schema: eventAdminSchema,
  });
}

export function updateEvent(id: string, dto: Partial<{
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  description: string | null;
  coverUrl: string | null;
  isDistrictEvent: boolean;
  rsvpOpen: boolean;
  capacity: number | null;
}>): Promise<EventAdmin> {
  return apiFetch(`/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
    schema: eventAdminSchema,
  });
}

export function deleteEvent(id: string): Promise<void> {
  return apiFetch(`/events/${id}`, { method: 'DELETE', schema: z.undefined() });
}

export function rsvpEvent(id: string, status: 'going' | 'maybe' | 'not_going'): Promise<unknown> {
  return apiFetch(`/events/${id}/rsvp`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
    schema: z.unknown(),
  });
}
