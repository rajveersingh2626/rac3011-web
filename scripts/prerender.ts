import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadEnv, preview, type PreviewServer } from 'vite';
import { chromium, type Browser, type Page, type Route } from '@playwright/test';
import { PRERENDER_ROUTES, outputFileFor } from './prerenderRoutes';
import { isDegraded, type ApiResponseEvent } from '../src/lib/prerenderDegradation';

const DIST_DIR = join(process.cwd(), 'dist');
// process.env wins (Docker build ARG); falls back to .env[.mode] files for local/e2e runs, since those never reach the shell's env.
const VITE_ENV = loadEnv(process.env.VITE_MODE ?? 'production', process.cwd(), 'VITE_');
const API_ORIGIN = process.env.VITE_API_ORIGIN ?? VITE_ENV.VITE_API_ORIGIN ?? '';
const NAV_TIMEOUT_MS = 15_000;
const CURTAIN_TIMEOUT_MS = 6_000;

async function startPreviewServer(): Promise<{ server: PreviewServer; baseUrl: string }> {
  const server = await preview({ preview: { port: 0 }, logLevel: 'error' });
  const baseUrl = server.resolvedUrls?.local[0];
  if (!baseUrl) throw new Error('vite preview did not resolve a local URL');
  return { server, baseUrl };
}

function injectPrerenderedState(html: string, stateJson: string | null): string {
  const safeState = stateJson ? stateJson.replace(/</g, '\\u003c') : 'null';
  const script = `<script>window.__RAC_PRERENDERED__=true;window.__RAC_PRERENDERED_STATE__=${safeState};</script>`;
  return html.replace('</head>', `${script}</head>`);
}

// The real API's CORS allowlist (WEB_ORIGINS) only trusts the real web hostnames, not vite preview's ephemeral localhost origin, so the crawling browser's own fetch would be CORS-blocked. Proxying through Node's fetch (no CORS enforcement server-side) and adding a permissive ACAO header on the way back is the same trusted-build-tool bypass a real SSR server would have.
async function proxyPastCors(route: Route): Promise<void> {
  const req = route.request();
  // The client sends `credentials: 'include'`; a wildcard ACAO is rejected outright for credentialed
  // requests, so the response must name the page's own origin and allow credentials explicitly.
  const origin = req.headers()['origin'] ?? '*';
  const corsHeaders: Record<string, string> = {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
  };
  if (req.method() === 'OPTIONS') {
    return route.fulfill({
      status: 204,
      headers: {
        ...corsHeaders,
        'access-control-allow-methods': 'GET,HEAD,POST,PATCH,PUT,DELETE,OPTIONS',
        'access-control-allow-headers': req.headers()['access-control-request-headers'] ?? 'content-type',
      },
      body: '',
    });
  }
  try {
    const res = await fetch(req.url(), {
      method: req.method(),
      headers: req.headers(),
      body: ['GET', 'HEAD'].includes(req.method()) ? undefined : (req.postData() ?? undefined),
    });
    const headers = Object.fromEntries(res.headers.entries());
    Object.assign(headers, corsHeaders);
    delete headers['content-encoding'];
    await route.fulfill({ status: res.status, headers, body: Buffer.from(await res.arrayBuffer()) });
  } catch {
    await route.abort();
  }
}

// A DOM snapshot is not React's own SSR output, so three things have to be repaired before it can
// be hydrated: portal roots that live outside #root, DOM that a non-React library built imperatively
// (Leaflet's tiles and panes), and adjacent text nodes that HTML serialization silently merges into
// one (React renders one text node per text child and, in real SSR, separates them with `<!-- -->`;
// without that, hydration runs out of nodes and client-renders the whole root).
async function preparePageForHydration(page: Page): Promise<void> {
  await page.evaluate(() => {
    interface MinimalNode {
      nodeType: number;
      firstChild: MinimalNode | null;
      nextSibling: MinimalNode | null;
      insertBefore: (node: unknown, before: MinimalNode | null) => void;
    }
    interface MinimalElement extends MinimalNode {
      id: string;
      tagName: string;
      remove: () => void;
    }
    const RAW_TEXT_TAGS = ['SCRIPT', 'STYLE'];
    const doc = (globalThis as unknown as {
      document: {
        body: MinimalNode & { children: ArrayLike<MinimalElement> };
        createComment: (data: string) => unknown;
        querySelectorAll: (selector: string) => ArrayLike<{ innerHTML: string }>;
      };
    }).document;

    for (const el of Array.from(doc.body.children)) {
      if (el.id !== 'root' && el.tagName !== 'SCRIPT') el.remove();
    }

    // Leaflet fills its container itself, after mount; React's own first render leaves it empty.
    for (const map of Array.from(doc.querySelectorAll('.leaflet-container'))) map.innerHTML = '';

    // Iterative on purpose: esbuild's keepNames wraps a named inner function in a `__name` helper
    // that does not exist inside page.evaluate.
    const TEXT_NODE = 3;
    const ELEMENT_NODE = 1;
    const stack: MinimalNode[] = [doc.body];
    while (stack.length) {
      const node = stack.pop() as MinimalNode;
      let child = node.firstChild;
      while (child) {
        const next = child.nextSibling;
        if (child.nodeType === TEXT_NODE && next?.nodeType === TEXT_NODE) node.insertBefore(doc.createComment(''), next);
        // A comment serialized inside a script or style body is not a comment, it is a syntax error.
        if (child.nodeType === ELEMENT_NODE && !RAW_TEXT_TAGS.includes((child as MinimalElement).tagName)) stack.push(child);
        child = next;
      }
    }
  });
}

