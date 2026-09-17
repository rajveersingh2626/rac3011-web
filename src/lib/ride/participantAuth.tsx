import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/lib/api';

export interface ParticipantUser {
  id: string;
  ryYear: number;
  edition: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  rotaryId?: string | null;
  homeDistrict: string;
  homeClubName: string;
  cityState?: string;
  country?: string;
  clubDesignation?: string | null;
  dietaryPref?: string | null;
  arrivalMode?: string | null;
  status: string;
  approvalStatus: string;
  dossierStatus: string;
  dossierData?: any;
  isActive: boolean;
  hostClub?: {
    id: string;
    name: string;
    zone?: string;
  } | null;
  hostFamilyName?: string | null;
  hostFamilyPhone?: string | null;
  hostAddress?: string | null;
}

interface ParticipantAuthContextValue {
  participant: ParticipantUser | null;
  status: 'loading' | 'anonymous' | 'authenticated';
  login: (identifier: string, password: string) => Promise<ParticipantUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<ParticipantUser | null>;
}

const ParticipantAuthContext = createContext<ParticipantAuthContextValue | null>(null);
export const PARTICIPANT_ME_QUERY_KEY = ['ride-participant-me'] as const;

async function fetchParticipantMe(): Promise<ParticipantUser | null> {
  try {
    const res = await apiFetch<{ participant: ParticipantUser }>('/ride/auth/me');
    return res?.participant ?? null;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return null;
    }
    return null;
  }
}

export function ParticipantAuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: PARTICIPANT_ME_QUERY_KEY,
    queryFn: fetchParticipantMe,
    staleTime: 60_000,
    retry: false,
  });

  const participant = query.data ?? null;

  const refresh = useCallback(async () => {
    return qc.fetchQuery({
      queryKey: PARTICIPANT_ME_QUERY_KEY,
      queryFn: fetchParticipantMe,
      staleTime: 0,
    });
  }, [qc]);

  const login = useCallback(
    async (identifier: string, password: string): Promise<ParticipantUser> => {
      const res = await apiFetch<{ participant: ParticipantUser; token: string }>('/ride/auth/login', {
        method: 'POST',
        body: { identifier, password },
      });

      qc.setQueryData(PARTICIPANT_ME_QUERY_KEY, res.participant);
      return res.participant;
    },
    [qc],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch('/ride/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    qc.setQueryData(PARTICIPANT_ME_QUERY_KEY, null);
  }, [qc]);

  const value = useMemo<ParticipantAuthContextValue>(
    () => ({
      participant,
      status: query.isPending ? 'loading' : participant ? 'authenticated' : 'anonymous',
      login,
      logout,
      refresh,
    }),
    [participant, query.isPending, login, logout, refresh],
  );

  return <ParticipantAuthContext.Provider value={value}>{children}</ParticipantAuthContext.Provider>;
}

export function useParticipantAuth(): ParticipantAuthContextValue {
  const ctx = useContext(ParticipantAuthContext);
  if (!ctx) {
    throw new Error('useParticipantAuth must be used within ParticipantAuthProvider');
  }
  return ctx;
}
