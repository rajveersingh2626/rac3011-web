import { z } from 'zod';
import { ApiError, apiFetch } from '@/lib/api';

export const BOOKING_PURPOSES = ['installation', 'club_event', 'meeting'] as const;
export const bookingPurposeSchema = z.enum(BOOKING_PURPOSES);
export type BookingPurpose = z.infer<typeof bookingPurposeSchema>;

export const BOOKING_STATUSES = ['requested', 'held', 'confirmed', 'declined', 'cancelled'] as const;
export const bookingStatusSchema = z.enum(BOOKING_STATUSES);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

export const BOOKING_DECISIONS = ['confirmed', 'declined'] as const;
export const bookingDecisionSchema = z.enum(BOOKING_DECISIONS);
export type BookingDecision = z.infer<typeof bookingDecisionSchema>;

export const createDrrBookingSchema = z.object({
  purpose: bookingPurposeSchema,
  clubId: z.string().trim().min(1).max(64).optional(),
  requesterName: z.string().trim().min(1, 'Enter the requester name').max(200),
  requesterEmail: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address'),
  requesterPhone: z.string().trim().min(5, 'Enter a contact number').max(32),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  notes: z.string().trim().max(2000).optional(),
  website: z.string().max(200).optional(),
});
export type CreateDrrBookingInput = z.infer<typeof createDrrBookingSchema>;

// `reference` is null and `status` absent when the honeypot tripped: the server pretends it accepted.
const submitResponseSchema = z.object({
  received: z.boolean(),
  reference: z.string().nullable(),
  status: bookingStatusSchema.optional(),
});
export type DrrBookingSubmitResponse = z.infer<typeof submitResponseSchema>;

export const publicDrrBookingSchema = z.object({
  reference: z.string(),
  purpose: bookingPurposeSchema,
  clubId: z.string().nullable(),
  requesterName: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  notes: z.string().nullable(),
  status: bookingStatusSchema,
  decisionReason: z.string().nullable(),
  decidedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type PublicDrrBooking = z.infer<typeof publicDrrBookingSchema>;

export const drrBookingSchema = publicDrrBookingSchema.extend({
  id: z.string(),
  requesterEmail: z.string(),
  requesterPhone: z.string(),
  decidedById: z.string().nullable(),
  updatedAt: z.string(),
});
export type DrrBooking = z.infer<typeof drrBookingSchema>;

const drrBookingPageSchema = z.object({
  items: z.array(drrBookingSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export type DrrBookingPage = z.infer<typeof drrBookingPageSchema>;

export const RATE_LIMITED_MESSAGE =
  'You have sent too many DRR presence requests in the past hour. Please wait a while and try again, or email the district secretariat.';

export function drrBookingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return RATE_LIMITED_MESSAGE;
    if (error.status === 400) return error.message || 'Some details were rejected. Check the form and try again.';
  }
  return 'We could not file your request just now. Please try again in a moment.';
}

export function postDrrBooking(input: CreateDrrBookingInput): Promise<DrrBookingSubmitResponse> {
  return apiFetch('/public/drr-bookings', { method: 'POST', body: input, schema: submitResponseSchema });
}

export function fetchDrrBookingByReference(reference: string): Promise<PublicDrrBooking> {
  return apiFetch(`/public/drr-bookings/${encodeURIComponent(reference)}`, { schema: publicDrrBookingSchema });
}

export interface DrrBookingListParams {
  status?: BookingStatus;
  clubId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

// The API's list-query parser only reads bracketed filter keys, so plain `?status=` is rejected.
function listQuery(params: DrrBookingListParams): string {
  const search = new URLSearchParams();
  for (const key of ['status', 'clubId', 'from', 'to'] as const) {
    const value = params[key];
    if (value) search.set(`filter[${key}]`, value);
  }
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('pageSize', String(params.pageSize));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function fetchDrrBookings(params: DrrBookingListParams = {}): Promise<DrrBookingPage> {
  return apiFetch(`/drr-bookings${listQuery(params)}`, { schema: drrBookingPageSchema });
}

export function fetchDrrBooking(id: string): Promise<DrrBooking> {
  return apiFetch(`/drr-bookings/${encodeURIComponent(id)}`, { schema: drrBookingSchema });
}

export interface DecideDrrBookingInput {
  status: BookingDecision;
  decisionReason?: string;
}

export function decideDrrBooking(id: string, input: DecideDrrBookingInput): Promise<DrrBooking> {
  return apiFetch(`/drr-bookings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: input,
    schema: drrBookingSchema,
  });
}
