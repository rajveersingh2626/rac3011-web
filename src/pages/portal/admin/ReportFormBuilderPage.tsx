import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  fetchReportSchemas,
  fetchReportSchemaVersion,
  createReportSchemaDraft,
  saveReportSchemaFields,
  publishReportSchema,
  unpublishReportSchema,
  deleteReportSchemaDraft,
  type ReportFieldInput,
} from '@/lib/reports/api';
import { ApiError } from '@/lib/api';
import type { ReportField } from '@/lib/reports/types';
import { ReportFieldEditorModal, STANDARD_POINT_SOURCES } from './ReportFieldEditorModal';
import { ReportFieldControl } from '@/pages/portal/reports/ReportFieldControl';

function toInput(field: ReportFieldInput | (ReportFieldInput & { id: string })): ReportFieldInput {
  const { section, fieldKey, label, type, options, required, order, helpText, perActivity, pointSourceKey } = field;
  return { section, fieldKey, label, type, options, required, order, helpText, perActivity, pointSourceKey };
}

function toRenderField(field: ReportFieldInput): ReportField {
  return {
    id: field.fieldKey,
    section: field.section,
    fieldKey: field.fieldKey,
    label: field.label,
    type: field.type,
    options: field.options ?? null,
    required: field.required ?? false,
    order: field.order,
    helpText: field.helpText ?? null,
    perActivity: field.perActivity ?? false,
    pointSourceKey: field.pointSourceKey ?? null,
  };
}

