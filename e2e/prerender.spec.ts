import { test, expect } from '@playwright/test';
import { PRERENDER_ROUTES } from '../scripts/prerenderRoutes';

// Both lists are checked against the build's own source of truth below, so a route that changes
// sides in scripts/prerenderRoutes.ts fails here instead of silently losing its assertions.
const PRERENDERED_CASES: { path: string; content: string }[] = [
  { path: '/showcase', content: 'Blood donation camp' },
  { path: '/leadership', content: 'Rtn. Sanjeev Rai Mehra' },
  { path: '/heritage', content: 'Rtr. Archit Bhatia' },
];

// '/' ships the plain SPA shell so the district intro curtain can play. That is a deliberate
// trade: the homepage has no crawlable text and no fast first paint.
const CLIENT_RENDERED_ROUTES = ['/'];

test('the spec covers the routes the build actually prerenders', () => {
  expect(PRERENDER_ROUTES).toEqual(expect.arrayContaining(PRERENDERED_CASES.map((c) => c.path)));
  for (const path of CLIENT_RENDERED_ROUTES) expect(PRERENDER_ROUTES).not.toContain(path);
});

for (const { path, content } of PRERENDERED_CASES) {
  test(`${path} ships real content in the first HTTP response, before any JS runs`, async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}${path}`);
    expect(res.ok()).toBe(true);

    const html = await res.text();
    expect(html).toContain(content);
    expect(html).toContain('window.__RAC_PRERENDERED__=true');
  });
}

for (const path of CLIENT_RENDERED_ROUTES) {
  test(`${path} ships the SPA shell and renders on the client`, async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}${path}`);
    expect(res.ok()).toBe(true);

    const html = await res.text();
    expect(html, 'served from index.html, so the root element is empty').toContain('<div id="root"></div>');
    expect(html, 'no prerendered flag, so main.tsx takes the createRoot path').not.toContain('__RAC_PRERENDERED__');
    expect(html, 'no static page text: this is what the curtain costs the crawler').not.toContain('Service above self');
  });
}
