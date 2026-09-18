import { useState, useEffect, useRef } from 'react';
import MorphedMenu, { type DistrictUserRole } from './MorphedMenu';
import MobileBottomNav from './MobileBottomNav';
import { Home, MapPin, Award, Users, FolderOpen, Calendar, Sparkles, Image as ImageIcon } from 'lucide-react';

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
    { id: 'gallery', label: 'Event Gallery', shortLabel: 'Gallery', icon: <ImageIcon size={18} /> },
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
    <>
      <div
        ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        pointerEvents: 'auto',
        width: isMobile ? 'calc(100% - 24px)' : 'auto',
        maxWidth: isMobile ? '460px' : '1100px',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : 'center',
          width: isMobile ? '100%' : 'auto',
          gap: isMobile ? '8px' : '10px',
          padding: isMobile ? '6px 12px' : '7px 16px 7px 12px',
          backgroundColor: isMenuOpen ? 'transparent' : 'rgba(15, 23, 42, 0.90)',
          backdropFilter: isMenuOpen ? 'none' : 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: isMenuOpen ? 'none' : 'blur(20px) saturate(180%)',
          border: isMenuOpen ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '100px',
          boxShadow: isMenuOpen 
            ? 'none' 
            : '0 12px 36px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          transform: 'translateY(0)',
          opacity: 1,
          pointerEvents: 'auto',
          transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease'
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

        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', padding: '0 4px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {activePage === 'home' ? 'RID 3011' : (districtSubTabs.find(t => t.id === activeDistrictTab)?.shortLabel || 'District')}
            </span>
          </div>
        )}

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
      </div>
    </div>

    {isMobile && (
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
    )}
  </>
  );
}
