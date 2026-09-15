import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, FileText, Calendar, Compass, ShieldAlert, Sparkles } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
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

function getRuleSourceDetails(rule: PointRule, activeSchemaFields: { fieldKey: string; label: string; section: string; pointSourceKey?: string | null }[]) {
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

export function PointRulesPage() {
  useDocumentMeta({ title: 'Point rules' });
  const qc = useQueryClient();
  const ryYear = currentRyYear();
  const [editing, setEditing] = useState<PointRule | null | 'new'>(null);

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
    },
  });

  const byCategory = useMemo(() => {
    const map = new Map<string, PointRule[]>();
    for (const rule of rulesQuery.data ?? []) {
      const list = map.get(rule.categoryId) ?? [];
      list.push(rule);
      map.set(rule.categoryId, list);
    }
    return map;
  }, [rulesQuery.data]);

  const activeFields = activeSchemaQuery.data ?? [];

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
        title="Point rules & Source Mappings"
        description="All official RID 3011 scoring rules and their live connections to the active Report Form, Activity Log, and District records."
      >
        <div className="mb-5 flex justify-end">
          <Button leading={<Plus size={16} />} onClick={() => setEditing('new')}>
            New rule
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {categoriesQuery.data.map((category) => {
            const rules = byCategory.get(category.id) ?? [];
            if (rules.length === 0) return null;
            return (
              <Card key={category.id} eyebrow={`${rules.length} rule${rules.length === 1 ? '' : 's'}`} title={category.name}>
                <div className="mt-3 flex flex-col gap-3">
                  {rules.map((rule) => {
                    const sourceInfo = getRuleSourceDetails(rule, activeFields);
                    const SourceIcon = sourceInfo.icon;
                    return (
                      <div key={rule.id} className="flex flex-col gap-2 border-b border-line-accent pb-3.5 last:border-0 last:pb-0">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="m-0 text-[13.5px] font-bold text-fg">{rule.label}</p>
                            <p className="m-0 font-mono text-[11px] text-fg-3">
                              {rule.sourceType}:{rule.sourceKey}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone="neutral">{rule.ruleType.toUpperCase()}</Badge>
                            <Badge tone={rule.isActive ? 'blue' : 'neutral'}>{rule.period.toUpperCase()}</Badge>
                            <span className="text-[12px] font-semibold text-fg-2">{ruleSummary(rule)}</span>
                            {!rule.isActive && <Badge tone="amber">Inactive</Badge>}
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
      </Section>

      <PointRuleEditorModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSave={(values) => saveMutation.mutate(values)}
        saving={saveMutation.isPending}
        categories={categoriesQuery.data}
        ryYear={ryYear}
        initial={editing && editing !== 'new' ? editing : null}
      />
    </Container>
  );
}
