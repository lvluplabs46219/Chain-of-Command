"use client";

import React, { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Workspace Error Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#111214] text-[#e1e2e5] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#18191D] border border-[#2A2B35] rounded-2xl p-8 text-center space-y-4 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#D4AF37] mx-auto flex items-center justify-center font-bold">
          !
        </div>
        <h2 className="text-xl font-serif font-bold text-white">Workspace Notice</h2>
        <p className="text-sm text-neutral-400 leading-relaxed">
          The legal workspace encountered an error loading this view. You can reload without losing saved matter records.
        </p>
        {error?.message && (
          <p className="text-xs font-mono text-neutral-500 bg-[#101114] p-2 rounded border border-[#272830] break-words">
            {error.message}
          </p>
        )}
        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 text-sm font-semibold transition"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-xl border border-[#2A2B35] text-neutral-300 text-sm hover:border-[#D4AF37]/40 transition"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
