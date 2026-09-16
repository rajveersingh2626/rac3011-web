import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, Eye, CheckCircle2, 
  Layers, MoveUp, MoveDown, Save, FileText, Printer
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { 
  getStoredForms, saveStoredForms, getStoredSubmissions,
  type FormDefinition, type FormFieldDefinition, type FormFieldType, type FormSubmissionRecord
} from '@/lib/ride/formsStorage';

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: 'text', label: 'Single-line Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email Address' },
  { value: 'phone', label: 'Phone / WhatsApp' },
  { value: 'date', label: 'Date / Time' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'textarea', label: 'Multi-line Text (Paragraph)' },
  { value: 'checkbox', label: 'Checkbox (Yes / No)' },
];

export function RideFormBuilderTab() {
  const [forms, setForms] = useState<FormDefinition[]>(() => getStoredForms());
  const [activeFormId, setActiveFormId] = useState<string>(() => forms[0]?.id || 'form-1');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [addFieldModalOpen, setAddFieldModalOpen] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmissionRecord | null>(null);
  const [editingField, setEditingField] = useState<FormFieldDefinition | null>(null);

  // New Field State
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<FormFieldType>('text');
  const [fieldRequired, setFieldRequired] = useState(true);
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldOptions, setFieldOptions] = useState('');

  // Toast / Save feedback
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<FormSubmissionRecord[]>(() => getStoredSubmissions());

  useEffect(() => {
    const handleSubmissionsUpdated = () => {
      setAllSubmissions(getStoredSubmissions());
    };
    window.addEventListener('ride_submissions_updated', handleSubmissionsUpdated);
    return () => window.removeEventListener('ride_submissions_updated', handleSubmissionsUpdated);
  }, []);

  const activeForm = forms.find((f) => f.id === activeFormId) || forms[0];
  const formSubmissions = allSubmissions.filter((s) => s.formId === activeForm?.id);

  const handleToggleActive = (id: string) => {
    setForms((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f));
      saveStoredForms(updated);
      return updated;
    });
  };

  const handleTogglePublic = (id: string) => {
    setForms((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, isPublic: !f.isPublic } : f));
      saveStoredForms(updated);
      return updated;
    });
  };

  const handleMoveField = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= activeForm.fields.length) return;
    const newFields = [...activeForm.fields];
    const temp = newFields[idx];
    newFields[idx] = newFields[targetIdx];
    newFields[targetIdx] = temp;

    setForms((prev) => {
      const updated = prev.map((f) => (f.id === activeForm.id ? { ...f, fields: newFields } : f));
      saveStoredForms(updated);
      return updated;
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setForms((prev) => {
      const updated = prev.map((f) =>
        f.id === activeForm.id
          ? { ...f, fields: f.fields.filter((item) => item.id !== fieldId) }
          : f
      );
      saveStoredForms(updated);
      return updated;
    });
  };

  const handleSaveField = () => {
    if (!fieldLabel.trim()) return;
    const key = fieldName.trim() || fieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const optionsArray = fieldOptions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let updatedForms: FormDefinition[];

    if (editingField) {
      updatedForms = forms.map((f) =>
        f.id === activeForm.id
          ? {
              ...f,
              fields: f.fields.map((item) =>
                item.id === editingField.id
                  ? {
                      ...item,
                      label: fieldLabel.trim(),
                      name: key,
                      type: fieldType,
                      required: fieldRequired,
                      placeholder: fieldPlaceholder.trim() || undefined,
                      options: optionsArray.length > 0 ? optionsArray : undefined,
                    }
                  : item
              ),
            }
          : f
      );
    } else {
      const newField: FormFieldDefinition = {
        id: 'f-' + Date.now(),
        label: fieldLabel.trim(),
        name: key,
        type: fieldType,
        required: fieldRequired,
        placeholder: fieldPlaceholder.trim() || undefined,
        options: optionsArray.length > 0 ? optionsArray : undefined,
      };
      updatedForms = forms.map((f) =>
        f.id === activeForm.id
          ? { ...f, fields: [...f.fields, newField] }
          : f
      );
    }

    setForms(updatedForms);
    saveStoredForms(updatedForms);
    setAddFieldModalOpen(false);
    setEditingField(null);
    setFieldLabel('');
    setFieldName('');
    setFieldPlaceholder('');
    setFieldOptions('');
  };

  const openEditModal = (field: FormFieldDefinition) => {
    setEditingField(field);
    setFieldLabel(field.label);
    setFieldName(field.name);
    setFieldType(field.type);
    setFieldRequired(field.required);
    setFieldPlaceholder(field.placeholder || '');
    setFieldOptions((field.options || []).join(', '));
    setAddFieldModalOpen(true);
  };

  const handleSaveForm = () => {
    saveStoredForms(forms);
    setSavedFeedback('Form configuration and field schema published successfully! Updates are now live on the Participant Dashboard.');
    setTimeout(() => setSavedFeedback(null), 3500);
  };

  const handlePrintSubmission = (sub: FormSubmissionRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Submission: ${sub.formTitle} - ${sub.participantName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #171515; }
            .header { border-bottom: 3px solid #FBC02D; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 0; }
            .subtitle { font-size: 12px; color: #666; margin-top: 4px; font-weight: bold; }
            .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; background: #FDFBF7; padding: 16px; border: 1px solid #DDD; border-radius: 8px; }
            .meta-item { font-size: 12px; }
            .meta-label { font-weight: bold; color: #555; text-transform: uppercase; font-size: 10px; }
            .meta-val { font-size: 13px; font-weight: bold; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #DDD; padding: 10px 14px; text-align: left; font-size: 12px; }
            th { background-color: #F3F4F6; font-weight: 800; text-transform: uppercase; font-size: 11px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">DELHI MERI JAAN 2026 • OFFICIAL SUBMISSION DOSSIER</h1>
              <div class="subtitle">ROTARY INTERNATIONAL DISTRICT 3011 • THE RIDE</div>
            </div>
            <div style="font-size: 11px; font-weight: bold; color: #888;">
              Date: ${new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">Form Title</div>
              <div class="meta-val">${sub.formTitle}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Participant / Delegate</div>
              <div class="meta-val">${sub.participantName}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Email Address</div>
              <div class="meta-val">${sub.participantEmail}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Home District</div>
              <div class="meta-val">RID ${sub.homeDistrict}</div>
            </div>
          </div>

          <h3>Recorded Questionnaire Responses</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 35%;">Field Name / Question</th>
                <th>Delegate Response</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(sub.values).map(([k, v]) => `
                <tr>
                  <td style="font-weight: bold; color: #374151;">${k}</td>
                  <td>${typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v || '—')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border-2 border-[#171515] bg-[#FFFDF7] ride-pop-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-[#19539D]" size={20} />
            <h2 className="text-lg font-black text-[#171515] uppercase tracking-wide">
              Dynamic Registration Form Builder
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mt-1 max-w-2xl font-medium">
            Configure custom delegate intake forms, adjust mandatory question sets, and publish live registration pipelines for Delhi Meri Jaan 2026.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSubmissionsModalOpen(true)}
            leading={<FileText size={15} />}
          >
            Submissions ({formSubmissions.length})
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPreviewModalOpen(true)}
            leading={<Eye size={15} />}
          >
            Live Preview
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleSaveForm}
            leading={<Save size={15} />}
          >
            Publish Changes
          </Button>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-3 rounded-xl bg-green-50 border-2 border-green-600 text-green-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-700 shrink-0" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* Main Grid: Form Selection & Fields Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Forms List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-700">
              Registration Forms ({forms.length})
            </span>
          </div>

          <div className="space-y-2">
            {forms.map((form) => (
              <div
                key={form.id}
                onClick={() => setActiveFormId(form.id)}
                className={`p-4 rounded-2xl border-2 border-[#171515] transition-all cursor-pointer ${
                  activeForm.id === form.id
                    ? 'bg-white ride-pop ring-2 ring-[#19539D]'
                    : 'bg-[#FDFBF7] hover:bg-neutral-100 ride-pop-sm opacity-90'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-black text-sm text-[#171515] leading-snug">
                    {form.title}
                  </h3>
                  <Badge tone={form.isActive ? 'green' : 'neutral'}>
                    {form.isActive ? 'Active' : 'Draft'}
                  </Badge>
                </div>

                <p className="text-[11px] text-neutral-600 mt-1 line-clamp-2">
                  {form.description}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-200 text-[10px] font-bold text-neutral-500">
                  <span>{form.fields.length} Fields · v{form.version}</span>
                  <span className={form.isPublic ? 'text-green-700' : 'text-neutral-500'}>
                    {form.isPublic ? '● Public Live' : '○ Private Link Only'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Form Fields Manager */}
        <div className="lg:col-span-8 space-y-4">
          <Card rule="accent" padding="compact" className="border-2 border-[#171515] ride-pop-sm space-y-5">
            {/* Form Metadata Controls */}
            <div className="space-y-3 pb-4 border-b border-neutral-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-[#171515]">
                    {activeForm.title}
                  </h3>
                  <div className="text-xs text-neutral-500 font-mono mt-0.5">
                    Endpoint: /public/ride/forms/{activeForm.slug}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeForm.isActive}
                      onChange={() => handleToggleActive(activeForm.id)}
                      className="rounded border-neutral-300 text-[#19539D] focus:ring-[#19539D]"
                    />
                    Accepting Submissions
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeForm.isPublic}
                      onChange={() => handleTogglePublic(activeForm.id)}
                      className="rounded border-neutral-300 text-[#19539D] focus:ring-[#19539D]"
                    />
                    Show in Navigation
                  </label>
                </div>
              </div>
            </div>

            {/* Field Headers & Add Field Action */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-neutral-700">
                  Form Question Flow ({activeForm.fields.length} Fields)
                </span>
                <p className="text-[11px] text-neutral-500">
                  Reorder questions or configure validation requirements.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSubmissionsModalOpen(true)}
                  leading={<FileText size={14} />}
                >
                  View Submissions ({formSubmissions.length})
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setEditingField(null);
                    setFieldLabel('');
                    setFieldName('');
                    setFieldType('text');
                    setFieldRequired(true);
                    setFieldPlaceholder('');
                    setFieldOptions('');
                    setAddFieldModalOpen(true);
                  }}
                  leading={<Plus size={14} />}
                >
                  Add Field
                </Button>
              </div>
            </div>

            {/* Fields Table / Reorder List */}
            <div className="space-y-2">
              {activeForm.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between gap-3 p-3.5 bg-[#FDFBF7] rounded-xl border border-[#171515]/20 hover:border-[#171515] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center font-mono text-xs font-black text-neutral-400">
                      #{idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#171515] truncate">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-2 mt-0.5">
                        <span className="bg-neutral-200 px-1.5 py-0.2 rounded text-[10px] text-neutral-700 font-semibold">
                          {field.type}
                        </span>
                        <span>Key: {field.name}</span>
                        {field.placeholder && (
                          <span className="italic text-neutral-400 truncate">
                            &ldquo;{field.placeholder}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveField(idx, -1)}
                      className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <MoveUp size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === activeForm.fields.length - 1}
                      onClick={() => handleMoveField(idx, 1)}
                      className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <MoveDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(field)}
                      className="p-1 text-neutral-500 hover:text-blue-600 ml-1"
                      title="Edit Field"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteField(field.id)}
                      className="p-1 text-neutral-400 hover:text-red-600"
                      title="Delete Field"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Submissions & PDF Export Modal */}
      <Modal
        open={submissionsModalOpen}
        onClose={() => {
          setSubmissionsModalOpen(false);
          setSelectedSubmission(null);
        }}
        title={`Submissions Dossier: ${activeForm.title} (${formSubmissions.length})`}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-neutral-500 font-semibold">
              Live responses received from delegates & clubs
            </span>
            <Button
              variant="secondary"
              onClick={() => {
                setSubmissionsModalOpen(false);
                setSelectedSubmission(null);
              }}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto">
          {formSubmissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
              No submissions recorded yet for this form. As delegates fill out this form on the participant dashboard, their responses will appear here.
            </div>
          ) : selectedSubmission ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedSubmission(null)}
                >
                  &larr; Back to List
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handlePrintSubmission(selectedSubmission)}
                  leading={<Printer size={14} />}
                >
                  Export Printable PDF
                </Button>
              </div>

              <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#171515]/20 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-neutral-500 font-bold">Delegate:</span> <span className="font-black text-[#171515]">{selectedSubmission.participantName}</span></div>
                  <div><span className="text-neutral-500 font-bold">Email:</span> <span className="font-semibold text-[#19539D]">{selectedSubmission.participantEmail}</span></div>
                  <div><span className="text-neutral-500 font-bold">Home District:</span> <span className="font-black">RID {selectedSubmission.homeDistrict}</span></div>
                  <div><span className="text-neutral-500 font-bold">Submitted At:</span> <span className="font-medium text-neutral-600">{new Date(selectedSubmission.submittedAt).toLocaleString('en-GB')}</span></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700">Submitted Responses</h4>
                {Object.entries(selectedSubmission.values).map(([key, val]) => (
                  <div key={key} className="p-3 bg-white rounded-lg border border-neutral-200 text-xs">
                    <div className="font-bold text-neutral-500 text-[11px] uppercase">{key}</div>
                    <div className="font-black text-neutral-900 mt-0.5">
                      {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val || '—')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {formSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 bg-white rounded-xl border border-neutral-200 hover:border-[#171515] transition-all flex items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setSelectedSubmission(sub)}
                >
                  <div>
                    <div className="font-black text-xs text-[#171515]">{sub.participantName}</div>
                    <div className="text-[11px] text-neutral-500">
                      RID {sub.homeDistrict} · {sub.participantEmail}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <Button size="sm" variant="secondary">
                      View Answers
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Add / Edit Field Modal */}
      <Modal
        open={addFieldModalOpen}
        onClose={() => {
          setAddFieldModalOpen(false);
          setEditingField(null);
        }}
        title={editingField ? 'Edit Question Field' : 'Add Form Question'}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setAddFieldModalOpen(false);
                setEditingField(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!fieldLabel.trim()}
              onClick={handleSaveField}
            >
              {editingField ? 'Save Changes' : 'Append Field'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
              Field Question / Label *
            </label>
            <Input
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              placeholder="e.g. Dietary Preference / Home Rotary District"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
                Data Key (Optional)
              </label>
              <Input
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g. dietary_preference"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
                Input Type
              </label>
              <Select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value as FormFieldType)}
                options={FIELD_TYPES}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
              Placeholder / Hint Text
            </label>
            <Input
              value={fieldPlaceholder}
              onChange={(e) => setFieldPlaceholder(e.target.value)}
              placeholder="e.g. Select your food preference or enter special allergies"
            />
          </div>

          {fieldType === 'select' && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
                Dropdown Options (Comma separated)
              </label>
              <Input
                value={fieldOptions}
                onChange={(e) => setFieldOptions(e.target.value)}
                placeholder="Vegetarian, Jain, Non-Vegetarian, Vegan"
              />
            </div>
          )}

          <div className="pt-2 border-t border-neutral-200">
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={fieldRequired}
                onChange={(e) => setFieldRequired(e.target.checked)}
                className="rounded text-[#19539D] focus:ring-[#19539D]"
              />
              Mark this question as mandatory for submission
            </label>
          </div>
        </div>
      </Modal>

      {/* Live Form Preview Modal */}
      <Modal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={`Delegate Preview • ${activeForm.title}`}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-neutral-500 font-medium">
              Live testing mode • No data saved to database
            </span>
            <Button variant="secondary" onClick={() => setPreviewModalOpen(false)}>
              Close Preview
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2 max-h-[60vh] overflow-y-auto px-1">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <h4 className="text-sm font-black text-[#171515]">{activeForm.title}</h4>
            <p className="text-xs text-neutral-600 mt-1">{activeForm.description}</p>
          </div>

          <div className="space-y-4">
            {activeForm.fields.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="block text-xs font-black text-neutral-800">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'select' ? (
                  <select className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs bg-white">
                    <option value="">-- Choose an option --</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-sans"
                  />
                ) : field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer pt-1">
                    <input type="checkbox" className="rounded text-[#19539D]" />
                    <span>{field.placeholder || 'I acknowledge and agree'}</span>
                  </label>
                ) : (
                  <input
                    type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-200">
            <Button className="w-full" variant="primary" disabled>
              Submit Delegate Application (Preview Disabled)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
