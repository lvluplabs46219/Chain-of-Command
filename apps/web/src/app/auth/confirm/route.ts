import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Alternate entry used by some Supabase email templates:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") ?? "signup";
  const next = url.searchParams.get("next") ?? "/";
  const origin = url.origin;

  if (!tokenHash) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", "missing_token");
    return NextResponse.redirect(login);
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  if (!supabaseUrl || !anonKey) {
    return NextResponse.redirect(new URL("/login?error=auth_misconfigured", origin));
  }

  const cookieStore = await cookies();
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  let response = NextResponse.redirect(new URL(safeNext, origin));

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
            /* ignore */
          }
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "signup" | "email" | "magiclink" | "recovery" | "invite",
  });

  if (error || !data.session) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", "auth_callback_failed");
    if (error?.message) {
      login.searchParams.set("error_description", error.message.slice(0, 180));
    }
    return NextResponse.redirect(login);
  }

  const maxAge = data.session.expires_in ?? 3600;
  response.cookies.set("sb-access-token", data.session.access_token, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge,
  });
  response.cookies.set("sb-refresh-token", data.session.refresh_token, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
