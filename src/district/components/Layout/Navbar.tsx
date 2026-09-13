import { useState, useEffect, useRef } from 'react';
import MorphedMenu, { type DistrictUserRole } from './MorphedMenu';
import MobileBottomNav from './MobileBottomNav';
import { Home, MapPin, Award, Users, FolderOpen, Calendar, ChevronDown, Sparkles } from 'lucide-react';

export interface NavbarProps {
  activePage: string;
  setActivePage: (page: string, districtTab?: string) => void;
  activeDistrictTab: string;
  setActiveDistrictTab?: (tab: string) => void;
  isLoggedIn: boolean;
  userRole: DistrictUserRole;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export default function Navbar({
  activePage,
  setActivePage,
  activeDistrictTab,
  setActiveDistrictTab,
  isLoggedIn,
  userRole,
  onOpenLoginModal,
  onLogout
}: NavbarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredSubTab, setHoveredSubTab] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768 && window.innerWidth < 1024);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 280);
  };

  // On mobile: always show the navbar (no hover on touch devices)
  const shouldShowNavbar = isMobile || isHovered || isScrolled || isMenuOpen;

  const districtSubTabs = [
    { id: 'map-clubs', label: 'Interactive Map & Clubs', shortLabel: 'Map & Clubs', icon: <MapPin size={18} /> },
    { id: 'initiatives', label: 'Rotaract Showcase', shortLabel: 'Showcase', icon: <Sparkles size={18} /> },
    { id: 'heritage', label: 'Past DRR & Heritage', shortLabel: 'Heritage', icon: <Award size={18} /> },
    { id: 'leadership', label: 'District Leadership', shortLabel: 'Leadership', icon: <Users size={18} /> },
    { id: 'resources', label: 'Resources & Drive', shortLabel: 'Resources', icon: <FolderOpen size={18} /> },
    { id: 'calendar', label: 'District Calendar', shortLabel: 'Calendar', icon: <Calendar size={18} /> }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const snapContainer = document.querySelector('.snap-container');
      const containerScroll = snapContainer ? snapContainer.scrollTop : 0;
      const windowScroll = window.scrollY || document.documentElement.scrollTop;
      const currentScroll = Math.max(windowScroll, containerScroll);

      if (currentScroll > 200) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const snapContainer = document.querySelector('.snap-container');
    if (snapContainer) {
      snapContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    const interval = setInterval(handleScroll, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (snapContainer) {
        snapContainer.removeEventListener('scroll', handleScroll);
      }
      clearInterval(interval);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [activePage]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // While hidden the wrapper is pointer-events:none, so onMouseEnter can never fire;
  // hit-test the pointer against its box instead to keep hover-to-reveal working.
  useEffect(() => {
    if (isMobile || shouldShowNavbar) return;
    const handlePointerMove = (e: MouseEvent) => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        handleMouseEnter();
      }
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [isMobile, shouldShowNavbar]);

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        top: '0px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        pointerEvents: shouldShowNavbar ? 'auto' : 'none',
        paddingTop: '20px',
        paddingBottom: '20px',
        minWidth: '320px',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      {/* Persistent affordance: shows a menu exists before any hover/scroll on desktop/tablet */}
      <button
        type="button"
        className="wide-only"
        onClick={handleMouseEnter}
        onMouseEnter={handleMouseEnter}
        onFocus={(e) => {
          handleMouseEnter();
          e.currentTarget.style.boxShadow = '0 0 0 2px #123499, 0 8px 16px rgba(0, 0, 0, 0.35)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.35)';
        }}
        aria-label="Show navigation menu"
        aria-expanded={shouldShowNavbar}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '52px',
          height: '18px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: '2px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          backgroundColor: 'rgba(15, 18, 24, 0.75)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.35)',
          cursor: 'pointer',
          zIndex: 1001,
          opacity: shouldShowNavbar ? 0 : 1,
          pointerEvents: shouldShowNavbar ? 'none' : 'auto',
          transition: 'opacity 0.3s ease',
          outline: 'none'
        }}
      >
        <ChevronDown size={12} color="#FFFFFF" aria-hidden="true" />
      </button>

      <div
        className="wide-only"
        style={{
          display: isMobile ? 'none' : 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '7px 16px 7px 10px',
          backgroundColor: isMenuOpen ? 'transparent' : 'rgba(15, 18, 24, 0.75)',
          backdropFilter: isMenuOpen ? 'none' : 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: isMenuOpen ? 'none' : 'blur(24px) saturate(180%)',
          border: isMenuOpen ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '9999px',
          boxShadow: isMenuOpen 
            ? 'none' 
            : '0 14px 40px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
          transform: shouldShowNavbar ? 'translateY(0) scale(1.1)' : 'translateY(-120px) scale(1.1)',
          opacity: shouldShowNavbar ? 1 : 0,
          pointerEvents: shouldShowNavbar ? 'auto' : 'none',
          transition: 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease'
        }}
      >
        <button
          onClick={() => setActivePage('home')}
          title="Home"
          aria-label="Go to Home"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            /* 44×44px touch target on mobile, 36×36px on desktop */
            width: isMobile ? '44px' : '36px',
            height: isMobile ? '44px' : '36px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#FFFFFF',
            cursor: 'pointer',
            opacity: isMenuOpen ? 0 : 1,
            pointerEvents: isMenuOpen ? 'none' : 'auto',
            transition: 'opacity 0.25s ease, color 0.2s ease',
            outline: 'none',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (!isMenuOpen) e.currentTarget.style.color = '#123499';
          }}
          onMouseLeave={(e) => {
            if (!isMenuOpen) e.currentTarget.style.color = '#FFFFFF';
          }}
        >
          <Home size={isMobile ? 22 : 20} />
        </button>

        <div 
          style={{ 
            width: '1px', 
            height: '20px', 
            backgroundColor: 'rgba(255, 255, 255, 0.18)', 
            margin: '0 2px',
            opacity: isMenuOpen ? 0 : 1,
            transition: 'opacity 0.25s ease'
          }} 
        />


        {/* District sub-tabs: hidden on mobile (use MorphedMenu instead), shown on tablet+ */}
        {activePage === 'district' && (
          <>
            <div
              className="wide-only"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: isTablet ? '2px' : '4px',
                opacity: isMenuOpen ? 0 : 1,
                pointerEvents: isMenuOpen ? 'none' : 'auto',
                transition: 'opacity 0.25s ease'
              }}
            >
              {districtSubTabs.map((tab) => {
                const isTabActive = activePage === 'district' && activeDistrictTab === tab.id;
                const isTabHovered = hoveredSubTab === tab.id;
                // On tablet: only expand active tab labels to save space
                const isExpanded = isTablet ? isTabActive : (isTabHovered || isTabActive);

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (setActiveDistrictTab) {
                        setActiveDistrictTab(tab.id);
                      } else {
                        setActivePage('district', tab.id);
                      }
                    }}
                    onMouseEnter={() => setHoveredSubTab(tab.id)}
                    onMouseLeave={() => setHoveredSubTab(null)}
                    title={tab.label}
                    aria-label={tab.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: isExpanded ? '6px 10px' : '6px 8px',
                      borderRadius: '16px',
                      border: 'none',
                      backgroundColor: isTabActive 
                        ? 'rgba(255, 255, 255, 0.18)' 
                        : isTabHovered 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'transparent',
                      color: isTabHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
                      cursor: 'pointer',
                      transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                      outline: 'none',
                      minHeight: '36px'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', color: isTabActive ? '#123499' : 'inherit', flexShrink: 0 }}>
                      {tab.icon}
                    </span>

                    <span
                      style={{
                        maxWidth: isExpanded ? '100px' : '0px',
                        opacity: isExpanded ? 1 : 0,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        fontSize: isTablet ? '0.72rem' : '0.8rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      {tab.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="wide-only"
              style={{ 
                width: '1px', 
                height: '20px', 
                backgroundColor: 'rgba(255, 255, 255, 0.18)', 
                margin: '0 2px',
                opacity: isMenuOpen ? 0 : 1,
                transition: 'opacity 0.25s ease'
              }} 
            />
          </>
        )}

        {!isMobile && (
          <MorphedMenu
            activePage={activePage}
            setActivePage={setActivePage}
            activeDistrictTab={activeDistrictTab}
            setActiveDistrictTab={setActiveDistrictTab}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            onOpenLoginModal={onOpenLoginModal}
            onLogout={onLogout}
            onMenuOpenChange={setIsMenuOpen}
            isOpenProp={isMenuOpen}
          />
        )}
      </div>

      {isMobile && (
        <>
          <MorphedMenu
            activePage={activePage}
            setActivePage={setActivePage}
            activeDistrictTab={activeDistrictTab}
            setActiveDistrictTab={setActiveDistrictTab}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            onOpenLoginModal={onOpenLoginModal}
            onLogout={onLogout}
            onMenuOpenChange={setIsMenuOpen}
            isOpenProp={isMenuOpen}
          />

          <MobileBottomNav
            activePage={activePage}
            activeDistrictTab={activeDistrictTab}
            onNavigate={(page, tab) => {
              setIsMenuOpen(false);
              if (page === 'district' && tab) {
                if (setActiveDistrictTab) setActiveDistrictTab(tab);
                setActivePage('district', tab);
              } else {
                setActivePage(page, tab);
              }
            }}
            onOpenMenu={() => {
              setIsMenuOpen((prev) => !prev);
            }}
          />
        </>
      )}
    </div>
  );
}
