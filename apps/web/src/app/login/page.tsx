"use client";

export const dynamic = "force-dynamic";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithEmail } from "@/app/actions/auth-email";
import { getSupabaseClient } from "@/lib/supabaseClient";

const SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || "";

export default function LoginPage() {
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null);
  const { isLoading, isAuthenticated, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    if (!captchaToken) {
      setError("Complete the captcha below, then click Sign in.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await signInWithEmail({
        email: email.trim().toLowerCase(),
        password,
        captchaToken,
      });
      if ("error" in result) {
        setError(result.error);
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
        return;
      }

      // Sync browser Supabase client so AuthContext sees the session
      if (result.accessToken && result.refreshToken) {
        try {
          await getSupabaseClient().auth.setSession({
            access_token: result.accessToken,
            refresh_token: result.refreshToken,
          });
        } catch (sessErr) {
          console.warn("[login] setSession warning:", sessErr);
        }
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[login]", err);
      setError("Could not sign in. Try again.");
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  };


  const handleGoogle = async () => {
    setError(null);
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      // Redirect to Google is handled by Supabase
    } catch (err) {
      console.error('[login] google', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Google sign-in failed. Enable Google provider in Supabase Auth and add this origin to redirect URLs.'
      );
      setGoogleSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0D10] flex items-center justify-center text-neutral-400 text-sm">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#E1E2E5] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-white tracking-wide">CHAIN OF COMMAND</h1>
            <p className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider">Sign in</p>
          </div>
        </div>

        <div className="bg-[#141519] border border-[#2A2B35] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <p className="text-sm text-neutral-400 leading-relaxed">
            Sign in with email/password or Google. Complete captcha when shown (required by Supabase).
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {SITEKEY ? (
              <div className="flex justify-center py-1">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={SITEKEY}
                  theme="dark"
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => {
                    setCaptchaToken(null);
                    setError(
                      "Captcha failed to load. In hCaptcha dashboard → Settings → Domains, add: localhost and 127.0.0.1 (and lvluplabs.pro for prod). Disable ad blockers on this tab, then refresh."
                    );
                  }}
                />
              </div>
            ) : (
              <p className="text-xs text-amber-300">
                Captcha site key missing. Set NEXT_PUBLIC_HCAPTCHA_SITEKEY in apps/web/.env.local
              </p>
            )}

            {error && (
              <p role="alert" className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-[#2A2B35]" />
            </div>
            <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-wider">
              <span className="bg-[#141519] px-2 text-neutral-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleSubmitting || submitting}
            className="w-full py-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 border border-neutral-200"
          >
            {googleSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <p className="text-center text-xs text-neutral-500">
            New here?{" "}
            <Link href="/signup" className="text-[#D4AF37] hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-[10px] text-neutral-600 font-mono">
          NOT LEGAL ADVICE · NO ATTORNEY-CLIENT RELATIONSHIP
        </p>
      </div>
    </div>
  );
}
