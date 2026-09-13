import { useState, useEffect, FC } from 'react';
import { 
  Users, Award, MapPin, Sparkles, Calendar, 
  FolderOpen, ArrowRight, Calculator,
  ShieldCheck,
  Search, FileText, LayoutDashboard, LogIn, ChevronRight
} from 'lucide-react';
import { useSurfaceHref } from '@/app/host';
import type { Achievement, FocusArea, ImpactMetric } from '../../data/districtData';

export interface MobileHomeExperienceProps {
  onNavigateDistrict?: (tab: string) => void;
  onNavigatePage?: (page: string, tab?: string) => void;
  onOpenLoginModal?: () => void;
  achievements?: Achievement[];
  focusAreas?: FocusArea[];
  impactMetrics?: ImpactMetric[];
}

const HERO_SLIDES = [
  {
    id: 'mob-slide-1',
    src: '/slideshow-yugarambh-sitting.webp',
    title: 'DAC 2026–27 Leadership Oath',
    subtitle: 'District Installation – "Yugarambh"'
  },
  {
    id: 'mob-slide-2',
    src: '/slideshow-yugarambh-standing.webp',
    title: 'United in Purpose: District Council',
    subtitle: '75 Clubs Across Delhi & NCR'
  },
  {
    id: 'mob-slide-3',
    src: '/slideshow-drr-speech.webp',
    title: 'DRR Archit Bhatia Address',
    subtitle: 'Vision for Fellowship & Grassroots Impact'
  },
  {
    id: 'mob-slide-4',
    src: '/slideshow-dg-speech.webp',
    title: 'Rotary Leadership Keynote',
    subtitle: 'DG Rtn. CA Ajeet Jalan Keynote'
  }
];

const FLAGSHIP_ITEMS = [
  {
    id: 'mission3011',
    surface: 'mission3011' as const,
    title: 'Mission 3011',
    category: 'Blood Donation',
    target: '3,011 Units Target',
    desc: 'District-wide blood donation campaign across all 4 zones.',
    color: '#D81B60',
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'drishti',
    surface: 'drishti' as const,
    title: 'Project Drishti',
    category: 'Vision Care',
    target: '100 Cataract Surgeries',
    desc: 'Combating avoidable blindness with screenings & free surgeries.',
    color: '#123499',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'rcl',
    surface: 'rcl' as const,
    title: 'Rotaract Cricket League',
    category: 'Sports & Fellowship',
    target: 'Inter-Club Championship',
    desc: 'Annual sports festival bringing clubs together on the pitch.',
    color: '#059669',
    image: '/rcl-cricket.webp'
  },
  {
    id: 'careerbridge',
    surface: 'careerbridge' as const,
    title: 'Career Bridge',
    category: 'Vocational Growth',
    target: 'Rotary Mentorship',
    desc: 'Connecting Rotarians with youth for corporate mentorship & jobs.',
    color: '#7C3AED',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
  }
];

const ZONES_DATA = [
  { id: 'prithvi', name: 'Zone Prithvi', clubs: 14, region: 'North & East Delhi', color: '#0284C7' },
  { id: 'agni', name: 'Zone Agni', clubs: 15, region: 'Central & West Delhi', color: '#EA580C' },
  { id: 'vayu', name: 'Zone Vayu', clubs: 13, region: 'South Delhi & Noida', color: '#16A34A' },
  { id: 'akash', name: 'Zone Akash', clubs: 12, region: 'Gurgaon & Faridabad', color: '#7C3AED' }
];

