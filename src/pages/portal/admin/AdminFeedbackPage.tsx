import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Check, X, Clock, Reply, Filter, Shield } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { apiFetch } from '@/lib/api';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

interface FeedbackRow {
  id: string;
  category: string;
  message: string;
  status: 'open' | 'reviewed' | 'closed';
  reply: string | null;
  createdAt: string;
}

export function AdminFeedbackPage() {
  useDocumentMeta({ title: 'Member Feedback & Enquiries' });
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const { data, isPending, refetch } = useQuery<{ items: FeedbackRow[]; total: number }>({
    queryKey: ['admin-feedback', statusFilter],
    queryFn: () => {
      const url = statusFilter === 'all' ? '/feedback' : `/feedback?status=${statusFilter}`;
      return apiFetch(url);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, reply }: { id: string; status?: string; reply?: string }) =>
      apiFetch(`/feedback/${id}`, { method: 'PATCH', body: { status, reply } }),
    onSuccess: () => {
      setReplyingId(null);
      setReplyText('');
      void queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
    },
  });

  const items = data?.items ?? [];

  return (
    <Container className="py-8" width="normal">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-light mb-3">
            <Shield className="size-3.5" />
            District Administration
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white m-0">
            Member Feedback & Inquiries
          </h1>
          <p className="mt-2 text-sm text-fg-muted m-0">
            Review grievances, club inquiries, and suggestions submitted by Rotaract 3011 members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'open', label: 'Open / Pending' },
              { value: 'reviewed', label: 'Reviewed / Replied' },
              { value: 'closed', label: 'Closed' },
            ]}
            className="w-44 bg-white/5 border-white/10 text-white rounded-xl text-xs"
          />
        </div>
      </div>

      {isPending ? (
        <div className="space-y-4">
          <Skeleton shape="rect" className="h-28 rounded-2xl" />
          <Skeleton shape="rect" className="h-28 rounded-2xl" />
          <Skeleton shape="rect" className="h-28 rounded-2xl" />
        </div>
      ) : items.length === 0 ? (
        <Card rule="default" className="p-12 text-center border border-white/10 bg-white/[0.02]">
          <EmptyState
            title="No feedback found"
            description={
              statusFilter !== 'all'
                ? `No submissions currently marked as "${statusFilter}".`
                : 'All member inquiries and feedback have been addressed or none have been submitted.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((fb) => (
            <Card key={fb.id} rule="default" className="p-6 bg-[#161826]/80 border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Badge tone={fb.status === 'reviewed' ? 'emerald' : fb.status === 'closed' ? 'neutral' : 'accent'}>
                    {fb.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-semibold text-accent-light uppercase tracking-wider">
                    {fb.category}
                  </span>
                </div>
                <span className="text-[11px] text-white/40 flex items-center gap-1">
                  <Clock className="size-3" />
                  {new Date(fb.createdAt).toLocaleString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-sm text-fg leading-relaxed mb-4 whitespace-pre-wrap">{fb.message}</p>

              {fb.reply && (
                <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <p className="text-xs font-bold text-accent-light m-0 mb-1 flex items-center gap-1.5">
                    <Reply className="size-3.5" />
                    Sent Reply:
                  </p>
                  <p className="text-xs text-white/80 m-0">{fb.reply}</p>
                </div>
              )}

              {replyingId === fb.id ? (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official response to this member..."
                    rows={3}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={updateMutation.isPending || !replyText.trim()}
                      onClick={() =>
                        updateMutation.mutate({
                          id: fb.id,
                          status: 'reviewed',
                          reply: replyText.trim(),
                        })
                      }
                      className="gap-1.5"
                    >
                      <Check className="size-3.5" />
                      Send & Mark Reviewed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingId(null);
                        setReplyText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingId(fb.id);
                        setReplyText(fb.reply ?? '');
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <Reply className="size-3.5" />
                      {fb.reply ? 'Edit Reply' : 'Reply'}
                    </Button>
                    {fb.status !== 'closed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: fb.id, status: 'closed' })}
                        className="text-xs text-white/50 hover:text-white"
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
