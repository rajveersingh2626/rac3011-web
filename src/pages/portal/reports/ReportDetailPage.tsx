import { useState } from 'react';
import { useParams } from 'react-router';
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
import { Sparkles, Share2, Plus, Trash2 } from 'lucide-react';
import { fetchReport, fetchReportSchemaVersion, addReportQuery, replyReportQuery, fetchReportAssist, downloadReportPdf, downloadReportCsv } from '@/lib/reports/api';
import type { Report, ReportStatus } from '@/lib/reports/types';
import { formatMonthLabel } from '@/lib/reports/month';
import { activitiesOf, formatFieldValue, splitFields } from '@/lib/reports/values';

const STATUS_TONE: Record<ReportStatus, BadgeTone> = {
  draft: 'neutral',
  submitted: 'blue',
  queried: 'amber',
  scored: 'green',
};

const SHOWCASE_CATEGORIES = [
  { value: 'community_service', label: 'Community Service' },
  { value: 'club_service', label: 'Club Service' },
  { value: 'professional_development', label: 'Professional Development' },
  { value: 'international_service', label: 'International Service' },
  { value: 'youth_service', label: 'Youth Service' },
  { value: 'environment', label: 'Environment & Sustainability' },
  { value: 'sports_fellowship', label: 'Sports & Fellowship' },
];

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
    date: string;
    summary: string;
    beneficiaries?: number;
  };
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState(initialData.title);
  const [category, setCategory] = useState(initialData.category || 'community_service');
  const [date, setDate] = useState(initialData.date || new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState(initialData.summary);
  const [beneficiaries, setBeneficiaries] = useState<number | undefined>(initialData.beneficiaries);
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const submitMutation = useMutation({
    mutationFn: () =>
      createProject({
        title,
        category,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        summary,
        beneficiaries: beneficiaries ? Number(beneficiaries) : null,
        photos: photos.filter(Boolean),
        consentConfirmed: true,
      }),
    onSuccess: () => {
      toast({
        title: 'Project Submitted to Showcase!',
        tone: 'success',
      });
      onClose();
    },
    onError: (e: any) => {
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
            disabled={!title.trim() || !summary.trim()}
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
            <span className="text-[12px] font-bold text-fg">Avenue / Category *</span>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={SHOWCASE_CATEGORIES}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-fg">Execution Date *</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
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
  useDocumentMeta({ title: 'Report detail' });
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
  const [showcaseData, setShowcaseData] = useState<{
    title: string;
    category?: string;
    date: string;
    summary: string;
    beneficiaries?: number;
  } | null>(null);

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

  return (
    <Container>
      <Section
        eyebrow={report.club?.name ?? monthLabel}
        title={`${monthLabel} report`}
        description={report.status === 'queried' ? 'This month was sent back with a query. Reply below to resubmit it.' : undefined}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => {
                setShowcaseData({
                  title: `${report.club?.shortName || report.club?.name || 'Club'} ${monthLabel} Initiative`,
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
                  const club = report.club?.shortName || report.club?.name || 'club';
                  await downloadReportPdf(report.id, `${club}-${monthLabel}-report.pdf`);
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
                  const club = report.club?.shortName || report.club?.name || 'club';
                  await downloadReportCsv(report.id, `${club}-${monthLabel}-report.csv`);
                } finally {
                  setExporting(null);
                }
              }}
            >
              Export CSV
            </Button>
            <Badge tone={STATUS_TONE[report.status]}>{report.status.toUpperCase()}</Badge>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-6">
            {topFields.length > 0 && (
              <Card eyebrow="THIS MONTH AT THE CLUB">
                <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {topFields.map((field) => (
                    <div key={field.id}>
                      <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-fg-3">{field.label}</dt>
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

                    return (
                      <div key={index} className="rounded-[10px] border border-line p-4 bg-surface">
                        <dl className="m-0 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {activityFields.map((field) => (
                            <div key={field.id}>
                              <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-fg-3">{field.label}</dt>
                              <dd className="m-0 text-[13px] text-fg">{formatFieldValue(field, activity[field.fieldKey])}</dd>
                            </div>
                          ))}
                        </dl>
                        <div className="mt-3 flex items-center justify-end border-t border-line pt-2.5">
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
    </Container>
  );
}
