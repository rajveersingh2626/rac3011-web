import { useCallback, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth';
import { ThemeProvider, type ThemePreference } from './theme';
import { ToastProvider } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';

export { useAuth, useMe } from './auth';
export { useTheme } from './theme';

export function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 } } });
}

function ThemeFromProfile({ children }: { children: ReactNode }) {
  const { me } = useAuth();
  const pref = me?.profile?.themePreference ?? me?.theme ?? null;
  const persist = useCallback(
    (p: ThemePreference) => {
      if (!me) return;
      void apiFetch('/me', { method: 'PATCH', body: { themePreference: p } }).catch(() => undefined);
    },
    [me],
  );
  return (
    <ThemeProvider profilePreference={pref} onPersist={persist}>
      {children}
    </ThemeProvider>
  );
}

export function Providers({ children, queryClient }: { children: ReactNode; queryClient?: QueryClient }) {
  const client = queryClient ?? createQueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ThemeFromProfile>
          <ToastProvider>{children}</ToastProvider>
        </ThemeFromProfile>
      </AuthProvider>
    </QueryClientProvider>
  );
}
