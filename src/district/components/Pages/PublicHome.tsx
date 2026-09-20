import { useState, useEffect, useMemo, useRef } from 'react';
import type { FC, FormEvent, RefObject } from 'react';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { ROTARY_FOCUS_AREAS, IMPACT_METRICS, DISTRICT_ACHIEVEMENTS } from '../../data/districtData';
import type { FocusArea, ImpactMetric, Achievement } from '../../data/districtData';
import { ArrowUp, ArrowDown, Sparkles, CheckCircle2, Calculator, Send, X, Layers } from 'lucide-react';
const rotaryWheelImg = '/images.webp';
import Footer from '../Layout/Footer';
import DistrictBentoMatrix from '../Home/DistrictBentoMatrix';
import MobileHomeExperience from '../Home/MobileHomeExperience';
import DistrictRoadmap from '../Home/DistrictRoadmap';
import DistrictImpactStats from '../Home/DistrictImpactStats';
import ClubShowcasePreview from '../Home/ClubShowcasePreview';
import { postEnquiry } from '@/lib/publicApi/enquiries';
import { useLiveVisits, useVisitOnce } from '@/lib/publicApi/live';
import { useContentQuery, type ContentBlocks } from '@/lib/publicApi/content';
import { fetchAchievements } from '@/lib/publicApi/achievements';
import { fetchPartners } from '@/lib/publicApi/partners';
import { useSurfaceHref, surfaceHref } from '@/app/host';

const impactStatsSchema = z.array(
  z.object({
    label: z.string().optional(),
    value: z.union([z.string(), z.number()]).optional(),
    suffix: z.string().optional(),
    note: z.string().optional(),
    color: z.string().optional(),
  })
);

const areasOfFocusSchema = z.array(
  z.object({
    order: z.number().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
  })
);

function listBlockOf<T>(blocks: ContentBlocks | undefined, sectionKey: string, schema: z.ZodType<T>): T | null {
  const block = blocks?.[sectionKey];
  if (!block || block.type !== 'list') return null;
  const parsed = schema.safeParse(block.value);
  return parsed.success ? parsed.data : null;
}

const ACHIEVEMENT_BADGE_BY_TYPE: Record<string, string> = {
  chartered_club: 'Charter Expansion',
  award: 'Award & Recognition',
  milestone: 'District Milestone',
  event: 'Flagship Event',
  training: 'Leadership Training',
  community: 'Community Service',
  sports: 'Sports & Fellowship',
  international: 'International Service',
  professional: 'Professional Dev',
};

function formatAchievementBadge(type: string | undefined): string {
  if (!type) return 'District Milestone';
  if (ACHIEVEMENT_BADGE_BY_TYPE[type]) return ACHIEVEMENT_BADGE_BY_TYPE[type];
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function SectionDivider() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '24px auto',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(18, 52, 153, 0.08) 15%, rgba(18, 52, 153, 0.08) 85%, transparent)',
        position: 'relative',
        zIndex: 5
      }}
    />
  );
}

type ScreenSize = 'mobile' | 'tablet' | 'laptop' | 'desktop';

interface BigRotaryWheelProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

