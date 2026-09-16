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
import { Trash2 } from 'lucide-react';
import {
  assignHosts,
  createDelegation,
  createGalleryItem,
  deleteGalleryItem,
  fetchDelegations,
  fetchGalleryItems,
  fetchSupportClubs,
} from '@/lib/ride/api';
import type { Delegation, DelegationStatus, GalleryItem, GalleryItemKind, SupportClub } from '@/lib/ride/types';
import { ApiError } from '@/lib/api';
import { DelhiMeriJaanAdminTab } from './components/DelhiMeriJaanAdminTab';
import { RideEmailStudioTab } from './components/RideEmailStudioTab';
import { RideFormBuilderTab } from './components/RideFormBuilderTab';
import { RideResourcesPortalTab } from './components/RideResourcesPortalTab';
import { RideActiveLoginsTab } from './components/RideActiveLoginsTab';
import { RideUsersManagementTab } from './components/RideUsersManagementTab';

const DELEGATIONS_KEY = ['ride', 'admin', 'delegations'];
const SUPPORT_CLUBS_KEY = ['ride', 'admin', 'support-clubs'];
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
}

interface HostAssignmentDrawerProps {
  delegation: Delegation | null;
  supportClubs: SupportClub[];
  onClose: () => void;
  onSaved: () => void;
}

function HostAssignmentDrawer({ delegation, supportClubs, onClose, onSaved }: HostAssignmentDrawerProps) {
  const [rows, setRows] = useState<Record<string, HostRowState>>({});
  const [error, setError] = useState<string | null>(null);

  // Re-seed local state whenever a different delegation opens.
  const [seededFor, setSeededFor] = useState<string | undefined>(undefined);
  if (delegation && seededFor !== delegation.id) {
    const next: Record<string, HostRowState> = {};
    for (const club of supportClubs) {
      const existing = delegation.hosts.find((h) => h.club.id === club.club.id);
      next[club.club.id] = {
        included: Boolean(existing),
        daysHosted: existing ? String(existing.daysHosted) : '',
        membersSent: existing ? String(existing.membersSent) : '0',
      };
    }
    setRows(next);
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
        }));
      return assignHosts(delegation!.id, hosts);
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not save host assignments.'),
  });

  return (
    <Drawer
      open={Boolean(delegation)}
      onClose={onClose}
      title={delegation ? `Assign hosts: ${delegation.country}` : 'Assign hosts'}
      footer={
        <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
          Save host assignments
        </Button>
      }
    >
      {error && (
        <div className="mb-3">
          <Alert tone="error" title="Something went wrong">
            {error}
          </Alert>
        </div>
      )}
      {supportClubs.length === 0 ? (
        <EmptyState title="No registered support clubs" body="No club has registered to host this Rotary year yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {supportClubs.map((club) => {
            const row = rows[club.club.id] ?? { included: false, daysHosted: '', membersSent: '0' };
            return (
              <div key={club.club.id} className="rounded-[10px] border border-line p-3">
                <Checkbox
                  label={`${club.club.name} (capacity ${club.capacityDelegates}${club.homestayAvailable ? ', homestay' : ''})`}
                  checked={row.included}
                  onChange={(e) =>
                    setRows((prev) => ({ ...prev, [club.club.id]: { ...row, included: e.target.checked } }))
                  }
                />
                {row.included && (
                  <div className="mt-2 grid grid-cols-2 gap-2.5">
                    <Field label="Days hosted">
                      <Input
                        type="number"
                        min={0}
                        value={row.daysHosted}
                        onChange={(e) =>
                          setRows((prev) => ({ ...prev, [club.club.id]: { ...row, daysHosted: e.target.value } }))
                        }
                      />
                    </Field>
                    <Field label="Members sent">
                      <Input
                        type="number"
                        min={0}
                        value={row.membersSent}
                        onChange={(e) =>
                          setRows((prev) => ({ ...prev, [club.club.id]: { ...row, membersSent: e.target.value } }))
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
    void qc.invalidateQueries({ queryKey: ['ride-public-gallery'] });
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
  const qc = useQueryClient();
  const delegationsQuery = useQuery({
    queryKey: DELEGATIONS_KEY,
    queryFn: () => fetchDelegations({ pageSize: 100 }),
  });
  const supportClubsQuery = useQuery({
    queryKey: SUPPORT_CLUBS_KEY,
    queryFn: () => fetchSupportClubs({ ryYear: currentRyYear(), pageSize: 200 }),
  });

  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState<Delegation | null>(null);

  const invalidateDelegations = () => void qc.invalidateQueries({ queryKey: DELEGATIONS_KEY });

  const columns: Column<Delegation>[] = [
    {
      key: 'delegation',
      header: 'Delegation',
      cell: (d) => (
        <div>
          <p className="m-0 text-[13px] font-bold text-fg">
            {d.country} · {d.visitingDistrict}
          </p>
          <p className="m-0 text-[11px] text-fg-3">
            {formatDate(d.startsAt)} – {formatDate(d.endsAt)} · {d.headcount} delegate{d.headcount === 1 ? '' : 's'}
          </p>
        </div>
      ),
    },
    { key: 'status', header: 'Status', cell: (d) => <Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge> },
    {
      key: 'hosts',
      header: 'Hosts',
      cell: (d) => (d.hosts.length === 0 ? <span className="text-[12px] text-fg-3">Unassigned</span> : d.hosts.map((h) => h.club.shortName ?? h.club.name).join(', ')),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (d) => (
        <Button size="sm" variant="secondary" onClick={() => setAssigning(d)}>
          Assign hosts
        </Button>
      ),
    },
  ];

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
          eyebrow="RIDE admin"
          title="Delegations"
          description="Add incoming delegations and assign the district clubs hosting each one."
          action={<Button onClick={() => setCreating(true)}>Add delegation</Button>}
        >
          {delegationsQuery.isPending ? (
            <Skeleton shape="rect" className="h-64" />
          ) : delegationsQuery.isError ? (
            <ErrorState title="Couldn't load delegations" onRetry={() => void delegationsQuery.refetch()} />
          ) : delegationsQuery.data.items.length === 0 ? (
            <EmptyState title="No delegations yet" body="Add the first incoming delegation above." />
          ) : (
            <Card rule="accent" padding="compact" className="overflow-x-auto">
              <Table columns={columns} rows={delegationsQuery.data.items} rowKey={(d) => d.id} empty="No delegations yet." />
            </Card>
          )}
        </Section>
      )}

      {activeTab === 'gallery' && <GalleryAdminSection />}

      <CreateDelegationModal open={creating} onClose={() => setCreating(false)} onCreated={invalidateDelegations} />
      <HostAssignmentDrawer
        delegation={assigning}
        supportClubs={supportClubsQuery.data?.items ?? []}
        onClose={() => setAssigning(null)}
        onSaved={invalidateDelegations}
      />
    </div>
  );
}
