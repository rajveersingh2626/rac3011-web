import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldCheck, XCircle, 
  Search, Eye, SlidersHorizontal, Layers, Plus, 
  Lock, Unlock, Save, Info
} from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { fetchSettings, updateSettings, type SettingsMap } from '@/lib/settings/api';
import { fetchPublicClubs, fetchZones, type PublicClub, type Zone } from '@/lib/clubs';
import { HostClubApplicationCard } from '../components/HostClubApplicationCard';

type AccessMode = 'all' | 'specific' | 'none';

interface DashboardAppDef {
  id: string;
  title: string;
  category: string;
  targetSurface: string;
  targetAudience: string;
  status: 'active' | 'draft' | 'archived';
  description: string;
  fieldCount: number;
}

const DASHBOARD_APPS: DashboardAppDef[] = [
  {
    id: 'host-club-app',
    title: 'Delhi Meri Jaan – Host Club Application (RIDE 2026)',
    category: 'Exchange Fellowship & Hosting',
    targetSurface: 'Main Dashboard (/portal/dashboard)',
    targetAudience: 'Club Presidents & Secretaries',
    status: 'active',
    description: 'Bespoke intake pipeline for clubs applying to host foreign and interstate youth exchange delegates, homestays, and cultural showcases.',
    fieldCount: 10,
  },
  {
    id: 'boost-club-app',
    title: 'Boost Club Growth & Mentorship Initiative',
    category: 'District Expansion & Club Support',
    targetSurface: 'Main Dashboard (/portal/dashboard)',
    targetAudience: 'Selected Developing & Growth Clubs',
    status: 'draft',
    description: 'Strategic district assistance call for clubs requesting joint-project grants, membership drive support, and council advisory mentoring.',
    fieldCount: 8,
  },
  {
    id: 'district-grant-app',
    title: 'District Landmark Project Grant Allocation',
    category: 'Community Service & Rotary Foundation',
    targetSurface: 'Main Dashboard (/portal/dashboard)',
    targetAudience: 'All Qualified RID 3011 Clubs',
    status: 'draft',
    description: 'Annual competitive proposal grant for flagship service projects aligned with Rotary Foundation areas of focus.',
    fieldCount: 12,
  },
];

