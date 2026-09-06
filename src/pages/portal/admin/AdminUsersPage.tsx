import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDocumentMeta } from '@/lib/meta';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { fetchMembers } from '@/lib/members/api';
import type { Member } from '@/lib/members/types';
import { fetchPublicClubs, fetchZones, type PublicClub, type Zone } from '@/lib/clubs';
import { fetchRoles, fetchUserRoles, grantUserRole, revokeUserRole } from '@/lib/rbac/api';
import type { RoleRecord, ScopeType, UserRole } from '@/lib/rbac/types';
import { SCOPE_LABEL, errorMessageOf } from '@/lib/rbac/ui';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Table, type Column } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

interface SelectedUser {
  id: string;
  label: string;
}

interface GrantInput {
  roleId: string;
  scopeType: ScopeType;
  scopeId?: string;
}

interface GrantFormProps {
  roles: RoleRecord[];
  clubs: PublicClub[];
  zones: Zone[];
  onSave: (input: GrantInput) => void;
  saving: boolean;
  errorMessage: string | null;
}

function GrantForm({ roles, clubs, zones, onSave, saving, errorMessage }: GrantFormProps) {
  const [roleId, setRoleId] = useState('');
  const [scopeId, setScopeId] = useState('');

  const role = roles.find((r) => r.id === roleId) ?? null;
  const scopeType = role?.scopeType ?? null;

  function submit() {
    if (!role || !scopeType) return;
    onSave({
      roleId: role.id,
      scopeType,
      scopeId: scopeType === 'none' ? undefined : scopeId.trim(),
    });
  }

  const canSubmit = Boolean(role) && (scopeType === 'none' || scopeId.trim() !== '');

  const roleOptions: SelectOption[] = roles.map((r) => ({ value: r.id, label: `${r.name} (${r.key})` }));
  const clubOptions: SelectOption[] = clubs.map((c) => ({ value: c.id, label: c.name }));
  const zoneOptions: SelectOption[] = zones.map((z) => ({ value: z.id, label: z.name }));

  return (
    <div className="flex flex-col gap-3">
      {errorMessage && (
        <Alert tone="error" title="Could not grant this role">
          {errorMessage}
        </Alert>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Role">
          <Select
            aria-label="Role"
            value={roleId}
            onChange={(e) => {
              setRoleId(e.target.value);
              setScopeId('');
            }}
            placeholder="Choose a role…"
            options={roleOptions}
          />
        </Field>
        {scopeType === 'club' && (
          <Field label="Club">
            <Select
              aria-label="Club"
              value={scopeId}
              onChange={(e) => setScopeId(e.target.value)}
              placeholder="Choose a club…"
              options={clubOptions}
            />
          </Field>
        )}
        {scopeType === 'zone' && (
          <Field label="Zone">
            <Select
              aria-label="Zone"
              value={scopeId}
              onChange={(e) => setScopeId(e.target.value)}
              placeholder="Choose a zone…"
              options={zoneOptions}
            />
          </Field>
        )}
        {scopeType === 'project' && (
          <Field label="Project ID">
            <Input aria-label="Project ID" value={scopeId} onChange={(e) => setScopeId(e.target.value)} placeholder="proj_..." />
          </Field>
        )}
      </div>
      <div>
        <Button disabled={!canSubmit || saving} loading={saving} onClick={submit}>
          Grant role
        </Button>
      </div>
    </div>
  );
}

export function AdminUsersPage() {
  useDocumentMeta({ title: 'User role grants' });
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [pastedId, setPastedId] = useState('');
  const [selected, setSelected] = useState<SelectedUser | null>(null);
  const [revoking, setRevoking] = useState<UserRole | null>(null);
  const [grantResetKey, setGrantResetKey] = useState(0);

  const membersQuery = useQuery({
    queryKey: ['members-search', debouncedSearch],
    queryFn: () => fetchMembers({ q: debouncedSearch, pageSize: 20 }),
    enabled: debouncedSearch.trim() !== '',
  });

  const membersForbidden = membersQuery.error instanceof ApiError && membersQuery.error.status === 403;

  const rolesQuery = useQuery({ queryKey: ['roles'], queryFn: fetchRoles });
  const clubsQuery = useQuery({ queryKey: ['public-clubs'], queryFn: () => fetchPublicClubs() });
  const zonesQuery = useQuery({ queryKey: ['zones'], queryFn: fetchZones });

  const grantsQuery = useQuery({
    queryKey: ['user-roles', selected?.id],
    queryFn: () => fetchUserRoles(selected!.id),
    enabled: Boolean(selected),
  });

  // The API's filter[userId] can't be trusted (some deployments ignore it and return
  // every grant in the district), so the selected user is re-applied here as well.
  const grants = useMemo(
    () => (grantsQuery.data ?? []).filter((g) => g.userId === selected?.id),
    [grantsQuery.data, selected],
  );

  const invalidateGrants = () => void qc.invalidateQueries({ queryKey: ['user-roles', selected?.id] });

  const grantMutation = useMutation({
    mutationFn: (input: GrantInput) => grantUserRole({ userId: selected!.id, ...input }),
    onSuccess: () => {
      invalidateGrants();
      setGrantResetKey((k) => k + 1);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeUserRole(id),
    onSuccess: () => {
      setRevoking(null);
      invalidateGrants();
    },
  });

  function selectMember(member: Member) {
    grantMutation.reset();
    setSelected({ id: member.userId, label: member.fullName });
  }

  function selectPastedId() {
    const id = pastedId.trim();
    if (!id) return;
    grantMutation.reset();
    setSelected({ id, label: id });
  }

  const clubsById = useMemo(() => new Map((clubsQuery.data ?? []).map((c) => [c.id, c.name])), [clubsQuery.data]);
  const zonesById = useMemo(() => new Map((zonesQuery.data ?? []).map((z) => [z.id, z.name])), [zonesQuery.data]);
  const rolesById = useMemo(() => new Map((rolesQuery.data ?? []).map((r) => [r.id, r])), [rolesQuery.data]);

  function scopeValueLabel(grant: UserRole): string {
    if (grant.scopeType === 'none' || !grant.scopeId) return 'None';
    if (grant.scopeType === 'club') return clubsById.get(grant.scopeId) ?? grant.scopeId;
    if (grant.scopeType === 'zone') return zonesById.get(grant.scopeId) ?? grant.scopeId;
    return grant.scopeId;
  }

  const columns: Column<UserRole>[] = [
    {
      key: 'role',
      header: 'Role',
      cell: (g) => (
        <span>
          <span className="font-bold text-fg">{rolesById.get(g.roleId)?.name ?? g.roleKey}</span>{' '}
          <span className="font-mono text-[11.5px] text-fg-3">{g.roleKey}</span>
        </span>
      ),
    },
    { key: 'scope', header: 'Scope', cell: (g) => SCOPE_LABEL[g.scopeType] },
    { key: 'scopeValue', header: 'Where', cell: (g) => scopeValueLabel(g) },
    {
      key: '__actions',
      header: '',
      align: 'right',
      cell: (g) => (
        <Button variant="link" size="sm" onClick={() => setRevoking(g)}>
          Revoke
        </Button>
      ),
    },
  ];

  const revokingRoleName = revoking ? (rolesById.get(revoking.roleId)?.name ?? revoking.roleKey) : '';

  return (
    <Container width="wide">
      <Section
        eyebrow="RBAC"
        title="User role grants"
        description="Find a user, then grant or revoke scoped roles. The API enforces every permission; this screen only manages the grants."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <div className="flex flex-col gap-4">
            <Field label="Search members" hint="By name or email">
              <Input
                aria-label="Search members"
                placeholder="Search members…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Field>

            {membersForbidden && (
              <Alert tone="warning" title="Member search is unavailable">
                Your role has roles:manage but not members:view, so members can't be searched here. Paste a user id
                below instead.
              </Alert>
            )}

            {!membersForbidden && debouncedSearch.trim() !== '' && (
              <>
                {membersQuery.isPending ? (
                  <Skeleton shape="rect" className="h-40" />
                ) : membersQuery.isError ? (
                  <ErrorState title="Couldn't search members" onRetry={() => void membersQuery.refetch()} />
                ) : membersQuery.data.items.length === 0 ? (
                  <EmptyState title="No members match this search" />
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                    {membersQuery.data.items.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => selectMember(m)}
                          className={cn(
                            'w-full rounded-[8px] border px-3 py-2 text-left',
                            selected?.id === m.userId ? 'border-accent bg-accent-soft' : 'border-line-accent',
                          )}
                        >
                          <p className="m-0 text-[13px] font-bold text-fg">{m.fullName}</p>
                          <p className="m-0 text-[11.5px] text-fg-3">
                            {m.email} &middot; {m.club.name}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            <Field label="Or paste a user id" hint="For a user with no member record">
              <div className="flex gap-2">
                <Input
                  aria-label="User id"
                  placeholder="usr_..."
                  value={pastedId}
                  onChange={(e) => setPastedId(e.target.value)}
                />
                <Button variant="secondary" onClick={selectPastedId} disabled={!pastedId.trim()}>
                  Use
                </Button>
              </div>
            </Field>
          </div>

          <div className="flex flex-col gap-4">
            {!selected ? (
              <EmptyState
                title="Pick a user"
                body="Search for a member or paste a user id to see and manage their role grants."
              />
            ) : (
              <>
                <Card title={selected.label}>
                  <p className="m-0 font-mono text-[11.5px] text-fg-3">{selected.id}</p>
                </Card>

                {rolesQuery.isPending ? (
                  <Skeleton shape="rect" className="h-24" />
                ) : rolesQuery.isError ? (
                  <ErrorState title="Couldn't load roles" onRetry={() => void rolesQuery.refetch()} />
                ) : (
                  <GrantForm
                    key={`${selected.id}:${grantResetKey}`}
                    roles={rolesQuery.data ?? []}
                    clubs={clubsQuery.data ?? []}
                    zones={zonesQuery.data ?? []}
                    onSave={(input) => grantMutation.mutate(input)}
                    saving={grantMutation.isPending}
                    errorMessage={errorMessageOf(grantMutation.error)}
                  />
                )}

                {grantsQuery.isPending ? (
                  <Skeleton shape="rect" className="h-64" />
                ) : grantsQuery.isError ? (
                  <ErrorState title="Couldn't load this user's grants" onRetry={() => void grantsQuery.refetch()} />
                ) : grants.length === 0 ? (
                  <EmptyState title="No roles granted to this user yet" />
                ) : (
                  <Table columns={columns} rows={grants} rowKey={(g) => g.id} />
                )}
              </>
            )}
          </div>
        </div>
      </Section>

      <Modal
        open={Boolean(revoking)}
        onClose={() => {
          setRevoking(null);
          revokeMutation.reset();
        }}
        title={`Revoke ${revokingRoleName}?`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setRevoking(null);
                revokeMutation.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={revokeMutation.isPending}
              onClick={() => revoking && revokeMutation.mutate(revoking.id)}
            >
              Revoke
            </Button>
          </>
        }
      >
        {revokeMutation.isError ? (
          <Alert tone="error" title="Could not revoke this grant">
            {errorMessageOf(revokeMutation.error)}
          </Alert>
        ) : (
          'This cannot be undone.'
        )}
      </Modal>
    </Container>
  );
}
