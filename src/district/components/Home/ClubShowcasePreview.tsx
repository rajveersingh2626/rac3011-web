import { useMemo } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Award, Sparkles } from 'lucide-react';
import { categoryLabelOf, fetchProjects } from '@/lib/publicApi/showcase';

const PREVIEW_COUNT = 3;

export interface ClubShowcasePreviewProps {
  onOpenShowcase?: () => void;
}

export default function ClubShowcasePreview({ onOpenShowcase }: ClubShowcasePreviewProps) {
  const projectsQuery = useQuery({
    queryKey: ['public', 'projects', 'home-preview'],
    queryFn: () => fetchProjects({ pageSize: PREVIEW_COUNT }),
    staleTime: 5 * 60 * 1000,
  });

  const projects = useMemo(() => {
    const items = projectsQuery.data?.items ?? [];
    return items.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title || 'Rotaract Initiative',
      clubName: p.leadClub?.name ?? null,
      categoryLabel: categoryLabelOf(p.category),
      date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      summary: p.summary || '',
    }));
  }, [projectsQuery.data]);

  // The page has no skeletons anywhere, so an unloaded or empty showcase shows no section at all.
  if (projects.length === 0) return null;

  const handleOpenShowcase = () => {
    if (onOpenShowcase) onOpenShowcase();
    else window.location.href = '/showcase';
  };

  return (
    <section className="snap-section" style={{ background: 'linear-gradient(180deg, #FDF8FA 0%, #FFFFFF 100%)', padding: '40px 24px' }}>
      <div className="section-content-animate" style={{ maxWidth: '1280px', width: '100%', position: 'relative', zIndex: 10 }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span className="pill-pink" style={{ marginBottom: '8px', fontSize: '0.88rem', padding: '6px 18px' }}>
            <Sparkles size={15} /> CLUB PROJECT SHOWCASE
          </span>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
            Projects Our Clubs Have Delivered
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', maxWidth: '720px', margin: '6px auto 0' }}>
            Project stories published by Rotaract clubs across District 3011.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {projects.map((proj) => {
            const body = (
              <>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--rotaract-pink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {proj.categoryLabel}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {proj.date}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.25 }}>
                    {proj.title}
                  </h3>

                  {proj.clubName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: '#123499', marginBottom: '10px' }}>
                      <Award size={15} style={{ flexShrink: 0 }} />
                      <span>{proj.clubName}</span>
                    </div>
                  )}

                  {proj.summary && (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      {proj.summary}
                    </p>
                  )}
                </div>

                {proj.slug && (
                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.80rem', fontWeight: 800, color: 'var(--rotaract-pink)' }}>
                      Read Project Story →
                    </span>
                  </div>
                )}
              </>
            );

            const cardStyle = {
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column' as const,
              justifyContent: 'space-between',
              borderTop: '4px solid var(--rotaract-pink)',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              textDecoration: 'none',
              color: 'inherit',
            };

            return proj.slug ? (
              <Link key={proj.id} to={`/showcase/${proj.slug}`} className="rotaract-card" style={cardStyle}>
                {body}
              </Link>
            ) : (
              <div key={proj.id} className="rotaract-card" style={cardStyle}>
                {body}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px' }}>
          <button type="button" className="btn-rotaract" onClick={handleOpenShowcase}>
            <Sparkles size={16} /> Open the Club Showcase
          </button>
        </div>

      </div>
    </section>
  );
}
