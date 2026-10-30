import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Empyrean — Native Agent Face | Chain of Command",
  description:
    "Full Empyrean multi-agent UI hosted as a Chain of Command place. Empyrean itself is unchanged.",
};

/**
 * Empyrean is a first-class face of Chain of Command.
 * This route only embeds the native Empyrean server UI (default :3100).
 * No forks or patches to apps/empyrean — proxy/host only.
 */
export default function EmpyreanNativePage() {
  const src =
    process.env.NEXT_PUBLIC_EMPYREAN_ORIGIN?.replace(/\/+$/, "") ||
    "http://localhost:3100";

  return (
    <div className="flex h-screen w-full flex-col bg-[#0C0D10]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#2A2B35] px-4 py-2 text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-3">
          <a href="/" className="text-[#D4AF37] hover:underline">
            ← Workspace
          </a>
          <span className="text-neutral-600">|</span>
          <span className="text-white">Empyrean</span>
          <span className="rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-fuchsia-300">
            native face · unchanged
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/playground" className="hover:text-[#D4AF37]">
            CoC Playground
          </a>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#D4AF37]"
          >
            Open direct
          </a>
        </div>
      </header>
      <iframe
        title="Empyrean native UI"
        src={src}
        className="h-full w-full flex-1 border-0 bg-[#0C0D10]"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
