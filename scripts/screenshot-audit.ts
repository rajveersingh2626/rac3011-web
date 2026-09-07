import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const WIDTHS = [390, 768, 1024, 1440] as const;
const HEIGHT: Record<number, number> = { 390: 844, 768: 1024, 1024: 768, 1440: 900 };

function parseArgs(argv: string[]) {
  let base = 'http://localhost:4173';
  const targets: { surface: string; path: string }[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--base') {
      base = argv[++i];
      continue;
    }
    const [surface, ...rest] = argv[i].split(':');
    targets.push({ surface, path: rest.join(':') || '/' });
  }
  return { base, targets };
}

function urlFor(base: string, surface: string, path: string): string {
  const url = new URL(base);
  url.pathname = (url.pathname.replace(/\/$/, '') + path) || '/';
  // Local dev and preview honour ?surface=<key> (see src/app/host.ts); deployed hosts use subdomains.
  if (surface !== 'main' && /localhost|127\.0\.0\.1/.test(url.hostname)) url.searchParams.set('surface', surface);
  else if (surface !== 'main') url.hostname = `${surface}.${url.hostname}`;
  return url.toString();
}

const { base, targets } = parseArgs(process.argv.slice(2));
if (targets.length === 0) {
  console.error('usage: tsx scripts/screenshot-audit.ts [--base URL] <surface>:<path> ...');
  process.exit(1);
}

let failures = 0;
let total = 0;

const browser = await chromium.launch();
for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: HEIGHT[width] } });
  for (const t of targets) {
    const page = await ctx.newPage();
    const url = urlFor(base, t.surface, t.path);
    const dir = join('outputs', 'screens', t.surface);
    mkdirSync(dir, { recursive: true });
    const slug = t.path === '/' ? 'index' : t.path.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-');
    total++;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
      await page.waitForTimeout(800);
      await page.screenshot({ path: join(dir, `${slug}-${width}.png`), fullPage: true });
      console.log(`ok   ${t.surface}${t.path} @${width}`);
    } catch (e) {
      failures++;
      console.log(`FAIL ${t.surface}${t.path} @${width}: ${(e as Error).message.split('\n')[0]}`);
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();

console.log(`done: ${total - failures}/${total} ok`);
process.exitCode = failures > 0 ? 1 : 0;
