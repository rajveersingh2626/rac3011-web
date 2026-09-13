import { useState, useEffect, type CSSProperties } from 'react';
import DistrictLogo from './DistrictLogo';
import { Heart, ExternalLink } from 'lucide-react';

export interface FooterProps {
  onNavigatePage?: (page: string) => void;
  isFullScreen?: boolean;
}

export default function Footer({ onNavigatePage, isFullScreen = false }: FooterProps) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* Shared style for nav link buttons — 44px touch target on mobile */
  const navLinkStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#A1A1AA',
    fontSize: '0.9rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'color 0.2s',
    padding: isMobile ? '10px 0' : '4px 0',
    minHeight: isMobile ? '44px' : 'auto',
    display: 'flex',
    alignItems: 'center'
  };

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
            <div style={{ background: 'transparent', padding: '0px', display: 'inline-block', marginBottom: '16px' }}>
              <DistrictLogo size="small" />
            </div>
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
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? '2px' : '6px' }}>
              <li>
                <button onClick={() => (onNavigatePage ? onNavigatePage('home') : (window.location.href = '/'))} style={navLinkStyle}>
                  Home Page
                </button>
              </li>
              <li>
                <button onClick={() => (onNavigatePage ? onNavigatePage('district') : (window.location.href = '/map'))} style={navLinkStyle}>
                  District Map &amp; Directory
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = '/leadership')} style={navLinkStyle}>
                  District Team &amp; Council
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = '/heritage')} style={navLinkStyle}>
                  Past DRRs (Heritage)
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = '/governance')} style={navLinkStyle}>
                  Governance &amp; Demarcations
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', letterSpacing: '0.5px' }}>
              Impact &amp; Media
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? '2px' : '6px' }}>
              <li>
                <button onClick={() => (window.location.href = '/initiatives')} style={navLinkStyle}>
                  Flagship Initiatives
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = '/showcase')} style={navLinkStyle}>
                  Project Showcase
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = '/achievements')} style={navLinkStyle}>
                  District Achievements
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = '/publications')} style={navLinkStyle}>
                  District Newsletters
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = '/partners')} style={navLinkStyle}>
                  Corporate &amp; Community Partners
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', letterSpacing: '0.5px' }}>
              Connect &amp; Resources
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? '2px' : '6px' }}>
              <li>
                <button onClick={() => (window.location.href = '/resources')} style={navLinkStyle}>
                  Official Resources Archive
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = '/resources/sister-club')} style={navLinkStyle}>
                  Sister-Club Requests
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = '/contact')} style={navLinkStyle}>
                  Contact &amp; Enquiries
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = '/portal/login')} style={navLinkStyle}>
                  Member Portal Login
                </button>
              </li>
              <li>
                <button onClick={() => (window.location.href = '/portal/feedback')} style={navLinkStyle}>
                  Grievances &amp; Feedback
                </button>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/rotaractdistrict.3011/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...navLinkStyle, color: '#A1A1AA', textDecoration: 'none', gap: '6px' }}
                >
                  Official Instagram <ExternalLink size={13} />
                </a>
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

        {/* Bottom copyright bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '18px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'center' : 'space-between',
          alignItems: 'center',
          gap: isMobile ? '10px' : '16px',
          fontSize: '0.85rem',
          color: '#71717A',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <div>
            © 2026 Rotaract District Organization 3011. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Built with <Heart size={14} fill="#D81B60" color="#D81B60" /> for District 3011 Rotaractors
          </div>
        </div>
      </div>
    </footer>
  );
}
