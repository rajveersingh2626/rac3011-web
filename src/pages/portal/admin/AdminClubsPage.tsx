import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Stat } from '@/components/ui/Stat';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Switch';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchReports, addReportQuery, downloadZoneReportsCsv, downloadDistrictReportsCsv } from '@/lib/reports/api';
import type { Report, ReportStatus } from '@/lib/reports/types';
import {
  fetchPublicClubs,
  fetchAdminClubs,
  fetchZones,
  createClub,
  updateClub,
  deleteClub,
  type Club,
} from '@/lib/clubs';
import { currentReportMonth, formatMonthLabel } from '@/lib/reports/month';
import { activitiesOf } from '@/lib/reports/values';

const STATUS_TONE: Record<ReportStatus, BadgeTone> = {
  draft: 'neutral',
  submitted: 'blue',
  queried: 'amber',
  scored: 'green',
};

const PAGE_TABS: TabItem[] = [
  { id: 'directory', label: 'Clubs Directory & Management' },
  { id: 'reports', label: 'Monthly Reports & Compliance' },
];

interface ClubFormData {
  id?: string;
  name: string;
  shortName: string;
  zoneId: string;
  rotaryId: string;
  president: string;
  email: string;
  phone: string;
  secretary: string;
  secretaryEmail: string;
  secretaryPhone: string;
  charterDate: string;
  meetingInfo: string;
  lat: string;
  lng: string;
  isActive: boolean;
}

const EMPTY_FORM: ClubFormData = {
  name: '',
  shortName: '',
  zoneId: '',
  rotaryId: '',
  president: '',
  email: '',
  phone: '',
  secretary: '',
  secretaryEmail: '',
  secretaryPhone: '',
  charterDate: '',
  meetingInfo: '',
  lat: '',
  lng: '',
  isActive: true,
};

