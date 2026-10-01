import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  CheckCircle2,
  FileText,
  Calendar,
  Compass,
  ShieldAlert,
  Sparkles,
  Search,
  Calculator,
  RotateCcw,
} from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { currentRyYear } from '@/lib/reports/month';
import { createPointRule, fetchPointCategories, fetchPointRules, updatePointRule } from '@/lib/points/api';
import { fetchReportSchemas, fetchReportSchemaVersion } from '@/lib/reports/api';
import type { PointRule } from '@/lib/points/types';
import { PointRuleEditorModal, type PointRuleFormValues } from './PointRuleEditorModal';

function ruleSummary(rule: PointRule): string {
  if (rule.ruleType === 'tiered') {
    return rule.tiers.map((t) => `${t.min}${t.max === null ? '+' : `–${t.max}`} → ${t.points}`).join(' · ');
  }
  if (rule.ruleType === 'per_unit') {
    return `${rule.points ?? 0} per unit${rule.perUnitCap ? `, capped at ${rule.perUnitCap}` : ''}`;
  }
  return String(rule.points ?? 0);
}

function getRuleSourceDetails(
  rule: PointRule,
  activeSchemaFields: { fieldKey: string; label: string; section: string; pointSourceKey?: string | null }[]
) {
  if (rule.sourceType === 'report_field') {
    const directField = activeSchemaFields.find(
      (f) => f.pointSourceKey === rule.sourceKey || f.fieldKey === rule.sourceKey
    );
    if (directField) {
      return {
        tone: 'green' as const,
        icon: CheckCircle2,
        label: `Mapped to Form: "${directField.label}" (${directField.section})`,
      };
    }
    const derivedMap: Record<string, string> = {
      projects_initiated: 'Auto-derived: Activities initiated by Your Club',
      camps_organised: 'Auto-derived: Community health / blood / polio camps',
      vocational_workshops: 'Auto-derived: Activities in Vocational avenue',
      international_activities: 'Auto-derived: Activities in International avenue',
      flagship_continued: 'Auto-derived: Activities in Flagship avenue',
      social_posts: 'Auto-derived: Social media posts / links in activity log',
      filed_on_time: 'Auto-derived: Report submission timestamp vs deadline (10th)',
    };
    if (derivedMap[rule.sourceKey]) {
      return {
        tone: 'blue' as const,
        icon: FileText,
        label: derivedMap[rule.sourceKey],
      };
    }
    return {
      tone: 'amber' as const,
      icon: ShieldAlert,
      label: `Report field key: ${rule.sourceKey} (not directly mapped to form input)`,
    };
  }

  if (rule.sourceType === 'project_collaboration') {
    return {
      tone: 'blue' as const,
      icon: FileText,
      label: 'Auto-derived: Activity log collaborating clubs count',
    };
  }
  if (rule.sourceType === 'event_attendance') {
    return {
      tone: 'pink' as const,
      icon: Calendar,
      label: 'Automated from District Events module attendance ratio',
    };
  }
  if (rule.sourceType === 'ride_hosting') {
    return {
      tone: 'pink' as const,
      icon: Compass,
      label: 'Automated from RIDE Portal exchange trips & hosting',
    };
  }
  if (rule.sourceType === 'club_events') {
    return {
      tone: 'blue' as const,
      icon: Calendar,
      label: 'Automated from Portal Club Events logged & approved',
    };
  }
  if (rule.sourceType === 'club_fact') {
    return {
      tone: 'neutral' as const,
      icon: Sparkles,
      label: 'Club Fact: Annual / milestone metric recorded in District Admin',
    };
  }
  return {
    tone: 'neutral' as const,
    icon: Sparkles,
    label: `${rule.sourceType}:${rule.sourceKey}`,
  };
}

interface SimulatorInputs {
  physical_meetings: number;
  virtual_meetings: number;
  new_members: number;
  social_posts: number;
  camps_organised: number;
  projects_initiated: number;
  vocational_workshops: number;
  international_activities: number;
  flagship_continued: boolean;
  max_collaborators: number;
  filed_on_time: boolean;
}

