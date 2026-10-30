"use client";

export const dynamic = "force-dynamic";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithEmail } from "@/app/actions/auth-email";

const SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || "";

export default function LoginPage() {
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null);
  const { isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      setError("Complete the captcha.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await signInWithEmail({
        email: email.trim().toLowerCase(),
        password,
        captchaToken,
      });
      if (!result.ok) {
        setError(result.error);
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setSubmitting(false);
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
            Sign in with the email and password you used to create your account.
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
                  onError={() => setCaptchaToken(null)}
                />
              </div>
            ) : (
              <p className="text-xs text-amber-300">Captcha site key missing (NEXT_PUBLIC_HCAPTCHA_SITEKEY).</p>
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

          <p className="text-center text-xs text-neutral-500">
            New here?{" "}
            <Link href="/signup" className="text-[#D4AF37] hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-center text-[10px] text-neutral-600 font-mono">
          NOT LEGAL ADVICE · NO ATTORNEY-CLIENT RELATIONSHIP
        </p>
      </div>
    </div>
  );
}
