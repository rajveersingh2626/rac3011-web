import { http, HttpResponse } from 'msw';
import { server, mswSetup } from '@/test/msw';
import { ApiError } from '@/lib/api';
import {
  RATE_LIMITED_MESSAGE,
  createDrrBookingSchema,
  decideDrrBooking,
  drrBookingErrorMessage,
  fetchDrrBookingByReference,
  fetchDrrBookings,
  postDrrBooking,
  type CreateDrrBookingInput,
} from './drrBookings';

mswSetup();

const input: CreateDrrBookingInput = {
  purpose: 'installation',
  clubId: 'c1',
  requesterName: 'Rtr. Test President',
  requesterEmail: 'president@club.org',
  requesterPhone: '+91 98765 43210',
  startsAt: '2026-10-04T05:30:00.000Z',
  endsAt: '2026-10-04T08:30:00.000Z',
  notes: 'Venue: India Habitat Centre',
};

const adminBooking = {
  id: 'b1',
  reference: 'DRR-2610-ABCD',
  purpose: 'installation',
  clubId: 'c1',
  requesterName: 'Rtr. Test President',
  requesterEmail: 'president@club.org',
  requesterPhone: '+91 98765 43210',
  startsAt: '2026-10-04T05:30:00.000Z',
  endsAt: '2026-10-04T08:30:00.000Z',
  notes: null,
  status: 'requested',
  decisionReason: null,
  decidedById: null,
  decidedAt: null,
  createdAt: '2026-09-06T05:00:00.000Z',
  updatedAt: '2026-09-06T05:00:00.000Z',
};

describe('createDrrBookingSchema', () => {
  it('accepts a payload matching the API DTO', () => {
    expect(createDrrBookingSchema.safeParse(input).success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const res = createDrrBookingSchema.safeParse({ ...input, requesterEmail: 'nope' });
    expect(res.success).toBe(false);
  });
});

describe('postDrrBooking', () => {
  it('posts the payload including the honeypot and returns the server reference and status', async () => {
    let body: unknown;
    server.use(
      http.post('/public/drr-bookings', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ received: true, reference: 'DRR-2610-ABCD', status: 'requested' });
      }),
    );

    const res = await postDrrBooking({ ...input, website: '' });
    expect(res).toEqual({ received: true, reference: 'DRR-2610-ABCD', status: 'requested' });
    expect(body).toMatchObject({ purpose: 'installation', clubId: 'c1', website: '' });
  });

  it('accepts the honeypot response that carries no reference', async () => {
    server.use(http.post('/public/drr-bookings', () => HttpResponse.json({ received: true, reference: null })));
    const res = await postDrrBooking(input);
    expect(res.reference).toBeNull();
    expect(res.status).toBeUndefined();
  });

  it('throws an ApiError carrying the 429 status when rate limited', async () => {
    server.use(
      http.post('/public/drr-bookings', () =>
        HttpResponse.json({ message: 'ThrottlerException: Too Many Requests' }, { status: 429 }),
      ),
    );
    await expect(postDrrBooking(input)).rejects.toMatchObject({ status: 429 });
  });

  it('throws when the response shape does not match', async () => {
    server.use(http.post('/public/drr-bookings', () => HttpResponse.json({ ok: 1 })));
    await expect(postDrrBooking(input)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('drrBookingErrorMessage', () => {
  it('maps 429 to the rate-limit message', () => {
    expect(drrBookingErrorMessage(new ApiError(429, 'Too Many Requests'))).toBe(RATE_LIMITED_MESSAGE);
  });

  it('surfaces the server message on a 400', () => {
    expect(drrBookingErrorMessage(new ApiError(400, 'Unknown club'))).toBe('Unknown club');
  });

  it('falls back to a generic message for anything else', () => {
    expect(drrBookingErrorMessage(new ApiError(500, 'boom'))).toContain('could not file your request');
    expect(drrBookingErrorMessage(new Error('offline'))).toContain('could not file your request');
  });
});

describe('fetchDrrBookingByReference', () => {
  it('reads the trimmed public booking', async () => {
    server.use(
      http.get('/public/drr-bookings/DRR-2610-ABCD', () =>
        HttpResponse.json({
          reference: 'DRR-2610-ABCD',
          purpose: 'installation',
          clubId: 'c1',
          requesterName: 'Rtr. Test President',
          startsAt: '2026-10-04T05:30:00.000Z',
          endsAt: '2026-10-04T08:30:00.000Z',
          notes: null,
          status: 'confirmed',
          decisionReason: null,
          decidedAt: '2026-09-07T05:00:00.000Z',
          createdAt: '2026-09-06T05:00:00.000Z',
        }),
      ),
    );
    const booking = await fetchDrrBookingByReference('DRR-2610-ABCD');
    expect(booking.status).toBe('confirmed');
  });
});

describe('fetchDrrBookings', () => {
  it('sends filters in the bracketed form the API list-query parser expects', async () => {
    let url = '';
    server.use(
      http.get('/drr-bookings', ({ request }) => {
        url = new URL(request.url).search;
        return HttpResponse.json({ items: [adminBooking], total: 1, page: 1, pageSize: 20 });
      }),
    );

    const page = await fetchDrrBookings({ status: 'requested', clubId: 'c1', page: 1, pageSize: 20 });
    expect(url).toContain('filter%5Bstatus%5D=requested');
    expect(url).toContain('filter%5BclubId%5D=c1');
    expect(url).toContain('page=1');
    expect(page.items[0].id).toBe('b1');
  });
});

describe('decideDrrBooking', () => {
  it('patches the officer decision and returns the updated booking', async () => {
    let body: unknown;
    server.use(
      http.patch('/drr-bookings/b1', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ...adminBooking, status: 'declined', decisionReason: 'Clash with DISCON' });
      }),
    );

    const res = await decideDrrBooking('b1', { status: 'declined', decisionReason: 'Clash with DISCON' });
    expect(body).toEqual({ status: 'declined', decisionReason: 'Clash with DISCON' });
    expect(res.status).toBe('declined');
  });
});
