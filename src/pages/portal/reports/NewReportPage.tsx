import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Calendar, Users, Heart, Globe, Briefcase, Award } from 'lucide-react';
import { fetchActiveReportSchema, fetchReports, createReport, updateReport } from '@/lib/reports/api';
import { useToast } from '@/components/ui/Toast';
import { fetchPublicClubs } from '@/lib/clubs';
import { currentReportMonth, formatMonthLabel } from '@/lib/reports/month';
import { emptyActivity, splitFields, activitySummaryLabel, activitySummaryDetail } from '@/lib/reports/values';
import { ApiError } from '@/lib/api';
import { ActivityForm } from './ActivityForm';
import { ReportFieldControl } from './ReportFieldControl';
import { useAutosave, type AutosaveStatus } from './useAutosave';

async function ensureDraftReport(clubId: string, month: string) {
  const existing = await fetchReports({ clubId, month, pageSize: 1 });
  if (existing.items[0]) return existing.items[0];
  try {
    return await createReport({ clubId, month });
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      const retry = await fetchReports({ clubId, month, pageSize: 1 });
      if (retry.items[0]) return retry.items[0];
    }
    throw e;
  }
}

function statusMessage(status: AutosaveStatus): string {
  switch (status) {
    case 'saving':
      return 'Saving…';
    case 'saved':
      return 'Saved as you type';
    case 'error':
      return 'Could not save — check your connection';
    case 'pending':
      return 'Unsaved changes';
    default:
      return 'Nothing to save yet';
  }
}

