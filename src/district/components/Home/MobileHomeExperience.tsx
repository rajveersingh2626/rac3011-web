import { useState, useEffect, useMemo, FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Award, MapPin, Sparkles, Calendar, 
  FolderOpen, ArrowRight, Calculator,
  ShieldCheck, ChevronLeft, ChevronRight,
  Search, FileText, LayoutDashboard, LogIn, Compass
} from 'lucide-react';
import { useSurfaceHref } from '@/app/host';
import { fetchClubs } from '@/lib/publicApi/clubs';
import { fetchZones } from '@/lib/publicApi/zones';
import { fetchDistrictTeam } from '@/lib/publicApi/leadership';
import { fetchPastDrrs } from '@/lib/publicApi/heritage';
import { fetchAchievements } from '@/lib/publicApi/achievements';
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
    subtitle: 'District Installation Ceremony – "Yugarambh"'
  },
  {
    id: 'mob-slide-2',
    src: '/slideshow-yugarambh-standing.webp',
    title: 'United in Purpose: District Council',
    subtitle: '75 Rotaract Clubs Uniting Across Delhi & NCR'
  },
  {
    id: 'mob-slide-3',
    src: '/slideshow-drr-speech.webp',
    title: 'DRR Archit Bhatia Address',
    subtitle: 'Setting the Vision for Fellowship, Service & Grassroots Impact'
  },
  {
    id: 'mob-slide-4',
    src: '/slideshow-dg-speech.webp',
    title: 'Rotary Leadership Keynote',
    subtitle: 'DG Rtn. CA Ajeet Jalan Keynote to District 3011'
  },
  {
    id: 'mob-slide-5',
    src: '/slideshow-team-hall.webp',
    title: 'The Rotaract Family Assembly',
    subtitle: 'Empowering Changemakers & Future Community Leaders'
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

const DEFAULT_ZONES_CONFIG = [
  { id: 'prithvi', name: 'Zone Prithvi', defaultCount: 14, region: 'North & East Delhi', color: '#0284C7' },
  { id: 'agni', name: 'Zone Agni', defaultCount: 15, region: 'Central & West Delhi', color: '#EA580C' },
  { id: 'vayu', name: 'Zone Vayu', defaultCount: 13, region: 'South Delhi & Noida', color: '#16A34A' },
  { id: 'akash', name: 'Zone Akash', defaultCount: 12, region: 'Gurgaon & Faridabad', color: '#7C3AED' }
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

  // Dynamic Live Queries (cached and synchronized with portal updates)
  const clubsQuery = useQuery({
    queryKey: ['public', 'clubs'],
    queryFn: () => fetchClubs(),
    staleTime: 60 * 1000,
  });

  const zonesQuery = useQuery({
    queryKey: ['public', 'zones'],
    queryFn: fetchZones,
    staleTime: 60 * 1000,
  });

  const teamQuery = useQuery({
    queryKey: ['public', 'district-team'],
    queryFn: fetchDistrictTeam,
    staleTime: 60 * 1000,
  });

  const pastDrrsQuery = useQuery({
    queryKey: ['public', 'past-drrs'],
    queryFn: fetchPastDrrs,
    staleTime: 60 * 1000,
  });

  const achievementsQuery = useQuery({
    queryKey: ['public', 'achievements'],
    queryFn: fetchAchievements,
    staleTime: 60 * 1000,
  });

  const totalClubs = clubsQuery.data?.items?.length || 54;
  const totalLeaders = teamQuery.data?.items?.length || 50;
  const totalPastDrrs = pastDrrsQuery.data?.items?.length || 40;
  const totalAchievements = achievementsQuery.data?.items?.length || 6;

  // Dynamic zone data computation from live API clubs & zones
  const zonesData = useMemo(() => {
    const clubs = clubsQuery.data?.items || [];
    return DEFAULT_ZONES_CONFIG.map((z) => {
      const liveMatching = clubs.filter((c: any) => {
        const zoneStr = ((c.zoneName as string) || (c.zoneId as string) || (c.zone as string) || '').toLowerCase();
        return zoneStr.includes(z.id) || zoneStr.includes(z.name.toLowerCase().replace('zone ', ''));
      });
      return {
        id: z.id,
        name: z.name,
        region: z.region,
        color: z.color,
        clubs: liveMatching.length > 0 ? liveMatching.length : z.defaultCount,
      };
    });
  }, [clubsQuery.data, zonesQuery.data]);

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
    if (diff > 40) {
      setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    } else if (diff < -40) {
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
  const activeZoneObj = zonesData.find((z) => z.id === selectedZone) || zonesData[0];

  // Secondary Quick District Navigation Cards
  const SECONDARY_DISTRICT_CARDS = [
    {
      id: 'sec-map',
      title: 'Zone Radar',
      subtitle: `4 Zones • ${totalClubs} Clubs`,
      icon: <Compass size={20} color="#0284C7" />,
      badge: `${totalClubs} Clubs`,
      onClick: () => navigateTo('map-clubs')
    },
    {
      id: 'sec-citations',
      title: 'District Citations',
      subtitle: 'Merits & Milestones',
      icon: <ShieldCheck size={20} color="#D81B60" />,
      badge: `${totalAchievements} Honors`,
      onClick: () => navigateToPage('achievements')
    },
    {
      id: 'sec-directory',
      title: 'Club Directory',
      subtitle: 'Search All Clubs',
      icon: <Search size={20} color="#059669" />,
      badge: 'Verified',
      onClick: () => navigateToPage('directory')
    },
    {
      id: 'sec-calendar',
      title: 'Official Calendar',
      subtitle: 'Conclaves & Meets',
      icon: <Calendar size={20} color="#D97706" />,
      badge: 'RY 26-27',
      onClick: () => navigateTo('calendar')
    },
    {
      id: 'sec-bylaws',
      title: 'Bylaws & Vault',
      subtitle: 'Governance & Rules',
      icon: <FolderOpen size={20} color="#7C3AED" />,
      badge: 'Official',
      onClick: () => navigateTo('resources')
    },
    {
      id: 'sec-flagships',
      title: 'Social Initiatives',
      subtitle: 'District Campaigns',
      icon: <Sparkles size={20} color="#E11D48" />,
      badge: 'Active',
      onClick: () => navigateTo('initiatives')
    }
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        padding: '0 0 60px 0',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        backgroundColor: '#F8FAFC'
      }}
    >
      {/* ===================================================================
          1. HERO HEADER SECTION WITH RESILIENT CAROUSEL
         =================================================================== */}
      <div
        style={{
          position: 'relative',
          padding: '20px 14px 18px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #EEF2F9 100%)',
          borderBottom: '1px solid rgba(18, 52, 153, 0.08)'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EEF2FF', padding: '4px 12px', borderRadius: '100px', border: '1px solid rgba(18, 52, 153, 0.18)', marginBottom: '10px' }}>
          <Sparkles size={13} color="#123499" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#123499', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            ROTARACT DISTRICT 3011 • RY 2026-27
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.0rem, 8.8vw, 2.7rem)',
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
            fontSize: '0.88rem',
            color: '#475569',
            margin: '0 0 14px 0',
            lineHeight: 1.45,
            fontWeight: 500
          }}
        >
          Uniting {totalClubs} chartered clubs and young changemakers across Delhi NCR for grassroots humanitarian action.
        </p>

        {/* Hero Slideshow Card with Fluid Proportions and Native Swipe */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative',
            width: '100%',
            height: '250px',
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: '#0F1218',
            boxShadow: '0 14px 34px rgba(18, 52, 153, 0.16)',
            border: '1.5px solid rgba(18, 52, 153, 0.14)',
            boxSizing: 'border-box'
          }}
        >
          {HERO_SLIDES.map((slide, idx) => (
            <img
              key={slide.id}
              src={slide.src}
              alt={slide.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: idx === slideIdx ? 1 : 0,
                transform: idx === slideIdx ? 'scale(1)' : 'scale(1.04)',
                transition: 'opacity 0.6s ease, transform 0.6s ease'
              }}
            />
          ))}

          {/* Vignette Shadow Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(15,18,24,0.15) 0%, rgba(15,18,24,0.45) 45%, rgba(15,18,24,0.94) 100%)'
            }}
          />

          {/* Top Tag & Prev/Next Mini Controls */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div
              style={{
                background: 'rgba(15, 18, 24, 0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                padding: '4px 10px',
                borderRadius: '100px',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                color: '#FF4081',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textTransform: 'uppercase'
              }}
            >
              <Sparkles size={11} /> DISTRICT MOMENTS
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setSlideIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                aria-label="Previous slide"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'rgba(15, 18, 24, 0.7)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)}
                aria-label="Next slide"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'rgba(15, 18, 24, 0.7)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Bottom Captions and Non-Distorted Slide Dots */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <h3 style={{ color: '#FFFFFF', fontSize: '1.02rem', fontWeight: 800, margin: 0, lineHeight: 1.25 }}>
              {currentSlide.title}
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.76rem', margin: 0, fontWeight: 500, lineHeight: 1.3 }}>
              {currentSlide.subtitle}
            </p>

            {/* Crisp Pill Indicators (Zero Distortion) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlideIdx(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  style={{
                    width: i === slideIdx ? '22px' : '6px',
                    height: '6px',
                    minWidth: '6px',
                    minHeight: '6px',
                    borderRadius: '100px',
                    backgroundColor: i === slideIdx ? '#FF4081' : 'rgba(255, 255, 255, 0.4)',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: i === slideIdx ? '0 0 8px rgba(255, 64, 129, 0.6)' : 'none'
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
            borderRadius: '22px',
            padding: '18px 16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
            border: '1.5px solid rgba(197, 160, 89, 0.45)',
            color: '#FFFFFF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(197, 160, 89, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FCD34D' }}>
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
          3. FEATURED PROMINENT CARDS: DAC LEADERSHIP & HERITAGE VAULT (Dynamic Stats)
         =================================================================== */}
      <div style={{ padding: '20px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#123499', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              DISTRICT 3011 LEADERSHIP &amp; LEGACY
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#0F1218' }}>
              Executive Council &amp; Vault
            </h2>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '100px', background: '#EEF2FF', color: '#123499' }}>
            CORE
          </span>
        </div>

        {/* Featured Prominent Cards Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Card A: DAC Leadership Council (Prominent Full Width Card) */}
          <div
            onClick={() => navigateTo('leadership')}
            style={{
              position: 'relative',
              borderRadius: '20px',
              padding: '18px 16px',
              background: '#FFFFFF',
              border: '1.5px solid rgba(18, 52, 153, 0.16)',
              boxShadow: '0 10px 28px rgba(18, 52, 153, 0.07)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#123499'
                  }}
                >
                  <Users size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#123499', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    DISTRICT ACTION COMMITTEE
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '1px 0 0 0' }}>
                    DAC 2026–27 Leadership
                  </h3>
                </div>
              </div>

              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#123499'
                }}
              >
                <ArrowRight size={16} />
              </div>
            </div>

            <p style={{ color: '#64748B', fontSize: '0.82rem', lineHeight: 1.45, margin: 0 }}>
              Meet DRR CA Archit Bhatia &amp; the {totalLeaders}-member Executive Council steering district initiatives.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#123499', background: '#EEF2FF', padding: '3px 8px', borderRadius: '6px' }}>
                  Core Team
                </span>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: '6px' }}>
                  Zonal Team
                </span>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#D81B60', background: '#FFF0F5', padding: '3px 8px', borderRadius: '6px' }}>
                  District Chairs
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#123499' }}>
                {totalLeaders} Leaders &rarr;
              </span>
            </div>
          </div>

          {/* Card B: Council of Past DRRs (Heritage Vault) (Prominent High-Contrast Card) */}
          <div
            onClick={() => navigateTo('heritage')}
            style={{
              position: 'relative',
              borderRadius: '20px',
              padding: '18px 16px',
              background: 'linear-gradient(135deg, #880E4F 0%, #D81B60 100%)',
              boxShadow: '0 12px 32px rgba(216, 27, 96, 0.22)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFE082'
                  }}
                >
                  <Award size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#FFE082', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    HISTORICAL ARCHIVE (1985–2026)
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF', margin: '1px 0 0 0' }}>
                    Council of Past DRRs
                  </h3>
                </div>
              </div>

              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <ArrowRight size={16} />
              </div>
            </div>

            <p style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.82rem', lineHeight: 1.45, margin: 0 }}>
              Honoring {totalPastDrrs}+ visionary leaders from RID 301, RID 3010, and RID 3011 across 40+ years.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.18)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#FFFFFF', background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '6px' }}>
                  RID 3011
                </span>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#FFFFFF', background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '6px' }}>
                  RID 3010
                </span>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#FFFFFF', background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '6px' }}>
                  RID 301
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FFE082' }}>
                {totalPastDrrs} DRRs &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          4. PROMINENT DELHI NCR ZONE MAP & RADAR (Dynamic Club Count)
         =================================================================== */}
      <div style={{ padding: '20px 14px 0' }}>
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
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#123499' }}>
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
              {totalClubs} CLUBS
            </span>
          </div>

          <p style={{ fontSize: '0.80rem', color: '#64748B', margin: '0 0 12px 0', lineHeight: 1.4 }}>
            Explore {totalClubs} chartered Rotaract clubs and youth chapters organized across 4 Delhi NCR zones.
          </p>

          {/* Zone Selector Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {zonesData.map((z) => {
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
          5. SECONDARY DISTRICT SERVICES (2-Column Balanced Grid)
         =================================================================== */}
      <div style={{ padding: '20px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#123499', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              EXPLORE DISTRICT 3011
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#0F1218' }}>
              District Services &amp; Tools
            </h2>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '100px', background: '#EEF2FF', color: '#123499' }}>
            SERVICES
          </span>
        </div>

        {/* 2-Column Responsive Grid with Clear Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            width: '100%'
          }}
        >
          {SECONDARY_DISTRICT_CARDS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '12px 12px',
                borderRadius: '16px',
                background: '#FFFFFF',
                border: '1.5px solid rgba(18, 52, 153, 0.10)',
                boxShadow: '0 4px 12px rgba(18, 52, 153, 0.04)',
                minHeight: '100px',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748B', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                  {item.badge}
                </span>
              </div>

              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F1218', lineHeight: 1.2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px', lineHeight: 1.2 }}>
                  {item.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================
          6. FLAGSHIP PROJECTS HORIZONTAL CAROUSEL STREAM
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
          7. DYNAMIC IMPACT CALCULATOR (Mobile Polished)
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
