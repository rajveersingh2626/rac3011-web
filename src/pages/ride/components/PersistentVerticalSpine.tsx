import { useEffect, useState } from 'react';

interface Station {
  id: string;
  num: string;
  hindi: string;
  name: string;
  isInterchange: boolean;
  interchangeColors?: string[];
}

const STATIONS: Station[] = [
  { id: 'hero', num: '01', hindi: 'कश्मीरी गेट', name: 'KASHMERE GATE', isInterchange: true, interchangeColors: ['#C72425', '#FBC02D', '#8B2671'] },
  { id: 'itinerary', num: '02', hindi: 'चांदनी चौक', name: 'CHANDNI CHOWK', isInterchange: false },
  { id: 'gallery', num: '03', hindi: 'राजीव चौक', name: 'RAJIV CHOWK', isInterchange: true, interchangeColors: ['#0084B4', '#FBC02D'] },
  { id: 'editions', num: '04', hindi: 'हौज़ खास', name: 'HAUZ KHAS', isInterchange: true, interchangeColors: ['#EA6623', '#FBC02D'] },
  { id: 'register', num: '05', hindi: 'केंद्रीय सचिवालय', name: 'CENTRAL SECRETARIAT', isInterchange: true, interchangeColors: ['#8B2671', '#FBC02D'] },
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
      {/* Desktop/Tablet Persistent Vertical Spine (Left Flank - Delhi Metro Route Schematic) */}
      <aside
        aria-label="Delhi Metro scroll navigation line"
        className="fixed top-28 sm:top-36 bottom-6 left-3 sm:left-6 lg:left-8 z-30 hidden md:flex flex-col items-center justify-between py-4 pointer-events-none select-none"
      >
        {/* DMRC Top Station Indicator Badge */}
        <div className="bg-[#0084B4] text-white px-2.5 py-1 rounded-lg border-2 border-[#171515] text-[10px] font-black uppercase tracking-wider ride-pop-sm flex items-center gap-1.5 pointer-events-auto shadow-md">
          <div className="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center text-[8px] font-extrabold bg-[#C72425]">M</div>
          <span>LINE 3011</span>
        </div>

        {/* Central Delhi Metro Track (Yellow Line Style with Inner Core) */}
        <div className="relative flex-1 w-2 sm:w-2.5 my-6 bg-neutral-200 border-x-2 border-[#171515]/30 rounded-full flex flex-col items-center">
          {/* Active DMRC Yellow Line Fill */}
          <div
            className="absolute top-0 left-0 w-full bg-[#FBC02D] border-x-2 border-[#171515] rounded-full transition-all duration-150"
            style={{ height: `${scrollProgress}%` }}
          />

          {/* Gliding DMRC Metro Coach Beacon */}
          <div
            className="absolute -left-4 sm:-left-5 w-10 sm:w-12 h-7 sm:h-8 rounded-lg border-2 border-[#171515] bg-white ride-pop-sm flex items-center justify-center transition-all duration-150 pointer-events-auto cursor-pointer shadow-md overflow-hidden"
            style={{ top: `calc(${scrollProgress}% - 14px)` }}
            title={`DMRC Line 3011 • Scroll Progress: ${Math.round(scrollProgress)}%`}
          >
            <div className="w-full h-full flex flex-col justify-between p-1 bg-gradient-to-b from-white to-neutral-100">
              <div className="flex items-center justify-between px-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C72425] animate-ping" />
                <span className="text-[7.5px] font-black text-[#171515] tracking-tight">DMRC</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#59A835]" />
              </div>
              <div className="w-full h-1 bg-[#FBC02D] rounded-full border-t border-[#171515]/20" />
            </div>
          </div>

          {/* DMRC Station Checkpoints along the Line */}
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
                  {/* Station Node Symbol (Concentric ring for interchange hubs, solid dot for standard stops) */}
                  {st.isInterchange ? (
                    <span
                      className={`relative flex items-center justify-center w-4 h-4 rounded-full border-2 border-[#171515] bg-white transition-all duration-200 ${
                        isActive
                          ? 'scale-125 ring-4 ring-[#FBC02D]/50 shadow-md'
                          : 'hover:scale-110 hover:border-[#EA6623]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full transition-colors ${
                          isActive ? 'bg-[#C72425]' : 'bg-[#171515]'
                        }`}
                      />
                    </span>
                  ) : (
                    <span
                      className={`w-3 h-3 rounded-full border-2 border-[#171515] transition-all duration-200 ${
                        isActive
                          ? 'bg-[#19539D] scale-125 ring-3 ring-[#19539D]/40'
                          : 'bg-white hover:bg-[#EA6623] hover:scale-110'
                      }`}
                    />
                  )}

                  {/* Bilingual Delhi Metro Station Signboard (Hindi + English with Interchange lines) */}
                  <div
                    className={`absolute left-7 whitespace-nowrap p-2 rounded-xl border-2 border-[#171515] ride-pop-sm transition-all duration-200 text-left ${
                      isActive
                        ? 'opacity-100 translate-x-0 bg-[#FDFBF7] shadow-lg scale-100'
                        : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 bg-white scale-95'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-[#FBC02D] text-[#171515] rounded border border-[#171515]">
                        {st.num}
                      </span>
                      <span className="font-amita font-bold text-xs text-[#171515]">
                        {st.hindi}
                      </span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#171515] mt-0.5">
                      {st.name}
                    </div>
                    {st.interchangeColors && (
                      <div className="flex items-center gap-1 mt-1 pt-1 border-t border-neutral-200">
                        <span className="text-[8px] font-bold text-neutral-500 uppercase">Lines:</span>
                        {st.interchangeColors.map((color, idx) => (
                          <span
                            key={idx}
                            className="w-2 h-2 rounded-full border border-[#171515]/30 inline-block"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Percentage Pill */}
        <div className="bg-white text-[#171515] px-2 py-1 rounded-lg border-2 border-[#171515] text-[10px] font-black tracking-wider ride-pop-sm pointer-events-auto">
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

