import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router';
import { ChevronDown, Home, X, LogIn, ExternalLink } from 'lucide-react';
import { useAuth } from '@/app/auth';
import { portalHref } from '@/app/host';
import { useFocusTrap } from '@/components/ui/useFocusTrap';
import { cn } from '@/lib/cn';

export interface FloatingNavLink {
  label: string;
  to: string;
  icon?: ReactNode;
}

export interface FloatingNavProps {
  links: FloatingNavLink[];
  homeHref: string;
  title: string;
}

const INSTAGRAM_HREF = 'https://www.instagram.com/rotaractdistrict.3011/';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex min-h-11 items-center gap-3 rounded-[12px] px-3.5 text-[14px] font-bold text-white/85 transition-colors hover:bg-white/10',
    isActive && 'bg-white/10 text-white',
  );

export function FloatingNav({ links, homeHref, title }: FloatingNavProps) {
  const { me } = useAuth();
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    const onScroll = () => setRevealed(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const onEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHovered(true);
  };
  const onLeave = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setHovered(false), 280);
  };

  // Desktop: pill hides until hover/scroll/open. Mobile: always shown via the `md:` translate classes below.
  const shown = hovered || revealed || open;
  const portalCtaHref = me ? portalHref('/portal/dashboard') : portalHref('/portal/login');

  return (
    <div
      ref={wrapperRef}
      className="fixed top-0 left-1/2 z-50 flex min-w-[320px] -translate-x-1/2 justify-center pt-5 pb-5"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Desktop-only affordance tab, visible while the pill is hidden */}
      <button
        type="button"
        aria-label="Show navigation"
        onClick={() => setHovered(true)}
        className={cn(
          'wide-only absolute top-0 left-1/2 flex h-[18px] w-[52px] -translate-x-1/2 items-end justify-center rounded-b-[10px] border border-t-0 border-white/[0.18] pb-0.5 transition-opacity duration-300',
          shown ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
        style={{
          backgroundColor: 'rgba(15, 18, 24, 0.75)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.35)',
        }}
      >
        <ChevronDown size={12} color="#FFFFFF" aria-hidden="true" />
      </button>

      <div
        className={cn(
          'inline-flex scale-110 items-center gap-[10px] rounded-full',
          shown ? 'translate-y-0' : 'md:-translate-y-[120px]',
          open ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
        style={{
          padding: '7px 16px 7px 10px',
          backgroundColor: 'rgba(15, 18, 24, 0.75)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
          transition: 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <a
          href={homeHref}
          aria-label="Home"
          title="Home"
          style={{ color: '#FFFFFF' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#123499';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
          }}
          className="flex size-11 items-center justify-center rounded-full transition-colors md:size-9"
        >
          <Home size={22} className="md:hidden" />
          <Home size={20} className="hidden md:block" />
        </a>

        <span aria-hidden className="mx-0.5 h-5 w-px" style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)' }} />

        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-11 items-center rounded-full px-1.5 text-[12px] font-extrabold tracking-[2px] text-white transition-colors hover:bg-white/10 md:min-h-9"
        >
          MENU
        </button>
      </div>

      {/* Single dark glass menu panel at every width */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={`${title} menu`}
        className={cn(
          'absolute top-5 left-1/2 w-[min(400px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-[24px] border border-white/10 p-5 transition-[transform,opacity] duration-200',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
        )}
        style={{
          backgroundColor: 'rgba(15, 18, 24, 0.92)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55)',
        }}
      >
        <div
          aria-hidden
          className="absolute top-0 left-0 h-[3px] w-full rounded-t-[24px]"
          style={{ background: 'linear-gradient(90deg, #D81B60, #123499, #880E4F)' }}
        />

        {open && (
          <>
            <div className="flex items-center justify-between">
              <img src="/district-logo.png" alt="Rotaract District Organization 3011" className="h-8 w-auto" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/15 bg-white/10 px-3 py-1.5 text-[13px] font-bold text-white"
              >
                <X size={14} /> Close
              </button>
            </div>

            {links.length > 0 && (
              <>
                <p className="mt-4 mb-2 text-[10px] font-extrabold tracking-[1.6px] text-white/55 uppercase">{title}</p>
                <div className="flex flex-col gap-1">
                  {links.map((l) => (
                    <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={linkClass}>
                      {({ isActive }) => (
                        <>
                          {l.icon && <span className="text-white/80">{l.icon}</span>}
                          {l.label}
                          {isActive && <span className="ml-auto size-1.5 rounded-full bg-[#F0407F]" />}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </>
            )}

            <div className="my-4 border-t border-white/10" />

            <a
              href={portalCtaHref}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-[#D81B60] to-[#C21350] text-[14px] font-extrabold text-white shadow-[0_10px_28px_rgba(216,27,96,0.35)]"
            >
              <LogIn size={16} /> {me ? 'Open District Portal' : 'Login to District Portal'}
            </a>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              <a href={homeHref} className="text-white/70 hover:text-white">
                District Website
              </a>
              <a
                href={INSTAGRAM_HREF}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-white/70 hover:text-white"
              >
                Official Instagram <ExternalLink size={12} />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
