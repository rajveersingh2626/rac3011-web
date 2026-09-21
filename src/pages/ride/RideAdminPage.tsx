import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDocumentMeta } from '@/lib/meta';
import { currentRyYear } from '@/lib/reports/month';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Table, type Column } from '@/components/ui/Table';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { FileUpload, type FileUploadValue } from '@/components/ui/FileUpload';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Trash2, Building2, CheckCircle2, Users, ShieldCheck, ExternalLink } from 'lucide-react';
import {
  assignHosts,
  createDelegation,
  createGalleryItem,
  deleteGalleryItem,
  fetchDelegations,
  deleteDelegation,
  fetchGalleryItems,
  fetchApprovedHostClubs,
  type ApprovedHostClub,
} from '@/lib/ride/api';
import type { Delegation, DelegationStatus, GalleryItem, GalleryItemKind } from '@/lib/ride/types';
import { ApiError } from '@/lib/api';
import { DelhiMeriJaanAdminTab } from './components/DelhiMeriJaanAdminTab';
import { RideEmailStudioTab } from './components/RideEmailStudioTab';
import { RideFormBuilderTab } from './components/RideFormBuilderTab';
import { RideResourcesPortalTab } from './components/RideResourcesPortalTab';
import { RideActiveLoginsTab } from './components/RideActiveLoginsTab';
import { RideUsersManagementTab } from './components/RideUsersManagementTab';

const DELEGATIONS_KEY = ['ride', 'admin', 'delegations'];
const APPROVED_HOSTS_KEY = ['ride', 'admin', 'approved-hosts'];
const GALLERY_KEY = ['ride', 'admin', 'gallery'];

const STATUS_TONE: Record<DelegationStatus, BadgeTone> = {
  planned: 'neutral',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'red',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface CreateDelegationModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function CreateDelegationModal({ open, onClose, onCreated }: CreateDelegationModalProps) {
  const [ryYear, setRyYear] = useState(String(currentRyYear()));
  const [visitingDistrict, setVisitingDistrict] = useState('');
  const [country, setCountry] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createDelegation({
        ryYear: Number(ryYear),
        visitingDistrict: visitingDistrict.trim(),
        country: country.trim(),
        startsAt,
        endsAt,
        headcount: Number(headcount),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim() || null,
      }),
    onSuccess: () => {
      onCreated();
      onClose();
    },
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not add this delegation.'),
  });

  const valid =
    visitingDistrict.trim() && country.trim() && startsAt && endsAt && headcount.trim() && contactName.trim();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a delegation"
      footer={
        <Button disabled={!valid} loading={mutation.isPending} onClick={() => mutation.mutate()}>
          Add delegation
        </Button>
      }
    >
      <div className="flex flex-col gap-3.5">
        {error && (
          <Alert tone="error" title="Something went wrong">
            {error}
          </Alert>
        )}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Rotary year" required>
            <Input type="number" value={ryYear} onChange={(e) => setRyYear(e.target.value)} />
          </Field>
          <Field label="Visiting district" required>
            <Input value={visitingDistrict} onChange={(e) => setVisitingDistrict(e.target.value)} placeholder="e.g. D2680" maxLength={50} />
          </Field>
        </div>
        <Field label="Country" required>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} maxLength={100} />
        </Field>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Starts" required>
            <DateInput value={startsAt} onChange={setStartsAt} />
          </Field>
          <Field label="Ends" required>
            <DateInput value={endsAt} onChange={setEndsAt} />
          </Field>
        </div>
        <Field label="Headcount" required>
          <Input type="number" min={1} value={headcount} onChange={(e) => setHeadcount(e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Contact name" required>
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} maxLength={200} />
          </Field>
          <Field label="Contact email" hint="Optional">
            <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} maxLength={200} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

interface HostRowState {
  included: boolean;
  daysHosted: string;
  membersSent: string;
  hostFamilyName: string;
  hostFamilyPhone: string;
  hostAddress: string;
}

interface HostAssignmentDrawerProps {
  delegation: Delegation | null;
  approvedHostClubs: ApprovedHostClub[];
  onClose: () => void;
  onSaved: () => void;
}

