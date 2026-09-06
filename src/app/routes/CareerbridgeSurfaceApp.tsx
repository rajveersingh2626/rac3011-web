import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { createCareerbridgeRouter } from './careerbridge.routes';

export default function CareerbridgeSurfaceApp() {
  const [router] = useState(createCareerbridgeRouter);
  return <RouterProvider router={router} />;
}
