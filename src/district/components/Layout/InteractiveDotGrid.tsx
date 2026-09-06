import { useEffect, useRef, type FC } from 'react';

export type InteractiveDotGridProps = Record<string, never>;

const InteractiveDotGrid: FC<InteractiveDotGridProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let animationFrameId = 0;
    const mouse = { x: -1000, y: -1000, active: false };

    let dots: Dot[] = [];

    class Dot {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
      isText: boolean;
      radius: number;

      constructor(x: number, y: number, isText = false) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.vx = 0;
        this.vy = 0;
        this.isText = isText;
        this.radius = isText ? 1.5 : 1.2;
      }

      update() {
        const spring = this.isText ? 0.08 : 0.05;
        const damping = 0.88;
        const repulsionRadius = this.isText ? 35 : 60;
        const repulsionStrength = 55;

        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < repulsionRadius) {
            const force = (repulsionRadius - dist) / repulsionRadius;
            const angle = Math.atan2(dy, dx);

            const forceMultiplier = this.isText ? 0.03 : 0.15;
            this.vx += Math.cos(angle) * force * repulsionStrength * forceMultiplier;
            this.vy += Math.sin(angle) * force * repulsionStrength * forceMultiplier;
          }
        }

        const ax = (this.targetX - this.x) * spring;
        const ay = (this.targetY - this.y) * spring;

        this.vx = (this.vx + ax) * damping;
        this.vy = (this.vy + ay) * damping;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (this.isText) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        } else {
          ctx.fillStyle = 'rgba(100, 100, 115, 0.65)';
        }
        ctx.fill();
      }
    }

    const initDots = () => {
      dots = [];
      const width = canvas.width;
      const height = canvas.height;

      const gridSpacing = 35;
      const startX = (width % gridSpacing) / 2;
      const startY = (height % gridSpacing) / 2;

      for (let x = startX; x < width; x += gridSpacing) {
        for (let y = startY; y < height; y += gridSpacing) {
          dots.push(new Dot(x, y, false));
        }
      }

      const isMobile = width < 768;

      // Only render 'Fellowships through service' particle text on desktop and tablet viewports
      if (!isMobile) {
        const offscreen = document.createElement('canvas');
        const offscreenCtx = offscreen.getContext('2d')!;
        offscreen.width = width;
        offscreen.height = height;

        offscreenCtx.fillStyle = '#000000';
        offscreenCtx.textAlign = 'left';
        offscreenCtx.textBaseline = 'top';

        const text = "'Fellowships through service'";
        const gutter = Math.max(10, width * 0.02);
        const textX = (width * 0.04) + gutter;

        const setFont = (size: number) => {
          offscreenCtx.font = `600 ${size}px 'Dancing Script', 'Satisfy', cursive`;
        };

        // The 1024-1440 breakpoint collapses the hero to a short banner, so a fixed 85% offset
        // lands on the copy and overflows the canvas; anchor below the copy and fit instead.
        // offsetTop, not getBoundingClientRect: the copy block has an entrance transform.
        const contentEl = canvas.parentElement?.querySelector<HTMLElement>('.section-content-animate');
        const contentBottom = contentEl ? contentEl.offsetTop + contentEl.offsetHeight : 0;
        const textY = Math.max(height * 0.85, contentBottom + 4);
        const availableHeight = height - textY;

        let fontSize = Math.min(width * 0.05, 80, availableHeight / 1.25);
        let textSampleSpacing = 3.5;

        if (fontSize >= 26) {
          setFont(fontSize);
          const maxTextWidth = width - textX - gutter;
          const measured = offscreenCtx.measureText(text).width;
          if (measured > maxTextWidth) {
            fontSize = (fontSize * maxTextWidth) / measured;
            setFont(fontSize);
          }

          offscreenCtx.fillText(text, textX, textY);
          // Sample denser for smaller type, otherwise the strokes fall between sample points
          textSampleSpacing = Math.max(2, Math.min(3.5, fontSize / 20));
        }

        const imgData = offscreenCtx.getImageData(0, 0, width, height);
        const data = imgData.data;

        for (let y = 0; y < height; y += textSampleSpacing) {
          for (let x = 0; x < width; x += textSampleSpacing) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            const alpha = data[index + 3];
            if (alpha > 65) {
              dots.push(new Dot(x, y, true));
            }
          }
        }
      }
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const width = parent ? parent.clientWidth : (canvas.clientWidth || window.innerWidth);
      const height = parent ? parent.clientHeight : (canvas.clientHeight || window.innerHeight);

      canvas.width = width;
      canvas.height = height;
      initDots();
    };

    const parent = canvas.closest('.snap-section') || canvas.parentElement;

    const handleMouseMove = (e: MouseEvent) => {
      if (!parent) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    document.fonts.ready.then(() => {
      resizeCanvas();
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove as EventListener);
      parent.addEventListener('mouseleave', handleMouseLeave);

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const rect = canvas.getBoundingClientRect();
          mouse.x = e.touches[0].clientX - rect.left;
          mouse.y = e.touches[0].clientY - rect.top;
          mouse.active = true;
        }
      };
      parent.addEventListener('touchmove', handleTouchMove as EventListener, { passive: true });
      parent.addEventListener('touchend', handleMouseLeave, { passive: true });
    }

    const snapContainer = document.querySelector('.snap-container') || (canvas && canvas.closest ? canvas.closest('.snap-container') : null);

    const handleScroll = () => {
      const containerScroll = snapContainer ? snapContainer.scrollTop : 0;
      const windowScroll = window.scrollY || document.documentElement.scrollTop;
      const scrollY = Math.max(containerScroll, windowScroll);

      const fadeStart = 30;
      const fadeEnd = 280;

      let opacity = 1;
      if (scrollY > fadeStart) {
        opacity = Math.max(0, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
      }

      if (canvas) {
        canvas.style.opacity = opacity.toFixed(3);
        canvas.style.pointerEvents = opacity === 0 ? 'none' : 'auto';
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    if (snapContainer) {
      snapContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    let isIntersecting = true;
    let isAnimating = false;

    const startAnimation = () => {
      if (!isAnimating && isIntersecting) {
        isAnimating = true;
        animate();
      }
    };

    const stopAnimation = () => {
      if (isAnimating) {
        isAnimating = false;
        cancelAnimationFrame(animationFrameId);
      }
    };

    const animate = () => {
      if (!isIntersecting) {
        isAnimating = false;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach((dot) => {
        dot.update();
        dot.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // IntersectionObserver to completely halt CPU/GPU cycles when out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.05 }
    );

    if (parent) {
      observer.observe(parent);
    } else {
      observer.observe(canvas);
    }

    startAnimation();

    return () => {
      stopAnimation();
      observer.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      if (snapContainer) {
        snapContainer.removeEventListener('scroll', handleScroll);
      }
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove as EventListener);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        pointerEvents: 'auto',
        transition: 'opacity 0.15s ease-out'
      }}
    />
  );
};

export default InteractiveDotGrid;
