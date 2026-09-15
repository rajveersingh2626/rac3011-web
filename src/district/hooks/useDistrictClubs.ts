import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchClubs, type ClubSummary } from '@/lib/publicApi/clubs';
import { fetchZones } from '@/lib/publicApi/zones';
import { INITIAL_CLUBS, ZONE_ID_TO_NAME, type DistrictClub } from '../data/districtData';

// `zoneId` / `zoneName` / `presidentEmail` are not on the static `DistrictClub` roster; they
// only exist on records built from the portal API.
export type DistrictClubLive = DistrictClub & {
  zoneId?: string;
  zoneName?: string;
  presidentEmail?: string;
};

export const CLUBS_QUERY_KEY = ['public', 'clubs'] as const;
export const ZONES_QUERY_KEY = ['public', 'zones'] as const;

// Hardcoded table stays as the fallback layer: the API omits some ids the map still renders.
export function useZoneNames(): Record<string, string> {
  const { data } = useQuery({ queryKey: ZONES_QUERY_KEY, queryFn: fetchZones });
  return useMemo(() => {
    const items = data?.items ?? [];
    if (items.length === 0) return ZONE_ID_TO_NAME;
    return { ...ZONE_ID_TO_NAME, ...Object.fromEntries(items.map((z) => [z.id, z.name])) };
  }, [data]);
}

const norm = (s: string | null | undefined): string =>
  (s || '').toLowerCase().replace(/^(rotaract\s+(club\s+of\s+)?|rac\s+)/i, '').replace(/[^a-z0-9]/g, '');

function findStatic(api: ClubSummary): DistrictClub | undefined {
  const byId = INITIAL_CLUBS.find((c) => c.id === api.id);
  if (byId) return byId;
  const apiName = norm(api.name);
  const apiShort = norm(api.shortName);
  return INITIAL_CLUBS.find((c) => {
    const cName = norm(c.name);
    const cShort = norm(c.shortName);
    return (apiName && cName && apiName === cName) || (apiShort && cShort && apiShort === cShort);
  });
}

function toDistrictClub(api: ClubSummary, zoneNameById: Record<string, string>): DistrictClubLive {
  const s = findStatic(api);
  const zoneName = (api.zoneId && zoneNameById[api.zoneId]) || s?.zone || '';
  const charterYear = api.charterDate
    ? parseInt(api.charterDate.slice(0, 4), 10) || s?.charterYear
    : s?.charterYear;

  return {
    id: api.id,
    name: api.name,
    shortName: api.shortName || s?.shortName || api.name,
    zone: zoneName,
    zoneId: api.zoneId ?? undefined,
    zoneName,
    lat: api.lat != null && api.lat !== 0 ? api.lat : (s?.lat ?? 28.6139),
    lng: api.lng != null && api.lng !== 0 ? api.lng : (s?.lng ?? 77.2090),
    location: s?.location || 'Delhi NCR',
    address: api.meetingInfo || s?.address || '',
    president: api.president || s?.president || '',
    isDirector: s?.isDirector || '',
    phone: api.phone || s?.phone || '',
    email: api.email || s?.email || '',
    presidentEmail: api.email ?? undefined,
    rotaryId: api.rotaryId || s?.rotaryId || '',
    secretary: api.secretary || s?.secretary || '',
    secretaryEmail: api.secretaryEmail || s?.secretaryEmail || '',
    secretaryPhone: api.secretaryPhone || s?.secretaryPhone || '',
    initiatives: s?.initiatives ?? [],
    brief: s?.brief,
    charterYear,
    members: s?.members,
    memberCount: api.memberCount || s?.memberCount,
  };
}

// Shared key so DistrictApp and DistrictMap dedupe onto a single fetch.
export function useDistrictClubs(): { clubs: DistrictClubLive[]; isLive: boolean } {
  const zoneNameById = useZoneNames();
  const { data } = useQuery({ queryKey: CLUBS_QUERY_KEY, queryFn: () => fetchClubs() });

  return useMemo(() => {
    const rawItems = data?.items ?? [];
    const items = rawItems.filter((c) => c.id !== 'DISTRICT');
    if (items.length === 0) return { clubs: INITIAL_CLUBS as DistrictClubLive[], isLive: false };

    const mapById = new Map<string, DistrictClubLive>();

    for (const api of items) {
      const s = findStatic(api);
      const clubLive = toDistrictClub(api, zoneNameById);
      mapById.set(api.id, {
        ...(s || {}),
        ...clubLive,
      });
    }

    return { clubs: Array.from(mapById.values()), isLive: true };
  }, [data, zoneNameById]);
}
