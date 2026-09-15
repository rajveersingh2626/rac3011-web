import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Laptop,
  Smartphone,
  Globe,
  LogOut,
  ShieldAlert,
  Search,
  RefreshCw,
  Clock,
  UserCheck,
  Radio,
} from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { cn } from '@/lib/cn';
import {
  fetchActiveSessions,
  revokeSession,
  revokeUserSessions,
  revokeAllSessions,
  type ActiveSession,
} from '@/lib/auth/sessions.api';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Table, type Column } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';

export function ActiveSessionsPage() {
  useDocumentMeta({ title: 'Active Logins & Sessions | District Admin' });
  const qc = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [sessionToRevoke, setSessionToRevoke] = useState<ActiveSession | null>(null);
  const [userToRevoke, setUserToRevoke] = useState<ActiveSession | null>(null);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  const {
    data: sessions = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<ActiveSession[]>({
    queryKey: ['active-sessions'],
    queryFn: fetchActiveSessions,
    refetchInterval: 30_000,
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: () => {
      toast({ title: 'Session revoked and user logged out', tone: 'success' });
      setSessionToRevoke(null);
      void qc.invalidateQueries({ queryKey: ['active-sessions'] });
    },
    onError: (err: any) => {
      toast({ title: err?.message || 'Failed to revoke session', tone: 'error' });
    },
  });

  const revokeUserMutation = useMutation({
    mutationFn: (userId: string) => revokeUserSessions(userId),
    onSuccess: (res) => {
      toast({
        title: `Logged out all ${res.count} active session(s) for user`,
        tone: 'success',
      });
      setUserToRevoke(null);
      void qc.invalidateQueries({ queryKey: ['active-sessions'] });
    },
    onError: (err: any) => {
      toast({ title: err?.message || 'Failed to log out user sessions', tone: 'error' });
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => revokeAllSessions(),
    onSuccess: (res) => {
      toast({
        title: `Logged out all ${res.count} other active session(s) across portal`,
        tone: 'success',
      });
      setConfirmRevokeAll(false);
      void qc.invalidateQueries({ queryKey: ['active-sessions'] });
    },
    onError: (err: any) => {
      toast({ title: err?.message || 'Failed to revoke all sessions', tone: 'error' });
    },
  });

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.rotaryId && s.rotaryId.toLowerCase().includes(q)) ||
        (s.clubName && s.clubName.toLowerCase().includes(q)) ||
        (s.ipAddress && s.ipAddress.includes(q)) ||
        s.device.toLowerCase().includes(q),
    );
  }, [sessions, search]);

  const distinctUsersCount = useMemo(() => {
    return new Set(sessions.map((s) => s.userId)).size;
  }, [sessions]);

  const columns: Column<ActiveSession>[] = [
    {
      key: 'member',
      header: 'Member / User',
      cell: (row: ActiveSession) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar name={row.name} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-fg text-[13.5px]">{row.name}</span>
              {row.isCurrent && (
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  You (Current)
                </span>
              )}
            </div>
            <div className="text-[12px] text-fg-3 flex items-center gap-2">
              <span>{row.email}</span>
              {row.rotaryId && <span>• ID: {row.rotaryId}</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'club',
      header: 'Club & Roles',
      cell: (row: ActiveSession) => (
        <div className="flex flex-col gap-1 py-1">
          <span className="text-[12.5px] font-medium text-fg">
            {row.clubName || <span className="text-fg-3 italic">District Level</span>}
          </span>
          <div className="flex flex-wrap gap-1">
            {row.roles.length > 0 ? (
              row.roles.map((r: string) => (
                <span
                  key={r}
                  className="rounded bg-brand/10 text-brand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-brand/20"
                >
                  {r}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-fg-3">Member</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Device & IP',
      cell: (row: ActiveSession) => {
        const isMobile =
          row.device.toLowerCase().includes('ios') || row.device.toLowerCase().includes('android');
        return (
          <div className="flex items-center gap-2.5 py-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-fg-2 border border-border/40">
              {isMobile ? <Smartphone className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-medium text-fg">{row.device}</div>
              <div className="text-[11px] text-fg-3 flex items-center gap-1 font-mono">
                <Globe className="h-3 w-3" />
                {row.ipAddress || 'IP Hidden / Proxy'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'activity',
      header: 'Session Timing',
      cell: (row: ActiveSession) => {
        const loginDate = new Date(row.createdAt);
        const expiresDate = new Date(row.expiresAt);
        const diffMinutes = Math.max(0, Math.round((expiresDate.getTime() - Date.now()) / 60000));
        const hoursLeft = Math.floor(diffMinutes / 60);
        const minsLeft = diffMinutes % 60;

        return (
          <div className="flex flex-col gap-0.5 py-1 text-[12px]">
            <span className="text-fg-2 flex items-center gap-1">
              <Clock className="h-3 w-3 text-fg-3" />
              Logged in: {loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({loginDate.toLocaleDateString()})
            </span>
            <span className="text-fg-3 text-[11px]">
              Expires in:{' '}
              <strong className={cn(hoursLeft === 0 ? 'text-amber-500 font-semibold' : 'text-fg-2')}>
                {hoursLeft > 0 ? `${hoursLeft}h ` : ''}
                {minsLeft}m
              </strong>
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (row: ActiveSession) => (
        <div className="flex items-center justify-end gap-1.5 py-1">
          <Button
            size="sm"
            variant="danger"
            onClick={() => setSessionToRevoke(row)}
            title="Terminate this session immediately"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            Logout
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setUserToRevoke(row)}
            title="Log out all active sessions for this user"
            className="text-fg-3 hover:text-danger text-[11.5px]"
          >
            All Devices
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container width="wide">
      <Section
        eyebrow="Security & Access Control"
        title="Active Logins & Sessions"
        description="Monitor all users currently authenticated into the District 3011 portal, inspect active devices, and terminate sessions remotely."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refetch()}
              loading={isRefetching}
            >
              <RefreshCw className={cn('h-4 w-4 mr-1.5', isRefetching && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmRevokeAll(true)}
            >
              <ShieldAlert className="h-4 w-4 mr-1.5" />
              Kill All Other Logins
            </Button>
          </div>
        }
      >
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <Card className="flex items-center gap-4 p-4 border border-border/60 bg-surface">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand border border-brand/20">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[24px] font-extrabold tracking-tight text-fg">
                {isLoading ? <Skeleton className="h-7 w-12" /> : sessions.length}
              </div>
              <div className="text-[12px] font-medium text-fg-3">Total Active Sessions</div>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-4 border border-border/60 bg-surface">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[24px] font-extrabold tracking-tight text-fg">
                {isLoading ? <Skeleton className="h-7 w-12" /> : distinctUsersCount}
              </div>
              <div className="text-[12px] font-medium text-fg-3">Distinct Logged-In Users</div>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-4 border border-border/60 bg-surface">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[24px] font-extrabold tracking-tight text-fg">5 Hours</div>
              <div className="text-[12px] font-medium text-fg-3">Max Session Timeout</div>
            </div>
          </Card>
        </div>

        {/* Filter / Search Bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
            <Input
              type="search"
              placeholder="Search by name, email, rotary ID, club, or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-[12px] text-fg-3">
            Showing <strong>{filteredSessions.length}</strong> of <strong>{sessions.length}</strong> session(s)
          </span>
        </div>

        {/* Sessions Table */}
        <Card className="overflow-hidden border border-border/60 bg-surface">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : isError ? (
            <ErrorState
              title="Could not load active sessions"
              body="An error occurred while communicating with the server."
              onRetry={() => void refetch()}
            />
          ) : filteredSessions.length === 0 ? (
            <EmptyState
              icon={<UserCheck className="h-10 w-10 text-fg-3" />}
              title={search ? 'No matching active sessions' : 'No active sessions'}
              body={
                search
                  ? 'Try refining your search query.'
                  : 'There are currently no active logins on the portal.'
              }
            />
          ) : (
            <Table
              columns={columns}
              rows={filteredSessions}
              rowKey={(row) => row.id}
            />
          )}
        </Card>
      </Section>

      {/* Revoke Single Session Modal */}
      <Modal
        open={Boolean(sessionToRevoke)}
        onClose={() => setSessionToRevoke(null)}
        title="Revoke Session & Log Out"
      >
        {sessionToRevoke && (
          <div className="space-y-4 pt-2">
            <p className="text-[13.5px] text-fg-2">
              Are you sure you want to force log out <strong>{sessionToRevoke.name}</strong> from{' '}
              <strong>{sessionToRevoke.device}</strong> (IP: {sessionToRevoke.ipAddress || 'Hidden'})?
            </p>
            <p className="text-[12px] text-fg-3">
              Their session cookie will be immediately invalidated and their browser will be redirected to the login screen on their next request.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSessionToRevoke(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={revokeMutation.isPending}
                onClick={() => revokeMutation.mutate(sessionToRevoke.id)}
              >
                Force Logout
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Revoke All Sessions for User Modal */}
      <Modal
        open={Boolean(userToRevoke)}
        onClose={() => setUserToRevoke(null)}
        title="Log Out User From All Devices"
      >
        {userToRevoke && (
          <div className="space-y-4 pt-2">
            <p className="text-[13.5px] text-fg-2">
              Are you sure you want to terminate <strong>ALL active sessions</strong> for{' '}
              <strong>{userToRevoke.name}</strong> ({userToRevoke.email})?
            </p>
            <p className="text-[12px] text-fg-3">
              This will log out the member from all mobile devices, laptops, and active browsers immediately.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setUserToRevoke(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={revokeUserMutation.isPending}
                onClick={() => revokeUserMutation.mutate(userToRevoke.userId)}
              >
                Log Out All Devices
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Revoke All Sessions Across Portal Modal */}
      <Modal
        open={confirmRevokeAll}
        onClose={() => setConfirmRevokeAll(false)}
        title="Emergency: Force Logout All Other Users"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 rounded-lg bg-danger/10 p-3 text-danger border border-danger/20">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-[12.5px] leading-relaxed">
              <strong>Warning:</strong> This action will terminate every active login on the District 3011 portal except your current session. All other members, officers, and admins will need to log back in.
            </div>
          </div>
          <p className="text-[13px] text-fg-2">
            Use this action in case of credential leaks, security audits, or district-wide session resets.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setConfirmRevokeAll(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={revokeAllMutation.isPending}
              onClick={() => revokeAllMutation.mutate()}
            >
              Terminate All Other Sessions
            </Button>
          </div>
        </div>
      </Modal>
    </Container>
  );
}
