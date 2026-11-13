"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CounselAgentProfile } from "@/lib/wire/agentRoster";

type WireMessage = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatarColor: string;
  text: string;
  timestamp: string;
  isOutgoing: boolean;
};

type AgentRow = CounselAgentProfile & { retained?: boolean };

const CHANNELS = [
  { id: "general-swarm", name: "#general-swarm", preview: "Operations channel" },
  { id: "dev-scaffold", name: "#dev-scaffold", preview: "Build & scaffold" },
  { id: "security-audit", name: "#security-audit", preview: "Review & audit" },
  { id: "product-launch", name: "#product-launch", preview: "Launch coordination" },
];

/**
 * Native The Wire / Counsel Lab host — same origin on :3000.
 * No iframe to :3100. Agent state via /api/wire/*.
 */
export function WirePlaygroundHost() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [messages, setMessages] = useState<WireMessage[]>([]);
  const [chatId, setChatId] = useState("general-swarm");
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState<"channels" | "directory" | "roster" | "loadout">("channels");
  const [selectedAgent, setSelectedAgent] = useState<AgentRow | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const [sending, setSending] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const load = useCallback(async () => {
    try {
      const [h, a, m] = await Promise.all([
        fetch("/api/wire/health", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/wire/agents", { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/wire/messages?chatId=${encodeURIComponent(chatId)}`, { cache: "no-store" }).then((r) =>
          r.json(),
        ),
      ]);
      setOnline(h?.status === "ok");
      setAgents(Array.isArray(a) ? a : []);
      setMessages(Array.isArray(m) ? m : []);
    } catch {
      setOnline(false);
    }
  }, [chatId]);

  useEffect(() => {
    void load();
  }, [load]);

  const retained = useMemo(() => agents.filter((a) => a.retained), [agents]);

  async function retain(id: string) {
    await fetch("/api/wire/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function release(id: string) {
    await fetch("/api/wire/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "release" }),
    });
    await load();
  }

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await fetch("/api/wire/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, text }),
      });
      setDraft("");
      await load();
    } finally {
      setSending(false);
    }
  }

  const candy = theme === "light";

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{
        background: candy ? "#fff7fb" : "#170a1b",
        color: candy ? "#281330" : "#feebff",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Top bar */}
      <header
        className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-2 text-sm"
        style={{ borderColor: candy ? "#f8d8ff" : "#442154" }}
      >
        <span className="font-extrabold tracking-wide" style={{ color: "#af0a78" }}>
          The Wire
        </span>
        <span className="opacity-60">Counsel Lab · same-origin playground</span>
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[10px]"
          style={{
            background: online ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
            color: online ? "#059669" : "#e11d48",
          }}
        >
          {online ? "online · :3000" : online === false ? "offline" : "checking…"}
        </span>
        <nav className="ml-auto flex flex-wrap items-center gap-3 text-sm opacity-80">
          <button type="button" onClick={() => setTheme(candy ? "dark" : "light")} className="hover:opacity-100">
            {candy ? "Dark" : "Light"}
          </button>
          <Link href="/directory" className="hover:opacity-100" style={{ color: "#af0a78" }}>
            Directory
          </Link>
          <Link href="/chambers" className="hover:opacity-100">
            Chambers
          </Link>
          <Link href="/" className="hover:opacity-100">
            Workspace
          </Link>
        </nav>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside
          className="flex w-[300px] shrink-0 flex-col border-r"
          style={{ background: candy ? "#fff7fb" : "#1d0e23", borderColor: candy ? "#f8d8ff" : "#442154" }}
        >
          <div className="flex gap-1 border-b p-2" style={{ borderColor: candy ? "#f8d8ff" : "#442154" }}>
            {(["channels", "directory", "roster", "loadout"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 rounded-full px-2 py-1.5 text-[11px] font-semibold capitalize"
                style={{
                  background: tab === t ? "linear-gradient(135deg,#e040a0,#af0a78)" : "transparent",
                  color: tab === t ? "#fff" : candy ? "#57414a" : "#e0bfd2",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {tab === "channels" &&
              CHANNELS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChatId(c.id)}
                  className="mb-1 flex w-full flex-col rounded-2xl px-3 py-2 text-left"
                  style={{
                    background: chatId === c.id ? (candy ? "#fde7ff" : "#2c1536") : "transparent",
                  }}
                >
                  <span className="text-sm font-bold">{c.name}</span>
                  <span className="text-xs opacity-60">{c.preview}</span>
                </button>
              ))}

            {tab === "directory" &&
              agents.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedAgent(a)}
                  className="mb-2 w-full rounded-2xl border p-3 text-left"
                  style={{
                    borderColor: candy ? "#f8d8ff" : "#442154",
                    background: candy ? "#fff" : "#271330",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: a.avatarColor }}
                    >
                      {a.displayName
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{a.displayName}</div>
                      <div className="truncate text-[11px] opacity-60">{a.roleTitle}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.specialty.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="rounded-full px-2 py-0.5 text-[10px]"
                        style={{ background: candy ? "#fae0ff" : "#3a1c46" }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    {a.retained ? (
                      <span className="text-[11px] font-semibold" style={{ color: "#059669" }}>
                        Retained
                      </span>
                    ) : (
                      <span
                        role="button"
                        tabIndex={0}
                        className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                        style={{ background: "#af0a78" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          void retain(a.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void retain(a.id);
                        }}
                      >
                        Retain Counsel
                      </span>
                    )}
                  </div>
                </button>
              ))}

            {tab === "roster" &&
              (retained.length === 0 ? (
                <p className="p-3 text-sm opacity-60">No retained counsel yet. Open Directory to retain agents.</p>
              ) : (
                retained.map((a) => (
                  <div
                    key={a.id}
                    className="mb-2 rounded-2xl border p-3"
                    style={{ borderColor: candy ? "#f8d8ff" : "#442154", background: candy ? "#fff" : "#271330" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-8 w-8 rounded-full"
                          style={{ background: a.avatarColor }}
                        />
                        <div>
                          <div className="text-sm font-bold">{a.displayName}</div>
                          <div className="text-[11px] opacity-60">{a.status}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-[11px] opacity-70 hover:opacity-100"
                        onClick={() => void release(a.id)}
                      >
                        Release
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <button
                        type="button"
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                        style={{ background: "#af0a78" }}
                        onClick={() => {
                          setChatId(`dm-${a.id}`);
                          setTab("channels");
                        }}
                      >
                        Private consultation
                      </button>
                      {a.offersLive && (
                        <button
                          type="button"
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{ background: candy ? "#c5e7ff" : "#004c6a", color: candy ? "#006388" : "#c5e7ff" }}
                          onClick={() =>
                            alert(
                              "Go Live is scaffolded: voice/video will use realtime APIs + audit transcript. Not connected in this build.",
                            )
                          }
                        >
                          Go Live
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ))}

            {tab === "loadout" && (
              <div className="space-y-3 p-1">
                <p className="text-xs opacity-70">
                  COD-style skill loadout per agent. Equip primary, secondary skills, tools, and knowledge packs.
                </p>
                {(selectedAgent ? [selectedAgent] : retained.slice(0, 3)).map((a) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border p-3"
                    style={{ borderColor: candy ? "#f8d8ff" : "#442154", background: candy ? "#fff" : "#271330" }}
                  >
                    <div className="mb-2 text-sm font-bold">{a.displayName} — Loadout</div>
                    <div className="grid gap-2 text-[11px]">
                      <div>
                        <span className="opacity-50">Primary</span>
                        <div className="font-semibold">{a.loadout.primary}</div>
                      </div>
                      <div>
                        <span className="opacity-50">Secondary</span>
                        <div className="font-semibold">{a.loadout.secondary.join(", ") || "—"}</div>
                      </div>
                      <div>
                        <span className="opacity-50">Tools</span>
                        <div className="font-semibold">{a.loadout.tools.join(", ")}</div>
                      </div>
                      <div>
                        <span className="opacity-50">Knowledge</span>
                        <div className="font-semibold">{a.loadout.knowledgePacks.join(", ")}</div>
                      </div>
                      {a.web3?.enabled && (
                        <div
                          className="mt-1 rounded-xl px-2 py-1"
                          style={{ background: candy ? "#fff7ed" : "#431407" }}
                        >
                          Web3: {(a.web3.chains ?? []).join(", ")} · wallet-scoped reads only
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.skills.map((s) => (
                        <span
                          key={s.id}
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            background:
                              s.id === a.loadout.primary
                                ? "linear-gradient(135deg,#e040a0,#af0a78)"
                                : candy
                                  ? "#fae0ff"
                                  : "#3a1c46",
                            color: s.id === a.loadout.primary ? "#fff" : undefined,
                          }}
                          title={s.description}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {!selectedAgent && retained.length === 0 && (
                  <p className="text-sm opacity-60">Retain an agent or pick one in Directory to edit loadout.</p>
                )}
              </div>
            )}
          </div>

          <div className="border-t p-3 text-[10px] opacity-60" style={{ borderColor: candy ? "#f8d8ff" : "#442154" }}>
            Notice of AI Assistance: agents provide legal information only. Not a law firm. No attorney-client
            relationship.
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col">
          {selectedAgent && tab === "directory" ? (
            <AgentProfile
              agent={selectedAgent}
              candy={candy}
              onClose={() => setSelectedAgent(null)}
              onRetain={() => void retain(selectedAgent.id)}
              onRelease={() => void release(selectedAgent.id)}
            />
          ) : (
            <>
              <div
                className="flex items-center gap-2 border-b px-4 py-3"
                style={{ borderColor: candy ? "#f8d8ff" : "#442154" }}
              >
                <span className="font-bold">{CHANNELS.find((c) => c.id === chatId)?.name ?? chatId}</span>
                <span className="text-xs opacity-50">swarm channel</span>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.isOutgoing ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm"
                      style={{
                        background: m.isOutgoing
                          ? "linear-gradient(135deg,#e040a0,#af0a78)"
                          : candy
                            ? "#ffffff"
                            : "#2c1536",
                        color: m.isOutgoing ? "#fff" : candy ? "#281330" : "#feebff",
                        border: m.isOutgoing ? "none" : `1px solid ${candy ? "#f8d8ff" : "#442154"}`,
                      }}
                    >
                      {!m.isOutgoing && (
                        <div className="mb-1 text-[11px] font-bold" style={{ color: m.senderAvatarColor }}>
                          {m.senderName}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{m.text}</div>
                      <div className={`mt-1 text-[10px] ${m.isOutgoing ? "text-white/70" : "opacity-40"}`}>
                        {m.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-3" style={{ borderColor: candy ? "#f8d8ff" : "#442154" }}>
                <div className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    placeholder="Message the swarm…"
                    className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
                    style={{
                      background: candy ? "#fff" : "#271330",
                      borderColor: candy ? "#f8d8ff" : "#442154",
                      color: candy ? "#281330" : "#feebff",
                    }}
                  />
                  <button
                    type="button"
                    disabled={sending || !draft.trim()}
                    onClick={() => void send()}
                    className="rounded-full px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#e040a0,#af0a78)" }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function AgentProfile({
  agent,
  candy,
  onClose,
  onRetain,
  onRelease,
}: {
  agent: AgentRow;
  candy: boolean;
  onClose: () => void;
  onRetain: () => void;
  onRelease: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
      <button type="button" onClick={onClose} className="mb-4 self-start text-sm opacity-60 hover:opacity-100">
        ← Back to chat
      </button>
      <div
        className="rounded-3xl border p-6"
        style={{ borderColor: candy ? "#f8d8ff" : "#442154", background: candy ? "#fff" : "#271330" }}
      >
        <div className="flex flex-wrap items-start gap-4">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ background: agent.avatarColor }}
          >
            {agent.displayName
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold">{agent.displayName}</h1>
            <p className="text-sm opacity-70">{agent.roleTitle}</p>
            <p className="mt-1 text-xs opacity-50">{agent.jurisdictions.join(" · ")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {agent.retained ? (
              <button
                type="button"
                onClick={onRelease}
                className="rounded-full border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: candy ? "#f8d8ff" : "#442154" }}
              >
                Release
              </button>
            ) : (
              <button
                type="button"
                onClick={onRetain}
                className="rounded-full px-4 py-2 text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#e040a0,#af0a78)" }}
              >
                Retain Counsel
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed opacity-90">{agent.bio}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide opacity-50">Specialty</h2>
            <div className="flex flex-wrap gap-1">
              {agent.specialty.map((s) => (
                <span
                  key={s}
                  className="rounded-full px-2 py-1 text-xs"
                  style={{ background: candy ? "#fae0ff" : "#3a1c46" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide opacity-50">
              Education (training pedigree)
            </h2>
            <ul className="list-inside list-disc text-sm opacity-80">
              {agent.education.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide opacity-50">Fine-tune / ML</h2>
            <dl className="space-y-1 text-sm">
              <div>
                <dt className="opacity-50">Base model</dt>
                <dd className="font-medium">{agent.training.baseModel}</dd>
              </div>
              <div>
                <dt className="opacity-50">Fine-tunes</dt>
                <dd className="font-medium">{agent.training.fineTunes.join(", ")}</dd>
              </div>
              <div>
                <dt className="opacity-50">Corpora</dt>
                <dd className="font-medium">{agent.training.corpora.join(", ")}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide opacity-50">Loadout (skill playground)</h2>
            <p className="text-sm">
              Primary: <strong>{agent.loadout.primary}</strong>
            </p>
            <p className="text-sm opacity-80">Secondary: {agent.loadout.secondary.join(", ") || "—"}</p>
            <p className="text-sm opacity-80">Tools: {agent.loadout.tools.join(", ")}</p>
            {agent.web3?.enabled && (
              <p className="mt-2 rounded-xl px-2 py-1 text-xs" style={{ background: candy ? "#fff7ed" : "#431407" }}>
                Web3 agent · chains: {(agent.web3.chains ?? []).join(", ")} · no signing / no trade execution
              </p>
            )}
          </section>
        </div>

        <p className="mt-6 text-xs opacity-50">
          Directory listing for an AI information agent. Not a licensed attorney. Not a recommendation or endorsement.
          Compare profiles yourself; retain only agents you want on your bench.
        </p>
      </div>
    </div>
  );
}
