import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { fetchClubs, type ClubSummary } from '@/lib/publicApi/clubs';
import { fetchZones, type ZoneSummary } from '@/lib/publicApi/zones';
import { INITIAL_CLUBS, ZONE_ID_TO_NAME } from '../data/districtData';
import { CLUBS_QUERY_KEY, ZONES_QUERY_KEY, useDistrictClubs, useZoneNames } from './useDistrictClubs';

vi.mock('@/lib/publicApi/clubs', () => ({ fetchClubs: vi.fn() }));
vi.mock('@/lib/publicApi/zones', () => ({ fetchZones: vi.fn() }));

const mockFetchClubs = vi.mocked(fetchClubs);
const mockFetchZones = vi.mocked(fetchZones);

// Real ids from the hardcoded table, so the "API overrides hardcoded" case is exercised on a live key.
const PRITHVI_ID = 'cmtn8hw19001ill1sl3gxhvjc';
const AGNI_ID = 'cmtn8hw17001hll1sgpqjgrai';

function apiClub(overrides: Partial<ClubSummary> = {}): ClubSummary {
  return {
    id: 'c1',
    name: 'API Club',
    shortName: 'API',
    slug: 'api-club',
    zoneId: null,
    lat: null,
    lng: null,
    president: null,
    phone: null,
    email: null,
    logoUrl: null,
    memberCount: 0,
    ...overrides,
  };
}

function zone(id: string, name: string, order = 1): ZoneSummary {
  return { id, name, order };
}

function newClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

// Queries start undefined, so settle the cache before asserting on the fallback branches.
async function settled(client: QueryClient, key: readonly unknown[]) {
  await waitFor(() => {
    const status = client.getQueryState(key)?.status;
    expect(status === 'success' || status === 'error').toBe(true);
  });
}

beforeEach(() => {
  mockFetchClubs.mockResolvedValue({ items: [], total: 0 });
  mockFetchZones.mockResolvedValue({ items: [] });
});

describe('useZoneNames', () => {
  it('spreads API zone names over the hardcoded table', async () => {
    mockFetchZones.mockResolvedValue({ items: [zone(PRITHVI_ID, 'Zone Prithvi (API)'), zone('z-new', 'Zone New')] });
    const client = newClient();
    const { result } = renderHook(() => useZoneNames(), { wrapper: wrapper(client) });
    await settled(client, ZONES_QUERY_KEY);

    await waitFor(() => expect(result.current[PRITHVI_ID]).toBe('Zone Prithvi (API)'));
    expect(result.current['z-new']).toBe('Zone New');
    // Hardcoded-only ids must survive the merge.
    expect(result.current[AGNI_ID]).toBe(ZONE_ID_TO_NAME[AGNI_ID]);
  });

  it('returns the hardcoded table unchanged when the API returns no zones', async () => {
    const client = newClient();
    const { result } = renderHook(() => useZoneNames(), { wrapper: wrapper(client) });
    await settled(client, ZONES_QUERY_KEY);

    expect(result.current).toEqual(ZONE_ID_TO_NAME);
  });

  it('returns the hardcoded table unchanged when the zones query fails', async () => {
    mockFetchZones.mockRejectedValue(new Error('zones down'));
    const client = newClient();
    const { result } = renderHook(() => useZoneNames(), { wrapper: wrapper(client) });
    await settled(client, ZONES_QUERY_KEY);

    expect(result.current).toEqual(ZONE_ID_TO_NAME);
  });
});

