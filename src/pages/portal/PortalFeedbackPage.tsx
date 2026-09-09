import { useState, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, CheckCircle2, ShieldCheck, Clock, MessageCircleQuestion } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { apiFetch } from '@/lib/api';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

interface FeedbackItem {
  id: string;
  category: string;
  message: string;
  status: 'open' | 'reviewed' | 'closed';
  reply: string | null;
  createdAt: string;
}

export function PortalFeedbackPage() {
  useDocumentMeta({ title: 'District Feedback & Grievances' });
  const queryClient = useQueryClient();

  const [category, setCategory] = useState<'general' | 'club'>('general');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const mineQuery = useQuery<{ items: FeedbackItem[]; total: number }>({
    queryKey: ['my-feedback'],
    queryFn: () => apiFetch('/feedback/mine'),
  });

  const submitMutation = useMutation({
    mutationFn: (body: { category: string; message: string; anonymous?: boolean }) =>
      apiFetch('/feedback', { method: 'POST', body }),
    onSuccess: () => {
      setFormSuccess(true);
      setMessage('');
      setFormError(null);
      void queryClient.invalidateQueries({ queryKey: ['my-feedback'] });
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to submit feedback. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setFormError('Please enter your feedback message.');
      return;
    }
    setFormError(null);
    setFormSuccess(false);
    submitMutation.mutate({
      category,
      message: message.trim(),
      anonymous,
    });
  };

  return (
    <Container className="py-8" width="narrow">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-light mb-3">
          <MessageCircleQuestion className="size-3.5" />
          Direct Line to District Leadership
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white m-0">
          District Feedback & Grievances
        </h1>
        <p className="mt-2 text-sm text-fg-muted max-w-xl m-0 leading-relaxed">
          Share suggestions, district event feedback, club governance issues, or ideas with the District Administration Council (DAC).
        </p>
      </div>

      {/* Submission Card */}
      <Card rule="accent" className="p-6 md:p-8 bg-gradient-to-b from-[#181B2A]/90 to-[#121420]/90 backdrop-blur-xl border border-white/10 mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Send className="size-4 text-accent" />
          Submit Feedback
        </h2>

        {formSuccess && (
          <Alert tone="action" className="mb-4" title="Feedback Submitted Successfully">
            Your message has been received by the District Council. Thank you for contributing to District 3011.
          </Alert>
        )}

        {formError && (
          <Alert tone="error" className="mb-4" title="Error">
            {formError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-fg-muted mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'general' | 'club')}
              options={[
                { value: 'general', label: 'General District Suggestion' },
                { value: 'club', label: 'Club Support & Affairs' },
              ]}
              className="bg-white/5 border-white/10 text-white rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-fg-muted mb-1.5 uppercase tracking-wider">
              Your Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your suggestion, grievance, or question clearly..."
              rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Checkbox
              checked={anonymous}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAnonymous(e.target.checked)}
              label={
                <span className="text-xs text-fg-muted flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-accent-light" />
                  Submit anonymously (withhold your identity)
                </span>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitMutation.isPending || !message.trim()}
              className="gap-2 shadow-lg shadow-accent/25"
            >
              <Send className="size-3.5" />
              {submitMutation.isPending ? 'Submitting...' : 'Send Feedback'}
            </Button>
          </div>
        </form>
      </Card>

      {/* History Card */}
      <Card rule="none" className="p-6 bg-surface/50 border border-white/5">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="size-4 text-white/50" />
          Your Submitted Feedback
        </h3>

        {mineQuery.isPending ? (
          <div className="space-y-3">
            <Skeleton shape="rect" className="h-20 rounded-xl" />
            <Skeleton shape="rect" className="h-20 rounded-xl" />
          </div>
        ) : (mineQuery.data?.items ?? []).length === 0 ? (
          <EmptyState
            title="No feedback submitted yet"
            body="When you submit feedback or questions to District Leadership, track their status and responses here."
          />
        ) : (
          <div className="space-y-3">
            {mineQuery.data?.items.map((fb) => (
              <div key={fb.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge tone={fb.status === 'reviewed' ? 'green' : fb.status === 'closed' ? 'neutral' : 'pink'}>
                    {fb.status.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] text-white/40 flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(fb.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-fg leading-relaxed m-0">{fb.message}</p>
                {fb.reply && (
                  <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-3">
                    <p className="text-[11px] font-bold text-accent-light m-0 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      District Administration Response:
                    </p>
                    <p className="text-xs text-white/80 m-0">{fb.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </Container>
  );
}
