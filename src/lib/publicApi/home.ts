import { useEffect } from 'react';
import { z } from 'zod';
import { useQueryClient, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { projectSummarySchema } from './showcase';

const flagshipItemSchema = z.object({ title: z.string(), summary: z.string() }).catch({ title: '', summary: '' });

const homeSchema = z.object({
  hero: z.object({
    badge: z.string().nullable(),
    title: z.string().nullable(),
    subtitle: z.string().nullable(),
    ctaPrimary: z.string().nullable(),
    ctaSecondary: z.string().nullable(),
  }),
  footerTagline: z.string().nullable(),
  stats: z.object({ zones: z.number(), focusAreas: z.number(), foundedYear: z.number(), ageRange: z.string() }),
  flagship: z.array(flagshipItemSchema).catch([]),
  latestProjects: z.array(projectSummarySchema),
  visits: z.object({ year: z.number(), count: z.number() }),
});
export type Home = z.infer<typeof homeSchema>;

const visitSchema = z.object({ year: z.number(), count: z.number() });

export const HOME_QUERY_KEY = ['public', 'home'] as const;

export function fetchHome(): Promise<Home> {
  return apiFetch('/public/home', { schema: homeSchema });
}

export function useHomeQuery(): UseQueryResult<Home> {
  return useQuery({ queryKey: HOME_QUERY_KEY, queryFn: fetchHome });
}

const VISIT_SESSION_KEY = 'rac3011.visitCounted';

export function useVisitOnce(): void {
  const qc = useQueryClient();
  useEffect(() => {
    if (window.sessionStorage.getItem(VISIT_SESSION_KEY)) return;
    window.sessionStorage.setItem(VISIT_SESSION_KEY, '1');
    void apiFetch('/public/visits', { method: 'POST', schema: visitSchema })
      .then((visits) => {
        qc.setQueryData<Home>(HOME_QUERY_KEY, (old) => (old ? { ...old, visits } : old));
      })
      .catch(() => {
        window.sessionStorage.removeItem(VISIT_SESSION_KEY);
      });
  }, [qc]);
}
