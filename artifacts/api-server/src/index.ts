import app from "./app";
import { logger } from "./lib/logger";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const port = Number(process.env.PORT ?? 3001);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

// Serve static frontend in production
const distPath = path.resolve(__dirname, "../../mockup-sandbox/dist");
app.use(express.static(distPath));
app.use('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