export function AdminClubsPage() {
  useDocumentMeta({ title: 'Clubs & reports' });
  const { me, can } = useAuth();
  const qc = useQueryClient();
  const zrrZoneId = me?.roles.find((r) => r.roleKey === 'zrr')?.scope.id ?? '';
  const canEditClubs = can('clubs:edit') || can('public_content:manage');

  const [activeTab, setActiveTab] = useState<string>('directory');
  const [month] = useState(() => currentReportMonth());
  const [zoneId, setZoneId] = useState(zrrZoneId);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reports queries
  const [queryingId, setQueryingId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [exportingZone, setExportingZone] = useState(false);
  const [exportingDistrict, setExportingDistrict] = useState(false);

  // Club CRUD State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [deletingClub, setDeletingClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState<ClubFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const zonesQuery = useQuery({ queryKey: ['zones'], queryFn: fetchZones });
  const publicClubsQuery = useQuery({
    queryKey: ['public-clubs', zoneId],
    queryFn: () => fetchPublicClubs(zoneId || undefined),
  });
  const adminClubsQuery = useQuery({
    queryKey: ['admin-clubs', zoneId, searchQuery],
    queryFn: () => fetchAdminClubs({ zoneId: zoneId || undefined, q: searchQuery || undefined, pageSize: 200 }),
  });
  const reportsQuery = useQuery({
    queryKey: ['reports', 'admin-overview', month],
    queryFn: () => fetchReports({ month, include: ['club'], pageSize: 200 }),
  });

  const saveClubMutation = useMutation({
    mutationFn: async (data: ClubFormData) => {
      const payload: Partial<Club> = {
        name: data.name.trim(),
        shortName: data.shortName.trim() || null,
        zoneId: data.zoneId || null,
        rotaryId: data.rotaryId.trim() || null,
        president: data.president.trim() || null,
        email: data.email.trim() || null,
        phone: data.phone.trim() || null,
        secretary: data.secretary.trim() || null,
        secretaryEmail: data.secretaryEmail.trim() || null,
        secretaryPhone: data.secretaryPhone.trim() || null,
        charterDate: data.charterDate ? data.charterDate : null,
        meetingInfo: data.meetingInfo.trim() || null,
        lat: data.lat ? parseFloat(data.lat) : null,
        lng: data.lng ? parseFloat(data.lng) : null,
        isActive: data.isActive,
      };

      if (editingClub) {
        return updateClub(editingClub.id, payload);
      } else {
        return createClub(payload);
      }
    },
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingClub(null);
      setFormData(EMPTY_FORM);
      setFormError(null);
      void qc.invalidateQueries({ queryKey: ['admin-clubs'] });
      void qc.invalidateQueries({ queryKey: ['public-clubs'] });
      void qc.invalidateQueries({ queryKey: ['public', 'clubs'] });
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : 'Failed to save club details');
    },
  });

  const deleteClubMutation = useMutation({
    mutationFn: (id: string) => deleteClub(id),
    onSuccess: () => {
      setDeletingClub(null);
      void qc.invalidateQueries({ queryKey: ['admin-clubs'] });
      void qc.invalidateQueries({ queryKey: ['public-clubs'] });
      void qc.invalidateQueries({ queryKey: ['public', 'clubs'] });
    },
  });

  const askMutation = useMutation({
    mutationFn: (vars: { id: string; question: string }) => addReportQuery(vars.id, vars.question),
    onSuccess: () => {
      setQueryingId(null);
      setQuestion('');
      void qc.invalidateQueries({ queryKey: ['reports', 'admin-overview', month] });
    },
  });

  const filedByClub = useMemo(() => {
    const map = new Map<string, Report>();
    for (const r of reportsQuery.data?.items ?? []) map.set(r.clubId, r);
    return map;
  }, [reportsQuery.data]);

  const clubsList = adminClubsQuery.data?.items ?? [];
  const activeClubsCount = clubsList.filter((c) => c.isActive && c.id !== 'DISTRICT').length;
  const totalClubsCount = clubsList.filter((c) => c.id !== 'DISTRICT').length;

  const clubsInZone = (publicClubsQuery.data ?? []).filter((c) => !zoneId || c.zoneId === zoneId);
  const filedInZone = clubsInZone.filter((c) => filedByClub.has(c.id));
  const notFiled = clubsInZone.filter((c) => !filedByClub.has(c.id));
  const awaitingScore = filedInZone.filter((c) => filedByClub.get(c.id)?.status === 'submitted').length;
  const scored = filedInZone.filter((c) => filedByClub.get(c.id)?.status === 'scored').length;

  const openAddClub = () => {
    setEditingClub(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditClub = (club: Club) => {
    setEditingClub(club);
    setFormData({
      id: club.id,
      name: club.name || '',
      shortName: club.shortName || '',
      zoneId: club.zoneId || '',
      rotaryId: club.rotaryId || '',
      president: club.president || '',
      email: club.email || '',
      phone: club.phone || '',
      secretary: club.secretary || '',
      secretaryEmail: club.secretaryEmail || '',
      secretaryPhone: club.secretaryPhone || '',
      charterDate: club.charterDate ? club.charterDate.slice(0, 10) : '',
      meetingInfo: club.meetingInfo || '',
      lat: club.lat != null ? String(club.lat) : '',
      lng: club.lng != null ? String(club.lng) : '',
      isActive: club.isActive ?? true,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Directory Columns
  const directoryColumns: Column<Club>[] = [
    {
      key: 'name',
      header: 'Club Name',
      cell: (c) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="m-0 text-[13px] font-bold text-fg">{c.name}</p>
            {!c.isActive && <Badge tone="neutral">Inactive</Badge>}
            {c.isActive && <Badge tone="green">Active</Badge>}
          </div>
          <p className="m-0 text-[11px] text-fg-3">
            {c.shortName ? `${c.shortName} • ` : ''}ID: {c.rotaryId || c.id}
          </p>
        </div>
      ),
    },
    {
      key: 'zone',
      header: 'Zone',
      cell: (c) => {
        const z = zonesQuery.data?.find((item) => item.id === c.zoneId);
        return <Badge tone="blue">{z?.name ?? c.zone ?? 'Unassigned'}</Badge>;
      },
    },
    {
      key: 'president',
      header: 'President',
      cell: (c) => (
        <div>
          <p className="m-0 text-[12px] font-semibold text-fg">{c.president || '—'}</p>
          {c.email && <p className="m-0 text-[11px] text-fg-3">{c.email}</p>}
          {c.phone && <p className="m-0 text-[11px] text-fg-3">{c.phone}</p>}
        </div>
      ),
    },
    {
      key: 'secretary',
      header: 'Secretary',
      cell: (c) => (
        <div>
          <p className="m-0 text-[12px] font-semibold text-fg">{c.secretary || '—'}</p>
          {c.secretaryEmail && <p className="m-0 text-[11px] text-fg-3">{c.secretaryEmail}</p>}
          {c.secretaryPhone && <p className="m-0 text-[11px] text-fg-3">{c.secretaryPhone}</p>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (c) => (
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => openEditClub(c)}
            className="font-bold text-accent hover:underline text-[12px]"
          >
            Edit
          </button>
          {canEditClubs && c.id !== 'DISTRICT' && (
            <button
              type="button"
              onClick={() => setDeletingClub(c)}
              className="font-bold text-danger-fg hover:underline text-[12px]"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  // Reports Columns
  const reportColumns: Column<Report>[] = [
    {
      key: 'club',
      header: 'Club',
      cell: (r) => (
        <div>
          <p className="m-0 text-[13px] font-bold text-fg">{r.club?.name ?? r.clubId}</p>
          <p className="m-0 text-[11px] text-fg-3">
            {r.submittedAt ? `Filed ${new Date(r.submittedAt).toLocaleDateString()}` : 'Draft'}
          </p>
        </div>
      ),
    },
    { key: 'activities', header: 'Activities', cell: (r) => activitiesOf(r.values).length },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status.toUpperCase()}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (r) => (
        <div className="flex items-center justify-end gap-3">
          <Link to={`/portal/reports/${r.id}`} className="font-bold text-accent">
            View
          </Link>
          {r.status === 'submitted' && (
            <button type="button" onClick={() => setQueryingId(r.id)} className="font-bold text-danger-fg">
              Query
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Container width="wide">
      <Section
        eyebrow="District 3011 Administration"
        title="Clubs & Directory Management"
        description="Comprehensive management of all district clubs, leadership details, zonal allocations, and monthly report compliance."
      >
        <div className="mb-6">
          <Tabs
            tabs={PAGE_TABS}
            value={activeTab}
            onChange={(id) => setActiveTab(id)}
            label="Club admin sections"
          />
        </div>

        {activeTab === 'directory' ? (
          <div>
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat label="Active Clubs" value={activeClubsCount} />
              <Stat label="Total Registered" value={totalClubsCount} />
              <Stat label="Zones" value={zonesQuery.data?.length ?? 4} />
              <Stat label="Reporting Month" value={formatMonthLabel(month)} />
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-[220px]">
                  <Input
                    placeholder="Search clubs, president..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search clubs"
                  />
                </div>
                <div className="w-full sm:w-[180px]">
                  <Select
                    aria-label="Filter by zone"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    placeholder="All zones"
                    options={(zonesQuery.data ?? []).map((z) => ({ value: z.id, label: z.name }))}
                  />
                </div>
              </div>

              {canEditClubs && (
                <Button variant="primary" onClick={openAddClub}>
                  + Add New Club
                </Button>
              )}
            </div>

            {adminClubsQuery.isPending ? (
              <Skeleton shape="rect" className="h-64" />
            ) : adminClubsQuery.isError ? (
              <ErrorState title="Couldn't load clubs" onRetry={() => void adminClubsQuery.refetch()} />
            ) : (
              <Table
                columns={directoryColumns}
                rows={clubsList.filter((c) => c.id !== 'DISTRICT')}
                rowKey={(c) => c.id}
                empty="No clubs found matching criteria."
              />
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat label="Awaiting a score" value={awaitingScore} />
              <Stat label="Filed this month" value={filedInZone.length} />
              <Stat label="Yet to file" value={notFiled.length} />
              <Stat label="Scored" value={scored} />
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="w-full sm:max-w-[220px]">
                <Select
                  aria-label="Filter by zone"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  placeholder="All zones"
                  options={(zonesQuery.data ?? []).map((z) => ({ value: z.id, label: z.name }))}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  loading={exportingZone}
                  onClick={async () => {
                    setExportingZone(true);
                    try {
                      await downloadZoneReportsCsv(month);
                    } finally {
                      setExportingZone(false);
                    }
                  }}
                >
                  Export Zone CSV
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={exportingDistrict}
                  onClick={async () => {
                    setExportingDistrict(true);
                    try {
                      await downloadDistrictReportsCsv(month);
                    } finally {
                      setExportingDistrict(false);
                    }
                  }}
                >
                  Export District CSV
                </Button>
              </div>
            </div>

            {reportsQuery.isPending || publicClubsQuery.isPending ? (
              <Skeleton shape="rect" className="h-64" />
            ) : reportsQuery.isError ? (
              <ErrorState title="Couldn't load reports" onRetry={() => void reportsQuery.refetch()} />
            ) : (
              <Table
                columns={reportColumns}
                rows={filedInZone.map((c) => filedByClub.get(c.id)!).filter(Boolean)}
                rowKey={(r) => r.id}
                empty="No club in this zone has filed for this month yet."
              />
            )}

            {notFiled.length > 0 && (
              <p className="mt-5 text-[12px] text-fg-3">
                Not yet filed: {notFiled.map((c) => c.shortName ?? c.name).join(', ')}
              </p>
            )}
          </div>
        )}
      </Section>

      {/* Add / Edit Club Modal */}
      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingClub ? `Edit ${editingClub.name}` : 'Add New Club'}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={saveClubMutation.isPending}
              disabled={!formData.name.trim()}
              onClick={() => saveClubMutation.mutate(formData)}
            >
              {editingClub ? 'Save Changes' : 'Create Club'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {formError && (
            <div className="p-3 bg-danger-subtle text-danger-fg rounded text-sm font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Club Full Name *" required>
              <Input
                placeholder="e.g. Rotaract Club of Delhi Elite"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Field>

            <Field label="Short Name / Campus">
              <Input
                placeholder="e.g. Delhi Elite"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Zone">
              <Select
                value={formData.zoneId}
                onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                placeholder="Select zone..."
                options={(zonesQuery.data ?? []).map((z) => ({ value: z.id, label: z.name }))}
              />
            </Field>

            <Field label="Rotary Club ID">
              <Input
                placeholder="e.g. 217240"
                value={formData.rotaryId}
                onChange={(e) => setFormData({ ...formData, rotaryId: e.target.value })}
              />
            </Field>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-bold text-fg mb-3">President Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Name">
                <Input
                  placeholder="Rtr. Full Name"
                  value={formData.president}
                  onChange={(e) => setFormData({ ...formData, president: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  placeholder="president@club.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-bold text-fg mb-3">Secretary Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Name">
                <Input
                  placeholder="Rtr. Full Name"
                  value={formData.secretary}
                  onChange={(e) => setFormData({ ...formData, secretary: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  placeholder="secretary@club.org"
                  value={formData.secretaryEmail}
                  onChange={(e) => setFormData({ ...formData, secretaryEmail: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  placeholder="+91 9876543210"
                  value={formData.secretaryPhone}
                  onChange={(e) => setFormData({ ...formData, secretaryPhone: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-bold text-fg mb-3">Location &amp; Charter</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Field label="Charter Date">
                <Input
                  type="date"
                  value={formData.charterDate}
                  onChange={(e) => setFormData({ ...formData, charterDate: e.target.value })}
                />
              </Field>
              <Field label="Latitude">
                <Input
                  placeholder="28.5372"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                />
              </Field>
              <Field label="Longitude">
                <Input
                  placeholder="77.2285"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Meeting Location & Info">
              <Textarea
                rows={2}
                placeholder="Address or regular meeting venue info..."
                value={formData.meetingInfo}
                onChange={(e) => setFormData({ ...formData, meetingInfo: e.target.value })}
              />
            </Field>
          </div>

          <div className="border-t border-border pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-fg m-0">Club Active Status</p>
              <p className="text-xs text-fg-3 m-0">Active clubs appear on public map and directory</p>
            </div>
            <Switch
              checked={formData.isActive}
              onChange={(val) => setFormData({ ...formData, isActive: val })}
              aria-label="Is Club Active"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deletingClub)}
        onClose={() => setDeletingClub(null)}
        title="Delete Club"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeletingClub(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteClubMutation.isPending}
              onClick={() => deletingClub && deleteClubMutation.mutate(deletingClub.id)}
            >
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-fg leading-relaxed">
          Are you sure you want to delete <strong>{deletingClub?.name}</strong>? All associated board members and fact records will also be removed.
        </p>
      </Modal>

      {/* Report Query Modal */}
      <Modal
        open={Boolean(queryingId)}
        onClose={() => setQueryingId(null)}
        title="Ask a question about this report"
        footer={
          <Button
            disabled={!question.trim()}
            loading={askMutation.isPending}
            onClick={() => queryingId && askMutation.mutate({ id: queryingId, question })}
          >
            Send query
          </Button>
        }
      >
        <Textarea rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} aria-label="Question" />
      </Modal>
    </Container>
  );
}
