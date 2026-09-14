import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server, mswSetup } from '@/test/msw';
import { renderPage } from '@/test/render';
import { AdminClubsPage } from './AdminClubsPage';

mswSetup();

const ME = {
  user: { id: 'usr_1', name: 'Rtr. ZRR', email: 'z@example.org', twoFactorEnabled: false },
  profile: null,
  roles: [{ roleKey: 'zrr', scope: { type: 'zone', id: 'zone_agni' } }],
  grants: { 'reports:review': [{ type: 'zone', id: 'zone_agni' }], 'clubs:edit': [{ type: 'all' }] },
  clubs: [],
  theme: 'light',
};

function installHandlers() {
  server.use(
    http.get('/me', () => HttpResponse.json(ME)),
    http.get('/zones', () => HttpResponse.json([{ id: 'zone_agni', name: 'Zone Agni', order: 1 }])),
    http.get('/clubs', () => HttpResponse.json({
      items: [
        { id: 'club_a', name: 'Rotaract Club A', shortName: 'A', slug: 'a', zoneId: 'zone_agni', president: 'Pres A', secretary: 'Sec A', isActive: true },
        { id: 'club_b', name: 'Rotaract Club B', shortName: 'B', slug: 'b', zoneId: 'zone_agni', president: 'Pres B', secretary: 'Sec B', isActive: true },
      ],
      total: 2,
    })),
    http.get('/public/clubs', () => HttpResponse.json({
      items: [
        { id: 'club_a', name: 'Rotaract Club A', shortName: 'A', slug: 'a', zoneId: 'zone_agni' },
        { id: 'club_b', name: 'Rotaract Club B', shortName: 'B', slug: 'b', zoneId: 'zone_agni' },
      ],
      total: 2,
    })),
    http.get('/reports', () => HttpResponse.json({
      items: [
        {
          id: 'rep_a', clubId: 'club_a', ryYear: 2026, month: '2026-08-01', schemaVersion: 4, status: 'submitted',
          values: { activities: [{ activity_title: 'x' }] }, notes: null, submittedById: 'u1', submittedAt: '2026-09-01T00:00:00Z',
          filedOnTime: true, scoredAt: null, club: { id: 'club_a', name: 'Rotaract Club A', shortName: 'A', zoneId: 'zone_agni' },
        },
      ],
      total: 1, page: 1, pageSize: 200,
    })),
    http.post('/reports/:id/queries', () =>
      HttpResponse.json({
        id: 'rep_a', clubId: 'club_a', ryYear: 2026, month: '2026-08-01', schemaVersion: 4, status: 'queried',
        values: { activities: [{ activity_title: 'x' }] }, notes: null, submittedById: 'u1', submittedAt: '2026-09-01T00:00:00Z',
        filedOnTime: true, scoredAt: null,
      }),
    ),
  );
}

describe('AdminClubsPage', () => {
  it('renders clubs list in directory management tab', async () => {
    installHandlers();
    renderPage(<AdminClubsPage />);

    expect(await screen.findByText('Rotaract Club A')).toBeInTheDocument();
    expect(screen.getByText('Rotaract Club B')).toBeInTheDocument();
    expect(screen.getByText('Pres A')).toBeInTheDocument();
  });

  it('switches to reports tab and renders compliance reports', async () => {
    installHandlers();
    renderPage(<AdminClubsPage />);
    await screen.findByText('Rotaract Club A');

    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: 'Monthly Reports & Compliance' }));

    expect(await screen.findByText('Review reports, assign points', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Not yet filed: B', { exact: false })).toBeInTheDocument();
  });
});
