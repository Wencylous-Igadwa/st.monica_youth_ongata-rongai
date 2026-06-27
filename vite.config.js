import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import { readFileSync } from 'fs';
import apiPlugin from './vite-plugin-api.mjs';

const ROOT = process.cwd();

const PAGE_MAP = {
  '/events': '/events.html',
  '/gallery': '/gallery.html',
  '/photos': '/gallery.html',
  '/community': '/community.html',
  '/trivia': '/trivia.html',
  '/spotlight': '/spotlight.html',
   '/s3s4m3': '/s3s4m3.html',
  '/sports/football': '/sports/football/index.html',
  '/sports/competitions': '/sports/competitions/index.html',
};

const REDIRECT_MAP = {
  '/admin': '/s3s4m3',
};

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    proxy: {},
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(ROOT, 'index.html'),
        events: resolve(ROOT, 'events.html'),
        gallery: resolve(ROOT, 'gallery.html'),
        sports: resolve(ROOT, 'sports/index.html'),
        'sports-football': resolve(ROOT, 'sports/football/index.html'),
        'sports-competitions': resolve(ROOT, 'sports/competitions/index.html'),
        community: resolve(ROOT, 'community.html'),
        trivia: resolve(ROOT, 'trivia.html'),
        spotlight: resolve(ROOT, 'spotlight.html'),
        s3s4m3: resolve(ROOT, 's3s4m3.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap')) return 'gsap';
        },
      },
    },
  },
  plugins: [
    apiPlugin(),
    {
      name: 'clean-urls',
      configureServer(server) {
        return () => {
          server.middlewares.use(async (req, res, next) => {
            const redirect = REDIRECT_MAP[req.url];
            if (redirect) {
              res.statusCode = 302;
              res.setHeader('Location', redirect);
              res.end();
              return;
            }
            const target = PAGE_MAP[req.url];
            if (target) {
              try {
                const filePath = join(ROOT, target);
                const html = readFileSync(filePath, 'utf-8');
                const transformed = await server.transformIndexHtml(target, html);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(transformed);
                return;
              } catch {
                next();
                return;
              }
            }
            next();
          });
        };
      },
    },
  ],
});
