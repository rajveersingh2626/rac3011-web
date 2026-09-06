import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server, mswSetup } from '@/test/msw';
import ClubInitiativesList from './ClubInitiativesList';

mswSetup();

const PROJECT = {
  id: 'p1',
  slug: 'clean-water-drive',
  title: 'Clean Water Drive',
  summary: 'RO plants installed in two government schools.',
  category: 'community-service',
  date: '2026-07-12T00:00:00.000Z',
  photos: [],
  leadClub: { id: 'club-1', name: 'Rotaract Club of Delhi South', shortName: 'Delhi South', slug: 'delhi-south' },
};

function list(items: unknown[]) {
  return http.get('*/public/projects', () => HttpResponse.json({ items, total: items.length, page: 1, pageSize: 50 }));
}

function detail(body: Record<string, unknown>) {
  return http.get('*/public/projects/:slug', () =>
    HttpResponse.json({ ...PROJECT, body: null, beneficiaries: null, clubs: [], publishedAt: null, ...body })
  );
}

function renderList() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ClubInitiativesList />
    </QueryClientProvider>
  );
}

describe('ClubInitiativesList', () => {
  it('renders no beneficiary figure on a card when the API sends none', async () => {
    server.use(list([PROJECT]));
    renderList();
    await screen.findByText('Clean Water Drive');
    expect(screen.queryByText(/Beneficiaries/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Lives Touched/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/500\+/)).not.toBeInTheDocument();
  });

  it('renders no impact reach in the modal when the detail endpoint has no beneficiaries', async () => {
    server.use(list([PROJECT]), detail({ body: 'Two RO plants commissioned.' }));
    renderList();
    await userEvent.click(await screen.findByText('Clean Water Drive'));
    await screen.findByText('Two RO plants commissioned.');
    expect(screen.queryByText(/Total Impact Reach/i)).not.toBeInTheDocument();
  });

  it('renders the impact reach only when the detail endpoint returns a real number', async () => {
    server.use(list([PROJECT]), detail({ beneficiaries: 320 }));
    renderList();
    await userEvent.click(await screen.findByText('Clean Water Drive'));
    await waitFor(() => expect(screen.getByText(/Total Impact Reach/i)).toBeInTheDocument());
    expect(screen.getByText('320')).toBeInTheDocument();
  });

  it('shows an empty state instead of fallback projects when the API returns nothing', async () => {
    server.use(list([]));
    renderList();
    await screen.findByText('No published projects to show yet');
    expect(screen.queryByText(/Mahadaan/i)).not.toBeInTheDocument();
    expect(screen.getByText('0 Projects Displayed')).toBeInTheDocument();
  });

  it('takes the zone pill from the live club roster, not from a hardcoded default', async () => {
    server.use(list([PROJECT]));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ClubInitiativesList
          clubs={[{ id: 'club-1', zone: 'Zone Agni' } as never]}
        />
      </QueryClientProvider>
    );
    expect(await screen.findByText('Zone Agni')).toBeInTheDocument();
  });
});