export const MobileHomeExperience: FC<MobileHomeExperienceProps> = ({
  onNavigateDistrict,
  onNavigatePage,
  onOpenLoginModal
}) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState('prithvi');
  const [contributionAmount, setContributionAmount] = useState(10000);

  const missionHref = useSurfaceHref('mission3011');
  const drishtiHref = useSurfaceHref('drishti');
  const rclHref = useSurfaceHref('rcl');
  const careerBridgeHref = useSurfaceHref('careerbridge');

  const surfaceHrefs: Record<string, string | undefined> = {
    mission3011: missionHref,
    drishti: drishtiHref,
    rcl: rclHref,
    careerbridge: careerBridgeHref
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    } else if (diff < -45) {
      setSlideIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }
    setTouchStartX(null);
  };

  const navigateTo = (tab: string) => {
    if (onNavigateDistrict) {
      onNavigateDistrict(tab);
    } else if (onNavigatePage) {
      onNavigatePage('district', tab);
    } else {
      window.location.href = `/district#${tab}`;
    }
  };

  const navigateToPage = (page: string, tab?: string) => {
    if (onNavigatePage) {
      onNavigatePage(page, tab);
    } else {
      window.location.href = tab ? `/${page}#${tab}` : `/${page}`;
    }
  };

  const handlePortalAction = (url: string) => {
    if (onOpenLoginModal && (url.includes('login') || url.includes('dashboard'))) {
      onOpenLoginModal();
    } else {
      window.location.href = url;
    }
  };

  const currentSlide = HERO_SLIDES[slideIdx];
  const activeZoneObj = ZONES_DATA.find((z) => z.id === selectedZone) || ZONES_DATA[0];

  // 3x3 Matrix Grid Items
  const MATRIX_3X3_ITEMS = [
    {
      id: 'm1-leadership',
      title: 'DAC Leadership',
      subtitle: 'Council 2026–27',
      icon: <Users size={22} color="#123499" />,
      badge: 'Team DRR',
      onClick: () => navigateTo('leadership')
    },
    {
      id: 'm2-heritage',
      title: 'Heritage Vault',
      subtitle: 'Past DRRs (1985–2026)',
      icon: <Award size={22} color="#C5A059" />,
      badge: '40+ Yrs',
      onClick: () => navigateTo('heritage')
    },
    {
      id: 'm3-zones',
      title: 'Zone Radar',
      subtitle: '4 Zones & 54 Clubs',
      icon: <MapPin size={22} color="#059669" />,
      badge: '54 Clubs',
      onClick: () => navigateTo('map-clubs')
    },
    {
      id: 'm4-awards',
      title: 'District Citations',
      subtitle: 'Awards & Honors',
      icon: <ShieldCheck size={22} color="#D81B60" />,
      badge: 'Merits',
      onClick: () => navigateToPage('achievements')
    },
    {
      id: 'm5-bylaws',
      title: 'District Bylaws',
      subtitle: 'Constitution & Rules',
      icon: <FolderOpen size={22} color="#7C3AED" />,
      badge: 'Official',
      onClick: () => navigateTo('resources')
    },
    {
      id: 'm6-directory',
      title: 'Club Directory',
      subtitle: 'Search All Clubs',
      icon: <Search size={22} color="#0284C7" />,
      badge: 'Verified',
      onClick: () => navigateToPage('directory')
    },
    {
      id: 'm7-calendar',
      title: 'Calendar & Dates',
      subtitle: 'Conclaves & Meets',
      icon: <Calendar size={22} color="#D97706" />,
      badge: 'Upcoming',
      onClick: () => navigateTo('calendar')
    },
    {
      id: 'm8-flagships',
      title: 'Flagship Projects',
      subtitle: 'District Campaigns',
      icon: <Sparkles size={22} color="#E11D48" />,
      badge: 'Active',
      onClick: () => navigateTo('initiatives')
    },
    {
      id: 'm9-portal',
      title: 'Portal Hub',
      subtitle: 'Reporting & Officer Access',
      icon: <LayoutDashboard size={22} color="#123499" />,
      badge: 'Access',
      onClick: () => handlePortalAction('/portal/dashboard')
    }
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        padding: '0 0 40px 0',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        backgroundColor: '#F8FAFC'
      }}
    >
      {/* ===================================================================
          1. HERO HEADER SECTION (Mobile)
         =================================================================== */}
      <div
        style={{
          position: 'relative',
          padding: '24px 16px 20px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #EEF2F9 100%)',
          borderBottom: '1px solid rgba(18, 52, 153, 0.08)'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EEF2FF', padding: '4px 12px', borderRadius: '100px', border: '1px solid rgba(18, 52, 153, 0.18)', marginBottom: '12px' }}>
          <Sparkles size={13} color="#123499" />
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#123499', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            ROTARACT DISTRICT 3011 • RY 2026-27
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.1rem, 9.4vw, 2.9rem)',
            fontWeight: 900,
            color: '#0F1218',
            lineHeight: 1.05,
            margin: '0 0 8px 0',
            letterSpacing: '-0.8px',
            textTransform: 'uppercase'
          }}
        >
          ROTARACT<br />DISTRICT 3011
        </h1>

        <p
          style={{
            fontSize: '0.90rem',
            color: '#475569',
            margin: '0 0 16px 0',
            lineHeight: 1.45,
            fontWeight: 500
          }}
        >
          Uniting 54 chartered clubs and young changemakers across Delhi NCR for grassroots humanitarian action.
        </p>

        {/* Hero Slideshow Card with Native Touch Swipe */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: '#0F1218',
            boxShadow: '0 12px 32px rgba(18, 52, 153, 0.14)',
            border: '1px solid rgba(18, 52, 153, 0.12)'
          }}
        >
          <img
            src={currentSlide.src}
            alt={currentSlide.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(15,18,24,0.1) 0%, rgba(15,18,24,0.4) 40%, rgba(15,18,24,0.92) 100%)'
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 2,
              background: 'rgba(15, 18, 24, 0.75)',
              backdropFilter: 'blur(10px)',
              padding: '4px 10px',
              borderRadius: '100px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}
          >
            DISTRICT MOMENTS
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              right: '14px',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              {currentSlide.title}
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '0.78rem', margin: 0 }}>
              {currentSlide.subtitle}
            </p>

            {/* Slide Dots */}
            <div style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  aria-label={`Slide ${i + 1}`}
                  style={{
                    width: i === slideIdx ? '20px' : '6px',
                    height: '5px',
                    borderRadius: '4px',
                    background: i === slideIdx ? '#FF4081' : 'rgba(255, 255, 255, 0.4)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. MAJOR MOVEMENT PORTAL ACCESS (High Prominence Mobile Action Center)
         =================================================================== */}
      <div style={{ padding: '16px 14px 0' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #0F1218 0%, #152238 60%, #1E293B 100%)',
            borderRadius: '20px',
            padding: '18px 16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
            border: '1.5px solid rgba(197, 160, 89, 0.45)',
            color: '#FFFFFF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(197, 160, 89, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FCD34D' }}>
                <LayoutDashboard size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#FCD34D', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  OFFICIAL ACCESS
                </span>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0, color: '#FFFFFF' }}>
                  District Portal &amp; Hub
                </h2>
              </div>
            </div>

            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: '100px', background: 'rgba(216, 27, 96, 0.3)', border: '1px solid rgba(216, 27, 96, 0.6)', color: '#FF80AB' }}>
              RY 2026-27
            </span>
          </div>

          <p style={{ fontSize: '0.80rem', color: 'rgba(255, 255, 255, 0.78)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
            Direct access for Club Presidents, Secretaries, DAC Directors, and District Rotaractors.
          </p>

          {/* Action Buttons with 44px+ Touch Ergonomics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handlePortalAction('/portal/login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '44px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #D81B60 0%, #C2185B 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(216, 27, 96, 0.35)'
              }}
            >
              <LogIn size={15} />
              <span>Portal Login</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalAction('/portal/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '44px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalAction('/portal/reports/new')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '44px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                color: '#FFFFFF',
                fontSize: '0.80rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <FileText size={15} />
              <span>Submit Report</span>
            </button>

            <button
              type="button"
              onClick={() => navigateToPage('directory')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '44px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                color: '#FFFFFF',
                fontSize: '0.80rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Search size={15} />
              <span>Club Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================
          3. PROMINENTLY PLACED DELHI NCR ZONE MAP & RADAR
         =================================================================== */}
      <div style={{ padding: '18px 14px 0' }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '18px 16px',
            border: '1.5px solid rgba(18, 52, 153, 0.12)',
            boxShadow: '0 8px 24px rgba(18, 52, 153, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#123499' }}>
                <MapPin size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#123499', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  DELHI NCR RADAR
                </span>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0, color: '#0F1218' }}>
                  Interactive Club Locator
                </h2>
              </div>
            </div>

            <span style={{ fontSize: '0.70rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#EEF2FF', color: '#123499' }}>
              54 CLUBS
            </span>
          </div>

          <p style={{ fontSize: '0.80rem', color: '#64748B', margin: '0 0 12px 0', lineHeight: 1.4 }}>
            Explore chartered Rotaract clubs and youth chapters organized across 4 Delhi NCR zones.
          </p>

          {/* Zone Selector Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {ZONES_DATA.map((z) => {
              const isSel = z.id === selectedZone;
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setSelectedZone(z.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: isSel ? `2px solid ${z.color}` : '1px solid rgba(0, 0, 0, 0.08)',
                    background: isSel ? `${z.color}14` : '#F8FAFC',
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isSel ? z.color : '#1E293B' }}>
                      {z.name}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: '#64748B' }}>
                      {z.region}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: isSel ? z.color : '#64748B' }}>
                    {z.clubs}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Zone Highlight & Launch Map Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F1F5F9', padding: '10px 12px', borderRadius: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: activeZoneObj.color }} />
              <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1E293B' }}>
                {activeZoneObj.name} • {activeZoneObj.region} ({activeZoneObj.clubs} Clubs)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('map-clubs')}
            style={{
              width: '100%',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: '#123499',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(18, 52, 153, 0.25)'
            }}
          >
            <span>Launch Full Interactive Map</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* ===================================================================
          4. 3x3 HERITAGE & LEADERSHIP GRID MATRIX (Mobile Matrix)
         =================================================================== */}
      <div style={{ padding: '20px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#123499', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              DISTRICT 3011 ECOSYSTEM
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#0F1218' }}>
              Leadership &amp; Heritage Matrix
            </h2>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '100px', background: '#EEF2FF', color: '#123499' }}>
            3x3 HUB
          </span>
        </div>

        {/* 3x3 Grid Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            width: '100%'
          }}
        >
          {MATRIX_3X3_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '12px 10px',
                borderRadius: '16px',
                background: '#FFFFFF',
                border: '1.5px solid rgba(18, 52, 153, 0.10)',
                boxShadow: '0 4px 12px rgba(18, 52, 153, 0.04)',
                minHeight: '104px',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '0.60rem', fontWeight: 800, color: '#64748B', background: '#F1F5F9', padding: '2px 5px', borderRadius: '4px' }}>
                  {item.badge}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F1218', lineHeight: 1.2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.64rem', color: '#64748B', marginTop: '2px', lineHeight: 1.2 }}>
                  {item.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================
          5. FLAGSHIP PROJECTS HORIZONTAL CAROUSEL STREAM
         =================================================================== */}
      <div style={{ padding: '24px 0 0 0' }}>
        <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#D81B60', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              DISTRICT CAMPAIGNS
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#0F1218' }}>
              Flagship Initiatives (RY 2026-27)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('initiatives')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#123499',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Horizontal Snap Scrolling Stream */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            gap: '12px',
            padding: '4px 14px 14px 14px'
          }}
        >
          {FLAGSHIP_ITEMS.map((proj) => {
            const href = surfaceHrefs[proj.surface];
            return (
              <a
                key={proj.id}
                href={href || '#'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  textDecoration: 'none',
                  color: '#FFFFFF',
                  position: 'relative',
                  width: '78vw',
                  maxWidth: '300px',
                  height: '240px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  scrollSnapAlign: 'start',
                  flexShrink: 0,
                  backgroundColor: '#0F1218',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                <img
                  src={proj.image}
                  alt={proj.title}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(15,18,24,0.1) 0%, rgba(15,18,24,0.5) 45%, rgba(15,18,24,0.95) 100%)'
                  }}
                />

                <div style={{ position: 'relative', zIndex: 2, padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', background: proj.color, padding: '2px 6px', borderRadius: '4px', color: '#FFF' }}>
                      {proj.category}
                    </span>
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', background: 'rgba(255,255,255,0.22)', padding: '2px 6px', borderRadius: '4px', color: '#FFF' }}>
                      {proj.target}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.10rem', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 0 0', lineHeight: 1.2 }}>
                    {proj.title}
                  </h3>

                  <p style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {proj.desc}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          6. DYNAMIC IMPACT CALCULATOR (Mobile Polished)
         =================================================================== */}
      <div style={{ padding: '12px 14px 0' }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '18px 16px',
            border: '1.5px solid rgba(18, 52, 153, 0.12)',
            boxShadow: '0 8px 24px rgba(18, 52, 153, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#123499' }}>
              <Calculator size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#123499', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                SOCIAL IMPACT
              </span>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0, color: '#0F1218' }}>
                Impact Calculator
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '12px 0 8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>
              Contribution Amount:
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#123499' }}>
              ₹{contributionAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(Number(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '6px',
              appearance: 'none',
              outline: 'none',
              cursor: 'pointer',
              marginBottom: '14px',
              background: `linear-gradient(to right, #123499 0%, #123499 ${((contributionAmount - 1000) / (50000 - 1000)) * 100}%, #E2E8F0 ${((contributionAmount - 1000) / (50000 - 1000)) * 100}%, #E2E8F0 100%)`
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#123499' }}>
                {Math.floor(contributionAmount / 500)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
                Pediatric Screenings
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#059669' }}>
                {Math.floor(contributionAmount / 150)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
                Saplings Planted
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHomeExperience;
