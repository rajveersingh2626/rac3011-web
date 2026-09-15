import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError, onUnauthorized } from '@/lib/api';
import { meSchema, type Me, type Scope } from '@/lib/me';
import { can as canFn } from '@/lib/permissions';

interface AuthContextValue {
  me: Me | null;
  status: 'loading' | 'anonymous' | 'authenticated';
  can: (key: string, scope?: Scope) => boolean;
  refresh: () => Promise<Me | null>;
  signOut: () => Promise<void>;
  sessionExpiresAt: string | null;
  remainingSeconds: number;
  formattedRemaining: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);
export const ME_QUERY_KEY = ['me'] as const;

export async function fetchMe(): Promise<Me | null> {
  try {
    return await apiFetch('/me', { schema: meSchema });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
}

const DEFAULT_SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [cleared, setCleared] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const query = useQuery({ queryKey: ME_QUERY_KEY, queryFn: fetchMe, staleTime: 60_000, retry: false });

  useEffect(
    () =>
      onUnauthorized(() => {
        setCleared(true);
        qc.setQueryData(ME_QUERY_KEY, null);
      }),
    [qc],
  );

  const me = cleared && query.data === undefined ? null : (query.data ?? null);

  // Derive expiration timestamp (from backend or fallback to 30 min from login discovery)
  const sessionExpiry = useMemo(() => {
    if (!me) return null;
    if (me.session?.expiresAt) {
      const parsed = new Date(me.session.expiresAt).getTime();
      if (!Number.isNaN(parsed)) return parsed;
    }
    return Date.now() + DEFAULT_SESSION_DURATION_MS;
  }, [me?.session?.expiresAt, me?.user?.id]);

  const refresh = useCallback(async () => {
    setCleared(false);
    const res = await qc.fetchQuery({ queryKey: ME_QUERY_KEY, queryFn: fetchMe, staleTime: 0 });
    return res;
  }, [qc]);

  const signOut = useCallback(async () => {
    await apiFetch('/auth/sign-out', { method: 'POST' }).catch(() => undefined);
    qc.setQueryData(ME_QUERY_KEY, null);
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
  }, [qc]);

  // Dynamic ticker for remaining session seconds
  useEffect(() => {
    if (!me || !sessionExpiry) return;
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (sessionExpiry - current <= 0) {
        clearInterval(interval);
        void signOut().then(() => {
          if (window.location.pathname.startsWith('/portal') && window.location.pathname !== '/portal/login') {
            window.location.href = '/portal/login?reason=expired';
          }
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [me, sessionExpiry, signOut]);

  const remainingSeconds = sessionExpiry ? Math.max(0, Math.floor((sessionExpiry - now) / 1000)) : 0;
  const remMinutes = Math.floor(remainingSeconds / 60);
  const remSecs = remainingSeconds % 60;
  const formattedRemaining = `${remMinutes}m ${remSecs < 10 ? '0' : ''}${remSecs}s`;

  const value = useMemo<AuthContextValue>(
    () => ({
      me,
      status: query.isPending && !cleared ? 'loading' : me ? 'authenticated' : 'anonymous',
      can: (key, scope) => canFn(me, key, scope),
      refresh,
      signOut,
      sessionExpiresAt: sessionExpiry ? new Date(sessionExpiry).toISOString() : null,
      remainingSeconds,
      formattedRemaining,
    }),
    [me, query.isPending, cleared, refresh, signOut, sessionExpiry, remainingSeconds, formattedRemaining],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useMe(): Me | null {
  return useAuth().me;
}
