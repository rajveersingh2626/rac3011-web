import { useState, useEffect, useRef } from 'react';
import type { FC, MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Slide {
  id: string;
  src: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    src: '/slideshow-yugarambh-sitting.webp',
    title: 'DAC 2026–27 Leadership Oath',
    subtitle: 'District Installation Ceremony – "Yugarambh"'
  },
  {
    id: 'slide-2',
    src: '/slideshow-yugarambh-standing.webp',
    title: 'United in Purpose: District Council',
    subtitle: '75 Rotaract Clubs Uniting Across Delhi & NCR'
  },
  {
    id: 'slide-3',
    src: '/slideshow-drr-speech.webp',
    title: 'DRR Archit Bhatia Address',
    subtitle: 'Setting the Vision for Fellowship, Service & Impact'
  },
  {
    id: 'slide-4',
    src: '/slideshow-dg-speech.webp',
    title: 'Rotary Leadership Keynote',
    subtitle: 'District Governor Rtn. CA Ajeet Jalan Addressing the Assembly'
  },
  {
    id: 'slide-5',
    src: '/slideshow-team-hall.webp',
    title: 'The Rotaract Family Assembly',
    subtitle: 'Empowering Changemakers & Future Community Leaders'
  }
];

export type DistrictHeroSlideshowProps = Record<string, never>;

const DistrictHeroSlideshow: FC<DistrictHeroSlideshowProps> = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance every 4.5 seconds unless user hovers
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <section
      className="snap-section"
      style={{
        padding: isMobile ? '8px 12px 36px' : '16px 32px 52px',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          width: '100%',
          maxWidth: '1440px',
          height: isMobile ? '70vh' : '82vh',
          minHeight: isMobile ? '480px' : '560px',
          borderRadius: isMobile ? '20px' : '28px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          background: '#090B0E'
        }}
      >
        {/* Photos Layer with Smooth Crossfade */}
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1)' : 'scale(1.04)',
                transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: isActive ? 'auto' : 'none'
              }}
            >
              <img
                src={slide.src}
                alt={slide.title}
                loading={idx === 0 ? 'eager' : 'lazy'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 40%'
                }}
              />
              {/* Cinematic Vignette Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(15, 18, 24, 0.65) 0%, rgba(15, 18, 24, 0.15) 35%, rgba(15, 18, 24, 0.25) 65%, rgba(15, 18, 24, 0.85) 100%), radial-gradient(circle at 20% 20%, rgba(216, 27, 96, 0.18) 0%, transparent 50%)'
                }}
              />
            </div>
          );
        })}



        {/* BOTTOM CAPTION BAR */}
        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? '16px' : '28px',
            left: isMobile ? '16px' : '28px',
            right: isMobile ? '16px' : '28px',
            zIndex: 10,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '12px',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              background: 'rgba(15, 18, 24, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: isMobile ? '8px 14px' : '12px 20px',
              maxWidth: '650px',
              pointerEvents: 'auto'
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--rotaract-pink)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px'
              }}
            >
              <Sparkles size={12} /> OFFICIAL DISTRICT 3011 MOMENTS · SLIDE 0{currentIndex + 1} / 0{SLIDES.length}
            </div>
            <h3
              style={{
                fontSize: isMobile ? '1rem' : '1.35rem',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: '0 0 2px 0',
                letterSpacing: '-0.3px'
              }}
            >
              {SLIDES[currentIndex].title}
            </h3>
            <p
              style={{
                fontSize: isMobile ? '0.78rem' : '0.88rem',
                color: 'rgba(255, 255, 255, 0.82)',
                margin: 0,
                fontWeight: 500
              }}
            >
              {SLIDES[currentIndex].subtitle}
            </p>
          </div>

          {/* Dot Indicators */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 18, 24, 0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              padding: '8px 14px',
              pointerEvents: 'auto'
            }}
          >
            {SLIDES.map((_, dotIdx) => {
              const isDotActive = dotIdx === currentIndex;
              return (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  style={{
                    width: isDotActive ? '26px' : '8px',
                    height: '8px',
                    borderRadius: '999px',
                    background: isDotActive ? 'var(--rotaract-pink)' : 'rgba(255, 255, 255, 0.35)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    padding: 0
                  }}
                  aria-label={`Jump to slide ${dotIdx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Slide Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            left: isMobile ? '10px' : '22px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 15,
            width: isMobile ? '38px' : '48px',
            height: isMobile ? '38px' : '48px',
            borderRadius: '50%',
            background: 'rgba(15, 18, 24, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--rotaract-pink)';
            e.currentTarget.style.borderColor = 'var(--rotaract-pink)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(15, 18, 24, 0.45)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronLeft size={isMobile ? 20 : 24} />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            right: isMobile ? '10px' : '22px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 15,
            width: isMobile ? '38px' : '48px',
            height: isMobile ? '38px' : '48px',
            borderRadius: '50%',
            background: 'rgba(15, 18, 24, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--rotaract-pink)';
            e.currentTarget.style.borderColor = 'var(--rotaract-pink)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(15, 18, 24, 0.45)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronRight size={isMobile ? 20 : 24} />
        </button>
      </div>
    </section>
  );
};

export default DistrictHeroSlideshow;
