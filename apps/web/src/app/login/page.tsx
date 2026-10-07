"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginAsLitigant, loginWithGoogle, isLoading, isAuthenticated, completeFirstRun } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  const enterWorkspace = async (name: string, mail: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await loginAsLitigant(name, mail);
      completeFirstRun();
      router.push("/");
    } catch {
      setError("Could not start session. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    await enterWorkspace("Pro Se Litigant", "litigant@local.chainofcommand");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    // Password is collected for future Supabase auth; local session does not verify it yet
    const name = email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    await enterWorkspace(name || "Pro Se Litigant", email.trim().toLowerCase());
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      completeFirstRun();
      router.push("/");
    } catch {
      setError("Google sign-in is unavailable in this environment. Use email or demo session.");
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
          <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-white tracking-wide">CHAIN OF COMMAND</h1>
            <p className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider">Pro Se Legal OS</p>
          </div>
        </div>

        <div className="bg-[#141519] border border-[#2A2B35] rounded-xl p-6 shadow-2xl space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Open your matter workspace. Cloud password auth is optional for now — a local pro se
              session is enough to use the tools.
            </p>
          </div>

          {/* Primary path: one-click demo */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={submitting || isLoading}
            className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {(submitting || isLoading) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Continue with demo session
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A2B35]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-[#141519] px-2 text-neutral-500">or use email</span>
            </div>
          </div>

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
                Password <span className="text-neutral-600 normal-case">(optional until cloud auth)</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Optional"
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

            {error && (
              <div role="alert" className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-2.5 rounded-lg border border-[#2A2B35] hover:border-[#D4AF37]/50 text-neutral-100 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(submitting || isLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in with email
            </button>
          </form>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting || isLoading}
            className="w-full py-2.5 rounded-lg bg-[#201f1f] border border-[#363535] hover:bg-[#2a2a2a] text-neutral-200 text-xs font-medium disabled:opacity-50"
          >
            Continue with Google
          </button>

          <p className="text-center text-xs text-neutral-500">
            New here?{" "}
            <Link href="/" className="text-[#D4AF37] hover:underline font-medium">
              First-time setup wizard
            </Link>
            {" · "}
            <Link href="/signup" className="text-[#D4AF37] hover:underline font-medium">
              Create account
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
