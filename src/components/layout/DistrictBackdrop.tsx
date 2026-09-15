// Fixed decorative layer copied from the district home: faint dot grid plus the pink Rotary wheel
// bleeding off the right edge. Pure CSS sizing so the markup is identical at every width.
export function DistrictBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'var(--bg)',
          backgroundImage: 'radial-gradient(color-mix(in srgb, var(--accent) 14%, transparent) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="wide-only absolute top-1/2 left-[92%] -translate-x-1/2 -translate-y-1/2 opacity-15 [width:clamp(680px,58vw,1080px)] [height:clamp(680px,58vw,1080px)]">
        <img
          src="/images.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
          style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.035))', animation: 'spinWheel 20s linear infinite' }}
        />
      </div>
    </div>
  );
}
