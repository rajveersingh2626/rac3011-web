import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { KeyValue } from '@/components/ui/KeyValue';
import { useToast } from '@/components/ui/Toast';
import { fetchClub } from '@/lib/clubs';
import { formatMonthLabel, ryYearOf } from '@/lib/reports/month';
import { fetchReports, addReportQuery, scoreReport } from '@/lib/reports/api';
import {
  fetchClubPoints,
  patchJudgedPoints,
  fetchPointCategories,
  updateClubPointEntry,
  createClubPointEntry,
  deleteClubPointEntry,
} from '@/lib/points/api';
import type { ClubPointsEntry } from '@/lib/points/types';
import { cn } from '@/lib/cn';

const RULE_TYPE_LABEL: Record<string, string> = {
  flat: 'flat',
  per_unit: 'per_unit',
  tiered: 'tiered',
  penalty: 'penalty',
};

function describeTrace(entry: ClubPointsEntry): string {
  const trace = entry.trace as { inputs?: Record<string, number>; tierMatched?: { min: number; max: number | null } } | null;
  if (!trace?.inputs) return '';
  const { inputs } = trace;
  if (trace.tierMatched) {
    const { min, max } = trace.tierMatched;
    const bracket = max === null ? `${min}+` : `${min}–${max}`;
    if (inputs.numerator !== undefined) {
      const ratio = inputs.denominator ? Math.round((inputs.numerator / inputs.denominator) * 100) : 0;
      return `${ratio}% — the ${bracket} bracket`;
    }
    return `${inputs.value ?? ''} — the ${bracket} bracket`;
  }
  if (inputs.count !== undefined) return `${inputs.count} × unit(s)`;
  if (inputs.value !== undefined) return `value ${inputs.value}`;
  return '';
}

