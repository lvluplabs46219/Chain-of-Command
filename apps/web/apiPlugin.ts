import type { Plugin } from 'vite';

export function apiPlugin(): Plugin {
  return {
    name: 'acquit-api-plugin',
    async configureServer(server) {
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
        const { default: app } = await server.ssrLoadModule('../api-server/src/app.ts');
        server.middlewares.use(app);
      } catch (err) {
        console.error("Failed to load api-server app:", err);
      }
    }
  };
}
