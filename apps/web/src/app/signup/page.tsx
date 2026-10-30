"use client";

export const dynamic = "force-dynamic";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Eye, EyeOff, Loader2 } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { signUpWithEmail } from "@/app/actions/auth-email";

const SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || "";

export default function SignupPage() {
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (name.trim().length < 2) {
      setError("Enter your full name (at least 2 characters).");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return false;
    }
    if (!captchaToken) {
      setError("Complete the captcha.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await signUpWithEmail({
        email: email.trim().toLowerCase(),
        password,
        fullName: name.trim(),
        captchaToken: captchaToken!,
      });
      if (!result.ok) {
        setError(result.error);
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
        return;
      }
      if (result.needsEmailConfirm) {
        setInfo(result.message || "Check your email to confirm, then sign in.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not create account. Please try again.");
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#E1E2E5] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-white tracking-wide">CHAIN OF COMMAND</h1>
            <p className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider">Pro Se Legal OS</p>
          </div>
        </div>

        <div className="bg-[#141519] border border-[#2A2B35] rounded-xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Create account</h2>
          <p className="text-xs text-neutral-400 mb-5">Open a self-represented litigant workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div>
              <label htmlFor="name" className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="Jane Doe"
                required
              />
            </div>

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
                required
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Confirm password
              </label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                required
                minLength={8}
              />
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
              <div role="alert" className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div role="status" className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-3 py-2">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create account
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-neutral-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#D4AF37] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-[10px] text-neutral-600 font-mono">
          NOT AN ATTORNEY-CLIENT RELATIONSHIP · EDUCATIONAL USE ONLY
        </p>
      </div>
    </div>
  );
}
