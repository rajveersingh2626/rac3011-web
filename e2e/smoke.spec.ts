import { expect, test } from '@playwright/test';

const BASE = process.env.SMOKE_BASE_URL ?? 'https://testing.rotaract3011.org';
const API = process.env.SMOKE_API_ORIGIN ?? 'https://api-testing.rotaract3011.org';

const PUBLIC_ROUTES = [
  '/', '/directory', '/map', '/heritage', '/showcase', '/resources',
  '/calendar', '/governance', '/leadership', '/achievements', '/contact',
  '/partners', '/publications', '/privacy-policy', '/terms-of-service',
];

const SURFACES = ['mission3011', 'drishti', 'rcl', 'careerbridge', 'ride'];

test.describe('public routes', () => {
  for (const path of PUBLIC_ROUTES) {
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

      // React #418/#423 mean the prerendered HTML was thrown away at hydration.
      // KNOWN OPEN BUG, expected to fail against production today: scripts/prerender.ts
      // snapshots the live DOM via page.content(), which carries none of React's
      // hydration boundary markers. Not in this plan's scope. Do not weaken.
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
