import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { ApiError } from '@/lib/api';
import {
  changeMemberPassword,
  commitMemberImport,
  fetchMembers,
  previewMemberImport,
  resetMemberPassword,
  updateMemberStatus,
} from '@/lib/members/api';
import type { ImportPreviewRow, Member } from '@/lib/members/types';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { KeyRound, ShieldAlert, Users, UserCheck, Clock } from 'lucide-react';

const STATUS_TONE: Record<string, BadgeTone> = { pending: 'amber', approved: 'green', suspended: 'red' };

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

function MemberPasswordModal({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [customPassword, setCustomPassword] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () => resetMemberPassword(member!.id),
    onSuccess: (data) => {
      if (data.temporaryPassword) {
        setTemporaryPassword(data.temporaryPassword);
      }
      toast({ title: 'Password reset generated', tone: 'success' });
    },
    onError: (e) => toast({ title: e instanceof ApiError ? e.message : 'Reset failed', tone: 'error' }),
  });

  const changeMutation = useMutation({
    mutationFn: () => changeMemberPassword(member!.id, customPassword),
    onSuccess: () => {
      toast({ title: 'Password updated successfully', tone: 'success' });
      setCustomPassword('');
      onClose();
    },
    onError: (e) => toast({ title: e instanceof ApiError ? e.message : 'Change password failed', tone: 'error' }),
  });

  const handleCopy = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast({ title: 'Copied to clipboard!', tone: 'success' });
    }
  };

  return (
    <Modal
      open={Boolean(member)}
      onClose={() => {
        setTemporaryPassword(null);
        setCustomPassword('');
        onClose();
      }}
      title={`Password Controls · ${member?.fullName}`}
      footer={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-lg bg-surface-2 p-3 text-[13px] text-fg-2">
          Manage login credentials for <strong>{member?.email}</strong>.
        </div>

        {temporaryPassword ? (
          <div className="flex flex-col gap-2 rounded-lg border border-accent/30 bg-accent/5 p-4">
            <p className="m-0 text-[12px] font-bold text-accent">TEMPORARY PASSWORD GENERATED</p>
            <div className="flex items-center justify-between rounded bg-surface p-2 font-mono text-[14px] font-bold text-fg border border-line">
              <span>{temporaryPassword}</span>
              <Button size="sm" variant="secondary" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="m-0 text-[11px] text-fg-3">
              Share this temporary password securely with the member so they can log in and update their profile.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-line p-3">
              <p className="m-0 mb-1 text-[12px] font-bold text-fg">Option 1: Quick Temporary Password</p>
              <p className="m-0 mb-3 text-[11.5px] text-fg-3">
                Instantly generate and view a temporary reset password for this member.
              </p>
              <Button
                size="sm"
                variant="secondary"
                loading={resetMutation.isPending}
                onClick={() => resetMutation.mutate()}
              >
                Generate &amp; View Password
              </Button>
            </div>

            <div className="rounded-lg border border-line p-3">
              <p className="m-0 mb-1 text-[12px] font-bold text-fg">Option 2: Set Custom Password</p>
              <div className="flex flex-col gap-2 mt-2">
                <Input
                  type="password"
                  placeholder="Enter new password (min 8 chars)"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                />
                <Button
                  size="sm"
                  disabled={customPassword.length < 8}
                  loading={changeMutation.isPending}
                  onClick={() => changeMutation.mutate()}
                >
                  Save New Password
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function RejectModal({
  memberId,
  onClose,
  onDone,
}: {
  memberId: string | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState('');
  const mutation = useMutation({
    mutationFn: () => updateMemberStatus(memberId as string, { status: 'suspended', rejectionReason: reason }),
    onSuccess: () => {
      setReason('');
      onDone();
    },
  });
  return (
    <Modal
      open={Boolean(memberId)}
      onClose={onClose}
      title="Not ours?"
      footer={
        <Button
          disabled={!reason.trim()}
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Decline this account
        </Button>
      }
    >
      <Textarea
        rows={3}
        aria-label="Reason"
        placeholder="e.g. Signed up under the wrong club"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </Modal>
  );
}

function ImportModal({ clubId, open, onClose }: { clubId: string; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csv, setCsv] = useState('');
  const [preview, setPreview] = useState<{ id: string; rows: ImportPreviewRow[] } | null>(null);

  const previewMutation = useMutation({
    mutationFn: () => previewMemberImport(clubId, csv),
    onSuccess: (res) => setPreview({ id: res.id, rows: res.rows }),
  });

  const commitMutation = useMutation({
    mutationFn: () => {
      const rows = (preview?.rows ?? []).filter((r) => r.outcome === 'new');
      return commitMemberImport(preview!.id, clubId, rows);
    },
    onSuccess: (res) => {
      toast({ title: `Imported ${res.committed} member(s)`, tone: 'success' });
      void qc.invalidateQueries({ queryKey: ['members'] });
      close();
    },
  });

  function close() {
    setCsv('');
    setPreview(null);
    onClose();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsv(await file.text());
  }

  const newCount = (preview?.rows ?? []).filter((r) => r.outcome === 'new').length;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Import a roster"
      footer={
        preview ? (
          <Button loading={commitMutation.isPending} disabled={newCount === 0} onClick={() => commitMutation.mutate()}>
            Add {newCount} member{newCount === 1 ? '' : 's'}
          </Button>
        ) : (
          <Button loading={previewMutation.isPending} disabled={!csv.trim()} onClick={() => previewMutation.mutate()}>
            Preview
          </Button>
        )
      }
    >
      {!preview ? (
        <div className="flex flex-col gap-3">
          <p className="m-0 text-[12.5px] text-fg-2">
            A CSV with columns <code>fullName, email, phone, rotaryId</code>. Email is the dedup key &ndash; a row
            matching an existing member is skipped, not duplicated.
          </p>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={(e) => void onFile(e)} />
          <Textarea
            rows={6}
            aria-label="CSV contents"
            placeholder="fullName,email,phone,rotaryId"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[12.5px] text-fg-2">
            {preview.rows.length} rows &middot; {newCount} new &middot;{' '}
            {preview.rows.filter((r) => r.outcome === 'duplicate').length} duplicate &middot;{' '}
            {preview.rows.filter((r) => r.outcome === 'invalid').length} invalid
          </p>
          <ul className="m-0 max-h-64 list-none overflow-y-auto p-0">
            {preview.rows.map((r) => (
              <li key={r.lineNumber} className="flex items-center justify-between gap-2 border-b border-line py-1.5 text-[12px]">
                <span className="truncate text-fg">{r.fullName || r.email}</span>
                <Badge tone={r.outcome === 'new' ? 'green' : r.outcome === 'duplicate' ? 'neutral' : 'red'}>
                  {r.outcome}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}

export function AdminMembersPage() {
  useDocumentMeta({ title: 'Members' });
  const { me } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const clubs = me?.clubs ?? [];
  const [clubId, setClubId] = useState(clubs[0]?.id ?? '');
  const [q, setQ] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [passwordMember, setPasswordMember] = useState<Member | null>(null);

  const effectiveClubId = clubId || clubs[0]?.id || '';
  const membersQuery = useQuery({
    queryKey: ['members', effectiveClubId, q],
    queryFn: () => fetchMembers({ clubId: effectiveClubId || undefined, q: q || undefined, pageSize: 200 }),
    enabled: Boolean(effectiveClubId) || clubs.length === 0,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => updateMemberStatus(id, { status: 'approved' }),
    onSuccess: () => {
      toast({ title: 'Member approved', tone: 'success' });
      void qc.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (e) => toast({ title: e instanceof ApiError ? e.message : 'Could not approve', tone: 'error' }),
  });

  const suspendMutation = useMutation({
    mutationFn: (member: Member) =>
      updateMemberStatus(member.id, {
        status: member.status === 'suspended' ? 'approved' : 'suspended',
        rejectionReason: member.status === 'suspended' ? null : 'Suspended by club officer',
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['members'] }),
  });

  const items = useMemo(() => membersQuery.data?.items ?? [], [membersQuery.data]);
  const pending = useMemo(() => items.filter((m) => m.status === 'pending'), [items]);
  const roster = useMemo(() => items.filter((m) => m.status !== 'pending'), [items]);
  const approved = useMemo(() => items.filter((m) => m.status === 'approved'), [items]);
  const suspended = useMemo(() => items.filter((m) => m.status === 'suspended'), [items]);
  const totalCount = membersQuery.data?.total ?? items.length;

  if (membersQuery.isError) {
    return (
      <Container>
        <ErrorState title="Couldn't load members" onRetry={() => void membersQuery.refetch()} />
      </Container>
    );
  }

  return (
    <Container width="wide">
      <Section
        eyebrow="Club & District Membership Management"
        title="Members"
        description={`Manage roster, login credentials, and approval queue (${totalCount} total members recorded).`}
      >
        {/* Stat Overview Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Users size={20} />
            </div>
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-fg-3">Total Members</p>
              <p className="m-0 text-[20px] font-black text-fg">{totalCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-fg-3">Active Roster</p>
              <p className="m-0 text-[20px] font-black text-fg">{approved.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-fg-3">Pending Approval</p>
              <p className="m-0 text-[20px] font-black text-fg">{pending.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-fg-3">Suspended</p>
              <p className="m-0 text-[20px] font-black text-fg">{suspended.length}</p>
            </div>
          </div>
        </div>

        {clubs.length > 1 && (
          <div className="mb-5 max-w-[260px]">
            <Select
              aria-label="Club"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              options={clubs.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
        )}

        {membersQuery.isPending ? (
          <Skeleton shape="rect" className="h-64" />
        ) : (
          <>
            {pending.length > 0 && (
              <div className="mb-6">
                <p className="m-0 mb-3 text-[10.5px] font-bold tracking-[1px] text-fg-3">
                  WAITING FOR APPROVAL · {pending.length}
                </p>
                <div className="flex flex-col gap-2.5">
                  {pending.map((m) => (
                    <Card key={m.id}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={m.fullName} size="md" />
                          <div>
                            <p className="m-0 text-[13px] font-bold text-fg">{m.fullName}</p>
                            <p className="m-0 text-[11.5px] text-fg-3">
                              {m.email} &middot; Signed up {timeAgo(m.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" loading={approveMutation.isPending} onClick={() => approveMutation.mutate(m.id)}>
                            Approve
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setRejectingId(m.id)}>
                            Not ours
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="m-0 text-[10.5px] font-bold tracking-[1px] text-fg-3">ROSTER</p>
              <div className="flex items-center gap-2">
                <Input
                  aria-label="Search the roster"
                  placeholder="Search the roster…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <Button variant="secondary" onClick={() => setImportOpen(true)}>
                  Import a roster
                </Button>
              </div>
            </div>

            {roster.length === 0 ? (
              <EmptyState title="No members on the roster yet" />
            ) : (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {roster.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-line-accent px-3 py-2.5 bg-surface">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.fullName} src={m.photoUrl ?? undefined} size="md" />
                      <div>
                        <p className="m-0 text-[13px] font-bold text-fg">{m.fullName}</p>
                        <p className="m-0 text-[11.5px] text-fg-3">{[m.email, ...m.skills].filter(Boolean).join(' · ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={STATUS_TONE[m.status]}>{m.status.toUpperCase()}</Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1.5"
                        onClick={() => setPasswordMember(m)}
                      >
                        <KeyRound size={13} />
                        <span>Password</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={suspendMutation.isPending}
                        onClick={() => suspendMutation.mutate(m)}
                      >
                        {m.status === 'suspended' ? 'Reinstate' : 'Suspend'}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-fg-3">Showing {roster.length} of {totalCount}</p>
          </>
        )}
      </Section>

      <RejectModal
        memberId={rejectingId}
        onClose={() => setRejectingId(null)}
        onDone={() => {
          setRejectingId(null);
          void qc.invalidateQueries({ queryKey: ['members'] });
        }}
      />
      <ImportModal clubId={effectiveClubId} open={importOpen} onClose={() => setImportOpen(false)} />
      <MemberPasswordModal member={passwordMember} onClose={() => setPasswordMember(null)} />
    </Container>
  );
}

