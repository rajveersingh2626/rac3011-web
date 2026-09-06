import { Suspense, lazy, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import PublicHome from './components/Pages/PublicHome';
import PresidentModal from './components/Modals/PresidentModal';
import { type ClubInitiative } from './data/districtData';
import { useDistrictClubs, type DistrictClubLive } from './hooks/useDistrictClubs';
import { useAuth } from '@/app/auth';
import { useLiveVisits, useVisitOnce } from '@/lib/publicApi/live';
import { isPrerendered } from '@/app/prerender';

type DistrictAccessComponent = (typeof import('./components/Pages/DistrictAccess'))['default'];
type DistrictAccessProps = ComponentProps<DistrictAccessComponent>;

let loadedDistrictAccess: DistrictAccessComponent | null = null;

function loadDistrictAccess() {
  return import('./components/Pages/DistrictAccess').then((m) => {
    loadedDistrictAccess = m.default;
    return m;
  });
}

const DistrictAccessLazy = lazy(loadDistrictAccess);

// Awaited before hydration starts (see main.tsx): a Suspense boundary can only hydrate against
// React's own `<!--$-->` markers, which a prerendered DOM snapshot does not carry, so the district
// pages must render their directory chunk directly on the first pass.
export function preload(pathname: string): Promise<unknown> | undefined {
  return routeFor(pathname).page === 'district' ? loadDistrictAccess() : undefined;
}

const rotaryLogoImg = '/images.png';

function RotaryLoaderLogo({ size = 96 }: { size?: number }) {
  return (
    <img
      src={rotaryLogoImg}
      alt="Rotary International Logo"
      loading="eager"
      decoding="async"
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain', animation: 'rotarySpin 3.5s linear infinite' }}
    />
  );
}

type DistrictPage = 'home' | 'district';
type RouteState = { page: DistrictPage; tab: string };

// URL route mapping for deep linking and browser history. '/portal' is handled by the
// app router (it redirects to the portal login) and never reaches this component.
const ROUTE_MAP: Record<string, RouteState> = {
  '/': { page: 'home', tab: 'map-clubs' },
  '/directory': { page: 'district', tab: 'map-clubs' },
  '/map': { page: 'district', tab: 'map-clubs' },
  '/showcase': { page: 'district', tab: 'initiatives' },
  '/initiatives': { page: 'district', tab: 'initiatives' },
  '/heritage': { page: 'district', tab: 'heritage' },
  '/resources': { page: 'district', tab: 'resources' },
  '/calendar': { page: 'district', tab: 'calendar' },
  '/governance': { page: 'district', tab: 'leadership' },
  '/leadership': { page: 'district', tab: 'leadership' },
};

function routeFor(pathname: string): RouteState {
  const path = pathname.toLowerCase().replace(/\/$/, '') || '/';
  return ROUTE_MAP[path] ?? { page: 'home', tab: 'map-clubs' };
}

function DistrictAccessSection(props: DistrictAccessProps) {
  // Resolved once per mount: swapping between the eager and the lazy element type mid-mount would
  // remount the whole directory.
  const [Loaded] = useState(() => loadedDistrictAccess);
  if (Loaded) return <Loaded {...props} />;

  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <RotaryLoaderLogo size={64} />
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--rotaract-pink)', letterSpacing: '1px' }}>LOADING DISTRICT 3011 DIRECTORY...</div>
        </div>
      }
    >
      <DistrictAccessLazy {...props} />
    </Suspense>
  );
}

function getPathFromState(page: DistrictPage, tab: string): string {
  if (page === 'home') return '/';
  if (tab === 'heritage') return '/heritage';
  if (tab === 'initiatives' || tab === 'showcase') return '/showcase';
  if (tab === 'leadership') return '/governance';
  if (tab === 'resources') return '/resources';
  if (tab === 'calendar') return '/calendar';
  return '/directory';
}