function RuleTraceRow({
  entry,
  onEdit,
  onDelete,
  onReset,
}: {
  entry: ClubPointsEntry;
  onEdit: (entry: ClubPointsEntry) => void;
  onDelete: (entry: ClubPointsEntry) => void;
  onReset: (entry: ClubPointsEntry) => void;
}) {
  const [open, setOpen] = useState(false);
  const trace = entry.trace as Record<string, unknown> | null;
  const isCustom = entry.kind === 'judged';
  const isOverridden = Boolean(entry.isOverridden);

  return (
    <div className="border-b border-line-accent py-3 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 text-[13.5px] font-bold text-fg">{entry.ruleLabel}</p>
            {isOverridden && <Badge tone="amber">Manual Override</Badge>}
            {isCustom && <Badge tone="blue">Manual Entry</Badge>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-fg-3">
            {entry.ruleType ? (
              <Badge tone="neutral">{RULE_TYPE_LABEL[entry.ruleType ?? '']} · {entry.rulePeriod}</Badge>
            ) : null}
            {describeTrace(entry) && <span>{describeTrace(entry)}</span>}
            {isOverridden && typeof entry.originalPoints === 'number' && (
              <span className="text-fg-3">(Rule formula was: {entry.originalPoints} pts)</span>
            )}
          </div>
          {entry.reason && (
            <p className="m-0 mt-1 text-[11.5px] italic text-fg-2">
              Note: {entry.reason}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn('text-[15px] font-extrabold', isOverridden ? 'text-accent' : 'text-fg')}>
            {entry.points > 0 ? `+${entry.points}` : entry.points}
          </span>
          <Button variant="ghost" size="sm" onClick={() => onEdit(entry)} className="h-7 px-2 text-[11.5px]">
            Edit
          </Button>
          {isOverridden && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReset(entry)}
              className="h-7 px-2 text-[11.5px] text-fg-3 hover:text-fg"
              title="Reset to rule formula calculation"
            >
              Reset
            </Button>
          )}
          {isCustom && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry)}
              className="h-7 px-2 text-[11.5px] text-red-500 hover:bg-red-500/10"
            >
              Delete
            </Button>
          )}
          {trace && (
            <button type="button" className="text-[11.5px] font-bold text-accent" onClick={() => setOpen((o) => !o)}>
              {open ? 'hide' : 'trace'}
            </button>
          )}
        </div>
      </div>
      {open && trace && (
        <div className="mt-3 rounded-[10px] border border-line-accent bg-input px-4 py-3">
          <KeyValue
            items={Object.entries((trace.inputs as Record<string, unknown>) ?? {}).map(([k, v]) => ({
              label: k,
              value: String(v),
            }))}
          />
          {Boolean(trace.tierMatched) && (
            <p className="m-0 mt-2 text-[11.5px] text-fg-3">
              Bracket: {JSON.stringify(trace.tierMatched)} → {entry.points} pts
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function ScoreMonthPage() {
  const { clubId = '', month = '' } = useParams<{ clubId: string; month: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const ryYear = useMemo(() => ryYearOf(new Date(`${month}-01T00:00:00Z`)), [month]);
  const monthLabel = formatMonthLabel(month);

  useDocumentMeta({ title: `Score ${monthLabel}` });

  const [judgedPoints, setJudgedPoints] = useState('');
  const [reason, setReason] = useState('');
  const [queryOpen, setQueryOpen] = useState(false);
  const [question, setQuestion] = useState('');

  // Editing single entry state
  const [editingEntry, setEditingEntry] = useState<ClubPointsEntry | null>(null);
  const [editPoints, setEditPoints] = useState('');
  const [editReason, setEditReason] = useState('');

  // Adding custom entry state
  const [addCustomOpen, setAddCustomOpen] = useState(false);
  const [customCategoryId, setCustomCategoryId] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  const [customReason, setCustomReason] = useState('');

  const clubQuery = useQuery({ queryKey: ['club', clubId], queryFn: () => fetchClub(clubId), enabled: Boolean(clubId) });
  const pointsQuery = useQuery({
    queryKey: ['club-points', clubId, ryYear, month],
    queryFn: () => fetchClubPoints(clubId, { ryYear, month }),
    enabled: Boolean(clubId && month),
  });
  const reportQuery = useQuery({
    queryKey: ['reports', 'score-month', clubId, month],
    queryFn: () => fetchReports({ clubId, month, pageSize: 1 }),
    enabled: Boolean(clubId && month),
  });
  const categoriesQuery = useQuery({
    queryKey: ['point-categories'],
    queryFn: fetchPointCategories,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      patchJudgedPoints(clubId, month, {
        judgedPoints: judgedPoints.trim() === '' ? null : Number(judgedPoints),
        reason: reason.trim() || null,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['club-points', clubId, ryYear, month] });
      toast({
        title: 'Points Saved',
        body: 'Judged points adjustment has been saved.',
        tone: 'success',
      });
      navigate('/portal/admin/clubs');
    },
    onError: (err) => {
      toast({
        title: 'Failed to save points',
        body: err instanceof Error ? err.message : 'Please try again.',
        tone: 'error',
      });
    },
  });

  const finalizeScoreMutation = useMutation({
    mutationFn: async () => {
      if (judgedPoints.trim() !== '' || reason.trim() !== '') {
        await patchJudgedPoints(clubId, month, {
          judgedPoints: judgedPoints.trim() === '' ? null : Number(judgedPoints),
          reason: reason.trim() || null,
        });
      }
      if (report) {
        await scoreReport(report.id);
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['club-points'] });
      void qc.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Score Finalized',
        body: `Report and points for ${monthLabel} have been confirmed and scored.`,
        tone: 'success',
      });
      navigate('/portal/admin/clubs');
    },
    onError: (err) => {
      toast({
        title: 'Failed to finalize score',
        body: err instanceof Error ? err.message : 'Please try again.',
        tone: 'error',
      });
    },
  });

  const queryMutation = useMutation({
    mutationFn: (vars: { id: string; question: string }) => addReportQuery(vars.id, vars.question),
    onSuccess: () => {
      setQueryOpen(false);
      setQuestion('');
      void qc.invalidateQueries({ queryKey: ['reports', 'score-month', clubId, month] });
      toast({
        title: 'Query Sent',
        body: 'Your question has been sent to the club.',
        tone: 'success',
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: (vars: { entryId: string; points: number; reason?: string | null }) =>
      updateClubPointEntry(clubId, vars.entryId, { points: vars.points, reason: vars.reason }),
    onSuccess: () => {
      setEditingEntry(null);
      void qc.invalidateQueries({ queryKey: ['club-points', clubId, ryYear, month] });
      toast({
        title: 'Entry Updated',
        body: 'Point value and reason have been updated.',
        tone: 'success',
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update entry',
        body: err instanceof Error ? err.message : 'Please try again.',
        tone: 'error',
      });
    },
  });

  const createCustomMutation = useMutation({
    mutationFn: (vars: { month: string; categoryId: string; label: string; points: number; reason?: string | null }) =>
      createClubPointEntry(clubId, vars),
    onSuccess: () => {
      setAddCustomOpen(false);
      setCustomLabel('');
      setCustomPoints('');
      setCustomReason('');
      void qc.invalidateQueries({ queryKey: ['club-points', clubId, ryYear, month] });
      toast({
        title: 'Custom Entry Added',
        body: 'New point item added to the monthly evaluation.',
        tone: 'success',
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to add entry',
        body: err instanceof Error ? err.message : 'Please try again.',
        tone: 'error',
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => deleteClubPointEntry(clubId, entryId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['club-points', clubId, ryYear, month] });
      toast({
        title: 'Entry Removed / Reset',
        body: 'The point item was removed or reset to the rule formula.',
        tone: 'success',
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to delete/reset entry',
        body: err instanceof Error ? err.message : 'Please try again.',
        tone: 'error',
      });
    },
  });

  const handleStartEdit = (entry: ClubPointsEntry) => {
    setEditingEntry(entry);
    setEditPoints(String(entry.points));
    setEditReason(entry.reason ?? '');
  };

  const handleResetEntry = (entry: ClubPointsEntry) => {
    deleteEntryMutation.mutate(entry.id);
  };

  const handleDeleteEntry = (entry: ClubPointsEntry) => {
    deleteEntryMutation.mutate(entry.id);
  };

  if (pointsQuery.isPending || clubQuery.isPending) {
    return (
      <Container width="wide">
        <Skeleton shape="rect" className="h-96" />
      </Container>
    );
  }
  if (pointsQuery.isError || clubQuery.isError) {
    return (
      <Container width="wide">
        <ErrorState title="Couldn't load this club's score" onRetry={() => void pointsQuery.refetch()} />
      </Container>
    );
  }

  const summary = pointsQuery.data;
  const club = clubQuery.data;
  const report = reportQuery.data?.items[0];
  const computedByCategory = new Map<string, { name: string; points: number; entries: ClubPointsEntry[] }>();
  for (const entry of summary.entries) {
    const bucket = computedByCategory.get(entry.categoryId) ?? { name: entry.categoryName, points: 0, entries: [] };
    bucket.points += entry.points;
    bucket.entries.push(entry);
    computedByCategory.set(entry.categoryId, bucket);
  }
  const computedTotal = [...computedByCategory.values()].reduce((sum, c) => sum + c.points, 0);
  const judgedTotal = summary.judged?.points ?? 0;

  const categoryOptions: SelectOption[] = (categoriesQuery.data ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <Container width="wide">
      <Section
        eyebrow={club?.shortName ?? club?.name}
        title={`${club?.name ?? clubId} · ${monthLabel}`}
        description={`${computedTotal} points evaluated from rules & adjustments. Edit any item or add custom points below.`}
        action={
          <div className="flex items-center gap-2">
            {report && (
              <Badge tone={report.status === 'scored' ? 'green' : report.status === 'submitted' ? 'blue' : 'amber'}>
                {report.status.toUpperCase()}
              </Badge>
            )}
            {summary.judged ? (
              <Badge tone="green">Human Review Complete</Badge>
            ) : (
              <Badge tone="amber">Pending Human Review</Badge>
            )}
          </div>
        }
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[1px] text-accent">Evaluated Points Breakdown</p>
          <Button variant="secondary" size="sm" onClick={() => setAddCustomOpen(true)}>
            + Add Custom Point Entry
          </Button>
        </div>

        <Card className="mb-6">
          {computedByCategory.size === 0 ? (
            <EmptyState
              title="Nothing computed yet for this month"
              body="No submitted report or club fact contributed points for this period. You can add manual entries using the button above."
            />
          ) : (
            <>
              {[...computedByCategory.values()].map((category) => (
                <div key={category.name} className="border-b border-line-accent pb-2 pt-2 first:pt-0 last:border-0">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="m-0 text-[11px] font-bold uppercase tracking-[0.5px] text-fg-3">{category.name}</p>
                    <span className="text-[11px] font-bold text-fg-3">{category.points} pts</span>
                  </div>
                  {category.entries.map((entry) => (
                    <RuleTraceRow
                      key={entry.id}
                      entry={entry}
                      onEdit={handleStartEdit}
                      onDelete={handleDeleteEntry}
                      onReset={handleResetEntry}
                    />
                  ))}
                </div>
              ))}
              <div className="flex items-center justify-between pt-3">
                <span className="text-[12.5px] font-bold text-fg-3">Computed subtotal</span>
                <span className="text-[18px] font-extrabold text-fg">{computedTotal}</span>
              </div>
            </>
          )}
        </Card>

        <p className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-accent">Discretionary — General Judged Adjustment</p>
        <Card className="mb-6">
          <p className="mb-4 text-[13px] text-fg-2">
            For anything the points matrix has no category for — the quality of a collaboration, unusual effort, or overall evaluation bonus/penalty.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
            <Field label="Points">
              <Input
                type="number"
                value={judgedPoints}
                onChange={(e) => setJudgedPoints(e.target.value)}
                placeholder={summary.judged ? String(summary.judged.points) : '0'}
              />
            </Field>
            <Field label="Why" hint="Goes in the audit log with your name">
              <Textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={summary.judged?.reason ?? 'Ran the camp jointly with two Rotary clubs...'}
              />
            </Field>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-line-accent bg-surface p-5">
          <div>
            <p className="m-0 text-[18px] font-extrabold text-fg">{computedTotal + judgedTotal} points for {monthLabel}</p>
            <p className="m-0 text-[12px] text-fg-3">
              {computedTotal} evaluated + {judgedTotal} discretionary judged
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {report && (
              <Button variant="secondary" onClick={() => setQueryOpen(true)}>
                Query the club
              </Button>
            )}
            <Button
              variant="secondary"
              aria-label="Save and open the next"
              loading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              Save Judged Only
            </Button>
            {report && (
              <Button
                variant="primary"
                loading={finalizeScoreMutation.isPending}
                onClick={() => finalizeScoreMutation.mutate()}
              >
                {report.status === 'scored' ? 'Re-Score & Finalize' : 'Confirm & Finalize Score'}
              </Button>
            )}
          </div>
        </div>
      </Section>

      {/* Edit Entry Modal */}
      <Modal
        open={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        title={`Edit Points: ${editingEntry?.ruleLabel ?? 'Point Entry'}`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={updateEntryMutation.isPending}
              disabled={editPoints.trim() === ''}
              onClick={() => {
                if (!editingEntry) return;
                updateEntryMutation.mutate({
                  entryId: editingEntry.id,
                  points: Number(editPoints),
                  reason: editReason.trim() || null,
                });
              }}
            >
              Save Points
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="m-0 text-[12.5px] text-fg-2">
            Override or adjust the evaluated points for this specific item. An audit entry will be recorded with your user ID.
          </p>
          <Field label="Points" required>
            <Input
              type="number"
              value={editPoints}
              onChange={(e) => setEditPoints(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Evaluator Note / Reason" hint="Explain why points are being adjusted">
            <Textarea
              rows={2}
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="e.g. Verified only 1 project met minimum attendee criteria"
            />
          </Field>
        </div>
      </Modal>

      {/* Add Custom Point Modal */}
      <Modal
        open={addCustomOpen}
        onClose={() => setAddCustomOpen(false)}
        title="Add Custom Point Entry"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddCustomOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={createCustomMutation.isPending}
              disabled={!customCategoryId || !customLabel.trim() || customPoints.trim() === ''}
              onClick={() => {
                createCustomMutation.mutate({
                  month,
                  categoryId: customCategoryId,
                  label: customLabel.trim(),
                  points: Number(customPoints),
                  reason: customReason.trim() || null,
                });
              }}
            >
              Add Point Entry
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="m-0 text-[12.5px] text-fg-2">
            Add a manual award or penalty to this club for {monthLabel}. This entry will appear under the selected category in the monthly breakdown.
          </p>
          <Field label="Category" required>
            <Select
              value={customCategoryId}
              onChange={(e) => setCustomCategoryId(e.target.value)}
              options={categoryOptions}
              placeholder="Select a category..."
            />
          </Field>
          <Field label="Title / Description" hint="e.g. Exemplary District Project Host, Zonal Meet Bonus" required>
            <Input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Short description"
            />
          </Field>
          <Field label="Points" hint="Can be positive (award) or negative (penalty)" required>
            <Input
              type="number"
              value={customPoints}
              onChange={(e) => setCustomPoints(e.target.value)}
              placeholder="e.g. 25 or -10"
            />
          </Field>
          <Field label="Evaluator Note / Documentation" hint="Supporting details for audit log">
            <Textarea
              rows={2}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Provide documentation or context..."
            />
          </Field>
        </div>
      </Modal>

      {/* Query Modal */}
      <Modal
        open={queryOpen}
        onClose={() => setQueryOpen(false)}
        title="Ask a question about this report"
        footer={
          <Button
            disabled={!question.trim()}
            loading={queryMutation.isPending}
            onClick={() => report && queryMutation.mutate({ id: report.id, question })}
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
