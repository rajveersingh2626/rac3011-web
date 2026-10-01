import { useState, useEffect } from 'react';
import DistrictLogo from './DistrictLogo';
import { Heart, ExternalLink } from 'lucide-react';

interface FooterLinkProps {
  href: string;
  label: string;
  page?: 'home' | 'district' | 'portal';
  tab?: string;
  isExternal?: boolean;
  onNavigatePage?: (page: string, tab?: string) => void;
  isMobile?: boolean;
  icon?: React.ReactNode;
}

function FooterLink({
  href,
  label,
  page,
  tab,
  isExternal,
  onNavigatePage,
  isMobile,
  icon,
}: FooterLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Preserve browser default for modified clicks (e.g. Cmd/Ctrl/Shift/middle click) or external links
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || isExternal) {
      return;
    }

    if (onNavigatePage) {
      if (page === 'home') {
        e.preventDefault();
        onNavigatePage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (page === 'district') {
        e.preventDefault();
        onNavigatePage('district', tab || 'map-clubs');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (page === 'portal') {
        e.preventDefault();
        onNavigatePage('portal');
        return;
      }
    }
  };

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        color: isHovered ? '#FFFFFF' : '#A1A1AA',
        fontSize: '0.9rem',
        textDecoration: 'none',
        transition: 'color 0.15s ease',
        padding: isMobile ? '8px 0' : '4px 0',
        minHeight: isMobile ? '40px' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
      }}
    >
      <span>{label}</span>
      {icon}
    </a>
  );
}

export interface FooterProps {
  onNavigatePage?: (page: string, tab?: string) => void;
  isFullScreen?: boolean;
}

export default function Footer({ onNavigatePage, isFullScreen = false }: FooterProps) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <footer
      style={{
        backgroundColor: '#18181B',
        color: '#FAFAFA',
        borderTop: '4px solid var(--rotaract-pink)',
        paddingTop: isMobile ? '40px' : '60px',
        paddingBottom: isMobile ? 'calc(78px + env(safe-area-inset-bottom, 8px))' : '40px',
        position: 'relative',
        zIndex: 20,
        width: '100%',
        minHeight: isFullScreen ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr 1fr 1fr', gap: isMobile ? '28px' : '36px', marginBottom: isMobile ? '32px' : '48px' }}>
          
          <div>
            <a
              href="/"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0 && onNavigatePage) {
                  e.preventDefault();
                  onNavigatePage('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              style={{ background: 'transparent', padding: '0px', display: 'inline-block', marginBottom: '16px', textDecoration: 'none' }}
              aria-label="District 3011 Home"
            >
              <DistrictLogo size="small" />
            </a>
            <p style={{ color: '#A1A1AA', fontSize: isMobile ? '0.85rem' : '0.88rem', lineHeight: '1.65', marginBottom: '16px' }}>
              Rotaract District Organization 3011 unites 75+ clubs across Delhi NCR &amp; Haryana under Rotary International for service, youth leadership, and international fellowship.
            </p>
            <span className="pill-gold" style={{ fontSize: '0.78rem' }}>
              Service Above Self • RY 2026-27
            </span>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', letterSpacing: '0.5px' }}>
              District &amp; Governance
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? '2px' : '4px' }}>
              <li>
                <FooterLink href="/" label="Home Page" page="home" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/map" label="District Map & Directory" page="district" tab="map-clubs" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/leadership" label="District Team & Council" page="district" tab="leadership" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/heritage" label="Council of DRRs" page="district" tab="heritage" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/governance" label="Governance & Demarcations" page="district" tab="leadership" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/calendar" label="District Calendar" page="district" tab="calendar" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', letterSpacing: '0.5px' }}>
              Impact &amp; Media
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? '2px' : '4px' }}>
              <li>
                <FooterLink href="/initiatives" label="Flagship Initiatives" page="district" tab="initiatives" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/showcase" label="Project Showcase" page="district" tab="initiatives" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/achievements" label="District Achievements" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/publications" label="District Newsletters" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/partners" label="Corporate & Community Partners" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', letterSpacing: '0.5px' }}>
              Connect &amp; Resources
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? '2px' : '4px' }}>
              <li>
                <FooterLink href="/resources" label="Official Resources Archive" page="district" tab="resources" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/resources/sister-club" label="Sister-Club Requests" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/get-involved/new-club" label="Start a New Club" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/contact" label="Contact & Enquiries" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/portal/login" label="Member Portal Login" page="portal" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink href="/portal/feedback" label="Grievances & Feedback" onNavigatePage={onNavigatePage} isMobile={isMobile} />
              </li>
              <li>
                <FooterLink
                  href="https://www.instagram.com/rotaractdistrict.3011/"
                  label="Official Instagram"
                  isExternal
                  icon={<ExternalLink size={13} />}
                  isMobile={isMobile}
                />
              </li>
            </ul>
          </div>

        </div>

        {/* Official Motto in Cursive with Quotations */}
        <div
          style={{
            borderTop: '1px solid #27272A',
            paddingTop: '20px',
            paddingBottom: '16px',
            textAlign: 'center'
          }}
        >
          <p
            style={{
              fontFamily: "'Dancing Script', 'Great Vibes', cursive",
              fontSize: isMobile ? '1.25rem' : '1.65rem',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.92)',
              margin: 0,
              letterSpacing: '0.4px',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}
          >
            “Start with rotaract and good things happen”
          </p>
        </div>

        {/* Bottom copyright & legal bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '18px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'center' : 'space-between',
          alignItems: 'center',
          gap: isMobile ? '12px' : '16px',
          fontSize: '0.85rem',
          color: '#71717A',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <div>
            © 2026 Rotaract District Organization 3011. All Rights Reserved.
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem' }}>
            <a
              href="/privacy-policy"
              style={{ color: '#A1A1AA', textDecoration: 'none', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1AA')}
            >
              Privacy Policy
            </a>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <a
              href="/terms-of-service"
              style={{ color: '#A1A1AA', textDecoration: 'none', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1AA')}
            >
              Terms of Service
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Built with <Heart size={14} fill="#D81B60" color="#D81B60" /> for District 3011 Rotaractors
          </div>
        </div>
      </div>
    </footer>
  );
}
