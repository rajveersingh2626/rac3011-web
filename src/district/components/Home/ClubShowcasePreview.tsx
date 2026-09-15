import { useMemo } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Calendar, Award } from 'lucide-react';
import { fetchProjects } from '@/lib/publicApi/showcase';

const PREVIEW_COUNT = 6;

export interface ClubShowcasePreviewProps {
  onOpenShowcase?: () => void;
}

export default function ClubShowcasePreview({ onOpenShowcase }: ClubShowcasePreviewProps) {
  const projectsQuery = useQuery({
    queryKey: ['public', 'projects', 'home-preview'],
    queryFn: () => fetchProjects({ pageSize: PREVIEW_COUNT }),
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });

  const projects = useMemo(() => {
    const items = projectsQuery.data?.items ?? [];
    return [...items]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title || 'Rotaract Initiative',
        clubName: p.leadClub?.name ?? null,
        photo: p.photos && p.photos.length > 0 ? p.photos[0] : null,
        date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }));
  }, [projectsQuery.data]);

  // The page has no skeletons anywhere, so an unloaded or empty showcase shows no section at all.
  if (projects.length === 0) return null;

  const handleOpenShowcase = () => {
    if (onOpenShowcase) onOpenShowcase();
    else window.location.href = '/showcase';
  };

  return (
    <section className="snap-section" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)', padding: '40px 24px' }}>
      <div className="section-content-animate" style={{ maxWidth: '1280px', width: '100%', position: 'relative', zIndex: 10 }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span className="pill-gold" style={{ marginBottom: '8px', fontSize: '0.88rem', padding: '6px 18px', background: '#EEF1FA', color: '#123499', border: '1px solid rgba(18, 52, 153, 0.2)' }}>
            <Sparkles size={15} /> CLUB PROJECT SHOWCASE
          </span>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
            Projects Our Clubs Have Delivered
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', maxWidth: '720px', margin: '6px auto 0' }}>
            Latest project stories published by Rotaract clubs across District 3011.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {projects.map((proj) => {
            const body = (
              <>
                {/* 1. Project Image */}
                <div style={{ width: '100%', height: '200px', position: 'relative', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                  {proj.photo ? (
                    <img
                      src={proj.photo}
                      alt={proj.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      loading="lazy"
                      onError={(e) => {
                        // Fallback on broken image link
                        (e.currentTarget.parentNode as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #123499 0%, #0C2470 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        gap: '8px',
                      }}
                    >
                      <Sparkles size={28} style={{ opacity: 0.8 }} />
                      <span style={{ fontSize: '0.80rem', fontWeight: 700, letterSpacing: '0.5px' }}>District 3011 Project</span>
                    </div>
                  )}
                </div>

                {/* 2. Content: Title, Club Name, Date */}
                <div style={{ padding: '20px 20px 22px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    {/* Title */}
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.3 }}>
                      {proj.title}
                    </h3>

                    {/* Club Name */}
                    {proj.clubName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 700, color: '#123499', marginBottom: '8px' }}>
                        <Award size={15} style={{ flexShrink: 0 }} />
                        <span>{proj.clubName}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <Calendar size={13} style={{ flexShrink: 0 }} />
                    <span>{proj.date}</span>
                  </div>
                </div>
              </>
            );

            const cardStyle = {
              display: 'flex',
              flexDirection: 'column' as const,
              background: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(18, 52, 153, 0.07)',
              border: '1px solid rgba(18, 52, 153, 0.12)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            };

            return proj.slug ? (
              <Link key={proj.id} to={`/showcase/${proj.slug}`} className="rotaract-card hover:shadow-lg transition-all" style={cardStyle}>
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
