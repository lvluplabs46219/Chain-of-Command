import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import crypto from 'crypto';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { createClient, User } from '@supabase/supabase-js';

// ==========================================
// 1. Environment & Configuration Validation
// ==========================================
const EnvSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  COURTLISTENER_WEBHOOK_SECRET: z.string().min(16).optional(), // optional just in case it's not set
  FILING_GATE_SECRET: z.string().min(32).optional(), // optional just in case it's not set
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,https://app.acquit.ai,https://acquit.ai'),
});

const env = EnvSchema.parse(process.env);
const PORT = parseInt(env.PORT, 10);
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());

// ==========================================
// 2. Structured Logging with PII Redaction
// ==========================================
export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.ssn',
      '*.dob',
      '*.email',
      '*.phone',
      'user.email',
      'body.token',
    ],
    censor: '[REDACTED_PII]',
  },
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

// ==========================================
// 3. Client Initialization
// ==========================================
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

declare global {
  namespace Express {
    interface Request {
      user?: User;
      rawBody?: Buffer;
    }
  }
}

// ==========================================
// 4. Rate Limiting (Upstash + In-Memory Fallback)
// ==========================================
let upstashRatelimit: Ratelimit | null = null;
if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  upstashRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: 'acquit_ratelimit',
  });
}

const memoryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const identifier = req.user?.id || req.ip || 'anonymous';
  if (upstashRatelimit) {
    try {
      const { success, limit, remaining, reset } = await upstashRatelimit.limit(identifier);
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', reset);
      if (!success) {
        logger.warn({ identifier }, 'Rate limit exceeded on Upstash');
        return res.status(429).json({ error: 'Rate limit exceeded: maximum 60 requests per minute.' });
      }
      return next();
    } catch (err) {
      logger.error({ err }, 'Upstash Redis failed. Falling back to in-memory rate limiter.');
    }
  }
  return memoryLimiter(req, res, next);
};

// ==========================================
// 5. Authentication & Security Middleware
// ==========================================
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required: Missing Bearer token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      logger.warn({ error: error?.message }, 'Invalid authentication token');
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
    }
    req.user = user;
    return next();
  } catch (err) {
    logger.error({ err }, 'Authentication verification failed');
    return res.status(500).json({ error: 'Internal auth service failure' });
  }
};

// ==========================================
// 6. Cryptographic Verification Utilities
// ==========================================
export function verifyHmacSignature(rawBody: Buffer, signatureHeader: string | undefined, secret: string): boolean {
  if (!signatureHeader) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const calculatedSignature = 'sha256=' + hmac.digest('hex');

  const sigBuffer = Buffer.from(signatureHeader);
  const calcBuffer = Buffer.from(calculatedSignature);

  if (sigBuffer.length !== calcBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, calcBuffer);
}

export function verifyHumanGateToken(token: string, secret: string, expectedFilingId: string): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest('hex');
    const sigBuffer = Buffer.from(signature, 'hex');
    const calcBuffer = Buffer.from(expectedSig, 'hex');

    if (sigBuffer.length !== calcBuffer.length || !crypto.timingSafeEqual(sigBuffer, calcBuffer)) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const isNotExpired = Date.now() - payload.timestamp < 15 * 60 * 1000; // 15-minute validity window
    const isFilingMatch = payload.filingId === expectedFilingId;

    return isNotExpired && isFilingMatch && payload.authorized === true;
  } catch {
    return false;
  }
}

// ==========================================
// 7. Express App Assembly & Security Config
// ==========================================
const app = express();
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://*.supabase.co', 'https://*.googleusercontent.com'],
        connectSrc: [
          "'self'",
          'https://*.supabase.co',
          'https://api.openai.com',
          'https://generativelanguage.googleapis.com',
          'https://*.googleapis.com',
        ],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Filing-Auth-Token', 'X-Signature'],
  })
);

app.use(
  express.json({
    limit: '20mb',
    verify: (req: Request, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(pinoHttp({ logger }));

// ==========================================
// 8. Core Routes
// ==========================================

// Health / Liveness
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Webhook: CourtListener Docket Ingestion (HMAC-Verified)
app.post('/api/webhooks/courtlistener', async (req: Request, res: Response) => {
  const signature = req.headers['x-signature'] as string | undefined;
  if (!req.rawBody || !env.COURTLISTENER_WEBHOOK_SECRET || !verifyHmacSignature(req.rawBody, signature, env.COURTLISTENER_WEBHOOK_SECRET)) {
    logger.warn('Unauthorized webhook delivery attempt: invalid HMAC signature');
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  const payload = req.body;
  try {
    const { error } = await supabaseAdmin.from('courtlistener_webhook_events').insert({
      event_type: payload.event_type || 'docket_update',
      payload: payload,
      received_at: new Date().toISOString(),
    });

    if (error) throw error;
    return res.status(202).json({ status: 'queued' });
  } catch (err) {
    logger.error({ err }, 'Failed to record webhook event');
    return res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Human-Gated Court Filing Authorization Endpoint
const SubmitFilingSchema = z.object({
  matterId: z.string().uuid(),
  filingId: z.string().uuid(),
  courtId: z.string().min(1),
  packageStoragePath: z.string().min(1),
});

app.post('/api/filings/submit', requireAuth, rateLimitMiddleware, async (req: Request, res: Response) => {
  const parse = SubmitFilingSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request payload', details: parse.error.format() });
  }

  const { matterId, filingId, courtId, packageStoragePath } = parse.data;
  const humanGateToken = req.headers['x-filing-auth-token'] as string | undefined;

  if (!humanGateToken || !env.FILING_GATE_SECRET || !verifyHumanGateToken(humanGateToken, env.FILING_GATE_SECRET, filingId)) {
    logger.warn({ filingId, userId: req.user!.id }, 'Filing submission rejected: Human authorization gate validation failed.');
    return res.status(403).json({
      error: 'Human authorization required. You must explicitly review and sign the filing packet prior to transmission.',
    });
  }

  try {
    // Record immutable audit log entry
    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.user!.id,
      matter_id: matterId,
      action: 'COURT_FILING_AUTHORIZED_SUBMISSION',
      details: {
        filingId,
        courtId,
        packageStoragePath,
        authorizedAt: new Date().toISOString(),
        verifiedHuman: true,
      },
    });

    // Mark filing status as approved/submitted
    await supabaseAdmin
      .from('filings')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', filingId)
      .eq('user_id', req.user!.id);

    return res.status(200).json({
      status: 'submitted',
      filingId,
      receiptNumber: `REC-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
      submittedAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.error({ err, filingId }, 'Filing submission process failed');
    return res.status(500).json({ error: 'Filing processing failure' });
  }
});

// Central Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err: err.message, stack: err.stack }, 'Unhandled API Exception');
  res.status(500).json({
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
// ==========================================
// 9. Process Lifecycle & Graceful Shutdown
// ==========================================
const server = app.listen(PORT, () => {
  logger.info(`Acquit.ai Consolidated API Server running on port ${PORT} [${env.NODE_ENV}]`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} signal received: closing HTTP server gracefully.`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forceful shutdown triggered after 10s timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
