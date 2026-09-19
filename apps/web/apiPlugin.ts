import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function apiPlugin(): Plugin {
  return {
    name: 'acquit-api-plugin',
    async configureServer(server) {
      // Serve stitch assets reliably from src/assets
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/stitch/')) {
          const prefix = '/assets/stitch/';
          const rawPath = req.url.slice(prefix.length).split('?')[0];
          const decodedPath = decodeURIComponent(rawPath);
          const localFilePath = path.resolve(__dirname, 'src/assets', 'stitch', decodedPath);

          if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
            if (localFilePath.endsWith('.html')) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
            } else if (localFilePath.endsWith('.png')) {
              res.setHeader('Content-Type', 'image/png');
            } else if (localFilePath.endsWith('.js')) {
              res.setHeader('Content-Type', 'application/javascript');
            } else if (localFilePath.endsWith('.css')) {
              res.setHeader('Content-Type', 'text/css');
            }
            res.setHeader('Cache-Control', 'no-cache');
            return fs.createReadStream(localFilePath).pipe(res);
          }
        }
        next();
      });

      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/health' || req.url === '/api/healthz') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok from vite plugin directly' }));
          return;
        }
        next();
      });

      // Use ssrLoadModule so Vite compiles the TS file on the fly
      try {
        const { default: app } = await server.ssrLoadModule('../api/src/app.ts');
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?'))) {
            app(req, res, next);
          } else {
            next();
          }
        });
      } catch (err) {
        console.error("Failed to load api app:", err);
      }
    }
  };
}
