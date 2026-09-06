import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server, mswSetup } from '@/test/msw';
import { renderPage } from '@/test/render';
import { AdminUsersPage } from './AdminUsersPage';

mswSetup();

const ME = {
  user: { id: 'usr_president', name: 'Rtr. President', email: 'president@example.org', twoFactorEnabled: false },
  profile: null,
  roles: [{ roleKey: 'dsc', scope: { type: 'none' } }],
  grants: { 'roles:manage': [{ type: 'none' }] },
  clubs: [],
  theme: 'light',
};

const ROLES = [
  { id: 'role_none', key: 'auditor', name: 'Auditor', description: null, isSystem: false, scopeType: 'none', permissionKeys: ['audit:view'] },
  {
    id: 'role_club',
    key: 'club_president',
    name: 'Club President',
    description: null,
    isSystem: false,
    scopeType: 'club',
    permissionKeys: ['members:approve'],
  },
];

const CLUBS = [{ id: 'club_dse', name: 'Rotaract Club of Delhi South East', shortName: 'DSE', slug: 'dse', zoneId: 'zone_agni' }];
const ZONES = [{ id: 'zone_agni', name: 'Zone Agni', order: 1 }];

function member(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'mp_1',
    userId: 'usr_target',
    fullName: 'Ishita Rao',
    email: 'ishita@example.com',
    phone: null,
    rotaryId: null,
    clubId: 'club_dse',
    club: { id: 'club_dse', name: 'Rotaract Club of Delhi South East', shortName: 'DSE' },
    photoUrl: null,
    bio: null,
    skills: [],
    interests: [],
    membershipAnniversary: null,
    status: 'approved',
    approvedById: null,
    approvedAt: null,
    rejectionReason: null,
    directoryOptIn: false,
    isDacMember: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function grant(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'ur_1',
    userId: 'usr_target',
    roleId: 'role_club',
    roleKey: 'club_president',
    scopeType: 'club',
    scopeId: 'club_dse',
    grantedById: 'usr_president',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function installBase(options: { members?: Record<string, unknown>[]; grants?: Record<string, unknown>[] } = {}) {
  const members = options.members ?? [member()];
  const grants = options.grants ?? [];
  server.use(
    http.get('/me', () => HttpResponse.json(ME)),
    http.get('/roles', () => HttpResponse.json(ROLES)),
    http.get('/public/clubs', () => HttpResponse.json({ items: CLUBS, total: CLUBS.length })),
    http.get('/zones', () => HttpResponse.json(ZONES)),
    http.get('/members', () => HttpResponse.json({ items: members, total: members.length, page: 1, pageSize: 20 })),
    http.get('/user-roles', () => HttpResponse.json(grants)),
  );
}

async function selectIshita() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Search members'), 'ishita');
  await user.click(await screen.findByText('Ishita Rao'));
  return user;
}

describe('AdminUsersPage', () => {
  it('searching members and selecting one loads that user\'s grants', async () => {
    installBase({ grants: [grant()] });
    renderPage(<AdminUsersPage />);

    await selectIshita();

    expect(await screen.findByText('Club President')).toBeInTheDocument();
    expect(screen.getByText('club_president')).toBeInTheDocument();
    expect(screen.getByText('Rotaract Club of Delhi South East')).toBeInTheDocument();
  });

  it('shows no scope input for a none-scoped role', async () => {
    installBase();
    renderPage(<AdminUsersPage />);
    const user = await selectIshita();

    await screen.findByText('No roles granted to this user yet');
    await user.selectOptions(screen.getByLabelText('Role'), 'role_none');

    expect(screen.queryByLabelText('Club')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Zone')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Project ID')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Grant role' })).toBeEnabled();
  });

  it('shows a club picker for a club-scoped role and posts the right body', async () => {
    installBase();
    let seenBody: unknown = null;
    server.use(
      http.post('/user-roles', async ({ request }) => {
        seenBody = await request.json();
        return HttpResponse.json(grant());
      }),
    );

    renderPage(<AdminUsersPage />);
    const user = await selectIshita();

    await screen.findByText('No roles granted to this user yet');
    await user.selectOptions(screen.getByLabelText('Role'), 'role_club');
    expect(screen.getByRole('button', { name: 'Grant role' })).toBeDisabled();

    await user.selectOptions(screen.getByLabelText('Club'), 'club_dse');
    await user.click(screen.getByRole('button', { name: 'Grant role' }));

    await waitFor(() =>
      expect(seenBody).toEqual({
        userId: 'usr_target',
        roleId: 'role_club',
        scopeType: 'club',
        scopeId: 'club_dse',
      }),
    );
  });

  it('shows the server message on a duplicate-grant 409', async () => {
    installBase();
    server.use(
      http.post('/user-roles', () =>
        HttpResponse.json({ code: 'ALREADY_EXISTS', message: 'This grant already exists' }, { status: 409 }),
      ),
    );

    renderPage(<AdminUsersPage />);
    const user = await selectIshita();

    await screen.findByText('No roles granted to this user yet');
    await user.selectOptions(screen.getByLabelText('Role'), 'role_club');
    await user.selectOptions(screen.getByLabelText('Club'), 'club_dse');
    await user.click(screen.getByRole('button', { name: 'Grant role' }));

    expect(await screen.findByText('This grant already exists')).toBeInTheDocument();
  });

  it('requests grants scoped to the selected user and filters client-side even if the API returns others', async () => {
    installBase();
    let seenUrl: string | null = null;
    server.use(
      http.get('/user-roles', ({ request }) => {
        seenUrl = request.url;
        return HttpResponse.json([
          grant({ id: 'ur_mine' }),
          grant({
            id: 'ur_other',
            userId: 'usr_other',
            roleId: 'role_none',
            roleKey: 'auditor',
            scopeType: 'none',
            scopeId: null,
          }),
        ]);
      }),
    );

    renderPage(<AdminUsersPage />);
    await selectIshita();

    expect(await screen.findByText('Club President')).toBeInTheDocument();
    expect(screen.queryByText('Auditor')).not.toBeInTheDocument();
    expect(seenUrl).toContain('filter[userId]=usr_target');
  });

  it('clears the grant form when switching from one selected user to another', async () => {
    installBase({
      members: [member(), member({ id: 'mp_2', userId: 'usr_other', fullName: 'Kartik Kumar', email: 'kartik@example.com' })],
    });

    renderPage(<AdminUsersPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Search members'), 'ra');

    await user.click(await screen.findByText('Ishita Rao'));
    await screen.findByText('No roles granted to this user yet');
    await user.selectOptions(screen.getByLabelText('Role'), 'role_club');
    await user.selectOptions(screen.getByLabelText('Club'), 'club_dse');
    expect((screen.getByLabelText('Role') as HTMLSelectElement).value).toBe('role_club');

    await user.click(screen.getByText('Kartik Kumar'));

    await waitFor(() => expect((screen.getByLabelText('Role') as HTMLSelectElement).value).toBe(''));
    expect(screen.queryByLabelText('Club')).not.toBeInTheDocument();
  });

  it('revoke calls DELETE and refreshes the grants list', async () => {
    installBase({ members: [member()] });
    let grantsStore = [grant()];
    let deletedId: string | null = null;
    server.use(
      http.get('/user-roles', () => HttpResponse.json(grantsStore)),
      http.delete('/user-roles/:id', ({ params }) => {
        deletedId = params.id as string;
        grantsStore = grantsStore.filter((g) => g.id !== deletedId);
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderPage(<AdminUsersPage />);
    const user = await selectIshita();

    await screen.findByText('Club President');
    await user.click(screen.getByRole('button', { name: 'Revoke' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Revoke' }));

    await waitFor(() => expect(deletedId).toBe('ur_1'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('No roles granted to this user yet')).toBeInTheDocument());
  });
});
