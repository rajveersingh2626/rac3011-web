import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { createMission3011Router } from './mission3011.routes';

export default function Mission3011SurfaceApp() {
  const [router] = useState(createMission3011Router);
  return <RouterProvider router={router} />;
}
