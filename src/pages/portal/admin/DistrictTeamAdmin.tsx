import { useQuery } from '@tanstack/react-query';
import { districtTeamApi } from '@/lib/publicContent/api';
import type { DistrictTeamMember } from '@/lib/publicContent/types';
import { fetchClubs } from '@/lib/publicApi/clubs';
import { currentRyYear } from '@/lib/reports/month';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { AssetUrlField } from './AssetUrlField';
import { PublicContentTable } from './PublicContentTable';

export function DistrictTeamAdmin({ canWrite }: { canWrite: boolean }) {
  const { data: clubsData } = useQuery({
    queryKey: ['public', 'clubs'],
    queryFn: () => fetchClubs(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <PublicContentTable<DistrictTeamMember>
      title="District team member"
      queryKey="district-team-admin"
      crud={districtTeamApi}
      orderable
      canWrite={canWrite}
      writableKeys={['name', 'designation', 'kind', 'ryYear', 'photoUrl', 'phone', 'email', 'bio', 'clubId']}
      emptyValues={{ name: '', designation: '', kind: 'dsc', ryYear: currentRyYear() }}
      columns={[
        {
          key: 'photoUrl',
          header: 'Photo',
          cell: (r) =>
            r.photoUrl ? (
              <img
                src={r.photoUrl}
                alt={r.name}
                className="size-9 rounded-full object-cover border border-line"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="size-9 rounded-full bg-surface-2 flex items-center justify-center text-[11px] font-bold text-fg-3 border border-line">
                {r.name.slice(0, 2).toUpperCase()}
              </div>
            ),
        },
        { key: 'name', header: 'Name', cell: (r) => r.name },
        { key: 'designation', header: 'Designation', cell: (r) => r.designation },
        {
          key: 'kind',
          header: 'Kind',
          cell: (r) => (r.kind === 'core' ? 'Core' : 'DSC / Zonal'),
        },
        { key: 'ryYear', header: 'RY', cell: (r) => r.ryYear, numeric: true },
      ]}
      renderForm={({ values, setValues }) => (
        <div className="flex flex-col gap-4">
          <Field label="Name" required>
            <Input
              value={values.name ?? ''}
              onChange={(e) => setValues({ name: e.target.value })}
              placeholder="e.g. Rtr. John Doe"
            />
          </Field>
          <Field label="Designation" required>
            <Input
              value={values.designation ?? ''}
              onChange={(e) => setValues({ designation: e.target.value })}
              placeholder="e.g. District Rotaract Representative"
            />
          </Field>
          <Field label="Kind" required hint="Core renders in Executive Council; DSC renders in Zonal or District Chairs based on designation.">
            <Select
              options={[
                { value: 'core', label: 'Core (DG, DRR, Executive Council)' },
                { value: 'dsc', label: 'DSC / Zonal Team / District Chairs' },
              ]}
              value={values.kind ?? 'dsc'}
              onChange={(e) => setValues({ kind: e.target.value as DistrictTeamMember['kind'] })}
            />
          </Field>
          <Field label="Rotary year" required hint="e.g. 2026 for Rotary Year 2026-27">
            <Input
              type="number"
              min={2000}
              max={2100}
              value={values.ryYear ?? ''}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                setValues({ ryYear: Number.isNaN(parsed) ? undefined : parsed });
              }}
            />
          </Field>
          <Field label="Home Club" hint="Optional club affiliation">
            <Select
              options={[
                { value: '', label: 'None / District-wide' },
                ...(clubsData?.items ?? []).map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={values.clubId ?? ''}
              onChange={(e) => setValues({ clubId: e.target.value || null })}
            />
          </Field>
          <Field label="Phone">
            <Input
              type="tel"
              value={values.phone ?? ''}
              onChange={(e) => setValues({ phone: e.target.value })}
              placeholder="e.g. 9876543210"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={values.email ?? ''}
              onChange={(e) => setValues({ email: e.target.value })}
              placeholder="e.g. name@rotaract3011.org"
            />
          </Field>
          <Field label="Bio">
            <Textarea
              rows={3}
              value={values.bio ?? ''}
              onChange={(e) => setValues({ bio: e.target.value })}
              placeholder="Optional biography or background notes..."
            />
          </Field>
          <AssetUrlField
            label="Portrait"
            url={values.photoUrl}
            onChange={(photoUrl) => setValues({ photoUrl })}
            resourceType="district_team_photo"
          />
        </div>
      )}
    />
  );
}
