import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DateInput } from '@/components/ui/DateInput';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { fetchPublicClubs } from '@/lib/clubs';
import { updateProject } from '@/lib/showcase/api';
import { AVENUES_OF_SERVICE, AREAS_OF_FOCUS, type Project } from '@/lib/showcase/types';
import { ApiError } from '@/lib/api';

export interface EditShowcaseFormProps {
  project: Project;
  onDone: () => void;
}

export function EditShowcaseForm({ project, onDone }: EditShowcaseFormProps) {
  const { me } = useAuth();
  const clubId = me?.profile?.clubId ?? me?.clubs[0]?.id ?? '';
  const leadClubId = project.clubs.find((c) => c.role === 'lead')?.club.id ?? clubId;

  const clubsQuery = useQuery({ queryKey: ['public-clubs'], queryFn: () => fetchPublicClubs() });
  const clubOptions = (clubsQuery.data ?? [])
    .filter((c) => c.id !== leadClubId)
    .map((c) => ({ value: c.id, label: c.name }));

  const [title, setTitle] = useState(project.title);
  const [avenueOfService, setAvenueOfService] = useState(project.avenueOfService || 'Community Services');
  const [areasOfFocus, setAreasOfFocus] = useState<string[]>(
    project.areasOfFocus && project.areasOfFocus.length > 0
      ? project.areasOfFocus
      : (project.category ? [project.category] : [])
  );
  const [date, setDate] = useState(project.date.slice(0, 10));
  const [summary, setSummary] = useState(project.summary);
  const [beneficiaries, setBeneficiaries] = useState(project.beneficiaries != null ? String(project.beneficiaries) : '');
  const [collaboratingClubIds, setCollaboratingClubIds] = useState<string[]>(
    project.clubs.filter((c) => c.role === 'collaborator').map((c) => c.club.id),
  );
  const [consentConfirmed, setConsentConfirmed] = useState(project.consentConfirmed);
  const [error, setError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);

  const toggleAreaOfFocus = (focus: string) => {
    setAreasOfFocus((prev) =>
      prev.includes(focus) ? prev.filter((f) => f !== focus) : [...prev, focus]
    );
  };

  const buildPayload = () => ({
    title: title.trim(),
    category: areasOfFocus[0] || avenueOfService || '',
    avenueOfService,
    areasOfFocus,
    date,
    summary: summary.trim(),
    beneficiaries: beneficiaries ? Number(beneficiaries) : null,
    collaboratingClubIds,
    consentConfirmed,
  });

  const saveMutation = useMutation({
    mutationFn: () => updateProject(project.id, buildPayload()),
    onSuccess: onDone,
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not save your changes.'),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await updateProject(project.id, buildPayload());
      return updateProject(project.id, { status: 'submitted' });
    },
    onSuccess: onDone,
    onError: (e: unknown) => setError(e instanceof ApiError ? e.message : 'Could not send this for review.'),
  });

  const onSendForReview = () => {
    setError(null);
    if (!consentConfirmed) {
      setConsentError('Confirm consent before sending for review');
      return;
    }
    setConsentError(null);
    submitMutation.mutate();
  };

  const busy = saveMutation.isPending || submitMutation.isPending;

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Alert tone="error" title="Something went wrong">
          {error}
        </Alert>
      )}
      <Field label="What did the club do?" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
      </Field>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="When" required>
          <DateInput value={date} onChange={setDate} />
        </Field>
        <Field label="Avenue of service" required>
          <Select
            value={avenueOfService}
            onChange={(e) => setAvenueOfService(e.target.value)}
            options={AVENUES_OF_SERVICE.map((a) => ({ value: a, label: a }))}
          />
        </Field>
      </div>
      <Field label="Areas of focus" hint="Select all that apply (Multi-choice)" required>
        <div className="flex flex-wrap gap-2 pt-1">
          {AREAS_OF_FOCUS.map((focus) => {
            const isSelected = areasOfFocus.includes(focus);
            return (
              <button
                key={focus}
                type="button"
                onClick={() => toggleAreaOfFocus(focus)}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all border text-left ${
                  isSelected
                    ? 'bg-accent/10 border-accent text-accent shadow-sm font-bold ring-1 ring-accent/30'
                    : 'bg-page border-line text-fg hover:border-line-accent hover:bg-surface-2'
                }`}
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded border text-[10px] font-black transition-colors ${
                    isSelected
                      ? 'border-accent bg-accent text-white'
                      : 'border-line-accent bg-page text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span>{focus}</span>
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Tell us what happened" required>
        <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} maxLength={3000} />
      </Field>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Roughly how many people did it reach">
          <Input type="number" min={0} value={beneficiaries} onChange={(e) => setBeneficiaries(e.target.value)} />
        </Field>
        <Field label="Other clubs or organizations" hint="Optional">
          <MultiSelect options={clubOptions} values={collaboratingClubIds} onChange={setCollaboratingClubIds} />
        </Field>
      </div>
      <div>
        <Checkbox
          label="Everyone identifiable in these photographs is happy to appear on a public page."
          checked={consentConfirmed}
          onChange={(e) => setConsentConfirmed(e.target.checked)}
        />
        {consentError && <p className="mt-1 text-[11px] font-semibold text-danger-fg">{consentError}</p>}
      </div>
      <div className="flex flex-wrap gap-2.5 border-t border-line pt-4">
        <Button onClick={onSendForReview} loading={submitMutation.isPending} disabled={busy}>
          Send for review
        </Button>
        <Button variant="secondary" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending} disabled={busy}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