export function NewReportPage() {
  const { me } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const clubId = me?.profile?.clubId ?? me?.clubs[0]?.id ?? '';
  const month = useMemo(() => currentReportMonth(), []);
  const monthLabel = formatMonthLabel(month);
  useDocumentMeta({ title: `Monthly report · ${monthLabel}` });

  const schemaQuery = useQuery({ queryKey: ['report-schema', 'active'], queryFn: fetchActiveReportSchema });
  const reportQuery = useQuery({
    queryKey: ['reports', 'draft', clubId, month],
    queryFn: () => ensureDraftReport(clubId, month),
    enabled: Boolean(clubId),
  });
  const clubsQuery = useQuery({ queryKey: ['public-clubs'], queryFn: () => fetchPublicClubs() });

  const [values, setValues] = useState<Record<string, unknown>>({ activities: [] });
  const [notes, setNotes] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const storageKey = clubId ? `rac3011_report_draft_${clubId}_${month}` : undefined;

  useEffect(() => {
    if (reportQuery.data) {
      let nextValues = (reportQuery.data.values as Record<string, unknown>) ?? { activities: [] };
      let nextNotes = reportQuery.data.notes ?? '';
      if (storageKey && typeof window !== 'undefined') {
        try {
          const cached = window.localStorage.getItem(storageKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === 'object') {
              const cachedActivities = parsed.values?.activities;
              const serverActivities = (nextValues.activities as unknown[]) ?? [];
              if (Array.isArray(cachedActivities) && cachedActivities.length >= serverActivities.length) {
                nextValues = parsed.values;
                if (typeof parsed.notes === 'string') nextNotes = parsed.notes;
              }
            }
          }
        } catch {
          // ignore
        }
      }
      // Sanitize 7186 testing artifact if found in values or cached storage
      if (nextValues.physical_meetings === 7186 || nextValues.physical_meetings === '7186') {
        delete nextValues.physical_meetings;
        if (storageKey && typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem(storageKey);
          } catch {
            // ignore
          }
        }
      }
      setValues(nextValues);
      setNotes(nextNotes);
    }
  }, [reportQuery.data, storageKey]);

  const saveMutation = useMutation({
    mutationFn: (payload: { values: Record<string, unknown>; notes: string }) => {
      if (!reportQuery.data) return Promise.resolve(null);
      return updateReport(reportQuery.data.id, { values: payload.values, notes: payload.notes });
    },
    onSuccess: (updatedReport) => {
      qc.invalidateQueries({ queryKey: ['reports', 'draft', clubId, month] });
      if (updatedReport) {
        qc.setQueryData(['reports', updatedReport.id], updatedReport);
        qc.invalidateQueries({ queryKey: ['reports', updatedReport.id] });
      }
    },
  });

  const autosavePayload = useMemo(() => ({ values, notes }), [values, notes]);

  const [activeAvenue, setActiveAvenue] = useState<string | null>(null);
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [isNavigatingToReview, setIsNavigatingToReview] = useState(false);

  // Memoised, not just hoisted above the guards: splitFields returns fresh arrays, so an
  // unmemoised call makes ActivityForm reset mid-edit on every autosave tick.
  const { topFields, activityFields } = useMemo(
    () => splitFields(schemaQuery.data?.fields ?? []),
    [schemaQuery.data?.fields],
  );
  const activities = useMemo(
    () => (Array.isArray(values.activities) ? (values.activities as Record<string, unknown>[]) : []),
    [values.activities],
  );

  const REPORT_AVENUES = useMemo(() => [
    {
      id: 'Club Meetings',
      title: 'Club Meetings',
      icon: Calendar,
      description: 'General body meetings, board meetings, speaker sessions, and club assemblies',
    },
    {
      id: 'Club Services',
      title: 'Club Services',
      icon: Users,
      description: 'Internal fellowship, celebrations, orientations, sports, and member development',
    },
    {
      id: 'Community Services',
      title: 'Community Services',
      icon: Heart,
      description: 'Blood donation, health camps, relief drives, education, and ecological action',
    },
    {
      id: 'International Services',
      title: 'International Services',
      icon: Globe,
      description: 'Sister club twinings, international meetings, peace initiatives, and global fellowship',
    },
    {
      id: 'Vocational Services',
      title: 'Vocational Services',
      icon: Briefcase,
      description: 'Career conclaves, mentorship, industrial visits, and professional skill workshops',
    },
    {
      id: 'District Projects',
      title: 'District Projects',
      icon: Award,
      description: 'Participation in Mission 3011, Project Drishti, RCL, RIDE, RYLA, and DISCON',
    },
  ], []);

  const draftActivity = useMemo(() => {
    if (editingIndex !== null && activities[editingIndex]) {
      return activities[editingIndex];
    }
    const empty = emptyActivity(activityFields);
    if (activeAvenue) empty.avenue = activeAvenue;
    return empty;
  }, [editingIndex, activities, activityFields, activeAvenue]);

  const autosave = useAutosave(autosavePayload, (p) => saveMutation.mutateAsync(p), Boolean(reportQuery.data), storageKey);

  if (!clubId) {
    return (
      <Container>
        <ErrorState title="No club on your profile" body="Your account isn't linked to a club yet, so a report can't be filed." />
      </Container>
    );
  }

  if (schemaQuery.isPending || reportQuery.isPending || clubsQuery.isPending) {
    return (
      <Container>
        <Section title="Monthly report">
          <Skeleton shape="rect" className="h-96" />
        </Section>
      </Container>
    );
  }

  if (schemaQuery.isError || reportQuery.isError) {
    return (
      <Container>
        <ErrorState
          title="Couldn't load the report"
          body={(schemaQuery.error ?? reportQuery.error) instanceof Error ? (schemaQuery.error ?? reportQuery.error)?.message : undefined}
          onRetry={() => { void schemaQuery.refetch(); void reportQuery.refetch(); }}
        />
      </Container>
    );
  }

  const report = reportQuery.data!;
  const clubOptions = (clubsQuery.data ?? []).filter((c) => c.id !== clubId).map((c) => ({ value: c.id, label: c.name }));

  const handleProceedToReview = async () => {
    setIsNavigatingToReview(true);
    try {
      autosave.flush();
      const updated = await saveMutation.mutateAsync({ values, notes });
      if (updated) {
        qc.setQueryData(['reports', updated.id], updated);
      }
      navigate(`/portal/reports/${report.id}/review`);
    } catch (err) {
      console.error('Failed to save report before reviewing:', err);
      toast({
        title: 'Could not save report draft',
        body: err instanceof Error ? err.message : 'Please check your connection before reviewing.',
        tone: 'error',
      });
    } finally {
      setIsNavigatingToReview(false);
    }
  };

  const setTopField = (key: string, value: unknown) => setValues((v) => ({ ...v, [key]: value }));

  const saveActivity = (activity: Record<string, unknown>) => {
    setValues((v) => {
      const next = [...activities];
      if (editingIndex !== null) next[editingIndex] = activity;
      else next.push(activity);
      return { ...v, activities: next };
    });
    setEditingIndex(null);
  };

  const removeActivity = (index: number) => {
    setValues((v) => ({ ...v, activities: activities.filter((_, i) => i !== index) }));
    if (editingIndex === index) setEditingIndex(null);
  };


  const startAddForAvenue = (avenueId: string) => {
    setActiveAvenue(avenueId);
    setEditingIndex(null);
    setIsAddingOrEditing(true);
  };

  const startEditActivity = (index: number) => {
    const act = activities[index];
    setActiveAvenue((act?.avenue as string) || null);
    setEditingIndex(index);
    setIsAddingOrEditing(true);
  };

  const cancelAddOrEdit = () => {
    setEditingIndex(null);
    setIsAddingOrEditing(false);
  };

  const handleSaveActivity = (activity: Record<string, unknown>) => {
    const finalActivity = {
      ...activity,
      avenue: activeAvenue || activity.avenue || 'Club Services',
    };
    saveActivity(finalActivity);
    setIsAddingOrEditing(false);
  };


  return (
    <Container>
      <Section
        eyebrow={`Monthly Report · ${monthLabel}`}
        title="Monthly Avenue Reporting"
        description="6 avenues to report club activities and impact. Add events and projects under each respective avenue below."
        action={
          <Button variant="secondary" onClick={handleProceedToReview} loading={isNavigatingToReview}>
            Review and submit →
          </Button>
        }
      >
        <div className="flex flex-col gap-8">
          {topFields.length > 0 && (
            <div className="rounded-[16px] border border-line-accent bg-surface p-5 shadow-sm">
              <p className="m-0 mb-4 text-[10.5px] font-bold uppercase tracking-[0.1em] text-accent">Monthly Club Statistics</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {topFields.map((field) => (
                  <ReportFieldControl
                    key={field.id}
                    field={field}
                    value={values[field.fieldKey]}
                    onChange={(v) => setTopField(field.fieldKey, v)}
                    onBlur={autosave.flush}
                    clubOptions={clubOptions}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Form when adding or editing a project under an avenue */}
          {isAddingOrEditing ? (
            <div className="rounded-[18px] border-2 border-[#D81B60]/30 bg-surface p-6 shadow-md">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <span className="rounded-full bg-[#D81B60] px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                    {activeAvenue || 'Project Details'}
                  </span>
                  <h3 className="mt-2 text-xl font-black text-fg">
                    {editingIndex !== null ? 'Edit Project / Event' : `Add Project to ${activeAvenue}`}
                  </h3>
                  <p className="mt-1 text-xs text-fg-3">
                    Fill in event name, date, venue, attendance, and project links below.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={cancelAddOrEdit}>
                  Back to All Avenues
                </Button>
              </div>

              <ActivityForm
                key={editingIndex ?? activeAvenue ?? 'new'}
                fields={activityFields}
                activity={draftActivity}
                index={editingIndex ?? activities.length}
                clubOptions={clubOptions}
                onSave={handleSaveActivity}
                onCancel={cancelAddOrEdit}
              />
            </div>
          ) : (
            /* 6 Avenues to Report Dashboard Grid */
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-fg">6 Avenues of Service</h3>
                <span className="text-xs font-bold text-fg-3">
                  {activities.length} Total Project{activities.length === 1 ? '' : 's'} Logged for {monthLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {REPORT_AVENUES.map((av) => {
                  const avenueActivities = activities
                    .map((act, origIndex) => ({ act, origIndex }))
                    .filter(({ act }) => (act.avenue === av.id) || (act.avenue === av.title));

                  const Icon = av.icon;
                  return (
                    <div
                      key={av.id}
                      className="flex flex-col justify-between rounded-[16px] border border-line-accent bg-surface p-5 shadow-sm transition-all hover:border-[#D81B60]/40 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#D81B60]/10 text-[#D81B60]">
                              <Icon size={18} />
                            </div>
                            <h4 className="m-0 text-base font-extrabold text-fg">{av.title}</h4>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${avenueActivities.length > 0 ? 'bg-[#D81B60]/10 text-[#D81B60]' : 'bg-page text-fg-3'}`}>
                            {avenueActivities.length} {avenueActivities.length === 1 ? 'project' : 'projects'}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-fg-3 leading-relaxed">
                          {av.description}
                        </p>

                        {/* List of projects already under this avenue */}
                        {avenueActivities.length > 0 && (
                          <div className="mt-4 space-y-2 border-t border-line pt-3">
                            {avenueActivities.map(({ act, origIndex }) => (
                              <div
                                key={origIndex}
                                className="flex items-start justify-between gap-2 rounded-lg bg-page p-2.5 text-xs"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="m-0 truncate font-bold text-fg">
                                    {activitySummaryLabel(act)}
                                  </p>
                                  <p className="m-0 truncate text-[11px] text-fg-3">
                                    {activitySummaryDetail(act) || 'No details'}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => startEditActivity(origIndex)}
                                    className="rounded p-1 text-fg-3 hover:bg-surface hover:text-[#D81B60]"
                                    title="Edit project"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeActivity(origIndex)}
                                    className="rounded p-1 text-fg-3 hover:bg-surface hover:text-danger-fg"
                                    title="Remove project"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 border-t border-line pt-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full justify-center font-bold text-[#D81B60] hover:bg-pink-50"
                          onClick={() => startAddForAvenue(av.id)}
                        >
                          + Add Project / Item
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Field label="Notes for the district secretariat" hint="Anything you'd like the district to know while reviewing this month's report.">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={autosave.flush} maxLength={5000} rows={4} />
          </Field>

          <div className="flex items-center justify-between pt-2">
            <p
              role="status"
              className={autosave.status === 'error' ? 'm-0 text-[12px] font-semibold text-danger-fg' : 'm-0 text-[12px] text-fg-3'}
            >
              {statusMessage(autosave.status)}
            </p>
            <Button variant="primary" onClick={handleProceedToReview} loading={isNavigatingToReview}>
              Proceed to Review &amp; Submit ({activities.length} Projects) →
            </Button>
          </div>
        </div>
      </Section>
    </Container>
  );
}
