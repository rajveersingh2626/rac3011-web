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

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance every 4.5 seconds unless user hovers or is touching
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchDeltaX(currentX - touchStartX);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX === null) return;
    if (touchDeltaX < -45) {
      // Swiped left -> next
      handleNext();
    } else if (touchDeltaX > 45) {
      // Swiped right -> prev
      handlePrev();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  return (
    <section
      className="snap-section"
      style={{
        padding: isMobile ? '8px 12px 32px' : '16px 32px 52px',
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%',
          maxWidth: '1440px',
          height: isMobile ? 'clamp(320px, 50vh, 440px)' : '82vh',
          minHeight: isMobile ? '320px' : '560px',
          borderRadius: isMobile ? '18px' : '28px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          boxShadow: isMobile ? '0 12px 30px rgba(0, 0, 0, 0.22)' : '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          background: '#090B0E',
          touchAction: 'pan-y'
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
            bottom: isMobile ? '12px' : '28px',
            left: isMobile ? '12px' : '28px',
            right: isMobile ? '12px' : '28px',
            zIndex: 10,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: isMobile ? '8px' : '12px',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              background: 'rgba(15, 18, 24, 0.65)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '8px 12px' : '12px 20px',
              maxWidth: isMobile ? '100%' : '650px',
              flex: isMobile ? '1 1 100%' : 'initial',
              pointerEvents: 'auto'
            }}
          >
            <div
              style={{
                fontSize: isMobile ? '0.68rem' : '0.75rem',
                fontWeight: 800,
                color: 'var(--rotaract-pink)',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '2px'
              }}
            >
              <Sparkles size={11} /> OFFICIAL DISTRICT 3011 MOMENTS
            </div>
            <h3
              style={{
                fontSize: isMobile ? '0.94rem' : '1.35rem',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: '0 0 2px 0',
                letterSpacing: '-0.2px',
                lineHeight: 1.2
              }}
            >
              {SLIDES[currentIndex].title}
            </h3>
            <p
              style={{
                fontSize: isMobile ? '0.74rem' : '0.88rem',
                color: 'rgba(255, 255, 255, 0.85)',
                margin: 0,
                fontWeight: 500,
                lineHeight: 1.35
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
              gap: '6px',
              background: 'rgba(15, 18, 24, 0.65)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '999px',
              padding: isMobile ? '6px 10px' : '8px 14px',
              pointerEvents: 'auto',
              marginLeft: isMobile ? 'auto' : '0'
            }}
          >
            {SLIDES.map((_, dotIdx) => {
              const isDotActive = dotIdx === currentIndex;
              return (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  style={{
                    width: isDotActive ? (isMobile ? '20px' : '26px') : (isMobile ? '6px' : '8px'),
                    height: isMobile ? '6px' : '8px',
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

        {/* Slide Navigation Arrows (Desktop only, swipe on mobile) */}
        {!isMobile && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              style={{
                position: 'absolute',
                left: '22px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 15,
                width: '48px',
                height: '48px',
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
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={handleNext}
              aria-label="Next Slide"
              style={{
                position: 'absolute',
                right: '22px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 15,
                width: '48px',
                height: '48px',
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
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default DistrictHeroSlideshow;