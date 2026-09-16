import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, Key, Search, Users, UserPlus, Edit3, Crown } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { cn } from '@/lib/cn';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { fetchPublicClubs, fetchZones } from '@/lib/clubs';
import {
  fetchRoles,
  fetchUserDirectory,
  grantUserRole,
  revokeUserRole,
  createAdminUser,
  updateAdminUser,
} from '@/lib/rbac/api';
import type { ScopeType, UserDirectoryItem } from '@/lib/rbac/types';
import { errorMessageOf } from '@/lib/rbac/ui';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Table, type Column } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

// Extensive breakdown of all 41 District 3011 capabilities
const PERMISSION_DOMAINS = [
  {
    name: 'Reporting & Scoring',
    description: 'Monthly club report submissions, queries, reviews, and scoring by district evaluators.',
    permissions: [
      { key: 'reports:submit', name: 'Submit Club Reports', desc: 'Can compile, edit, and submit the monthly club report.' },
      { key: 'reports:review', name: 'Review & Query Reports', desc: 'Can review submissions from clubs and raise official queries.' },
      { key: 'reports:score', name: 'Score Reports & Points', desc: 'Can evaluate reports, verify achievements, and award official district points.' },
      { key: 'requests:manage', name: 'Manage Report Schemas & Requests', desc: 'Can design and dispatch monthly reporting schemas to clubs.' },
    ],
  },
  {
    name: 'Member & Access Governance',
    description: 'Roster management, registration approvals, and role/permission grants.',
    permissions: [
      { key: 'members:view', name: 'View Club Rosters', desc: 'Can inspect member lists, contacts, and membership status.' },
      { key: 'members:approve', name: 'Approve Registrations', desc: 'Can approve or decline pending club join registrations.' },
      { key: 'members:import', name: 'Bulk Import Members', desc: 'Can import member rosters from Excel or CSV files.' },
      { key: 'roles:manage', name: 'Manage Roles & Access', desc: 'Super Admin capability to grant, switch, and revoke roles across all IDs.' },
    ],
  },
  {
    name: 'Events & DRR Calendar',
    description: 'District events, club calendars, check-in tracking, and official DRR presence visits.',
    permissions: [
      { key: 'events:manage', name: 'Manage District Events', desc: 'Create and publish district-wide events on the public calendar.' },
      { key: 'club_events:log', name: 'Log Club Events', desc: 'Propose and schedule events on the club calendar.' },
      { key: 'events:checkin', name: 'Event Check-in Scanner', desc: 'Scan attendee QR codes and confirm physical presence.' },
      { key: 'drr_calendar:manage', name: 'Manage DRR Calendar', desc: 'Confirm or decline DRR presence requests and schedule official visits.' },
    ],
  },
  {
    name: 'Content, Showcase & Media',
    description: 'Editorial control over public stories, flagship project showcase, and media.',
    permissions: [
      { key: 'showcase:submit', name: 'Submit Project Showcase', desc: 'Submit impactful club projects for district showcase consideration.' },
      { key: 'showcase:publish', name: 'Publish Showcase Stories', desc: 'Review, edit, and feature submitted projects on the public site.' },
      { key: 'content:edit', name: 'Draft Website Content', desc: 'Draft articles, announcements, and district leadership profiles.' },
      { key: 'content:publish', name: 'Publish Website Content', desc: 'Make web updates live on the public District 3011 portal.' },
      { key: 'public_content:manage', name: 'Manage Public Pages', desc: 'Direct control over public landing pages and assets.' },
      { key: 'resources:manage', name: 'Manage Resource & Drive Vault', desc: 'Upload, manage, and relationally map Google Drive resources and guidelines to clubs and members.' },
      { key: 'forms:manage', name: 'Manage Registration Forms', desc: 'Build, configure, and publish dynamic registration forms and delegate intake schemas.' },
      { key: 'ride:applications:manage', name: 'Manage RIDE Applications & Submissions', desc: 'Can review, approve, and triage internal host club applications and incoming delegation confirmations in the Needs Attention queue.' },
    ],
  },
  {
    name: 'Communication & Feedback',
    description: 'District-wide broadcasts, push alerts, bespoke email studios, and enquiry resolution.',
    permissions: [
      { key: 'comms:send', name: 'Send Bespoke Email Broadcasts', desc: 'Dispatch emails to delegates and clubs using the bespoke yellow-accent template.' },
      { key: 'announcements:send', name: 'Send Club Announcements', desc: 'Broadcast notices and updates to club members.' },
      { key: 'announcements:send_all', name: 'District-Wide Broadcast', desc: 'Send alerts to all active members across every club in 3011.' },
      { key: 'feedback:submit', name: 'Submit Feedback & Enquiries', desc: 'Send inquiries and feedback to the district council.' },
      { key: 'feedback:review', name: 'Review & Respond to Feedback', desc: 'Triage and reply to submissions from members and public.' },
    ],
  },
  {
    name: 'District Settings & Operations',
    description: 'Point calculation rules, club verification, and compliance audit logs.',
    permissions: [
      { key: 'settings:manage', name: 'Manage Platform Settings', desc: 'Configure district-level variables, deadlines, and features.' },
      { key: 'point_rules:manage', name: 'Configure Point System', desc: 'Modify scoring categories, rules, and multiplier weights.' },
      { key: 'club_facts:edit', name: 'Edit Club Factsheets', desc: 'Update charter dates, sponsor Rotary clubs, and legacy stats.' },
      { key: 'clubs:view', name: 'View Clubs Directory', desc: 'Inspect club details, officers, and zone assignments.' },
      { key: 'clubs:edit', name: 'Edit Club Information', desc: 'Update club contact details, social links, and meeting venue.' },
      { key: 'audit:view', name: 'View Security Audit Log', desc: 'Inspect full trail of actions, logins, grants, and administrative edits.' },
    ],
  },
  {
    name: 'District Flagships & RIDE Youth Exchange',
    description: 'Special administrative capabilities for District 3011 subdomains and youth exchanges.',
    permissions: [
      { key: 'subdomain:mission3011:manage', name: 'Mission 3011 Admin', desc: 'Manage blood donation drives, camps, and donor registries.' },
      { key: 'subdomain:drishti:manage', name: 'Drishti Admin', desc: 'Manage eye care drives, screening camps, and spectacles distribution.' },
      { key: 'subdomain:rcl:manage', name: 'RCL Admin', desc: 'Manage the Rotaract Cricket League fixtures, teams, and scores.' },
      { key: 'subdomain:careerbridge:manage', name: 'CareerBridge Admin', desc: 'Manage career fairs, job listings, and mentorship programs.' },
      { key: 'subdomain:ride:manage', name: 'RIDE Subdomain Admin', desc: 'Access and oversee the RIDE subdomain infrastructure.' },
      { key: 'ride:manage', name: 'RIDE Youth Exchange Admin', desc: 'Full administration of The RIDE Youth Exchange and Delhi Meri Jaan portal.' },
      { key: 'ride:delegates:manage', name: 'Manage RIDE Delegates & Homestays', desc: 'Manage incoming exchange participants, delegations, homestay families and host club allocations.' },
    ],
  },
  {
    name: 'Member Self-Service',
    description: 'Personal profile, volunteering hours, and district directory opt-in.',
    permissions: [
      { key: 'profile:edit', name: 'Update Personal Profile', desc: 'Change bio, contact info, photo, and skills.' },
      { key: 'directory:view', name: 'Access District Directory', desc: 'Browse fellow Rotaractors who opted into the public directory.' },
      { key: 'effort:log', name: 'Log Volunteering Hours', desc: 'Record personal service hours and community contributions.' },
      { key: 'effort:approve', name: 'Approve Service Hours', desc: 'Verify and approve volunteer effort submitted by club members.' },
    ],
  },
];