export function ReportFormBuilderPage() {
  useDocumentMeta({ title: 'Report form builder' });
  const qc = useQueryClient();

  const summaries = useQuery({ queryKey: ['report-schemas'], queryFn: fetchReportSchemas });
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const draftSummary = summaries.data?.find((s) => s.status === 'draft');
  const activeSummary = summaries.data?.find((s) => s.status === 'active');
  const workingVersion = selectedVersion ?? (draftSummary?.version ?? activeSummary?.version ?? summaries.data?.[0]?.version);

  const working = useQuery({
    queryKey: ['report-schema', workingVersion],
    queryFn: () => fetchReportSchemaVersion(workingVersion!, true),
    enabled: workingVersion !== undefined,
  });

  const [fields, setFields] = useState<ReportFieldInput[]>([]);
  const [editing, setEditing] = useState<{ index: number; field: ReportFieldInput } | null>(null);
  const [adding, setAdding] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseVersionChoice, setBaseVersionChoice] = useState<number | undefined>(undefined);

  const isDraft = working.data?.status === 'draft';
  const isActive = working.data?.status === 'active';
  const isRetired = working.data?.status === 'retired';

  useEffect(() => {
    if (working.data) setFields(working.data.fields.map(toInput));
  }, [working.data]);

  const startDraftMutation = useMutation({
    mutationFn: (baseVer?: number) => createReportSchemaDraft(baseVer),
    onSuccess: (newSchema) => {
      setSelectedVersion(newSchema.version);
      void qc.invalidateQueries({ queryKey: ['report-schemas'] });
      void qc.invalidateQueries({ queryKey: ['report-schema'] });
    },
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not create new draft'),
  });

  const saveMutation = useMutation({
    mutationFn: (next: ReportFieldInput[]) => saveReportSchemaFields(workingVersion!, next),
    onSuccess: (data) => {
      setError(null);
      qc.setQueryData(['report-schema', workingVersion], data);
    },
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not save the fields'),
  });

  const publishMutation = useMutation({
    mutationFn: (versionToPublish?: number) => publishReportSchema(versionToPublish ?? workingVersion!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['report-schemas'] });
      void qc.invalidateQueries({ queryKey: ['report-schema'] });
    },
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not publish'),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishReportSchema(workingVersion!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['report-schemas'] });
      void qc.invalidateQueries({ queryKey: ['report-schema'] });
    },
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not unpublish'),
  });

  const deleteDraftMutation = useMutation({
    mutationFn: () => deleteReportSchemaDraft(workingVersion!),
    onSuccess: () => {
      setSelectedVersion(null);
      void qc.invalidateQueries({ queryKey: ['report-schemas'] });
      void qc.invalidateQueries({ queryKey: ['report-schema'] });
    },
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not delete draft'),
  });

  const persist = (next: ReportFieldInput[]) => {
    setFields(next);
    if (isDraft) saveMutation.mutate(next);
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    persist(next.map((f, i) => ({ ...f, order: i })));
  };

  const remove = (index: number) => persist(fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })));

  const upsertField = (field: ReportFieldInput) => {
    if (editing) {
      const next = [...fields];
      next[editing.index] = field;
      persist(next);
      setEditing(null);
    } else {
      persist([...fields, { ...field, order: fields.length }]);
      setAdding(false);
    }
  };

  if (summaries.isPending || working.isPending) {
    return (
      <Container>
        <Section title="Report form builder">
          <Skeleton shape="rect" className="h-96" />
        </Section>
      </Container>
    );
  }

  if (summaries.isError || !working.data) {
    return (
      <Container>
        <ErrorState title="Couldn't load the report form" onRetry={() => void summaries.refetch()} />
      </Container>
    );
  }

  const schema = working.data;
  const versionList = summaries.data ?? [];
  const latestSummaryVer = versionList.length > 0
    ? Math.max(...versionList.map((s) => s.version))
    : 1;

  return (
    <Container>
      <Section
        eyebrow="Versioned form schema with instant branching and draft controls"
        title={`Report Form Schema (v${schema.version})`}
        description={
          isDraft
            ? `Editing draft version ${schema.version}. Modify fields below or publish to make it active district-wide.`
            : isActive
            ? `Version ${schema.version} is currently LIVE district-wide. Unpublish to edit, or branch into a new draft.`
            : `Version ${schema.version} is RETIRED. You can preview, branch into a new draft, or re-activate it.`
        }
      >
        {error && (
          <div className="mb-5">
            <Alert tone="error" title="Notice">
              {error}
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="m-0 text-[10.5px] font-bold uppercase tracking-[0.1em] text-accent">
                  Fields ({fields.length})
                </p>
                <Badge tone={isDraft ? 'amber' : isActive ? 'green' : 'neutral'}>
                  {schema.status.toUpperCase()}
                </Badge>
              </div>
              {!isDraft && (
                <span className="text-[11.5px] text-fg-3 italic">
                  Read-only view of published/archived schema
                </span>
              )}
            </div>

            <div className="overflow-hidden rounded-[12px] border border-line-accent">
              {fields.map((field, index) => (
                <div key={field.fieldKey} className="flex items-center gap-3.5 border-t border-line p-3.5 first:border-t-0 hover:bg-hover/50 transition-colors">
                  {isDraft && (
                    <div className="flex flex-col gap-0.5">
                      <IconButton label={`Move ${field.label} up`} onClick={() => move(index, -1)} disabled={index === 0}>
                        <ArrowUp aria-hidden className="size-3.5" />
                      </IconButton>
                      <IconButton label={`Move ${field.label} down`} onClick={() => move(index, 1)} disabled={index === fields.length - 1}>
                        <ArrowDown aria-hidden className="size-3.5" />
                      </IconButton>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="m-0 text-[12.5px] font-bold text-fg">{field.label}</p>
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                        {field.section}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10.5px] text-fg-3">
                      <code className="rounded bg-[var(--bg-subtle)] px-1 py-0.5 text-accent-deep font-mono font-semibold">{field.type}</code>
                      <span>·</span>
                      <span>{field.perActivity ? 'Per activity' : 'Once a month'}</span>
                      {field.pointSourceKey && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-success font-semibold text-[10px]">
                            🏆 {STANDARD_POINT_SOURCES.find((s) => s.key === field.pointSourceKey)?.label ?? field.pointSourceKey}
                          </span>
                        </>
                      )}
                      {(field.type === 'select' || field.type === 'multiselect') && (
                        <>
                          <span>·</span>
                          <span className="font-semibold text-accent">
                            {Array.isArray((field.options as { choices?: string[] })?.choices)
                              ? `${(field.options as { choices: string[] }).choices.length} choices`
                              : '0 choices'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge tone={field.required ? 'pink' : 'neutral'}>{field.required ? 'REQUIRED' : 'OPTIONAL'}</Badge>
                  {isDraft && (
                    <>
                      <IconButton label={`Edit ${field.label}`} onClick={() => setEditing({ index, field })}>
                        <Pencil aria-hidden />
                      </IconButton>
                      <IconButton label={`Remove ${field.label}`} onClick={() => remove(index)}>
                        <Trash2 aria-hidden />
                      </IconButton>
                    </>
                  )}
                </div>
              ))}
              {isDraft && (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="min-h-11 w-full border-t border-dashed border-line-accent bg-page px-4 py-3 text-left text-[12px] font-bold text-accent hover:bg-accent/5 transition-colors"
                >
                  + Add a field
                </button>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {isDraft && (
                <>
                  <Button onClick={() => publishMutation.mutate()} loading={publishMutation.isPending}>
                    Publish as version {schema.version}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete draft version ${schema.version}?`)) {
                        deleteDraftMutation.mutate();
                      }
                    }}
                    loading={deleteDraftMutation.isPending}
                  >
                    Delete Draft v{schema.version}
                  </Button>
                </>
              )}

              {isActive && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (window.confirm(`Unpublish version ${schema.version}? It will revert to draft status for editing.`)) {
                        unpublishMutation.mutate();
                      }
                    }}
                    loading={unpublishMutation.isPending}
                  >
                    Unpublish (Revert to Draft)
                  </Button>
                </>
              )}

              {isRetired && (
                <>
                  <Button
                    onClick={() => publishMutation.mutate(schema.version)}
                    loading={publishMutation.isPending}
                  >
                    Reactivate v{schema.version}
                  </Button>
                </>
              )}

              <Button variant="secondary" onClick={() => setPreview(true)}>
                Preview as a president
              </Button>
            </div>
          </div>

          {/* Sidebar: Version History & Branching */}
          <div className="flex flex-col gap-4">
            <div className="rounded-[16px] border border-line-accent p-5 bg-[var(--bg-subtle)]">
              <div className="flex items-center justify-between mb-3">
                <p className="m-0 text-[10.5px] font-bold uppercase tracking-[0.1em] text-accent">
                  Available Versions
                </p>
                <span className="text-[11px] text-fg-3">Click to open</span>
              </div>
              <div className="flex flex-col gap-2">
                {versionList.map((s) => {
                  const isSelected = workingVersion === s.version;
                  return (
                    <button
                      key={s.version}
                      type="button"
                      onClick={() => setSelectedVersion(s.version)}
                      className={`flex w-full items-center justify-between rounded-[10px] p-2.5 text-left transition-all border ${
                        isSelected
                          ? 'border-accent bg-accent/10 shadow-sm'
                          : 'border-line bg-page hover:border-accent/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[12.5px] font-bold ${isSelected ? 'text-accent' : 'text-fg'}`}>
                          v{s.version}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-extrabold text-accent uppercase">
                            (Viewing)
                          </span>
                        )}
                      </div>
                      <Badge tone={s.status === 'active' ? 'green' : s.status === 'draft' ? 'amber' : 'neutral'}>
                        {s.status.toUpperCase()}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Create New Draft Box with explicit base template selection */}
            <div className="rounded-[16px] border border-line-accent p-5 bg-page flex flex-col gap-3">
              <p className="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-fg">
                Draft New Version
              </p>
              <p className="m-0 text-[11.5px] text-fg-3 leading-relaxed">
                Start a new version with fields cloned from any previous template version.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-fg-2">
                  Base Template:
                </label>
                <select
                  value={baseVersionChoice ?? schema.version}
                  onChange={(e) => setBaseVersionChoice(Number(e.target.value))}
                  className="rounded-[8px] border border-line bg-surface p-2 text-[12px] font-semibold text-fg outline-none focus:border-accent"
                >
                  {versionList.map((s) => (
                    <option key={s.version} value={s.version}>
                      v{s.version} ({s.status}) {s.version === latestSummaryVer ? '• Latest' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                size="sm"
                onClick={() => startDraftMutation.mutate(baseVersionChoice ?? schema.version)}
                loading={startDraftMutation.isPending}
                className="w-full mt-1"
              >
                + Draft v{latestSummaryVer + 1} from v{baseVersionChoice ?? schema.version}
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {(adding || editing) && (
        <ReportFieldEditorModal
          open
          initial={editing?.field ?? null}
          nextOrder={fields.length}
          existingSections={Array.from(new Set(fields.map((f) => f.section))).filter(Boolean)}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={upsertField}
        />
      )}

      <Modal open={preview} onClose={() => setPreview(false)} title="Interactive Preview (President Experience)" size="lg">
        <div className="flex flex-col gap-5">
          <div className="rounded-[10px] bg-accent/10 p-3 text-[12px] text-accent-deep">
            <strong>Interactive Mode:</strong> Test filling out fields below to test dropdown options, date selectors, and links.
          </div>
          {fields.map((field) => (
            <ReportFieldControl
              key={field.fieldKey}
              field={toRenderField(field)}
              value={undefined}
              onChange={() => undefined}
              clubOptions={[
                { value: 'c1', label: 'Rotaract Club of Delhi Central' },
                { value: 'c2', label: 'Rotaract Club of New Delhi' },
                { value: 'c3', label: 'Rotaract Club of Delhi South' },
              ]}
              disabled={false}
            />
          ))}
        </div>
      </Modal>
    </Container>
  );
}
