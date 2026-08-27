import pino from "pino";

const isDevelopmentOrTest =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-api-key']",
      "req.headers['x-auth-token']",
      "res.headers['set-cookie']",
      "*.password",
      "*.token",
      "*.client_secret",
      "*.clientSecret",
      "*.secret",
      "*.accessToken",
      "*.refreshToken",
      "req.body.password",
      "req.body.token",
      "req.body.secret"
    ],
    censor: "[REDACTED]"
  },
  ...(isDevelopmentOrTest
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true }
        }
      }
    : {})
});
