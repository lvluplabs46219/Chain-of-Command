/** Shared auth + env helpers for Edge Functions. */

export function isAuthorized(req: Request): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);

  const sharedSecret = Deno.env.get("EDGE_FUNCTION_SHARED_SECRET");
  if (sharedSecret && token === sharedSecret) return true;

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceKey && token === serviceKey) return true;

  // Accept well-formed JWTs (anon or user). For production, validate via
  // supabase.auth.getUser(token) when you need per-user authorization.
  if (token.startsWith("ey") && token.split(".").length === 3) return true;

  return false;
}

export function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing required secret: ${name}`);
  return v;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
