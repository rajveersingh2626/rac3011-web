import { useState } from 'react';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api';
import { fetchZones } from '@/lib/clubs';
import { acceptPrivacyPolicy, fetchDirectory, fetchSkillTags, requestMemberContact } from '@/lib/members/api';
import type { DirectoryEntry } from '@/lib/members/types';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Alert } from '@/components/ui/Alert';

function PrivacyGate({ onAccepted }: { onAccepted: () => void }) {
  const mutation = useMutation({
    mutationFn: acceptPrivacyPolicy,
    onSuccess: onAccepted,
  });
  return (
    <Card tone="dashed" className="text-center">
      <p className="m-0 mb-2 text-[15.5px] font-extrabold text-fg">Read the privacy policy first</p>
      <p className="m-0 mb-4 text-[13px] text-fg-2">
        The directory shows other members&apos; names, clubs and skills. Accept the privacy policy to browse
        it &ndash; you can read it before you do.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/privacy-policy" target="_blank" rel="noreferrer">
          <Button variant="secondary">Read the privacy policy</Button>
        </Link>
        <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
          I accept, show me the directory
        </Button>
      </div>
    </Card>
  );
}

export function DirectoryPage() {
  useDocumentMeta({ title: 'Member directory' });
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [skill, setSkill] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [requestTarget, setRequestTarget] = useState<DirectoryEntry | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [requestSuccessMessage, setRequestSuccessMessage] = useState<string | null>(null);

  const zonesQuery = useQuery({ queryKey: ['zones'], queryFn: fetchZones });
  const skillTagsQuery = useQuery({ queryKey: ['skill-tags'], queryFn: fetchSkillTags });
  const directoryQuery = useQuery({
    queryKey: ['directory', q, skill, zoneId],
    queryFn: () => fetchDirectory({ q: q || undefined, skill: skill || undefined, zoneId: zoneId || undefined }),
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      if (!requestTarget) return;
      return requestMemberContact(requestTarget.id, requestReason.trim() || undefined);
    },
    onSuccess: (res) => {
      setRequestSuccessMessage(res?.message || 'Contact request sent successfully.');
      setTimeout(() => {
        setRequestTarget(null);
        setRequestReason('');
        setRequestSuccessMessage(null);
      }, 2500);
    },
  });

  const privacyBlocked =
    directoryQuery.isError && directoryQuery.error instanceof ApiError && directoryQuery.error.code === 'PRIVACY_NOT_ACCEPTED';

  return (
    <Container width="wide">
      <Section
        eyebrow="Searchable by what people can do"
        title="District directory"
        description="Browse members across all clubs and zones. Respecting member privacy, direct contact details can be requested securely through the portal."
      >
        {privacyBlocked ? (
          <PrivacyGate onAccepted={() => void qc.invalidateQueries({ queryKey: ['directory'] })} />
        ) : (
          <>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                aria-label="Search the directory"
                placeholder="Search by name…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Select
                aria-label="Filter by skill"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Any skill"
                options={(skillTagsQuery.data ?? [])
                  .filter((t) => t.kind === 'skill')
                  .map((t) => ({ value: t.label, label: t.label }))}
              />
              <Select
                aria-label="Filter by zone"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                placeholder="Any zone"
                options={(zonesQuery.data ?? []).map((z) => ({ value: z.id, label: z.name }))}
              />
            </div>

            {directoryQuery.isPending ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} shape="rect" className="h-40" />
                ))}
              </div>
            ) : directoryQuery.isError ? (
              <ErrorState title="Couldn't load the directory" onRetry={() => void directoryQuery.refetch()} />
            ) : (directoryQuery.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No members match this search" body="Try a different skill or zone." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(directoryQuery.data?.items ?? []).map((m) => (
                  <Card key={m.id} className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-3">
                        <Avatar name={m.fullName} src={m.photoUrl ?? undefined} size="lg" />
                        <div className="min-w-0">
                          <p className="m-0 text-[13.5px] font-extrabold text-fg">{m.fullName}</p>
                          <p className="m-0 text-[11.5px] text-fg-3">
                            {m.club.name}
                            {m.club.zoneName ? ` · ${m.club.zoneName}` : ''}
                          </p>
                        </div>
                      </div>
                      {(m.skills.length > 0 || m.interests.length > 0) && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {[...m.skills, ...m.interests].slice(0, 4).map((s) => (
                            <Chip key={s} label={s} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setRequestTarget(m);
                          setRequestReason('');
                          setRequestSuccessMessage(null);
                        }}
                      >
                        Request Number
                      </Button>
                      <span className="text-[11.5px] text-fg-3">
                        Verified Member
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal for Requesting Member Contact */}
        {requestTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl border border-line">
              <h3 className="m-0 text-lg font-bold text-fg">
                Request Contact for {requestTarget.fullName}
              </h3>
              <p className="mt-1 text-sm text-fg-2">
                Club: {requestTarget.club.name}
              </p>

              {requestSuccessMessage ? (
                <div className="mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                  <p className="m-0 text-sm font-semibold">{requestSuccessMessage}</p>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-xs text-fg-3">
                    In accordance with district privacy guidelines, your name and email will be forwarded to {requestTarget.fullName} along with your message so they can connect with you.
                  </p>
                  <div className="mt-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-fg-2 mb-1.5">
                      Message / Reason (optional)
                    </label>
                    <Textarea
                      placeholder="e.g. Planning a joint project or would like to connect regarding blood donation initiatives..."
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  {requestMutation.isError && (
                    <p className="mt-2 text-xs text-danger font-semibold">
                      Failed to send request. Please try again.
                    </p>
                  )}
                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      variant="secondary"
                      disabled={requestMutation.isPending}
                      onClick={() => setRequestTarget(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      loading={requestMutation.isPending}
                      onClick={() => requestMutation.mutate()}
                    >
                      Send Request
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          <Alert tone="info" title="Privacy-First Contact Flow">
            To protect our members from unsolicited calls and spam, contact numbers are requested through authenticated notifications rather than published in plain text.
          </Alert>
        </div>
      </Section>
    </Container>
  );
}
