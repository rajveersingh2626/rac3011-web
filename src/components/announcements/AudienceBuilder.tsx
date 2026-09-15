import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field } from '@/components/ui/Field';
import { Checkbox } from '@/components/ui/Checkbox';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { fetchZones, fetchPublicClubs } from '@/lib/clubs';
import { estimateAudience } from '@/lib/announcements/api';
import { SENDABLE_ROLE_KEYS, type Audience } from '@/lib/announcements/types';
import { isAudienceEmpty } from '@/lib/announcements/audience';
import { ApiError } from '@/lib/api';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

export interface AudienceBuilderProps {
  value: Audience;
  onChange: (audience: Audience) => void;
}

export function AudienceBuilder({ value, onChange }: AudienceBuilderProps) {
  const [memberIdsText, setMemberIdsText] = useState(() => (value.memberIds ?? []).join(', '));

  const zonesQuery = useQuery({ queryKey: ['zones'], queryFn: fetchZones });
  const clubsQuery = useQuery({ queryKey: ['public-clubs'], queryFn: () => fetchPublicClubs() });

  const zoneOptions = (zonesQuery.data ?? []).map((z) => ({ value: z.id, label: z.name }));
  const clubOptions = (clubsQuery.data ?? []).map((c) => ({ value: c.id, label: c.name }));

  const toggleRole = (key: string, checked: boolean) => {
    const current = value.roleKeys ?? [];
    const next = checked ? [...current, key] : current.filter((k) => k !== key);
    onChange({ ...value, roleKeys: next.length ? next : undefined });
  };

  const setZoneIds = (ids: string[]) => onChange({ ...value, zoneIds: ids.length ? ids : undefined });
  const setClubIds = (ids: string[]) => onChange({ ...value, clubIds: ids.length ? ids : undefined });

  const onMemberIdsChange = (text: string) => {
    setMemberIdsText(text);
    const ids = [
      ...new Set(
        text
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
    onChange({ ...value, memberIds: ids.length ? ids : undefined });
  };

  const empty = isAudienceEmpty(value);
  const debouncedAudience = useDebouncedValue(value, 400);

  const estimateQuery = useQuery({
    queryKey: ['announcements-audience-estimate', debouncedAudience],
    queryFn: () => estimateAudience(debouncedAudience),
    enabled: !isAudienceEmpty(debouncedAudience),
  });

  const estimateLabel = useMemo(() => {
    if (empty) return 'Pick at least one of the options below';
    if (estimateQuery.isFetching) return 'Estimating…';
    if (estimateQuery.isError) {
      const message = estimateQuery.error instanceof ApiError ? estimateQuery.error.message : 'Could not estimate reach';
      return message;
    }
    if (estimateQuery.data !== undefined) {
      const n = estimateQuery.data;
      return `${n} ${n === 1 ? 'person' : 'people'} would receive this`;
    }
    return null;
  }, [empty, estimateQuery.isFetching, estimateQuery.isError, estimateQuery.error, estimateQuery.data]);

  return (
    <div className="flex flex-col gap-5">
      <Field label="Roles" hint="Optional — narrows the audience to these roles within any club/zone picked below">
        <div className="flex flex-col gap-1.5">
          {SENDABLE_ROLE_KEYS.map((r) => (
            <Checkbox
              key={r.key}
              label={r.label}
              checked={(value.roleKeys ?? []).includes(r.key)}
              onChange={(e) => toggleRole(r.key, e.target.checked)}
            />
          ))}
        </div>
      </Field>

      <Field label="Zones" hint="Optional — leave roles unchecked to reach everyone in these zones">
        <MultiSelect options={zoneOptions} values={value.zoneIds ?? []} onChange={setZoneIds} placeholder="Search zones…" />
      </Field>

      <Field label="Clubs" hint="Optional — leave roles unchecked to reach everyone in these clubs">
        <MultiSelect options={clubOptions} values={value.clubIds ?? []} onChange={setClubIds} placeholder="Search clubs…" />
      </Field>

      <Field label="Specific Members (by Rotary ID or Member ID)" hint="Optional — comma-separated Rotary IDs or member IDs to target specific people">
        <Input value={memberIdsText} onChange={(e) => onMemberIdsChange(e.target.value)} placeholder="e.g. 10391101, 11952661, mem_abc" />
      </Field>

      <Card tone={empty ? 'dashed' : 'action'} className="py-3.5">
        <p className="m-0 text-[13px] font-bold text-fg">{estimateLabel}</p>
      </Card>
    </div>
  );
}
