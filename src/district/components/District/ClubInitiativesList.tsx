import { useState, useMemo } from 'react';
import type { FunctionComponent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles, Award, X } from 'lucide-react';
import type { DistrictClub } from '../../data/districtData';
import { categoryLabelOf, fetchProject, fetchProjects } from '@/lib/publicApi/showcase';

// Every field here is served by the projects API. Nothing is substituted when the API
// omits a value: an absent figure renders as no figure, never as a placeholder number.
interface DisplayProject {
  id: string;
  slug: string | null;
  title: string;
  clubName: string | null;
  zone: string | null;
  category: string;
  categoryLabel: string;
  date: string;
  summary: string;
  photo: string | null;
  tags: string[];
}

interface ClubInitiativesListProps {
  clubs?: DistrictClub[];
  selectedClubId?: string | null;
  onSelectClub?: (clubId: string | null) => void;
  // Passed by DistrictAccess but unused by this component (as in the source JSX).
  isLoggedIn?: unknown;
  userRole?: unknown;
  onOpenLoginModal?: unknown;
  onOpenPostInitiativeModal?: unknown;
}

const ClubInitiativesList: FunctionComponent<ClubInitiativesListProps> = ({ clubs = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [activeProjectModal, setActiveProjectModal] = useState<DisplayProject | null>(null);

  const projectsQuery = useQuery({
    queryKey: ['public', 'projects'],
    queryFn: () => fetchProjects({ pageSize: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  // `body` and `beneficiaries` live only on the detail endpoint, so the modal enriches itself on open.
  const activeSlug = activeProjectModal?.slug;
  const projectDetailQuery = useQuery({
    queryKey: ['public', 'project', activeSlug],
    queryFn: () => fetchProject(activeSlug ?? ''),
    enabled: Boolean(activeSlug),
    staleTime: 5 * 60 * 1000,
  });

  const zoneByClubId = useMemo(() => {
    return new Map(clubs.map((c) => [c.id, c.zone]));
  }, [clubs]);

  const allProjects = useMemo<DisplayProject[]>(() => {
    const items = projectsQuery.data?.items ?? [];
    return items.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title || 'Rotaract Initiative',
      clubName: p.leadClub?.name ?? null,
      zone: (p.leadClub && zoneByClubId.get(p.leadClub.id)) || null,
      category: p.category,
      categoryLabel: categoryLabelOf(p.category),
      date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      summary: p.summary || '',
      photo: p.photos?.[0] ?? null,
      tags: [categoryLabelOf(p.category)],
    }));
  }, [projectsQuery.data, zoneByClubId]);

  const detailBeneficiaries = projectDetailQuery.data?.beneficiaries;
  const detailBody = projectDetailQuery.data?.body;

  // Chips are built from the categories the API actually returns, so no chip implies
  // a category of work the district has not published.
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of allProjects) seen.set(p.category, p.categoryLabel);
    return [['All', 'All'] as [string, string], ...[...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]))];
  }, [allProjects]);

  const zones = ['All', 'Zone Prithvi', 'Zone Agni', 'Zone Vayu', 'Zone Akash'];

  const filteredProjects = allProjects.filter((proj) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q ||
      proj.title.toLowerCase().includes(q) ||
      (proj.clubName ?? '').toLowerCase().includes(q) ||
      proj.summary.toLowerCase().includes(q) ||
      proj.categoryLabel.toLowerCase().includes(q) ||
      proj.tags.some(t => t.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'All' || proj.category === selectedCategory;
    const matchesZone = selectedZone === 'All' || proj.zone === selectedZone;

    return matchesSearch && matchesCategory && matchesZone;
  });

  return (
    <div style={{ marginTop: '40px' }}>

      {/* Header Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
        marginBottom: '18px',
        background: 'linear-gradient(135deg, #123499 0%, #0C2470 100%)',
        borderRadius: '22px',
        padding: '30px',
        boxShadow: '0 18px 45px rgba(18, 52, 153, 0.26)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 92% 18%, rgba(255,255,255,0.18), transparent 28%)', pointerEvents: 'none' }} />
        <div>
          <span className="pill-gold" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} /> ROTARACT DISTRICT SHOWCASE (RY 2026-27)
          </span>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-1px' }}>
            Rotaract Showcase &amp; Featured Projects
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: '1rem', marginTop: '8px', maxWidth: '780px', lineHeight: 1.5, fontWeight: 500 }}>
            High-impact community service, healthcare, vocational excellence, and international fellowship projects led by Rotaract clubs across District 3011.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', color: '#FFFFFF', padding: '8px 18px', borderRadius: '100px', fontSize: '0.86rem', fontWeight: 800 }}>
            {filteredProjects.length} Projects Displayed
          </span>
        </div>
      </div>

      {/* Controls: Search & Zone Filter */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255, 255, 255, 0.68)',
          borderRadius: '16px',
          padding: '16px 20px',
          margin: '-8px 16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 14px 35px rgba(18, 52, 153, 0.16)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 320px', background: 'rgba(255,255,255,0.72)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(18, 52, 153, 0.14)' }}>
          <Search size={18} style={{ color: '#123499' }} />
          <input
            type="text"
            placeholder="Search by project name, club, cause, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.92rem',
              color: 'var(--text-primary)',
              fontWeight: 500
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Filter Zone:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(18, 52, 153, 0.2)',
              backgroundColor: '#FFFFFF',
              color: '#123499',
              fontWeight: 700,
              fontSize: '0.88rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {zones.map((z, idx) => (
              <option key={idx} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Chips Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 14px', marginBottom: '24px', scrollbarWidth: 'none' }}>
        {categories.map(([cat, label]) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '7px 16px',
                borderRadius: '100px',
                fontSize: '0.80rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: isSelected ? '1px solid #123499' : '1px solid rgba(18, 52, 153, 0.16)',
                backgroundColor: isSelected ? '#123499' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#123499',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(8px)',
                boxShadow: isSelected ? '0 4px 14px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Projects Grid (12 Projects) */}
      {filteredProjects.length === 0 ? (
        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <Sparkles size={48} style={{ color: 'var(--rotaract-pink)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {allProjects.length === 0 ? 'No published projects to show yet' : 'No showcase projects match your filter'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 20px' }}>
            {allProjects.length === 0
              ? 'Project stories appear here once clubs publish them to the district showcase.'
              : 'Try resetting your search query or selecting "All" categories to view all published district initiatives.'}
          </p>
          {allProjects.length > 0 && (
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedZone('All'); }}
              className="btn-rotaract"
              style={{ padding: '10px 24px', fontSize: '0.88rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="rotaract-card"
              onClick={() => setActiveProjectModal(proj)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease',
                border: '1px solid rgba(216, 27, 96, 0.12)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 45px rgba(216, 27, 96, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
              }}
            >
              {/* Project Image */}
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden', backgroundColor: '#1A1D24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {proj.photo ? (
                  <img
                    src={proj.photo}
                    alt={proj.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                  />
                ) : (
                  <Sparkles size={40} style={{ color: 'rgba(255,255,255,0.35)' }} />
                )}
                {proj.zone && (
                  <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '8px' }}>
                    <span className="pill-pink" style={{ fontSize: '0.74rem', padding: '4px 12px', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(216, 27, 96, 0.92)' }}>
                      {proj.zone}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--rotaract-pink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {proj.categoryLabel}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {proj.date}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.28rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '8px' }}>
                    {proj.title}
                  </h3>

                  {proj.clubName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: '#123499', marginBottom: '12px' }}>
                      <Award size={15} />
                      <span>{proj.clubName}</span>
                    </div>
                  )}

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                    {proj.summary}
                  </p>
                </div>

                {/* Tags & Action */}
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {proj.tags.map((t, idx) => (
                      <span key={idx} style={{ fontSize: '0.72rem', backgroundColor: '#FDF5F8', color: 'var(--rotaract-pink)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.80rem', fontWeight: 800, color: 'var(--rotaract-pink)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Read Project Story →
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {activeProjectModal && (
        <div
          onClick={() => setActiveProjectModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 30px 90px rgba(0,0,0,0.4)',
              position: 'relative',
              animation: 'fadeInScale 0.3s ease'
            }}
          >
            <div style={{ position: 'relative', height: '280px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeProjectModal.photo && (
                <img
                  src={activeProjectModal.photo}
                  alt={activeProjectModal.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              <button
                onClick={() => setActiveProjectModal(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '30px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <span className="pill-pink" style={{ fontSize: '0.78rem' }}>{activeProjectModal.categoryLabel}</span>
                {activeProjectModal.zone && (
                  <span className="pill-gold" style={{ fontSize: '0.78rem' }}>{activeProjectModal.zone}</span>
                )}
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '8px' }}>
                {activeProjectModal.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', color: '#123499', fontWeight: 800, marginBottom: '16px' }}>
                <Award size={18} />
                {activeProjectModal.clubName && (
                  <>
                    <span>Lead Club: {activeProjectModal.clubName}</span>
                    <span>•</span>
                  </>
                )}
                <span style={{ color: 'var(--text-secondary)' }}>{activeProjectModal.date}</span>
              </div>

              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                {activeProjectModal.summary}
              </p>

              {detailBody && (
                <div style={{ background: '#FDF5F8', borderRadius: '16px', padding: '20px', borderLeft: '4px solid var(--rotaract-pink)', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.90rem', fontWeight: 800, color: 'var(--rotaract-pink)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Execution &amp; Impact
                  </h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                    {detailBody}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                {typeof detailBeneficiaries === 'number' ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Total Impact Reach: <strong>{detailBeneficiaries.toLocaleString()}</strong>
                  </span>
                ) : <span />}
                <button
                  onClick={() => setActiveProjectModal(null)}
                  className="btn-rotaract"
                  style={{ padding: '10px 22px', fontSize: '0.88rem' }}
                >
                  Close Showcase
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ClubInitiativesList;
