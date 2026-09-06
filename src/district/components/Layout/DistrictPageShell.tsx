import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/app/auth';

export interface DistrictPageShellProps {
  children: ReactNode;
}

// For public pages outside the district app's pushState routing (URL params, legal, forms):
// same chrome, but navigation goes through the router.
export function DistrictPageShell({ children }: DistrictPageShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { me, signOut } = useAuth();

  const goToDistrict = (tab: string) => {
    const path =
      tab === 'heritage'
        ? '/heritage'
        : tab === 'initiatives' || tab === 'showcase'
          ? '/showcase'
          : tab === 'leadership'
            ? '/governance'
            : tab === 'resources'
              ? '/resources'
              : tab === 'calendar'
                ? '/calendar'
                : '/directory';
    navigate(path);
  };

  const handlePageChange = (page: string, tab?: string) => {
    if (page === 'portal') {
      navigate(me ? '/portal/dashboard' : '/portal/login');
      return;
    }
    if (page === 'home') {
      navigate('/');
      return;
    }
    goToDistrict(tab ?? 'map-clubs');
  };

  const activeTab = location.pathname.startsWith('/heritage')
    ? 'heritage'
    : location.pathname.startsWith('/showcase')
      ? 'initiatives'
      : location.pathname.startsWith('/leadership') || location.pathname.startsWith('/governance')
        ? 'leadership'
        : location.pathname.startsWith('/resources')
          ? 'resources'
          : location.pathname.startsWith('/calendar')
            ? 'calendar'
            : 'map-clubs';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      <Navbar
        activePage="district"
        setActivePage={handlePageChange}
        activeDistrictTab={activeTab}
        setActiveDistrictTab={goToDistrict}
        isLoggedIn={Boolean(me)}
        userRole={me ? (me.roles[0]?.roleKey ?? 'member') : null}
        onOpenLoginModal={() => navigate(me ? '/portal/dashboard' : '/portal/login')}
        onLogout={() => {
          void signOut().finally(() => navigate('/'));
        }}
      />
      <main style={{ flex: 1, minHeight: 0 }}>{children}</main>
      <Footer onNavigatePage={(page: string) => handlePageChange(page)} />
    </div>
  );
}