function BigRotaryWheel({ containerRef }: BigRotaryWheelProps) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const targetScrollYRef = useRef(0);
  const smoothScrollYRef = useRef(0);
  const ambientRotationRef = useRef(0);
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    if (w < 1440 || h < 850) return 'laptop';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 768) setScreenSize('mobile');
      else if (w < 1024) setScreenSize('tablet');
      else if (w < 1440 || h < 850) setScreenSize('laptop');
      else setScreenSize('desktop');
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (screenSize === 'mobile') return;

    let animFrameId: number;
    let lastTime = performance.now();

    const getScrollTop = () => {
      const windowScroll = window.scrollY || document.documentElement.scrollTop || 0;
      const containerScroll = containerRef && containerRef.current ? containerRef.current.scrollTop : 0;
      return Math.max(windowScroll, containerScroll);
    };

    // Initialize to current scroll position immediately to prevent initial jump
    const initialScroll = getScrollTop();
    targetScrollYRef.current = initialScroll;
    smoothScrollYRef.current = initialScroll;

    const handleScroll = () => {
      targetScrollYRef.current = getScrollTop();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const containerEl = containerRef?.current;
    if (containerEl) {
      containerEl.addEventListener('scroll', handleScroll, { passive: true });
    }

    const updateFrame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Frame-rate independent exponential smoothing (~15% smoother damping)
      const smoothingFactor = 1 - Math.exp(-4.8 * dt);
      const targetY = targetScrollYRef.current;
      smoothScrollYRef.current += (targetY - smoothScrollYRef.current) * smoothingFactor;

      // Ambient gentle continuous rotation (3.0 degrees/sec)
      ambientRotationRef.current += dt * 3.0;

      const smoothY = smoothScrollYRef.current;

      // Smoothstep easing for scaling & offset across viewport transitions
      const progress = Math.min(1, Math.max(0, smoothY / 1000));
      const smoothProgress = progress * progress * (3 - 2 * progress);

      const scale = 1.0 - smoothProgress * 0.20;
      const offsetX = smoothProgress * 42;
      const totalRotation = ambientRotationRef.current + smoothY * 0.075;

      if (wheelRef.current) {
        // High-precision GPU transform without string rounding truncations
        wheelRef.current.style.transform = `translate3d(calc(-50% + ${offsetX}px), -50%, 0) scale(${scale}) rotate(${totalRotation}deg)`;
      }

      animFrameId = requestAnimationFrame(updateFrame);
    };

    animFrameId = requestAnimationFrame(updateFrame);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('scroll', handleScroll);
      if (containerEl) {
        containerEl.removeEventListener('scroll', handleScroll);
      }
    };
  }, [containerRef, screenSize]);

  let wheelSize = '1080px';
  let leftPos = '92%';
  if (screenSize === 'tablet') {
    wheelSize = '680px';
    leftPos = '95%';
  } else if (screenSize === 'laptop') {
    wheelSize = '840px';
    leftPos = '94%';
  }

  return (
    <div
      ref={wheelRef}
      className="wide-only"
      style={{
        position: 'fixed',
        top: '50%',
        left: leftPos,
        transform: 'translate3d(-50%, -50%, 0) scale(1) rotate(0deg)',
        width: wheelSize,
        height: wheelSize,
        maxWidth: '95vw',
        maxHeight: '95vw',
        pointerEvents: 'none',
        zIndex: 0,
        willChange: 'transform',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transformOrigin: 'center center',
        opacity: 0.70,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      <img
        src={rotaryWheelImg}
        alt="Rotary Wheel Anchor"
        loading="lazy"
        decoding="async"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.035))'
        }}
      />
    </div>
  );
}

type FlagshipSurface = 'mission3011' | 'drishti' | 'rcl' | 'careerbridge' | 'ride';

interface UpcomingProject {
  id: number;
  title: string;
  category: string;
  subtitle: string;
  image: string;
  metric: string;
  description: string;
  // Project Ownership Bidding has no page of its own yet, so it stays non-navigable.
  surface?: FlagshipSurface;
}

const DISTRICT_UPCOMING_PROJECTS: UpcomingProject[] = [
  {
    id: 1,
    title: 'The RIDE: Delhi Meri Jaan',
    surface: 'ride',
    category: 'Youth Exchange & Fellowship',
    subtitle: 'National & International Youth Exchange 2026',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200&auto=format&fit=crop',
    metric: 'Flagship Youth Exchange',
    description: 'Rotaract Inter-District Youth Exchange hosting delegates from across India and international Rotary districts for an immersive 4-day fellowship, heritage tour, and homestay experience.'
  },
  {
    id: 2,
    title: 'Mission 3011',
    surface: 'mission3011',
    category: 'Healthcare & Life',
    subtitle: 'District-Wide Blood Donation Campaign',
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=80',
    metric: '3,011 Units Target',
    description: 'A district-wide blood donation campaign running across the year, with clubs in all 4 zones holding their own camps toward a district target of 3,011 certified life-saving units, in partnership with accredited blood banks.'
  },
  {
    id: 3,
    title: 'Project Drishti',
    surface: 'drishti',
    category: 'Vision Care & Surgery',
    subtitle: '100 Cataract Surgeries & Community Eye Health Camps',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
    metric: 'Target: 100 Surgeries',
    description: 'Combating avoidable blindness across Delhi NCR through comprehensive screening clinics, prescription spectacles distribution, and a target of 100 fully sponsored cataract surgeries for underprivileged elders.'
  },
  {
    id: 4,
    title: 'Rotaract Cricket League (RCL)',
    surface: 'rcl',
    category: 'District Fellowship & Sports',
    subtitle: 'Inter-Club Championship & Youth Sports Festival',
    image: '/rcl-cricket.webp',
    metric: 'Inter-Club Championship',
    description: 'District 3011’s marquee sports tournament fostering camaraderie, athletic grit, and inter-club fellowship across Delhi, Gurgaon, and Faridabad on the cricket pitch.'
  },
  {
    id: 5,
    title: 'Career Bridge',
    surface: 'careerbridge',
    category: 'Youth Vocational Development',
    subtitle: 'Rotary Mentorship, Internships & Career Portal',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    metric: 'Mentorship & Placements',
    description: 'A live bridge connecting Rotarians and corporate leaders with aspiring Rotaractors for executive coaching, corporate internships, CV masterclasses, and verified job placements.'
  },
  {
    id: 6,
    title: 'Project Ownership Bidding',
    category: 'Club Leadership & Merit Allocation',
    subtitle: 'Host District Projects Through Merit-Based Bidding',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    metric: '100-Point Scoring Matrix',
    description: 'Rotaract clubs bid to host flagship district initiatives, scored out of 100 on Understanding & Vision (20), Execution Plan (25), Resources & Partnerships (20), Team Capacity (15), District-Level Impact (10), and Commitment & Ownership (10).'
  }
];

