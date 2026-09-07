import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { fetchClub } from '@/lib/publicApi/clubs';
import { fetchProjects, categoryLabelOf } from '@/lib/publicApi/showcase';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

const HERO_GRADIENT = 'linear-gradient(180deg, #D81B60 0%, #AD1457 100%)';

export function ClubShowcasePage() {
  const { clubSlug = '' } = useParams<{ clubSlug: string }>();
  const club = useQuery({ queryKey: ['public', 'clubs', clubSlug], queryFn: () => fetchClub(clubSlug) });
  const projects = useQuery({
    queryKey: ['public', 'projects', 'club', clubSlug],
    queryFn: () => fetchProjects({ clubSlug, pageSize: 50 }),
    enabled: !club.isError,
  });

  useDocumentMeta({ title: club.data ? `${club.data.name} showcase` : 'Club showcase' });

  if (club.isPending || projects.isPending) {
    return (
      <Container className="py-12">
        <div className="rotaract-card p-7">
          <Skeleton shape="rect" className="h-8 w-1/2 rounded-[10px]" />
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} shape="rect" className="h-48 rounded-[20px]" />
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (club.isError || !club.data) {
    return (
      <Container className="py-12">
        <ErrorState title="Club not found" onRetry={() => void club.refetch()} />
      </Container>
    );
  }

  const items = projects.data?.items ?? [];

  return (
    <div className="bg-white">
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
        <Container className="py-3">
          <Breadcrumbs
            items={[{ label: 'Showcase', href: '/showcase' }, { label: club.data.name }]}
            linkComponent={Link}
          />
        </Container>
      </div>

      <header style={{ background: HERO_GRADIENT }}>
        <Container className="reveal py-12">
          <div className="min-w-0">
            <h1 className="heading-display text-white">{club.data.name}</h1>
            <p className="m-0 mt-4">
              <Link
                to={`/leadership/clubs/${clubSlug}`}
                className="inline-flex items-center gap-2 rounded-[8px] border-2 border-white/70 px-5 py-2.5 text-[0.9rem] font-extrabold text-white transition-colors hover:bg-white hover:text-[var(--rotaract-pink)]"
              >
                View club profile <ArrowRight aria-hidden size={16} />
              </Link>
            </p>
          </div>
        </Container>
      </header>

      <Container className="py-11">
        {items.length === 0 ? (
          <EmptyState title="No published projects from this club yet" body="Once the club's showcase submissions are approved, they'll appear here." />
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((project) => (
              <Link
                key={project.id}
                to={project.slug ? `/showcase/${project.slug}` : '#'}
                className="rotaract-card block overflow-hidden rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rotaract-pink)] [&_figure>div]:rounded-none"
              >
                <ImageSlot src={project.photos[0]} alt={project.title ?? 'Project photo'} prompt="Photo coming soon" />
                <div className="p-5">
                  <p className="m-0 text-[0.72rem] font-extrabold uppercase tracking-[0.5px] text-[var(--rotaract-pink)]">
                    {categoryLabelOf(project.category)}
                  </p>
                  <p className="m-0 mt-1.5 text-[1.12rem] font-black leading-[1.25] text-[var(--text-primary)]">{project.title}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
