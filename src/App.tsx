import { Suspense, type ComponentType } from 'react';
import { Providers } from '@/app/providers';
import { SURFACE_APPS, currentSurface } from '@/app/surfaces';
import { SurfaceLoading } from '@/app/routes/SurfaceLoading';

export function App() {
  const SurfaceApp = SURFACE_APPS[currentSurface()];

  return (
    <Providers>
      <Suspense fallback={<SurfaceLoading />}>
        <SurfaceApp />
      </Suspense>
    </Providers>
  );
}

// Hydration path only: the surface chunk is already resolved, so there is no Suspense boundary
// and no fallback render to mismatch the prerendered DOM (which, being a DOM snapshot, carries
// none of React's `<!--$-->` boundary markers for React to park a mismatch on).
export function HydratedApp({ SurfaceApp }: { SurfaceApp: ComponentType }) {
  return (
    <Providers>
      <SurfaceApp />
    </Providers>
  );
}
