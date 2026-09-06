import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { announcementSchema, paginatedSchema, type Audience, type AnnouncementChannel } from './types';

const announcementsPage = paginatedSchema(announcementSchema);
const estimateSchema = z.object({ count: z.number() });

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

export async function fetchAnnouncementFeed(params: { page?: number; pageSize?: number } = {}) {
  const qs = query({ page: params.page, pageSize: params.pageSize });
  return apiFetch(`/announcements${qs}`, { schema: announcementsPage });
}

export async function estimateAudience(audience: Audience): Promise<number> {
  const res = await apiFetch('/announcements/audience/estimate', {
    method: 'POST',
    body: { audience },
    schema: estimateSchema,
  });
  return res.count;
}

export interface SendAnnouncementInput {
  title: string;
  body: string;
  audience: Audience;
  channels: AnnouncementChannel[];
}

export async function sendAnnouncement(input: SendAnnouncementInput) {
  return apiFetch('/announcements', {
    method: 'POST',
    body: input,
    schema: announcementSchema,
  });
}
