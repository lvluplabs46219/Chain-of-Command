import { Request, Response, NextFunction } from 'express';
import { createClient, User } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return null;
    }
    supabase = createClient(url, anonKey);
  }
  return supabase;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function verifySession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or malformed authorization header.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const client = getSupabase();
    if (!client) {
      console.warn("Supabase keys missing - falling back to unauthenticated state");
      res.status(503).json({ error: 'SERVICE_UNAVAILABLE', message: 'Authentication service not configured.' });
      return;
    }

    const { data: { user }, error } = await client.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired session token.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Supabase auth error:", err);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Authentication service unavailable.' });
  }
}
