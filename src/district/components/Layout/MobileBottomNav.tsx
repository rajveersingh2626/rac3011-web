import { FC, memo } from 'react';
import { Home, MapPin, Award, Users, Sparkles } from 'lucide-react';

export interface MobileBottomNavProps {
  activePage: string;
  activeDistrictTab: string;
  onNavigate: (page: string, districtTab?: string) => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: FC<MobileBottomNavProps> = memo(({
  activePage,
  activeDistrictTab,
  onNavigate,
  onOpenMenu,
}) => {
  const isHome = activePage === 'home';
  const isClubs = activePage === 'district' && (activeDistrictTab === 'map-clubs' || !activeDistrictTab);
  const isHeritage = activePage === 'district' && activeDistrictTab === 'heritage';
  const isLeadership = activePage === 'district' && activeDistrictTab === 'leadership';

  const items = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={20} />,
      active: isHome,
      onClick: () => onNavigate('home'),
    },
    {
      id: 'clubs',
      label: 'Clubs',
      icon: <MapPin size={20} />,
      active: isClubs,
      onClick: () => onNavigate('district', 'map-clubs'),
    },
    {
      id: 'heritage',
      label: 'Heritage',
      icon: <Award size={20} />,
      active: isHeritage,
      onClick: () => onNavigate('district', 'heritage'),
    },
    {
      id: 'leadership',
      label: 'Leaders',
      icon: <Users size={20} />,
      active: isLeadership,
      onClick: () => onNavigate('district', 'leadership'),
    },
    {
      id: 'menu',
      label: 'Explore',
      icon: <Sparkles size={20} />,
      active: false,
      onClick: onOpenMenu,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        backgroundColor: 'rgba(15, 18, 26, 0.95)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '6px 6px calc(max(8px, env(safe-area-inset-bottom, 8px))) 6px',
        boxSizing: 'border-box',
      }}
    >
      {items.map((item) => {
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            aria-label={item.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              padding: '6px 8px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: item.active ? 'rgba(216, 27, 96, 0.22)' : 'transparent',
              color: item.active ? '#FF4081' : 'rgba(255, 255, 255, 0.72)',
              cursor: 'pointer',
              minWidth: '58px',
              minHeight: '48px',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              outline: 'none',
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {item.active && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  width: '18px',
                  height: '3px',
                  borderRadius: '2px',
                  backgroundColor: '#D81B60',
                  boxShadow: '0 0 10px #D81B60, 0 0 4px #FF4081',
                }}
              />
            )}
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: item.active ? 'scale(1.12)' : 'scale(1)',
                transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: item.active ? 800 : 600,
                letterSpacing: '0.2px',
                color: item.active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.72)',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';
export default MobileBottomNav;
