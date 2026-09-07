import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';
import { Card } from '@/components/ui/Card';
import { Table, type Column } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchPublicStandings } from '@/lib/rcl/api';
import type { StandingsRow } from '@/lib/rcl/types';
import { formatNrr } from '@/lib/rcl/format';

const columns: Column<StandingsRow>[] = [
  {
    key: 'team',
    header: 'Team',
    cell: (r) => (
      <div>
        <p className="m-0 text-[13px] font-bold text-fg">{r.teamName}</p>
        {r.clubName ? <p className="m-0 text-[11px] text-fg-3">{r.clubName}</p> : null}
      </div>
    ),
  },
  { key: 'played', header: 'P', align: 'right', numeric: true, cell: (r) => r.played },
  { key: 'won', header: 'W', align: 'right', numeric: true, cell: (r) => r.won },
  { key: 'lost', header: 'L', align: 'right', numeric: true, cell: (r) => r.lost },
  { key: 'tied', header: 'T', align: 'right', numeric: true, cell: (r) => r.tied },
  { key: 'points', header: 'Pts', align: 'right', numeric: true, cell: (r) => r.points },
  { key: 'nrr', header: 'NRR', align: 'right', numeric: true, cell: (r) => formatNrr(r.nrr) },
];

export function StandingsPage() {
  useDocumentMeta({ title: 'Standings' });
  const query = useQuery({ queryKey: ['rcl', 'standings'], queryFn: fetchPublicStandings });

  return (
    <Container width="wide">
      <PageHero
        eyebrow="Rotaract Champions League"
        icon={<Trophy size={14} />}
        title="Standings"
        lead="Win = 2 points, tie or abandoned = 1 point each, loss = 0. Ties broken by NRR, then wins, then name."
        secondary={{ label: 'Fixtures', to: '/fixtures' }}
      />
      <section className="reveal pb-16">
        {query.isPending ? (
          <Skeleton shape="rect" className="h-64" />
        ) : query.isError ? (
          <ErrorState title="Couldn't load standings" onRetry={() => void query.refetch()} />
        ) : query.data.length === 0 ? (
          <EmptyState title="No teams registered yet" body="Standings will appear here once clubs register their teams and fixtures are played." />
        ) : (
          <Card rule="accent" className="overflow-x-auto p-0 sm:p-2">
            <Table columns={columns} rows={query.data} rowKey={(r) => r.teamId} empty="No standings yet." />
          </Card>
        )}
      </section>
    </Container>
  );
}
