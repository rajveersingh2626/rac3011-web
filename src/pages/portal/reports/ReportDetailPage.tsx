import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { createProject } from '@/lib/showcase/api';
import { Sparkles, Plus, Trash2, RotateCcw, Flag, ExternalLink, AlertCircle } from 'lucide-react';
import {
  fetchReport,
  fetchReportSchemaVersion,
  addReportQuery,
  replyReportQuery,
  fetchReportAssist,
  downloadReportPdf,
  downloadReportCsv,
  resetReport,
  deleteReport,
  flagReportItems,
  resolveReportFlag,
  fetchReportAuditLogs,
} from '@/lib/reports/api';
import { fetchClubPoints } from '@/lib/points/api';
import type { ClubPointsEntry } from '@/lib/points/types';
import type { Report, ReportStatus } from '@/lib/reports/types';
import { formatMonthLabel } from '@/lib/reports/month';
import { activitiesOf, formatFieldValue, splitFields } from '@/lib/reports/values';

const STATUS_TONE: Record<ReportStatus, BadgeTone> = {
  draft: 'neutral',
  submitted: 'blue',
  queried: 'amber',
  scored: 'green',
};

import { AVENUES_OF_SERVICE, AREAS_OF_FOCUS } from '@/lib/showcase/types';

function PushToShowcaseModal({
  open,
  onClose,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  initialData: {
    title: string;
    category?: string;
    avenueOfService?: string;
    areasOfFocus?: string[];
    date: string;
    summary: string;
    beneficiaries?: number;
  };
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [title, setTitle] = useState(initialData.title);
  const [avenueOfService, setAvenueOfService] = useState(initialData.avenueOfService || 'Community Services');
  const [areasOfFocus, setAreasOfFocus] = useState<string[]>(
    initialData.areasOfFocus && initialData.areasOfFocus.length > 0
      ? initialData.areasOfFocus
      : (initialData.category ? [initialData.category] : ['Community Economic Development'])
  );
  const [date, setDate] = useState(initialData.date || new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState(initialData.summary);
  const [beneficiaries, setBeneficiaries] = useState<number | undefined>(initialData.beneficiaries);
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const toggleAreaOfFocus = (focus: string) => {
    setAreasOfFocus((prev) =>
      prev.includes(focus) ? prev.filter((f) => f !== focus) : [...prev, focus]
    );
  };

  const submitMutation = useMutation({
    mutationFn: () =>
      createProject({
        title,
        category: areasOfFocus[0] || avenueOfService || '',
        avenueOfService,
        areasOfFocus,
        date: date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        summary,
        beneficiaries: beneficiaries ? Number(beneficiaries) : null,
        photos: photos.filter(Boolean),
        consentConfirmed: true,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects'] });
      void qc.invalidateQueries({ queryKey: ['public', 'projects'] });
      void qc.invalidateQueries({ queryKey: ['public', 'project'] });
      void qc.invalidateQueries({ queryKey: ['public', 'home'] });
      toast({
        title: 'Project Submitted to Showcase!',
        tone: 'success',
      });
      onClose();
    },
    onError: (e: Error) => {
      toast({
        title: e?.message || 'Failed to submit project to showcase',
        tone: 'error',
      });
    },
  });

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      setPhotos([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Push Reported Project to District Showcase"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={submitMutation.isPending}
            disabled={!title.trim() || !summary.trim() || areasOfFocus.length === 0}
            onClick={() => submitMutation.mutate()}
          >
            Submit to Showcase
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-lg bg-accent/10 p-3 text-[12.5px] text-fg border border-accent/20">
          <p className="m-0 font-semibold text-accent">Feature on Rotaract 3011 Public Showcase</p>
          <p className="m-0 mt-1 text-fg-2">
            Review and enrich this project's details below before submitting it for district editorial approval.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-fg">Project Title *</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mega Blood Donation Drive 2026" />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-fg">Avenue of Service *</span>
            <Select
              value={avenueOfService}
              onChange={(e) => setAvenueOfService(e.target.value)}
              options={AVENUES_OF_SERVICE.map((a) => ({ value: a, label: a }))}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-fg">Execution Date *</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-fg">Areas of Focus * (Multi-choice)</span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {AREAS_OF_FOCUS.map((focus) => {
              const isSelected = areasOfFocus.includes(focus);
              return (
                <button
                  key={focus}
                  type="button"
                  onClick={() => toggleAreaOfFocus(focus)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition-all border text-left ${
                    isSelected
                      ? 'bg-accent/10 border-accent text-accent font-bold ring-1 ring-accent/30'
                      : 'bg-page border-line text-fg hover:border-line-accent hover:bg-surface-2'
                  }`}
                >
                  <span
                    className={`flex size-3.5 shrink-0 items-center justify-center rounded border text-[9px] font-black ${
                      isSelected ? 'border-accent bg-accent text-white' : 'border-line-accent bg-page text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span>{focus}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-fg">Beneficiaries Reached</span>
          <Input
            type="number"
            min={0}
            value={beneficiaries ?? ''}
            onChange={(e) => setBeneficiaries(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g. 250"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-fg">Showcase Summary &amp; Impact (Public facing) *</span>
          <Textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Describe the objective, execution, and lasting community impact of this project..."
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold text-fg">High-Resolution Photos</span>
          <div className="flex gap-2">
            <Input
              placeholder="Paste photo URL (https://...)"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddPhoto}>
              <Plus size={14} /> Add
            </Button>
          </div>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {photos.map((p, idx) => (
                <div key={idx} className="relative group rounded-md border border-line overflow-hidden w-20 h-20 bg-surface-2">
                  <img src={p} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded p-1 opacity-80 hover:opacity-100"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ResetReportModal({
  open,
  onClose,
  reportId,
  clubName,
  monthLabel,
}: {
  open: boolean;
  onClose: () => void;
  reportId: string;
  clubName: string;
  monthLabel: string;
}) {
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  const qc = useQueryClient();

  const resetMutation = useMutation({
    mutationFn: () => resetReport(reportId, reason),
    onSuccess: (updated) => {
      qc.setQueryData(['reports', reportId], updated);
      void qc.invalidateQueries({ queryKey: ['reports'] });
      void qc.invalidateQueries({ queryKey: ['club-points'] });
      toast({
        title: 'Report Reset to Draft',
        body: `${clubName}'s ${monthLabel} report is now reopened for editing.`,
        tone: 'success',
      });
      onClose();
    },
    onError: (err) => {
      toast({
        title: 'Could not reset report',
        body: err instanceof Error ? err.message : 'Please try again.',
        tone: 'error',
      });
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset Report to Draft"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            loading={resetMutation.isPending}
            disabled={!reason.trim()}
            onClick={() => resetMutation.mutate()}
          >
            Confirm Reset
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3.5">
        <div className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-800 border border-amber-500/20">
          <p className="m-0 font-bold">Privileged District Action</p>
          <p className="m-0 mt-1">
            Resetting returns this report to draft status so {clubName} can revise and re-submit it. Any automated monthly points will be wiped until re-submission.
          </p>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-fg">Reason for Reset *</span>
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Club requested unlock to re-enter attendance and community project metrics..."
          />
        </label>
      </div>
    </Modal>
  );
}

function DeleteReportModal({
  open,
  onClose,
  reportId,
  clubName,
  monthLabel,
}: {
  open: boolean;
  onClose: () => void;
  reportId: string;
  clubName: string;
  monthLabel: string;
}) {
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteReport(reportId, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reports'] });
      void qc.invalidateQueries({ queryKey: ['club-points'] });
      toast({
        title: 'Report Deleted',
        body: `Report for ${clubName} (${monthLabel}) was permanently deleted.`,
        tone: 'success',
      });
      onClose();
      navigate('/portal/reports');
    },
    onError: (err) => {
      toast({
        title: 'Could not delete report',
        body: err instanceof Error ? err.message : 'Please try again.',
        tone: 'error',
      });
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Monthly Report"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            disabled={!reason.trim()}
            onClick={() => deleteMutation.mutate()}
          >
            Permanently Delete
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3.5">
        <div className="rounded-lg bg-danger-bg p-3 text-xs text-danger-fg border border-danger-line">
          <p className="m-0 font-bold">Irreversible Action</p>
          <p className="m-0 mt-1">
            This permanently removes all reported data for {clubName} ({monthLabel}) and resets point allocations. This action is permanently recorded in the district compliance audit log.
          </p>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-fg">Reason for Deletion *</span>
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Duplicate test report submitted by error..."
          />
        </label>
      </div>
    </Modal>
  );
}

function FlagItemModal({
  open,
  onClose,
  reportId,
  itemTarget,
}: {
  open: boolean;
  onClose: () => void;
  reportId: string;
  itemTarget: {
    targetType: 'field' | 'activity' | 'general';
    fieldKey?: string;
    activityIndex?: number;
    activityFieldKey?: string;
    title: string;
  } | null;
}) {
  const [comment, setComment] = useState('');
  const { toast } = useToast();
  const qc = useQueryClient();

  const flagMutation = useMutation({
    mutationFn: () => {
      if (!itemTarget) return Promise.resolve(null);
      return flagReportItems(reportId, [
        {
          targetType: itemTarget.targetType,
          fieldKey: itemTarget.fieldKey,
          activityIndex: itemTarget.activityIndex,
          activityFieldKey: itemTarget.activityFieldKey,
          comment,
        },
      ]);
    },
    onSuccess: (updated) => {
      if (updated) qc.setQueryData(['reports', reportId], updated);
      void qc.invalidateQueries({ queryKey: ['reports', reportId] });
      toast({
        title: 'Feedback Flag Added',
        body: 'Report status is updated to queried. The club will be notified.',
        tone: 'success',
      });
      setComment('');
      onClose();
    },
    onError: (err) => {
      toast({
        title: 'Could not flag item',
        body: err instanceof Error ? err.message : 'Please try again.',
        tone: 'error',
      });
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={itemTarget ? `Flag ${itemTarget.title} for Revision` : 'Flag Item'}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            loading={flagMutation.isPending}
            disabled={!comment.trim()}
            onClick={() => flagMutation.mutate()}
          >
            Submit Feedback Flag
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="m-0 text-xs text-fg-2">
          Provide specific instructions for what the club needs to correct. When you submit feedback, this report will enter targeted revision mode for the club.
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-fg">Reviewer Feedback *</span>
          <Textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Please provide the verifiable attendance count and attached photo links..."
          />
        </label>
      </div>
    </Modal>
  );
}

function AuditTrailCard({ reportId }: { reportId: string }) {
  const auditQuery = useQuery({
    queryKey: ['reports', reportId, 'audit'],
    queryFn: () => fetchReportAuditLogs(reportId),
  });

  const logs = auditQuery.data ?? [];

  return (
    <Card
      eyebrow="RESPONSIBILITIES & AUDIT TRAIL"
      title="Subsystem Audit & Revision History"
    >
      {auditQuery.isPending ? (
        <Skeleton shape="text" lines={3} />
      ) : auditQuery.isError ? (
        <p className="m-0 text-xs text-danger-fg">Could not load compliance audit logs.</p>
      ) : logs.length === 0 ? (
        <p className="m-0 text-xs text-fg-3">No compliance audit logs recorded yet.</p>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
          {logs.map((log) => {
            const meta = (log.metadata ?? {}) as Record<string, unknown>;
            const actorName = log.actorName || log.actorEmail || 'System';

            return (
              <div key={log.id} className="relative text-xs">
                <div className="absolute -left-6 top-1 size-2.5 rounded-full border-2 border-surface bg-accent" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-fg uppercase tracking-wider text-[10.5px]">
                      {log.action.replace('report.', '').toUpperCase()}
                    </span>
                    <span className="text-fg-3">&bull;</span>
                    <span className="font-semibold text-fg-2">{actorName}</span>
                  </div>
                  <span className="text-[11px] text-fg-3">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                {Boolean(meta.reason) && (
                  <p className="m-0 mt-1 rounded bg-page p-2 text-fg-2 italic">
                    "{String(meta.reason)}"
                  </p>
                )}

                {Array.isArray(meta.flags) && (
                  <p className="m-0 mt-1 text-amber-700 font-medium">
                    Flagged {meta.flags.length} item(s) for revision.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function AssistPanel({ reportId }: { reportId: string }) {

  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ['reports', reportId, 'assist'], queryFn: () => fetchReportAssist(reportId), enabled: open });

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Get AI suggestions
      </Button>
    );
  }

  return (
    <Card eyebrow="ASSIST" title="Suggestions before you score this month">
      {query.isPending ? (
        <Skeleton shape="text" lines={3} />
      ) : query.isError ? (
        <p className="m-0 text-danger-fg">Couldn't load suggestions.</p>
      ) : !query.data.summary ? (
        <p className="m-0">No suggestions available. The assist service isn't configured on the server yet.</p>
      ) : (
        <>
          <p className="m-0 mb-3 whitespace-pre-wrap">{query.data.summary}</p>
          {query.data.suggestions.length > 0 && (
            <ul className="m-0 list-disc pl-5">
              {query.data.suggestions.map((s, i) => (
                <li key={i}>{s.message}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}

function describeTrace(entry: ClubPointsEntry): string {
  const trace = entry.trace as { inputs?: Record<string, number>; tierMatched?: { min: number; max: number | null } } | null;
  if (!trace?.inputs) return '';
  const { inputs } = trace;
  if (trace.tierMatched) {
    const { min, max } = trace.tierMatched;
    const bracket = max === null ? `${min}+` : `${min}–${max}`;
    if (inputs.numerator !== undefined) {
      const ratio = inputs.denominator ? Math.round((inputs.numerator / inputs.denominator) * 100) : 0;
      return `${ratio}% (${bracket} tier)`;
    }
    return `${inputs.value ?? ''} (${bracket} tier)`;
  }
  if (inputs.count !== undefined) return `${inputs.count} × unit(s)`;
  if (inputs.value !== undefined) return `value: ${inputs.value}`;
  return '';
}

function ReportPointsCard({
  clubId,
  month,
  ryYear,
  reportStatus,
}: {
  clubId: string;
  month: string;
  ryYear: number;
  reportStatus: ReportStatus;
}) {
  const pointsQuery = useQuery({
    queryKey: ['club-points', clubId, ryYear, month],
    queryFn: () => fetchClubPoints(clubId, { ryYear, month }),
  });

  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (pointsQuery.isPending) {
    return (
      <Card eyebrow="POINTS & SCORING RULES">
        <Skeleton shape="rect" className="h-28" />
      </Card>
    );
  }

  if (pointsQuery.isError) {
    return null;
  }

  const summary = pointsQuery.data;
  const entries = summary.entries ?? [];
  const total = summary.total;
  const judged = summary.judged;

  return (
    <Card
      eyebrow="POINTS & SCORING RULES"
      title={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Monthly Points Breakdown</span>
          <div className="flex items-center gap-2">
            <Badge tone={reportStatus === 'scored' ? 'green' : 'blue'}>
              {reportStatus === 'scored' ? `${total} PTS CONFIRMED` : `${total} PTS (CALCULATED)`}
            </Badge>
          </div>
        </div>
      }
    >
      {reportStatus !== 'scored' && (
        <div className="mb-4 rounded-lg border border-line-accent bg-page p-3 text-[12.5px] text-fg-2">
          <p className="m-0 font-medium text-fg">Pending Final Secretariat Scoring</p>
          <p className="m-0 mt-0.5 text-fg-3 text-[11.5px]">
            Points below reflect automated rule calculations from your reported activities and metrics. Final scores are verified by the District Secretariat upon review.
          </p>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="m-0 text-[13px] text-fg-3">
          No automated rule points have been recorded for this report cycle yet.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-line">
          {entries.map((entry) => {
            const isExpanded = expandedRow === entry.id;
            const traceText = describeTrace(entry);
            const traceObj = entry.trace as Record<string, unknown> | null;

            return (
              <div key={entry.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="m-0 text-[13.5px] font-semibold text-fg">{entry.ruleLabel}</p>
                      {entry.categoryName && (
                        <span className="rounded bg-accent/10 px-2 py-0.5 text-[10.5px] font-medium text-accent">
                          {entry.categoryName}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11.5px] text-fg-3">
                      <span className="capitalize">{entry.ruleType} rule</span>
                      {traceText && <span>&bull; {traceText}</span>}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[15px] font-bold text-fg">+{entry.points} pts</span>
                    {traceObj && (
                      <button
                        type="button"
                        onClick={() => setExpandedRow(isExpanded ? null : entry.id)}
                        className="text-[11.5px] font-semibold text-accent hover:underline"
                      >
                        {isExpanded ? 'Hide' : 'Trace'}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && traceObj && (
                  <div className="mt-2.5 rounded-lg border border-line-accent bg-input p-3 text-[12px]">
                    <div className="font-semibold text-fg-2 mb-1.5">Rule Evaluation Inputs:</div>
                    {Object.entries((traceObj.inputs as Record<string, unknown>) || traceObj).map(([k, v]) => (
                      <div key={k} className="flex justify-between py-0.5 text-fg-3">
                        <span className="font-mono text-[11px]">{k}</span>
                        <span className="font-semibold text-fg">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {judged?.points !== null && judged?.points !== undefined && (
        <div className="mt-4 border-t border-line pt-3 flex items-center justify-between text-[13px]">
          <div>
            <span className="font-semibold text-fg">Secretariat Judged Adjustment:</span>
            {judged.reason && <p className="m-0 text-[11.5px] text-fg-3 mt-0.5">{judged.reason}</p>}
          </div>
          <span className="font-bold text-fg">
            {judged.points >= 0 ? `+${judged.points}` : judged.points} pts
          </span>
        </div>
      )}

      {summary.byCategory && summary.byCategory.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-fg-3 mb-2">Category Summary</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {summary.byCategory.map((cat) => (
              <div key={cat.categoryId} className="rounded-lg bg-page p-2.5 border border-line">
                <div className="text-[11px] text-fg-3 truncate">{cat.categoryName}</div>
                <div className="text-[14px] font-bold text-fg mt-0.5">{cat.points} pts</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function QueryThread({ reportId, queries, canReply, canAsk }: {
  reportId: string;
  queries: Report['queries'];
  canReply: boolean;
  canAsk: boolean;
}) {
  const qc = useQueryClient();
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState('');

  const askMutation = useMutation({
    mutationFn: () => addReportQuery(reportId, question),
    onSuccess: () => {
      setQuestion('');
      void qc.invalidateQueries({ queryKey: ['reports', reportId] });
    },
  });
  const replyMutation = useMutation({
    mutationFn: (queryId: string) => replyReportQuery(reportId, queryId, reply),
    onSuccess: () => {
      setReply('');
      void qc.invalidateQueries({ queryKey: ['reports', reportId] });
    },
  });

  const list = queries ?? [];
  const openQuery = list.find((q) => !q.reply);

  return (
    <Card eyebrow="SECRETARIAT THREAD" title="Questions and replies">
      {list.length === 0 ? (
        <p className="m-0">No questions have been asked about this report.</p>
      ) : (
        <ul className="m-0 mb-4 flex list-none flex-col gap-3 p-0">
          {list.map((q) => (
            <li key={q.id} className="rounded-[10px] bg-page p-3.5">
              <p className="m-0 text-[12.5px] font-semibold text-fg">{q.question}</p>
              {q.reply ? (
                <p className="m-0 mt-2 text-[12.5px] text-fg-2">Reply: {q.reply}</p>
              ) : (
                <p className="m-0 mt-2 text-[11.5px] font-bold text-danger-fg">Awaiting a reply</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {canReply && openQuery && (
        <div className="flex flex-col gap-2.5 border-t border-line pt-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-fg">Reply to the secretariat</span>
            <Textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} />
          </label>
          <Button
            size="sm"
            className="self-start"
            disabled={!reply.trim()}
            loading={replyMutation.isPending}
            onClick={() => replyMutation.mutate(openQuery.id)}
          >
            Send reply and resubmit
          </Button>
        </div>
      )}

      {canAsk && (
        <div className="flex flex-col gap-2.5 border-t border-line pt-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-fg">Ask the club a question</span>
            <Textarea rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} />
          </label>
          <Button
            size="sm"
            className="self-start"
            disabled={!question.trim()}
            loading={askMutation.isPending}
            onClick={() => askMutation.mutate()}
          >
            Send query
          </Button>
        </div>
      )}
    </Card>
  );
}

export function ReportDetailPage() {
  return (
    <ErrorBoundary>
      <ReportDetailPageInner />
    </ErrorBoundary>
  );
}

function ReportDetailPageInner() {
  const { id = '' } = useParams();
  const { can } = useAuth();
  const qc = useQueryClient();
  useDocumentMeta({ title: 'Report detail' });

  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
  const [showcaseData, setShowcaseData] = useState<{
    title: string;
    category?: string;
    date: string;
    summary: string;
    beneficiaries?: number;
  } | null>(null);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [flagModalTarget, setFlagModalTarget] = useState<{
    targetType: 'field' | 'activity' | 'general';
    fieldKey?: string;
    activityIndex?: number;
    activityFieldKey?: string;
    title: string;
  } | null>(null);

  const canManageReports = can('reports:manage') || can('reports:score') || can('super_admin');
  const canReviewReports = can('reports:review') || canManageReports;

  const reportQuery = useQuery({ queryKey: ['reports', id], queryFn: () => fetchReport(id, ['queries', 'club']) });
  const schemaVersion = reportQuery.data?.schemaVersion;
  const schemaQuery = useQuery({
    queryKey: ['report-schema', schemaVersion],
    queryFn: () => fetchReportSchemaVersion(schemaVersion!, true),
    enabled: schemaVersion !== undefined,
  });

  if (reportQuery.isPending || schemaQuery.isPending) {
    return (
      <Container>
        <Section title="Report">
          <Skeleton shape="rect" className="h-80" />
        </Section>
      </Container>
    );
  }

  if (reportQuery.isError || !schemaQuery.data) {
    return (
      <Container>
        <ErrorState title="Couldn't load this report" onRetry={() => void reportQuery.refetch()} />
      </Container>
    );
  }

  const report = reportQuery.data;
  const monthLabel = formatMonthLabel(report.month.slice(0, 7));
  const { topFields, activityFields } = splitFields(schemaQuery.data.fields);
  const activities = activitiesOf(report.values);
  const clubName = report.club?.shortName || report.club?.name || 'Club';

  const isImageUrl = (url: unknown): boolean => {
    if (typeof url !== 'string') return false;
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url) || url.includes('drive.google.com/uc?') || url.includes('images.unsplash.com');
  };

  const isWebUrl = (url: unknown): boolean => {
    if (typeof url !== 'string') return false;
    return /^https?:\/\//i.test(url);
  };

  return (
    <Container>
      <Section
        eyebrow={report.club?.name ?? monthLabel}
        title={`${monthLabel} report`}
        description={report.status === 'queried' ? 'This month was sent back with a review flag. Reply or submit corrections to proceed.' : undefined}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => {
                setShowcaseData({
                  title: `${clubName} ${monthLabel} Initiative`,
                  summary: report.notes || `Key highlights and impact metrics reported for ${monthLabel}.`,
                  date: report.month.slice(0, 10),
                });
              }}
            >
              <Sparkles size={13} className="text-accent" />
              <span>Push to Showcase</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={exporting === 'pdf'}
              onClick={async () => {
                setExporting('pdf');
                try {
                  await downloadReportPdf(report.id, `${clubName}-${monthLabel}-report.pdf`);
                } finally {
                  setExporting(null);
                }
              }}
            >
              Export PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={exporting === 'csv'}
              onClick={async () => {
                setExporting('csv');
                try {
                  await downloadReportCsv(report.id, `${clubName}-${monthLabel}-report.csv`);
                } finally {
                  setExporting(null);
                }
              }}
            >
              Export CSV
            </Button>

            {canManageReports && report.status !== 'draft' && (
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-1.5 text-amber-700 hover:bg-amber-50"
                onClick={() => setResetModalOpen(true)}
              >
                <RotateCcw size={13} />
                <span>Reset to Draft</span>
              </Button>
            )}

            {canManageReports && (
              <Button
                variant="danger"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </Button>
            )}

            <Badge tone={STATUS_TONE[report.status]}>{report.status.toUpperCase()}</Badge>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-6">
            {/* Review Feedback Flags Banner */}
            {report.flags && report.flags.length > 0 && (
              <div className="rounded-[14px] border border-amber-500/30 bg-amber-500/10 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <AlertCircle size={16} className="text-amber-600" />
                  <span>District Secretariat Review Feedback ({report.flags.length})</span>
                </div>
                <div className="mt-3 space-y-2">
                  {report.flags.map((flag) => (
                    <div
                      key={flag.id}
                      className="flex items-start justify-between gap-3 rounded-lg bg-surface p-3 text-xs border border-line"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold capitalize text-fg">
                            {flag.targetType === 'field'
                              ? `Field: ${flag.fieldKey}`
                              : flag.targetType === 'activity'
                                ? `Activity #${(flag.activityIndex ?? 0) + 1}`
                                : 'General Note'}
                          </span>
                          <Badge tone={flag.status === 'resolved' ? 'green' : 'amber'}>
                            {flag.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="m-0 mt-1 text-fg-2 font-medium">{flag.comment}</p>
                        {flag.flaggedByName && (
                          <p className="m-0 mt-1 text-[11px] text-fg-3">
                            Flagged by {flag.flaggedByName} on {new Date(flag.flaggedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {canManageReports && flag.status === 'flagged' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 shrink-0"
                          onClick={async () => {
                            await resolveReportFlag(report.id, flag.id);
                            qc.invalidateQueries({ queryKey: ['reports', report.id] });
                          }}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {topFields.length > 0 && (
              <Card eyebrow="THIS MONTH AT THE CLUB">
                <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {topFields.map((field) => (
                    <div key={field.id} className="group relative">
                      <div className="flex items-center justify-between">
                        <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-fg-3">{field.label}</dt>
                        {canReviewReports && (
                          <button
                            type="button"
                            onClick={() =>
                              setFlagModalTarget({
                                targetType: 'field',
                                fieldKey: field.fieldKey,
                                title: field.label,
                              })
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[10.5px] font-bold text-amber-600 hover:underline flex items-center gap-1"
                          >
                            <Flag size={10} /> Flag
                          </button>
                        )}
                      </div>
                      <dd className="m-0 text-[13px] text-fg">{formatFieldValue(field, report.values[field.fieldKey])}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            )}

            <Card eyebrow={`ACTIVITIES · ${activities.length}`}>
              {activities.length === 0 ? (
                <p className="m-0">No activities were reported this month.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {activities.map((activity, index) => {
                    const titleField = activityFields.find((f) => /title|name|project/i.test(f.fieldKey) || /title|name|project/i.test(f.label));
                    const actTitle = String(activity[titleField?.fieldKey || ''] || activity['title'] || activity['name'] || `Project ${index + 1}`);
                    const descField = activityFields.find((f) => /desc|summary|detail|notes/i.test(f.fieldKey) || /desc|summary|detail|notes/i.test(f.label));
                    const actSummary = String(activity[descField?.fieldKey || ''] || activity['description'] || activity['summary'] || '');
                    const benField = activityFields.find((f) => /beneficiar/i.test(f.fieldKey) || /beneficiar/i.test(f.label));
                    const actBen = Number(activity[benField?.fieldKey || '']) || undefined;
                    const dateField = activityFields.find((f) => /date/i.test(f.fieldKey) || /date/i.test(f.label));
                    const actDate = String(activity[dateField?.fieldKey || ''] || report.month);

                    const actFlag = (report.flags ?? []).find(
                      (f) => f.targetType === 'activity' && f.activityIndex === index,
                    );

                    return (
                      <div
                        key={index}
                        className={`rounded-[10px] border p-4 bg-surface ${
                          actFlag ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-line'
                        }`}
                      >
                        {actFlag && (
                          <div className="mb-3 rounded bg-amber-500/10 p-2 text-xs font-semibold text-amber-800 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Flag size={12} className="text-amber-600" />
                              Feedback Flag: {actFlag.comment}
                            </span>
                            <Badge tone={actFlag.status === 'resolved' ? 'green' : 'amber'}>
                              {actFlag.status.toUpperCase()}
                            </Badge>
                          </div>
                        )}

                        <dl className="m-0 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {activityFields.map((field) => {
                            const val = activity[field.fieldKey];
                            const hasImage = isImageUrl(val);
                            const hasLink = isWebUrl(val);

                            return (
                              <div key={field.id} className="min-w-0">
                                <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-fg-3">{field.label}</dt>
                                <dd className="m-0 text-[13px] text-fg break-words">
                                  {hasImage ? (
                                    <div className="mt-1">
                                      <a
                                        href={String(val)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-block relative rounded overflow-hidden border border-line hover:opacity-90 transition-opacity"
                                      >
                                        <img src={String(val)} alt={field.label} className="h-16 w-24 object-cover" />
                                      </a>
                                    </div>
                                  ) : hasLink ? (
                                    <a
                                      href={String(val)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-accent font-medium hover:underline text-xs"
                                    >
                                      <span className="truncate max-w-[200px]">{String(val)}</span>
                                      <ExternalLink size={12} className="shrink-0" />
                                    </a>
                                  ) : (
                                    formatFieldValue(field, val)
                                  )}
                                </dd>
                              </div>
                            );
                          })}
                        </dl>

                        <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-2.5">
                          {canReviewReports && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex items-center gap-1.5 text-amber-700 hover:bg-amber-50"
                              onClick={() =>
                                setFlagModalTarget({
                                  targetType: 'activity',
                                  activityIndex: index,
                                  title: actTitle,
                                })
                              }
                            >
                              <Flag size={12} />
                              <span>Flag Activity</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex items-center gap-1.5"
                            onClick={() => {
                              setShowcaseData({
                                title: actTitle,
                                summary: actSummary || `Activity reported in the ${monthLabel} district report.`,
                                date: actDate.slice(0, 10),
                                beneficiaries: actBen,
                              });
                            }}
                          >
                            <Sparkles size={12} className="text-accent" />
                            <span>Feature on Showcase</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <ReportPointsCard
              clubId={report.clubId}
              month={report.month.slice(0, 7)}
              ryYear={report.ryYear}
              reportStatus={report.status}
            />

            {report.notes && (
              <Card eyebrow="NOTES FOR THE DISTRICT">
                <p className="m-0 whitespace-pre-wrap">{report.notes}</p>
              </Card>
            )}

            <QueryThread
              reportId={report.id}
              queries={report.queries}
              canReply={can('reports:submit', { type: 'club', id: report.clubId })}
              canAsk={can('reports:review') && report.status === 'submitted'}
            />

            <AuditTrailCard reportId={report.id} />
          </div>

          <div className="flex flex-col gap-4">
            <Card eyebrow="STATUS">
              <dl className="m-0 flex flex-col gap-2">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-fg-3">Submitted</dt>
                  <dd className="m-0 text-[13px] text-fg">{report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : '—'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-fg-3">Filed on time</dt>
                  <dd className="m-0 text-[13px] text-fg">{report.filedOnTime === null ? '—' : report.filedOnTime ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-fg-3">Scored</dt>
                  <dd className="m-0 text-[13px] text-fg">{report.scoredAt ? new Date(report.scoredAt).toLocaleDateString() : 'Not yet'}</dd>
                </div>
              </dl>
            </Card>
            {can('reports:score', { type: 'club', id: report.clubId }) && <AssistPanel reportId={report.id} />}
          </div>
        </div>
      </Section>

      {showcaseData && (
        <PushToShowcaseModal
          open={Boolean(showcaseData)}
          onClose={() => setShowcaseData(null)}
          initialData={showcaseData}
        />
      )}

      {resetModalOpen && (
        <ResetReportModal
          open={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          reportId={report.id}
          clubName={clubName}
          monthLabel={monthLabel}
        />
      )}

      {deleteModalOpen && (
        <DeleteReportModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          reportId={report.id}
          clubName={clubName}
          monthLabel={monthLabel}
        />
      )}

      {flagModalTarget && (
        <FlagItemModal
          open={Boolean(flagModalTarget)}
          onClose={() => setFlagModalTarget(null)}
          reportId={report.id}
          itemTarget={flagModalTarget}
        />
      )}
    </Container>
  );
}