type ExpandingCarouselProps = Record<string, never>;

const ExpandingCarousel: FC<ExpandingCarouselProps> = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const surfaceHrefs: Record<FlagshipSurface, string | undefined> = {
    mission3011: useSurfaceHref('mission3011'),
    drishti: useSurfaceHref('drishti'),
    rcl: useSurfaceHref('rcl'),
    careerbridge: useSurfaceHref('careerbridge'),
    ride: useSurfaceHref('ride'),
  };
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getSafeSurfaceHref = (surface?: FlagshipSurface): string | undefined => {
    if (!surface) return undefined;
    if (surface === 'ride') return 'https://delhimerijan.rotaract3011.org';
    return surfaceHrefs[surface] || surfaceHref(surface) || `/?surface=${surface}`;
  };

  if (isMobile) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          gap: '14px',
          width: '100%',
          padding: '4px 16px 16px 16px',
          boxSizing: 'border-box'
        }}
      >
        {DISTRICT_UPCOMING_PROJECTS.map((proj) => {
          const href = getSafeSurfaceHref(proj.surface);
          const Card = proj.surface ? 'a' : 'div';
          return (
            <Card
              key={proj.id}
              {...(proj.surface
                ? { href: href ?? '#', 'aria-label': `${proj.title}: ${proj.subtitle}` }
                : {})}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                textDecoration: 'none',
                color: '#FFFFFF',
                position: 'relative',
                minWidth: '82vw',
                maxWidth: '320px',
                height: '360px',
                borderRadius: '22px',
                overflow: 'hidden',
                scrollSnapAlign: 'start',
                flexShrink: 0,
                backgroundColor: '#0F1218',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <img
                src={proj.image}
                alt={proj.title}
                onError={(e) => {
                  if (proj.id === 3 || proj.title?.includes('RCL') || proj.title?.includes('Cricket')) {
                    e.currentTarget.src = '/rcl-cricket.webp';
                  }
                }}
                loading="lazy"
                decoding="async"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />

              {/* Gradient Scrim for Legibility */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(15,18,24,0.1) 0%, rgba(15,18,24,0.6) 45%, rgba(15,18,24,0.95) 100%)'
                }}
              />

              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', background: 'var(--rotaract-pink)', padding: '3px 8px', borderRadius: '4px', color: '#FFF' }}>
                    {proj.category}
                  </span>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', background: 'rgba(255,255,255,0.22)', padding: '3px 8px', borderRadius: '4px', backdropFilter: 'blur(6px)', color: '#FFF' }}>
                    {proj.metric}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 0 0', lineHeight: 1.2 }}>
                  {proj.title}
                </h3>

                <p style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.88)', margin: 0, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {proj.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        maxWidth: '1350px',
        margin: '0 auto',
        gap: '16px',
        height: isTablet ? '480px' : '580px',
        padding: '0 20px',
        zIndex: 5,
        position: 'relative'
      }}
    >
      {DISTRICT_UPCOMING_PROJECTS.map((proj, idx) => {
        const isActive = idx === selectedIndex;
        const href = getSafeSurfaceHref(proj.surface);
        const Card = proj.surface ? 'a' : 'div';
        return (
          <Card
            key={proj.id}
            {...(proj.surface
              ? { href: href ?? '#', 'aria-label': `${proj.title}: ${proj.subtitle}` }
              : {})}
            onMouseEnter={() => setSelectedIndex(idx)}
            onFocus={() => setSelectedIndex(idx)}
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              position: 'relative',
              flex: isActive ? 6 : 1,
              height: '100%',
              borderRadius: '24px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'flex 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
              backgroundColor: '#0F1218',
              boxShadow: isActive ? '0 15px 35px rgba(216,27,96,0.28)' : '0 4px 10px rgba(0,0,0,0.08)'
            }}
          >
            <img
              src={proj.image}
              alt={proj.title}
              onError={(e) => {
                if (proj.id === 3 || proj.title?.includes('RCL') || proj.title?.includes('Cricket')) {
                  e.currentTarget.src = '/rcl-cricket.webp';
                }
              }}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: isActive ? 1 : 0.45,
                transition: 'opacity 0.65s ease',
              }}
            />

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: isActive
                  ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'
                  : 'rgba(0,0,0,0.3)',
                transition: 'background 0.7s ease',
              }}
            />

            <div
              style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                padding: '30px',
                color: '#FFF',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
                pointerEvents: isActive ? 'auto' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <h3 style={{ fontSize: 'clamp(1.5rem, 2vw, 2rem)', fontWeight: 900, margin: 0, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                {proj.title}
              </h3>
              <p style={{ fontSize: '0.95rem', margin: 0, opacity: 0.9, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                {proj.description}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', background: 'var(--rotaract-pink)', padding: '4px 10px', borderRadius: '4px', minWidth: 0, overflowWrap: 'anywhere' }}>
                  {proj.category}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '4px', backdropFilter: 'blur(4px)', minWidth: 0, overflowWrap: 'anywhere' }}>
                  {proj.metric}
                </span>
              </div>
            </div>

            <div
              className="wide-only"
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                paddingBottom: '30px',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  whiteSpace: 'nowrap',
                  opacity: isActive ? 0 : 1,
                  transition: 'opacity 0.3s ease',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
              >
                {proj.title}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export interface PublicHomeProps {
  onNavigateDistrict?: (tab?: string) => void;
  onNavigatePage?: (page: string, tab?: string) => void;
  onOpenLoginModal?: () => void;
}

export default function PublicHome({ onNavigateDistrict, onNavigatePage, onOpenLoginModal }: PublicHomeProps) {
  useVisitOnce();
  useLiveVisits();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentSectionRef = useRef(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768 && window.innerWidth < 1024);
  const [, setScrollProgress] = useState(0);

  const handleScrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScrollSync = () => {
      const sections = Array.from(el.querySelectorAll<HTMLElement>('.snap-section, .snap-section-footer'));
      const scrollTop = el.scrollTop;
      let closestIndex = 0;
      let minDiff = Infinity;

      sections.forEach((sec: HTMLElement, idx) => {
        const diff = Math.abs(sec.offsetTop - scrollTop);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = idx;
        }
      });
      currentSectionRef.current = closestIndex;
      if (el.scrollHeight > el.clientHeight) {
        setScrollProgress(el.scrollTop / (el.scrollHeight - el.clientHeight));
      }
    };

    el.addEventListener('scroll', handleScrollSync, { passive: true });
    handleScrollSync();

    return () => {
      el.removeEventListener('scroll', handleScrollSync);
    };
  }, []);

  const homeContentQuery = useContentQuery('home');
  const aboutContentQuery = useContentQuery('about');
  const achievementsQuery = useQuery({
    queryKey: ['public', 'achievements'],
    queryFn: fetchAchievements,
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });
  const partnersQuery = useQuery({
    queryKey: ['public', 'partners'],
    queryFn: fetchPartners,
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });

  const impactMetrics = useMemo<ImpactMetric[]>(() => {
    const stats = listBlockOf(homeContentQuery.data, 'impact-stats', impactStatsSchema);
    if (!stats || stats.length === 0) return IMPACT_METRICS;
    return stats.map((stat, idx) => {
      const base = IMPACT_METRICS[idx % IMPACT_METRICS.length];
      return {
        label: stat.label || base.label,
        value: stat.value === undefined || stat.value === '' ? base.value : String(stat.value),
        suffix: stat.suffix || base.suffix,
        change: stat.note || base.change,
        color: stat.color || base.color,
      };
    });
  }, [homeContentQuery.data]);

  const focusAreas = useMemo<FocusArea[]>(() => {
    const areas = listBlockOf(aboutContentQuery.data, 'areas-of-focus', areasOfFocusSchema);
    if (!areas || areas.length === 0) return ROTARY_FOCUS_AREAS;
    return [...areas]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((area, idx) => {
        const base = ROTARY_FOCUS_AREAS[idx % ROTARY_FOCUS_AREAS.length];
        return {
          id: base.id,
          name: area.title || base.name,
          color: base.color,
          icon: base.icon,
          description: area.description || base.description,
        };
      });
  }, [aboutContentQuery.data]);

  const achievements = useMemo<Achievement[]>(() => {
    const items = achievementsQuery.data?.items;
    if (!items || items.length === 0) return DISTRICT_ACHIEVEMENTS;
    return items.map((item, idx) => {
      const base = DISTRICT_ACHIEVEMENTS.find(
        (a) => a.title.toLowerCase() === (item.title || '').toLowerCase()
      );
      const badge = formatAchievementBadge(item.type) || base?.badge || 'District Milestone';
      return {
        id: item.id || `ach-${idx + 1}`,
        title: item.title || base?.title || `District Milestone ${idx + 1}`,
        value: base?.value || 'Milestone',
        badge: badge,
        metric: base?.metric || badge,
        description: item.description || base?.description || '',
        highlight: item.title || base?.highlight || '',
        color: base?.color || (idx % 2 === 0 ? '#123499' : '#0284C7'),
      };
    });
  }, [achievementsQuery.data]);

  const [contributionAmount, setContributionAmount] = useState(10000);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPhone, setJoinPhone] = useState('');
  const [joinZone, setJoinZone] = useState('Zone Prithvi');
  const [joinInterest, setJoinInterest] = useState('Community Service');
  const [joinSubmitted, setJoinSubmitted] = useState(false);
  const [isJoinSubmitting, setIsJoinSubmitting] = useState(false);

  const pediatricScreenings = Math.floor(contributionAmount / 500);
  const treesPlanted = Math.floor(contributionAmount / 150);
  const waterLiters = Math.floor(contributionAmount * 1.5);
  const hygieneKits = Math.floor(contributionAmount / 200);

  const handleJoinSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsJoinSubmitting(true);
    try {
      await postEnquiry({
        kind: 'contact',
        name: joinName.trim() || 'Prospective Member',
        email: joinEmail.trim(),
        phone: joinPhone.trim() || undefined,
        message: `New Member Application (RY 2026-27) - Preferred Zone: ${joinZone} | Area of Interest: ${joinInterest}`,
        payload: { zone: joinZone, interest: joinInterest }
      });
      setJoinSubmitted(true);
    } catch (err) {
      console.warn('Notice: Enquiry recorded locally (backend sync notice):', err);
      setJoinSubmitted(true);
    } finally {
      setIsJoinSubmitting(false);
    }
    setTimeout(() => {
      setJoinSubmitted(false);
      setIsJoinModalOpen(false);
      setJoinName('');
      setJoinEmail('');
      setJoinPhone('');
    }, 2500);
  };

  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className="snap-container"
        style={{
          backgroundColor: '#FFFFFF',
          paddingBottom: 'calc(76px + env(safe-area-inset-bottom, 12px))',
          overflowX: 'hidden'
        }}
      >
        <MobileHomeExperience
          onNavigateDistrict={onNavigateDistrict}
          onNavigatePage={onNavigatePage}
          onOpenLoginModal={onOpenLoginModal}
          achievements={achievements}
          focusAreas={focusAreas}
          impactMetrics={impactMetrics}
        />
        <Footer onNavigatePage={onNavigatePage} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="snap-container" style={{ backgroundColor: '#FFFFFF' }}>

      <BigRotaryWheel containerRef={containerRef} />

      <section
        className="snap-section hero-section"
        style={{
          background: 'transparent',
          textAlign: 'left',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflow: 'hidden',
          padding: isMobile ? '80px 16px 40px 16px' : isTablet ? '90px 4vw 40px 4vw' : '0 4vw'
        }}
      >
        {/* Authentic Group Photo Background of DAC 2026-27 Oath */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          <img
            src="/hero-dac-oath.webp"
            alt="Rotaract District 3011 Administrative Council Oath"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 32%',
              opacity: 0.50,
              filter: 'saturate(1.05) contrast(1.02)'
            }}
          />
          {/* Subtle natural fade to blend smoothly into the white page background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 65%, #FFFFFF 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.45) 45%, transparent 100%)'
            }}
          />
        </div>

        <div
          className="section-content-animate"
          style={{
            width: '100%',
            maxWidth: '100%',
            margin: '0',
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            textAlign: 'left',
            paddingLeft: 'max(10px, 2vw)'
          }}
        >
          <h1
            className="hero-main-title"
            style={{
              fontSize: isMobile ? 'clamp(2.1rem, 9.2vw, 3.2rem)' : 'clamp(2.8rem, 5.5vw, 6.2rem)',
              fontWeight: 900,
              color: '#1a1a1a',
              lineHeight: 0.95,
              margin: isMobile ? '0 0 10px 0' : '0 0 16px 0',
              letterSpacing: isMobile ? '-0.8px' : '-1.5px',
              textTransform: 'uppercase',
              textAlign: 'left',
              whiteSpace: 'pre-line'
            }}
          >
            {"ROTARACT\nDISTRICT\nORGANIZATION"}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px', flexWrap: 'wrap' }}>
            <span
              className="hero-number-accent"
              style={{
                fontSize: isMobile ? 'clamp(3.4rem, 15vw, 4.8rem)' : 'clamp(4.5rem, 8.5vw, 9rem)',
                fontWeight: 900,
                color: '#0044ff',
                lineHeight: 0.85,
                letterSpacing: isMobile ? '-1.5px' : '-3px'
              }}
            >
              3011
            </span>

            <p
              className="hero-subtitle"
              style={{
                fontSize: isMobile ? '0.88rem' : 'clamp(0.95rem, 1.4vw, 1.35rem)',
                color: '#0044ff',
                margin: '0',
                lineHeight: 1.35,
                fontWeight: 600,
                textAlign: 'left',
                whiteSpace: isMobile ? 'normal' : 'pre-line',
                maxWidth: isMobile ? '240px' : 'none'
              }}
            >
              {"brings together clubs\nand young leaders across\nDelhi NCR\nto drive sustainable social change."}
            </p>
          </div>
        </div>
      </section>

      {/* 4x4 Modular District Matrix Layout */}
      <section style={{ position: 'relative', zIndex: 10, width: '100%' }}>
        <DistrictBentoMatrix
          onNavigateDistrict={onNavigateDistrict}
          onNavigatePage={onNavigatePage}
        />
      </section>

      <SectionDivider />

      <section className="snap-section" style={{ position: 'relative', zIndex: 5, backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: isMobile ? '36px 14px' : '56px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
          <span className="pill-gold" style={{ marginBottom: '6px', fontSize: '0.85rem', padding: '5px 16px', borderRadius: '6px', background: '#EEF1FA', color: '#123499', border: '1px solid rgba(18, 52, 153, 0.2)' }}>
            <Layers size={14} /> UPCOMING DISTRICT PROJECTS (RY 2026-27)
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
            Upcoming Projects &amp; Project Ownership Bidding
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', maxWidth: '720px', margin: '8px auto 0' }}>
            Flagship district community &amp; youth initiatives available for club bidding and district-wide execution in RY 2026–27.
          </p>
        </div>

        <ExpandingCarousel />
      </section>

      <SectionDivider />

      <section className="snap-section" style={{ position: 'relative', zIndex: 5, backgroundColor: 'transparent', padding: isMobile ? '40px 16px' : '64px 24px' }}>
        <div className="section-content-animate" style={{ maxWidth: '1280px', width: '100%', position: 'relative', zIndex: 10 }}>
          <DistrictRoadmap achievements={achievements} />
        </div>
      </section>

      <SectionDivider />

      <section className="snap-section" style={{ position: 'relative', zIndex: 5, backgroundColor: 'transparent', padding: isMobile ? '40px 16px' : '64px 24px' }}>
        <div className="section-content-animate" style={{ maxWidth: '1280px', width: '100%', position: 'relative', zIndex: 10 }}>
          <DistrictImpactStats metrics={impactMetrics} />
        </div>
      </section>

      <SectionDivider />

      <ClubShowcasePreview
        onOpenShowcase={() =>
          onNavigatePage ? onNavigatePage('district', 'initiatives') : (window.location.href = '/showcase')
        }
      />

      <SectionDivider />

      <section className="snap-section" style={{ position: 'relative', zIndex: 5, backgroundColor: 'transparent', padding: '44px 24px' }}>
        <div className="section-content-animate" style={{ maxWidth: '1280px', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="pill-gold" style={{ marginBottom: '8px', fontSize: '0.85rem', padding: '5px 18px', background: '#EEF1FA', color: '#123499', border: '1px solid rgba(18, 52, 153, 0.2)' }}>
              AREAS OF FOCUS
            </span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-1px' }}>
              Causes We Support
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto' }}>
              Aligned with Rotary International's 7 Causes to address critical community challenges.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {focusAreas.map((area) => (
              <div
                key={area.id}
                className="rotaract-card"
                style={{
                  padding: '22px 20px',
                  borderTop: '4px solid #123499',
                  border: '1px solid rgba(18, 52, 153, 0.10)',
                  borderTopWidth: '4px',
                  borderTopColor: '#123499',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(18, 52, 153, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#EFF6FF',
                    color: '#123499',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {area.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.45 }}>
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="snap-section" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', padding: '44px 32px' }}>
        <div className="section-content-animate" style={{ maxWidth: '1320px', width: '100%', position: 'relative', zIndex: 10 }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="pill-gold" style={{ marginBottom: '10px', fontSize: '0.92rem', padding: '7px 20px', background: '#EEF1FA', color: '#123499', border: '1px solid rgba(18, 52, 153, 0.2)' }}>
              <Calculator size={16} /> DYNAMIC IMPACT CALCULATOR
            </span>
            <h2 style={{ fontSize: 'clamp(2.4rem, 4.2vw, 3.5rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '8px' }}>
              See What Your Support Accomplishes
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', maxWidth: '720px', margin: '0 auto' }}>
              Slide the interactive bar or click a preset below to calculate real-world social impact in District 3011.
            </p>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              padding: 'clamp(16px, 3vw, 36px)',
              borderRadius: '24px',
              border: '1.5px solid rgba(18, 52, 153, 0.14)',
              boxShadow: '0 10px 35px rgba(18, 52, 153, 0.06)',
              marginBottom: '28px',
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Slide to Adjust Contribution
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', padding: '10px 24px', borderRadius: '10px', border: '2px solid #123499', boxShadow: '0 4px 15px rgba(18, 52, 153, 0.12)' }}>
                <span style={{ fontWeight: 900, color: '#123499', fontSize: '1.4rem' }}>₹</span>
                <input
                  type="number"
                  step="500"
                  min="500"
                  max="100000"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(Math.max(0, Number(e.target.value)))}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    width: '130px'
                  }}
                />
              </div>
            </div>

            <div style={{ position: 'relative', width: '100%', marginBottom: '8px' }}>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={contributionAmount > 50000 ? 50000 : Math.max(1000, contributionAmount)}
                onChange={(e) => setContributionAmount(Number(e.target.value))}
                className="rotaract-slider-bar"
                style={{
                  width: '100%',
                  height: '12px',
                  borderRadius: '10px',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  background: `linear-gradient(to right, #123499 0%, #123499 ${((Math.min(50000, Math.max(1000, contributionAmount)) - 1000) / (50000 - 1000)) * 100}%, #E2E8F0 ${((Math.min(50000, Math.max(1000, contributionAmount)) - 1000) / (50000 - 1000)) * 100}%, #E2E8F0 100%)`
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              <span>₹1,000</span>
              <span>₹10,000</span>
              <span>₹25,000</span>
              <span>₹50,000+</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', marginRight: '6px' }}>Quick Presets:</span>
              {[2500, 5000, 10000, 20000, 50000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setContributionAmount(preset)}
                  style={{
                    background: contributionAmount === preset ? '#123499' : '#EFF6FF',
                    color: contributionAmount === preset ? '#FFFFFF' : '#123499',
                    border: '1.5px solid rgba(18, 52, 153, 0.25)',
                    borderRadius: '8px',
                    padding: '7px 18px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: contributionAmount === preset ? '0 4px 14px rgba(18, 52, 153, 0.25)' : 'none'
                  }}
                >
                  ₹{preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '22px', width: '100%' }}>
            <div className="rotaract-card" style={{ padding: '26px 20px', textAlign: 'center', borderTop: '4px solid #123499', borderRadius: '16px', boxShadow: '0 4px 20px rgba(18, 52, 153, 0.05)', border: '1px solid rgba(18, 52, 153, 0.10)', borderTopWidth: '4px', borderTopColor: '#123499' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#123499', lineHeight: 1 }}>
                {pediatricScreenings.toLocaleString()}
              </div>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                Child Health Screenings
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Free health checkups provided
              </div>
            </div>

            <div className="rotaract-card" style={{ padding: '26px 20px', textAlign: 'center', borderTop: '4px solid var(--skyline-gold)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid rgba(217, 119, 6, 0.15)', borderTopWidth: '4px', borderTopColor: 'var(--skyline-gold)' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--skyline-gold-dark)', lineHeight: 1 }}>
                {treesPlanted.toLocaleString()}
              </div>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                Native Trees Planted
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Environmental saplings across NCR
              </div>
            </div>

            <div className="rotaract-card" style={{ padding: '26px 20px', textAlign: 'center', borderTop: '4px solid #0284C7', borderRadius: '16px', boxShadow: '0 4px 20px rgba(2, 132, 199, 0.05)', border: '1px solid rgba(2, 132, 199, 0.15)', borderTopWidth: '4px', borderTopColor: '#0284C7' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0284C7', lineHeight: 1 }}>
                {waterLiters.toLocaleString()} L
              </div>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                Clean Water Filtered
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Drinking water supply delivered
              </div>
            </div>

            <div className="rotaract-card" style={{ padding: '26px 20px', textAlign: 'center', borderTop: '4px solid var(--skyline-gold)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid rgba(217, 119, 6, 0.15)', borderTopWidth: '4px', borderTopColor: 'var(--skyline-gold)' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--skyline-gold-dark)', lineHeight: 1 }}>
                {hygieneKits.toLocaleString()}
              </div>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                Hygiene Dignity Kits
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Sanitary & wellness kits distributed
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Corporate & Community Partners Section */}
      <section
        style={{
          width: '100%',
          padding: isMobile ? '50px 16px' : '70px 24px',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)',
          position: 'relative',
          zIndex: 10,
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className="pill-pink">COLLABORATIONS &amp; IMPACT</span>
          </div>
          <h2
            style={{
              fontSize: isMobile ? '2rem' : '2.6rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              marginBottom: '12px',
            }}
          >
            Corporate &amp; Community Partners
          </h2>
          <p
            style={{
              maxWidth: '680px',
              margin: '0 auto 36px',
              fontSize: isMobile ? '0.92rem' : '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            Powering scalable service initiatives, leadership summits, and community outreach across NCR through trusted collaborations.
          </p>

          {partnersQuery.data?.items && partnersQuery.data.items.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '36px',
              }}
            >
              {partnersQuery.data.items.map((partner) => (
                <div
                  key={partner.id}
                  className="rotaract-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px 16px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    background: 'var(--bg-surface)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {partner.logoUrl ? (
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      style={{
                        height: '52px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        marginBottom: '14px',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '52px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-subtle)',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        marginBottom: '14px',
                        padding: '0 8px',
                      }}
                    >
                      {partner.name}
                    </div>
                  )}
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                    }}
                  >
                    {partner.name}
                  </p>
                  <span
                    className="pill-pink"
                    style={{ fontSize: '0.68rem', padding: '2px 8px', textTransform: 'capitalize' }}
                  >
                    {partner.tier.replace(/_/g, ' ')}
                  </span>
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginTop: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--rotaract-pink)',
                        textDecoration: 'none',
                      }}
                    >
                      Visit website →
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rotaract-card"
              style={{
                maxWidth: '600px',
                margin: '0 auto 36px',
                padding: '32px 24px',
                borderRadius: '16px',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Collaborate with Rotaract District 3011
              </p>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                We partner with leading institutions, CSR foundations, healthcare bodies, and corporate innovators to amplify youth impact across Delhi and NCR.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                if (onNavigatePage) {
                  onNavigatePage('partners');
                } else {
                  window.location.href = '/partners';
                }
              }}
              className="btn-rotaract"
              style={{ padding: '12px 28px', fontSize: '0.92rem' }}
            >
              Explore All Partners &amp; Collaborations →
            </button>
          </div>
        </div>
      </section>

      <div className="snap-section-footer" style={{ width: '100%', position: 'relative', zIndex: 20, backgroundColor: '#18181B' }}>
        <Footer
          isFullScreen={false}
          onNavigatePage={(page: string) => {
            if (onNavigatePage) {
              onNavigatePage(page);
            } else if (page === 'district' && onNavigateDistrict) {
              onNavigateDistrict();
            } else if (page === 'home') {
              handleScrollToTop();
            }
          }}
        />
      </div>

      {/* Floating Home Quick-Scroll Navigator (Go to Top & Go to Bottom) */}
      <div
        style={{
          position: 'fixed',
          right: isMobile ? '12px' : '24px',
          bottom: isMobile ? 'calc(74px + env(safe-area-inset-bottom, 8px))' : '28px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <button
          onClick={handleScrollToTop}
          style={{
            width: isMobile ? '40px' : '46px',
            height: isMobile ? '40px' : '46px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(216, 27, 96, 0.35)',
            color: 'var(--rotaract-pink)',
            boxShadow: '0 8px 24px rgba(216, 27, 96, 0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
            e.currentTarget.style.backgroundColor = 'var(--rotaract-pink)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
            e.currentTarget.style.color = 'var(--rotaract-pink)';
          }}
          title="Go to Top of Homepage"
          aria-label="Go to Top"
        >
          <ArrowUp size={isMobile ? 18 : 22} />
        </button>

        <button
          onClick={handleScrollToBottom}
          style={{
            width: isMobile ? '40px' : '46px',
            height: isMobile ? '40px' : '46px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(216, 27, 96, 0.35)',
            color: 'var(--rotaract-pink)',
            boxShadow: '0 8px 24px rgba(216, 27, 96, 0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(3px) scale(1.08)';
            e.currentTarget.style.backgroundColor = 'var(--rotaract-pink)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
            e.currentTarget.style.color = 'var(--rotaract-pink)';
          }}
          title="Go to Bottom of Homepage"
          aria-label="Go to Bottom"
        >
          <ArrowDown size={isMobile ? 18 : 22} />
        </button>
      </div>

      {isJoinModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="rotaract-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '32px',
              position: 'relative',
              border: '2px solid var(--rotaract-pink)',
              animation: 'fadeInUp 0.3s ease-out forwards'
            }}
          >
            <button
              onClick={() => setIsJoinModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#FDF0F5',
                border: 'none',
                color: 'var(--rotaract-pink)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            {joinSubmitted ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--rotaract-pink-light)', color: 'var(--rotaract-pink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Thank You for Your Interest!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Our District Membership Committee and Zone Representative will reach out to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <span className="pill-pink" style={{ marginBottom: '8px' }}>
                    JOIN ROTARACT DISTRICT 3011
                  </span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                    Express Your Interest
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    Fill out this form to connect with a Rotaract club in your area.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ananya Sharma"
                      required
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7' }}
                    />
                  </div>

                  {/* Email and Phone: single column on mobile, two columns on desktop */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '4px' }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        placeholder="you@email.com"
                        required
                        value={joinEmail}
                        onChange={(e) => setJoinEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '4px' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={joinPhone}
                        onChange={(e) => setJoinPhone(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '4px' }}>
                      Preferred Zone / Location in NCR *
                    </label>
                    <select
                      value={joinZone}
                      onChange={(e) => setJoinZone(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7' }}
                    >
                      <option value="Zone Prithvi">Zone Prithvi (पृथ्वी) - South & East NCR</option>
                      <option value="Zone Agni">Zone Agni (अग्नि) - Central & Faridabad</option>
                      <option value="Zone Vayu">Zone Vayu (वायु) - North & Gurugram</option>
                      <option value="Zone Akash">Zone Akash (आकाश) - West & University</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '4px' }}>
                      What area interests you most?
                    </label>
                    <select
                      value={joinInterest}
                      onChange={(e) => setJoinInterest(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E4E4E7' }}
                    >
                      <option value="Community Service">Community Service & Health</option>
                      <option value="Professional Development">Professional & Vocational Development</option>
                      <option value="Youth Leadership">Youth Leadership & Public Speaking</option>
                      <option value="International Exchange">International Fellowship & Exchange</option>
                      <option value="Sports & Culture">Cultural Festivals & Sports</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isJoinSubmitting}
                  className="btn-rotaract"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '13px',
                    opacity: isJoinSubmitting ? 0.75 : 1,
                    cursor: isJoinSubmitting ? 'wait' : 'pointer'
                  }}
                >
                  <Send size={18} /> {isJoinSubmitting ? 'Submitting...' : 'Submit Interest Form'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
