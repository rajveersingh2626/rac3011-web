import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import PublicHome from './components/Pages/PublicHome';
import PresidentModal from './components/Modals/PresidentModal';
import { type ClubInitiative } from './data/districtData';
import { useDistrictClubs, type DistrictClubLive } from './hooks/useDistrictClubs';
import { useAuth } from '@/app/auth';
import { useLiveVisits, useVisitOnce } from '@/lib/publicApi/live';

const DistrictAccess = lazy(() => import('./components/Pages/DistrictAccess'));

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

  const initialPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const initialRoute = ROUTE_MAP[initialPath] ?? { page: 'home', tab: 'map-clubs' };

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
      const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const route = ROUTE_MAP[currentPath] ?? { page: 'home' as const, tab: 'map-clubs' };
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

  const [showCurtain, setShowCurtain] = useState(true);
  const [curtainAnimated, setCurtainAnimated] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurtainAnimated(true), 150);
    const timer2 = setTimeout(() => setShowCurtain(false), 2200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

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
          top: isMobile ? '14px' : '22px',
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
          <Suspense
            fallback={
              <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <RotaryLoaderLogo size={64} />
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--rotaract-pink)', letterSpacing: '1px' }}>
                  LOADING DISTRICT 3011 DIRECTORY...
                </div>
              </div>
            }
          >
            <DistrictAccess
              clubs={clubs}
              activeDistrictTab={activeDistrictTab}
              isLoggedIn={isLoggedIn}
              userRole={userRole ?? undefined}
              onOpenLoginModal={handleOpenLogin}
              onOpenUploadClubModal={() => setUploaderModalMode('uploadClub')}
            />
          </Suspense>
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
