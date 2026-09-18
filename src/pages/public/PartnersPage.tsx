import { useQuery } from '@tanstack/react-query';
import { titleCaseSlug } from '@/lib/format';
import { useDocumentMeta } from '@/lib/meta';
import { fetchPartners } from '@/lib/publicApi/partners';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

const GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5';

export function PartnersPage() {
  useDocumentMeta({ title: 'Partners', description: 'Organizations that support district projects.' });
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['public', 'partners'], queryFn: fetchPartners });

  if (isPending) {
    return (
      <Container className="py-14">
        <div className={GRID_CLASS}>
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} shape="rect" className="h-36 rounded-[16px]" />
          ))}
        </div>
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container className="py-14">
        <ErrorState title="Couldn't load partners" onRetry={() => void refetch()} />
      </Container>
    );
  }

  return (
    <Container>
      <Section
        align="center"
        eyebrow="District 3011"
        title="Partners"
        description="Organizations that support district projects."
      >
        {data.items.length === 0 ? (
          <EmptyState title="No partners listed yet" />
        ) : (
          <div className={GRID_CLASS}>
            {data.items.map((partner) => (
              <div key={partner.id} className="rotaract-card flex flex-col items-center justify-between gap-3 p-6 text-center">
                {partner.logoUrl ? (
                  <img src={partner.logoUrl} alt={partner.name} className="h-14 w-auto max-w-full object-contain" />
                ) : (
                  <div
                    data-state="pending-permission"
                    className="flex h-14 w-full items-center justify-center rounded-[10px] bg-[var(--bg-subtle)] px-2 text-[10.5px] font-bold text-[var(--text-muted)]"
                  >
                    Logo pending permission
                  </div>
                )}
                <p className="m-0 text-[14px] font-extrabold leading-snug text-[var(--text-primary)]">{partner.name}</p>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <span className="pill-pink whitespace-nowrap" style={{ fontSize: '0.72rem', padding: '4px 12px' }}>
                    {titleCaseSlug(partner.tier)}
                  </span>
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline font-bold"
                    >
                      Visit &rarr;
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}
