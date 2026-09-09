import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// Mirrors nginx.conf's per-host root mapping (§14.9) for local/e2e parity: `vite preview` has no host-based routing, so "/" is special-cased here the same way.
const servePrerenderedRoot: Plugin = {
  name: 'prerender-root-preview',
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const homePath = join(server.config.build.outDir, 'home.html');
      if (req.url === '/' && existsSync(homePath)) {
        res.setHeader('Content-Type', 'text/html');
        res.end(readFileSync(homePath));
        return;
      }
      next();
    });
  },
};

const apiProxyTarget = process.env.VITE_API_TARGET || process.env.VITE_API_ORIGIN || 'https://api.rotaract3011.org';
const apiProxy = {
  '^/(auth|second-factor|trusted-devices|me|members|clubs|club-facts|zones|directory|skill-tags|district-team|past-drrs|announcements|reports|report-schemas|report-requests|points|point-categories|point-rules|settings|public|health|sister-club-requests|drr-bookings|feedback|link-health|asset-links|mission3011|drishti|ride|careerbridge|rcl|audit|rbac|roles|user-roles|permissions|files|projects|resources|events|achievements|publications|partners|enquiries|content-blocks)': {
    target: apiProxyTarget,
    changeOrigin: true,
    secure: false,
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), servePrerenderedRoot],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { host: true, allowedHosts: ['.localhost'], proxy: apiProxy },
  preview: { proxy: apiProxy },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
