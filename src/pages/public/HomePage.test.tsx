import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server, mswSetup } from '@/test/msw';
import { HomePage } from './HomePage';

mswSetup();

const HOME_BODY = {
  hero: { badge: 'District 3011', title: 'Service above self', subtitle: 'Delhi NCR', ctaPrimary: 'Explore', ctaSecondary: 'See showcase' },
  footerTagline: null,
  stats: { zones: 4, focusAreas: 7, foundedYear: 1968, ageRange: '18–30' },
  flagship: [{ title: 'Mahadan 9.0', summary: 'Blood donation drive.' }],
  latestProjects: [],
  visits: { year: 2026, count: 500 },
};

function renderHome() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => window.sessionStorage.clear());

describe('HomePage', () => {
  it('renders hero, stats and flagship content once loaded', async () => {
    server.use(http.get('/public/home', () => HttpResponse.json(HOME_BODY)), http.post('/public/visits', () => HttpResponse.json({ year: 2026, count: 501 })));
    renderHome();
    expect(await screen.findByText('Service above self')).toBeInTheDocument();
    expect(await screen.findByText('501')).toBeInTheDocument();
    expect(screen.getByText('Mahadan 9.0')).toBeInTheDocument();
  });

  it('shows a real empty state for the showcase teaser when there are no published projects', async () => {
    server.use(http.get('/public/home', () => HttpResponse.json(HOME_BODY)), http.post('/public/visits', () => HttpResponse.json({ year: 2026, count: 501 })));
    renderHome();
    expect(await screen.findByText('No published projects yet')).toBeInTheDocument();
  });

  it('shows an error state and can retry when the home endpoint fails', async () => {
    let calls = 0;
    server.use(
      http.get('/public/home', () => {
        calls += 1;
        return calls === 1 ? HttpResponse.json({ message: 'boom' }, { status: 500 }) : HttpResponse.json(HOME_BODY);
      }),
      http.post('/public/visits', () => HttpResponse.json({ year: 2026, count: 501 })),
    );
    renderHome();
    await waitFor(() => expect(screen.getByText("Couldn't load the home page")).toBeInTheDocument());
  });
});
