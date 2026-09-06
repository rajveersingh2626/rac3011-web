import { useState, useMemo } from 'react';
import type { FunctionComponent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles, Award, X } from 'lucide-react';
import { DISTRICT_SHOWCASE_PROJECTS } from '../../data/districtData';
import type { DistrictClub, ShowcaseProject } from '../../data/districtData';
import { fetchProjects } from '@/lib/publicApi/showcase';

// TODO(port): the source reads `badge` / `gallery` / `leadRotaractor` / `sdg` off the local
// showcase entries, but no entry in DISTRICT_SHOWCASE_PROJECTS has ever carried them (so the
// `||` fallbacks always win). Typed as optional to keep the reads exactly as the source has them.
type LocalShowcaseProject = ShowcaseProject & {
  badge?: string;
  gallery?: string[];
  leadRotaractor?: string;
  sdg?: string;
};

type DisplayProject = Omit<LocalShowcaseProject, 'slug'> & { slug?: string };

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

// Props are declared for the call site but, as in the source JSX, none are read.
const ClubInitiativesList: FunctionComponent<ClubInitiativesListProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [activeProjectModal, setActiveProjectModal] = useState<DisplayProject | null>(null);

  // Dynamic projects from PostgreSQL Database via API
  const projectsQuery = useQuery({
    queryKey: ['public', 'projects'],
    queryFn: () => fetchProjects({ pageSize: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  const allProjects = useMemo<DisplayProject[]>(() => {
    if (!projectsQuery.data?.items || projectsQuery.data.items.length === 0) {
      return DISTRICT_SHOWCASE_PROJECTS;
    }
    const dbProjects: DisplayProject[] = projectsQuery.data.items.map((p) => {
      const local: LocalShowcaseProject | undefined = DISTRICT_SHOWCASE_PROJECTS.find(
        (lp) => (lp.title || '').toLowerCase() === (p.title || '').toLowerCase() || lp.id === p.id
      );
      return {
        id: p.id,
        title: p.title || local?.title || 'Rotaract Initiative',
        clubName: p.leadClub?.name || local?.clubName || 'District 3011 Action Committee',
        zone: local?.zone || 'District 3011',
        category: p.category || local?.category || 'Community Service',
        date: p.date ? new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (local?.date || 'RY 2026-27'),
        summary: p.summary || local?.summary || '',
        body: local?.body || p.summary || '',
        metric: local?.metric || 'District Project',
        beneficiaries: local?.beneficiaries || '500+ Lives Touched',
        photo: p.photos?.[0] || local?.photo || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
        tags: local?.tags || [p.category || 'Initiative'],
        badge: local?.badge || 'District Project',
        gallery: p.photos && p.photos.length > 0 ? p.photos : (local?.gallery || []),
        leadRotaractor: local?.leadRotaractor || 'District Action Committee',
        sdg: local?.sdg || 'SDG 3: Good Health & Well-Being'
      };
    });

    const existingTitles = new Set(dbProjects.map((p) => p.title.toLowerCase()));
    const extraDefaults = DISTRICT_SHOWCASE_PROJECTS.filter((dp) => !existingTitles.has(dp.title.toLowerCase()));
    return [...dbProjects, ...extraDefaults];
  }, [projectsQuery.data]);

  const categories = [
    'All',
    'Disease Prevention & Treatment',
    'Environment',
    'Basic Education',
    'Vocational Services',
    'WASH',
    'Sports & Fellowship',
    'Community Service',
    'Maternal & Child Health',
    'Economic Development',
    'Peace & Conflict Resolution'
  ];

  const zones = ['All', 'Zone Prithvi', 'Zone Agni', 'Zone Vayu', 'Zone Akash'];

  const filteredProjects = allProjects.filter((proj) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q ||
      proj.title.toLowerCase().includes(q) ||
      proj.clubName.toLowerCase().includes(q) ||
      proj.summary.toLowerCase().includes(q) ||
      proj.category.toLowerCase().includes(q) ||
      proj.tags.some(t => t.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'All' || proj.category === selectedCategory;
    const matchesZone = selectedZone === 'All' || proj.zone === selectedZone;

    return matchesSearch && matchesCategory && matchesZone;
  });

  return (
    <div style={{ marginTop: '40px' }}>

      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', color: '#FFFFFF', padding: '8px 18px', borderRadius: '100px', fontSize: '0.86rem', fontWeight: 800 }}>
            {filteredProjects.length} Projects Displayed
          </span>
        </div>
      </div>

      {/* Controls: Search & Zone Filter */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(216, 27, 96, 0.15)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 320px', background: '#FDF5F8', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(216, 27, 96, 0.12)' }}>
          <Search size={18} style={{ color: 'var(--rotaract-pink)' }} />
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
              border: '1px solid rgba(216, 27, 96, 0.2)',
              backgroundColor: '#FFFFFF',
              color: 'var(--rotaract-pink)',
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
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '24px', scrollbarWidth: 'none' }}>
        {categories.map((cat) => {
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
                border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.25)',
                backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.12)',
                color: isSelected ? 'var(--rotaract-pink)' : '#FFFFFF',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(8px)',
                boxShadow: isSelected ? '0 4px 14px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Projects Grid (12 Projects) */}
      {filteredProjects.length === 0 ? (
        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <Sparkles size={48} style={{ color: 'var(--rotaract-pink)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No showcase projects match your filter
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 20px' }}>
            Try resetting your search query or selecting "All" categories to view all published district initiatives.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedZone('All'); }}
            className="btn-rotaract"
            style={{ padding: '10px 24px', fontSize: '0.88rem' }}
          >
            Reset Filters
          </button>
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
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden', backgroundColor: '#1A1D24' }}>
                <img
                  src={proj.photo}
                  alt={proj.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                />
                <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '8px' }}>
                  <span className="pill-pink" style={{ fontSize: '0.74rem', padding: '4px 12px', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(216, 27, 96, 0.92)' }}>
                    {proj.zone}
                  </span>
                </div>
                <div style={{ position: 'absolute', bottom: '14px', right: '14px' }}>
                  <span className="pill-gold" style={{ fontSize: '0.74rem', padding: '4px 12px', fontWeight: 800, backdropFilter: 'blur(10px)' }}>
                    {proj.metric}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--rotaract-pink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {proj.category}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {proj.date}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.28rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '8px' }}>
                    {proj.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: '#123499', marginBottom: '12px' }}>
                    <Award size={15} />
                    <span>{proj.clubName}</span>
                  </div>

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

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Beneficiaries: <strong style={{ color: 'var(--text-primary)' }}>{proj.beneficiaries}</strong>
                    </span>
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
            <div style={{ position: 'relative', height: '280px', backgroundColor: '#111' }}>
              <img
                src={activeProjectModal.photo}
                alt={activeProjectModal.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
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
                <span className="pill-pink" style={{ fontSize: '0.78rem' }}>{activeProjectModal.category}</span>
                <span className="pill-gold" style={{ fontSize: '0.78rem' }}>{activeProjectModal.zone}</span>
                <span style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '100px', backgroundColor: '#EFF6FF', color: '#1E40AF', fontWeight: 700 }}>
                  {activeProjectModal.metric}
                </span>
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '8px' }}>
                {activeProjectModal.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', color: '#123499', fontWeight: 800, marginBottom: '16px' }}>
                <Award size={18} />
                <span>Lead Club: {activeProjectModal.clubName}</span>
                <span>•</span>
                <span style={{ color: 'var(--text-secondary)' }}>{activeProjectModal.date}</span>
              </div>

              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                {activeProjectModal.summary}
              </p>

              <div style={{ background: '#FDF5F8', borderRadius: '16px', padding: '20px', borderLeft: '4px solid var(--rotaract-pink)', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.90rem', fontWeight: 800, color: 'var(--rotaract-pink)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Execution &amp; Impact
                </h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                  {activeProjectModal.body}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Total Impact Reach: <strong>{activeProjectModal.beneficiaries}</strong>
                </span>
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
