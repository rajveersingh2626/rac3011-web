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

export default defineConfig({
  plugins: [react(), tailwindcss(), servePrerenderedRoot],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { host: true, allowedHosts: ['.localhost'] },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
