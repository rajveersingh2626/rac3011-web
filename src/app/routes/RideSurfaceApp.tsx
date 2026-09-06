import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { createRideRouter } from './ride.routes';

export default function RideSurfaceApp() {
  const [router] = useState(createRideRouter);
  return <RouterProvider router={router} />;
}
