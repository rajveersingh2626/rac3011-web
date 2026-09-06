import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server, mswSetup } from '@/test/msw';
import { renderPage } from '@/test/render';
import { AdminAuditPage } from './AdminAuditPage';
import type { AuditRow } from '@/lib/audit/types';

mswSetup();

const ME = {
  user: { id: 'usr_president', name: 'Rtr. President', email: 'president@example.org', twoFactorEnabled: false },
  profile: null,
  roles: [{ roleKey: 'dsc', scope: { type: 'none' } }],
  grants: { 'audit:view': [{ type: 'none' }] },
  clubs: [],
  theme: 'light',
};

function row(overrides: Partial<AuditRow> = {}): AuditRow {
  return {
    id: 'audit_1',
    actorId: 'usr_1',
    action: 'member.update',
    resourceType: 'member',
    resourceId: 'mem_1',
    before: { status: 'pending' },
    after: { status: 'approved' },
    at: '2026-09-01T10:00:00.000Z',
    ...overrides,
  };
}

function installMe() {
  server.use(http.get('/me', () => HttpResponse.json(ME)));
}

describe('AdminAuditPage', () => {
  it('renders rows from the mocked feed', async () => {
    installMe();
    server.use(
      http.get('/audit', () => HttpResponse.json({ items: [row()], total: 1, page: 1, pageSize: 25 })),
    );

    renderPage(<AdminAuditPage />);

    expect(await screen.findByText('member.update')).toBeInTheDocument();
    expect(screen.getByText('usr_1')).toBeInTheDocument();
    expect(screen.getByText(/mem_1/)).toBeInTheDocument();
  });

  it('applies a filter on submit and re-queries with the right query string', async () => {
    installMe();
    const seenUrls: string[] = [];
    server.use(
      http.get('/audit', ({ request }) => {
        seenUrls.push(request.url);
        return HttpResponse.json({ items: [row()], total: 1, page: 1, pageSize: 25 });
      }),
    );

    renderPage(<AdminAuditPage />);
    await screen.findByText('member.update');

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Resource type'), 'member');
    await user.type(screen.getByLabelText('Actor ID'), 'usr_1');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => expect(seenUrls.length).toBeGreaterThanOrEqual(2));
    const last = new URL(seenUrls[seenUrls.length - 1]);
    expect(last.searchParams.get('filter[resourceType]')).toBe('member');
    expect(last.searchParams.get('filter[actorId]')).toBe('usr_1');
    expect(last.searchParams.get('page')).toBe('1');
  });

  it('re-queries with the next page on paging', async () => {
    installMe();
    const seenUrls: string[] = [];
    server.use(
      http.get('/audit', ({ request }) => {
        seenUrls.push(request.url);
        return HttpResponse.json({ items: [row()], total: 30, page: 1, pageSize: 25 });
      }),
    );

    renderPage(<AdminAuditPage />);
    await screen.findByText('member.update');

    const nav = screen.getByRole('navigation', { name: 'Audit log pages' });
    const user = userEvent.setup();
    await user.click(within(nav).getByRole('button', { name: 'Next →' }));

    await waitFor(() => {
      const last = new URL(seenUrls[seenUrls.length - 1]);
      expect(last.searchParams.get('page')).toBe('2');
    });
  });

  it('shows an empty state when there are no matching entries', async () => {
    installMe();
    server.use(http.get('/audit', () => HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 25 })));

    renderPage(<AdminAuditPage />);

    expect(await screen.findByText('No audit entries match these filters')).toBeInTheDocument();
  });

  it('shows an error state on failure', async () => {
    installMe();
    server.use(http.get('/audit', () => HttpResponse.json({ message: 'Boom' }, { status: 500 })));

    renderPage(<AdminAuditPage />);

    expect(await screen.findByText("Couldn't load the audit log", {}, { timeout: 3000 })).toBeInTheDocument();
  });
});
