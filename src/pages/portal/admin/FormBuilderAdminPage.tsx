import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldCheck, XCircle, 
  Search, Eye, SlidersHorizontal, Layers, Plus, 
  Lock, Unlock, Save, Info, Trash2, ArrowUp, ArrowDown,
  FileText, Download, CheckCircle2, Clock, ExternalLink, RefreshCw
} from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { fetchSettings, updateSettings, type SettingsMap } from '@/lib/settings/api';
import { fetchPublicClubs, fetchZones, type PublicClub, type Zone } from '@/lib/clubs';
import { 
  fetchAdminForms, 
  createAdminForm, 
  updateAdminForm, 
  deleteAdminForm, 
  fetchFormSubmissions, 
  updateSubmissionReviewStatus,
  type CustomFormItem,
  type CustomFormSubmissionItem,
  type FormFieldDefinition,
  type FormFieldType
} from '@/lib/forms/api';
import { HostClubApplicationCard } from '../components/HostClubApplicationCard';

type AccessMode = 'all' | 'specific' | 'none';

const ROLE_OPTIONS = [
  { value: 'president', label: 'Club President' },
  { value: 'secretary', label: 'Club Secretary' },
  { value: 'member', label: 'Club Member' },
  { value: 'drr', label: 'District Rotaract Representative (DRR)' },
  { value: 'dsc', label: 'District Secretariat / Council (DSC)' },
  { value: 'zrr', label: 'Zonal Rotaract Representative (ZRR)' },
  { value: 'super_admin', label: 'Super Admin' },
];

