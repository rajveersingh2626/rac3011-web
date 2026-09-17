import { useState } from 'react';
import { Menu as MenuIcon } from 'lucide-react';
import { Link } from 'react-router';
import { useSurfaceHref } from '@/app/host';
import { cn } from '@/lib/cn';
import { Drawer } from '@/components/ui/Drawer';
import { useNavPrefetch } from '@/lib/prefetch';

const NAV_LINKS = [
  { label: 'Clubs & Map', to: '/map' },
  { label: 'Showcase', to: '/showcase' },
  { label: 'Initiatives', to: '/initiatives' },
  { label: 'Heritage', to: '/heritage' },
  { label: 'Leadership', to: '/leadership' },
  { label: 'Resources', to: '/resources' },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const prefetchRoute = useNavPrefetch();
  const careerBridgeHref = useSurfaceHref('careerbridge');

  return (
    <header className="sticky top-3 sm:top-4 z-40 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pointer-events-none">
      <div className="pointer-events-auto flex h-14 md:h-16 items-center justify-between px-4 md:px-6 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg shadow-black/5 border border-zinc-200/80">
        <div className="flex items-center gap-6 lg:gap-[34px]">
          <Link to="/" className="flex items-center">
            <img src="/district-logo.webp" alt="Rotaract District Organization 3011" className="h-6 w-auto md:h-7 lg:h-[34px]" />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 text-[13.5px] font-semibold text-fg-2 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onMouseEnter={() => prefetchRoute(link.to)}
                onFocus={() => prefetchRoute(link.to)}
                className="text-fg-2 transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <a href={careerBridgeHref ?? '#'} className="text-[13.5px] font-bold text-accent">
            Career Bridge
          </a>
          <Link
            to="/portal/login"
            className="inline-flex min-h-10 items-center justify-center rounded-xl border-2 border-accent px-[18px] text-[13px] font-bold text-accent hover:bg-accent-soft transition-colors"
          >
            Club Portal
          </Link>
        </div>
        <button
          type="button"
          aria-label="Open menu"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className={cn('inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-fg lg:hidden border border-zinc-200 hover:bg-zinc-100 transition-colors')}
        >
          <MenuIcon aria-hidden className="size-5" />
        </button>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} title="Menu" side="right">
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-[8px] px-2 text-[14px] font-semibold text-fg hover:bg-accent-soft"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={careerBridgeHref ?? '#'}
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center rounded-[8px] px-2 text-[14px] font-bold text-accent"
          >
            Career Bridge
          </a>
        </nav>
        <Link
          to="/portal/login"
          onClick={() => setOpen(false)}
          className="mt-4 flex min-h-11 items-center justify-center rounded-[8px] border-2 border-accent px-4 text-[14px] font-bold text-accent"
        >
          Club Portal
        </Link>
      </Drawer>
    </header>
  );
}
