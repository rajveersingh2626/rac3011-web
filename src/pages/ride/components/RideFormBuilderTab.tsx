import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Save, Eye, 
  Layers, Download, Search, ExternalLink, RefreshCw, FileText, Check
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  fetchRideAdminForms,
  createRideAdminForm,
  updateRideAdminForm,
  deleteRideAdminForm,
  fetchRideFormSubmissions,
  updateRideSubmissionStatus,
  type RideFormItem,
  type RideFormFieldDefinition,
  type RideFormFieldType,
  type RideFormSubmissionItem,
} from '@/lib/ride/rideFormsApi';

const FIELD_PALETTE: { type: RideFormFieldType; label: string; icon: string }[] = [
  { type: 'text', label: 'Single Line Text', icon: 'Aa' },
  { type: 'textarea', label: 'Paragraph Text', icon: '¶' },
  { type: 'link', label: 'Google Drive / URL', icon: '🔗' },
  { type: 'select', label: 'Dropdown Select', icon: '▾' },
  { type: 'radio', label: 'Radio Options', icon: '◉' },
  { type: 'multiselect', label: 'Multi-Select', icon: '☑' },
  { type: 'email', label: 'Email Address', icon: '@' },
  { type: 'phone', label: 'Phone Number', icon: '#' },
  { type: 'number', label: 'Numeric Value', icon: '123' },
  { type: 'date', label: 'Date Picker', icon: '📅' },
  { type: 'checkbox', label: 'Checkbox / Consent', icon: '✓' },
  { type: 'file', label: 'File Upload Link', icon: '📁' },
];

const TARGET_ROLE_OPTIONS = [
  { value: 'all', label: 'All Registered Participants' },
  { value: 'external', label: 'External District Delegates' },
  { value: 'delhi_host', label: 'RID 3011 Host Members & Families' },
];

