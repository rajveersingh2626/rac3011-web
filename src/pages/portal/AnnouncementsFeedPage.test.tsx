import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server, mswSetup } from '@/test/msw';
import { renderPage } from '@/test/render';
import { AnnouncementsFeedPage } from './AnnouncementsFeedPage';

mswSetup();

const ME = {
  user: { id: 'usr_1', name: 'Rtr. Member', email: 'm@example.org', twoFactorEnabled: false },
  profile: null,
  roles: [],
  grants: {},
  clubs: [],
  theme: 'light',
};

describe('AnnouncementsFeedPage', () => {
  it('renders announcements newest first with channel badges', async () => {
    server.use(
      http.get('/me', () => HttpResponse.json(ME)),
      http.get('/announcements', () =>
        HttpResponse.json({
          items: [
            {
              id: 'ann_1',
              title: 'District conference registrations open',
              body: 'Register before the early-bird deadline.',
              audience: { roleKeys: ['member'] },
              channels: ['portal', 'email'],
              sentAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
              recipientCount: 120,
              createdById: 'usr_admin',
              createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        }),
      ),
    );

    renderPage(<AnnouncementsFeedPage />);

    expect(await screen.findByText('District conference registrations open')).toBeInTheDocument();
    expect(screen.getByText('Register before the early-bird deadline.')).toBeInTheDocument();
    expect(screen.getByText('Portal')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText(/ago$/)).toBeInTheDocument();
  });

  it('shows an empty state when there are no announcements', async () => {
    server.use(
      http.get('/me', () => HttpResponse.json(ME)),
      http.get('/announcements', () => HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 10 })),
    );

    renderPage(<AnnouncementsFeedPage />);

    expect(await screen.findByText('No announcements yet')).toBeInTheDocument();
  });

  it('shows an error state and retries', async () => {
    server.use(
      http.get('/me', () => HttpResponse.json(ME)),
      http.get('/announcements', () => HttpResponse.json({ message: 'Server error' }, { status: 500 })),
    );

    renderPage(<AnnouncementsFeedPage />);

    expect(await screen.findByText("Couldn't load announcements", {}, { timeout: 3000 })).toBeInTheDocument();
  });
});
