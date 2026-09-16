import { useState, useEffect, FC } from 'react';
import { 
  Award, Users, Sparkles, Calendar, 
  ArrowUpRight, ChevronRight, Activity, Compass, ChevronLeft
} from 'lucide-react';
import { useSurfaceHref, surfaceHref, type Surface } from '@/app/host';

export interface DistrictBentoMatrixProps {
  onNavigateDistrict?: (tab: string) => void;
  onNavigatePage?: (page: string, tab?: string) => void;
}

const HERO_SLIDES = [
  {
    id: 'bento-slide-1',
    src: '/slideshow-yugarambh-sitting.webp',
    title: 'DAC 2026–27 Leadership Oath',
    subtitle: 'District Installation – "Yugarambh"'
  },
  {
    id: 'bento-slide-2',
    src: '/slideshow-yugarambh-standing.webp',
    title: 'United in Purpose: District Council',
    subtitle: '75 Clubs Across Delhi & NCR'
  },
  {
    id: 'bento-slide-3',
    src: '/slideshow-drr-speech.webp',
    title: 'DRR Archit Bhatia Address',
    subtitle: 'Vision for Fellowship & Grassroots Impact'
  },
  {
    id: 'bento-slide-4',
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
    color: '#D81B60'
  },
  {
    id: 'drishti',
    surface: 'drishti' as const,
    title: 'Project Drishti',
    category: 'Vision Care',
    target: '100 Cataract Surgeries',
    color: '#123499'
  },
  {
    id: 'rcl',
    surface: 'rcl' as const,
    title: 'Rotaract Cricket League',
    category: 'Fellowship & Sports',
    target: 'Inter-Club Championship',
    color: '#059669'
  },
  {
    id: 'careerbridge',
    surface: 'careerbridge' as const,
    title: 'Career Bridge',
    category: 'Vocational Development',
    target: 'Rotary Mentorship',
    color: '#7C3AED'
  },
  {
    id: 'ride',
    surface: 'ride' as const,
    title: 'The RIDE: Delhi Meri Jaan',
    category: 'District Conference',
    target: 'Annual Conference & Fellowship',
    color: '#EA6623'
  }
];