function HostAssignmentDrawer({ delegation, approvedHostClubs, onClose, onSaved }: HostAssignmentDrawerProps) {
  const [rows, setRows] = useState<Record<string, HostRowState>>({});
  const [targetScope, setTargetScope] = useState<'all' | 'selected'>('all');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Re-seed local state whenever a different delegation opens.
  const [seededFor, setSeededFor] = useState<string | undefined>(undefined);
  if (delegation && seededFor !== delegation.id) {
    const next: Record<string, HostRowState> = {};
    for (const host of approvedHostClubs) {
      const existing = delegation.hosts.find((h) => h.club.id === host.clubId);
      next[host.clubId] = {
        included: Boolean(existing),
        daysHosted: existing ? String(existing.daysHosted) : '3',
        membersSent: existing ? String(existing.membersSent) : '0',
        hostFamilyName: '',
        hostFamilyPhone: '',
        hostAddress: '',
      };
    }
    setRows(next);
    setTargetScope('all');
    setSelectedParticipantIds((delegation.participants || []).map((p) => p.id));
    setSeededFor(delegation.id);
  }

  const mutation = useMutation({
    mutationFn: () => {
      const hosts = Object.entries(rows)
        .filter(([, r]) => r.included)
        .map(([clubId, r]) => ({
          clubId,
          daysHosted: Number(r.daysHosted || 0),
          membersSent: Number(r.membersSent || 0),
          hostFamilyName: r.hostFamilyName.trim() || undefined,
          hostFamilyPhone: r.hostFamilyPhone.trim() || undefined,
          hostAddress: r.hostAddress.trim() || undefined,
        }));
      const pids = targetScope === 'selected' ? selectedParticipantIds : undefined;
      return assignHosts(delegation!.id, hosts, pids);
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not save host assignments.'),
  });

  const participants = delegation?.participants || [];

  return (
    <Drawer
      open={Boolean(delegation)}
      onClose={onClose}
      title={delegation ? `Host Allocation • District ${delegation.visitingDistrict} (${delegation.country})` : 'Assign hosts'}
      footer={
        <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
          Save & Propagate Host Allocation
        </Button>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error" title="Assignment Error">
            {error}
          </Alert>
        </div>
      )}

      {delegation && (
        <div className="space-y-6">
          {/* Delegation Summary Card */}
          <div className="p-4 rounded-2xl border-2 border-[#171515] bg-[#FFFDF7] ride-pop-sm flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#19539D] text-white">
                  <ShieldCheck size={16} />
                </span>
                <span className="text-sm font-black uppercase text-[#171515]">
                  RID {delegation.visitingDistrict} • {delegation.country}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-1 font-medium">
                {formatDate(delegation.startsAt)} – {formatDate(delegation.endsAt)} · Headcount: {delegation.headcount}
              </p>
            </div>
            <Badge tone="green">
              {delegation.approvedParticipantsCount ?? participants.length} Approved Delegates
            </Badge>
          </div>

          {/* Allocation Scope Selection */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
              <Users size={14} className="text-[#19539D]" />
              Delegate Allocation Scope
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetScope('all')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetScope === 'all'
                    ? 'border-[#19539D] bg-blue-50/50 text-[#19539D] font-bold shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <p className="text-xs font-black">All Delegates</p>
                <p className="text-[11px] opacity-80 mt-0.5">Assign host to entire delegation</p>
              </button>

              <button
                type="button"
                onClick={() => setTargetScope('selected')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetScope === 'selected'
                    ? 'border-[#19539D] bg-blue-50/50 text-[#19539D] font-bold shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <p className="text-xs font-black">Selected Delegates</p>
                <p className="text-[11px] opacity-80 mt-0.5">Granular individual selection</p>
              </button>
            </div>

            {targetScope === 'selected' && (
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <p className="text-[11px] font-bold text-neutral-500 uppercase">Select Participants to allocate:</p>
                {participants.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No registered participant profiles found for this district yet.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {participants.map((p) => {
                      const isChecked = selectedParticipantIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedParticipantIds((prev) =>
                              isChecked ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                            );
                          }}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            isChecked ? 'border-blue-400 bg-blue-50/40 text-neutral-900' : 'border-neutral-200 bg-white text-neutral-600'
                          }`}
                        >
                          <div>
                            <span className="font-bold">{p.fullName}</span>
                            <span className="text-neutral-400 ml-1.5">({p.email})</span>
                          </div>
                          <Badge tone={p.approvalStatus === 'approved' ? 'green' : 'neutral'}>
                            {p.approvalStatus}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Approved Host Clubs List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <Building2 size={14} className="text-[#EA6623]" />
                Approved Host Clubs Only ({approvedHostClubs.length})
              </h4>
              <span className="text-[11px] text-neutral-500 font-medium">Verified via Form Builder</span>
            </div>

            {approvedHostClubs.length === 0 ? (
              <EmptyState
                title="No Approved Host Clubs"
                body="Host Clubs must submit the Host Club Application in Form Builder and be marked as 'Approved' before they can be assigned here."
              />
            ) : (
              <div className="space-y-3">
                {approvedHostClubs.map((host) => {
                  const row = rows[host.clubId] ?? {
                    included: false,
                    daysHosted: '3',
                    membersSent: '0',
                    hostFamilyName: '',
                    hostFamilyPhone: '',
                    hostAddress: '',
                  };

                  return (
                    <div
                      key={host.clubId}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        row.included
                          ? 'border-[#19539D] bg-blue-50/20 ride-pop-sm'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            label=""
                            checked={row.included}
                            onChange={(e) =>
                              setRows((prev) => ({
                                ...prev,
                                [host.clubId]: { ...row, included: e.target.checked },
                              }))
                            }
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-neutral-900">
                                {host.club.name}
                              </span>
                              {host.zone && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                                  {host.zone}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 size={10} /> Verified Host Club
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-1">
                              Capacity: {host.capacityDelegates} delegates · {host.homestayAvailable ? 'Homestay Available' : 'No Homestay'} · POC: {host.applicantName} ({host.applicantPhone})
                            </p>
                          </div>
                        </div>

                        {host.proposalDriveUrl && (
                          <a
                            href={host.proposalDriveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-neutral-200 hover:border-neutral-400 text-neutral-600 hover:text-neutral-900 shrink-0"
                            title="View Club Proposal"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>

                      {row.included && (
                        <div className="mt-4 pt-3 border-t border-neutral-200/80 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Days Hosted">
                              <Input
                                type="number"
                                min={1}
                                value={row.daysHosted}
                                onChange={(e) =>
                                  setRows((prev) => ({
                                    ...prev,
                                    [host.clubId]: { ...row, daysHosted: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                            <Field label="Members Sent / Liaison Count">
                              <Input
                                type="number"
                                min={0}
                                value={row.membersSent}
                                onChange={(e) =>
                                  setRows((prev) => ({
                                    ...prev,
                                    [host.clubId]: { ...row, membersSent: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Host Family / Coordinator Name (Optional)">
                              <Input
                                placeholder="e.g. Rtn. Sharma Family"
                                value={row.hostFamilyName}
                                onChange={(e) =>
                                  setRows((prev) => ({
                                    ...prev,
                                    [host.clubId]: { ...row, hostFamilyName: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                            <Field label="Host Family Contact Phone (Optional)">
                              <Input
                                placeholder="+91 98765 XXXXX"
                                value={row.hostFamilyPhone}
                                onChange={(e) =>
                                  setRows((prev) => ({
                                    ...prev,
                                    [host.clubId]: { ...row, hostFamilyPhone: e.target.value },
                                  }))
                                }
                              />
                            </Field>
                          </div>

                          <Field label="Homestay Area / Host Address (Optional)">
                            <Input
                              placeholder="e.g. South Extension, New Delhi"
                              value={row.hostAddress}
                              onChange={(e) =>
                                setRows((prev) => ({
                                  ...prev,
                                  [host.clubId]: { ...row, hostAddress: e.target.value },
                                }))
                              }
                            />
                          </Field>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

function GalleryAdminSection() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: GALLERY_KEY, queryFn: () => fetchGalleryItems({ pageSize: 200 }) });

  const [year, setYear] = useState<string>(String(currentRyYear()));
  const [kind, setKind] = useState<GalleryItemKind>('photo');
  const [mediaFile, setMediaFile] = useState<FileUploadValue | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [headingLeft, setHeadingLeft] = useState('');
  const [headingRight, setHeadingRight] = useState('');
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: GALLERY_KEY });
    void qc.invalidateQueries({ queryKey: ['public', 'ride', 'gallery'] });
    void qc.invalidateQueries({ queryKey: ['ride-public-gallery'] });
    void qc.refetchQueries({ queryKey: ['public', 'ride', 'gallery'] });
  };

  const createMutation = useMutation({
    mutationFn: () => {
      const url = mediaFile?.kind === 'file' 
        ? mediaFile.file.url 
        : mediaFile?.kind === 'link' 
          ? mediaFile.url 
          : mediaUrl.trim();
      if (!url) throw new ApiError(400, 'Please upload a photo/video or provide a media URL first.');
      return createGalleryItem({ 
        year: Number(year), 
        url, 
        kind, 
        caption: caption.trim() || null,
        headingLeft: headingLeft.trim() || null,
        headingRight: headingRight.trim() || null,
      });
    },
    onSuccess: () => {
      invalidate();
      setMediaFile(null);
      setMediaUrl('');
      setCaption('');
      setHeadingLeft('');
      setHeadingRight('');
    },
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not add this item.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGalleryItem(id),
    onSuccess: invalidate,
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not remove this item.'),
  });

  const byYear = new Map<number, GalleryItem[]>();
  for (const item of query.data?.items ?? []) {
    byYear.set(item.year, [...(byYear.get(item.year) ?? []), item]);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <Section 
      eyebrow="RIDE Admin" 
      title="Snap Gallery (Delhi Through Our Lens)" 
      description="Manage full-bleed snap-scroll photos and dynamic background videos shown on the homepage with custom bottom-left and bottom-right headings."
    >
      {error && (
        <div className="mb-3">
          <Alert tone="error" title="Something went wrong">
            {error}
          </Alert>
        </div>
      )}
      <div className="mb-6 grid grid-cols-1 gap-3.5 rounded-[14px] border border-line-accent p-4 sm:grid-cols-2">
        <Field label="Year" required>
          <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </Field>
        <Field label="Media Type" required>
          <Select value={kind} onChange={(e) => setKind(e.target.value as GalleryItemKind)} options={[
            { value: 'photo', label: 'Photo (Auto-WebP)' },
            { value: 'video', label: 'Video (Looping Background)' },
          ]} />
        </Field>

        <div className="sm:col-span-2">
          <Field 
            label={kind === 'photo' ? 'Upload Photo (Auto-compressed to WebP)' : 'Upload Video / Provide MP4 or WebM URL'} 
            hint="Upload media directly, or enter a direct CDN/storage URL"
          >
            <div className="space-y-2">
              <FileUpload 
                tier="dynamic" 
                resourceType="ride_gallery_item" 
                value={mediaFile} 
                onChange={setMediaFile} 
                label={kind === 'photo' ? 'Select photo' : 'Select video file (MP4/WebM)'} 
              />
              <div className="text-xs text-neutral-500 font-medium">
                Or enter direct URL:
              </div>
              <Input 
                value={mediaUrl} 
                onChange={(e) => setMediaUrl(e.target.value)} 
                placeholder={kind === 'photo' ? 'https://example.com/photo.webp' : 'https://example.com/video.mp4'} 
              />
            </div>
          </Field>
        </div>

        <div className="sm:col-span-1">
          <Field label="Heading Left (Bottom-Left on Slide)" hint="e.g. CHANDNI CHOWK AT DAWN">
            <Input 
              value={headingLeft} 
              onChange={(e) => setHeadingLeft(e.target.value)} 
              placeholder="Main Title (Bottom-Left)" 
            />
          </Field>
        </div>

        <div className="sm:col-span-1">
          <Field label="Heading Right (Bottom-Right on Slide)" hint="e.g. THE SOUL OF PURANI DILLI">
            <Input 
              value={headingRight} 
              onChange={(e) => setHeadingRight(e.target.value)} 
              placeholder="Subtitle / Tag (Bottom-Right)" 
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Internal Notes / Caption" hint="Optional admin reference">
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} placeholder="Internal description or photographer credit" />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>
            Add Slide to Snap Gallery
          </Button>
        </div>
      </div>

      {query.isPending ? (
        <Skeleton shape="rect" className="h-40" />
      ) : query.isError ? (
        <ErrorState title="Couldn't load the gallery" onRetry={() => void query.refetch()} />
      ) : years.length === 0 ? (
        <EmptyState title="No snap slides yet" body="Add the first photo or video slide above." />
      ) : (
        <Card rule="accent">
          <div className="flex flex-col gap-5">
            {years.map((y) => (
              <div key={y}>
                <p className="m-0 mb-2 text-[12px] font-bold text-fg">{y} Edition Slides</p>
                <div className="flex flex-col gap-2">
                  {(byYear.get(y) ?? []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-[10px] border border-line p-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs uppercase text-[#19539D]">{item.headingLeft || 'Untitled Slide'}</span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-xs font-mono text-neutral-600">{item.headingRight || 'No Subtitle'}</span>
                        </div>
                        <p className="m-0 truncate text-[11px] text-neutral-500 mt-0.5">{item.url}</p>
                        <p className="m-0 text-[10px] text-fg-3 uppercase font-semibold">{item.kind}</p>
                      </div>
                      <IconButton label="Remove" onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending}>
                        <Trash2 />
                      </IconButton>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </Section>
  );
}

export function RideAdminPage() {
  useDocumentMeta({ title: 'RIDE admin' });
  const [activeTab, setActiveTab] = useState<'dmj' | 'users' | 'forms' | 'email' | 'resources' | 'logins' | 'delegations' | 'gallery'>('dmj');
  const [approvedOnly, setApprovedOnly] = useState(true);
  const qc = useQueryClient();

  const delegationsQuery = useQuery({
    queryKey: [...DELEGATIONS_KEY, { approvedOnly }],
    queryFn: () => fetchDelegations({ approvedOnly, pageSize: 100 }),
  });

  const approvedHostsQuery = useQuery({
    queryKey: APPROVED_HOSTS_KEY,
    queryFn: () => fetchApprovedHostClubs(),
  });

  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState<Delegation | null>(null);

  const invalidateDelegations = () => {
    void qc.invalidateQueries({ queryKey: DELEGATIONS_KEY });
    void qc.invalidateQueries({ queryKey: APPROVED_HOSTS_KEY });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDelegation(id),
    onSuccess: () => {
      invalidateDelegations();
    },
  });

  const handleDeleteDelegation = async (d: Delegation) => {
    if (window.confirm(`Are you sure you want to delete the delegation for District ${d.visitingDistrict} (${d.country})? It will be removed immediately from the portal.`)) {
      try {
        await deleteMutation.mutateAsync(d.id);
      } catch (err: any) {
        alert(err?.message || 'Failed to delete delegation');
      }
    }
  };

  const columns: Column<Delegation>[] = [
    {
      key: 'delegation',
      header: 'District & Delegation',
      cell: (d) => (
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-black text-fg">
              District {d.visitingDistrict} • {d.country}
            </span>
            {d.status === 'confirmed' ? (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold">
                Confirmed Delegation
              </span>
            ) : (
              <Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge>
            )}
          </div>
          <p className="m-0 text-[11px] text-fg-3 mt-0.5">
            {formatDate(d.startsAt)} – {formatDate(d.endsAt)} · POC: {d.contactName} {d.contactEmail ? `(${d.contactEmail})` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'delegates',
      header: 'Approved Delegates',
      cell: (d) => (
        <div className="flex items-center gap-2">
          <Badge tone={(d.approvedParticipantsCount ?? 0) > 0 ? 'green' : 'neutral'}>
            {d.approvedParticipantsCount ?? 0} Approved
          </Badge>
          <span className="text-[11px] text-fg-3">
            / {d.headcount} Expected
          </span>
        </div>
      ),
    },
    {
      key: 'hosts',
      header: 'Assigned Host Clubs',
      cell: (d) =>
        d.hosts.length === 0 ? (
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200">
            Pending Host Allocation
          </span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {d.hosts.map((h) => (
              <span
                key={h.id}
                className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-950 text-[11px] font-bold border border-emerald-300 flex items-center gap-1"
              >
                <Building2 size={11} className="text-emerald-700" />
                {h.club.shortName ?? h.club.name} ({h.daysHosted}d)
              </span>
            ))}
          </div>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (d) => (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setAssigning(d)}>
            Assign hosts
          </Button>
          <button
            type="button"
            className="p-1.5 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-50"
            onClick={() => handleDeleteDelegation(d)}
            disabled={deleteMutation.isPending}
            title="Delete delegation"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const delegations = delegationsQuery.data?.items ?? [];
  const totalApprovedDelegates = delegations.reduce(
    (acc, cur) => acc + (cur.approvedParticipantsCount ?? 0),
    0
  );

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Admin Section Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-neutral-200">
        {[
          { id: 'dmj', label: 'Delhi Meri Jaan 2026' },
          { id: 'forms', label: 'Submissions & Forms' },
          { id: 'users', label: 'Users & Credentials' },
          { id: 'email', label: 'Email Studio' },
          { id: 'resources', label: 'Resources Portal' },
          { id: 'logins', label: 'Active Logins (Live)' },
          { id: 'delegations', label: 'Delegations & Hosts' },
          { id: 'gallery', label: 'Snap Gallery' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#19539D] text-white ride-pop-sm'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dmj' && <DelhiMeriJaanAdminTab />}

      {activeTab === 'forms' && <RideFormBuilderTab />}

      {activeTab === 'users' && <RideUsersManagementTab />}

      {activeTab === 'email' && <RideEmailStudioTab />}

      {activeTab === 'resources' && <RideResourcesPortalTab />}

      {activeTab === 'logins' && <RideActiveLoginsTab />}

      {activeTab === 'delegations' && (
        <Section
          eyebrow="RIDE Admin"
          title="Delegations & Host Allocation"
          description="Manage approved incoming district delegations and assign verified Host Clubs with homestay details."
          action={
            <div className="flex items-center gap-2">
              <Button onClick={() => setCreating(true)}>Add delegation</Button>
            </div>
          }
        >
          {/* Dynamic Filter & Status Bar */}
          <div className="mb-4 p-4 rounded-2xl border-2 border-[#171515] bg-[#FFFDF7] ride-pop-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setApprovedOnly(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    approvedOnly
                      ? 'bg-[#19539D] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Approved Districts Only
                </button>
                <button
                  type="button"
                  onClick={() => setApprovedOnly(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    !approvedOnly
                      ? 'bg-[#19539D] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Show All Delegations
                </button>
              </div>

              <span className="text-xs text-neutral-500 font-medium">
                {approvedOnly
                  ? 'Displaying delegations with confirmed status or approved registered participants.'
                  : 'Displaying all delegations including planned/draft visits.'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
                {delegations.length} {approvedOnly ? 'Approved Districts' : 'Delegations'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                {totalApprovedDelegates} Approved Delegates
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                {approvedHostsQuery.data?.length ?? 0} Approved Host Clubs
              </span>
            </div>
          </div>

          {delegationsQuery.isPending ? (
            <Skeleton shape="rect" className="h-64" />
          ) : delegationsQuery.isError ? (
            <ErrorState title="Couldn't load delegations" onRetry={() => void delegationsQuery.refetch()} />
          ) : (delegationsQuery.data?.items ?? []).length === 0 ? (
            <EmptyState
              title={approvedOnly ? 'No Approved Delegations Found' : 'No delegations yet'}
              body={
                approvedOnly
                  ? 'No delegation is currently marked as Confirmed or has Approved participants. Toggle "Show All Delegations" or approve incoming forms in Submissions & Forms.'
                  : 'Add the first incoming delegation above.'
              }
            />
          ) : (
            <Card rule="accent" padding="compact" className="overflow-x-auto">
              <Table columns={columns} rows={delegationsQuery.data?.items ?? []} rowKey={(d) => d.id} empty="No delegations yet." />
            </Card>
          )}
        </Section>
      )}

      {activeTab === 'gallery' && <GalleryAdminSection />}

      <CreateDelegationModal open={creating} onClose={() => setCreating(false)} onCreated={invalidateDelegations} />
      <HostAssignmentDrawer
        delegation={assigning}
        approvedHostClubs={approvedHostsQuery.data ?? []}
        onClose={() => setAssigning(null)}
        onSaved={invalidateDelegations}
      />
    </div>
  );
}
