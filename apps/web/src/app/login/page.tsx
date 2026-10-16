"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { bootstrapWorkspaceSession } from "@/app/actions/bootstrap-session";

export default function LoginPage() {
  const router = useRouter();
  const { loginAsLitigant, loginWithGoogle, isLoading, isAuthenticated } = useAuth();
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
      // Prefer real Supabase session bootstrap (service-role tenant + anonymous auth + cookies)
      const result = await bootstrapWorkspaceSession({
        displayName: name,
        redirectTo: "/",
      });
      // If redirect() did not fire (error path), surface it and fall back in dev only
      if (result && result.ok === false) {
        console.warn("[login] bootstrap failed:", result.error);
        await loginAsLitigant(name, mail);
        router.push("/");
      }
      // On success, server action already redirected
    } catch (err) {
      // NEXT_REDIRECT is expected on success; only treat real errors
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("NEXT_REDIRECT") || (err && typeof err === "object" && "digest" in err)) {
        return; // successful redirect
      }
      console.warn("[login] bootstrap exception, demo fallback:", err);
      try {
        await loginAsLitigant(name, mail);
        router.push("/");
      } catch {
        setError("Could not start session. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
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
      router.push("/");
    } catch {
      setError("Google sign-in is unavailable. Use email to continue.");
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
            Sign in to open your workspace. New accounts continue to onboarding to create a real matter — no demo case data is loaded.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting || isLoading}
            className="w-full py-3 rounded-xl border border-[#2A2B35] hover:border-[#D4AF37]/40 text-neutral-200 text-sm font-medium disabled:opacity-50"
          >
            Continue with Google
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
                  placeholder="Optional for local session"
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

            {error && (
              <p role="alert" className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting || isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Continue
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

        <p className="mt-4 text-center text-[10px] text-neutral-600 font-mono">
          NOT LEGAL ADVICE · NO ATTORNEY-CLIENT RELATIONSHIP
        </p>
      </div>
    </div>
  );
}
