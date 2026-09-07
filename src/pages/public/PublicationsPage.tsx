import { useQuery } from '@tanstack/react-query';
import { useDocumentMeta } from '@/lib/meta';
import { fetchPublications } from '@/lib/publicApi/publications';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

const TYPE_LABEL: Record<string, string> = { directory: 'Directory', newsletter: 'Newsletter' };

const GRID_CLASS = 'grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4';

export function PublicationsPage() {
  useDocumentMeta({ title: 'Publications', description: 'District directories and newsletters.' });
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['public', 'publications'], queryFn: fetchPublications });

  if (isPending) {
    return (
      <Container className="py-14">
        <div className={GRID_CLASS}>
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} shape="rect" className="h-64 rounded-[16px]" />
          ))}
        </div>
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container className="py-14">
        <ErrorState title="Couldn't load publications" onRetry={() => void refetch()} />
      </Container>
    );
  }

  return (
    <Container>
      <Section
        align="center"
        eyebrow="For members"
        title="Publications"
        description="District directories and newsletters, issue by issue."
      >
        {data.items.length === 0 ? (
          <EmptyState title="No publications yet" body="Directories and newsletters will appear here once issued." />
        ) : (
          <div className={GRID_CLASS}>
            {data.items.map((pub) => (
              <a
                key={pub.id}
                href={pub.url}
                target="_blank"
                rel="noreferrer"
                className="rotaract-card group block overflow-hidden p-3 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--rotaract-pink)]"
              >
                <ImageSlot ratio="3:4" src={pub.coverUrl} alt={pub.title} prompt="Cover coming soon" />
                <p className="m-0 mt-3 text-[14px] font-extrabold leading-snug text-[var(--text-primary)] group-hover:text-[var(--rotaract-pink)]">
                  {pub.title}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="pill-pink" style={{ fontSize: '0.7rem', padding: '3px 10px' }}>
                    {TYPE_LABEL[pub.type] ?? pub.type}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--text-muted)]">{pub.month}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}
