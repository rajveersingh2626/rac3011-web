import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server, mswSetup } from '@/test/msw';
import { renderPage } from '@/test/render';
import { DashboardPage } from './DashboardPage';
import { currentReportMonth } from '@/lib/reports/month';

mswSetup();

const ME = {
  user: { id: 'usr_1', name: 'Rtr. President', email: 'p@example.org', twoFactorEnabled: false },
  profile: { clubId: 'club_dse', photoUrl: null, themePreference: 'light' },
  roles: [],
  grants: { 'reports:submit': [{ type: 'club', id: 'club_dse' }] },
  clubs: [{ id: 'club_dse', name: 'Delhi South East', shortName: 'DSE', zoneId: 'zone_agni' }],
  theme: 'light',
};

const NO_ANNOUNCEMENTS = http.get('/announcements', () => HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 3 }));

describe('DashboardPage', () => {
  it("prompts to start the report when this month's report doesn't exist yet", async () => {
    server.use(
      http.get('/me', () => HttpResponse.json(ME)),
      http.get('/reports', () => HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 1 })),
      NO_ANNOUNCEMENTS,
    );
    renderPage(<DashboardPage />);

    expect(await screen.findByText(/report isn't in yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start the report' })).toBeInTheDocument();
  });

  it('shows the current status badge when a report already exists', async () => {
    const month = currentReportMonth();
    server.use(
      http.get('/me', () => HttpResponse.json(ME)),
      http.get('/reports', () =>
        HttpResponse.json({
          items: [{ id: 'rep_1', clubId: 'club_dse', ryYear: 2026, month: `${month}-01`, schemaVersion: 4, status: 'queried', values: {}, notes: null, submittedById: null, submittedAt: null, filedOnTime: null, scoredAt: null }],
          total: 1, page: 1, pageSize: 1,
        }),
      ),
      NO_ANNOUNCEMENTS,
    );
    renderPage(<DashboardPage />);

    expect(await screen.findByText('Needs your reply')).toBeInTheDocument();
  });

  it('shows a neutral message for accounts without reporting permission', async () => {
    server.use(http.get('/me', () => HttpResponse.json({ ...ME, grants: {} })), NO_ANNOUNCEMENTS);
    renderPage(<DashboardPage />);

    expect(await screen.findByText('No monthly report for this account')).toBeInTheDocument();
  });

  it('shows the latest announcements with a link to the full feed', async () => {
    server.use(
      http.get('/me', () => HttpResponse.json(ME)),
      http.get('/reports', () => HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 1 })),
      http.get('/announcements', () =>
        HttpResponse.json({
          items: [
            {
              id: 'ann_1',
              title: 'District conference dates announced',
              body: 'Save the date.',
              audience: {},
              channels: ['portal'],
              sentAt: new Date().toISOString(),
              recipientCount: 10,
              createdById: 'usr_2',
              createdAt: new Date().toISOString(),
            },
          ],
          total: 1,
          page: 1,
          pageSize: 3,
        }),
      ),
    );
    renderPage(<DashboardPage />);

    expect(await screen.findByText('District conference dates announced')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'See all' })).toBeInTheDocument();
  });

  it('renders Super Admin Command Hub when user has roles:manage permission', async () => {
    server.use(
      http.get('/me', () =>
        HttpResponse.json({
          ...ME,
          grants: { 'roles:manage': [{ type: 'none' }] },
        }),
      ),
      http.get('/reports', () => HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 1 })),
      NO_ANNOUNCEMENTS,
    );
    renderPage(<DashboardPage />);

    expect(await screen.findByText('Super Admin Command Hub')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Give / Revoke Access' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Active Sessions' })).toBeInTheDocument();
  });

  it('renders District Operations Action Desk when user has reports:review permission', async () => {
    server.use(
      http.get('/me', () =>
        HttpResponse.json({
          ...ME,
          grants: { 'reports:review': [{ type: 'none' }] },
        }),
      ),
      http.get('/reports', () => HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 1 })),
      NO_ANNOUNCEMENTS,
    );
    renderPage(<DashboardPage />);

    expect(await screen.findByText('Officer Action Desk')).toBeInTheDocument();
    expect(screen.getByText('Review Reports')).toBeInTheDocument();
  });
});

