import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { createDrishtiRouter } from './drishti.routes';

export default function DrishtiSurfaceApp() {
  const [router] = useState(createDrishtiRouter);
  return <RouterProvider router={router} />;
}