export default function DistrictApp() {
  useVisitOnce();
  const liveVisitsQuery = useLiveVisits();
  const visitsCount = liveVisitsQuery.data?.count ?? 14850;
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initialRoute = routeFor(window.location.pathname);

  const [activePage, setActivePageState] = useState<DistrictPage>(initialRoute.page);
  const [activeDistrictTab, setActiveDistrictTabState] = useState(initialRoute.tab);

  const { me, signOut } = useAuth();

  const handlePageChange = (page: string, tab?: string) => {
    if (page === 'portal') {
      window.location.href = me ? '/portal/dashboard' : '/portal/login';
      return;
    }
    const nextPage = page === 'district' ? 'district' : 'home';
    const targetTab = tab || (nextPage === 'district' ? activeDistrictTab || 'map-clubs' : 'map-clubs');
    if (nextPage === activePage && targetTab === activeDistrictTab) return;

    setActivePageState(nextPage);
    setActiveDistrictTabState(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const path = getPathFromState(nextPage, targetTab);
    if (window.location.pathname !== path) {
      window.history.pushState({ page: nextPage, tab: targetTab }, '', path);
    }
  };

  const handleDistrictTabChange = (tab: string) => {
    if (tab === activeDistrictTab && activePage === 'district') return;

    setActivePageState('district');
    setActiveDistrictTabState(tab);

    const path = getPathFromState('district', tab);
    if (window.location.pathname !== path) {
      window.history.pushState({ page: 'district', tab }, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const route = routeFor(window.location.pathname);
      setActivePageState(route.page);
      setActiveDistrictTabState(route.tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const { clubs: rosterClubs } = useDistrictClubs();

  // Initiatives posted in this session are layered over the API roster instead of being
  // written into it, so a background refetch never drops them.
  const [postedInitiatives, setPostedInitiatives] = useState<Record<string, ClubInitiative[]>>({});
  const clubs = useMemo<DistrictClubLive[]>(
    () =>
      rosterClubs.map((club) => {
        const posted = postedInitiatives[club.id];
        return posted ? { ...club, initiatives: [...posted, ...(club.initiatives || [])] } : club;
      }),
    [rosterClubs, postedInitiatives],
  );

  const isLoggedIn = Boolean(me);
  const userRole = me ? (me.roles[0]?.roleKey ?? 'member') : null;

  const handleOpenLogin = () => {
    window.location.href = me ? '/portal/dashboard' : '/portal/login';
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    window.location.href = '/';
  };

  const [uploaderModalMode, setUploaderModalMode] = useState<string | null>(null);
  const [preselectedClubForModal] = useState<DistrictClubLive | null>(null);

  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorFollowerRef = useRef<HTMLDivElement | null>(null);
  const [cursorHovered, setCursorHovered] = useState(false);

  // A prerendered page already paints the finished content, and its HTML is snapshotted after the
  // curtain is gone, so replaying the intro would both flash and break hydration.
  const curtainEnabled = !isPrerendered();
  const [showCurtain, setShowCurtain] = useState(curtainEnabled);
  const [curtainAnimated, setCurtainAnimated] = useState(false);

  useEffect(() => {
    if (!curtainEnabled) return;
    const timer1 = setTimeout(() => setCurtainAnimated(true), 150);
    const timer2 = setTimeout(() => setShowCurtain(false), 2200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [curtainEnabled]);

  useEffect(() => {
    let rAFId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      if (rAFId) cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(() => {
        if (cursorDotRef.current) {
          cursorDotRef.current.style.left = `${x}px`;
          cursorDotRef.current.style.top = `${y}px`;
        }
        if (cursorFollowerRef.current) {
          cursorFollowerRef.current.style.left = `${x}px`;
          cursorFollowerRef.current.style.top = `${y}px`;
        }
      });

      const target = e.target instanceof Element ? e.target.closest('[data-cursor]') : null;
      const isHovering = Boolean(target);
      setCursorHovered((prev) => (prev !== isHovering ? isHovering : prev));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, []);

  const handleAddInitiative = (targetClubId: string, newInitiative: ClubInitiative) => {
    setPostedInitiatives((prev) => ({ ...prev, [targetClubId]: [newInitiative, ...(prev[targetClubId] || [])] }));
    handlePageChange('district', 'map-clubs');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
      {showCurtain && (
        <div className={`curtain-container ${curtainAnimated ? 'animate' : ''}`}>
          <div className="curtain-strip" />
          <div className="curtain-strip" />
          <div className="curtain-strip" />
          <div className="curtain-strip" />
          <div className="curtain-strip" />
        </div>
      )}

      <div ref={cursorDotRef} className="custom-cursor-dot" style={{ left: '-100px', top: '-100px' }} />
      <div
        ref={cursorFollowerRef}
        className={`custom-cursor-follower ${cursorHovered ? 'hovered' : ''}`}
        style={{ left: '-100px', top: '-100px' }}
      />

      <div
        className="top-left-global-visitors-badge"
        style={{
          position: 'fixed',
          // On phones the centred navbar pill owns the whole top band, so anchor bottom-left instead.
          top: isMobile ? 'auto' : '22px',
          bottom: isMobile ? '14px' : 'auto',
          left: isMobile ? '14px' : '28px',
          zIndex: 998,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(216, 27, 96, 0.25)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: isMobile ? '5px 12px' : '7px 16px',
          borderRadius: '100px',
          pointerEvents: 'auto',
          transition: 'all 0.3s ease',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#22C55E',
            boxShadow: '0 0 10px #22C55E',
            animation: 'pulse 2s infinite',
          }}
        />
        <span
          style={{
            fontSize: isMobile ? '0.70rem' : '0.80rem',
            fontWeight: 800,
            color: 'var(--rotaract-pink)',
            letterSpacing: '0.4px',
            whiteSpace: 'nowrap',
          }}
        >
          {visitsCount.toLocaleString('en-IN')} Global Visitors
        </span>
      </div>

      <Navbar
        activePage={activePage}
        setActivePage={handlePageChange}
        activeDistrictTab={activeDistrictTab}
        setActiveDistrictTab={handleDistrictTabChange}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onOpenLoginModal={handleOpenLogin}
        onLogout={() => void handleLogout()}
      />

      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {activePage === 'home' && (
          <PublicHome
            onNavigateDistrict={() => handlePageChange('district', 'map-clubs')}
            onNavigatePage={handlePageChange}
            onOpenLoginModal={handleOpenLogin}
          />
        )}

        {activePage === 'district' && (
          <DistrictAccessSection
            clubs={clubs}
            activeDistrictTab={activeDistrictTab}
            isLoggedIn={isLoggedIn}
            userRole={userRole ?? undefined}
            onOpenLoginModal={handleOpenLogin}
            onOpenUploadClubModal={() => setUploaderModalMode('uploadClub')}
          />
        )}

        {activePage !== 'home' && <Footer onNavigatePage={(page: string) => handlePageChange(page)} />}
      </main>

      {uploaderModalMode && (
        <PresidentModal
          mode={uploaderModalMode}
          onClose={() => setUploaderModalMode(null)}
          onAddInitiative={handleAddInitiative}
          clubs={clubs}
          preselectedClub={preselectedClubForModal}
        />
      )}
    </div>
  );
}
