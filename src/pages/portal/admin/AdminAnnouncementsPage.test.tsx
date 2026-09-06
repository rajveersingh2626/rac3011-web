import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server, mswSetup } from '@/test/msw';
import { renderPage } from '@/test/render';
import { AdminAnnouncementsPage } from './AdminAnnouncementsPage';

mswSetup();

const ME = {
  user: { id: 'usr_president', name: 'Rtr. President', email: 'president@example.org', twoFactorEnabled: false },
  profile: { id: 'mp_1', clubId: 'club_dse', status: 'approved' },
  roles: [{ roleKey: 'president', scope: { type: 'club', id: 'club_dse' } }],
  grants: { 'announcements:send': [{ type: 'club', id: 'club_dse' }] },
  clubs: [{ id: 'club_dse', name: 'Rotaract Club of Delhi South East', shortName: 'DSE', zoneId: 'zone_agni' }],
  theme: 'light',
};

function installHandlers(options: { estimateStatus?: number; sendStatus?: number } = {}) {
  server.use(
    http.get('/me', () => HttpResponse.json(ME)),
    http.get('/zones', () => HttpResponse.json([{ id: 'zone_agni', name: 'Zone Agni', order: 1 }])),
    http.get('/public/clubs', () =>
      HttpResponse.json({
        items: [{ id: 'club_dse', name: 'Rotaract Club of Delhi South East', shortName: 'DSE', slug: 'dse', zoneId: 'zone_agni' }],
        total: 1,
      }),
    ),
    http.get('/announcements', () => HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 10 })),
    http.post('/announcements/audience/estimate', () => {
      if (options.estimateStatus === 403) {
        return HttpResponse.json({ message: "You don't have permission to reach that audience." }, { status: 403 });
      }
      return HttpResponse.json({ count: 12 });
    }),
    http.post('/announcements', () => {
      if (options.sendStatus === 403) {
        return HttpResponse.json({ message: "You don't have permission to reach that audience." }, { status: 403 });
      }
      return HttpResponse.json({
        id: 'ann_1',
        title: 'Hello',
        body: 'Body',
        audience: { clubIds: ['club_dse'] },
        channels: ['portal', 'email'],
        sentAt: new Date().toISOString(),
        recipientCount: 12,
        createdById: 'usr_president',
        createdAt: new Date().toISOString(),
      });
    }),
  );
}

describe('AdminAnnouncementsPage', () => {
  it('disables Send while the audience is empty', async () => {
    installHandlers();
    renderPage(<AdminAnnouncementsPage />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Title/), 'Hello');
    await user.type(screen.getByLabelText(/Message/), 'Body');

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('enables Send once a valid audience is picked and shows the live estimate', async () => {
    installHandlers();
    renderPage(<AdminAnnouncementsPage />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Title/), 'Hello');
    await user.type(screen.getByLabelText(/Message/), 'Body');
    await user.click(await screen.findByText('Presidents'));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Send' })).not.toBeDisabled());
    expect(await screen.findByText('12 people would receive this')).toBeInTheDocument();
  });

  it('surfaces a 403 estimate error clearly', async () => {
    installHandlers({ estimateStatus: 403 });
    renderPage(<AdminAnnouncementsPage />);

    const user = userEvent.setup();
    await user.click(await screen.findByText('Presidents'));

    expect(await screen.findByText("You don't have permission to reach that audience.", {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('clears the form, including the member-IDs field, after a successful send', async () => {
    installHandlers();
    renderPage(<AdminAnnouncementsPage />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Title/), 'Hello');
    await user.type(screen.getByLabelText(/Message/), 'Body');
    const memberIdsInput = screen.getByPlaceholderText('mem_abc, mem_def');
    await user.type(memberIdsInput, 'mem_1, mem_2');

    await waitFor(() => expect(screen.getByRole('button', { name: 'Send' })).not.toBeDisabled());
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(screen.getByLabelText(/Title/)).toHaveValue(''));
    expect(screen.getByLabelText(/Message/)).toHaveValue('');
    // AudienceBuilder remounts (key bump) on a successful send, so re-query rather than
    // reuse the pre-send handle, which is now a detached node.
    expect(screen.getByPlaceholderText('mem_abc, mem_def')).toHaveValue('');
  });

  it('keeps the form filled in and shows an error when the send itself fails', async () => {
    installHandlers({ sendStatus: 403 });
    renderPage(<AdminAnnouncementsPage />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Title/), 'Hello');
    await user.type(screen.getByLabelText(/Message/), 'Body');
    await user.click(await screen.findByText('Presidents'));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Send' })).not.toBeDisabled());
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByText("You don't have permission to reach that audience.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/)).toHaveValue('Hello');
    expect(screen.getByLabelText(/Message/)).toHaveValue('Body');
  });
});
