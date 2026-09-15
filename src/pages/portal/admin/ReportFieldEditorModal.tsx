import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, Sparkles, ListPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import type { ReportFieldInput } from '@/lib/reports/api';
import type { ReportFieldType } from '@/lib/reports/types';
import { selectChoices, linkAllowsMultiple } from '@/lib/reports/values';

const FIELD_TYPES: { value: ReportFieldType; label: string }[] = [
  { value: 'text', label: 'Single-line text' },
  { value: 'textarea', label: 'Multi-line long text' },
  { value: 'number', label: 'Number / Metric counter' },
  { value: 'select', label: 'Dropdown (Single choice)' },
  { value: 'multiselect', label: 'Dropdown (Multiple choices)' },
  { value: 'link', label: 'Link / Photo upload' },
  { value: 'date', label: 'Calendar Date' },
  { value: 'boolean', label: 'Yes / No toggle' },
  { value: 'clubs', label: 'District Clubs selector' },
];

const PRESET_CHOICE_PACKS: { name: string; choices: string[] }[] = [
  {
    name: 'Rotary Focus Areas',
    choices: [
      'Peacebuilding and Conflict Prevention',
      'Disease Prevention and Treatment',
      'Water, Sanitation, and Hygiene',
      'Maternal and Child Health',
      'Basic Education and Literacy',
      'Community Economic Development',
      'Supporting the Environment',
    ],
  },
  {
    name: 'NCR Zones',
    choices: [
      'Zone Prithvi (South & East NCR)',
      'Zone Agni (Central & Faridabad)',
      'Zone Vayu (North & Gurugram)',
      'Zone Akash (West & University)',
    ],
  },
  {
    name: 'Status',
    choices: ['Planned', 'In Progress', 'Completed', 'Postponed'],
  },
  {
    name: 'Priority',
    choices: ['Low', 'Medium', 'High', 'Critical'],
  },
];

export const STANDARD_POINT_SOURCES: {
  key: string;
  label: string;
  category: string;
  pointsDesc: string;
}[] = [
  { key: 'physical_meetings', label: 'Physical Club Meetings', category: 'Club Services', pointsDesc: '20 pts / meeting (max 4)' },
  { key: 'virtual_meetings', label: 'Virtual Club Meetings', category: 'Club Services', pointsDesc: '10 pts / meeting (max 4)' },
  { key: 'new_members', label: 'New Members Inducted', category: 'Membership', pointsDesc: '10 pts per member' },
  { key: 'social_posts', label: 'Social Media Posts / Links', category: 'Public Image', pointsDesc: '4–7 posts: 10 pts, 8+: 20 pts' },
  { key: 'projects_initiated', label: 'Community Projects Initiated', category: 'Community Services', pointsDesc: '20 pts flat / month' },
  { key: 'camps_organised', label: 'Health / Blood / Polio Camps', category: 'Community Services', pointsDesc: '30 pts per camp' },
  { key: 'vocational_workshops', label: 'Vocational Workshops', category: 'Vocational Services', pointsDesc: '1–4: 30 pts, 5+: 60 pts' },
  { key: 'international_activities', label: 'International Activities', category: 'International Services', pointsDesc: '30 pts per activity' },
  { key: 'flagship_continued', label: 'Flagship Projects Continued', category: 'Flagship Projects', pointsDesc: '50 pts flat / month' },
  { key: 'max_collaborators', label: 'Inter-Club Collaboration', category: 'Club & District', pointsDesc: '2–5: 20 pts, 6–10: 40 pts, 11+: 60 pts' },
];

export interface ReportFieldEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (field: ReportFieldInput) => void;
  initial: ReportFieldInput | null;
  nextOrder: number;
  existingSections?: string[];
}

const BLANK: ReportFieldInput = {
  section: 'Monthly activity log',
  fieldKey: '',
  label: '',
  type: 'text',
  required: false,
  perActivity: true,
  order: 0,
  helpText: null,
  pointSourceKey: null,
};

