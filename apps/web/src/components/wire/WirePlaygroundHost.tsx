"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ORIGIN =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_WIRE_ORIGIN || process.env.NEXT_PUBLIC_EMPYREAN_ORIGIN)?.replace(/\/+$/, "")) ||
  "http://127.0.0.1:3100";

/**
 * Hosts the native Wire daemon UI (Candy multi-agent dashboard — the Empyrean-looking playground).
 * Daemon must be running: npm run dev:wire  →  :3100
 */
export function WirePlaygroundHost() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${ORIGIN}/`, { mode: "no-cors", cache: "no-store" });
        // no-cors → opaque; treat as reachable if no network throw
        if (!cancelled) setOnline(true);
      } catch {
        try {
          const res = await fetch("/wire-api/health", { cache: "no-store" });
          if (!cancelled) setOnline(res.ok);
        } catch {
          if (!cancelled) setOnline(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-screen flex-col bg-[#0b0b0f] text-white">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-white/10 px-4 py-2 text-sm">
        <span className="font-extrabold tracking-wide text-[#D4AF37]">The Wire</span>
        <span className="text-white/50">Agent playground · GenTeam shell</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
            online === true
              ? "bg-emerald-500/20 text-emerald-300"
              : online === false
                ? "bg-rose-500/20 text-rose-300"
                : "bg-white/10 text-white/50"
          }`}
        >
          {online === true ? "daemon online" : online === false ? "daemon offline" : "checking…"}
        </span>
        <nav className="ml-auto flex flex-wrap gap-3 text-white/70">
          <a href={ORIGIN} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37]">
            Open full UI
          </a>
          <Link href="/playground" className="hover:text-[#D4AF37]">
            Swarm shell
          </Link>
          <Link href="/directory" className="hover:text-[#D4AF37]">
            Directory
          </Link>
          <Link href="/" className="hover:text-[#D4AF37]">
            Workspace
          </Link>
        </nav>
      </header>

      {online === false ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-lg font-bold text-[#D4AF37]">The Wire daemon is not running</p>
          <p className="max-w-lg text-sm text-white/60">
            The Empyrean-style GenTeam playground (channels, swarm, Candy light/dark) is served by the
            native UI on port 3100. Start it, then refresh this page.
          </p>
          <pre className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-left font-mono text-xs text-emerald-300">
{`cd ~/Development/Repos/Chain-of-Command
npm run dev:wire    # → http://127.0.0.1:3100`}
          </pre>
          <a
            href={ORIGIN}
            className="rounded-full bg-[#D4AF37] px-5 py-2 text-sm font-bold text-neutral-950 hover:bg-[#c49f27]"
          >
            Try {ORIGIN}
          </a>
        </div>
      ) : (
        <iframe
          src={ORIGIN}
          className="h-full w-full flex-1 border-0 bg-[#fff7fb]"
          title="The Wire — GenTeam multi-agent playground"
          allow="clipboard-read; clipboard-write"
        />
      )}
    </div>
  );
}
