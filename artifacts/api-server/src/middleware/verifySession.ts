import { Request, Response, NextFunction } from 'express';
import { createClient, User } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error('Supabase environment variables missing');
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
    const { data: { user }, error } = await getSupabase().auth.getUser(token);
    
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