describe('useDistrictClubs', () => {
  it('prefers API fields over the matching static club and reports isLive', async () => {
    mockFetchClubs.mockResolvedValue({
      items: [
        apiClub({
          id: 'c1',
          name: 'Rotaract Club of CVS (renamed)',
          shortName: 'CVS Live',
          lat: 1.5,
          lng: 2.5,
          president: 'Rtr. Live President',
          phone: '9999999999',
          email: 'live@example.com',
          memberCount: 42,
        }),
      ],
      total: 1,
    });
    const client = newClient();
    const { result } = renderHook(() => useDistrictClubs(), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current.isLive).toBe(true));

    expect(result.current.clubs).toHaveLength(1);
    expect(result.current.clubs[0]).toMatchObject({
      id: 'c1',
      name: 'Rotaract Club of CVS (renamed)',
      shortName: 'CVS Live',
      lat: 1.5,
      lng: 2.5,
      president: 'Rtr. Live President',
      phone: '9999999999',
      email: 'live@example.com',
      presidentEmail: 'live@example.com',
      memberCount: 42,
    });
  });

  it('fills the fields the API does not expose from the matched static club', async () => {
    const staticClub = INITIAL_CLUBS.find((c) => c.id === 'c1')!;
    mockFetchClubs.mockResolvedValue({ items: [apiClub({ id: 'c1' })], total: 1 });
    const client = newClient();
    const { result } = renderHook(() => useDistrictClubs(), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current.isLive).toBe(true));

    expect(result.current.clubs[0]).toMatchObject({
      rotaryId: staticClub.rotaryId,
      secretary: staticClub.secretary,
      secretaryEmail: staticClub.secretaryEmail,
      secretaryPhone: staticClub.secretaryPhone,
      isDirector: staticClub.isDirector,
      initiatives: staticClub.initiatives,
    });
    expect(result.current.clubs[0].brief).toBe(staticClub.brief);
    expect(result.current.clubs[0].charterYear).toBe(staticClub.charterYear);
    expect(result.current.clubs[0].rotaryId).not.toBe('');
  });

  it('matches a static club by name when the API id is unknown', async () => {
    const staticClub = INITIAL_CLUBS.find((c) => c.id === 'c1')!;
    mockFetchClubs.mockResolvedValue({
      items: [apiClub({ id: 'unknown-id-999', name: staticClub.name })],
      total: 1,
    });
    const client = newClient();
    const { result } = renderHook(() => useDistrictClubs(), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current.isLive).toBe(true));

    expect(result.current.clubs[0].id).toBe('unknown-id-999');
    expect(result.current.clubs[0].rotaryId).toBe(staticClub.rotaryId);
    expect(result.current.clubs[0].secretary).toBe(staticClub.secretary);
  });

  it('falls back to the full static roster when the API returns zero clubs', async () => {
    const client = newClient();
    const { result } = renderHook(() => useDistrictClubs(), { wrapper: wrapper(client) });
    await settled(client, CLUBS_QUERY_KEY);

    expect(result.current.isLive).toBe(false);
    expect(result.current.clubs).toEqual(INITIAL_CLUBS);
  });

  it('falls back to the full static roster when the clubs query fails', async () => {
    mockFetchClubs.mockRejectedValue(new Error('clubs down'));
    const client = newClient();
    const { result } = renderHook(() => useDistrictClubs(), { wrapper: wrapper(client) });
    await settled(client, CLUBS_QUERY_KEY);

    expect(result.current.isLive).toBe(false);
    expect(result.current.clubs).toEqual(INITIAL_CLUBS);
  });

  it('resolves zone from the API zone name when zoneId is known', async () => {
    mockFetchZones.mockResolvedValue({ items: [zone(PRITHVI_ID, 'Zone Prithvi (API)')] });
    mockFetchClubs.mockResolvedValue({ items: [apiClub({ id: 'c1', zoneId: PRITHVI_ID })], total: 1 });
    const client = newClient();
    const { result } = renderHook(() => useDistrictClubs(), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.clubs[0]?.zone).toBe('Zone Prithvi (API)'));
    expect(result.current.clubs[0].zoneId).toBe(PRITHVI_ID);
    expect(result.current.clubs[0].zoneName).toBe('Zone Prithvi (API)');
  });

  it('falls back to the static zone string when zoneId is missing or unknown', async () => {
    const staticClub = INITIAL_CLUBS.find((c) => c.id === 'c1')!;
    mockFetchClubs.mockResolvedValue({
      items: [apiClub({ id: 'c1', zoneId: null }), apiClub({ id: 'c1', zoneId: 'not-a-zone' })],
      total: 2,
    });
    const client = newClient();
    const { result } = renderHook(() => useDistrictClubs(), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current.isLive).toBe(true));

    expect(result.current.clubs[0].zone).toBe(staticClub.zone);
    expect(result.current.clubs[0].zoneId).toBeUndefined();
    expect(result.current.clubs[1].zone).toBe(staticClub.zone);
  });
});
