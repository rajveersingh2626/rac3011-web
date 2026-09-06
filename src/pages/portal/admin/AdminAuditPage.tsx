import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDocumentMeta } from '@/lib/meta';
import { relativeTimeOrFallback } from '@/lib/format';
import { fetchAuditLog } from '@/lib/audit/api';
import type { AuditRow } from '@/lib/audit/types';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateInput';
import { Button } from '@/components/ui/Button';
import { Table, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

const PAGE_SIZE = 25;

interface Filters {
  resourceType: string;
  resourceId: string;
  actorId: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: Filters = { resourceType: '', resourceId: '', actorId: '', from: '', to: '' };

export function AdminAuditPage() {
  useDocumentMeta({ title: 'Audit log' });

  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [inspecting, setInspecting] = useState<AuditRow | null>(null);

  const query = useQuery({
    queryKey: ['audit', filters, page],
    queryFn: () =>
      fetchAuditLog({
        resourceType: filters.resourceType || undefined,
        resourceId: filters.resourceId || undefined,
        actorId: filters.actorId || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
  });

  function applyFilters(next: Filters) {
    setFilters(next);
    setPage(1);
  }

  function onSubmit() {
    applyFilters(draft);
  }

  function onClear() {
    setDraft(EMPTY_FILTERS);
    applyFilters(EMPTY_FILTERS);
  }

  function filterByActor(actorId: string) {
    const next = { ...draft, actorId };
    setDraft(next);
    applyFilters(next);
  }

  const columns: Column<AuditRow>[] = [
    {
      key: 'at',
      header: 'When',
      cell: (row) => relativeTimeOrFallback(row.at),
    },
    {
      key: 'actor',
      header: 'Actor',
      cell: (row) =>
        row.actorId ? (
          <button type="button" onClick={() => filterByActor(row.actorId as string)} className="font-mono text-[11.5px] text-accent underline-offset-2 hover:underline">
            {row.actorId}
          </button>
        ) : (
          <span className="font-mono text-[11.5px] text-fg-3">system</span>
        ),
    },
    { key: 'action', header: 'Action', cell: (row) => row.action },
    {
      key: 'resource',
      header: 'Resource',
      cell: (row) => (
        <span>
          {row.resourceType}
          {row.resourceId ? <span className="font-mono text-[11.5px] text-fg-3"> · {row.resourceId}</span> : null}
        </span>
      ),
    },
    {
      key: 'details',
      header: '',
      align: 'right',
      cell: (row) => (
        <button type="button" onClick={() => setInspecting(row)} className="font-bold text-accent">
          Details
        </button>
      ),
    },
  ];

  return (
    <Container width="wide">
      <Section eyebrow="Every mutation, traced" title="Audit log" description="Who changed what, and when.">
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <Field label="Resource type">
            <Input
              value={draft.resourceType}
              onChange={(e) => setDraft((d) => ({ ...d, resourceType: e.target.value }))}
              placeholder="e.g. member"
            />
          </Field>
          <Field label="Resource ID">
            <Input
              value={draft.resourceId}
              onChange={(e) => setDraft((d) => ({ ...d, resourceId: e.target.value }))}
              placeholder="mem_..."
            />
          </Field>
          <Field label="Actor ID">
            <Input
              value={draft.actorId}
              onChange={(e) => setDraft((d) => ({ ...d, actorId: e.target.value }))}
              placeholder="usr_..."
            />
          </Field>
          <Field label="From">
            <DateInput value={draft.from} onChange={(v) => setDraft((d) => ({ ...d, from: v }))} />
          </Field>
          <Field label="To">
            <DateInput value={draft.to} onChange={(v) => setDraft((d) => ({ ...d, to: v }))} />
          </Field>
          <div className="flex items-center gap-2">
            <Button onClick={onSubmit}>Apply</Button>
            <Button variant="ghost" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>

        {query.isPending ? (
          <Skeleton shape="rect" className="h-64" />
        ) : query.isError ? (
          <ErrorState title="Couldn't load the audit log" onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState title="No audit entries match these filters" />
        ) : (
          <>
            <Table columns={columns} rows={query.data.items} rowKey={(row) => row.id} />
            {query.data.total > query.data.pageSize ? (
              <div className="mt-8">
                <Pagination
                  page={page}
                  totalPages={Math.max(1, Math.ceil(query.data.total / query.data.pageSize))}
                  onChange={setPage}
                  label="Audit log pages"
                />
              </div>
            ) : null}
          </>
        )}
      </Section>

      <Modal open={Boolean(inspecting)} onClose={() => setInspecting(null)} title="Audit entry" size="lg">
        {inspecting ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="m-0 text-[10.5px] font-bold uppercase tracking-[0.9px] text-fg-3">Before</p>
              <pre className="mt-1.5 max-h-64 overflow-auto whitespace-pre-wrap rounded-[8px] bg-track p-3 font-mono text-[11.5px] text-fg">
                {JSON.stringify(inspecting.before ?? null, null, 2)}
              </pre>
            </div>
            <div>
              <p className="m-0 text-[10.5px] font-bold uppercase tracking-[0.9px] text-fg-3">After</p>
              <pre className="mt-1.5 max-h-64 overflow-auto whitespace-pre-wrap rounded-[8px] bg-track p-3 font-mono text-[11.5px] text-fg">
                {JSON.stringify(inspecting.after ?? null, null, 2)}
              </pre>
            </div>
          </div>
        ) : null}
      </Modal>
    </Container>
  );
}
