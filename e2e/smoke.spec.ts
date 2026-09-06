import { expect, test } from '@playwright/test';
import { PRERENDER_ROUTES } from '../scripts/prerenderRoutes';

const BASE = process.env.SMOKE_BASE_URL ?? 'https://testing.rotaract3011.org';
const API = process.env.SMOKE_API_ORIGIN ?? 'https://api-testing.rotaract3011.org';

// Driven off the prerender list so a newly prerendered route cannot escape the hydration check.
const PRERENDERED_ROUTES = PRERENDER_ROUTES;

// '/' is served as the plain SPA shell so the intro curtain can play, so it takes the createRoot
// path and never hydrates. It gets the same render checks and deliberately NOT the hydration one:
// #418/#423 cannot occur without hydration, so asserting on them here would prove nothing.
const CLIENT_RENDERED_ROUTES = ['/'];

const SURFACES = ['mission3011', 'drishti', 'rcl', 'careerbridge', 'ride'];

test.describe('public routes', () => {
  for (const path of [...PRERENDERED_ROUTES, ...CLIENT_RENDERED_ROUTES]) {
    const isPrerendered = PRERENDERED_ROUTES.includes(path);

    test(`${path} renders without client errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });

      const res = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
      expect(res?.status(), `${path} status`).toBe(200);

      const body = await page.innerText('body');
      expect(body.length, `${path} rendered content`).toBeGreaterThan(200);
      expect(body).not.toMatch(/Couldn't load|Something went wrong/i);

      if (!isPrerendered) return;

      // React #418/#423 mean the prerendered HTML was thrown away at hydration. Fixed in
      // scripts/prerender.ts + src/main.tsx; production still shows it until the next deploy.
      // Anything rendered during hydration that a DOM snapshot cannot carry (a Suspense
      // boundary, a portal, third-party DOM, markup that branches on viewport width) brings it
      // back. Do not weaken.
      expect(errors.join('\n'), `${path} client errors`).not.toMatch(/Minified React error #(418|423)/);
    });
  }
});

test.describe('project surfaces', () => {
  for (const surface of SURFACES) {
    test(`${surface} loads`, async ({ page }) => {
      const { protocol, host } = new URL(BASE);
      // Staging is testing.<surface>.rotaract3011.org, not <surface>.testing.*; see src/app/host.ts.
      const surfaceHost = host.startsWith('testing.')
        ? `testing.${surface}.${host.slice('testing.'.length)}`
        : `${surface}.${host}`;

      const res = await page.goto(`${protocol}//${surfaceHost}/`, { waitUntil: 'networkidle' });
      expect(res?.status()).toBe(200);

      // All six hostnames serve one SPA that picks a surface from the host, and SubdomainShell
      // sets data-surface only once it has actually mounted. A 200 that renders nothing, or
      // renders the wrong surface, therefore cannot pass. No hydration check here: surfaces use
      // createRoot, not hydrateRoot, so the prerender bug does not reach them.
      await expect(page.locator('html')).toHaveAttribute('data-surface', surface);

      const body = await page.innerText('body');
      expect(body.length, `${surface} rendered content`).toBeGreaterThan(200);
      expect(body).not.toMatch(/Couldn't load|Try again/i);
    });
  }
});

test.describe('crawler files', () => {
  test('robots.txt is a real text file', async ({ request }) => {
    const res = await request.get(`${BASE}/robots.txt`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/plain');
  });

  test('sitemap.xml is a real xml file', async ({ request }) => {
    const res = await request.get(`${BASE}/sitemap.xml`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/xml/);
  });
});

test.describe('api cors', () => {
  test('allows this environment and refuses lookalikes', async ({ request }) => {
    const allowed = await request.fetch(`${API}/public/clubs`, {
      method: 'OPTIONS',
      headers: { Origin: BASE, 'Access-Control-Request-Method': 'GET' },
    });
    expect(allowed.headers()['access-control-allow-origin']).toBe(BASE);

    const refused = await request.fetch(`${API}/public/clubs`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://evilrotaract3011.org', 'Access-Control-Request-Method': 'GET' },
    });
    expect(refused.headers()['access-control-allow-origin']).toBeUndefined();
  });
});
