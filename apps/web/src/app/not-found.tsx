import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fff7fb] text-[#281330] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#af0a78]">404</p>
        <h1 className="text-2xl font-semibold text-[#281330]">Page not found</h1>
        <p className="text-sm text-[#57414a] leading-relaxed">
          That route is not part of the Chain of Command workspace. Return to the command center
          or open The Wire.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(224,64,160,0.22)] hover:scale-[1.02] transition-transform"
          >
            Command Center
          </Link>
          <Link
            href="/wire"
            className="px-4 py-2.5 rounded-full border border-[#f0d5e2] bg-white text-[#281330] text-sm font-medium hover:border-[#af0a78]/40"
          >
            The Wire
          </Link>
          <Link
            href="/login"
            className="px-4 py-2.5 rounded-full border border-[#f0d5e2] bg-white text-[#281330] text-sm font-medium hover:border-[#af0a78]/40"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
