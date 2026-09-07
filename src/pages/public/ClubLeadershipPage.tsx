import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { MessageCircle, Users } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { fetchClub, whatsappLink } from '@/lib/publicApi/clubs';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Avatar } from '@/components/ui/Avatar';
import { Table, type Column } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { BoardMember } from '@/lib/publicApi/clubs';

const HERO_GRADIENT = 'linear-gradient(180deg, #D81B60 0%, #AD1457 100%)';

const COLUMNS: Column<BoardMember>[] = [
  { key: 'name', header: 'Name', cell: (r) => <span className="font-extrabold text-[var(--text-primary)]">{r.name}</span> },
  { key: 'position', header: 'Position', cell: (r) => <span className="font-semibold text-[#123499]">{r.position}</span> },
  {
    key: 'bloodGroup',
    header: 'Blood group',
    cell: (r) =>
      r.bloodGroup ? (
        <span className="pill-pink" style={{ fontSize: '0.74rem', padding: '3px 10px' }}>
          {r.bloodGroup}
        </span>
      ) : (
        <span className="text-[var(--text-muted)]">–</span>
      ),
  },
  {
    key: 'contact',
    header: 'Contact',
    cell: (r) => (
      <span className="flex flex-wrap gap-3">
        {r.phone ? (
          <a
            href={whatsappLink(r.phone)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-[var(--rotaract-pink)] hover:underline"
          >
            <MessageCircle aria-hidden className="size-3.5" /> {r.phone}
          </a>
        ) : null}
        {r.email ? (
          <a href={`mailto:${r.email}`} className="font-bold text-[var(--rotaract-pink)] hover:underline">
            {r.email}
          </a>
        ) : null}
      </span>
    ),
  },
];

export function ClubLeadershipPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['public', 'clubs', slug, 'board'],
    queryFn: () => fetchClub(slug, ['board']),
  });

  useDocumentMeta({ title: data ? `${data.name} leadership` : 'Club leadership' });

  if (isPending) {
    return (
      <Container className="py-12">
        <div className="rotaract-card p-7">
          <div className="flex items-center gap-4">
            <Skeleton shape="circle" className="size-[72px]" />
            <Skeleton shape="rect" className="h-7 w-1/3 rounded-[10px]" />
          </div>
          <Skeleton shape="text" lines={5} className="mt-7" />
        </div>
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container className="py-12">
        <ErrorState title="Club not found" onRetry={() => void refetch()} />
      </Container>
    );
  }

  const board = data.board ?? [];

  return (
    <div className="bg-white">
      <div className="-mt-12 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)] pt-12 md:mt-0 md:pt-0">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: 'Leadership', href: '/leadership' }, { label: data.name }]} linkComponent={Link} />
        </Container>
      </div>

      <header style={{ background: HERO_GRADIENT }}>
        <Container className="reveal py-12">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <span className="inline-flex shrink-0 rounded-full bg-white/95 p-2 shadow-[0_12px_32px_rgba(0,0,0,0.22)] [&>*]:size-[84px] [&>*]:border-0 [&>*]:text-[26px]">
              <Avatar name={data.name} src={data.logoUrl ?? undefined} size="xl" />
            </span>
            <div className="min-w-0">
              <h1 className="heading-display text-white">{data.name}</h1>
              {data.memberCount > 0 ? (
                <p className="m-0 mt-3">
                  <span className="pill-gold" style={{ fontSize: '0.8rem' }}>
                    <Users aria-hidden size={13} /> {data.memberCount} members
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-11">
        {board.length === 0 ? (
          <EmptyState title="This club's board hasn't been recorded yet" />
        ) : (
          <div className="rotaract-card overflow-x-auto p-6 sm:p-7">
            <Table columns={COLUMNS} rows={board} rowKey={(r) => r.id} caption={`Board for RY ${board[0]?.ryYear}`} />
          </div>
        )}
      </Container>
    </div>
  );
}
