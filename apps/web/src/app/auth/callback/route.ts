import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Supabase Auth callback for:
 * - Email confirmation (token_hash + type, or PKCE code)
 * - OAuth / magic-link code exchange
 *
 * Email links often arrive as:
 *   /auth/callback?token_hash=...&type=signup
 *   /auth/callback?code=...
 *   /auth/callback#access_token=...  (hash → handled by client page)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as
    | "signup"
    | "invite"
    | "magiclink"
    | "recovery"
    | "email_change"
    | "email"
    | null;
  const nextRaw = url.searchParams.get("next") ?? "/";
  // Prevent open redirects
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";
  const origin = url.origin;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !anonKey) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", "auth_misconfigured");
    return NextResponse.redirect(login);
  }

  const cookieStore = await cookies();
  let response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            /* may fail in some runtimes */
          }
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let sessionAccess: string | null = null;
  let sessionRefresh: string | null = null;
  let expiresIn = 3600;
  let errorMessage: string | null = null;

  try {
    if (tokenHash && type) {
      // Email confirmation / magic link style (no PKCE verifier required)
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type === "email" ? "email" : type,
      });
      if (error) {
        errorMessage = error.message;
      } else if (data.session) {
        sessionAccess = data.session.access_token;
        sessionRefresh = data.session.refresh_token;
        expiresIn = data.session.expires_in ?? 3600;
      }
    } else if (code) {
      // PKCE / OAuth code — needs cookies from the browser that started auth when possible
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        // Fallback: plain client (no cookie PKCE) — works for some email templates
        const plain = createClient(supabaseUrl, anonKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        const second = await plain.auth.exchangeCodeForSession(code);
        if (second.error) {
          errorMessage = second.error.message || error.message;
        } else if (second.data.session) {
          sessionAccess = second.data.session.access_token;
          sessionRefresh = second.data.session.refresh_token;
          expiresIn = second.data.session.expires_in ?? 3600;
        }
      } else if (data.session) {
        sessionAccess = data.session.access_token;
        sessionRefresh = data.session.refresh_token;
        expiresIn = data.session.expires_in ?? 3600;
      }
    } else {
      // No server-visible params — tokens may be in the URL hash (not sent to the server).
      // Return HTML that preserves location.hash while moving to the client completer.
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Confirming…</title>
<script>
(function () {
  var next = ${JSON.stringify(next)};
  var q = new URLSearchParams(window.location.search);
  if (next && !q.get("next")) q.set("next", next);
  var target = "/auth/callback/complete" + (q.toString() ? "?" + q.toString() : "") + window.location.hash;
  window.location.replace(target);
})();
</script></head>
<body style="background:#0C0D10;color:#E1E2E5;font-family:system-ui;display:flex;min-height:100vh;align-items:center;justify-content:center">
Confirming your email…
</body></html>`;
      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "callback_exception";
  }

  if (sessionAccess) {
    response.cookies.set("sb-access-token", sessionAccess, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn,
    });
    if (sessionRefresh) {
      response.cookies.set("sb-refresh-token", sessionRefresh, {
        path: "/",
        sameSite: "lax",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    // Land on app root so AuthContext + FirstRunWizard pick up the session
    response.headers.set("Location", new URL(next, origin).toString());
    return response;
  }

  const login = new URL("/login", origin);
  login.searchParams.set("error", "auth_callback_failed");
  if (errorMessage) {
    login.searchParams.set("error_description", errorMessage.slice(0, 180));
  }
  login.searchParams.set("next", next);
  return NextResponse.redirect(login);
}
