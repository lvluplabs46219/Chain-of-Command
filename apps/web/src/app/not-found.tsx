import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#E1E2E5] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">404</p>
        <h1 className="text-2xl font-serif font-semibold text-white">Page not found</h1>
        <p className="text-sm text-neutral-400 leading-relaxed">
          That route is not part of the Chain of Command workspace. Return to the command center
          or sign in to open your matters.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-neutral-950 text-sm font-semibold hover:bg-[#c49f27]"
          >
            Command Center
          </Link>
          <Link
            href="/login"
            className="px-4 py-2.5 rounded-xl border border-[#2A2B35] text-neutral-200 text-sm hover:border-[#D4AF37]/40"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
