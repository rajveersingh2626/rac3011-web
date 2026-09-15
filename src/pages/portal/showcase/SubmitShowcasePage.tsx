import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DateInput } from '@/components/ui/DateInput';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { FileUpload, type FileUploadValue } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Timeline } from '@/components/ui/Timeline';
import { fetchPublicClubs } from '@/lib/clubs';
import { createProject, updateProject } from '@/lib/showcase/api';
import { AVENUES_OF_SERVICE, AREAS_OF_FOCUS } from '@/lib/showcase/types';
import { ApiError } from '@/lib/api';

const PHOTO_SLOTS = 4;

function urlOf(value: FileUploadValue | null): string | null {
  if (!value) return null;
  return value.kind === 'file' ? value.file.url : value.url;
}

export function SubmitShowcasePage() {
  useDocumentMeta({ title: 'Put a project on the showcase' });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { me, can } = useAuth();
  const isSuperAdmin = Boolean(me?.roles?.some((r) => r.roleKey === 'super_admin'));
  const canPublishOrDistrict = Boolean(can('showcase:publish') || isSuperAdmin || me?.profile?.clubId === 'DISTRICT');
  const myClubId = me?.profile?.clubId ?? me?.clubs[0]?.id ?? '';
  const [selectedClubId, setSelectedClubId] = useState<string>(myClubId);


  const activeHostClubId = canPublishOrDistrict && selectedClubId ? selectedClubId : myClubId;

  const clubsQuery = useQuery({ queryKey: ['public-clubs'], queryFn: () => fetchPublicClubs() });
  const allClubsList = (clubsQuery.data ?? []).map((c) => ({ value: c.id, label: c.name }));
  const clubOptions = allClubsList.filter((c) => c.value !== activeHostClubId);

  const [title, setTitle] = useState('');
  const [avenueOfService, setAvenueOfService] = useState<string>('Community Services');
  const [areasOfFocus, setAreasOfFocus] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [photos, setPhotos] = useState<(FileUploadValue | null)[]>(Array(PHOTO_SLOTS).fill(null));
  const [summary, setSummary] = useState('');
  const [beneficiaries, setBeneficiaries] = useState('');
  const [collaboratingClubIds, setCollaboratingClubIds] = useState<string[]>([]);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const buildPayload = () => ({
    title: title.trim(),
    category: areasOfFocus[0] || avenueOfService || '',
    avenueOfService,
    areasOfFocus,
    date,
    summary: summary.trim(),
    beneficiaries: beneficiaries ? Number(beneficiaries) : null,
    photos: photos.map(urlOf).filter((u): u is string => Boolean(u)),
    collaboratingClubIds,
    consentConfirmed,
    clubId: canPublishOrDistrict && activeHostClubId ? activeHostClubId : undefined,
  });

  function validate(requireConsent: boolean): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Say what the club did';
    if (!avenueOfService) next.avenueOfService = 'Pick an avenue of service';
    if (areasOfFocus.length === 0) next.areasOfFocus = 'Select at least one area of focus';
    if (!date) next.date = 'Pick a date';
    if (!summary.trim()) next.summary = 'Tell us what happened';
    if (requireConsent && !consentConfirmed) next.consent = 'Confirm consent before sending for review';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const invalidateAll = () => {
    void qc.invalidateQueries({ queryKey: ['projects'] });
    void qc.invalidateQueries({ queryKey: ['public', 'projects'] });
    void qc.invalidateQueries({ queryKey: ['public', 'project'] });
    void qc.invalidateQueries({ queryKey: ['public', 'home'] });
  };

  const saveDraftMutation = useMutation({
    mutationFn: () => createProject(buildPayload()),
    onSuccess: () => {
      invalidateAll();
      navigate('/portal/showcase/mine');
    },
    onError: (e: unknown) => setFormError(e instanceof ApiError ? e.message : 'Could not save the draft. Try again.'),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const created = await createProject(buildPayload());
      return updateProject(created.id, { status: 'submitted' });
    },
    onSuccess: () => {
      invalidateAll();
      navigate('/portal/showcase/mine');
    },
    onError: (e: unknown) => setFormError(e instanceof ApiError ? e.message : 'Could not send this for review. Try again.'),
  });

  const onSaveDraft = () => {
    setFormError(null);
    if (!validate(false)) return;
    saveDraftMutation.mutate();
  };

  const onSendForReview = () => {
    setFormError(null);
    if (!validate(true)) return;
    submitMutation.mutate();
  };

  const setPhoto = (index: number, value: FileUploadValue | null) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? value : p)));
  };

  const toggleAreaOfFocus = (focus: string) => {
    setAreasOfFocus((prev) =>
      prev.includes(focus) ? prev.filter((f) => f !== focus) : [...prev, focus]
    );
    if (errors.areasOfFocus) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.areasOfFocus;
        return copy;
      });
    }
  };

  const busy = saveDraftMutation.isPending || submitMutation.isPending;

  return (
    <Container width="wide">
      <Section
        title="Put a project on the showcase"
        description="You ran it, so you write it. A district officer checks it and publishes — usually within a week."
      >
        {formError && (
          <div className="mb-5">
            <Alert tone="error" title="Something went wrong">
              {formError}
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div className="flex max-w-[600px] flex-col gap-5">
            {canPublishOrDistrict && (
              <Field label="Host Club" required hint="District Team / Admin: Choose which club ran this project">
                <Select
                  value={activeHostClubId || ''}
                  onChange={(e) => {
                    setSelectedClubId(e.target.value);
                    setCollaboratingClubIds((prev) => prev.filter((id) => id !== e.target.value));
                  }}
                  placeholder="Select Host Club"
                  options={allClubsList}
                />
              </Field>
            )}

            <Field label="What did the club do?" required error={errors.title}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blood donation camp" maxLength={200} />
            </Field>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label="When" required error={errors.date}>
                <DateInput value={date} onChange={setDate} />
              </Field>
              <Field label="Avenue of service" required error={errors.avenueOfService}>
                <Select
                  value={avenueOfService}
                  onChange={(e) => setAvenueOfService(e.target.value)}
                  placeholder="Choose an avenue"
                  options={AVENUES_OF_SERVICE.map((a) => ({ value: a, label: a }))}
                />
              </Field>
            </div>

            <Field
              label="Areas of focus"
              required
              hint="Select all Rotary areas of focus that apply to this project (Multi-choice)"
              error={errors.areasOfFocus}
            >
              <div className="flex flex-wrap gap-2 pt-1">
                {AREAS_OF_FOCUS.map((focus) => {
                  const isSelected = areasOfFocus.includes(focus);
                  return (
                    <button
                      key={focus}
                      type="button"
                      onClick={() => toggleAreaOfFocus(focus)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold transition-all border text-left ${
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

            <Field
              label="Photographs"
              hint="One is enough, four is plenty. Upload files, or paste a Drive/Photos link. Landscape works best in the grid."
            >
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {photos.map((value, i) => (
                  <FileUpload
                    key={i}
                    tier="dynamic"
                    resourceType="project_photo"
                    resourceId={activeHostClubId || undefined}
                    value={value}
                    onChange={(v) => setPhoto(i, v)}
                    label={i === 0 ? 'Lead photo' : `Photo ${i + 1}`}
                  />
                ))}
              </div>
            </Field>


            <Field label="Tell us what happened" required hint="Four or five lines. What you did, who it was for, and anything that surprised you." error={errors.summary}>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} maxLength={3000} />
            </Field>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label="Roughly how many people did it reach">
                <Input
                  type="number"
                  min={0}
                  value={beneficiaries}
                  onChange={(e) => setBeneficiaries(e.target.value)}
                  placeholder="120"
                />
              </Field>
              <Field label="Other clubs or organizations" hint="Optional">
                <MultiSelect
                  options={clubOptions}
                  values={collaboratingClubIds}
                  onChange={setCollaboratingClubIds}
                  placeholder="Search clubs…"
                />
              </Field>
            </div>

            <Card tone="action" className="border-[1.5px]">
              <Checkbox
                label="Everyone identifiable in these photographs is happy to appear on a public page. Where the project involved children or patients, that permission was taken in person."
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
              />
              {errors.consent && <p className="mt-1 text-[11px] font-semibold text-danger-fg">{errors.consent}</p>}
            </Card>

            <div className="flex flex-wrap gap-2.5">
              <Button onClick={onSendForReview} loading={submitMutation.isPending} disabled={busy}>
                Send for review
              </Button>
              <Button variant="secondary" onClick={onSaveDraft} loading={saveDraftMutation.isPending} disabled={busy}>
                Save a draft
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <p className="m-0 mb-3.5 text-[10.5px] font-bold uppercase tracking-[0.9px] text-accent">What happens next</p>
              <Timeline
                items={[
                  { title: 'You send it', meta: 'Now', state: 'current' },
                  {
                    title: 'Your president is told',
                    meta: 'Not asked to approve — just told, so nothing is submitted behind their back',
                  },
                  {
                    title: 'An officer edits and publishes',
                    meta: 'Within about a week. They may tighten the wording; they will not change what you claim',
                  },
                  { title: 'It appears on the showcase', meta: 'With your club named' },
                ]}
              />
            </Card>
            <Card tone="plain">
              <p className="m-0 mb-2 text-[13px] font-extrabold text-fg">Why a member submits, not the president</p>
              <p className="m-0 text-[12px] leading-relaxed text-fg-2">
                The avenue directors run the projects. Routing every entry through the president makes one person the
                bottleneck for everyone else&apos;s work, and the write-up would come from somebody who wasn&apos;t there.
                Publishing still needs an officer, so the approval gate the district asked for is intact.
              </p>
            </Card>
            <Card tone="plain">
              <p className="m-0 mb-2 text-[13px] font-extrabold text-fg">The consent tick is not boilerplate</p>
              <p className="m-0 text-[12px] leading-relaxed text-fg-2">
                It is the one thing a member can confirm and a district officer cannot. An officer approving a photo of a
                school handover has no way to know whether those parents agreed; the person who was in the room does.
              </p>
            </Card>
          </div>
        </div>
      </Section>
    </Container>
  );
}
