"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginAsLitigant, loginWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Local session: name from email local-part until Supabase password auth is wired
      const name = email.split("@")[0].replace(/[._]/g, " ");
      await loginAsLitigant(name, email.trim().toLowerCase());
      router.push("/");
    } catch {
      setError("Invalid credentials. Check email and password, or use demo session.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      router.push("/");
    } catch {
      setError("Google sign-in failed. Try email login or demo session.");
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
          <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
          <p className="text-xs text-neutral-400 mb-5">Access your matter workspace and AI legal team.</p>

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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="••••••••"
                  required
                  minLength={6}
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
              className="w-full py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(submitting || isLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A2B35]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-[#141519] px-2 text-neutral-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting || isLoading}
            className="w-full py-2.5 rounded-lg bg-[#201f1f] border border-[#363535] hover:bg-[#2a2a2a] text-neutral-200 text-xs font-medium disabled:opacity-50"
          >
            Continue with Google
          </button>

          <p className="mt-5 text-center text-xs text-neutral-500">
            No account?{" "}
            <Link href="/signup" className="text-[#D4AF37] hover:underline font-medium">
              Create one
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
