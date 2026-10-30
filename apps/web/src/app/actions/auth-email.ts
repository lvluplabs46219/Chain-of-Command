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
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
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
  | { ok: true; needsEmailConfirm?: boolean; message?: string }
  | { ok: false; error: string };

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

    const supabase = getAuthClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        data: { full_name: fullName, role: "pro_se" },
        emailRedirectTo:
          process.env.NEXT_PUBLIC_SITE_URL
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
            : undefined,
      },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    if (data.session) {
      await setSessionCookies(data.session);
      return { ok: true, needsEmailConfirm: false };
    }

    // Email confirmation required
    return {
      ok: true,
      needsEmailConfirm: true,
      message:
        "Check your email to confirm your account, then sign in.",
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
      return { ok: false, error: error.message };
    }
    if (!data.session) {
      return { ok: false, error: "No session returned. Confirm your email first." };
    }

    await setSessionCookies(data.session);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Login failed",
    };
  }
}
