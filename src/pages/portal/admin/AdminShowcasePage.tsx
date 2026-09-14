import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { fetchMyProjects, deleteProject, updateProject } from '@/lib/showcase/api';
import type { Project, ProjectStatus } from '@/lib/showcase/types';
import { ShowcaseQueueCard } from './ShowcaseQueueCard';

const TABS: { value: ProjectStatus; label: string }[] = [
  { value: 'submitted', label: 'Waiting' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Held back' },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function useQueueCount(status: ProjectStatus) {
  return useQuery({
    queryKey: ['projects', 'queue', 'count', status],
    queryFn: () => fetchMyProjects({ status, pageSize: 1 }),
  });
}

export function AdminShowcasePage() {
  useDocumentMeta({ title: 'Showcase moderation queue' });
  const qc = useQueryClient();
  const [status, setStatus] = useState<ProjectStatus>('submitted');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStatus, setEditStatus] = useState<'submitted' | 'published' | 'rejected'>('published');

  const waitingCount = useQueueCount('submitted');
  const publishedCount = useQueueCount('published');
  const rejectedCount = useQueueCount('rejected');
  const counts: Record<ProjectStatus, number | undefined> = {
    draft: undefined,
    submitted: waitingCount.data?.total,
    published: publishedCount.data?.total,
    rejected: rejectedCount.data?.total,
  };

  const queryKey = ['projects', 'queue', status];
  const listQuery = useQuery({ queryKey, queryFn: () => fetchMyProjects({ status, pageSize: 50 }) });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['projects'] });
      void qc.invalidateQueries({ queryKey: ['public', 'projects'] });
      void qc.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingProject) return;
      await updateProject(editingProject.id, {
        publishedTitle: editTitle.trim(),
        publishedSummary: editSummary.trim(),
        publishedBody: editBody.trim() || null,
        category: editCategory || undefined,
        status: editStatus,
      });
    },
    onSuccess: () => {
      setEditingProject(null);
      void qc.invalidateQueries({ queryKey: ['projects'] });
      void qc.invalidateQueries({ queryKey: ['public', 'projects'] });
      void qc.invalidateQueries({ queryKey });
    },
  });

  function openEdit(p: Project) {
    setEditingProject(p);
    setEditTitle(p.publishedTitle ?? p.title);
    setEditSummary(p.publishedSummary ?? p.summary);
    setEditBody(p.publishedBody ?? p.body ?? '');
    setEditCategory(p.category);
    setEditStatus(p.status === 'draft' ? 'submitted' : p.status);
  }

  return (
    <Container width="wide">
      <Section
        eyebrow="Edit-then-publish, not approve-or-reject"
        title={
          status === 'submitted'
            ? `${listQuery.data?.total ?? '…'} project(s) waiting to be published`
            : 'Showcase moderation'
        }
        description="Submitted text is shown verbatim so you can see exactly what you're changing before it goes public."
        action={
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <Badge key={t.value} tone={status === t.value ? 'pink' : 'neutral'}>
                {t.label} · {counts[t.value] ?? '…'}
              </Badge>
            ))}
          </div>
        }
      >
        <div className="mb-6">
          <SegmentedControl
            label="Filter by status"
            value={status}
            onChange={(v) => setStatus(v as ProjectStatus)}
            options={TABS.map((t) => ({ value: t.value, label: t.label }))}
          />
        </div>

        {listQuery.isPending ? (
          <Skeleton shape="rect" className="h-64" />
        ) : listQuery.isError ? (
          <ErrorState title="Couldn't load the queue" onRetry={() => void listQuery.refetch()} />
        ) : listQuery.data.items.length === 0 ? (
          <EmptyState title="Nothing here" body="No submissions currently match this filter." />
        ) : status === 'submitted' ? (
          <div className="flex flex-col gap-3.5">
            {listQuery.data.items.map((p) => (
              <ShowcaseQueueCard key={p.id} project={p} queryKey={queryKey} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {listQuery.data.items.map((p) => {
              const lead = p.clubs.find((c) => c.role === 'lead')?.club;
              return (
                <div key={p.id} className="rounded-[12px] border border-line-accent p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge tone="pink">{p.category.toUpperCase()}</Badge>
                      <span className="text-[11.5px] text-fg-3">
                        {lead?.name ?? 'Unknown club'} · {formatDate(p.date)}
                      </span>
                    </div>
                    <p className="m-0 mb-1 text-[14.5px] font-extrabold text-fg">{p.publishedTitle ?? p.title}</p>
                    <p className="m-0 text-[12.5px] text-fg-2 line-clamp-2">{p.publishedSummary ?? p.summary}</p>
                    {p.status === 'rejected' && p.rejectionReason ? (
                      <p className="m-0 mt-2 text-[12px] font-semibold text-danger-fg">Held: {p.rejectionReason}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                      Edit
                    </Button>
                    {p.status === 'published' && p.slug && (
                      <a href={`/showcase/${p.slug}`} target="_blank" rel="noreferrer" className="text-[12.5px] font-bold text-accent hover:underline px-2">
                        View live
                      </a>
                    )}
                    <button
                      type="button"
                      className="rounded-[6px] border border-line-accent px-3 py-1.5 text-[12px] font-semibold text-danger-fg hover:bg-accent-soft transition-colors"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove "${p.publishedTitle ?? p.title}" from the showcase?`)) {
                          deleteMutation.mutate(p.id);
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal
          open={editingProject !== null}
          onClose={() => setEditingProject(null)}
          title="Edit Showcase Project"
          size="lg"
          footer={
            <Button
              loading={updateMutation.isPending}
              disabled={!editTitle.trim() || !editSummary.trim()}
              onClick={() => updateMutation.mutate()}
            >
              Save Changes
            </Button>
          }
        >
          {editingProject && (
            <div className="flex flex-col gap-4">
              <Field label="Published Title" required>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </Field>
              <Field label="Published Summary" required>
                <Textarea rows={3} value={editSummary} onChange={(e) => setEditSummary(e.target.value)} />
              </Field>
              <Field label="Detailed Body / Impact Story">
                <Textarea rows={4} value={editBody} onChange={(e) => setEditBody(e.target.value)} />
              </Field>
              <Field label="Status">
                <Select
                  options={[
                    { value: 'published', label: 'Published' },
                    { value: 'submitted', label: 'Waiting (Submitted)' },
                    { value: 'rejected', label: 'Held back' },
                  ]}
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'submitted' | 'published' | 'rejected')}
                />
              </Field>
            </div>
          )}
        </Modal>
      </Section>
    </Container>
  );
}