export const DistrictBentoMatrix: FC<DistrictBentoMatrixProps> = ({
  onNavigateDistrict,
  onNavigatePage
}) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024);

  const missionHref = useSurfaceHref('mission3011');
  const drishtiHref = useSurfaceHref('drishti');
  const rclHref = useSurfaceHref('rcl');
  const careerBridgeHref = useSurfaceHref('careerbridge');
  const rideHref = useSurfaceHref('ride');

  const surfaceHrefs: Partial<Record<Exclude<Surface, 'main'>, string | undefined>> = {
    mission3011: missionHref,
    drishti: drishtiHref,
    rcl: rclHref,
    careerbridge: careerBridgeHref,
    ride: rideHref
  };

  const getSafeSurfaceHref = (key: Exclude<Surface, 'main'>): string => {
    return surfaceHrefs[key] || surfaceHref(key) || `/?surface=${key}`;
  };

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance hero carousel inside bento
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4800);
    return () => clearInterval(timer);
  }, []);

  const navigateTo = (tab: string) => {
    if (onNavigatePage) {
      onNavigatePage('district', tab);
    } else if (onNavigateDistrict) {
      onNavigateDistrict(tab);
    } else {
      window.location.href = `/${tab === 'map-clubs' ? 'map' : tab}`;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1380px',
        margin: '0 auto',
        padding: isMobile ? '8px 12px 28px' : '20px 24px 44px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* 4x4 Bento Matrix Grid Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gridAutoRows: isMobile ? 'auto' : 'minmax(200px, auto)',
          gap: isMobile ? '14px' : '20px',
          width: '100%'
        }}
      >
        {/* ===================================================================
            TILE 1: 2x2 SPAN (Hero Moments & Installation Slideshow)
           =================================================================== */}
        <div
          style={{
            gridColumn: isMobile ? '1' : isTablet ? 'span 2' : 'span 2',
            gridRow: isMobile ? 'auto' : isTablet ? 'span 2' : 'span 2',
            position: 'relative',
            borderRadius: isMobile ? '18px' : '26px',
            overflow: 'hidden',
            minHeight: isMobile ? '340px' : isTablet ? '420px' : '460px',
            backgroundColor: '#090B0E',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: isMobile ? '16px' : '28px',
            boxSizing: 'border-box'
          }}
        >
          {/* Photos Layer with Crossfade */}
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === slideIdx;
            return (
              <div
                key={slide.id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scale(1)' : 'scale(1.04)',
                  transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: 'none'
                }}
              >
                <img
                  src={slide.src}
                  alt={slide.title}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 38%'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(15, 18, 24, 0.35) 0%, rgba(15, 18, 24, 0.1) 40%, rgba(15, 18, 24, 0.88) 100%)'
                  }}
                />
              </div>
            );
          })}

          {/* Top Live Pill */}
          <button
            type="button"
            onClick={() => navigateTo('gallery')}
            title="Explore District Gallery"
            style={{
              position: 'absolute',
              top: isMobile ? '14px' : '20px',
              left: isMobile ? '14px' : '20px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 18, 24, 0.65)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '999px',
              padding: '5px 12px',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(15, 18, 24, 0.9)';
              e.currentTarget.style.borderColor = 'var(--rotaract-pink)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 18, 24, 0.65)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--rotaract-pink)',
                boxShadow: '0 0 8px var(--rotaract-pink)'
              }}
            />
            <span
              style={{
                fontSize: '0.70rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '0.6px',
                textTransform: 'uppercase'
              }}
            >
              OFFICIAL DISTRICT MOMENTS
            </span>
            <ChevronRight size={13} color="#FFFFFF" style={{ opacity: 0.8 }} />
          </button>

          {/* Quick Arrow Jump */}
          <div
            style={{
              position: 'absolute',
              top: isMobile ? '14px' : '20px',
              right: isMobile ? '14px' : '20px',
              zIndex: 10,
              display: 'flex',
              gap: '6px'
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSlideIdx((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(15, 18, 24, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Previous Moment"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(15, 18, 24, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Next Moment"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Caption Content */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h3
              style={{
                fontSize: isMobile ? '1.15rem' : '1.5rem',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: '0 0 4px 0',
                letterSpacing: '-0.3px',
                lineHeight: 1.2
              }}
            >
              {HERO_SLIDES[slideIdx].title}
            </h3>
            <p
              style={{
                fontSize: isMobile ? '0.80rem' : '0.90rem',
                color: 'rgba(255, 255, 255, 0.85)',
                margin: '0 0 14px 0',
                fontWeight: 500
              }}
            >
              {HERO_SLIDES[slideIdx].subtitle}
            </p>

            {/* Slide Dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {HERO_SLIDES.map((_, dotIdx) => {
                const isDotActive = dotIdx === slideIdx;
                return (
                  <button
                    key={dotIdx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideIdx(dotIdx);
                    }}
                    style={{
                      width: isDotActive ? '24px' : '6px',
                      height: '6px',
                      borderRadius: '999px',
                      background: isDotActive ? 'var(--rotaract-pink)' : 'rgba(255, 255, 255, 0.35)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      padding: 0
                    }}
                    aria-label={`Slide ${dotIdx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ===================================================================
            TILE 2: 2x1 SPAN (Interactive Delhi NCR Map & Club Radar)
           =================================================================== */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigateTo('map-clubs')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigateTo('map-clubs');
            }
          }}
          style={{
            gridColumn: isMobile ? '1' : isTablet ? 'span 2' : 'span 2',
            position: 'relative',
            borderRadius: isMobile ? '18px' : '24px',
            overflow: 'hidden',
            minHeight: isMobile ? '200px' : '220px',
            backgroundColor: '#0F172A',
            backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(18, 52, 153, 0.45) 0%, transparent 60%)',
            boxShadow: '0 12px 30px rgba(18, 52, 153, 0.08)',
            border: '1.5px solid rgba(18, 52, 153, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: isMobile ? '20px 18px' : '26px 28px',
            boxSizing: 'border-box',
            cursor: 'pointer',
            transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = '#38BDF8';
            e.currentTarget.style.boxShadow = '0 18px 40px rgba(18, 52, 153, 0.28)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(18, 52, 153, 0.22)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(18, 52, 153, 0.08)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60A5FA'
                }}
              >
                <Compass size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#93C5FD', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  ZONE RADAR
                </span>
                <h4 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                  Interactive Map &amp; 54+ Clubs
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo('map-clubs');
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Open Map Directory"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>

          <p style={{ color: 'rgba(255, 255, 255, 0.80)', fontSize: '0.86rem', lineHeight: 1.45, margin: '10px 0' }}>
            Explore verified community and campus clubs demarcated across Zone Prithvi, Agni, Vayu, and Akash throughout Delhi &amp; NCR.
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Zone Prithvi', 'Zone Agni', 'Zone Vayu', 'Zone Akash'].map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo('map-clubs');
                }}
                style={{
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  color: '#BFDBFE',
                  backgroundColor: 'rgba(30, 58, 138, 0.6)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(147, 197, 253, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.6)';
                  e.currentTarget.style.borderColor = '#93C5FD';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(147, 197, 253, 0.3)';
                  e.currentTarget.style.color = '#BFDBFE';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================================
            TILE 3: 1x1 SPAN (DAC Leadership Council)
           =================================================================== */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigateTo('leadership')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigateTo('leadership');
            }
          }}
          style={{
            position: 'relative',
            borderRadius: isMobile ? '18px' : '24px',
            overflow: 'hidden',
            minHeight: isMobile ? '180px' : '220px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: isMobile ? '18px' : '24px',
            boxSizing: 'border-box',
            cursor: 'pointer',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = '#123499';
            e.currentTarget.style.boxShadow = '0 16px 36px rgba(18, 52, 153, 0.16)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#123499'
              }}
            >
              <Users size={20} />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo('leadership');
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EEF2FF';
                e.currentTarget.style.color = '#123499';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.color = '#64748B';
              }}
              aria-label="View District Leadership Council"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#123499', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              DISTRICT COUNCIL
            </span>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '2px 0 4px 0' }}>
              DAC 2026–27
            </h4>
            <p style={{ color: '#64748B', fontSize: '0.82rem', lineHeight: 1.4, margin: 0 }}>
              Meet DRR CA Archit Bhatia &amp; the Executive Council guiding clubs.
            </p>
          </div>
        </div>

        {/* ===================================================================
            TILE 4: 1x1 SPAN (Council of Past DRRs & Heritage Vault)
           =================================================================== */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigateTo('heritage')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigateTo('heritage');
            }
          }}
          style={{
            position: 'relative',
            borderRadius: isMobile ? '18px' : '24px',
            overflow: 'hidden',
            minHeight: isMobile ? '180px' : '220px',
            backgroundColor: '#880E4F',
            backgroundImage: 'linear-gradient(135deg, #D81B60 0%, #880E4F 100%)',
            boxShadow: '0 10px 30px rgba(216, 27, 96, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: isMobile ? '18px' : '24px',
            boxSizing: 'border-box',
            cursor: 'pointer',
            color: '#FFFFFF',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 16px 36px rgba(216, 27, 96, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(216, 27, 96, 0.15)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Award size={20} />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo('heritage');
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              aria-label="View Past DRR Legacy"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#FCE7F3', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              HERITAGE VAULT
            </span>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 4px 0' }}>
              Past DRR Legacy
            </h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.82rem', lineHeight: 1.4, margin: 0 }}>
              40+ Years of Rotaract Leadership &amp; Citations (1985–2026).
            </p>
          </div>
        </div>

        {/* ===================================================================
            TILE 5: 2x1 SPAN (Flagship Projects & Bidding)
           =================================================================== */}
        <div
          style={{
            gridColumn: isMobile ? '1' : isTablet ? 'span 2' : 'span 2',
            position: 'relative',
            borderRadius: isMobile ? '18px' : '24px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            padding: isMobile ? '18px 16px' : '24px 26px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#123499'
                }}
              >
                <Sparkles size={16} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.2px' }}>
                FLAGSHIP DISTRICT INITIATIVES
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('initiatives')}
              style={{
                background: 'none',
                border: 'none',
                color: '#123499',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EFF6FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {/* Horizontal Chips Stream */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '10px'
            }}
          >
            {FLAGSHIP_ITEMS.map((item) => {
              const href = getSafeSurfaceHref(item.surface);
              return (
                <a
                  key={item.id}
                  href={href}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                      e.preventDefault();
                      window.location.href = href;
                    }
                  }}
                  style={{
                    textDecoration: 'none',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '74px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#EFF6FF';
                    e.currentTarget.style.borderColor = '#BFDBFE';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(18, 52, 153, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: item.color, textTransform: 'uppercase' }}>
                    {item.category}
                  </span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                    {item.title}
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* ===================================================================
            TILE 6: 1x1 SPAN (Live Grassroots Metrics)
           =================================================================== */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigateTo('map-clubs')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigateTo('map-clubs');
            }
          }}
          style={{
            position: 'relative',
            borderRadius: isMobile ? '18px' : '24px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            padding: isMobile ? '18px' : '24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = '#123499';
            e.currentTarget.style.boxShadow = '0 16px 36px rgba(18, 52, 153, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              DISTRICT SCALE
            </span>
            <Activity size={16} color="#123499" />
          </div>

          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0F172A', lineHeight: 1, letterSpacing: '-1px' }}>
              54
            </div>
            <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#1E293B', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Active Verified Clubs</span>
              <ChevronRight size={14} color="#64748B" />
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
              4 Zonal Demarcations
            </div>
          </div>
        </div>

        {/* ===================================================================
            TILE 7: 1x1 SPAN (District Calendar & Events)
           =================================================================== */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigateTo('calendar')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigateTo('calendar');
            }
          }}
          style={{
            position: 'relative',
            borderRadius: isMobile ? '18px' : '24px',
            backgroundColor: '#1E293B',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            padding: isMobile ? '18px' : '24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            color: '#FFFFFF',
            transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = '#38BDF8';
            e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.12)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8'
              }}
            >
              <Calendar size={20} />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo('calendar');
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              }}
              aria-label="Open District Calendar"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#7DD3FC', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              DISTRICT CALENDAR
            </span>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 4px 0' }}>
              District Events
            </h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.80)', fontSize: '0.82rem', lineHeight: 1.4, margin: 0 }}>
              Track official assembly dates &amp; leadership seminars.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DistrictBentoMatrix;

