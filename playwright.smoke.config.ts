import { defineConfig, devices } from '@playwright/test';

// Smoke runs against an already-deployed environment, so it starts no local
// server and reads its target from SMOKE_BASE_URL / SMOKE_API_ORIGIN.
export default defineConfig({
  testDir: './e2e',
  testMatch: /smoke\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { trace: 'on-first-retry' },
  // All three widths: the district navbar branches on window.innerWidth during its first render,
  // so hydration has to be proven at the widths the prerender crawl does not run at.
  projects: [
    { name: 'mobile-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'tablet-768', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
});
