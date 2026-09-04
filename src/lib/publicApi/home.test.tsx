import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { server, mswSetup } from '@/test/msw';
import { HOME_QUERY_KEY, useHomeQuery, useVisitOnce } from './home';

mswSetup();

const HOME_BODY = {
  hero: { badge: 'District 3011', title: 'Title', subtitle: null, ctaPrimary: null, ctaSecondary: null },
  footerTagline: null,
  stats: { zones: 4, focusAreas: 7, foundedYear: 1968, ageRange: '18–30' },
  flagship: [],
  latestProjects: [],
  visits: { year: 2026, count: 100 },
};

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => window.sessionStorage.clear());

describe('useHomeQuery', () => {
  it('fetches and validates the home payload', async () => {
    server.use(http.get('/public/home', () => HttpResponse.json(HOME_BODY)));
    const client = new QueryClient();
    const { result } = renderHook(() => useHomeQuery(), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.visits).toEqual({ year: 2026, count: 100 });
  });
});

describe('useVisitOnce', () => {
  it('posts once per session and merges the returned count into the cached home query', async () => {
    server.use(
      http.get('/public/home', () => HttpResponse.json(HOME_BODY)),
      http.post('/public/visits', () => HttpResponse.json({ year: 2026, count: 101 })),
    );
    const client = new QueryClient();
    client.setQueryData(HOME_QUERY_KEY, HOME_BODY);
    renderHook(() => useVisitOnce(), { wrapper: wrapper(client) });
    await waitFor(() => expect(client.getQueryData(HOME_QUERY_KEY)).toEqual({ ...HOME_BODY, visits: { year: 2026, count: 101 } }));
    expect(window.sessionStorage.getItem('rac3011.visitCounted')).toBe('1');
  });

  it('does not post a second time within the same session', async () => {
    let calls = 0;
    server.use(
      http.post('/public/visits', () => {
        calls += 1;
        return HttpResponse.json({ year: 2026, count: 101 });
      }),
    );
    window.sessionStorage.setItem('rac3011.visitCounted', '1');
    const client = new QueryClient();
    renderHook(() => useVisitOnce(), { wrapper: wrapper(client) });
    await new Promise((r) => setTimeout(r, 10));
    expect(calls).toBe(0);
  });
});
