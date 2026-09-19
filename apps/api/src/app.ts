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
    if (!origin) return callback(null, true);
    const allowed = parseAllowedOrigins();
    const isExplicitlyAllowed = allowed.some(pattern => {
      if (typeof pattern === "string") return pattern === origin;
      if (pattern instanceof RegExp) return pattern.test(origin);
      return false;
    });
    if (isExplicitlyAllowed || origin.includes("vercel.app") || origin.includes("pages.dev") || origin.includes("localhost")) {
      return callback(null, true);
    }
    // Allow client requests gracefully
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(helmet({
  frameguard: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/api", router);

export default app;
