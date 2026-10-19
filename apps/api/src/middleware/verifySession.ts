import { Request, Response, NextFunction } from "express";
import { createClient, User } from "@supabase/supabase-js";

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

// Authenticated routes use named single-segment parameters, not wildcard arrays.
export interface AuthenticatedRequest extends Request<Record<string, string>> {
  user?: User;
}

/** Demo / local pro-se tokens — never in production. */
function allowDemoAuth(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.ALLOW_DEMO_AUTH === "false") return false;
  return true;
}

function isDemoStyleToken(token: string): boolean {
  return (
    token.startsWith("demo-token") ||
    token.startsWith("mock-token") ||
    token.startsWith("dev-token") ||
    token.startsWith("coc-session-") ||
    token === "acquit-pro-se-token"
  );
}

export async function verifySession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      error: { code: "UNAUTHENTICATED", message: "Missing or malformed authorization header." },
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Empty bearer token." } });
    return;
  }

  if (isDemoStyleToken(token)) {
    if (!allowDemoAuth()) {
      res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Demo session tokens are disabled. Sign in with Supabase Auth (see ADR-001).",
        },
      });
      return;
    }
    req.user = {
      id: "pro-se-alex-46201",
      email: "litigant@chainofcommand.org",
      app_metadata: {},
      user_metadata: { role: "pro_se", full_name: "Pro Se Litigant" },
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;
    next();
    return;
  }

  try {
    const client = getSupabase();
    if (!client) {
      res.status(503).json({
        error: "SERVICE_UNAVAILABLE",
        message: "Authentication service not configured (SUPABASE_URL / SUPABASE_ANON_KEY).",
      });
      return;
    }

    const {
      data: { user },
      error,
    } = await client.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Invalid or expired session token. API accepts Supabase JWTs only (not Firebase ID tokens).",
        },
      });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Supabase auth error:", err);
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Authentication service unavailable.",
    });
  }
}
