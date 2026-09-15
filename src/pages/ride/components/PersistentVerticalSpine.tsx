import { useEffect, useState } from 'react';

interface Station {
  id: string;
  num: string;
  name: string;
}

const STATIONS: Station[] = [
  { id: 'hero', num: '01', name: 'DELHI MERI JAAN' },
  { id: 'itinerary', num: '02', name: '4-DAY TRAIL' },
  { id: 'gallery', num: '03', name: 'SNAP FEED' },
  { id: 'editions', num: '04', name: 'EDITIONS' },
  { id: 'register', num: '05', name: 'DELEGATE PASS' },
];

export function PersistentVerticalSpine() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStation, setActiveStation] = useState<string>('hero');

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, scrolled)));

      // Determine active section
      for (let i = STATIONS.length - 1; i >= 0; i--) {
        const station = STATIONS[i];
        const el = document.getElementById(station.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            setActiveStation(station.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Desktop/Tablet Persistent Vertical Spine (Left Flank) */}
      <aside
        aria-label="Website scroll navigation track"
        className="fixed top-0 bottom-0 left-3 sm:left-6 lg:left-8 z-40 hidden md:flex flex-col items-center justify-between py-12 pointer-events-none select-none"
      >
        {/* Top Tag */}
        <div className="bg-[#171515] text-[#FDFBF7] px-2 py-1 rounded border-2 border-[#171515] text-[10px] font-black uppercase tracking-widest ride-pop-sm pointer-events-auto">
          DMRC 3011
        </div>

        {/* Central Vertical Track Line */}
        <div className="relative flex-1 w-1 sm:w-1.5 my-6 bg-[#171515]/20 rounded-full flex flex-col items-center">
          {/* Active Fill Line */}
          <div
            className="absolute top-0 left-0 w-full bg-[#EA6623] rounded-full transition-all duration-150"
            style={{ height: `${scrollProgress}%` }}
          />

          {/* Moving Metro Train Beacon */}
          <div
            className="absolute -left-3 sm:-left-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 sm:border-3 border-[#171515] bg-[#FBC02D] ride-pop-sm flex items-center justify-center transition-all duration-150 pointer-events-auto cursor-pointer"
            style={{ top: `calc(${scrollProgress}% - 16px)` }}
            title={`Scroll Progress: ${Math.round(scrollProgress)}%`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#C72425] animate-ping" />
          </div>

          {/* Station checkpoints along the line */}
          <div className="absolute inset-y-0 flex flex-col justify-between items-center py-2 pointer-events-auto">
            {STATIONS.map((st) => {
              const isActive = activeStation === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => scrollToSection(st.id)}
                  className="group relative flex items-center cursor-pointer focus:outline-none"
                  aria-label={`Scroll to ${st.name}`}
                >
                  {/* Station Node Dot */}
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 border-[#171515] transition-all duration-200 ${
                      isActive
                        ? 'bg-[#19539D] scale-125 ring-3 ring-[#19539D]/30'
                        : 'bg-white hover:bg-[#EA6623] hover:scale-110'
                    }`}
                  />

                  {/* Flyout Station Label */}
                  <span
                    className={`absolute left-6 whitespace-nowrap px-2.5 py-1 rounded-md border-2 border-[#171515] text-[11px] font-black uppercase tracking-wider ride-pop-sm transition-all duration-200 ${
                      isActive
                        ? 'opacity-100 translate-x-0 bg-[#171515] text-white'
                        : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 bg-white text-[#171515]'
                    }`}
                  >
                    {st.num} • {st.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Percentage */}
        <div className="bg-white text-[#171515] px-2 py-1 rounded border-2 border-[#171515] text-[10px] font-black tracking-wider ride-pop-sm pointer-events-auto">
          {Math.round(scrollProgress)}%
        </div>
      </aside>

      {/* Mobile Ultra-Slim Persistent Vertical Track Indicator (Left Edge) */}
      <div
        className="fixed top-0 bottom-0 left-0 w-1.5 z-40 md:hidden pointer-events-none bg-neutral-200/60"
        aria-hidden="true"
      >
        <div
          className="w-full bg-gradient-to-b from-[#EA6623] via-[#FBC02D] to-[#19539D] transition-all duration-100"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>
    </>
  );
}
