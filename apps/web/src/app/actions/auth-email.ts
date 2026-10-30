"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

function getAuthClient() {
  const PROJECT_URL = "https://othxichdhzdxgtatautb.supabase.co";
  const PROJECT_ANON =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aHhpY2hkaHpkeGd0YXRhdXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDA5NTIsImV4cCI6MjA5NjMxNjk1Mn0.FGYkAsb1nLOB1oTy4crS0mmtzRJ6Od98YlZkGhZdfiA";
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    PROJECT_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    PROJECT_ANON;
  if (!url || !anon) {
    throw new Error("Missing Supabase URL or anon key");
  }
  return createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function setSessionCookies(session: {
  access_token: string;
  refresh_token: string;
}) {
  const store = await cookies();
  store.set("sb-access-token", session.access_token, COOKIE_OPTS);
  store.set("sb-refresh-token", session.refresh_token, {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export type AuthActionResult =
  | {
      ok: true;
      needsEmailConfirm?: boolean;
      message?: string;
      accessToken?: string;
      refreshToken?: string;
    }
  | { ok: false; error: string };

/** Persist tokens into httpOnly cookies for middleware hard gate. */
export async function persistSessionCookies(input: {
  accessToken: string;
  refreshToken: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!input.accessToken || !input.refreshToken) {
      return { ok: false, error: "Missing tokens" };
    }
    await setSessionCookies({
      access_token: input.accessToken,
      refresh_token: input.refreshToken,
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to set cookies",
    };
  }
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  fullName: string;
  captchaToken: string;
}): Promise<AuthActionResult> {
  try {
    const email = input.email.trim().toLowerCase();
    const password = input.password;
    const fullName = input.fullName.trim();
    const captchaToken = input.captchaToken?.trim();

    if (!email || !password || password.length < 8) {
      return { ok: false, error: "Valid email and password (8+ chars) required." };
    }
    if (!captchaToken) {
      return { ok: false, error: "Complete the captcha." };
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const supabase = getAuthClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        data: { full_name: fullName, role: "pro_se" },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    if (data.session) {
      await setSessionCookies(data.session);
      return {
        ok: true,
        needsEmailConfirm: false,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    }

    return {
      ok: true,
      needsEmailConfirm: true,
      message:
        "Account created. Check your email for a confirmation link, then sign in.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Signup failed",
    };
  }
}

export async function signInWithEmail(input: {
  email: string;
  password: string;
  captchaToken: string;
}): Promise<AuthActionResult> {
  try {
    const email = input.email.trim().toLowerCase();
    const password = input.password;
    const captchaToken = input.captchaToken?.trim();

    if (!email || !password) {
      return { ok: false, error: "Email and password required." };
    }
    if (!captchaToken) {
      return { ok: false, error: "Complete the captcha." };
    }

    const supabase = getAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken },
    });

    if (error) {
      const msg = error.message || "Login failed";
      if (/confirm|verified|email not confirmed/i.test(msg)) {
        return {
          ok: false,
          error:
            "Email not confirmed yet. Open the confirmation link in your inbox, then try again.",
        };
      }
      if (/captcha/i.test(msg)) {
        return {
          ok: false,
          error: "Captcha failed. Refresh the page, complete the checkbox, and try again.",
        };
      }
      if (/invalid login|invalid credentials/i.test(msg)) {
        return {
          ok: false,
          error: "Wrong email or password (or account does not exist yet).",
        };
      }
      return { ok: false, error: msg };
    }
    if (!data.session) {
      return {
        ok: false,
        error: "No session returned. Confirm your email first, then sign in.",
      };
    }

    await setSessionCookies(data.session);
    return {
      ok: true,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Login failed",
    };
  }
}
