import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server, mswSetup } from '@/test/msw';
import { renderPage } from '@/test/render';
import { AdminRolesPage } from './AdminRolesPage';
import type { RoleRecord } from '@/lib/rbac/types';

mswSetup();

const ME = {
  user: { id: 'usr_president', name: 'Rtr. President', email: 'president@example.org', twoFactorEnabled: false },
  profile: null,
  roles: [{ roleKey: 'dsc', scope: { type: 'none' } }],
  grants: { 'roles:manage': [{ type: 'none' }] },
  clubs: [],
  theme: 'light',
};

const PERMISSIONS = [
  { key: 'roles:manage', description: 'Manage roles and permissions' },
  { key: 'events:manage', description: 'Manage events' },
  { key: 'reports:review', description: 'Review club reports' },
];

function role(overrides: Partial<RoleRecord> = {}): RoleRecord {
  return {
    id: 'role_1',
    key: 'zone_lead',
    name: 'Zone Lead',
    description: 'Leads a zone',
    isSystem: false,
    scopeType: 'zone',
    permissionKeys: ['events:manage'],
    ...overrides,
  };
}

function installMe() {
  server.use(http.get('/me', () => HttpResponse.json(ME)));
}

function installBase(roles: RoleRecord[]) {
  server.use(
    http.get('/roles', () => HttpResponse.json(roles)),
    http.get('/permissions', () => HttpResponse.json(PERMISSIONS)),
  );
}

describe('AdminRolesPage', () => {
  it('renders the roles list with key, scope, permission count', async () => {
    installMe();
    installBase([role(), role({ id: 'role_sys', key: 'super_admin', name: 'Super Admin', isSystem: true, scopeType: 'none', permissionKeys: ['roles:manage', 'events:manage', 'reports:review'] })]);

    renderPage(<AdminRolesPage />);

    expect(await screen.findByText('Zone Lead')).toBeInTheDocument();
    expect(screen.getByText('zone_lead')).toBeInTheDocument();
    expect(screen.getByText('Zone')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('does not offer delete for a system role', async () => {
    installMe();
    installBase([role({ id: 'role_sys', key: 'super_admin', name: 'Super Admin', isSystem: true })]);

    renderPage(<AdminRolesPage />);

    await screen.findByText('Super Admin');
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('offers delete for a non-system role', async () => {
    installMe();
    installBase([role()]);

    renderPage(<AdminRolesPage />);

    await screen.findByText('Zone Lead');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('toggling permissions and saving PATCHes the full replacement set', async () => {
    installMe();
    installBase([role()]);
    let seenBody: unknown = null;
    server.use(
      http.patch('/roles/role_1', async ({ request }) => {
        seenBody = await request.json();
        return HttpResponse.json({ ...role(), permissionKeys: ['events:manage', 'reports:review'] });
      }),
    );

    renderPage(<AdminRolesPage />);
    const user = userEvent.setup();

    await user.click(await screen.findByText('Zone Lead'));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByLabelText(/reports:review/));
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(seenBody).toEqual({ permissionKeys: ['events:manage', 'reports:review'] }));
  });

  it('disables save when nothing changed', async () => {
    installMe();
    installBase([role()]);

    renderPage(<AdminRolesPage />);
    const user = userEvent.setup();

    await user.click(await screen.findByText('Zone Lead'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('disables save when the name is blanked in the editor', async () => {
    installMe();
    installBase([role()]);

    renderPage(<AdminRolesPage />);
    const user = userEvent.setup();

    await user.click(await screen.findByText('Zone Lead'));
    const dialog = await screen.findByRole('dialog');
    const nameField = within(dialog).getByLabelText(/^Name/);
    await user.clear(nameField);

    expect(within(dialog).getByRole('button', { name: 'Save changes' })).toBeDisabled();
    expect(within(dialog).getByText('At least 2 characters')).toBeInTheDocument();
  });

  it('creating a role posts the right body', async () => {
    installMe();
    installBase([]);
    let seenBody: unknown = null;
    server.use(
      http.post('/roles', async ({ request }) => {
        seenBody = await request.json();
        return HttpResponse.json(role({ id: 'role_new', key: 'new_role', name: 'New role' }));
      }),
    );

    renderPage(<AdminRolesPage />);
    const user = userEvent.setup();

    await screen.findByText('No roles yet');
    await user.click(screen.getByRole('button', { name: 'New role' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/^Key/), 'new_role');
    await user.type(within(dialog).getByLabelText(/^Name/), 'New Role');
    await user.click(within(dialog).getByLabelText(/events:manage/));
    await user.click(within(dialog).getByRole('button', { name: 'Create role' }));

    await waitFor(() =>
      expect(seenBody).toEqual({
        key: 'new_role',
        name: 'New Role',
        description: undefined,
        scopeType: 'none',
        permissionKeys: ['events:manage'],
      }),
    );
  });

  it('keeps create disabled for a too-short key or name', async () => {
    installMe();
    installBase([]);

    renderPage(<AdminRolesPage />);
    const user = userEvent.setup();

    await screen.findByText('No roles yet');
    await user.click(screen.getByRole('button', { name: 'New role' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/^Key/), 'a');
    await user.type(within(dialog).getByLabelText(/^Name/), 'B');

    expect(within(dialog).getByRole('button', { name: 'Create role' })).toBeDisabled();
  });

  it('shows an inline error for a too-short key as the user types', async () => {
    installMe();
    installBase([]);

    renderPage(<AdminRolesPage />);
    const user = userEvent.setup();

    await screen.findByText('No roles yet');
    await user.click(screen.getByRole('button', { name: 'New role' }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).queryByText('Must be 2 to 64 characters')).not.toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/^Key/), 'a');

    expect(within(dialog).getByText('Must be 2 to 64 characters')).toBeInTheDocument();
  });

  it('shows an inline error for a too-short name as the user types', async () => {
    installMe();
    installBase([]);

    renderPage(<AdminRolesPage />);
    const user = userEvent.setup();

    await screen.findByText('No roles yet');
    await user.click(screen.getByRole('button', { name: 'New role' }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).queryByText('At least 2 characters')).not.toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/^Name/), 'B');

    expect(within(dialog).getByText('At least 2 characters')).toBeInTheDocument();
  });

  it('shows the server message on a duplicate-key 409', async () => {
    installMe();
    installBase([]);
    server.use(
      http.post('/roles', () =>
        HttpResponse.json({ code: 'ALREADY_EXISTS', message: 'A role with this key exists' }, { status: 409 }),
      ),
    );

    renderPage(<AdminRolesPage />);
    const user = userEvent.setup();

    await screen.findByText('No roles yet');
    await user.click(screen.getByRole('button', { name: 'New role' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/^Key/), 'zone_lead');
    await user.type(within(dialog).getByLabelText(/^Name/), 'Zone Lead');
    await user.click(within(dialog).getByRole('button', { name: 'Create role' }));

    expect(await screen.findByText('A role with this key exists')).toBeInTheDocument();
  });

  it('surfaces the delete-blocked 409 message', async () => {
    installMe();
    installBase([role()]);
    server.use(
      http.delete('/roles/role_1', () =>
        HttpResponse.json(
          { code: 'INVALID_TRANSITION', message: 'Revoke all grants of this role before deleting it' },
          { status: 409 },
        ),
      ),
    );

    renderPage(<AdminRolesPage />);
    const user = userEvent.setup();

    await screen.findByText('Zone Lead');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Revoke all grants of this role before deleting it')).toBeInTheDocument();
  });
});
