import express, { type Express } from "express";
import cors from "cors";
import pinoHttpModule from "pino-http";
import helmetModule from "helmet";
import router from "./routes";
import { logger } from "./lib/logger";

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

const parseAllowedOrigins = (): (string | RegExp)[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  const base: (string | RegExp)[] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "https://ai.studio",
    "https://aistudio.google.com",
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.pages\.dev$/,
    /^https:\/\/.*\.workers\.dev$/,
    /^https:\/\/.*\.run\.app$/,
  ];
  if (!envOrigins) {
    return base;
  }
  const origins = envOrigins.split(",").map(o => o.trim()).filter(Boolean);
  return [...base, ...origins];
};

app.use(cors({
  origin: (origin, callback) => {
    // CRITICAL: Do NOT allow requests with no Origin when credentials are enabled
    if (!origin) {
      return callback(new Error('No origin header - access denied'), false);
    }
    
    const allowed = parseAllowedOrigins();
    const isExplicitlyAllowed = allowed.some(pattern => {
      if (typeof pattern === "string") return pattern === origin;
      if (pattern instanceof RegExp) return pattern.test(origin);
      return false;
    });
    
    // Only allow explicitly permitted origins - do NOT fallback to allowing all
    if (isExplicitlyAllowed) {
      return callback(null, true);
    }
    
    return callback(new Error('Origin not in allowlist'), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(helmet({
  // Enable security headers for a legal/PII application
  frameguard: { action: 'deny' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/api", router);

export default app;