export function FormBuilderAdminPage() {
  useDocumentMeta({ title: 'Form Builder & Dashboard Applications' });
  const qc = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'access_control' | 'form_canvas' | 'all_apps'>('access_control');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Settings query
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  // Public clubs list
  const clubsQuery = useQuery<PublicClub[]>({
    queryKey: ['public-clubs-list'],
    queryFn: () => fetchPublicClubs(),
  });

  // Zones query
  const zonesQuery = useQuery<Zone[]>({
    queryKey: ['zones-list'],
    queryFn: fetchZones,
  });

  const clubs: PublicClub[] = useMemo(() => clubsQuery.data ?? [], [clubsQuery.data]);
  const zones: Zone[] = useMemo(() => zonesQuery.data ?? [], [zonesQuery.data]);

  const zoneMap = useMemo(() => {
    const map: Record<string, string> = {};
    zones.forEach((z) => {
      map[z.id] = z.name;
    });
    return map;
  }, [zones]);

  // Settings state
  const rawMode = settingsQuery.data?.['dashboard.hostClubApp.accessMode'] as AccessMode | undefined;
  const rawAllowed = settingsQuery.data?.['dashboard.hostClubApp.allowedClubIds'] as string[] | undefined;

  const [accessMode, setAccessMode] = useState<AccessMode>('all');
  const [allowedClubIds, setAllowedClubIds] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  // Sync settings when loaded
  useEffect(() => {
    if (settingsQuery.data) {
      const mode = rawMode || 'all';
      const allowed = Array.isArray(rawAllowed) ? rawAllowed : [];
      setAccessMode(mode);
      setAllowedClubIds(allowed);
      setHasChanges(false);
    }
  }, [settingsQuery.data, rawMode, rawAllowed]);

  // Filtered clubs
  const filteredClubs = useMemo(() => {
    return clubs.filter((c: PublicClub) => {
      const matchesSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Boolean(c.shortName && c.shortName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesZone = zoneFilter === 'all' || (c.zoneId && c.zoneId === zoneFilter);
      return matchesSearch && matchesZone;
    });
  }, [clubs, searchQuery, zoneFilter]);

  // Mutation to persist settings
  const saveMutation = useMutation({
    mutationFn: (patch: SettingsMap) => updateSettings(patch),
    onSuccess: () => {
      toast({
        title: 'Application Access Saved',
        body: 'Club visibility permissions have been updated and are active immediately on user dashboards.',
        tone: 'success',
      });
      setHasChanges(false);
      void qc.invalidateQueries({ queryKey: ['settings'] });
      void qc.invalidateQueries({ queryKey: ['dashboard-apps'] });
    },
    onError: (err) => {
      toast({
        title: "Couldn't save access settings",
        body: (err as Error).message,
        tone: 'error',
      });
    },
  });

  const handleToggleClub = (clubId: string) => {
    setAllowedClubIds((prev) => {
      const next = prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId];
      setHasChanges(true);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredClubs.map((c: PublicClub) => c.id);
    setAllowedClubIds((prev) => {
      const set = new Set([...prev, ...idsToAdd]);
      setHasChanges(true);
      return Array.from(set);
    });
  };

  const handleDeselectAllFiltered = () => {
    const idsToRemove = new Set(filteredClubs.map((c: PublicClub) => c.id));
    setAllowedClubIds((prev) => {
      const next = prev.filter((id) => !idsToRemove.has(id));
      setHasChanges(true);
      return next;
    });
  };

  const handleSave = () => {
    saveMutation.mutate({
      'dashboard.hostClubApp.accessMode': accessMode,
      'dashboard.hostClubApp.allowedClubIds': allowedClubIds,
    });
  };

  const enabledCount = allowedClubIds.length;
  const totalClubs = clubs.length;

  return (
    <Container>
      <Section
        eyebrow="District Administrative Tools"
        title="Form Builder & Dynamic Applications"
      >
        {/* Navigation Tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('access_control')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'access_control'
                  ? 'bg-[#19539D] text-white shadow-sm'
                  : 'bg-surface-2 text-fg-2 hover:bg-surface-3'
              }`}
            >
              <ShieldCheck size={15} />
              Host Club Access Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all_apps')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'all_apps'
                  ? 'bg-[#19539D] text-white shadow-sm'
                  : 'bg-surface-2 text-fg-2 hover:bg-surface-3'
              }`}
            >
              <Layers size={15} />
              Dashboard Applications ({DASHBOARD_APPS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('form_canvas')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'form_canvas'
                  ? 'bg-[#19539D] text-white shadow-sm'
                  : 'bg-surface-2 text-fg-2 hover:bg-surface-3'
              }`}
            >
              <SlidersHorizontal size={15} />
              Form Schema Canvas
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPreviewModal(true)}
              leading={<Eye size={14} />}
            >
              Live Card Preview
            </Button>
            {activeTab === 'access_control' && hasChanges && (
              <Button
                variant="primary"
                size="sm"
                loading={saveMutation.isPending}
                onClick={handleSave}
                leading={<Save size={14} />}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* TAB 1: HOST CLUB APPLICATION ACCESS CONTROL */}
        {activeTab === 'access_control' && (
          <div className="space-y-6">
            {/* Control Header Card */}
            <Card
              eyebrow="Immediate Priority • Dynamic Visibility Control"
              title="Host Club Application Access Matrix"
              rule="accent"
              className="bg-gradient-to-r from-surface via-surface-2/40 to-surface border-line-accent/40 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-2xl space-y-2">
                  <p className="text-sm text-fg-2 leading-relaxed">
                    Control exactly which RID 3011 clubs can view and submit the <strong>"Delhi Meri Jaan – Host Club Application"</strong> on their leader dashboards. 
                    Applications submitted by approved clubs are routed into the RIDE secretariat review pipeline.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-bold text-fg">Active Visibility Mode:</span>
                    <Badge tone={accessMode === 'all' ? 'green' : accessMode === 'specific' ? 'amber' : 'neutral'}>
                      {accessMode === 'all' ? 'OPEN TO ALL CLUBS' : accessMode === 'specific' ? 'SPECIFIC CLUBS ONLY' : 'DISABLED / HIDDEN'}
                    </Badge>
                    {accessMode === 'specific' && (
                      <span className="text-xs font-mono text-fg-3">
                        ({enabledCount} of {totalClubs} clubs enabled)
                      </span>
                    )}
                  </div>
                </div>

                {/* Mode Selector Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-surface-2 p-1.5 rounded-2xl border border-line shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setAccessMode('all');
                      setHasChanges(true);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      accessMode === 'all'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-fg-2 hover:bg-surface-3'
                    }`}
                  >
                    All Clubs
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccessMode('specific');
                      setHasChanges(true);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      accessMode === 'specific'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-fg-2 hover:bg-surface-3'
                    }`}
                  >
                    Specific Clubs Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccessMode('none');
                      setHasChanges(true);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      accessMode === 'none'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-fg-2 hover:bg-surface-3'
                    }`}
                  >
                    Disabled (Hidden)
                  </button>
                </div>
              </div>
            </Card>

            {/* If Access Mode is All or None */}
            {accessMode === 'all' && (
              <div className="p-5 rounded-2xl border-2 border-dashed border-green-500/40 bg-green-50/50 dark:bg-green-950/10 flex items-center gap-4">
                <Unlock className="text-green-600 shrink-0" size={24} />
                <div className="text-xs text-green-900 dark:text-green-200">
                  <span className="font-bold">Global Access Active:</span> Every verified Rotaract club president and secretary in District 3011 currently has access to apply as a Host Club on their dashboard.
                </div>
              </div>
            )}

            {accessMode === 'none' && (
              <div className="p-5 rounded-2xl border-2 border-dashed border-red-500/40 bg-red-50/50 dark:bg-red-950/10 flex items-center gap-4">
                <Lock className="text-red-600 shrink-0" size={24} />
                <div className="text-xs text-red-900 dark:text-red-200">
                  <span className="font-bold">Application Closed:</span> The Host Club Application card is completely hidden from all club leader dashboards across the district.
                </div>
              </div>
            )}

            {/* Specific Clubs Manager Table */}
            <Card
              eyebrow="Club-by-Club Whitelist"
              title="Permitted Club Roster"
              footer={
                hasChanges ? (
                  <div className="flex items-center justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      loading={saveMutation.isPending}
                      onClick={handleSave}
                      leading={<Save size={14} />}
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : undefined
              }
            >
              {/* Search & Zone Filter Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4 pb-4 border-b border-line">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-fg-3" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search club name..."
                      className="pl-9 text-xs"
                    />
                  </div>

                  {/* Zone Filter */}
                  <select
                    value={zoneFilter}
                    onChange={(e) => setZoneFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-line bg-surface text-xs font-semibold text-fg focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="all">All Zones ({clubs.length})</option>
                    {zones.map((z: Zone) => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>

                {/* Bulk Actions */}
                {accessMode === 'specific' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSelectAllFiltered}
                    >
                      Enable Filtered ({filteredClubs.length})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeselectAllFiltered}
                    >
                      Disable Filtered
                    </Button>
                  </div>
                )}
              </div>

              {/* Clubs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredClubs.map((club: PublicClub) => {
                  const isEnabled = accessMode === 'all' || (accessMode === 'specific' && allowedClubIds.includes(club.id));
                  const isManuallyToggled = allowedClubIds.includes(club.id);
                  const zoneLabel = club.zoneId ? zoneMap[club.zoneId] || 'District Club' : 'District Club';

                  return (
                    <div
                      key={club.id}
                      onClick={() => {
                        if (accessMode === 'specific') {
                          handleToggleClub(club.id);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        accessMode === 'specific' ? 'cursor-pointer' : ''
                      } ${
                        isEnabled
                          ? 'border-green-500/50 bg-green-50/20 dark:bg-green-950/10'
                          : 'border-line bg-surface-2/40 opacity-70'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="m-0 text-xs font-bold text-fg truncate">
                            {club.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-fg-3">
                          <span>{zoneLabel}</span>
                        </div>
                      </div>

                      {/* Status indicator / Switch */}
                      <div className="shrink-0 flex items-center gap-2">
                        {accessMode === 'all' ? (
                          <Badge tone="green">Allowed (All)</Badge>
                        ) : accessMode === 'none' ? (
                          <Badge tone="neutral">Hidden</Badge>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-mono font-bold uppercase ${isManuallyToggled ? 'text-green-600' : 'text-fg-3'}`}>
                              {isManuallyToggled ? 'Enabled' : 'Off'}
                            </span>
                            <input
                              type="checkbox"
                              checked={isManuallyToggled}
                              onChange={() => handleToggleClub(club.id)}
                              className="h-4 w-4 rounded text-[#19539D] cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredClubs.length === 0 && (
                <div className="p-8 text-center text-xs text-fg-3">
                  No clubs matched your search or zone filter.
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 2: ALL DASHBOARD APPLICATIONS */}
        {activeTab === 'all_apps' && (
          <div className="space-y-6">
            <Card
              eyebrow="Application Registry"
              title="Configured Dashboard Applications"
              rule="accent"
            >
              <p className="text-xs text-fg-2 mb-6">
                Manage applications that can be pushed directly to user and club leader dashboards. 
                Applications configured here appear prominently on target dashboards with custom eligibility logic.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {DASHBOARD_APPS.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl border-2 border-line bg-surface space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone={app.status === 'active' ? 'green' : 'amber'}>
                          {app.status === 'active' ? 'Active on Dashboard' : 'Draft / Planned'}
                        </Badge>
                        <span className="text-[11px] font-mono font-bold text-fg-3">
                          {app.fieldCount} fields
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-fg m-0">{app.title}</h4>
                      <p className="text-xs text-fg-3 line-clamp-2">{app.description}</p>
                    </div>

                    <div className="pt-3 border-t border-line space-y-2 text-[11px] text-fg-2">
                      <div className="flex items-center justify-between">
                        <span className="text-fg-3">Target Surface:</span>
                        <span className="font-semibold text-fg">{app.targetSurface}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-fg-3">Target Audience:</span>
                        <span className="font-semibold text-fg">{app.targetAudience}</span>
                      </div>
                      
                      <div className="pt-2 flex items-center gap-2">
                        {app.id === 'host-club-app' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() => setActiveTab('access_control')}
                          >
                            Manage Club Access
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => setActiveTab('form_canvas')}
                          >
                            Configure Form
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: FORM SCHEMA CANVAS (ARCHITECTURE UI PLACEHOLDER) */}
        {activeTab === 'form_canvas' && (
          <div className="space-y-6">
            <Card
              eyebrow="Architecture Foundation"
              title="Form Builder Canvas & Field Designer"
              rule="accent"
            >
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 mb-6 flex items-start gap-3">
                <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  <span className="font-bold">Dynamic Application Architecture:</span> When an admin constructs or edits an application here, it can be pushed directly to target user dashboards (similar to the Delhi Meri Jaan Host Club Application) with live club scoping, field validation, and Google Drive proposal links.
                </div>
              </div>

              {/* Form Canvas Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Palette */}
                <div className="p-4 rounded-2xl border border-line bg-surface-2/40 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-fg m-0">
                    Available Field Types
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      { name: 'Short Text Input', type: 'text', desc: 'Single-line responses' },
                      { name: 'Long Text Area', type: 'textarea', desc: 'Detailed motivations & statements' },
                      { name: 'Google Drive Proposal Link', type: 'url', desc: 'Secure cloud proposal documents' },
                      { name: 'Dropdown Select', type: 'select', desc: 'Pre-defined option pickers' },
                      { name: 'Number / Capacity', type: 'number', desc: 'Numerical limits & counts' },
                      { name: 'Date Picker', type: 'date', desc: 'Calendar deadlines & events' },
                      { name: 'Agreement Checkbox', type: 'checkbox', desc: 'Official terms acceptance' },
                    ].map((f) => (
                      <div
                        key={f.type}
                        className="p-2.5 rounded-xl border border-line bg-surface hover:border-accent/40 transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-fg">{f.name}</div>
                          <div className="text-[10px] text-fg-3">{f.desc}</div>
                        </div>
                        <Plus size={14} className="text-accent" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Active Schema Preview */}
                <div className="lg:col-span-2 p-5 rounded-2xl border border-line bg-surface space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-fg m-0">Application Properties</h4>
                      <p className="text-xs text-fg-3 m-0 mt-0.5">Configuring: Delhi Meri Jaan Host Club Application</p>
                    </div>
                    <Badge tone="blue">Push Enabled</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-fg-3 mb-1">Target Surface</label>
                        <Input value="Main Dashboard (/portal/dashboard)" disabled className="text-xs bg-surface-2" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-fg-3 mb-1">Target Eligibility</label>
                        <Input value="Club Presidents & Secretaries" disabled className="text-xs bg-surface-2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-fg-3 mb-1">Application Title</label>
                      <Input value="Delhi Meri Jaan - Rotaract Inter-District Exchange (RIDE) – Host Club Application" disabled className="text-xs bg-surface-2" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* PREVIEW MODAL */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface p-6 shadow-2xl border border-line">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                <div>
                  <h3 className="text-base font-bold text-fg m-0">Live Dashboard Card Preview</h3>
                  <p className="text-xs text-fg-3 m-0 mt-0.5">This is how the application card renders on eligible club dashboards.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-fg-3 hover:text-fg rounded-xl"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="py-2 pointer-events-none opacity-95">
                <HostClubApplicationCard />
              </div>
            </div>
          </div>
        )}
      </Section>
    </Container>
  );
}
