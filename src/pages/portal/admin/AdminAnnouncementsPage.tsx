import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { useDocumentMeta } from '@/lib/meta';
import { relativeTimeOrFallback } from '@/lib/format';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { AudienceBuilder } from '@/components/announcements/AudienceBuilder';
import { isAudienceEmpty } from '@/lib/announcements/audience';
import { fetchAnnouncementFeed, sendAnnouncement } from '@/lib/announcements/api';
import { ANNOUNCEMENT_CHANNELS, type Audience, type AnnouncementChannel } from '@/lib/announcements/types';
import { ApiError } from '@/lib/api';

const CHANNEL_LABEL: Record<AnnouncementChannel, string> = {
  portal: 'Portal',
  email: 'Email',
  push: 'Push',
};

const DEFAULT_CHANNELS: AnnouncementChannel[] = ['portal', 'email'];

export function AdminAnnouncementsPage() {
  useDocumentMeta({ title: 'Send an announcement' });
  const { me } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Audience>({});
  const [channels, setChannels] = useState<AnnouncementChannel[]>(DEFAULT_CHANNELS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  // Bumped on a successful send to remount AudienceBuilder, since its member-IDs text field
  // is local state that setAudience({}) alone can't reset.
  const [audienceResetKey, setAudienceResetKey] = useState(0);

  const isDistrictWide = me?.grants['announcements:send_all']?.some((g) => g.type === 'none') ?? false;

  const feedQuery = useQuery({
    queryKey: ['announcements', 1],
    queryFn: () => fetchAnnouncementFeed({ page: 1, pageSize: 10 }),
  });

  const toggleChannel = (channel: AnnouncementChannel, checked: boolean) => {
    setChannels((prev) => (checked ? [...prev, channel] : prev.filter((c) => c !== channel)));
  };

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Give this announcement a title';
    if (!body.trim()) next.body = 'Write the message';
    if (isAudienceEmpty(audience)) next.audience = 'Pick at least one role, zone, club, or member';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const sendMutation = useMutation({
    mutationFn: () => sendAnnouncement({ title: title.trim(), body: body.trim(), audience, channels }),
    onSuccess: () => {
      setTitle('');
      setBody('');
      setAudience({});
      setAudienceResetKey((k) => k + 1);
      setChannels(DEFAULT_CHANNELS);
      setErrors({});
      void queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (e: unknown) => setFormError(e instanceof ApiError ? e.message : 'Could not send this announcement. Try again.'),
  });

  const onSend = () => {
    setFormError(null);
    if (!validate()) return;
    sendMutation.mutate();
  };

  const canSubmit = title.trim() !== '' && body.trim() !== '' && !isAudienceEmpty(audience);

  return (
    <Container width="wide">
      <Section
        title="Send an announcement"
        description="Reaches members through the channels you choose, in addition to the in-portal feed."
      >
        {isDistrictWide && (
          <div className="mb-5">
            <Alert tone="info" title="You can send district-wide">
              Your role lets you reach any club, zone, or role across the district.
            </Alert>
          </div>
        )}

        {formError && (
          <div className="mb-5">
            <Alert tone="error" title="Something went wrong">
              {formError}
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex max-w-[600px] flex-col gap-5">
            <Field label="Title" required error={errors.title}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="District council meeting on Sunday" maxLength={200} />
            </Field>

            <Field label="Message" required error={errors.body}>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} maxLength={5000} />
            </Field>

            <Field label="Channels" hint="Portal is always the fallback record; add email to also notify inboxes">
              <div className="flex flex-col gap-1.5">
                {ANNOUNCEMENT_CHANNELS.map((c) => (
                  <Checkbox
                    key={c}
                    label={CHANNEL_LABEL[c]}
                    checked={channels.includes(c)}
                    onChange={(e) => toggleChannel(c, e.target.checked)}
                  />
                ))}
              </div>
            </Field>

            <Field label="Audience" required error={errors.audience}>
              <AudienceBuilder key={audienceResetKey} value={audience} onChange={setAudience} />
            </Field>

            <div>
              <Button onClick={onSend} loading={sendMutation.isPending} disabled={!canSubmit || sendMutation.isPending}>
                Send
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="m-0 text-[10.5px] font-bold uppercase tracking-[0.9px] text-accent">Recently sent</p>
            {feedQuery.isPending ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} shape="rect" className="h-24" />
                ))}
              </div>
            ) : feedQuery.isError ? (
              <ErrorState title="Couldn't load past announcements" onRetry={() => void feedQuery.refetch()} />
            ) : feedQuery.data.items.length === 0 ? (
              <EmptyState title="No announcements sent yet" />
            ) : (
              feedQuery.data.items.map((a) => (
                <Card key={a.id} title={a.title}>
                  <p className="m-0 line-clamp-3 whitespace-pre-wrap">{a.body}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11.5px] text-fg-3">{relativeTimeOrFallback(a.sentAt)}</span>
                    {a.recipientCount !== null && <Badge tone="neutral">{a.recipientCount} reached</Badge>}
                    {a.channels.map((c) => (
                      <Badge key={c} tone="neutral">
                        {CHANNEL_LABEL[c]}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </Section>
    </Container>
  );
}
