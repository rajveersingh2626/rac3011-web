import { useState, useMemo, useEffect } from 'react';
import type { FunctionComponent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles, Award, X, ChevronDown } from 'lucide-react';
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
  avenueOfService: string | null;
  areasOfFocus: string[];
  category: string;
  categoryLabel: string;
  date: string;
  rawDate: string;
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

const PAGE_SIZE = 12;

const MONTHS = [
  'All Months',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
];

const AVENUES_OF_SERVICE_LIST = [
  'Community Services',
  'Club Services',
  'International Services',
  'Vocational Services',
  'Youth Services',
] as const;

const AREAS_OF_FOCUS_LIST: [string, string][] = [
  ['Peacebuilding and Conflict Prevention', 'Peacebuilding & Conflict Prevention'],
  ['Disease Prevention and Treatment', 'Disease Prevention & Treatment'],
  ['Water, Sanitation, and Hygiene', 'Water, Sanitation & Hygiene'],
  ['Maternal and Child Health', 'Maternal & Child Health'],
  ['Basic Education and Literacy', 'Basic Education & Literacy'],
  ['Community Economic Development', 'Community Economic Development'],
  ['Environment', 'Environment'],
  ['Other', 'Other'],
  ['N/A', 'N/A'],
];

const ClubInitiativesList: FunctionComponent<ClubInitiativesListProps> = ({ clubs = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvenue, setSelectedAvenue] = useState('All');
  const [selectedAreaOfFocus, setSelectedAreaOfFocus] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeProjectModal, setActiveProjectModal] = useState<DisplayProject | null>(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedAvenue, selectedAreaOfFocus, selectedZone, selectedMonth]);

  const projectsQuery = useQuery({
    queryKey: ['public', 'projects'],
    queryFn: () => fetchProjects({ pageSize: 100 }),
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });

  // `body` and `beneficiaries` live only on the detail endpoint, so the modal enriches itself on open.
  const activeSlug = activeProjectModal?.slug;
  const projectDetailQuery = useQuery({
    queryKey: ['public', 'project', activeSlug],
    queryFn: () => fetchProject(activeSlug ?? ''),
    enabled: Boolean(activeSlug),
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });

  const zoneByClubName = useMemo(() => {
    const clean = (s: string) => s.toLowerCase().replace(/^(rotaract club of|rac)\s+/i, '').trim();
    const map = new Map<string, string>();
    for (const c of clubs) {
      if (c.zone) {
        map.set(c.id, c.zone);
        map.set(clean(c.name), c.zone);
      }
    }
    return map;
  }, [clubs]);

  const allProjects = useMemo<DisplayProject[]>(() => {
    const items = projectsQuery.data?.items ?? [];
    const clean = (s: string) => s.toLowerCase().replace(/^(rotaract club of|rac)\s+/i, '').trim();

    return items.map((p) => {
      const leadClubObj = p.leadClub as { id?: string; name?: string; slug?: string; zone?: string | null } | null;
      let zoneName = leadClubObj?.zone ?? null;
      if (!zoneName && leadClubObj?.name) {
        zoneName = zoneByClubName.get(clean(leadClubObj.name)) || (leadClubObj.id ? zoneByClubName.get(leadClubObj.id) : null) || null;
      }
      if (zoneName && !zoneName.toLowerCase().startsWith('zone')) {
        zoneName = `Zone ${zoneName}`;
      }

      const avenueOfService = p.avenueOfService || null;
      const areasOfFocus = (p.areasOfFocus && p.areasOfFocus.length > 0) ? p.areasOfFocus : (p.category ? [p.category] : []);
      const tags = [...areasOfFocus];

      return {
        id: p.id,
        slug: p.slug,
        title: p.title || 'Rotaract Initiative',
        clubName: p.leadClub?.name ?? null,
        zone: zoneName,
        avenueOfService,
        areasOfFocus,
        category: p.category,
        categoryLabel: avenueOfService || categoryLabelOf(p.category),
        date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rawDate: p.date,
        summary: p.summary || '',
        photo: p.photos?.[0] ?? null,
        tags,
      };
    });
  }, [projectsQuery.data, zoneByClubName]);

  const detailBeneficiaries = projectDetailQuery.data?.beneficiaries;
  const detailBody = projectDetailQuery.data?.body;

  const zones = ['All', 'Zone Prithvi', 'Zone Agni', 'Zone Vayu', 'Zone Akash'];

  const filteredProjects = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const normZone = (z: string) => z.toLowerCase().replace(/^zone\s+/i, '').trim();

    return allProjects.filter((proj) => {
      const matchesSearch = !q ||
        proj.title.toLowerCase().includes(q) ||
        (proj.clubName ?? '').toLowerCase().includes(q) ||
        proj.summary.toLowerCase().includes(q) ||
        (proj.avenueOfService ?? '').toLowerCase().includes(q) ||
        proj.areasOfFocus.some((f) => f.toLowerCase().includes(q)) ||
        proj.categoryLabel.toLowerCase().includes(q) ||
        proj.tags.some((t) => t.toLowerCase().includes(q));

      const matchesAvenue = selectedAvenue === 'All' || (() => {
        const selNorm = selectedAvenue.toLowerCase().replace(/services?$/i, '').trim();
        const aveNorm = (proj.avenueOfService ?? '').toLowerCase().replace(/services?$/i, '').trim();
        const catNorm = (proj.category ?? '').toLowerCase().replace(/services?$/i, '').trim();
        return aveNorm.includes(selNorm) || catNorm.includes(selNorm) || proj.avenueOfService === selectedAvenue;
      })();

      const matchesAreaOfFocus = selectedAreaOfFocus === 'All' || (() => {
        const selNorm = selectedAreaOfFocus.toLowerCase();
        const matchesFocusArray = proj.areasOfFocus.some((f) => {
          const fNorm = f.toLowerCase();
          return fNorm.includes(selNorm) || selNorm.includes(fNorm);
        });
        const matchesCat = (proj.category ?? '').toLowerCase().includes(selNorm) || selNorm.includes((proj.category ?? '').toLowerCase());
        return matchesFocusArray || matchesCat;
      })();

      const matchesZone = selectedZone === 'All' || (() => {
        if (!proj.zone) return false;
        const pz = proj.zone.toLowerCase();
        const sz = normZone(selectedZone);
        if (pz.includes(sz)) return true;
        if (sz === 'prithvi' && (pz.includes('1') || pz.includes('5') || pz.includes('south'))) return true;
        if (sz === 'agni' && (pz.includes('2') || pz.includes('6') || pz.includes('central') || pz.includes('faridabad'))) return true;
        if (sz === 'vayu' && (pz.includes('3') || pz.includes('7') || pz.includes('north') || pz.includes('gurugram'))) return true;
        if (sz === 'akash' && (pz.includes('4') || pz.includes('8') || pz.includes('west'))) return true;
        return normZone(proj.zone) === sz;
      })();

      let matchesMonth = true;
      if (selectedMonth !== 'All Months' && proj.rawDate) {
        const cleanDate = proj.rawDate.split('T')[0];
        const parts = cleanDate.split('-');
        let projMonth = '';
        if (parts.length === 3) {
          const mIdx = parseInt(parts[1], 10) - 1;
          const allM = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          if (mIdx >= 0 && mIdx < 12) projMonth = allM[mIdx];
        }
        if (!projMonth) {
          projMonth = new Date(proj.rawDate).toLocaleDateString('en-US', { month: 'long' });
        }
        matchesMonth = projMonth.toLowerCase() === selectedMonth.toLowerCase();
      }

      return matchesSearch && matchesAvenue && matchesAreaOfFocus && matchesZone && matchesMonth;
    });
  }, [allProjects, searchTerm, selectedAvenue, selectedAreaOfFocus, selectedZone, selectedMonth]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    selectedAvenue !== 'All' ||
    selectedAreaOfFocus !== 'All' ||
    selectedZone !== 'All' ||
    selectedMonth !== 'All Months'
  );

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedAvenue('All');
    setSelectedAreaOfFocus('All');
    setSelectedZone('All');
    setSelectedMonth('All Months');
  };

  const visibleProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleCount);
  }, [filteredProjects, visibleCount]);

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
        padding: isMobile ? '20px 16px' : '30px',
        boxShadow: '0 18px 45px rgba(18, 52, 153, 0.26)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 92% 18%, rgba(255,255,255,0.18), transparent 28%)', pointerEvents: 'none' }} />
        <div>
          <span className="pill-gold" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: isMobile ? '0.74rem' : '0.82rem', whiteSpace: 'nowrap' }}>
            <Sparkles size={14} /> {isMobile ? 'DISTRICT SHOWCASE (RY 2026-27)' : 'ROTARACT DISTRICT SHOWCASE (RY 2026-27)'}
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
            {filteredProjects.length} Projects Available
          </span>
        </div>
      </div>

      {/* Controls: Search, Avenues, Areas of Focus, Zone & Month Filter */}
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
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 14px 35px rgba(18, 52, 153, 0.16)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px', background: 'rgba(255,255,255,0.72)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(18, 52, 153, 0.14)' }}>
          <Search size={18} style={{ color: '#123499' }} />
          <input
            type="text"
            placeholder="Search projects, clubs, causes, or keywords..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(18, 52, 153, 0.2)',
                backgroundColor: '#FFFFFF',
                color: '#123499',
                fontWeight: 700,
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {MONTHS.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(18, 52, 153, 0.2)',
                backgroundColor: '#FFFFFF',
                color: '#123499',
                fontWeight: 700,
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {zones.map((z, idx) => (
                <option key={idx} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(225, 29, 72, 0.2)',
                backgroundColor: '#FFF1F2',
                color: '#E11D48',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Avenues of Service Pill Bar */}
      <div style={{ padding: '0 16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#123499' }}>
            Avenues of Service
          </span>
          <span style={{ height: '1px', flex: 1, background: 'rgba(18, 52, 153, 0.12)' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedAvenue('All')}
            style={{
              padding: '7px 16px',
              borderRadius: '100px',
              fontSize: '0.80rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: selectedAvenue === 'All' ? '1px solid #123499' : '1px solid rgba(18, 52, 153, 0.16)',
              backgroundColor: selectedAvenue === 'All' ? '#123499' : '#FFFFFF',
              color: selectedAvenue === 'All' ? '#FFFFFF' : '#123499',
              transition: 'all 0.2s ease',
              boxShadow: selectedAvenue === 'All' ? '0 4px 14px rgba(18, 52, 153, 0.25)' : 'none'
            }}
          >
            All Avenues
          </button>
          {AVENUES_OF_SERVICE_LIST.map((ave) => {
            const isSelected = selectedAvenue === ave;
            return (
              <button
                key={ave}
                onClick={() => setSelectedAvenue(isSelected ? 'All' : ave)}
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
                  boxShadow: isSelected ? '0 4px 14px rgba(18, 52, 153, 0.25)' : 'none'
                }}
              >
                {ave}
              </button>
            );
          })}
        </div>
      </div>

      {/* Areas of Focus Pill Bar */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0C2470' }}>
            Rotary Areas of Focus
          </span>
          <span style={{ height: '1px', flex: 1, background: 'rgba(12, 36, 112, 0.12)' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedAreaOfFocus('All')}
            style={{
              padding: '6px 14px',
              borderRadius: '100px',
              fontSize: '0.78rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border: selectedAreaOfFocus === 'All' ? '1px solid #0C2470' : '1px solid rgba(12, 36, 112, 0.16)',
              backgroundColor: selectedAreaOfFocus === 'All' ? '#0C2470' : '#FFFFFF',
              color: selectedAreaOfFocus === 'All' ? '#FFFFFF' : '#0C2470',
              transition: 'all 0.2s ease',
              boxShadow: selectedAreaOfFocus === 'All' ? '0 4px 14px rgba(12, 36, 112, 0.25)' : 'none'
            }}
          >
            All Focus Areas
          </button>
          {AREAS_OF_FOCUS_LIST.map(([key, label]) => {
            const isSelected = selectedAreaOfFocus === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedAreaOfFocus(isSelected ? 'All' : key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #0C2470' : '1px solid rgba(12, 36, 112, 0.16)',
                  backgroundColor: isSelected ? '#0C2470' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#0C2470',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 14px rgba(12, 36, 112, 0.25)' : 'none'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <Sparkles size={48} style={{ color: 'var(--rotaract-pink)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {allProjects.length === 0 ? 'No published projects to show yet' : 'No showcase projects match your filter'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 20px' }}>
            {allProjects.length === 0
              ? 'Project stories appear here once clubs publish them to the district showcase.'
              : 'Try resetting your search query or selecting "All" to view all published district initiatives.'}
          </p>
          {allProjects.length > 0 && (
            <button
              onClick={resetAllFilters}
              className="btn-rotaract"
              style={{ padding: '10px 24px', fontSize: '0.88rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
            {visibleProjects.map((proj) => (
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
                  border: '1px solid rgba(216, 27, 96, 0.12)',
                  contain: 'content'
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
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.initiative-fallback');
                        if (fallback instanceof HTMLElement) fallback.style.display = 'flex';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                    />
                  ) : null}
                  <div
                    className="initiative-fallback"
                    style={{
                      display: proj.photo ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Sparkles size={40} style={{ color: 'rgba(255,255,255,0.35)' }} />
                  </div>
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

          {/* Progressive Load More */}
          {filteredProjects.length > visibleCount && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="btn-rotaract"
                style={{
                  padding: '14px 32px',
                  fontSize: '0.94rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(216, 27, 96, 0.28)'
                }}
              >
                <span>Load More Initiatives ({filteredProjects.length - visibleCount} remaining)</span>
                <ChevronDown size={18} />
              </button>
            </div>
          )}
        </>
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
                  loading="lazy"
                  decoding="async"
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
                {activeProjectModal.avenueOfService && (
                  <span className="pill-pink" style={{ fontSize: '0.78rem' }}>{activeProjectModal.avenueOfService}</span>
                )}
                {activeProjectModal.areasOfFocus && activeProjectModal.areasOfFocus.map((f, i) => (
                  <span key={i} className="pill-gold" style={{ fontSize: '0.74rem' }}>{f}</span>
                ))}
                {activeProjectModal.zone && (
                  <span className="pill-gold" style={{ fontSize: '0.74rem' }}>{activeProjectModal.zone}</span>
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
