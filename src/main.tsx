import { StrictMode, type ComponentType } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import { App, HydratedApp } from './App.tsx';
import { currentSurface, loadSurfaceApp } from './app/surfaces';
import { isPrerendered } from './app/prerender';

const rootEl = document.getElementById('root')!;

function hydrate(SurfaceApp: ComponentType) {
  hydrateRoot(
    rootEl,
    <StrictMode>
      <HydratedApp SurfaceApp={SurfaceApp} />
    </StrictMode>,
  );
}

function render() {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

if (isPrerendered()) {
  // The prerendered HTML preloads this chunk, so the await is usually a cache hit; a failed
  // fetch must still leave a usable page, hence the plain client render fallback.
  loadSurfaceApp(currentSurface()).then(hydrate, render);
} else {
  render();
}