function slugifyKey(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

export function ReportFieldEditorModal({
  open,
  onClose,
  onSave,
  initial,
  nextOrder,
  existingSections = [],
}: ReportFieldEditorModalProps) {
  const [draft, setDraft] = useState<ReportFieldInput>(initial ?? { ...BLANK, order: nextOrder });
  const [error, setError] = useState<string | null>(null);
  const [newChoiceInput, setNewChoiceInput] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [keyTouched, setKeyTouched] = useState(Boolean(initial));

  if (!open) return null;

  const set = <K extends keyof ReportFieldInput>(key: K, value: ReportFieldInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const choices = selectChoices(draft.options);
  const multiple = linkAllowsMultiple(draft.options);
  const needsChoices = draft.type === 'select' || draft.type === 'multiselect';

  const handleLabelChange = (val: string) => {
    set('label', val);
    if (!initial && !keyTouched) {
      const generated = slugifyKey(val);
      if (generated) set('fieldKey', generated);
    }
  };

  const updateChoices = (next: string[]) => {
    set('options', { ...(typeof draft.options === 'object' && draft.options !== null ? draft.options : {}), choices: next });
  };

  const addChoice = (choice: string) => {
    const trimmed = choice.trim();
    if (!trimmed || choices.includes(trimmed)) return;
    updateChoices([...choices, trimmed]);
    setNewChoiceInput('');
  };

  const removeChoice = (idx: number) => {
    updateChoices(choices.filter((_, i) => i !== idx));
  };

  const moveChoice = (idx: number, delta: number) => {
    const target = idx + delta;
    if (target < 0 || target >= choices.length) return;
    const next = [...choices];
    [next[idx], next[target]] = [next[target], next[idx]];
    updateChoices(next);
  };

  const applyBulkChoices = () => {
    const parsed = bulkText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const unique = Array.from(new Set([...choices, ...parsed]));
    updateChoices(unique);
    setBulkText('');
    setBulkMode(false);
  };

  const save = () => {
    if (!/^[a-z][a-z0-9_]*$/.test(draft.fieldKey)) {
      setError('Field key must be lowercase snake_case, e.g. activity_title');
      return;
    }
    if (!draft.label.trim()) {
      setError('Give the field a label');
      return;
    }
    if (needsChoices && choices.length === 0) {
      setError('Dropdown fields require at least one choice option');
      return;
    }
    onSave(draft);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit report form field' : 'Add field to report form'}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save field</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 text-left">
        {error && (
          <div className="rounded-[10px] bg-danger/10 p-3 text-[12px] font-semibold text-danger">
            {error}
          </div>
        )}

        {/* Basic Definition */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Label" required>
            <Input
              value={draft.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="e.g. Number of Beneficiaries"
            />
          </Field>
          <Field label="Field key" hint="Lowercase snake_case (saved in database records)" required>
            <Input
              value={draft.fieldKey}
              onChange={(e) => {
                setKeyTouched(true);
                set('fieldKey', e.target.value.trim());
              }}
              placeholder="e.g. beneficiaries_count"
              disabled={Boolean(initial)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Section Group" hint="Group related fields under one heading">
            <Input
              list="existing-form-sections"
              value={draft.section}
              onChange={(e) => set('section', e.target.value)}
              placeholder="e.g. Monthly activity log"
            />
            {existingSections.length > 0 && (
              <datalist id="existing-form-sections">
                {existingSections.map((sec) => (
                  <option key={sec} value={sec} />
                ))}
              </datalist>
            )}
          </Field>
          <Field label="Field Type" required>
            <Select
              value={draft.type}
              onChange={(e) => set('type', e.target.value as ReportFieldType)}
              options={FIELD_TYPES}
            />
          </Field>
        </div>

        {/* Dropdown Options Manager for Select / MultiSelect */}
        {needsChoices && (
          <div className="rounded-[12px] border border-line-accent bg-[var(--bg-subtle)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-bold text-fg">
                Dropdown Choices ({choices.length})
              </span>
              <button
                type="button"
                onClick={() => setBulkMode(!bulkMode)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline"
              >
                <ListPlus className="size-3.5" />
                {bulkMode ? 'Normal mode' : 'Bulk import'}
              </button>
            </div>

            {bulkMode ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Type or paste choices separated by commas or lines, e.g.:&#10;Option A&#10;Option B&#10;Option C"
                />
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setBulkMode(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={applyBulkChoices}>
                    Apply Choices
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Input
                    value={newChoiceInput}
                    onChange={(e) => setNewChoiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChoice(newChoiceInput);
                      }
                    }}
                    placeholder="Type an option and press Enter..."
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addChoice(newChoiceInput)}
                    disabled={!newChoiceInput.trim()}
                  >
                    <Plus className="size-4" /> Add
                  </Button>
                </div>

                {/* Preset packs */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">Presets:</span>
                  {PRESET_CHOICE_PACKS.map((pack) => (
                    <button
                      key={pack.name}
                      type="button"
                      onClick={() => updateChoices(Array.from(new Set([...choices, ...pack.choices])))}
                      className="inline-flex items-center gap-1 rounded-full border border-line bg-page px-2 py-0.5 text-[10.5px] font-semibold text-fg-2 transition-colors hover:border-accent hover:text-accent"
                    >
                      <Sparkles className="size-2.5 text-accent" />
                      {pack.name}
                    </button>
                  ))}
                </div>

                {/* Choices list */}
                <div className="max-h-52 overflow-y-auto rounded-[8px] border border-line bg-page">
                  {choices.length === 0 ? (
                    <div className="p-3 text-center text-[11.5px] text-fg-muted">
                      No choices added yet. Type an option above or choose a preset.
                    </div>
                  ) : (
                    choices.map((choice, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between border-t border-line px-3 py-2 first:border-t-0 hover:bg-hover"
                      >
                        <span className="text-[12px] font-medium text-fg">{choice}</span>
                        <div className="flex items-center gap-1">
                          <IconButton
                            label="Move choice up"
                            disabled={idx === 0}
                            onClick={() => moveChoice(idx, -1)}
                            className="min-h-8 min-w-8 p-1 [&>svg]:size-3.5"
                          >
                            <ArrowUp />
                          </IconButton>
                          <IconButton
                            label="Move choice down"
                            disabled={idx === choices.length - 1}
                            onClick={() => moveChoice(idx, 1)}
                            className="min-h-8 min-w-8 p-1 [&>svg]:size-3.5"
                          >
                            <ArrowDown />
                          </IconButton>
                          <IconButton
                            label="Remove choice"
                            onClick={() => removeChoice(idx)}
                            className="min-h-8 min-w-8 p-1 text-danger [&>svg]:size-3.5"
                          >
                            <Trash2 />
                          </IconButton>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Link field options */}
        {draft.type === 'link' && (
          <div className="rounded-[10px] border border-line p-3 bg-page">
            <Checkbox
              label="Allow multiple uploads / links for this field"
              checked={multiple}
              onChange={(e) => set('options', { multiple: e.target.checked })}
            />
          </div>
        )}

        {/* Validation & Scope Toggles */}
        <div className="grid grid-cols-1 gap-3 rounded-[12px] border border-line bg-page p-4 sm:grid-cols-2">
          <div>
            <Checkbox
              label="Mandatory (Required to submit)"
              checked={draft.required ?? false}
              onChange={(e) => set('required', e.target.checked)}
            />
            <p className="m-0 mt-1 pl-6 text-[11px] text-fg-muted">
              Club presidents cannot submit their monthly report if left empty.
            </p>
          </div>
          <div>
            <Checkbox
              label="Per-activity field"
              checked={draft.perActivity ?? false}
              onChange={(e) => set('perActivity', e.target.checked)}
            />
            <p className="m-0 mt-1 pl-6 text-[11px] text-fg-muted">
              Repeats for every activity logged, rather than once for the entire month.
            </p>
          </div>
        </div>

        {/* Help text & Scoring */}
        <Field label="Help text & Instructions" hint="Helpful hint displayed under the input field">
          <Textarea
            rows={2}
            value={draft.helpText ?? ''}
            onChange={(e) => set('helpText', e.target.value || null)}
            placeholder="e.g. Enter the count of non-Rotaract volunteers from community or institutions."
          />
        </Field>

        {/* Points Rule Mapping */}
        <div className="rounded-[12px] border border-line-accent bg-[var(--bg-subtle)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-bold text-fg">
              District Points Engine Mapping
            </span>
            {draft.pointSourceKey && (
              <button
                type="button"
                onClick={() => set('pointSourceKey', null)}
                className="text-[11px] font-medium text-danger hover:underline"
              >
                Clear mapping
              </button>
            )}
          </div>
          <p className="m-0 mb-3 text-[11px] text-fg-3 leading-relaxed">
            Link this report field to an automated RID 3011 scoring rule. When submitted, the points engine calculates scores directly from this field.
          </p>

          <Field label="Point Source Key" hint="Select an official rule below or type a custom key">
            <Input
              value={draft.pointSourceKey ?? ''}
              onChange={(e) => set('pointSourceKey', e.target.value.trim() || null)}
              placeholder="Select a rule below or type key, e.g. physical_meetings"
            />
          </Field>

          {draft.pointSourceKey && (
            <div className="mt-2 rounded-[8px] border border-accent/20 bg-accent/5 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-accent">
                  Active Link: {draft.pointSourceKey}
                </span>
                {STANDARD_POINT_SOURCES.find((s) => s.key === draft.pointSourceKey) && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                    {STANDARD_POINT_SOURCES.find((s) => s.key === draft.pointSourceKey)?.category}
                  </span>
                )}
              </div>
              <p className="m-0 mt-1 text-[11px] text-fg-2">
                {STANDARD_POINT_SOURCES.find((s) => s.key === draft.pointSourceKey)?.pointsDesc ??
                  'Custom point source key evaluated by engine'}
              </p>
            </div>
          )}

          <div className="mt-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">Official RID 3011 Point Rules:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {STANDARD_POINT_SOURCES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => set('pointSourceKey', item.key)}
                  className={`flex flex-col text-left rounded-[8px] border p-2 text-[11px] transition-all ${
                    draft.pointSourceKey === item.key
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-line bg-page hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-fg">{item.label}</span>
                    <span className="font-mono text-[9.5px] text-accent font-semibold">{item.key}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-1 text-[10px] text-fg-3">
                    <span>{item.category}</span>
                    <span className="font-medium text-success">{item.pointsDesc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
