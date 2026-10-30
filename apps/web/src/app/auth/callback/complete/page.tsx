"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { setAuthToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Client-side completion for auth redirects that put tokens in the URL hash
 * (implicit flow) or when the server callback cannot finish PKCE alone.
 *
 * Supabase may redirect to:
 *   /auth/callback#access_token=...&refresh_token=...&type=signup
 * which the server route cannot read — this page can.
 */
function AuthCallbackCompleteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next") || "/";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState("Confirming your email…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      try {
        const supabase = getSupabaseClient();

        // 1) Hash fragment session (implicit / older templates)
        if (typeof window !== "undefined" && window.location.hash) {
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const access = hash.get("access_token");
          const refresh = hash.get("refresh_token");
          if (access) {
            const { data, error: setErr } = await supabase.auth.setSession({
              access_token: access,
              refresh_token: refresh || "",
            });
            if (setErr) throw setErr;
            if (data.session && !cancelled) {
              await bridge(data.session.access_token, data.session.refresh_token, data.session);
              router.replace(next);
              return;
            }
          }

          const tokenHash = hash.get("token_hash") || searchParams.get("token_hash");
          const type = (hash.get("type") || searchParams.get("type") || "signup") as
            | "signup"
            | "magiclink"
            | "recovery"
            | "invite"
            | "email";
          if (tokenHash) {
            const { data, error: otpErr } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type,
            });
            if (otpErr) throw otpErr;
            if (data.session && !cancelled) {
              await bridge(data.session.access_token, data.session.refresh_token, data.session);
              router.replace(next);
              return;
            }
          }
        }

        // 2) Query code (client has PKCE verifier in localStorage from same browser)
        const code = searchParams.get("code");
        if (code) {
          const { data, error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr) throw exErr;
          if (data.session && !cancelled) {
            await bridge(data.session.access_token, data.session.refresh_token, data.session);
            router.replace(next);
            return;
          }
        }

        // 3) Already have a session from detectSessionInUrl
        const { data: existing } = await supabase.auth.getSession();
        if (existing.session && !cancelled) {
          await bridge(
            existing.session.access_token,
            existing.session.refresh_token,
            existing.session,
          );
          router.replace(next);
          return;
        }

        if (!cancelled) {
          setError("Could not complete email confirmation. Try signing in.");
          setStatus("Confirmation failed");
        }
      } catch (err) {
        console.warn("[auth/callback/complete]", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Confirmation failed");
          setStatus("Confirmation failed");
        }
      }
    }

    async function bridge(
      accessToken: string,
      refreshToken: string | undefined,
      session: {
        user: {
          id: string;
          email?: string | null;
          user_metadata?: Record<string, unknown>;
        };
        expires_in?: number;
      },
    ) {
      setAuthToken(accessToken);
      const meta = session.user.user_metadata || {};
      await loginWithToken(accessToken, {
        id: session.user.id,
        email: session.user.email || undefined,
        name:
          (meta.full_name as string) ||
          (meta.name as string) ||
          session.user.email?.split("@")[0],
      });
      try {
        document.cookie = `sb-access-token=${accessToken}; path=/; SameSite=Lax; max-age=${session.expires_in || 3600}`;
        if (refreshToken) {
          document.cookie = `sb-refresh-token=${refreshToken}; path=/; SameSite=Lax; max-age=604800`;
        }
      } catch {
        /* ignore */
      }
      if (typeof window !== "undefined" && window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

    finish();
    return () => {
      cancelled = true;
    };
  }, [loginWithToken, next, router, searchParams]);

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#E1E2E5] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-4">
        {!error ? (
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto" />
        ) : null}
        <p className="text-sm text-neutral-300">{status}</p>
        {error && (
          <div className="space-y-3">
            <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl px-3 py-2">
              {error}
            </p>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="text-sm text-[#D4AF37] hover:underline"
            >
              Go to sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmingFallback() {
  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#E1E2E5] flex flex-col items-center justify-center p-6">
      <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto mb-4" />
      <p className="text-sm text-neutral-300">Confirming your email…</p>
    </div>
  );
}

export default function AuthCallbackCompletePage() {
  return (
    <Suspense fallback={<ConfirmingFallback />}>
      <AuthCallbackCompleteInner />
    </Suspense>
  );
}
