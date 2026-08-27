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
  if (!envOrigins) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ALLOWED_ORIGINS environment variable must be set in production.");
    }
    return ["http://localhost:3000", "http://localhost:5173"];
  }
  const origins = envOrigins.split(",").map(o => o.trim()).filter(Boolean);
  if (origins.some(o => o === "*")) {
    throw new Error("Wildcard CORS origin '*' is strictly forbidden when credentials are enabled.");
  }
  return origins;
};

app.use(cors({
  origin: parseAllowedOrigins(),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
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
      imgSrc: ["'self'", "data:", "https://*.googleusercontent.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/api", router);

export default app;
