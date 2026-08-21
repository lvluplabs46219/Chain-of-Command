import app from "./app";
import { logger } from "./lib/logger";

const PORT = parseInt(process.env.PORT || "3001", 10);

const server = app.listen(PORT, () => {
  logger.info(`Acquit.ai API Server listening on port ${PORT} [${process.env.NODE_ENV ?? "development"}]`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} signal received: closing HTTP server gracefully.`);
  server.close(() => {
    logger.info("HTTP server closed. Exiting process.");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forceful shutdown triggered after 10s timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