export function FormBuilderAdminPage() {
  useDocumentMeta({ title: 'Form Builder & Dynamic Applications' });
  const qc = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'access_control' | 'form_builder' | 'responses' | 'all_apps'>('access_control');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Settings query (for Host Club access matrix)
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

  // Forms query (PostgreSQL backend)
  const formsQuery = useQuery<CustomFormItem[]>({
    queryKey: ['admin-forms'],
    queryFn: fetchAdminForms,
  });

  const clubs: PublicClub[] = useMemo(() => clubsQuery.data ?? [], [clubsQuery.data]);
  const zones: Zone[] = useMemo(() => zonesQuery.data ?? [], [zonesQuery.data]);
  const forms: CustomFormItem[] = useMemo(() => formsQuery.data ?? [], [formsQuery.data]);

  const zoneMap = useMemo(() => {
    const map: Record<string, string> = {};
    zones.forEach((z) => {
      map[z.id] = z.name;
    });
    return map;
  }, [zones]);

  // ==========================================
  // TAB 1: Host Club Access Control State
  // ==========================================
  const [accessMode, setAccessMode] = useState<AccessMode>('all');
  const [allowedClubIds, setAllowedClubIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settingsQuery.data) {
      const mode = settingsQuery.data['dashboard.hostClubApp.accessMode'] as AccessMode | undefined;
      const ids = settingsQuery.data['dashboard.hostClubApp.allowedClubIds'] as string[] | undefined;
      if (mode) setAccessMode(mode);
      if (ids && Array.isArray(ids)) setAllowedClubIds(ids);
    }
  }, [settingsQuery.data]);

  const saveSettingsMutation = useMutation({
    mutationFn: (values: Partial<SettingsMap>) => updateSettings(values),
    onSuccess: () => {
      toast({
        title: 'Access Rules Saved',
        body: 'Host Club Application visibility rules updated successfully.',
        tone: 'success',
      });
      qc.invalidateQueries({ queryKey: ['settings'] });
      qc.invalidateQueries({ queryKey: ['admin-forms'] });
      setHasChanges(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to Save Access Rules',
        body: err.message || 'Please check your permissions and try again.',
        tone: 'error',
      });
    },
  });

  const filteredClubs = useMemo(() => {
    return clubs.filter((c: PublicClub) => {
      const matchesSearch =
        searchQuery === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.shortName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZone = selectedZone === 'all' || c.zoneId === selectedZone;
      return matchesSearch && matchesZone;
    });
  }, [clubs, searchQuery, selectedZone]);

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

  // ==========================================
  // TAB 2: Form Builder State
  // ==========================================
  const [editingFormId, setEditingFormId] = useState<string | 'new'>('new');
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [formAccessMode, setFormAccessMode] = useState<AccessMode>('all');
  const [formTargetRoles, setFormTargetRoles] = useState<string[]>(['club_president', 'club_secretary']);
  const [formTargetClubIds, setFormTargetClubIds] = useState<string[]>([]);
  const [formFields, setFormFields] = useState<FormFieldDefinition[]>([
    { id: 'f1', name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter full name' },
    { id: 'f2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'name@district.org' },
    { id: 'f3', name: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '+91 XXXXX XXXXX' },
  ]);

  const handleSelectFormToEdit = (f: CustomFormItem) => {
    setEditingFormId(f.id);
    setFormTitle(f.title);
    setFormSlug(f.slug);
    setFormDescription(f.description || '');
    setFormCategory(f.category || 'General');
    setFormStatus(f.status);
    setFormAccessMode(f.accessMode);
    setFormTargetRoles(Array.isArray(f.targetRoles) ? f.targetRoles : []);
    setFormTargetClubIds(Array.isArray(f.targetClubIds) ? f.targetClubIds : []);
    setFormFields(Array.isArray(f.fields) && f.fields.length > 0 ? f.fields : []);
  };

  const handleResetFormBuilder = () => {
    setEditingFormId('new');
    setFormTitle('');
    setFormSlug('');
    setFormDescription('');
    setFormCategory('General');
    setFormStatus('draft');
    setFormAccessMode('all');
    setFormTargetRoles(['club_president', 'club_secretary']);
    setFormTargetClubIds([]);
    setFormFields([
      { id: 'f1', name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter full name' },
      { id: 'f2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'name@district.org' },
      { id: 'f3', name: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '+91 XXXXX XXXXX' },
    ]);
  };

  const handleAddField = (type: FormFieldType) => {
    const id = `f_${Date.now()}`;
    const newField: FormFieldDefinition = {
      id,
      name: `field_${formFields.length + 1}`,
      label: type === 'link' ? 'Document / Proposal Link' : type === 'textarea' ? 'Detailed Statement' : 'New Question',
      type,
      required: false,
      placeholder: type === 'link' ? 'https://drive.google.com/...' : 'Enter response...',
      helperText: type === 'link' ? 'Ensure link is shared with Anyone with link can view' : '',
      options: type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    };
    setFormFields((prev) => [...prev, newField]);
  };

  const handleRemoveField = (id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === formFields.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...formFields];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFormFields(updated);
  };

  const handleUpdateFieldProp = (id: string, prop: keyof FormFieldDefinition, value: any) => {
    setFormFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [prop]: value } : f))
    );
  };

  const saveFormMutation = useMutation({
    mutationFn: async () => {
      const slug = formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload: Partial<CustomFormItem> = {
        title: formTitle.trim(),
        slug,
        description: formDescription.trim(),
        category: formCategory.trim(),
        status: formStatus,
        accessMode: formAccessMode,
        targetSurface: 'dashboard',
        targetRoles: formTargetRoles,
        targetClubIds: formTargetClubIds,
        fields: formFields,
      };

      if (editingFormId === 'new') {
        return createAdminForm(payload);
      } else {
        return updateAdminForm(editingFormId, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Form Saved Successfully',
        body: 'The custom form has been persisted to the database and updated on target dashboards.',
        tone: 'success',
      });
      qc.invalidateQueries({ queryKey: ['admin-forms'] });
      handleResetFormBuilder();
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to Save Form',
        body: err.message || 'Please verify form fields and slug uniqueness.',
        tone: 'error',
      });
    },
  });

  const deleteFormMutation = useMutation({
    mutationFn: (id: string) => deleteAdminForm(id),
    onSuccess: () => {
      toast({
        title: 'Form Deleted',
        body: 'The custom form and its submissions have been removed.',
        tone: 'success',
      });
      qc.invalidateQueries({ queryKey: ['admin-forms'] });
      handleResetFormBuilder();
    },
    onError: (err: any) => {
      toast({
        title: 'Delete Failed',
        body: err.message || 'Could not delete form.',
        tone: 'error',
      });
    },
  });

  // ==========================================
  // TAB 3: Responses Viewer State
  // ==========================================
  const [selectedResponseFormId, setSelectedResponseFormId] = useState<string>('');
  const [responseStatusFilter, setResponseStatusFilter] = useState<string>('all');
  const [responseSearchQuery, setResponseSearchQuery] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<CustomFormSubmissionItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');

  // Auto-select first form when forms load
  useEffect(() => {
    if (forms.length > 0 && !selectedResponseFormId) {
      setSelectedResponseFormId(forms[0].id);
    }
  }, [forms, selectedResponseFormId]);

  const submissionsQuery = useQuery<CustomFormSubmissionItem[]>({
    queryKey: ['form-submissions', selectedResponseFormId, responseStatusFilter, responseSearchQuery],
    queryFn: () => fetchFormSubmissions(selectedResponseFormId, { 
      status: responseStatusFilter, 
      search: responseSearchQuery 
    }),
    enabled: Boolean(selectedResponseFormId),
  });

  const submissions = useMemo(() => submissionsQuery.data ?? [], [submissionsQuery.data]);

  const activeResponseForm = useMemo(() => {
    return forms.find((f) => f.id === selectedResponseFormId);
  }, [forms, selectedResponseFormId]);

  const submissionStatusMutation = useMutation({
    mutationFn: async ({ subId, status, notes }: { subId: string; status: any; notes?: string }) => {
      return updateSubmissionReviewStatus(selectedResponseFormId, subId, status, notes);
    },
    onSuccess: () => {
      toast({
        title: 'Submission Updated',
        body: 'The applicant status and review notes have been saved.',
        tone: 'success',
      });
      qc.invalidateQueries({ queryKey: ['form-submissions'] });
      qc.invalidateQueries({ queryKey: ['admin-forms'] });
      setSelectedSubmission(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Update Failed',
        body: err.message || 'Could not update submission status.',
        tone: 'error',
      });
    },
  });

  const handleExportCSV = () => {
    if (!submissions || submissions.length === 0) {
      toast({ title: 'No Data', body: 'There are no submissions to export.', tone: 'error' });
      return;
    }

    const fieldKeys = activeResponseForm?.fields?.map((f) => f.name) || [];
    const headers = ['Submission ID', 'Applicant Name', 'Email', 'Phone', 'Club Name', 'Status', 'Submitted At', ...fieldKeys, 'Admin Notes'];
    
    const rows = submissions.map((s) => {
      const vals = s.values || {};
      const answerCols = fieldKeys.map((k) => `"${String(vals[k] ?? '').replace(/"/g, '""')}"`);
      return [
        `"${s.id}"`,
        `"${(s.applicantName || '').replace(/"/g, '""')}"`,
        `"${(s.applicantEmail || '').replace(/"/g, '""')}"`,
        `"${(s.applicantPhone || '').replace(/"/g, '""')}"`,
        `"${(s.clubName || '').replace(/"/g, '""')}"`,
        `"${s.status}"`,
        `"${new Date(s.submittedAt).toLocaleString()}"`,
        ...answerCols,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeResponseForm?.slug || 'form'}-submissions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              onClick={() => setActiveTab('form_builder')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'form_builder'
                  ? 'bg-[#19539D] text-white shadow-sm'
                  : 'bg-surface-2 text-fg-2 hover:bg-surface-3'
              }`}
            >
              <SlidersHorizontal size={15} />
              Form Builder ({forms.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('responses')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'responses'
                  ? 'bg-[#19539D] text-white shadow-sm'
                  : 'bg-surface-2 text-fg-2 hover:bg-surface-3'
              }`}
            >
              <FileText size={15} />
              View Responses ({submissions.length})
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
              Applications Overview
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
          </div>
        </div>

        {/* TAB 1: Host Club Access Control */}
        {activeTab === 'access_control' && (
          <div className="space-y-6">
            <Card
              title="Host Club Application Access Matrix"
              eyebrow="Access Control"
            >
              <p className="text-xs text-fg-3 mb-4">
                Control exactly which RID 3011 clubs can view and submit the Delhi Meri Jaan – Host Club Application on their leader dashboards.
              </p>

              {/* Access Mode Selector */}
              <div className="mb-6 p-4 rounded-2xl bg-surface-2 border border-line">
                <label className="block text-xs font-black uppercase tracking-wider text-fg-3 mb-3">
                  District-Wide Access Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAccessMode('all');
                      setHasChanges(true);
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      accessMode === 'all'
                        ? 'border-[#19539D] bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-[#19539D]'
                        : 'border-line bg-surface hover:border-fg-4'
                    }`}
                  >
                    <Unlock size={18} className={accessMode === 'all' ? 'text-[#19539D] mt-0.5' : 'text-fg-4 mt-0.5'} />
                    <div>
                      <div className="text-xs font-bold text-fg">All Verified Clubs</div>
                      <div className="text-[11px] text-fg-3 mt-0.5">
                        Open to every active RID 3011 Rotaract club president & secretary.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccessMode('specific');
                      setHasChanges(true);
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      accessMode === 'specific'
                        ? 'border-[#19539D] bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-[#19539D]'
                        : 'border-line bg-surface hover:border-fg-4'
                    }`}
                  >
                    <ShieldCheck size={18} className={accessMode === 'specific' ? 'text-[#19539D] mt-0.5' : 'text-fg-4 mt-0.5'} />
                    <div>
                      <div className="text-xs font-bold text-fg">Specific Clubs Only</div>
                      <div className="text-[11px] text-fg-3 mt-0.5">
                        Strict whitelist: only clubs checked below will see the application.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccessMode('none');
                      setHasChanges(true);
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      accessMode === 'none'
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 ring-1 ring-red-500'
                        : 'border-line bg-surface hover:border-fg-4'
                    }`}
                  >
                    <Lock size={18} className={accessMode === 'none' ? 'text-red-500 mt-0.5' : 'text-fg-4 mt-0.5'} />
                    <div>
                      <div className="text-xs font-bold text-fg">Closed / Disabled</div>
                      <div className="text-[11px] text-fg-3 mt-0.5">
                        Hidden from all club dashboards across the entire district.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Status Alert Banner */}
              <div className="mb-6">
                {accessMode === 'all' && (
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <Info size={16} className="shrink-0 text-blue-600" />
                    <span>
                      <strong className="font-bold">Global Access Active:</strong> Every verified Rotaract club president and secretary in District 3011 currently has access to apply as a Host Club on their dashboard.
                    </span>
                  </div>
                )}
                {accessMode === 'specific' && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <ShieldCheck size={16} className="shrink-0 text-amber-600" />
                    <span>
                      <strong className="font-bold">Selective Access Mode:</strong> Exactly{' '}
                      <strong className="font-extrabold underline">{enabledCount}</strong> of{' '}
                      <strong>{totalClubs}</strong> clubs are authorized to view and submit the Host Club Application.
                    </span>
                  </div>
                )}
                {accessMode === 'none' && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-200 flex items-center gap-2">
                    <XCircle size={16} className="shrink-0 text-red-600" />
                    <span>
                      <strong className="font-bold">Application Closed:</strong> The Host Club Application card is completely hidden from all club leader dashboards across the district.
                    </span>
                  </div>
                )}
              </div>

              {/* Specific Clubs Whitelist Table */}
              <div className={`space-y-4 ${accessMode === 'none' ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-64">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-4" />
                      <Input
                        placeholder="Search club name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 text-xs py-1.5"
                      />
                    </div>
                    <div className="w-44">
                      <Select
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                        options={[
                          { value: 'all', label: 'All Zones' },
                          ...zones.map((z) => ({ value: z.id, label: z.name })),
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSelectAllFiltered}
                      disabled={filteredClubs.length === 0}
                    >
                      Enable Filtered ({filteredClubs.length})
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDeselectAllFiltered}
                      disabled={filteredClubs.length === 0}
                    >
                      Disable Filtered
                    </Button>
                  </div>
                </div>

                {/* Clubs Grid List */}
                <div className="border border-line rounded-2xl overflow-hidden divide-y divide-line max-h-96 overflow-y-auto bg-surface">
                  {filteredClubs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-fg-4">
                      No clubs found matching your search filters.
                    </div>
                  ) : (
                    filteredClubs.map((club) => {
                      const isAllowed = allowedClubIds.includes(club.id);
                      const zoneName = club.zoneId ? zoneMap[club.zoneId] || 'Zone Unknown' : 'Zone Unknown';

                      return (
                        <div
                          key={club.id}
                          className={`flex items-center justify-between p-3.5 px-4 transition-colors ${
                            isAllowed && accessMode === 'specific'
                              ? 'bg-blue-50/40 dark:bg-blue-950/10'
                              : 'hover:bg-surface-2'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isAllowed}
                              onChange={() => handleToggleClub(club.id)}
                              className="h-4 w-4 rounded border-line text-[#19539D] focus:ring-[#19539D]"
                            />
                            <div>
                              <div className="text-xs font-bold text-fg flex items-center gap-2">
                                {club.name}
                                {club.shortName && (
                                  <span className="text-[10px] text-fg-4 font-normal">
                                    ({club.shortName})
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-fg-3 flex items-center gap-2 mt-0.5">
                                <span>{zoneName}</span>
                                <span>•</span>
                                <span className="capitalize">{(club as any).category || 'Community'} Club</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isAllowed ? (
                              <Badge tone="green">Access Enabled</Badge>
                            ) : (
                              <Badge tone="outline">Hidden</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Save Bar */}
              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                <div className="text-xs text-fg-3">
                  {hasChanges ? (
                    <span className="text-amber-600 font-medium">Unsaved changes pending</span>
                  ) : (
                    <span>All access rules saved and live</span>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    saveSettingsMutation.mutate({
                      'dashboard.hostClubApp.accessMode': accessMode,
                      'dashboard.hostClubApp.allowedClubIds': allowedClubIds,
                    });
                  }}
                  disabled={!hasChanges || saveSettingsMutation.isPending}
                  leading={<Save size={14} />}
                >
                  {saveSettingsMutation.isPending ? 'Saving Access Rules...' : 'Save Access Rules'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: Form Builder (PostgreSQL Backend Engine) */}
        {activeTab === 'form_builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Form Selector & Metadata */}
            <div className="lg:col-span-1 space-y-6">
              <Card title="Forms Registry" eyebrow="Application Management">
                <div className="space-y-2 mb-4">
                  <button
                    type="button"
                    onClick={handleResetFormBuilder}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                      editingFormId === 'new'
                        ? 'border-[#19539D] bg-blue-50/50 text-[#19539D]'
                        : 'border-dashed border-line hover:border-fg-4 text-fg-2'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Plus size={14} /> Create New Application
                    </span>
                    <Badge tone="outline">New</Badge>
                  </button>

                  <div className="divide-y divide-line border border-line rounded-xl overflow-hidden bg-surface max-h-72 overflow-y-auto">
                    {forms.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleSelectFormToEdit(f)}
                        className={`w-full text-left p-3 transition-colors text-xs flex flex-col gap-1 ${
                          editingFormId === f.id ? 'bg-blue-50/40 text-[#19539D] font-bold' : 'hover:bg-surface-2'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate pr-2">{f.title}</span>
                          <Badge tone={f.status === 'published' ? 'green' : 'outline'}>
                            {f.status}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-fg-4 flex items-center justify-between">
                          <span>{f.fields?.length || 0} fields</span>
                          <span>{f.submissionCount || 0} responses</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-line">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-fg-3 mb-1">
                      Form Title *
                    </label>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Boost Club Growth Initiative"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-fg-3 mb-1">
                      URL Slug *
                    </label>
                    <Input
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="e.g. boost-club-2026"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-fg-3 mb-1">
                      Category
                    </label>
                    <Input
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. Exchange Fellowship & Hosting"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-fg-3 mb-1">
                      Brief Description
                    </label>
                    <Textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe what this application is for..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-fg-3 mb-1">
                      Publish Status
                    </label>
                    <Select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      options={[
                        { value: 'published', label: 'Published (Live on Dashboard)' },
                        { value: 'draft', label: 'Draft (Admin Only)' },
                        { value: 'archived', label: 'Archived (Closed)' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-fg-3 mb-1">
                      Access Mode
                    </label>
                    <Select
                      value={formAccessMode}
                      onChange={(e) => setFormAccessMode(e.target.value as any)}
                      options={[
                        { value: 'all', label: 'All RID 3011 Clubs' },
                        { value: 'specific', label: 'Specific Clubs (Selective)' },
                        { value: 'none', label: 'Disabled / Closed' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-fg-3 mb-1">
                      Target Roles
                    </label>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto border border-line rounded-lg p-2 bg-surface-2 text-xs">
                      {ROLE_OPTIONS.map((r) => {
                        const checked = formTargetRoles.includes(r.value);
                        return (
                          <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setFormTargetRoles((prev) =>
                                  checked ? prev.filter((k) => k !== r.value) : [...prev, r.value]
                                );
                              }}
                              className="h-3.5 w-3.5 rounded border-line text-[#19539D]"
                            />
                            <span>{r.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-line flex items-center justify-between gap-2">
                  {editingFormId !== 'new' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteFormMutation.mutate(editingFormId)}
                      disabled={deleteFormMutation.isPending}
                      leading={<Trash2 size={13} />}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => saveFormMutation.mutate()}
                    disabled={!formTitle.trim() || saveFormMutation.isPending}
                    leading={<Save size={14} />}
                  >
                    {saveFormMutation.isPending ? 'Saving...' : editingFormId === 'new' ? 'Create Form' : 'Update Form'}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column: Interactive Field Canvas */}
            <div className="lg:col-span-2 space-y-6">
              <Card
                title={`Form Field Canvas: ${formTitle || 'Untitled Form'}`}
                eyebrow="Form Canvas"
              >
                <p className="text-xs text-fg-3 mb-4">
                  Add, remove, reorder, and configure custom input questions and Google Drive proposal links.
                </p>

                {/* Field Palette Actions */}
                <div className="mb-6 p-4 rounded-2xl bg-surface-2 border border-line">
                  <div className="text-xs font-black uppercase tracking-wider text-fg-3 mb-3">
                    Add Question / Input Field
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleAddField('text')} leading={<Plus size={13} />}>
                      Text Line
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleAddField('textarea')} leading={<Plus size={13} />}>
                      Long Paragraph
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleAddField('link')} leading={<ExternalLink size={13} />}>
                      Google Drive Link
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleAddField('select')} leading={<Plus size={13} />}>
                      Dropdown Select
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleAddField('email')} leading={<Plus size={13} />}>
                      Email
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleAddField('phone')} leading={<Plus size={13} />}>
                      Phone
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleAddField('number')} leading={<Plus size={13} />}>
                      Number
                    </Button>
                  </div>
                </div>

                {/* Fields List */}
                <div className="space-y-3">
                  {formFields.length === 0 ? (
                    <div className="p-12 text-center text-xs text-fg-4 border border-dashed border-line rounded-2xl">
                      No fields configured. Click any button in the palette above to add your first form question.
                    </div>
                  ) : (
                    formFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="p-4 rounded-xl border border-line bg-surface hover:border-fg-4 transition-colors space-y-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-fg-3">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-fg uppercase tracking-wider">
                              {field.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveField(idx, 'up')}
                              disabled={idx === 0}
                            >
                              <ArrowUp size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveField(idx, 'down')}
                              disabled={idx === formFields.length - 1}
                            >
                              <ArrowDown size={14} />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveField(field.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-fg-3 uppercase mb-1">
                              Question Label *
                            </label>
                            <Input
                              value={field.label}
                              onChange={(e) => handleUpdateFieldProp(field.id, 'label', e.target.value)}
                              placeholder="e.g. Why should your club host delegates?"
                              className="text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-fg-3 uppercase mb-1">
                              Field Name (Identifier)
                            </label>
                            <Input
                              value={field.name}
                              onChange={(e) => handleUpdateFieldProp(field.id, 'name', e.target.value)}
                              placeholder="e.g. motivation"
                              className="text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-fg-3 uppercase mb-1">
                              Placeholder / Hint
                            </label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => handleUpdateFieldProp(field.id, 'placeholder', e.target.value)}
                              placeholder="e.g. Type your response..."
                              className="text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-fg-3 uppercase mb-1">
                              Helper Text
                            </label>
                            <Input
                              value={field.helperText || ''}
                              onChange={(e) => handleUpdateFieldProp(field.id, 'helperText', e.target.value)}
                              placeholder="e.g. Include link to Google Drive proposal document"
                              className="text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-line">
                          <label className="flex items-center gap-2 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => handleUpdateFieldProp(field.id, 'required', e.target.checked)}
                              className="h-3.5 w-3.5 rounded border-line text-[#19539D]"
                            />
                            <span className="font-semibold">Required Question</span>
                          </label>

                          {field.type === 'select' && (
                            <span className="text-[11px] text-fg-4">
                              Options: {field.options?.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: Responses Viewer */}
        {activeTab === 'responses' && (
          <div className="space-y-6">
            <Card
              title="Form Submissions & Response Records"
              eyebrow="Response Viewer"
            >
              <p className="text-xs text-fg-3 mb-4">
                Inspect, review, update status, and export application responses submitted by clubs and members across District 3011.
              </p>

              {/* Form Picker & Action Bar */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-2 border border-line">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-72">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-fg-3 mb-1">
                      Active Form
                    </label>
                    <Select
                      value={selectedResponseFormId}
                      onChange={(e) => setSelectedResponseFormId(e.target.value)}
                      options={forms.map((f) => ({
                        value: f.id,
                        label: `${f.title} (${f.submissionCount || 0})`,
                      }))}
                    />
                  </div>

                  <div className="w-44">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-fg-3 mb-1">
                      Status Filter
                    </label>
                    <Select
                      value={responseStatusFilter}
                      onChange={(e) => setResponseStatusFilter(e.target.value)}
                      options={[
                        { value: 'all', label: 'All Statuses' },
                        { value: 'submitted', label: 'Submitted (New)' },
                        { value: 'under_review', label: 'Under Review' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'declined', label: 'Declined' },
                      ]}
                    />
                  </div>

                  <div className="w-56">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-fg-3 mb-1">
                      Search Submissions
                    </label>
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-4" />
                      <Input
                        value={responseSearchQuery}
                        onChange={(e) => setResponseSearchQuery(e.target.value)}
                        placeholder="Name, email, club..."
                        className="pl-7 text-xs py-1.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => qc.invalidateQueries({ queryKey: ['form-submissions'] })}
                    leading={<RefreshCw size={13} />}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={submissions.length === 0}
                    leading={<Download size={13} />}
                  >
                    Export CSV ({submissions.length})
                  </Button>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="border border-line rounded-2xl overflow-hidden bg-surface">
                {submissionsQuery.isLoading ? (
                  <div className="p-12 text-center text-xs text-fg-4">Loading submissions...</div>
                ) : submissions.length === 0 ? (
                  <div className="p-12 text-center text-xs text-fg-4">
                    No submissions found for this form matching your filter criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-line bg-surface-2 text-fg-3 font-bold uppercase text-[10px] tracking-wider">
                          <th className="p-3.5 pl-4">Applicant & Contact</th>
                          <th className="p-3.5">Rotaract Club</th>
                          <th className="p-3.5">Submitted Date</th>
                          <th className="p-3.5">Proposal / Key Answers</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {submissions.map((sub) => {
                          const values = sub.values || {};
                          const driveLink = values.proposalDriveUrl || values.driveLink || values.proposalUrl;

                          return (
                            <tr key={sub.id} className="hover:bg-surface-2/60 transition-colors">
                              <td className="p-3.5 pl-4">
                                <div className="font-bold text-fg">{sub.applicantName || 'Anonymous'}</div>
                                <div className="text-[11px] text-fg-3 mt-0.5">{sub.applicantEmail || 'No email'}</div>
                                {sub.applicantPhone && (
                                  <div className="text-[10px] text-fg-4">{sub.applicantPhone}</div>
                                )}
                              </td>

                              <td className="p-3.5">
                                <div className="font-semibold text-fg">{sub.clubName || 'N/A'}</div>
                                {values.position && (
                                  <div className="text-[10px] text-fg-3">{values.position}</div>
                                )}
                              </td>

                              <td className="p-3.5 text-fg-3 whitespace-nowrap">
                                {new Date(sub.submittedAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </td>

                              <td className="p-3.5 max-w-xs">
                                {driveLink ? (
                                  <a
                                    href={driveLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline"
                                  >
                                    <ExternalLink size={12} />
                                    Proposal Document
                                  </a>
                                ) : (
                                  <span className="text-[11px] text-fg-4 truncate block">
                                    {values.motivation || 'Answers submitted'}
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5">
                                <Badge
                                  tone={
                                    sub.status === 'approved'
                                      ? 'green'
                                      : sub.status === 'declined'
                                      ? 'red'
                                      : sub.status === 'under_review'
                                      ? 'amber'
                                      : 'outline'
                                  }
                                >
                                  {sub.status.replace('_', ' ')}
                                </Badge>
                              </td>

                              <td className="p-3.5 pr-4 text-right">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSubmission(sub);
                                    setReviewNotes(sub.notes || '');
                                  }}
                                  leading={<Eye size={13} />}
                                >
                                  Review
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>

            {/* Submission Detail Review Modal */}
            {selectedSubmission && (
              <Modal
                open={Boolean(selectedSubmission)}
                onClose={() => setSelectedSubmission(null)}
                title="Application Response Details"
                footer={
                  <div className="flex flex-wrap items-center justify-between w-full gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          submissionStatusMutation.mutate({
                            subId: selectedSubmission.id,
                            status: 'under_review',
                            notes: reviewNotes,
                          })
                        }
                        disabled={submissionStatusMutation.isPending}
                        leading={<Clock size={13} />}
                      >
                        Mark Under Review
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          submissionStatusMutation.mutate({
                            subId: selectedSubmission.id,
                            status: 'declined',
                            notes: reviewNotes,
                          })
                        }
                        disabled={submissionStatusMutation.isPending}
                        leading={<XCircle size={13} />}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          submissionStatusMutation.mutate({
                            subId: selectedSubmission.id,
                            status: 'approved',
                            notes: reviewNotes,
                          })
                        }
                        disabled={submissionStatusMutation.isPending}
                        leading={<CheckCircle2 size={13} />}
                      >
                        Approve Application
                      </Button>
                    </div>

                    <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(null)}>
                      Close
                    </Button>
                  </div>
                }
              >
                <div className="space-y-6 text-xs max-h-[70vh] overflow-y-auto pr-2">
                  {/* Top Metadata Box */}
                  <div className="p-4 rounded-xl bg-surface-2 border border-line grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-[10px] text-fg-4 font-bold uppercase">Applicant</div>
                      <div className="font-bold text-fg mt-0.5">{selectedSubmission.applicantName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-fg-4 font-bold uppercase">Rotaract Club</div>
                      <div className="font-bold text-fg mt-0.5">{selectedSubmission.clubName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-fg-4 font-bold uppercase">Email / Phone</div>
                      <div className="font-bold text-fg mt-0.5">{selectedSubmission.applicantEmail}</div>
                      <div className="text-[10px] text-fg-3">{selectedSubmission.applicantPhone}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-fg-4 font-bold uppercase">Current Status</div>
                      <div className="mt-1">
                        <Badge
                          tone={
                            selectedSubmission.status === 'approved'
                              ? 'green'
                              : selectedSubmission.status === 'declined'
                              ? 'red'
                              : selectedSubmission.status === 'under_review'
                              ? 'amber'
                              : 'outline'
                          }
                        >
                          {selectedSubmission.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Question / Answers Breakdown */}
                  <div className="space-y-4">
                    <div className="text-xs font-black uppercase tracking-wider text-fg-3">
                      Submitted Responses
                    </div>

                    {Object.entries(selectedSubmission.values || {}).map(([key, val]) => {
                      const isLink = String(val).startsWith('http://') || String(val).startsWith('https://');
                      const fieldDef = activeResponseForm?.fields?.find((f) => f.id === key);
                      const fieldLabel = fieldDef?.label || key.replace(/([A-Z])/g, ' $1');
                      return (
                        <div key={key} className="p-3.5 rounded-xl border border-line bg-surface space-y-1">
                          <div className="text-[11px] font-bold text-fg-3">
                            {fieldLabel}
                          </div>
                          <div className="text-xs text-fg">
                            {isLink ? (
                              <a
                                href={String(val)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline break-all"
                              >
                                <ExternalLink size={13} className="shrink-0" />
                                {String(val)}
                              </a>
                            ) : (
                              <p className="whitespace-pre-wrap">{String(val) || '—'}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Review Notes Input */}
                  <div className="p-4 rounded-xl bg-surface-2 border border-line space-y-2">
                    <label className="block text-xs font-bold text-fg">
                      Administrative Review Notes / Feedback
                    </label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add private admin notes or rationale for approval/decline..."
                      rows={3}
                    />
                  </div>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* TAB 4: Dashboard Applications Overview */}
        {activeTab === 'all_apps' && (
          <div className="space-y-6">
            <Card
              title="Dashboard Applications Directory"
              eyebrow="Directory"
            >
              <p className="text-xs text-fg-3 mb-4">
                Overview of administrative intake applications deployed to member and club leader dashboards.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl border border-line bg-surface hover:border-fg-4 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge tone={app.status === 'published' ? 'green' : 'outline'}>
                          {app.status}
                        </Badge>
                        <span className="text-[11px] text-fg-4 font-mono font-medium">
                          {app.fields?.length || 0} fields
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-fg mb-1.5">{app.title}</h4>
                      <p className="text-xs text-fg-3 line-clamp-3 mb-4">{app.description || 'No description'}</p>

                      <div className="space-y-2 py-3 border-t border-line text-[11px]">
                        <div className="flex items-center justify-between text-fg-3">
                          <span>Target Surface:</span>
                          <span className="font-semibold text-fg capitalize">{app.targetSurface}</span>
                        </div>
                        <div className="flex items-center justify-between text-fg-3">
                          <span>Access Mode:</span>
                          <span className="font-semibold text-fg capitalize">{app.accessMode}</span>
                        </div>
                        <div className="flex items-center justify-between text-fg-3">
                          <span>Submissions:</span>
                          <span className="font-bold text-[#19539D]">{app.submissionCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-line flex items-center justify-between gap-2 mt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedResponseFormId(app.id);
                          setActiveTab('responses');
                        }}
                        leading={<FileText size={13} />}
                      >
                        Responses ({app.submissionCount || 0})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleSelectFormToEdit(app);
                          setActiveTab('form_builder');
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Live Card Preview Modal */}
        {showPreviewModal && (
          <Modal
            open={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            title="Dashboard Application Live Card Preview"
            footer={
              <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                Close Preview
              </Button>
            }
          >
            <div className="p-2 space-y-4">
              <p className="text-xs text-fg-3 mb-2">
                This shows the exact interactive application card as rendered on the club leader dashboard:
              </p>
              <HostClubApplicationCard />
            </div>
          </Modal>
        )}
      </Section>
    </Container>
  );
}
