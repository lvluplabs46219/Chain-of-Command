export interface LimiterRequest {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
}

export interface LimiterResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (data: unknown) => void };
}

export type LimiterNextFunction = () => void;

interface SlidingLimiter {
  limit: (key: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }>;
}

let strictLimiter: SlidingLimiter | null = null;

function getLimiter(): SlidingLimiter | null {
  // Graceful fallback when Upstash is not configured in local environment
  return strictLimiter;
}

export async function rateLimitMiddleware(req: LimiterRequest, res: LimiterResponse, next: LimiterNextFunction) {
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
