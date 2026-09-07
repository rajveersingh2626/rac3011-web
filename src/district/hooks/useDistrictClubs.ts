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

const norm = (s: string | null | undefined): string => (s || '').toLowerCase().trim();

function findStatic(api: ClubSummary): DistrictClub | undefined {
  const byId = INITIAL_CLUBS.find((c) => c.id === api.id);
  if (byId) return byId;
  const apiName = norm(api.name);
  const apiShort = norm(api.shortName);
  return INITIAL_CLUBS.find((c) => {
    const cName = norm(c.name);
    const cShort = norm(c.shortName);
    return (
      (apiName && cName && (apiName === cName || apiName.includes(cName) || cName.includes(apiName))) ||
      (apiShort && cShort && apiShort === cShort)
    );
  });
}

function toDistrictClub(api: ClubSummary, zoneNameById: Record<string, string>): DistrictClubLive {
  const s = findStatic(api);
  const zoneName = (api.zoneId && zoneNameById[api.zoneId]) || s?.zone || '';
  return {
    id: api.id,
    name: api.name,
    shortName: api.shortName || s?.shortName || api.name,
    zone: zoneName,
    zoneId: api.zoneId ?? undefined,
    zoneName,
    lat: api.lat ?? s?.lat ?? 0,
    lng: api.lng ?? s?.lng ?? 0,
    president: api.president || s?.president || '',
    isDirector: s?.isDirector || '',
    phone: api.phone || s?.phone || '',
    email: api.email || s?.email || '',
    presidentEmail: api.email ?? undefined,
    rotaryId: s?.rotaryId || '',
    secretary: s?.secretary || '',
    secretaryEmail: s?.secretaryEmail || '',
    secretaryPhone: s?.secretaryPhone || '',
    initiatives: s?.initiatives ?? [],
    brief: s?.brief,
    charterYear: s?.charterYear,
    members: s?.members,
    memberCount: api.memberCount || s?.memberCount,
  };
}

// Shared key so DistrictApp and DistrictMap dedupe onto a single fetch.
export function useDistrictClubs(): { clubs: DistrictClubLive[]; isLive: boolean } {
  const zoneNameById = useZoneNames();
  const { data } = useQuery({ queryKey: CLUBS_QUERY_KEY, queryFn: () => fetchClubs() });

  return useMemo(() => {
    const items = data?.items ?? [];
    if (items.length === 0) return { clubs: INITIAL_CLUBS as DistrictClubLive[], isLive: false };

    const mapById = new Map<string, DistrictClubLive>();

    for (const api of items) {
      const s = findStatic(api);
      const clubLive = toDistrictClub(api, zoneNameById);
      if (s) {
        mapById.set(s.id, {
          ...s,
          ...clubLive,
          lat: clubLive.lat !== 0 ? clubLive.lat : s.lat,
          lng: clubLive.lng !== 0 ? clubLive.lng : s.lng,
          president: clubLive.president || s.president,
          secretary: clubLive.secretary || s.secretary,
          phone: clubLive.phone || s.phone,
          email: clubLive.email || s.email,
        });
      } else {
        mapById.set(api.id, clubLive);
      }
    }

    return { clubs: Array.from(mapById.values()), isLive: true };
  }, [data, zoneNameById]);
}
