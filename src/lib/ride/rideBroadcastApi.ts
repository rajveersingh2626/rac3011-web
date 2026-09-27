import { z } from 'zod';
import { apiFetch } from '@/lib/api';

export const dispatchBroadcastResultSchema = z.object({
  recipientCount: z.number(),
  dispatchedCount: z.number(),
});

export type DispatchBroadcastResult = z.infer<typeof dispatchBroadcastResultSchema>;

export interface DispatchBroadcastPayload {
  subject: string;
  body: string;
  districtNumbers?: string[];
  hostClubsOnly?: boolean;
  all?: boolean;
  customEmails?: string[];
  cc?: string[];
  saveCcAsDefault?: boolean;
  publishAsAnnouncement?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
}

export async function fetchRideEmailSettings(): Promise<{ defaultCc: string[] }> {
  try {
    return await apiFetch<{ defaultCc: string[] }>('/ride/participants/settings/email');
  } catch {
    return { defaultCc: [] };
  }
}

export async function updateRideEmailSettings(defaultCc: string[]): Promise<{ defaultCc: string[] }> {
  return apiFetch<{ defaultCc: string[] }>('/ride/participants/settings/email', {
    method: 'PUT',
    body: { defaultCc },
  });
}

export async function dispatchRideBroadcast(payload: DispatchBroadcastPayload): Promise<DispatchBroadcastResult> {
  return apiFetch('/ride/participants/broadcast', {
    method: 'POST',
    body: payload,
    schema: dispatchBroadcastResultSchema,
  });
}
