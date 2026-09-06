import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { createRclRouter } from './rcl.routes';

export default function RclSurfaceApp() {
  const [router] = useState(createRclRouter);
  return <RouterProvider router={router} />;
}
