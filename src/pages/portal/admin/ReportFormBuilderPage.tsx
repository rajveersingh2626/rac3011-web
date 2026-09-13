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
  type ReportFieldInput,
} from '@/lib/reports/api';
import { ApiError } from '@/lib/api';
import type { ReportField } from '@/lib/reports/types';
import { ReportFieldEditorModal } from './ReportFieldEditorModal';
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
  const draftSummary = summaries.data?.find((s) => s.status === 'draft');
  const activeSummary = summaries.data?.find((s) => s.status === 'active');
  const workingVersion = draftSummary?.version ?? activeSummary?.version;

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
  const isDraft = working.data?.status === 'draft';

  useEffect(() => {
    if (working.data) setFields(working.data.fields.map(toInput));
  }, [working.data]);

  const startDraftMutation = useMutation({
    mutationFn: createReportSchemaDraft,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['report-schemas'] }),
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
    mutationFn: () => publishReportSchema(workingVersion!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['report-schemas'] });
      void qc.invalidateQueries({ queryKey: ['report-schema'] });
    },
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not publish'),
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

  return (
    <Container>
      <Section
        eyebrow="Versioned, so a change never reshapes a past submission"
        title="The monthly report form"
        description={
          isDraft
            ? `Editing draft version ${working.data.version}. Publish to make it live.`
            : `Version ${working.data.version} is live. Start a new draft to make changes.`
        }
      >
        {error && (
          <div className="mb-5">
            <Alert tone="error" title="Something went wrong">
              {error}
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-3.5 flex items-center gap-3">
              <p className="m-0 text-[10.5px] font-bold uppercase tracking-[0.1em] text-accent">Fields</p>
              <div aria-hidden className="h-px flex-1 bg-line" />
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
                          <span className="text-success font-medium">Points: {field.pointSourceKey}</span>
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

            <div className="mt-5 flex flex-wrap gap-3">
              {isDraft ? (
                <Button onClick={() => publishMutation.mutate()} loading={publishMutation.isPending}>
                  Publish as version {working.data.version}
                </Button>
              ) : (
                <Button onClick={() => startDraftMutation.mutate()} loading={startDraftMutation.isPending}>
                  Start a new draft
                </Button>
              )}
              <Button variant="secondary" onClick={() => setPreview(true)}>
                Preview as a president
              </Button>
            </div>
          </div>

          <div className="rounded-[16px] border border-line-accent p-5 bg-[var(--bg-subtle)]">
            <p className="m-0 mb-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-accent">Versions</p>
            <div className="flex flex-col gap-2.5">
              {summaries.data.map((s) => (
                <div key={s.version} className="flex items-center justify-between border-t border-line pt-2.5 first:border-t-0 first:pt-0">
                  <span className="text-[12px] font-bold text-fg">v{s.version}</span>
                  <Badge tone={s.status === 'active' ? 'green' : s.status === 'draft' ? 'amber' : 'neutral'}>
                    {s.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
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
