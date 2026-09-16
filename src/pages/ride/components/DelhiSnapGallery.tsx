import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRideGallery, type PublicGalleryItem } from '@/lib/publicApi/ride';
import { ChevronDown } from 'lucide-react';

const FALLBACK_SLIDES = [
  {
    id: 'snap-fallback-1',
    url: '/ride/banners/hero_culture.png',
    kind: 'photo' as const,
    headingLeft: 'CHANDNI CHOWK',
    headingRight: 'THE SOUL OF PURANI DILLI',
  },
  {
    id: 'snap-fallback-2',
    url: '/ride/banners/hero_heritage.png',
    kind: 'photo' as const,
    headingLeft: 'QUTUB COMPLEX',
    headingRight: 'EIGHT CENTURIES OF ARCHITECTURE',
  },
  {
    id: 'snap-fallback-3',
    url: '/ride/banners/hero_food.png',
    kind: 'photo' as const,
    headingLeft: 'STREETS OF FLAVOUR',
    headingRight: 'CULINARY TRADITIONS OF NCR',
  },
  {
    id: 'snap-fallback-4',
    url: '/ride/banners/hero_metro.png',
    kind: 'photo' as const,
    headingLeft: 'DMRC NETWORK',
    headingRight: 'LIFELINE CONNECTING MILLIONS',
  },
];

export function DelhiSnapGallery() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['ride-public-gallery'],
    queryFn: () => fetchRideGallery(),
  });

  const apiItems: PublicGalleryItem[] = data?.items ?? [];
  const slides = apiItems.length > 0 ? apiItems : FALLBACK_SLIDES;

  const scrollToNext = (index: number) => {
    if (!containerRef.current) return;
    const nextIndex = (index + 1) % slides.length;
    const target = containerRef.current.children[nextIndex] as HTMLElement;
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="gallery" className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Top Banner Tag */}
      <div className="absolute top-6 left-6 sm:left-12 z-30 pointer-events-none">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EA6623] animate-ping" />
          <span className="text-[11px] sm:text-xs font-black tracking-[0.25em] uppercase text-white/90 font-mono">
            DELHI THROUGH OUR LENS • SNAP-SCROLL
          </span>
        </div>
      </div>

      {/* Snap-Scroll Container: 100vw by 100vh with CSS snap mandatory */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide, idx) => {
          const leftText = (slide as any).headingLeft || (slide as any).caption || 'DELHI MERI JAAN';
          const rightText = (slide as any).headingRight || `EXP 2026 // [${String(idx + 1).padStart(2, '0')}]`;
          const isVideo = slide.kind === 'video';

          return (
            <div
              key={slide.id || idx}
              className="relative w-screen h-screen snap-start snap-always shrink-0 overflow-hidden flex items-center justify-center bg-black"
            >
              {/* Media Element (Full Bleed) */}
              {isVideo ? (
                <video
                  src={slide.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img
                  src={slide.url}
                  alt={leftText}
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              )}

              {/* Faint Dark Vignette & Gradient for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/35 pointer-events-none z-10" />

              {/* Cinematic Grainy Film Filter Overlay (SVG Noise Pattern) */}
              <div
                className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-40"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                }}
              />

              {/* Slide Counter Indicator */}
              <div className="absolute top-6 right-6 sm:right-12 z-30 pointer-events-none">
                <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  {String(idx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                </span>
              </div>

              {/* Overlaid Typography: Heading 1 (Bottom-Left) & Heading 2 (Bottom-Right) */}
              <div className="absolute bottom-10 sm:bottom-14 left-6 sm:left-12 right-6 sm:right-12 z-30 flex flex-col md:flex-row md:items-end justify-between gap-4 pointer-events-none">
                {/* Heading 1: Anchored to bottom-left */}
                <div className="max-w-2xl">
                  <h3 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                    {leftText}
                  </h3>
                </div>

                {/* Heading 2: Anchored to bottom-right */}
                <div className="md:text-right max-w-xl">
                  <h4 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#FBC02D] uppercase tracking-wider font-mono drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                    {rightText}
                  </h4>
                </div>
              </div>

              {/* Scroll Down Prompt on First Slide */}
              {idx === 0 && (
                <button
                  type="button"
                  onClick={() => scrollToNext(0)}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 text-white/70 hover:text-white flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase cursor-pointer pointer-events-auto transition-colors"
                >
                  <span>Scroll Down</span>
                  <ChevronDown size={14} className="animate-bounce" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
