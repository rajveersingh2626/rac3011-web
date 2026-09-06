import { lazy, type ComponentType } from 'react';
import { resolveSurface, type Surface } from '@/app/host';

interface SurfaceModule {
  default: ComponentType;
  // Chunks the surface's own first render needs, resolved before hydration (see main.tsx).
  preload?: (pathname: string) => Promise<unknown> | undefined;
}

// One lazy chunk per surface: a visitor to any single hostname downloads only that
// surface's route tree, never the other five. Public pages inside each tree stay eager.
const SURFACE_LOADERS: Record<Surface, () => Promise<SurfaceModule>> = {
  main: () => import('@/app/routes/MainSurfaceApp'),
  mission3011: () => import('@/app/routes/Mission3011SurfaceApp'),
  drishti: () => import('@/app/routes/DrishtiSurfaceApp'),
  rcl: () => import('@/app/routes/RclSurfaceApp'),
  careerbridge: () => import('@/app/routes/CareerbridgeSurfaceApp'),
  ride: () => import('@/app/routes/RideSurfaceApp'),
};

export const SURFACE_APPS: Record<Surface, ComponentType> = {
  main: lazy(SURFACE_LOADERS.main),
  mission3011: lazy(SURFACE_LOADERS.mission3011),
  drishti: lazy(SURFACE_LOADERS.drishti),
  rcl: lazy(SURFACE_LOADERS.rcl),
  careerbridge: lazy(SURFACE_LOADERS.careerbridge),
  ride: lazy(SURFACE_LOADERS.ride),
};

export function currentSurface(): Surface {
  return resolveSurface(window.location.hostname, window.location.search);
}

export async function loadSurfaceApp(surface: Surface): Promise<ComponentType> {
  const mod = await SURFACE_LOADERS[surface]();
  await mod.preload?.(window.location.pathname);
  return mod.default;
}