async function prerenderRoute(browser: Browser, baseUrl: string, route: string): Promise<{ ok: true; html: string } | { ok: false }> {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    // Lets useSurfaceHref/useMainSiteHref detect the crawl and skip baking in localhost.
    await page.addInitScript(() => {
      (globalThis as unknown as { __RAC_PRERENDER_CRAWL__?: boolean }).__RAC_PRERENDER_CRAWL__ = true;
    });
    const events: ApiResponseEvent[] = [];
    page.on('response', (res) => events.push({ url: res.url(), ok: res.ok() }));
    page.on('requestfailed', (req) => events.push({ url: req.url(), ok: false }));
    if (API_ORIGIN) await page.route(`${API_ORIGIN}/**`, proxyPastCors);
    await page.route('**/public/live', (r) => r.abort());
    await page.route('**/public/visits', (r) => r.abort());

    await page.goto(`${baseUrl.replace(/\/$/, '')}${route}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
    await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT_MS }).catch(() => undefined);
    // The district site opens behind a ~2.2s curtain overlay, which networkidle beats; snapshotting
    // then would bake an empty pink curtain into the HTML crawlers read.
    await page
      .waitForSelector('.curtain-container', { state: 'detached', timeout: CURTAIN_TIMEOUT_MS })
      .catch(() => undefined);

    if (isDegraded(events, API_ORIGIN)) return { ok: false };

    await preparePageForHydration(page);

    const stateJson = await page.evaluate(() => {
      const w = globalThis as unknown as { __RAC_DEHYDRATE__?: () => string };
      return w.__RAC_DEHYDRATE__ ? w.__RAC_DEHYDRATE__() : null;
    });
    const html = injectPrerenderedState(await page.content(), stateJson);
    return { ok: true, html };
  } catch {
    return { ok: false };
  } finally {
    await context.close();
  }
}

async function main(): Promise<void> {
  if (!existsSync(join(DIST_DIR, 'index.html'))) {
    console.warn('[prerender] dist/index.html not found - run `vite build` first, skipping prerender.');
    return;
  }
  if (!API_ORIGIN) {
    console.warn('[prerender] VITE_API_ORIGIN not set - shipping the plain SPA shell for every public route.');
    return;
  }

  const { server, baseUrl } = await startPreviewServer();
  try {
    const browser = await chromium.launch();
    try {
      let rendered = 0;
      for (const route of PRERENDER_ROUTES) {
        const result = await prerenderRoute(browser, baseUrl, route);
        if (!result.ok) {
          console.warn(`[prerender] ${route}: API data unavailable at build time, shipping the plain SPA shell for this route.`);
          continue;
        }
        const outFile = join(DIST_DIR, outputFileFor(route));
        mkdirSync(dirname(outFile), { recursive: true });
        writeFileSync(outFile, result.html);
        rendered += 1;
      }
      console.log(`[prerender] ${rendered}/${PRERENDER_ROUTES.length} public routes prerendered.`);
    } finally {
      await browser.close();
    }
  } finally {
    await server.close();
  }
}

// .finally(exit) is a safety net: a leaked open handle must never hang the whole `npm run build` chain.
main()
  .catch((err: unknown) => {
    console.warn('[prerender] unexpected failure, shipping the plain SPA shell for every public route:', err);
  })
  .finally(() => process.exit(0));