export function RideFormBuilderTab() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'builder' | 'responses'>('builder');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Forms query from backend
  const formsQuery = useQuery({
    queryKey: ['ride-admin-forms'],
    queryFn: fetchRideAdminForms,
    refetchInterval: 15000,
  });

  const forms: RideFormItem[] = useMemo(() => formsQuery.data ?? [], [formsQuery.data]);

  // ==========================================
  // TAB 1: FORM BUILDER STATE
  // ==========================================
  const [editingFormId, setEditingFormId] = useState<string | 'new'>('new');
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Delegate Intake');
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [formTargetRoles, setFormTargetRoles] = useState<string[]>(['all']);
  const [formFields, setFormFields] = useState<RideFormFieldDefinition[]>([
    { id: 'f1', name: 'tShirtSize', label: 'T-Shirt Size', type: 'select', required: true, options: ['S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'f2', name: 'flightTicketLink', label: 'Travel Ticket / Flight PDF (Google Drive Link)', type: 'link', required: true, placeholder: 'https://drive.google.com/...' },
  ]);

  const handleSelectFormToEdit = (f: RideFormItem) => {
    setEditingFormId(f.id);
    setFormTitle(f.title);
    setFormSlug(f.slug);
    setFormDescription(f.description || '');
    setFormCategory(f.category || 'Delegate Intake');
    setFormStatus(f.status || 'published');
    setFormTargetRoles(Array.isArray(f.targetRoles) && f.targetRoles.length > 0 ? f.targetRoles : ['all']);
    setFormFields(Array.isArray(f.fields) && f.fields.length > 0 ? f.fields : []);
  };

  const handleResetFormBuilder = () => {
    setEditingFormId('new');
    setFormTitle('');
    setFormSlug('');
    setFormDescription('');
    setFormCategory('Delegate Intake');
    setFormStatus('published');
    setFormTargetRoles(['all']);
    setFormFields([
      { id: `f_${Date.now()}_1`, name: 'dietaryRequirements', label: 'Special Dietary Requirements', type: 'text', required: false, placeholder: 'e.g. Jain / Vegan / Nut allergy' },
      { id: `f_${Date.now()}_2`, name: 'emergencyProof', label: 'Emergency Identity / Insurance Document Link', type: 'link', required: false, placeholder: 'https://drive.google.com/...' },
    ]);
  };

  const handleAddField = (type: RideFormFieldType) => {
    const id = `f_${Date.now()}`;
    const fieldIndex = formFields.length + 1;
    const newField: RideFormFieldDefinition = {
      id,
      name: `field_${fieldIndex}`,
      label: type === 'link' 
        ? 'Document / Proposal Link' 
        : type === 'textarea' 
          ? 'Detailed Statement' 
          : type === 'date'
            ? 'Date Selection'
            : 'New Question',
      type,
      required: false,
      placeholder: type === 'link' ? 'https://drive.google.com/...' : 'Enter response...',
      helperText: type === 'link' ? 'Ensure link sharing is set to Anyone with link can view' : '',
      options: ['select', 'radio', 'multiselect'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
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

  const handleUpdateFieldProp = (id: string, prop: keyof RideFormFieldDefinition, value: any) => {
    setFormFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [prop]: value } : f))
    );
  };

  const handleUpdateFieldOptions = (id: string, rawOptions: string) => {
    const opts = rawOptions.split(',').map((o) => o.trim()).filter(Boolean);
    handleUpdateFieldProp(id, 'options', opts);
  };

  // Create or Update Form Mutation
  const saveFormMutation = useMutation({
    mutationFn: async () => {
      const slugVal = formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = {
        title: formTitle.trim(),
        slug: slugVal,
        description: formDescription.trim() || undefined,
        category: formCategory.trim() || 'Delegate Intake',
        status: formStatus,
        targetRoles: formTargetRoles,
        fields: formFields,
        isActive: formStatus === 'published',
        isPublic: true,
      };

      if (editingFormId === 'new') {
        return createRideAdminForm(payload);
      } else {
        return updateRideAdminForm(editingFormId, payload);
      }
    },
    onSuccess: (data) => {
      toast({
        title: editingFormId === 'new' ? 'Form Published' : 'Form Updated',
        body: `Successfully saved "${data.title}" with ${data.fields.length} dynamic questions.`,
        tone: 'success',
      });
      qc.invalidateQueries({ queryKey: ['ride-admin-forms'] });
      setEditingFormId(data.id);
    },
    onError: (err: any) => {
      toast({
        title: 'Form Save Failed',
        body: err?.message || 'Could not save form configuration.',
        tone: 'error',
      });
    },
  });

  // Delete Form Mutation
  const deleteFormMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this form? All participant submissions for this form will also be permanently deleted.')) {
        throw new Error('Cancelled');
      }
      return deleteRideAdminForm(id);
    },
    onSuccess: () => {
      toast({
        title: 'Form Deleted',
        body: 'The form and all its submissions have been removed.',
        tone: 'info',
      });
      qc.invalidateQueries({ queryKey: ['ride-admin-forms'] });
      handleResetFormBuilder();
    },
    onError: (err: any) => {
      if (err?.message !== 'Cancelled') {
        toast({
          title: 'Delete Failed',
          body: err?.message || 'Failed to delete form.',
          tone: 'error',
        });
      }
    },
  });

  // ==========================================
  // TAB 2: RESPONSES & DOSSIER REVIEW STATE
  // ==========================================
  const [selectedResponseFormId, setSelectedResponseFormId] = useState<string>('');
  const [responseStatusFilter, setResponseStatusFilter] = useState<string>('all');
  const [searchResponses, setSearchResponses] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<RideFormSubmissionItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'submitted' | 'under_review' | 'approved' | 'declined'>('under_review');

  useEffect(() => {
    if (forms.length > 0 && !selectedResponseFormId) {
      setSelectedResponseFormId(forms[0].id);
    }
  }, [forms, selectedResponseFormId]);

  const submissionsQuery = useQuery({
    queryKey: ['ride-form-submissions', selectedResponseFormId, responseStatusFilter],
    queryFn: () => {
      if (!selectedResponseFormId) return Promise.resolve([]);
      return fetchRideFormSubmissions(selectedResponseFormId, responseStatusFilter);
    },
    enabled: Boolean(selectedResponseFormId),
    refetchInterval: 15000,
  });

  const submissions: RideFormSubmissionItem[] = useMemo(
    () => submissionsQuery.data ?? [],
    [submissionsQuery.data]
  );

  const filteredSubmissions = useMemo(() => {
    if (!searchResponses.trim()) return submissions;
    const q = searchResponses.toLowerCase();
    return submissions.filter((s) => {
      return (
        s.participant.fullName.toLowerCase().includes(q) ||
        s.participant.email.toLowerCase().includes(q) ||
        s.participant.phone.toLowerCase().includes(q) ||
        s.participant.homeDistrict.toLowerCase().includes(q) ||
        s.participant.homeClubName.toLowerCase().includes(q)
      );
    });
  }, [submissions, searchResponses]);

  const activeFormObj = useMemo(
    () => forms.find((f) => f.id === selectedResponseFormId) || null,
    [forms, selectedResponseFormId]
  );

  const handleOpenSubmission = (sub: RideFormSubmissionItem) => {
    setSelectedSubmission(sub);
    setReviewStatus(sub.status);
    setReviewNotes(sub.reviewNotes || '');
  };

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSubmission || !selectedResponseFormId) return;
      return updateRideSubmissionStatus(
        selectedResponseFormId,
        selectedSubmission.id,
        reviewStatus,
        reviewNotes.trim() || undefined
      );
    },
    onSuccess: () => {
      toast({
        title: 'Dossier Updated',
        body: `Submission status successfully updated to ${reviewStatus.toUpperCase()}.`,
        tone: 'success',
      });
      qc.invalidateQueries({ queryKey: ['ride-form-submissions'] });
      setSelectedSubmission(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Status Update Failed',
        body: err?.message || 'Could not update submission status.',
        tone: 'error',
      });
    },
  });

  const exportSubmissionsCsv = () => {
    if (!activeFormObj || filteredSubmissions.length === 0) {
      toast({ title: 'Export Empty', body: 'No submissions available to export.', tone: 'info' });
      return;
    }

    const fieldCols = activeFormObj.fields.map((f) => f.name);
    const fieldHeaders = activeFormObj.fields.map((f) => `"${f.label.replace(/"/g, '""')}"`);

    const headers = [
      'Submission ID',
      'Delegate Name',
      'Email',
      'Phone',
      'Home District',
      'Home Club',
      'Review Status',
      'Review Notes',
      'Submitted At',
      ...fieldHeaders,
    ];

    const rows = filteredSubmissions.map((s) => {
      const vals = s.values || {};
      const answerCols = fieldCols.map((col) => {
        const raw = vals[col];
        const str = raw === undefined || raw === null ? '' : typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
        return `"${str.replace(/"/g, '""')}"`;
      });

      return [
        `"${s.id}"`,
        `"${s.participant.fullName.replace(/"/g, '""')}"`,
        `"${s.participant.email}"`,
        `"${s.participant.phone}"`,
        `"${s.participant.homeDistrict}"`,
        `"${s.participant.homeClubName.replace(/"/g, '""')}"`,
        `"${s.status}"`,
        `"${(s.reviewNotes || '').replace(/"/g, '""')}"`,
        `"${new Date(s.createdAt).toISOString()}"`,
        ...answerCols,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeFormObj.slug}_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border-2 border-[#171515] ride-pop">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#171515] uppercase tracking-tight">
              DMJ Custom Intake Form Manager
            </h2>
            <Badge tone="blue">RIDE Ecosystem</Badge>
          </div>
          <p className="text-xs text-neutral-600 mt-1 font-medium">
            Architect custom dynamic registration questionnaires for Delhi Meri Jaan delegates and inspect submissions in real-time.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-[#F5F2EB] p-1.5 rounded-2xl border border-neutral-300">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'builder'
                ? 'bg-[#19539D] text-white ride-pop-sm'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            <Layers size={14} /> Form Architect
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('responses')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'responses'
                ? 'bg-[#19539D] text-white ride-pop-sm'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            <FileText size={14} /> Submissions Dossier
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* TAB 1: FORM BUILDER CANVAS                 */}
      {/* ========================================== */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Selector & Form Metadata */}
          <div className="lg:col-span-1 space-y-6">
            <Card
              title="Forms Registry"
              eyebrow="DMJ Questionnaires"
              className="border-2 border-[#171515] ride-pop-sm bg-white"
            >
              <div className="space-y-2 mb-4">
                <button
                  type="button"
                  onClick={handleResetFormBuilder}
                  className={`w-full text-left p-3 rounded-2xl border-2 text-xs font-black transition-all flex items-center justify-between ${
                    editingFormId === 'new'
                      ? 'border-[#19539D] bg-blue-50/70 text-[#19539D]'
                      : 'border-dashed border-neutral-300 hover:border-neutral-400 text-neutral-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Plus size={14} /> Create New Intake Form
                  </span>
                  <Badge tone="amber">New</Badge>
                </button>

                <div className="divide-y divide-neutral-200 border-2 border-neutral-200 rounded-2xl overflow-hidden bg-[#FAF8F5] max-h-64 overflow-y-auto">
                  {forms.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-500 font-medium">
                      No custom forms found. Click above to create the first questionnaire!
                    </div>
                  ) : (
                    forms.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleSelectFormToEdit(f)}
                        className={`w-full text-left p-3 transition-colors text-xs flex flex-col gap-1 ${
                          editingFormId === f.id
                            ? 'bg-blue-100/70 text-[#19539D] font-black'
                            : 'hover:bg-white text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate pr-2 font-bold">{f.title}</span>
                          <Badge tone={f.status === 'published' ? 'green' : 'amber'}>
                            {f.status}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-neutral-500 flex items-center justify-between">
                          <span>{f.fields?.length || 0} questions</span>
                          <span>{f.submissionCount || 0} responses</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Form Metadata Fields */}
              <div className="space-y-3 pt-4 border-t-2 border-neutral-200">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Form Title *
                  </label>
                  <Input
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      if (editingFormId === 'new') {
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    placeholder="e.g. Travel & Flight Details Intake"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    URL Slug *
                  </label>
                  <Input
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. travel-and-flight-details"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Category
                  </label>
                  <Input
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Delegate Intake / Feedback"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Instructions for participants filling this form..."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Publish Status
                  </label>
                  <Select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    options={[
                      { value: 'published', label: 'Published (Live on Participant Portal)' },
                      { value: 'draft', label: 'Draft (Admin Hidden)' },
                      { value: 'archived', label: 'Archived (Closed)' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Target Roles
                  </label>
                  <div className="space-y-1.5 border border-neutral-300 rounded-xl p-2.5 bg-neutral-50 text-xs">
                    {TARGET_ROLE_OPTIONS.map((r) => {
                      const checked = formTargetRoles.includes(r.value);
                      return (
                        <label key={r.value} className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setFormTargetRoles((prev) =>
                                checked ? prev.filter((k) => k !== r.value) : [...prev, r.value]
                              );
                            }}
                            className="rounded border-neutral-300 text-[#19539D] focus:ring-0"
                          />
                          <span>{r.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t-2 border-neutral-200 flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => saveFormMutation.mutate()}
                  disabled={!formTitle.trim() || saveFormMutation.isPending}
                  leading={<Save size={15} />}
                >
                  {saveFormMutation.isPending ? 'Saving...' : editingFormId === 'new' ? 'Create Form' : 'Update Form'}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowPreviewModal(true)}
                    disabled={formFields.length === 0}
                    leading={<Eye size={14} />}
                  >
                    Interactive Preview
                  </Button>

                  {editingFormId !== 'new' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteFormMutation.mutate(editingFormId)}
                      disabled={deleteFormMutation.isPending}
                      leading={<Trash2 size={14} />}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Interactive Field Palette and Question Canvas */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              title={`Canvas: ${formTitle || 'Untitled Form'}`}
              eyebrow="Dynamic Questions Canvas"
              className="border-2 border-[#171515] ride-pop-sm bg-white"
            >
              {/* Field Palette Actions (12 Field Types) */}
              <div className="mb-6 p-4 rounded-2xl bg-[#F8F6F0] border-2 border-neutral-300">
                <div className="text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-3 flex items-center justify-between">
                  <span>Add Input Field (12 Supported Types)</span>
                  <span className="text-neutral-400 font-mono">{formFields.length} configured</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {FIELD_PALETTE.map((pal) => (
                    <button
                      key={pal.type}
                      type="button"
                      onClick={() => handleAddField(pal.type)}
                      className="p-2.5 rounded-xl border border-neutral-300 bg-white hover:border-[#19539D] hover:bg-blue-50/50 transition-all text-left flex flex-col gap-1 group"
                    >
                      <span className="text-sm font-black text-neutral-700 group-hover:text-[#19539D]">{pal.icon}</span>
                      <span className="text-[10px] font-bold text-neutral-600 leading-tight">{pal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Field Cards */}
              <div className="space-y-4">
                {formFields.length === 0 ? (
                  <div className="p-12 text-center text-xs text-neutral-500 border-2 border-dashed border-neutral-300 rounded-2xl bg-neutral-50">
                    No questions configured yet. Click any field type in the palette above to add your first question!
                  </div>
                ) : (
                  formFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-4 rounded-2xl border-2 border-neutral-300 bg-white hover:border-neutral-500 transition-colors space-y-3 ride-pop-sm"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#19539D] text-white flex items-center justify-center font-black text-[11px]">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
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
                          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                            Question / Label *
                          </label>
                          <Input
                            value={field.label}
                            onChange={(e) => handleUpdateFieldProp(field.id, 'label', e.target.value)}
                            placeholder="e.g. Dietary Preferences"
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                            Variable Key (Unique Identifier)
                          </label>
                          <Input
                            value={field.name}
                            onChange={(e) => handleUpdateFieldProp(field.id, 'name', e.target.value)}
                            placeholder="e.g. dietary_preference"
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                            Placeholder / Hint
                          </label>
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => handleUpdateFieldProp(field.id, 'placeholder', e.target.value)}
                            placeholder="e.g. Type response here..."
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                            Helper Text / Notes
                          </label>
                          <Input
                            value={field.helperText || ''}
                            onChange={(e) => handleUpdateFieldProp(field.id, 'helperText', e.target.value)}
                            placeholder="e.g. Please ensure link is accessible"
                            className="text-xs"
                          />
                        </div>
                      </div>

                      {/* Options Editor for Select / Radio / Multiselect */}
                      {['select', 'radio', 'multiselect'].includes(field.type) && (
                        <div className="pt-2 border-t border-neutral-200">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                            Dropdown / Choice Options (comma-separated)
                          </label>
                          <Input
                            value={(field.options || []).join(', ')}
                            onChange={(e) => handleUpdateFieldOptions(field.id, e.target.value)}
                            placeholder="Option A, Option B, Option C"
                            className="text-xs"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleUpdateFieldProp(field.id, 'required', e.target.checked)}
                            className="rounded border-neutral-300 text-[#19539D] focus:ring-0"
                          />
                          <span>Mandatory / Required Field</span>
                        </label>

                        {field.options && field.options.length > 0 && (
                          <span className="text-[10px] text-neutral-500 font-semibold">
                            {field.options.length} options defined
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

      {/* ========================================== */}
      {/* TAB 2: RESPONSES & DOSSIER VIEWER          */}
      {/* ========================================== */}
      {activeTab === 'responses' && (
        <div className="space-y-6">
          <Card
            title="Participant Form Responses & Dossier Review"
            eyebrow="Response Dossier"
            className="border-2 border-[#171515] ride-pop-sm bg-white"
          >
            {/* Filter Bar */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F5F2EB] border-2 border-neutral-300">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-64">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Select Questionnaire
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
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
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

                <div className="w-64">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Search Delegate
                  </label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <Input
                      value={searchResponses}
                      onChange={(e) => setSearchResponses(e.target.value)}
                      placeholder="Name, email, district..."
                      className="pl-8 text-xs py-1.5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => qc.invalidateQueries({ queryKey: ['ride-form-submissions'] })}
                  leading={<RefreshCw size={13} />}
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={exportSubmissionsCsv}
                  disabled={filteredSubmissions.length === 0}
                  leading={<Download size={13} />}
                >
                  Export CSV ({filteredSubmissions.length})
                </Button>
              </div>
            </div>

            {/* Submissions Table */}
            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-500 border-2 border-dashed border-neutral-300 rounded-2xl bg-neutral-50">
                {submissions.length === 0
                  ? 'No responses have been submitted for this questionnaire yet.'
                  : 'No submissions matched your search criteria.'}
              </div>
            ) : (
              <div className="overflow-x-auto border-2 border-neutral-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b-2 border-neutral-200 text-neutral-600 uppercase font-black tracking-wider text-[10px]">
                      <th className="p-3">Participant</th>
                      <th className="p-3">District & Club</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Submitted At</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {filteredSubmissions.map((sub) => {
                      const tone =
                        sub.status === 'approved'
                          ? 'green'
                          : sub.status === 'under_review'
                            ? 'amber'
                            : sub.status === 'declined'
                              ? 'red'
                              : 'blue';

                      return (
                        <tr key={sub.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-neutral-900">{sub.participant.fullName}</div>
                            <div className="text-[11px] text-neutral-500">{sub.participant.email} · {sub.participant.phone}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-neutral-800">RID {sub.participant.homeDistrict}</div>
                            <div className="text-[11px] text-neutral-500">{sub.participant.homeClubName}</div>
                          </td>
                          <td className="p-3">
                            <Badge tone={tone}>{sub.status.replace('_', ' ')}</Badge>
                          </td>
                          <td className="p-3 text-neutral-600 text-[11px]">
                            {new Date(sub.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenSubmission(sub)}
                              leading={<Eye size={13} />}
                            >
                              Inspect Dossier
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================== */}
      {/* INSPECT SUBMISSION DOSSIER MODAL           */}
      {/* ========================================== */}
      {selectedSubmission && activeFormObj && (
        <Modal
          open={Boolean(selectedSubmission)}
          onClose={() => setSelectedSubmission(null)}
          title={`Response Dossier: ${selectedSubmission.participant.fullName}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Participant Profile Banner */}
            <div className="p-4 rounded-2xl bg-[#F5F2EB] border-2 border-neutral-300 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-black text-neutral-900">
                  {selectedSubmission.participant.fullName}
                </h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  RID {selectedSubmission.participant.homeDistrict} · {selectedSubmission.participant.homeClubName} · {selectedSubmission.participant.participantType}
                </p>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Email: <span className="font-semibold">{selectedSubmission.participant.email}</span> · Phone: <span className="font-semibold">{selectedSubmission.participant.phone}</span>
                </p>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-black uppercase text-neutral-500">Submitted On</div>
                <div className="text-xs font-bold text-neutral-800">
                  {new Date(selectedSubmission.createdAt).toLocaleString('en-GB')}
                </div>
              </div>
            </div>

            {/* Questions & Answers */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-neutral-700">
                Submitted Answers ({activeFormObj.fields.length} Questions)
              </h5>
              <div className="divide-y divide-neutral-200 border-2 border-neutral-200 rounded-2xl overflow-hidden bg-white">
                {activeFormObj.fields.map((f) => {
                  const val = selectedSubmission.values[f.name];
                  const isLink = f.type === 'link' || (typeof val === 'string' && val.startsWith('http'));

                  return (
                    <div key={f.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="sm:w-1/3">
                        <span className="text-xs font-black text-neutral-800">{f.label}</span>
                        {f.helperText && <p className="text-[10px] text-neutral-500 mt-0.5">{f.helperText}</p>}
                      </div>
                      <div className="sm:w-2/3">
                        {val === undefined || val === null || val === '' ? (
                          <span className="text-xs text-neutral-400 italic">No answer provided</span>
                        ) : isLink ? (
                          <a
                            href={String(val)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-black text-[#19539D] hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                          >
                            <ExternalLink size={13} /> Open Attached Link
                          </a>
                        ) : (
                          <div className="text-xs text-neutral-800 whitespace-pre-wrap font-medium">
                            {typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review Decision Controls */}
            <div className="p-4 rounded-2xl border-2 border-neutral-300 bg-neutral-50 space-y-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-neutral-700">
                Committee Review Decision
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Review Status
                  </label>
                  <Select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    options={[
                      { value: 'submitted', label: 'Submitted (Pending Review)' },
                      { value: 'under_review', label: 'Under Review' },
                      { value: 'approved', label: 'Approved / Verified' },
                      { value: 'declined', label: 'Declined / Needs Revision' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">
                    Internal Notes / Comments
                  </label>
                  <Input
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="e.g. Flight ticket verified for Dec 26 arrival"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate()}
                  disabled={updateStatusMutation.isPending}
                  leading={<Check size={14} />}
                >
                  {updateStatusMutation.isPending ? 'Saving...' : 'Save Decision'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================== */}
      {/* LIVE INTERACTIVE FORM PREVIEW MODAL        */}
      {/* ========================================== */}
      {showPreviewModal && (
        <Modal
          open={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title={`Live Preview: ${formTitle || 'Untitled Questionnaire'}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50 border-2 border-[#19539D] text-xs text-blue-900 flex items-start gap-2">
              <Eye size={18} className="text-[#19539D] shrink-0 mt-0.5" />
              <div>
                <strong className="font-black">Interactive Sandbox Preview:</strong> This simulates exactly how DMJ delegates will view, validate, and complete this form in the RIDE Participant Dashboard.
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-neutral-900">{formTitle || 'Untitled Questionnaire'}</h3>
              <p className="text-xs text-neutral-600">{formDescription || 'Please complete all required fields below.'}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast({
                  title: 'Validation Passed',
                  body: 'All questions satisfied in preview mode!',
                  tone: 'success',
                });
              }}
              className="space-y-4"
            >
              {formFields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-xs font-black text-neutral-800">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <Textarea placeholder={field.placeholder || ''} rows={3} required={field.required} />
                  ) : field.type === 'select' ? (
                    <Select
                      options={[
                        { value: '', label: field.placeholder || 'Select an option...' },
                        ...(field.options || []).map((o) => ({ value: o, label: o })),
                      ]}
                      required={field.required}
                    />
                  ) : field.type === 'radio' ? (
                    <div className="space-y-1.5">
                      {(field.options || ['Yes', 'No']).map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                          <input type="radio" name={field.name} required={field.required} className="text-[#19539D]" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                      <input type="checkbox" required={field.required} className="text-[#19539D] rounded" />
                      <span>{field.placeholder || 'I confirm and agree to this condition'}</span>
                    </label>
                  ) : (
                    <Input
                      type={
                        field.type === 'email'
                          ? 'email'
                          : field.type === 'number'
                            ? 'number'
                            : field.type === 'date'
                              ? 'date'
                              : 'text'
                      }
                      placeholder={field.placeholder || ''}
                      required={field.required}
                    />
                  )}

                  {field.helperText && <p className="text-[10px] text-neutral-500">{field.helperText}</p>}
                </div>
              ))}

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <Button variant="secondary" size="sm" onClick={() => setShowPreviewModal(false)}>
                  Close Preview
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Test Submission
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