interface GrantInput {
  roleId: string;
  scopeType: ScopeType;
  scopeId?: string;
}

export function AdminUsersPage() {
  useDocumentMeta({ title: 'Access Control & Role Granter' });
  const qc = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedClubFilter, setSelectedClubFilter] = useState('ALL');

  // Modal states
  const [managingUser, setManagingUser] = useState<UserDirectoryItem | null>(null);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [revokingGrantId, setRevokingGrantId] = useState<string | null>(null);
  const { toast } = useToast();

  // Create User modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Rac3011#2026');
  const [newUserClubId, setNewUserClubId] = useState('DISTRICT');
  const [newUserRoleKey, setNewUserRoleKey] = useState('member');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserError, setNewUserError] = useState<string | null>(null);

  // New grant form state
  const [grantRoleId, setGrantRoleId] = useState('');
  const [grantScopeId, setGrantScopeId] = useState('');
  const [grantError, setGrantError] = useState<string | null>(null);

  // Data Queries
  const directoryQuery = useQuery({
    queryKey: ['user-directory', debouncedSearch],
    queryFn: () => fetchUserDirectory(debouncedSearch),
  });

  const rolesQuery = useQuery({ queryKey: ['roles'], queryFn: fetchRoles });
  const clubsQuery = useQuery({ queryKey: ['public-clubs'], queryFn: () => fetchPublicClubs() });
  const zonesQuery = useQuery({ queryKey: ['zones'], queryFn: fetchZones });

  const roles = rolesQuery.data ?? [];
  const clubs = clubsQuery.data ?? [];
  const zones = zonesQuery.data ?? [];

  const clubsById = useMemo(() => new Map(clubs.map((c) => [c.id, c.name])), [clubs]);
  const zonesById = useMemo(() => new Map(zones.map((z) => [z.id, z.name])), [zones]);

  // Selected role for grant
  const selectedRole = roles.find((r) => r.id === grantRoleId) ?? null;
  const grantScopeType = selectedRole?.scopeType ?? 'none';

  // Mutations
  const grantMutation = useMutation({
    mutationFn: (input: GrantInput) =>
      grantUserRole({
        userId: managingUser!.id,
        roleId: input.roleId,
        scopeType: input.scopeType,
        scopeId: input.scopeType === 'none' ? undefined : input.scopeId,
      }),
    onSuccess: () => {
      setGrantRoleId('');
      setGrantScopeId('');
      setGrantError(null);
      void qc.invalidateQueries({ queryKey: ['user-directory'] });
    },
    onError: (err) => setGrantError(errorMessageOf(err)),
  });

  const revokeMutation = useMutation({
    mutationFn: (grantId: string) => revokeUserRole(grantId),
    onSuccess: () => {
      setRevokingGrantId(null);
      void qc.invalidateQueries({ queryKey: ['user-directory'] });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: () =>
      createAdminUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword.trim() || undefined,
        clubId: newUserClubId,
        roleKey: newUserRoleKey,
        phone: newUserPhone.trim() || undefined,
      }),
    onSuccess: () => {
      setIsAddUserOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('Rac3011#2026');
      setNewUserClubId('DISTRICT');
      setNewUserRoleKey('member');
      setNewUserPhone('');
      setNewUserError(null);
      toast({ title: 'User ID created and configured successfully', tone: 'success' });
      void qc.invalidateQueries({ queryKey: ['user-directory'] });
    },
    onError: (err) => setNewUserError(errorMessageOf(err)),
  });

  // Edit User modal state
  const [editingUser, setEditingUser] = useState<UserDirectoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRotaryId, setEditRotaryId] = useState('');
  const [editClubId, setEditClubId] = useState('DISTRICT');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const editUserMutation = useMutation({
    mutationFn: () =>
      updateAdminUser(editingUser!.id, {
        name: editName.trim() || undefined,
        email: editEmail.trim() || undefined,
        rotaryId: editRotaryId.trim() || null,
        clubId: editClubId || undefined,
        phone: editPhone.trim() || null,
        password: editPassword.trim() || undefined,
      }),
    onSuccess: () => {
      setEditingUser(null);
      setEditError(null);
      toast({ title: 'User ID and profile updated successfully', tone: 'success' });
      void qc.invalidateQueries({ queryKey: ['user-directory'] });
    },
    onError: (err) => setEditError(errorMessageOf(err)),
  });

  const superAdminRole = roles.find((r) => r.key === 'super_admin');

  // Client-side filtering of user directory
  const filteredUsers = useMemo(() => {
    let list = directoryQuery.data ?? [];

    if (selectedRoleFilter !== 'ALL') {
      list = list.filter((u) => u.roles.some((r) => r.roleKey === selectedRoleFilter));
    }

    if (selectedClubFilter !== 'ALL') {
      list = list.filter((u) => u.profile?.clubId === selectedClubFilter);
    }

    return list;
  }, [directoryQuery.data, selectedRoleFilter, selectedClubFilter]);

  // Scope label helper
  function formatScope(scopeType: ScopeType, scopeId: string | null): string {
    if (scopeType === 'none' || !scopeId) return 'District-wide';
    if (scopeType === 'club') return clubsById.get(scopeId) ?? scopeId;
    if (scopeType === 'zone') return zonesById.get(scopeId) ?? scopeId;
    return scopeId;
  }

  // Active user being managed updated from live query
  const liveManagingUser = useMemo(() => {
    if (!managingUser) return null;
    return (directoryQuery.data ?? []).find((u) => u.id === managingUser.id) ?? managingUser;
  }, [directoryQuery.data, managingUser]);

  // Table columns
  const columns: Column<UserDirectoryItem>[] = [
    {
      key: 'user',
      header: 'Member / User',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 font-bold text-accent">
            {u.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="m-0 font-bold text-fg">{u.name}</p>
              {u.profile?.rotaryId ? (
                <span className="inline-flex items-center rounded bg-accent/15 px-1.5 py-0.5 text-[10.5px] font-mono font-bold text-accent">
                  ID: {u.profile.rotaryId}
                </span>
              ) : (
                <span className="inline-flex items-center rounded bg-fg-4/15 px-1.5 py-0.5 text-[10px] text-fg-3">
                  No Rotary ID
                </span>
              )}
            </div>
            <p className="m-0 text-[12px] text-fg-3">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'club',
      header: 'Club Affiliation',
      cell: (u) =>
        u.profile ? (
          <div>
            <p className="m-0 font-medium text-fg">{u.profile.clubShortName || u.profile.clubName}</p>
            <span
              className={cn(
                'inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                u.profile.status === 'approved'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : u.profile.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
              )}
            >
              {u.profile.status}
            </span>
          </div>
        ) : (
          <span className="text-[12px] text-fg-4">Direct User Account</span>
        ),
    },
    {
      key: 'roles',
      header: 'Active Roles & Scope',
      cell: (u) =>
        u.roles.length === 0 ? (
          <span className="rounded bg-fg-4/15 px-2 py-0.5 text-[11px] text-fg-3">No roles assigned</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {u.roles.map((r) => {
              const isSuper = r.roleKey === 'super_admin';
              const isDsc = r.roleKey === 'dsc' || r.roleKey === 'drr';
              return (
                <span
                  key={r.id}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-semibold',
                    isSuper
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : isDsc
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : 'bg-accent/10 text-accent border border-accent/20',
                  )}
                >
                  <Shield size={11} aria-hidden />
                  {r.roleName}
                  {r.scopeType !== 'none' && (
                    <span className="text-[10px] opacity-80">({formatScope(r.scopeType, r.scopeId)})</span>
                  )}
                </span>
              );
            })}
          </div>
        ),
    },
    {
      key: '__actions',
      header: '',
      align: 'right',
      cell: (u) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="soft"
            size="sm"
            onClick={() => {
              setEditingUser(u);
              setEditName(u.name);
              setEditEmail(u.email);
              setEditRotaryId(u.profile?.rotaryId || '');
              setEditClubId(u.profile?.clubId || 'DISTRICT');
              setEditPhone(u.profile?.phone || '');
              setEditPassword('');
              setEditError(null);
            }}
          >
            <Edit3 size={13} className="mr-1" />
            Edit ID
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setManagingUser(u);
              setGrantRoleId('');
              setGrantScopeId('');
              setGrantError(null);
            }}
          >
            Manage Access
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container width="wide">
      <Section
        eyebrow="District 3011 Security & RBAC"
        title="Access Control & Role Granter"
        description="Comprehensive governance over every user ID, active roles, club scopes, and specific capability permissions across District 3011."
      >
        {/* Top Actions & Quick Stats */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-1.5 text-[13px] font-semibold text-fg">
              <Users size={15} className="text-accent" />
              {directoryQuery.data?.length ?? 0} Total IDs in District
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              className="flex items-center gap-2"
              onClick={() => setIsAddUserOpen(true)}
            >
              <UserPlus size={15} />
              Add User / Create ID
            </Button>
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => setIsMatrixOpen(true)}
            >
              <Key size={14} className="text-accent" />
              Explore Extensive Permissions Matrix (All 41 Capabilities)
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Search Users" hint="By name, email, or rotary ID">
              <div className="relative">
                <Input
                  placeholder="Search members or officers…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={14} className="pointer-events-none absolute right-3 top-3 text-fg-3" />
              </div>
            </Field>

            <Field label="Filter by Role">
              <Select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Roles' },
                  { value: 'super_admin', label: 'Super Admin' },
                  { value: 'dsc', label: 'District Secretariat / Council (DSC)' },
                  { value: 'drr', label: 'District Rotaract Representative (DRR)' },
                  { value: 'zrr', label: 'Zonal Representative (ZRR)' },
                  { value: 'president', label: 'Club President' },
                  { value: 'secretary', label: 'Club Secretary' },
                  { value: 'member', label: 'Club Member' },
                  { value: 'project_admin:ride', label: 'The RIDE Admin' },
                  { value: 'editing_team', label: 'Website Editing Team' },
                ]}
              />
            </Field>

            <Field label="Filter by Club">
              <Select
                value={selectedClubFilter}
                onChange={(e) => setSelectedClubFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Clubs' },
                  ...clubs.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </Field>
          </div>
        </Card>

        {/* Directory Table */}
        {directoryQuery.isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : directoryQuery.isError ? (
          <ErrorState body="Could not load users directory." />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No users match your filter"
            body="Try loosening your search query or role filter."
          />
        ) : (
          <Table<UserDirectoryItem> columns={columns} rows={filteredUsers} rowKey={(u) => u.id} />
        )}

        {/* User Role Management Modal */}
        {liveManagingUser && (
          <Modal
            open={Boolean(managingUser)}
            onClose={() => setManagingUser(null)}
            title={`Manage Access: ${liveManagingUser.name}`}
            size="lg"
          >
            <div className="flex flex-col gap-6">
              {/* User summary card */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-surface-2 p-4">
                <div>
                  <h3 className="m-0 text-[15px] font-bold text-fg">{liveManagingUser.name}</h3>
                  <p className="m-0 text-[12.5px] text-fg-3">{liveManagingUser.email}</p>
                  {liveManagingUser.profile && (
                    <p className="m-0 mt-1 text-[12px] text-accent font-medium">
                      Club: {liveManagingUser.profile.clubName} (Status: {liveManagingUser.profile.status})
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono text-[11px] text-fg-4">User ID: {liveManagingUser.id}</span>
                </div>
              </div>

              {/* Current Role Grants */}
              <div>
                <h4 className="m-0 mb-3 text-[14px] font-bold tracking-tight text-fg flex items-center gap-2">
                  <Shield size={16} className="text-accent" /> Active Role Grants
                </h4>
                {liveManagingUser.roles.length === 0 ? (
                  <p className="m-0 rounded border border-dashed border-border p-4 text-[13px] text-fg-3 text-center">
                    This user does not currently hold any assigned roles.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {liveManagingUser.roles.map((grant) => (
                      <div
                        key={grant.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 bg-surface-1 p-3 transition hover:border-border"
                      >
                        <div>
                          <p className="m-0 font-bold text-fg text-[13.5px] flex items-center gap-2">
                            {grant.roleName}
                            <span className="font-mono text-[11px] font-normal text-fg-3">({grant.roleKey})</span>
                          </p>
                          <p className="m-0 text-[12px] text-fg-2">
                            Scope: <span className="font-semibold">{formatScope(grant.scopeType, grant.scopeId)}</span>
                          </p>
                          <p className="m-0 mt-1 text-[11px] text-fg-4">
                            Grants {grant.permissions.length} capabilities
                          </p>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={revokeMutation.isPending && revokingGrantId === grant.id}
                          onClick={() => {
                            setRevokingGrantId(grant.id);
                            revokeMutation.mutate(grant.id);
                          }}
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Super Admin Quick Promotion Card */}
              {!liveManagingUser.roles.some((r) => r.roleKey === 'super_admin') && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <div>
                    <h4 className="m-0 text-[14px] font-bold text-fg flex items-center gap-2">
                      <Crown size={16} className="text-rose-500" /> Super Admin Access
                    </h4>
                    <p className="m-0 text-[12px] text-fg-3 mt-0.5">
                      Promote {liveManagingUser.name} to District Super Admin with unscoped access across all 41 capabilities.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={!superAdminRole || grantMutation.isPending}
                    loading={grantMutation.isPending && grantRoleId === superAdminRole?.id}
                    onClick={() => {
                      if (!superAdminRole) return;
                      setGrantRoleId(superAdminRole.id);
                      grantMutation.mutate({
                        roleId: superAdminRole.id,
                        scopeType: 'none',
                      });
                    }}
                  >
                    <Crown size={13} className="mr-1.5" />
                    Assign Super Admin
                  </Button>
                </div>
              )}

              {/* Grant New Role Section */}
              <div className="rounded-xl border border-accent/25 bg-accent/5 p-4">
                <h4 className="m-0 mb-3 text-[14px] font-bold text-fg flex items-center gap-2">
                  <Key size={15} className="text-accent" /> Grant New Role to {liveManagingUser.name}
                </h4>

                {grantError && (
                  <div className="mb-4">
                    <Alert tone="error" title="Could not grant role">
                      {grantError}
                    </Alert>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Choose Role">
                    <Select
                      value={grantRoleId}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        setGrantRoleId(nextId);
                        const matched = roles.find((r) => r.id === nextId);
                        if (matched?.key.includes('ride')) {
                          setGrantScopeId('ride');
                        } else {
                          setGrantScopeId('');
                        }
                      }}
                      placeholder="Select a role…"
                      options={roles.map((r) => ({
                        value: r.id,
                        label: `${r.name} (${r.key})`,
                      }))}
                    />
                  </Field>

                  {grantScopeType === 'club' && (
                    <Field label="Target Club Scope" hint="Role applies only to this club">
                      <Select
                        value={grantScopeId}
                        onChange={(e) => setGrantScopeId(e.target.value)}
                        placeholder="Choose club…"
                        options={clubs.map((c) => ({ value: c.id, label: c.name }))}
                      />
                    </Field>
                  )}

                  {grantScopeType === 'zone' && (
                    <Field label="Target Zone Scope" hint="Role applies to all clubs in this zone">
                      <Select
                        value={grantScopeId}
                        onChange={(e) => setGrantScopeId(e.target.value)}
                        placeholder="Choose zone…"
                        options={zones.map((z) => ({ value: z.id, label: z.name }))}
                      />
                    </Field>
                  )}

                  {grantScopeType === 'project' && (
                    <Field label="Target Project Scope" hint="Select the project this role oversees">
                      <Select
                        value={grantScopeId}
                        onChange={(e) => setGrantScopeId(e.target.value)}
                        placeholder="Choose project…"
                        options={[
                          { value: 'ride', label: 'The RIDE: Delhi Meri Jaan (ride)' },
                          { value: 'mission3011', label: 'Mission 3011 Blood Registry (mission3011)' },
                          { value: 'drishti', label: 'Drishti Vision Care (drishti)' },
                          { value: 'rcl', label: 'Rotaract Cricket League (rcl)' },
                          { value: 'careerbridge', label: 'CareerBridge Fellowship (careerbridge)' },
                        ]}
                      />
                    </Field>
                  )}

                  {grantScopeType === 'none' && selectedRole && (
                    <div className="flex items-center">
                      <p className="m-0 rounded bg-surface-2 p-2.5 text-[12px] text-fg-2">
                        Scope: <span className="font-semibold text-fg">District-wide</span> (Unscoped access across all clubs).
                      </p>
                    </div>
                  )}
                </div>

                {/* Capabilities preview */}
                {selectedRole && (
                  <div className="mt-3 rounded-lg bg-surface-1 p-3">
                    <p className="m-0 text-[12px] font-bold text-fg mb-1.5">
                      Permissions included in {selectedRole.name}:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedRole.permissionKeys.map((k) => (
                        <span key={k} className="rounded bg-accent/10 px-2 py-0.5 font-mono text-[10.5px] text-accent">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button
                    disabled={
                      !selectedRole ||
                      (grantScopeType !== 'none' && !grantScopeId.trim()) ||
                      grantMutation.isPending
                    }
                    loading={grantMutation.isPending}
                    onClick={() => {
                      if (!selectedRole) return;
                      grantMutation.mutate({
                        roleId: selectedRole.id,
                        scopeType: selectedRole.scopeType,
                        scopeId: grantScopeId,
                      });
                    }}
                  >
                    Confirm & Grant Role
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Extensive Permissions Matrix Modal */}
        <Modal
          open={isMatrixOpen}
          onClose={() => setIsMatrixOpen(false)}
          title="District 3011 — Complete Permissions & Capabilities Matrix"
          size="xl"
        >
          <div className="flex flex-col gap-6">
            <p className="m-0 text-[13.5px] text-fg-2">
              District 3011 employs a granular role-based access control (RBAC) architecture. Every API route and
              portal capability is guarded by one of these 41 specific permission keys.
            </p>

            <div className="flex flex-col gap-6">
              {PERMISSION_DOMAINS.map((domain) => (
                <div key={domain.name} className="rounded-xl border border-border bg-surface-1 p-4">
                  <h3 className="m-0 text-[15px] font-bold text-fg flex items-center gap-2">
                    <Shield size={16} className="text-accent" /> {domain.name}
                  </h3>
                  <p className="m-0 mb-3 text-[12px] text-fg-3">{domain.description}</p>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {domain.permissions.map((p) => {
                      const grantingRoles = roles.filter((r) => r.permissionKeys.includes(p.key));
                      return (
                        <div
                          key={p.key}
                          className="rounded-lg border border-border/50 bg-surface-2 p-3 transition hover:border-accent/40"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[13px] text-fg">{p.name}</span>
                            <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                              {p.key}
                            </span>
                          </div>
                          <p className="m-0 mt-1 text-[12px] text-fg-2">{p.desc}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] text-fg-4 uppercase font-semibold">Granted by:</span>
                            {grantingRoles.map((r) => (
                              <span
                                key={r.id}
                                className="rounded bg-fg-4/15 px-1.5 py-0.2 font-medium text-[10.5px] text-fg-2"
                              >
                                {r.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>

        {/* Create User ID Modal for Super Admin */}
        <Modal
          open={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          title="Create New User ID & Assign System Roles"
          description="Provision a new member or district leader with credentials, club affiliation, and system access."
          size="md"
        >
          <div className="flex flex-col gap-4">
            {newUserError && (
              <Alert tone="error" title="Could not create user">
                {newUserError}
              </Alert>
            )}

            <Field label="Full Name" required hint="e.g. Rtr. Divyanshu Katiyar">
              <Input
                placeholder="Enter full name…"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </Field>

            <Field label="Email Address" required hint="Must be valid for sign-in & OTP delivery">
              <Input
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </Field>

            <Field label="Club Affiliation" required hint="Select club or District Secretariat">
              <Select
                value={newUserClubId}
                onChange={(e) => setNewUserClubId(e.target.value)}
                options={[
                  { value: 'DISTRICT', label: 'District 3011 (Secretariat & Council)' },
                  ...clubs.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </Field>

            <Field label="System Role" required hint="Determines administrative permissions">
              <Select
                value={newUserRoleKey}
                onChange={(e) => setNewUserRoleKey(e.target.value)}
                options={[
                  { value: 'member', label: 'Rotaract Member (Club Scope)' },
                  { value: 'club_admin', label: 'Club Admin (President / Secretary)' },
                  { value: 'dsc', label: 'District Secretariat / Council (DSC - District-wide)' },
                  { value: 'super_admin', label: 'District Super Admin (Full Governance)' },
                ]}
              />
            </Field>

            <Field label="Temporary Password" hint="Defaults to Rac3011#2026">
              <Input
                type="text"
                placeholder="Rac3011#2026"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </Field>

            <Field label="Phone Number" hint="Optional mobile number">
              <Input
                type="tel"
                placeholder="9876543210"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
              />
            </Field>

            <div className="mt-4 flex justify-end gap-3 border-t border-line pt-4">
              <Button variant="secondary" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!newUserName.trim() || !newUserEmail.trim() || createUserMutation.isPending}
                loading={createUserMutation.isPending}
                onClick={() => createUserMutation.mutate()}
              >
                Create Account & Grant Access
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit User ID & Profile Modal */}
        {editingUser && (
          <Modal
            open={Boolean(editingUser)}
            onClose={() => setEditingUser(null)}
            title={`Edit User ID & Profile: ${editingUser.name}`}
            description="Super Admin capability to update user name, Rotary ID, email, club affiliation, or reset their password."
            size="md"
          >
            <div className="flex flex-col gap-4">
              {editError && (
                <Alert tone="error" title="Could not update user">
                  {editError}
                </Alert>
              )}

              <Field label="Full Name" required hint="Official name as recorded in Rotary/Rotaract">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Divyanshu Katiyar"
                />
              </Field>

              <Field label="Rotary ID" hint="Used for 1-click Rotary ID login (e.g. 11545987)">
                <Input
                  value={editRotaryId}
                  onChange={(e) => setEditRotaryId(e.target.value)}
                  placeholder="e.g. 11545987"
                />
              </Field>

              <Field label="Email Address" required hint="Primary login email address">
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. member@rac3011.org"
                />
              </Field>

              <Field label="Phone / Mobile Number" hint="Optional mobile contact">
                <Input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </Field>

              <Field label="Club Affiliation" required hint="Select club or District Secretariat">
                <Select
                  value={editClubId}
                  onChange={(e) => setEditClubId(e.target.value)}
                  options={[
                    { value: 'DISTRICT', label: 'District 3011 (Secretariat & Council)' },
                    ...clubs.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
              </Field>

              <Field label="Reset Password (Optional)" hint="Leave blank to keep current password">
                <Input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password (min. 8 characters)"
                />
              </Field>

              <div className="mt-4 flex justify-end gap-3 border-t border-line pt-4">
                <Button variant="secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  loading={editUserMutation.isPending}
                  disabled={!editName.trim() || !editEmail.trim() || editUserMutation.isPending}
                  onClick={() => editUserMutation.mutate()}
                >
                  Save ID & Profile Changes
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </Section>
    </Container>
  );
}
