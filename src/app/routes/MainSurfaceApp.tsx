import { RouterProvider } from 'react-router';
import { createMainRouter } from './main.routes';
import { preload as preloadDistrictApp } from '@/district/App';

export default function MainSurfaceApp() {
  return <RouterProvider router={createMainRouter()} />;
}

// Chunks this surface needs in its very first render, resolved before hydration starts.
export function preload(pathname: string): Promise<unknown> | undefined {
  return preloadDistrictApp(pathname);
}
