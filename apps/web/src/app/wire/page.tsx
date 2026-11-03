import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Wire — Agent Playground | Chain of Command",
  description:
    "The Wire: multi-agent playground UI hosted as a Chain of Command place. Worker mesh runs on :3100.",
};

/**
 * The Wire is a first-class face of Chain of Command (agent playground).
 * Embeds the native Wire server UI (default :3100). No product counsel surface.
 */
export default function WirePage() {
  const origin =
    process.env.NEXT_PUBLIC_WIRE_ORIGIN?.replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_EMPYREAN_ORIGIN?.replace(/\/+$/, "") ||
    "http://127.0.0.1:3100";

  return (
    <div className="flex flex-col h-screen bg-[#0b0b0f] text-white">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-white/10 text-sm">
        <span className="font-extrabold tracking-wide text-[#D4AF37]">The Wire</span>
        <span className="text-white/50">Agent playground</span>
        <nav className="ml-auto flex gap-4 text-white/70">
          <a href="/playground" className="hover:text-[#D4AF37]">
            Swarm shell
          </a>
          <a href="/directory" className="hover:text-[#D4AF37]">
            Directory
          </a>
        </nav>
      </header>
      <iframe
        src={origin}
        className="flex-1 w-full border-0"
        title="The Wire native UI"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
