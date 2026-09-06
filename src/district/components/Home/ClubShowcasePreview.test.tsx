import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server, mswSetup } from '@/test/msw';
import ClubShowcasePreview from './ClubShowcasePreview';

mswSetup();

const PROJECT = {
  id: 'p1',
  slug: 'saanjh-conversations-that-heal',
  title: 'Saanjh — Conversations That Heal',
  summary: 'A mental health programme creating a safe space for awareness and healing.',
  category: 'health',
  date: '2026-08-15',
  photos: [],
  leadClub: { id: 'c20', name: 'Rotaract Club of Delhi Dynamic Leaders', shortName: 'Delhi Dynamic Leaders', slug: 'delhi-dynamic-leaders' },
};

function list(items: unknown[]) {
  return http.get('*/public/projects', () => HttpResponse.json({ items, total: items.length, page: 1, pageSize: 3 }));
}

function renderPreview(onOpenShowcase?: () => void) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ClubShowcasePreview onOpenShowcase={onOpenShowcase} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ClubShowcasePreview', () => {
  it('renders the projects the API returns, linking each card to its showcase page', async () => {
    server.use(list([PROJECT, { ...PROJECT, id: 'p2', slug: 'unnati-waste-paper-to-notebooks', title: 'Unnati — Waste Paper to Notebooks', category: 'education' }]));
    renderPreview();

    const card = await screen.findByRole('link', { name: /Saanjh — Conversations That Heal/ });
    expect(card).toHaveAttribute('href', '/showcase/saanjh-conversations-that-heal');
    expect(screen.getAllByText('Rotaract Club of Delhi Dynamic Leaders')).toHaveLength(2);
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getAllByText(/A mental health programme/)).toHaveLength(2);
  });

  it('renders a card without a link, club or summary when the API omits them', async () => {
    server.use(list([{ ...PROJECT, slug: null, summary: null, leadClub: null }]));
    renderPreview();

    await screen.findByText('Saanjh — Conversations That Heal');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('Rotaract Club of Delhi Dynamic Leaders')).not.toBeInTheDocument();
  });

  it('renders nothing at all when the API returns no projects', async () => {
    server.use(list([]));
    const { container } = renderPreview();

    await waitFor(() => expect(container.querySelector('section')).toBeNull());
    expect(screen.queryByText(/Club Project Showcase/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open the Club Showcase/i })).not.toBeInTheDocument();
  });

  it('navigates to the full showcase when the button is clicked', async () => {
    server.use(list([PROJECT]));
    const onOpenShowcase = vi.fn();
    renderPreview(onOpenShowcase);

    await userEvent.click(await screen.findByRole('button', { name: /Open the Club Showcase/i }));
    expect(onOpenShowcase).toHaveBeenCalledTimes(1);
  });
});