const DEFAULT_SIMULATOR_INPUTS: SimulatorInputs = {
  physical_meetings: 2,
  virtual_meetings: 1,
  new_members: 3,
  social_posts: 6,
  camps_organised: 1,
  projects_initiated: 1,
  vocational_workshops: 2,
  international_activities: 1,
  flagship_continued: true,
  max_collaborators: 3,
  filed_on_time: true,
};

export function PointRulesPage() {
  useDocumentMeta({ title: 'Point rules' });
  const qc = useQueryClient();
  const { toast } = useToast();
  const ryYear = currentRyYear();
  const [editing, setEditing] = useState<PointRule | null | 'new'>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'preliminary' | 'club_facts' | 'events'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simInputs, setSimInputs] = useState<SimulatorInputs>(DEFAULT_SIMULATOR_INPUTS);

  const categoriesQuery = useQuery({ queryKey: ['point-categories'], queryFn: fetchPointCategories });
  const rulesQuery = useQuery({ queryKey: ['point-rules', ryYear], queryFn: () => fetchPointRules(ryYear) });

  const activeSchemaQuery = useQuery({
    queryKey: ['active-report-schema-fields'],
    queryFn: async () => {
      const summaries = await fetchReportSchemas();
      const active = summaries.find((s) => s.status === 'active') ?? summaries[0];
      if (!active) return [];
      const schema = await fetchReportSchemaVersion(active.version, true);
      return schema?.fields ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: PointRuleFormValues) =>
      editing && editing !== 'new'
        ? updatePointRule(editing.id, values)
        : createPointRule(values),
    onSuccess: () => {
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ['point-rules', ryYear] });
      toast({ title: 'Point rule saved successfully' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updatePointRule(id, { isActive }),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: ['point-rules', ryYear] });
      toast({
        title: vars.isActive ? 'Rule activated' : 'Rule deactivated',
        tone: vars.isActive ? 'success' : 'info',
      });
    },
  });

  const allRules = rulesQuery.data ?? [];

  // Filter rules based on search and selected tab
  const filteredRules = useMemo(() => {
    return allRules.filter((r) => {
      // Tab filter
      if (filterTab === 'preliminary') {
        if (r.sourceType !== 'report_field' && r.sourceType !== 'project_collaboration') return false;
      } else if (filterTab === 'club_facts') {
        if (r.sourceType !== 'club_fact') return false;
      } else if (filterTab === 'events') {
        if (r.sourceType !== 'event_attendance' && r.sourceType !== 'ride_hosting' && r.sourceType !== 'club_events') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.label.toLowerCase().includes(q) ||
          r.key.toLowerCase().includes(q) ||
          r.sourceKey.toLowerCase().includes(q) ||
          r.sourceType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allRules, filterTab, searchQuery]);

  const byCategory = useMemo(() => {
    const map = new Map<string, PointRule[]>();
    for (const rule of filteredRules) {
      const list = map.get(rule.categoryId) ?? [];
      list.push(rule);
      map.set(rule.categoryId, list);
    }
    return map;
  }, [filteredRules]);

  const activeFields = activeSchemaQuery.data ?? [];

  // Preliminary rules summary
  const preliminaryRules = useMemo(() => {
    return allRules.filter((r) => r.sourceType === 'report_field' || r.sourceType === 'project_collaboration');
  }, [allRules]);

  const activePreliminaryCount = useMemo(() => {
    return preliminaryRules.filter((r) => r.isActive).length;
  }, [preliminaryRules]);

  // Simulator calculation
  const simulationResults = useMemo(() => {
    const activePrelim = preliminaryRules.filter((r) => r.isActive);
    let total = 0;
    const breakdown: Array<{ rule: PointRule; inputVal: number | boolean; pointsAwarded: number; reason: string }> = [];

    for (const rule of activePrelim) {
      let inputVal: number | boolean = 0;
      switch (rule.sourceKey) {
        case 'physical_meetings': inputVal = simInputs.physical_meetings; break;
        case 'virtual_meetings': inputVal = simInputs.virtual_meetings; break;
        case 'new_members': inputVal = simInputs.new_members; break;
        case 'social_posts': inputVal = simInputs.social_posts; break;
        case 'camps_organised': inputVal = simInputs.camps_organised; break;
        case 'projects_initiated': inputVal = simInputs.projects_initiated; break;
        case 'vocational_workshops': inputVal = simInputs.vocational_workshops; break;
        case 'international_activities': inputVal = simInputs.international_activities; break;
        case 'flagship_continued': inputVal = simInputs.flagship_continued; break;
        case 'max_collaborators': inputVal = simInputs.max_collaborators; break;
        case 'filed_on_time': inputVal = simInputs.filed_on_time; break;
        default: inputVal = 0;
      }

      let pts = 0;
      let reason = '';
      if (rule.ruleType === 'flat') {
        const passes = typeof inputVal === 'boolean' ? inputVal : inputVal > 0;
        if (passes) {
          pts = rule.points ?? 0;
          reason = `Flat ${pts} pts awarded`;
        } else {
          reason = 'Condition not met (0 pts)';
        }
      } else if (rule.ruleType === 'per_unit') {
        const rawCount = typeof inputVal === 'number' ? inputVal : inputVal ? 1 : 0;
        const rate = rule.points ?? 0;
        const units = rule.perUnitCap != null ? Math.min(rawCount, rule.perUnitCap) : rawCount;
        const calculated = units * rate;
        if (rule.perUnitCap != null && rawCount > rule.perUnitCap) {
          reason = `${units} units (capped at ${rule.perUnitCap}) × ${rate} pts = ${calculated} pts`;
        } else {
          reason = `${units} units × ${rate} pts = ${calculated} pts`;
        }
        pts = calculated;
      } else if (rule.ruleType === 'tiered') {
        const count = typeof inputVal === 'number' ? inputVal : inputVal ? 1 : 0;
        const matchedTier = rule.tiers.find((t) => count >= t.min && (t.max === null || count <= t.max));
        if (matchedTier && matchedTier.points > 0) {
          pts = matchedTier.points;
          reason = `${count} units matched bracket (${matchedTier.min}${matchedTier.max === null ? '+' : `–${matchedTier.max}`} → ${matchedTier.points} pts)`;
        } else {
          reason = `${count} units did not match any positive scoring tier (0 pts)`;
        }
      }

      total += pts;
      breakdown.push({ rule, inputVal, pointsAwarded: pts, reason });
    }

    return { total, breakdown };
  }, [preliminaryRules, simInputs]);

  if (categoriesQuery.isPending || rulesQuery.isPending) {
    return (
      <Container width="wide">
        <Skeleton shape="rect" className="h-96" />
      </Container>
    );
  }
  if (categoriesQuery.isError || rulesQuery.isError) {
    return (
      <Container width="wide">
        <ErrorState title="Couldn't load point rules" onRetry={() => void rulesQuery.refetch()} />
      </Container>
    );
  }

  return (
    <Container width="wide">
      <Section
        eyebrow={`RY ${ryYear}–${(ryYear + 1) % 100}`}
        title="Point Rules & Scoring Engine"
        description="Configure automated preliminary scoring, rule weights, and live source connections for District monthly reporting and club records."
      >
        {/* Preliminary Scoring Engine Command Center */}
        <div className="mb-6 rounded-[16px] border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex size-2 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="m-0 text-base font-bold text-fg">Automated Preliminary Scoring Pipeline</h3>
                <Badge tone="blue">{activePreliminaryCount} Active Rules</Badge>
              </div>
              <p className="m-0 mt-1.5 text-xs text-fg-2 max-w-2xl leading-relaxed">
                Preliminary points calculate dynamically upon club report submission based exclusively on the active rules below, providing instant scores before the District Secretariat reviews and confirms final standings.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                leading={<Calculator size={15} />}
                onClick={() => setSimulatorOpen(true)}
              >
                Test Calculator
              </Button>
              <Button size="sm" leading={<Plus size={15} />} onClick={() => setEditing('new')}>
                New rule
              </Button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant={filterTab === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterTab('all')}
            >
              All Rules ({allRules.length})
            </Button>
            <Button
              variant={filterTab === 'preliminary' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterTab('preliminary')}
            >
              Preliminary Report Rules ({preliminaryRules.length})
            </Button>
            <Button
              variant={filterTab === 'club_facts' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterTab('club_facts')}
            >
              Club Facts ({allRules.filter((r) => r.sourceType === 'club_fact').length})
            </Button>
            <Button
              variant={filterTab === 'events' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterTab('events')}
            >
              Events & RIDE ({allRules.filter((r) => ['event_attendance', 'ride_hosting', 'club_events'].includes(r.sourceType)).length})
            </Button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-fg-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules, keys..."
              className="pl-8 text-xs h-8"
            />
          </div>
        </div>

        {filteredRules.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <p className="m-0 text-sm font-semibold text-fg">No point rules match your filter</p>
              <p className="m-0 mt-1 text-xs text-fg-3">Try adjusting your search query or switching tabs.</p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {categoriesQuery.data?.map((category) => {
              const rules = byCategory.get(category.id) ?? [];
              if (rules.length === 0) return null;
              return (
                <Card key={category.id} eyebrow={`${rules.length} rule${rules.length === 1 ? '' : 's'}`} title={category.name}>
                  <div className="mt-3 flex flex-col gap-3">
                    {rules.map((rule) => {
                      const sourceInfo = getRuleSourceDetails(rule, activeFields);
                      const SourceIcon = sourceInfo.icon;
                      const isPendingToggle = toggleMutation.isPending && toggleMutation.variables?.id === rule.id;

                      return (
                        <div key={rule.id} className="flex flex-col gap-2 border-b border-line-accent pb-3.5 last:border-0 last:pb-0">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="m-0 text-[13.5px] font-bold text-fg">{rule.label}</p>
                                {!rule.isActive && <Badge tone="amber">Inactive</Badge>}
                              </div>
                              <p className="m-0 font-mono text-[11px] text-fg-3">
                                {rule.sourceType}:{rule.sourceKey}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <Badge tone="neutral">{rule.ruleType.toUpperCase()}</Badge>
                              <Badge tone={rule.isActive ? 'blue' : 'neutral'}>{rule.period.toUpperCase()}</Badge>
                              <span className="text-[12px] font-semibold text-fg-2">{ruleSummary(rule)}</span>

                              {/* Instant Active Toggle Switch */}
                              <div className="flex items-center gap-1.5 pl-2 border-l border-line-accent">
                                <Switch
                                  checked={rule.isActive}
                                  disabled={isPendingToggle}
                                  onChange={(checked) => toggleMutation.mutate({ id: rule.id, isActive: checked })}
                                  aria-label={`Toggle active for ${rule.label}`}
                                />
                                <span className="text-[11px] font-medium text-fg-3">
                                  {rule.isActive ? 'Active' : 'Off'}
                                </span>
                              </div>

                              <Button variant="link" size="sm" onClick={() => setEditing(rule)}>
                                Edit
                              </Button>
                            </div>
                          </div>

                          {/* Live Source Mapping Badge */}
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <Badge tone={sourceInfo.tone} className="inline-flex items-center gap-1 text-[10.5px] font-medium py-0.5 px-2">
                              <SourceIcon className="size-3" />
                              <span>{sourceInfo.label}</span>
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* Point Rule Editor Modal */}
      <PointRuleEditorModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSave={(values) => saveMutation.mutate(values)}
        saving={saveMutation.isPending}
        categories={categoriesQuery.data ?? []}
        ryYear={ryYear}
        initial={editing && editing !== 'new' ? editing : null}
      />

      {/* Interactive Preliminary Scoring Simulator Modal */}
      <Modal
        open={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        size="lg"
        title="Preliminary Scoring Calculator & Rule Inspector"
        footer={
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              leading={<RotateCcw size={14} />}
              onClick={() => setSimInputs(DEFAULT_SIMULATOR_INPUTS)}
            >
              Reset defaults
            </Button>
            <Button variant="secondary" onClick={() => setSimulatorOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5 text-left">
          <p className="m-0 text-xs text-fg-3 leading-relaxed">
            Test how active preliminary scoring rules evaluate when clubs record activities and submit monthly reports. Changing values calculates the exact preliminary score in real time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-[12px] border border-line-accent bg-[var(--bg-subtle)] p-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-fg-muted block mb-2.5">
                Club Meetings & Operations
              </span>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-fg">Physical meetings</span>
                  <Input
                    type="number"
                    min={0}
                    value={simInputs.physical_meetings}
                    onChange={(e) => setSimInputs((s) => ({ ...s, physical_meetings: Number(e.target.value) }))}
                    className="w-20 text-xs h-7"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-fg">Virtual meetings</span>
                  <Input
                    type="number"
                    min={0}
                    value={simInputs.virtual_meetings}
                    onChange={(e) => setSimInputs((s) => ({ ...s, virtual_meetings: Number(e.target.value) }))}
                    className="w-20 text-xs h-7"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-fg">New members inducted</span>
                  <Input
                    type="number"
                    min={0}
                    value={simInputs.new_members}
                    onChange={(e) => setSimInputs((s) => ({ ...s, new_members: Number(e.target.value) }))}
                    className="w-20 text-xs h-7"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-fg">Social posts / links</span>
                  <Input
                    type="number"
                    min={0}
                    value={simInputs.social_posts}
                    onChange={(e) => setSimInputs((s) => ({ ...s, social_posts: Number(e.target.value) }))}
                    className="w-20 text-xs h-7"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-fg">Filed on time (before 10th)</span>
                  <Switch
                    checked={simInputs.filed_on_time}
                    onChange={(checked) => setSimInputs((s) => ({ ...s, filed_on_time: checked }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-fg-muted block mb-2.5">
                Activity Log & Projects
              </span>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-fg">Health / Blood / Polio camps</span>
                  <Input
                    type="number"
                    min={0}
                    value={simInputs.camps_organised}
                    onChange={(e) => setSimInputs((s) => ({ ...s, camps_organised: Number(e.target.value) }))}
                    className="w-20 text-xs h-7"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-fg">Projects initiated</span>
                  <Input
                    type="number"
                    min={0}
                    value={simInputs.projects_initiated}
                    onChange={(e) => setSimInputs((s) => ({ ...s, projects_initiated: Number(e.target.value) }))}
                    className="w-20 text-xs h-7"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-fg">Vocational workshops</span>
                  <Input
                    type="number"
                    min={0}
                    value={simInputs.vocational_workshops}
                    onChange={(e) => setSimInputs((s) => ({ ...s, vocational_workshops: Number(e.target.value) }))}
                    className="w-20 text-xs h-7"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-fg">International activities</span>
                  <Input
                    type="number"
                    min={0}
                    value={simInputs.international_activities}
                    onChange={(e) => setSimInputs((s) => ({ ...s, international_activities: Number(e.target.value) }))}
                    className="w-20 text-xs h-7"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-fg">Max collaborating clubs</span>
                  <Input
                    type="number"
                    min={0}
                    value={simInputs.max_collaborators}
                    onChange={(e) => setSimInputs((s) => ({ ...s, max_collaborators: Number(e.target.value) }))}
                    className="w-20 text-xs h-7"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-fg">Flagship project continued</span>
                  <Switch
                    checked={simInputs.flagship_continued}
                    onChange={(checked) => setSimInputs((s) => ({ ...s, flagship_continued: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Calculation Result */}
          <div className="rounded-[12px] border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Simulated Preliminary Total</span>
                <p className="m-0 text-xl font-extrabold text-fg">{simulationResults.total} Points</p>
              </div>
              <Badge tone="blue">Preliminary Calculation</Badge>
            </div>

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {simulationResults.breakdown.map(({ rule, pointsAwarded, reason }) => (
                <div key={rule.id} className="flex items-center justify-between text-xs py-1 border-b border-line-accent/50 last:border-0">
                  <div>
                    <span className="font-semibold text-fg">{rule.label}</span>
                    <span className="ml-2 text-[11px] text-fg-3">{reason}</span>
                  </div>
                  <span className={`font-mono font-bold ${pointsAwarded > 0 ? 'text-accent' : 'text-fg-muted'}`}>
                    +{pointsAwarded} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </Container>
  );
}
