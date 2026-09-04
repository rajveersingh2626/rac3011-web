import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadEnv, preview, type PreviewServer } from 'vite';
import { chromium, type Browser } from '@playwright/test';
import { PRERENDER_ROUTES, outputFileFor } from './prerenderRoutes';
import { isDegraded, type ApiResponseEvent } from '../src/lib/prerenderDegradation';

const DIST_DIR = join(process.cwd(), 'dist');
// process.env wins (Docker build ARG); falls back to .env[.mode] files for local/e2e runs, since those never reach the shell's env.
const VITE_ENV = loadEnv(process.env.VITE_MODE ?? 'production', process.cwd(), 'VITE_');
const API_ORIGIN = process.env.VITE_API_ORIGIN ?? VITE_ENV.VITE_API_ORIGIN ?? '';
const NAV_TIMEOUT_MS = 15_000;

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

async function prerenderRoute(browser: Browser, baseUrl: string, route: string): Promise<{ ok: true; html: string } | { ok: false }> {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    const events: ApiResponseEvent[] = [];
    page.on('response', (res) => events.push({ url: res.url(), ok: res.ok() }));
    page.on('requestfailed', (req) => events.push({ url: req.url(), ok: false }));
    await page.route('**/public/live', (r) => r.abort());
    await page.route('**/public/visits', (r) => r.abort());

    await page.goto(`${baseUrl.replace(/\/$/, '')}${route}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
    await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT_MS }).catch(() => undefined);

    if (isDegraded(events, API_ORIGIN)) return { ok: false };

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
  const browser = await chromium.launch();
  let rendered = 0;
  try {
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
  } finally {
    await browser.close();
    await server.close();
  }
  console.log(`[prerender] ${rendered}/${PRERENDER_ROUTES.length} public routes prerendered.`);
}

main().catch((err: unknown) => {
  console.warn('[prerender] unexpected failure, shipping the plain SPA shell for every public route:', err);
});
