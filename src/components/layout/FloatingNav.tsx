import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router';
import { Home, ChevronDown, Globe, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/app/auth';
import { Drawer } from '@/components/ui/Drawer';
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

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex min-h-11 items-center gap-2.5 rounded-[8px] px-3.5 text-[13.5px] font-semibold transition-colors',
    isActive ? 'bg-accent-soft text-accent font-bold' : 'text-fg-2 hover:bg-accent-soft hover:text-accent',
  );

function MenuLinks({ links, homeHref, onPick }: { links: FloatingNavLink[]; homeHref: string; onPick: () => void }) {
  const { me } = useAuth();
  return (
    <div className="flex flex-col gap-1">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} onClick={onPick} className={linkClass}>
          {l.icon}
          {l.label}
        </NavLink>
      ))}
      {links.length > 0 && <div className="my-2 border-t border-line-accent" />}
      <a href={homeHref} className="flex min-h-11 items-center gap-2.5 rounded-[8px] px-3.5 text-[13.5px] font-semibold text-fg-2 hover:bg-accent-soft hover:text-accent">
        <Globe size={16} className="text-accent" /> District Website
      </a>
      <a
        href={me ? '/portal/dashboard' : '/portal/login'}
        className="flex min-h-11 items-center gap-2.5 rounded-[8px] px-3.5 text-[13.5px] font-bold text-accent hover:bg-accent-soft"
      >
        <LayoutDashboard size={16} /> {me ? `Dashboard (${me.user.name})` : 'Portal'}
      </a>
    </div>
  );
}

export function FloatingNav({ links, homeHref, title }: FloatingNavProps) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const onEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHovered(true);
  };
  const onLeave = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setHovered(false), 280);
  };

  // Desktop: pill hides until hover/scroll/open. Mobile: always shown (CSS below ignores data-shown).
  const shown = hovered || revealed || open;

  return (
    <>
      <div
        className="fixed top-0 left-1/2 z-50 -translate-x-1/2"
        data-shown={shown ? 'true' : 'false'}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {/* Desktop-only affordance tab, visible while the pill is hidden */}
        <button
          type="button"
          aria-label="Show navigation"
          onClick={() => setHovered(true)}
          className={cn(
            'wide-only absolute top-0 left-1/2 flex h-5 w-12 -translate-x-1/2 items-center justify-center rounded-b-[10px] bg-[#2B2B2B] text-white/80 transition-opacity duration-300',
            shown ? 'pointer-events-none opacity-0' : 'opacity-100',
          )}
        >
          <ChevronDown size={14} />
        </button>

        <div
          data-pill
          className={cn(
            'mt-4 flex items-center gap-1 rounded-full bg-[#2B2B2B] px-2 py-1.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-[transform,opacity] duration-300',
            // On desktop slide away when hidden; the narrow-only rule below keeps it on-screen for mobile.
            shown ? 'translate-y-0 opacity-100' : 'md:-translate-y-[120px] md:opacity-0',
          )}
        >
          <a
            href={homeHref}
            aria-label="Home"
            className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/10 md:size-9"
          >
            <Home size={20} />
          </a>
          <span aria-hidden className="mx-1 h-5 w-px bg-white/25" />
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="flex min-h-11 items-center rounded-full px-4 text-[13px] font-extrabold tracking-[2px] transition-colors hover:bg-white/10 md:min-h-9"
          >
            MENU
          </button>
        </div>

        {/* Desktop panel, anchored under the pill */}
        <div
          ref={panelRef}
          role="dialog"
          aria-label={`${title} menu`}
          className={cn(
            'wide-only mt-3 w-[320px] rounded-[16px] border border-line-accent bg-white/92 p-3 shadow-lift backdrop-blur-md transition-[transform,opacity] duration-200',
            open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
          )}
        >
          {open && (
            <>
              <p className="eyebrow-pill mx-3.5 mt-1 mb-3 self-start">{title}</p>
              <MenuLinks links={links} homeHref={homeHref} onPick={() => setOpen(false)} />
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer, same links */}
      <div className="narrow-only">
        <Drawer open={open} onClose={() => setOpen(false)} title={title} side="left">
          <MenuLinks links={links} homeHref={homeHref} onPick={() => setOpen(false)} />
        </Drawer>
      </div>
    </>
  );
}
