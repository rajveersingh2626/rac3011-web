import { useMemo } from 'react';
import { RouterProvider } from 'react-router';
import { Providers } from '@/app/providers';
import { resolveSurface, type Surface } from '@/app/host';
import { createMainRouter } from '@/app/routes/main.routes';
import { createMission3011Router } from '@/app/routes/mission3011.routes';
import { createDrishtiRouter } from '@/app/routes/drishti.routes';
import { createRclRouter } from '@/app/routes/rcl.routes';
import { createCareerbridgeRouter } from '@/app/routes/careerbridge.routes';
import { createRideRouter } from '@/app/routes/ride.routes';

const ROUTER_FACTORIES: Record<Surface, () => ReturnType<typeof createMainRouter>> = {
  main: createMainRouter,
  mission3011: createMission3011Router,
  drishti: createDrishtiRouter,
  rcl: createRclRouter,
  careerbridge: createCareerbridgeRouter,
  ride: createRideRouter,
};

export function App() {
  const surface = resolveSurface(window.location.hostname, window.location.search);
  const router = useMemo(() => ROUTER_FACTORIES[surface](), [surface]);

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
