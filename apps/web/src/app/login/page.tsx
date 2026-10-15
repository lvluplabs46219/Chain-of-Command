"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, isLoading, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      // OAuth redirects; on return session is established
    } catch {
      setError("Google sign-in is unavailable. Please try again.");
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
            Sign in with Google to open your workspace. New accounts continue to onboarding to create a real matter — no demo case data is loaded.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting || isLoading}
            className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting || isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Continue with Google"
            )}
          </button>

          {error && (
            <p role="alert" className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

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
