import { Request, Response, NextFunction } from 'express';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

let strictLimiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (!strictLimiter && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      strictLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
      });
    } catch {
      strictLimiter = null;
    }
  }
  return strictLimiter;
}

export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const limiter = getLimiter();
  if (!limiter) {
    // Fallback to bypass in local DEV if Redis envs aren't set
    return next();
  }

  try {
    const identifier = req.ip || 'anonymous';
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', reset.toString());

    if (!success) {
      res.status(429).json({
        error: 'Too many requests.',
        message: 'Rate limit exceeded for document generation and vector endpoints.',
      });
      return;
    }
  } catch {
    // Gracefully continue on ratelimit failure
  }

  next();
}

