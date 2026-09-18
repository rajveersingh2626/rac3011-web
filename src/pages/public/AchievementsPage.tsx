import { useQuery } from '@tanstack/react-query';
import { Award, ExternalLink } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { fetchAchievements } from '@/lib/publicApi/achievements';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

const GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5';

export function AchievementsPage() {
  useDocumentMeta({ title: 'Achievements', description: 'Milestones, awards and chartered clubs, district-wide.' });
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['public', 'achievements'], queryFn: fetchAchievements });

  if (isPending) {
    return (
      <Container className="py-14">
        <div className={GRID_CLASS}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} shape="rect" className="h-44 rounded-[16px]" />
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
              <div key={a.id} className="rotaract-card flex flex-col justify-between rounded-[20px] bg-white p-5 border border-[var(--border-subtle)] shadow-xs transition-all hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-pink-50 text-[#D81B60] border border-pink-100 shrink-0">
                      <Award size={20} />
                    </div>
                    <span className="pill-pink text-[11px] font-bold px-2.5 py-1 whitespace-nowrap">
                      {new Date(a.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="m-0 text-[15px] font-extrabold leading-snug text-[var(--text-primary)]">{a.title}</h3>
                  {a.description ? (
                    <p className="m-0 mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">{a.description}</p>
                  ) : null}
                </div>

                {a.certificateUrl && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={a.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D81B60] hover:underline"
                    >
                      <span>View Certificate</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}
