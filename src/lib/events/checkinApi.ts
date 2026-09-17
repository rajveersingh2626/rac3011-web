import { z } from 'zod';
import { apiFetch } from '@/lib/api';

export const checkinItemSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  memberId: z.string().nullable().optional(),
  walkInName: z.string().nullable().optional(),
  clubId: z.string(),
  method: z.enum(['qr', 'manual', 'walk_in']),
  checkedInAt: z.string(),
  alreadyCheckedIn: z.boolean().optional(),
  attendeeName: z.string().optional(),
  clubName: z.string().nullable().optional(),
  member: z
    .object({
      id: z.string(),
      fullName: z.string(),
      email: z.string(),
      photoUrl: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type CheckinItem = z.infer<typeof checkinItemSchema>;

export const clubAttendanceSchema = z.object({
  clubId: z.string(),
  clubName: z.string(),
  count: z.number(),
});

export type ClubAttendance = z.infer<typeof clubAttendanceSchema>;

export const checkinListResponseSchema = z.object({
  items: z.array(checkinItemSchema),
  byClub: z.array(clubAttendanceSchema),
});

export type CheckinListResponse = z.infer<typeof checkinListResponseSchema>;

export async function fetchEventCheckins(eventId: string): Promise<CheckinListResponse> {
  return apiFetch(`/events/${eventId}/checkins`, {
    schema: checkinListResponseSchema,
  });
}

export async function postEventCheckin(
  eventId: string,
  payload: { qrToken?: string; memberId?: string; walkInName?: string; clubId?: string },
): Promise<CheckinItem> {
  return apiFetch(`/events/${eventId}/checkins`, {
    method: 'POST',
    body: payload,
    schema: checkinItemSchema,
  });
}

export async function downloadCheckinCsv(eventId: string, filename = 'checkins.csv'): Promise<void> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/events/${eventId}/checkins/export-csv`, {
    headers,
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to export check-in CSV');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export const eventTicketSchema = z.object({
  token: z.string(),
  expiresAt: z.string(),
  event: z.object({
    id: z.string(),
    title: z.string(),
    startsAt: z.string(),
    location: z.string().nullable().optional(),
  }),
  member: z.object({
    id: z.string(),
    fullName: z.string(),
    clubId: z.string().optional(),
    clubName: z.string().optional(),
  }),
  googleWalletUrl: z.string().optional(),
  passObject: z.record(z.string(), z.unknown()).optional(),
});

export type EventTicket = z.infer<typeof eventTicketSchema>;

export async function fetchEventTicket(eventId: string): Promise<EventTicket> {
  return apiFetch(`/events/${eventId}/ticket`, {
    schema: eventTicketSchema,
  });
}

export const dispatchResultSchema = z.object({
  recipientCount: z.number(),
  dispatchedCount: z.number(),
});

export type DispatchResult = z.infer<typeof dispatchResultSchema>;

export async function dispatchCheckinTickets(
  eventId: string,
  payload: {
    audience: 'all_members' | 'presidents' | 'secretaries' | 'dac_members' | 'custom_emails';
    customEmails?: string[];
  },
): Promise<DispatchResult> {
  return apiFetch(`/events/${eventId}/checkin/dispatch-tickets`, {
    method: 'POST',
    body: payload,
    schema: dispatchResultSchema,
  });
}

