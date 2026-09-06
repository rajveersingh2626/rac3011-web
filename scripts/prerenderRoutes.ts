// Static main-surface public routes only: excludes unbounded ":slug" detail routes, the auth-gated sister-club form (§4.8), and DRR ComingSoon placeholders.
export const PRERENDER_ROUTES: readonly string[] = [
  // '/' is deliberately absent: the client chose to keep the district intro curtain, which a
  // prerendered page cannot show, so the homepage ships the plain SPA shell and client-renders.
  '/map',
  '/directory',
  '/showcase',
  '/heritage',
  '/leadership',
  '/governance',
  '/initiatives',
  '/resources',
  '/resources/documents',
  '/resources/guest-kit',
  '/publications',
  '/get-involved/new-club',
  '/get-involved/sponsor',
  '/achievements',
  '/partners',
  '/contact',
  '/calendar',
  '/privacy-policy',
  '/terms-of-service',
];

// "/" -> home.html, not index.html: index.html is the shared SPA shell every hostname (incl. the 5 subdomains) falls back to (see nginx.conf's per-host index map). Kept for the day "/" is prerendered again; it is not in PRERENDER_ROUTES today, so nginx's home.html mapping falls through to the shell.
export function outputFileFor(route: string): string {
  if (route === '/') return 'home.html';
  return `${route.replace(/^\//, '').replace(/\/$/, '')}.html`;
}
