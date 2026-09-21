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
  publishAsAnnouncement?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
}

export async function dispatchRideBroadcast(payload: DispatchBroadcastPayload): Promise<DispatchBroadcastResult> {
  return apiFetch('/ride/participants/broadcast', {
    method: 'POST',
    body: payload,
    schema: dispatchBroadcastResultSchema,
  });
}
