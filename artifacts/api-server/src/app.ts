import express, { type Express } from "express";
import cors from "cors";
import pinoHttpModule from "pino-http";
import helmetModule from "helmet";
import router from "./routes";
import { logger } from "./lib/logger";
import { verifySession } from "./middleware/verifySession";

// pino-http and helmet publish callable CommonJS exports whose TypeScript
// declarations can be exposed as module namespaces under Vercel/Bun's
// bundler resolution. Normalize them once at the boundary so the app remains
// type-safe regardless of the package-manager/module-resolution combination.
const pinoHttp = pinoHttpModule as unknown as (options?: any) => any;
const helmet = helmetModule as unknown as (options?: any) => any;

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({
  origin: true, // Allow all origins in development/preview
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "https://*.supabase.co",
        "https://generativelanguage.googleapis.com",
        "https://*.googleapis.com",
        "https://api.openai.com",
      ],
      imgSrc: ["'self'", 'data:', 'https:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
