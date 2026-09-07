import { useQuery } from '@tanstack/react-query';
import { useDocumentMeta } from '@/lib/meta';
import { fetchAchievements } from '@/lib/publicApi/achievements';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

const GRID_CLASS = 'grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4';

export function AchievementsPage() {
  useDocumentMeta({ title: 'Achievements', description: 'Milestones, awards and chartered clubs, district-wide.' });
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['public', 'achievements'], queryFn: fetchAchievements });

  if (isPending) {
    return (
      <Container className="py-14">
        <div className={GRID_CLASS}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} shape="rect" className="h-64 rounded-[16px]" />
          ))}
        </div>
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container className="py-14">
        <ErrorState title="Couldn't load achievements" onRetry={() => void refetch()} />
      </Container>
    );
  }

  return (
    <Container>
      <Section
        align="center"
        eyebrow="District 3011"
        title="Achievements"
        description="Milestones the district has reached, this Rotary year and beyond."
      >
        {data.items.length === 0 ? (
          <EmptyState title="No achievements published yet" />
        ) : (
          <div className={GRID_CLASS}>
            {data.items.map((a) => (
              <div key={a.id} className="rotaract-card flex flex-col overflow-hidden p-3">
                <ImageSlot ratio="3:4" src={a.certificateUrl} alt={a.title} prompt="Certificate coming soon" />
                <p className="m-0 mt-3 text-[14px] font-extrabold leading-snug text-[var(--text-primary)]">{a.title}</p>
                {a.description ? (
                  <p className="m-0 mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">{a.description}</p>
                ) : null}
                <p className="m-0 mt-2.5">
                  <span className="pill-pink" style={{ fontSize: '0.7rem', padding: '3px 10px' }}>
                    {new Date(a.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}
