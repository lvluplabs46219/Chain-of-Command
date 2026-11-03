"use client";

// The Wire — multi-agent swarm playground (formerly Empyrean UI shell).
// Slack-style: channel sidebar (Team Channels + Digital Employees), pinned directive,
// agent message feed, Open Canvas / Call For Me / Appoint Counsel actions, Candy settings modal.
// Chain of command: Head Legal AI -> Research AI -> Rights Checker -> Head. Not legal advice.
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LayoutGrid, X } from "lucide-react";
import { AgentRolodex3D } from "@/components/directory/AgentRolodex3D";
import {
  wireHealth,
  wireSendMessage,
  wireDirective,
  wireListMessages,
  wireListAgents,
} from "@/lib/empyreanClient";

const candy = {
  light: {
    bg: "#fff7fb", surface: "#ffefff", surfaceContainer: "#fde7ff",
    surfaceLow: "#ffefff", surfaceHighest: "#f8d8ff", dim: "#efd0f7",
    onSurface: "#281330", onSurfaceVariant: "#57414a",
    primary: "#af0a78", primaryAccent: "#e040a0", inversePrimary: "#ffafd5",
    secondary: "#744aa2", msgIn: "#ffffff", msgInText: "#281330",
    outline: "#77566a", outlineVariant: "#ddbfca",
    online: "#34d399", cardBg: "#ffffff", cardBorder: "#f8d8ff",
  },
  dark: {
    bg: "#170a1b", surface: "#22102a", surfaceContainer: "#2c1536",
    surfaceLow: "#22102a", surfaceHighest: "#432052", dim: "#16081b",
    onSurface: "#feebff", onSurfaceVariant: "#e0bfd2",
    primary: "#ff4db8", primaryAccent: "#ff75c8", inversePrimary: "#af0a78",
    secondary: "#cda0fe", msgIn: "#2c1536", msgInText: "#feebff",
    outline: "#8a707b", outlineVariant: "#492a3e",
    online: "#10b981", cardBg: "#271330", cardBorder: "#442154",
  },
};

const CHANNELS = [
  { id: "general-bench", name: "general-bench", desc: "Whole-team directives and coordination", pinned: "Assess Delgado plea exposure and file mitigation strategy by Friday." },
  { id: "dev-motions", name: "motions-desk", desc: "Drafting and filing motions", pinned: "Draft response to suppression motion — due Oct 31." },
  { id: "rights-audit", name: "rights-audit", desc: "Fourth/Fifth Amendment audit trail", pinned: "Audit Officer Report extraction chain of custody." },
  { id: "case-delgado", name: "case-delgado", desc: "State v. Delgado — CF-2026-0142", pinned: "Hearing prep kit for Nov 4 appearance." },
];

const EMPLOYEES = [
  { id: "head", name: "Head Legal AI", sub: "Presiding Counsel — issues directives", color: "#af0a78", online: true },
  { id: "research", name: "Research AI", sub: "Associate — searches the stacks", color: "#744aa2", online: true },
  { id: "paralegal", name: "Paralegal AI", sub: "Clerk — files records, cites everything", color: "#0ea5e9", online: true },
  { id: "courtprep", name: "Court Prep AI", sub: "Advocate — hearing kits, mock arguments", color: "#f59e0b", online: true },
  { id: "rights", name: "Rights Checker", sub: "Rights Audit — verifies every answer", color: "#10b981", online: false },
];

type Msg = { agent: string; text: string; time: string; cites?: string[] };

const SEED: Record<string, Msg[]> = {
  "general-bench": [
    { agent: "head", time: "09:41", text: "Directive received. Delegating research to Research AI; chain of command logged in the Court Log." },
    { agent: "research", time: "09:42", text: "Reviewed 12 authorities in the stacks. Key precedent: Miranda v. Arizona, 384 U.S. 436 (1966) and Edwards v. Arizona, 451 U.S. 477 (1981). Research brief filed to the Brief Board.", cites: ["Miranda v. Arizona", "Edwards v. Arizona"] },
    { agent: "rights", time: "09:43", text: "Rights Audit complete. No Fourth or Fifth Amendment violations flagged. Cleared for delivery." },
    { agent: "paralegal", time: "09:45", text: "Charging Instrument and Officer Report extracted and filed. Chronology Rail updated with arraignment minutes." },
  ],
  "dev-motions": [
    { agent: "courtprep", time: "08:12", text: "Working Draft started: response to suppression motion. Outline mirrors our hearing kit from the Nov 4 prep." },
    { agent: "paralegal", time: "08:30", text: "Filing Deadline confirmed: Oct 31, 5:00 PM. Deadline Engine set a 72-hour notice." },
  ],
  "rights-audit": [
    { agent: "rights", time: "07:55", text: "Chain of custody verified on all three exhibits. Exhibit B flagged for review — signature page low OCR confidence." },
  ],
  "case-delgado": [
    { agent: "head", time: "Yesterday", text: "Plea Analysis: exposure on the burglary count is high; mitigation memo recommended before the Nov 4 appearance." },
    { agent: "research", time: "Yesterday", text: "Mitigation Memo drafted — employment history and restitution readiness noted. Filed to Record Room as a Working Draft.", cites: ["State v. Kelly"] },
  ],
};

const CANNED: Record<string, string> = {
  head: "Directive received. Delegating down the chain of command; outcome will be posted to this channel.",
};

const initials = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("");

export function ChambersPlayground() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [bounce, setBounce] = useState(true);
  const [view, setView] = useState<"All" | "Channels" | "Employees" | "Canvas">("All");
  const [channel, setChannel] = useState("general-bench");
  const [settings, setSettings] = useState(false);
  const [input, setInput] = useState("");
  const [routing, setRouting] = useState(false);
  const [logs, setLogs] = useState<Record<string, Msg[]>>(() => ({ ...SEED }));
  const [wireOnline, setWireOnline] = useState<boolean | null>(null);
  const [wireNote, setWireNote] = useState<string | null>(null);
  const [rolodexOpen, setRolodexOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const c = candy[theme];
  const ch = CHANNELS.find((x) => x.id === channel)!;
  const msgs = logs[channel] ?? [];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, routing]);

  const spring = bounce ? { type: "spring" as const, stiffness: 400, damping: 17 } : { duration: 0 };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const h = await wireHealth();
      if (cancelled) return;
      setWireOnline(h.ok);
      if (h.ok) {
        setWireNote(`The Wire online · ${h.agentsCount ?? "?"} agents`);
        try {
          const agents = await wireListAgents();
          if (!cancelled && agents.length) {
            setWireNote(`The Wire online · ${agents.length} agents (Michael orchestration)`);
          }
        } catch { /* optional */ }
      } else {
        setWireNote("The Wire offline — demo chain active. Run: npm run dev:wire");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const mapWireMsgs = useCallback((rows: { senderId?: string; senderName?: string; text?: string; timestamp?: string; isOutgoing?: boolean }[]): Msg[] => {
    return rows.map((m) => {
      let agent = (m.senderId || "head").toLowerCase();
      if (m.isOutgoing || agent === "user") agent = "user";
      else if (agent.includes("michael") || agent.includes("head")) agent = "head";
      else if (agent.includes("research") || agent.includes("metatron")) agent = "research";
      else if (agent.includes("right") || agent.includes("raphael")) agent = "rights";
      else if (agent.includes("gabriel") || agent.includes("para")) agent = "paralegal";
      else if (agent.includes("court") || agent.includes("seraph")) agent = "courtprep";
      return {
        agent,
        text: m.text || "",
        time: m.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }).filter((m) => m.text);
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || routing) return;
    setInput("");
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs((l) => ({ ...l, [channel]: [...(l[channel] ?? []), { agent: "user", text, time: now }] }));
    setRouting(true);
    setWireNote(null);

    // Prefer live The Wire swarm
    try {
      const health = await wireHealth();
      setWireOnline(health.ok);
      if (health.ok) {
        await wireSendMessage(channel, text);
        // Also fire orchestrator directive for legal routing
        try {
          await wireDirective(text, { channel, surface: "the-wire" });
        } catch (dirErr) {
          console.warn("[The Wire] directive", dirErr);
        }
        // Poll messages briefly for agent replies
        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 700));
          try {
            const remote = await wireListMessages(channel);
            if (remote.length) {
              const mapped = mapWireMsgs(remote);
              if (mapped.length) {
                setLogs((l) => ({ ...l, [channel]: mapped }));
              }
            }
          } catch { /* keep polling */ }
        }
        setRouting(false);
        setWireNote("Routed through The Wire (orchestrator → swarm)");
        return;
      }
    } catch (err) {
      console.warn("[The Wire] send fallback", err);
      setWireOnline(false);
      setWireNote(err instanceof Error ? err.message : "The Wire unreachable — demo chain");
    }

    // Offline demo chain of command
    const chain: Array<[string, string]> = [
      ["head", CANNED.head],
      ["research", "Researching the stacks for authorities on point... filing findings to this channel."],
      ["rights", "Rights Audit complete. Cleared for delivery. Not legal advice."],
    ];
    chain.forEach(([agentId, reply], i) => {
      setTimeout(() => {
        setLogs((l) => ({ ...l, [channel]: [...(l[channel] ?? []), { agent: agentId, text: reply, time: now }] }));
        if (i === chain.length - 1) setRouting(false);
      }, 900 + i * 1100);
    });
  };

  const visibleChannels = view === "Employees" ? [] : CHANNELS;
  const visibleEmployees = view === "Channels" ? [] : EMPLOYEES;

  return (
    <div className="relative flex h-screen w-full overflow-hidden pt-7" style={{ background: c.bg, color: c.onSurface, fontFamily: "DM Sans, system-ui, sans-serif" }}>

      {/* The Wire status strip */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-2 px-3 py-1.5 text-[10px] font-mono border-b" style={{ background: c.surfaceContainer, borderColor: c.cardBorder, color: c.onSurfaceVariant }}>
        <span>
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: wireOnline ? c.online : "#f43f5e" }} />
          {wireNote || (wireOnline === null ? "Checking The Wire…" : wireOnline ? "The Wire connected" : "The Wire offline (demo)")}
        </span>
        <span className="flex gap-3">
          <Link href="/" className="hover:underline" style={{ color: c.primary }}>Workspace</Link>
          <Link href="/library" className="hover:underline" style={{ color: c.primary }}>Library</Link>
          <span style={{ color: c.outline }}>NOT LEGAL ADVICE</span>
        </span>
      </div>

      {/* ===== SIDEBAR ===== */}
      <div className="w-64 shrink-0 border-r flex flex-col" style={{ borderColor: c.cardBorder, background: c.surface }}>
        <div className="p-3 border-b" style={{ borderColor: c.cardBorder }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-extrabold" style={{ background: c.primary }}>⚡</span>
            <div>
              <span className="font-extrabold text-lg block leading-none">The Wire</span>
              <span className="text-[10px] font-mono tracking-wider font-semibold block mt-0.5" style={{ color: c.primary }}>AI Lawyer Swarm</span>
            </div>
            <button onClick={() => setSettings(true)} className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ background: c.surfaceContainer, color: c.onSurfaceVariant }} title="Workspace & Bench Settings">⚙</button>
          </div>
          <input placeholder="Search swarm or 🔍" className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: c.surfaceContainer, color: c.onSurface, border: "1px solid " + c.outlineVariant }} />
          <div className="flex gap-1.5 mt-2">
            {(["All", "Channels", "Employees", "Canvas"] as const).map((t) => (
              <button key={t} onClick={() => {
                setView(t);
                if (t === "Employees") setRolodexOpen(true);
              }}
                className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: view === t ? c.primary : c.surfaceContainer,
                  color: view === t ? "#ffffff" : c.onSurfaceVariant,
                  border: "1px solid " + (view === t ? c.primary : c.outlineVariant),
                }}>{t}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {visibleChannels.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: c.onSurfaceVariant }}>Team Channels</div>
              {visibleChannels.map((x) => (
                <motion.button key={x.id} whileHover={bounce ? { scale: 1.02 } : undefined} transition={spring}
                  onClick={() => setChannel(x.id)}
                  className={"w-full text-left px-2.5 py-1.5 rounded-lg mb-0.5 text-sm font-semibold transition-colors " + (channel === x.id ? "" : "hover:opacity-75")}
                  style={{ background: channel === x.id ? c.surfaceHighest : "#00000000", color: c.onSurface }}>
                  <span style={{ color: c.primary }}>#</span> {x.name}
                </motion.button>
              ))}
            </div>
          )}
          {visibleEmployees.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: c.onSurfaceVariant }}>Digital Employees</div>
                <button
                  type="button"
                  title="Open 3D Agent Rolodex"
                  onClick={() => setRolodexOpen(true)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: c.primary, border: "1px solid " + c.outlineVariant, background: c.surfaceContainer }}
                  aria-label="Open 3D agent rolodex"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
              {visibleEmployees.map((a) => (
                <motion.button key={a.id} whileHover={bounce ? { scale: 1.02 } : undefined} transition={spring}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg mb-0.5 text-left"
                  style={{ background: "#00000000" }}>
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: a.color }}>{initials(a.name)}</div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: a.online ? c.online : c.outline, borderColor: c.surface }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: c.onSurface }}>{a.name}</div>
                    <div className="text-xs truncate" style={{ color: c.onSurfaceVariant }}>{a.sub}</div>
                  </div>
                </motion.button>
              ))}
              <button className="w-full mt-1 px-2 py-1.5 rounded-lg text-sm font-semibold"
                style={{ border: "1px dashed " + c.outlineVariant, color: c.onSurfaceVariant }}>+ Appoint Counsel</button>
            </div>
          )}
        </div>

        <div className="p-3 border-t text-xs" style={{ borderColor: c.cardBorder, color: c.onSurfaceVariant }}>
          Chain of command: Head → Research → Rights → Head
        </div>
      </div>

      {/* ===== MAIN ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: c.cardBorder, background: c.surface }}>
          <div className="min-w-0">
            <div className="font-extrabold text-lg truncate"><span style={{ color: c.primary }}>#</span> {ch.name}</div>
            <div className="text-xs truncate" style={{ color: c.onSurfaceVariant }}>{ch.desc}</div>
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <motion.button
              type="button"
              whileHover={bounce ? { scale: 1.04 } : undefined}
              transition={spring}
              onClick={() => setRolodexOpen(true)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "transparent",
                color: c.onSurfaceVariant,
                border: "1px solid " + c.outlineVariant,
              }}
            >
              View Agent Rolodex
            </motion.button>
            <Link
              href="/draft-desk"
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{
                background: "transparent",
                color: c.onSurface,
                border: "1px solid " + c.outlineVariant,
              }}
            >
              Open Canvas
            </Link>
            <motion.button
              type="button"
              whileHover={bounce ? { scale: 1.04 } : undefined}
              transition={spring}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: c.surfaceHighest,
                color: c.onSurface,
                border: "1px solid " + c.outlineVariant,
              }}
            >
              Call For Me
            </motion.button>
            <motion.button
              type="button"
              whileHover={bounce ? { scale: 1.04 } : undefined}
              transition={spring}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md"
              style={{
                background: c.primary,
                color: "#ffffff",
                border: "1px solid " + c.primary,
                boxShadow: "0 4px 14px rgba(175,10,120,0.35)",
              }}
            >
              + Deploy Role
            </motion.button>
          </div>
        </div>

        {/* Pinned directive */}
        <div className="mx-5 mt-3 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold"
          style={{ background: c.surfaceHighest, border: "1px solid " + c.cardBorder, color: c.onSurface }}>
          <span>📌</span> Pinned Directive: {ch.pinned}
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {msgs.length === 0 && (
            <div className="text-sm" style={{ color: c.onSurfaceVariant }}>No messages in this channel yet. Assign a task or direct the team below!</div>
          )}
          {msgs.map((m, i) => {
            const a = EMPLOYEES.find((x) => x.id === m.agent);
            const mine = m.agent === "user";
            return (
              <div key={i} className="flex gap-3">
                {a && (
                  <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: a.color }}>{initials(a.name)}</div>
                )}
                {mine && <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: c.secondary }}>AB</div>}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold" style={{ color: mine ? c.onSurface : (a?.color ?? c.onSurface) }}>{mine ? "You" : a?.name}</span>
                    {!mine && a && <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: c.surfaceContainer, color: c.onSurfaceVariant }}>{a.sub.split(" — ")[0]}</span>}
                    <span className="text-xs" style={{ color: c.onSurfaceVariant }}>{m.time}</span>
                  </div>
                  <div className="text-sm rounded-2xl px-4 py-2.5 max-w-[75%]"
                    style={{ background: c.msgIn, color: c.msgInText, border: "1px solid " + c.cardBorder,
                      borderBottomLeftRadius: "6px" }}>{m.text}</div>
                  {m.cites && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {m.cites.map((cite) => (
                        <span key={cite} className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: c.surfaceHighest, color: c.secondary }}>{cite}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {routing && (
            <div className="flex items-center gap-2 text-xs" style={{ color: c.onSurfaceVariant }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: c.primary }} />
              Directive traveling the chain of command...
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: c.cardBorder, background: c.surface }}>
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Assign a task or direct the team below!"
              className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
              style={{ background: c.surfaceContainer, color: c.onSurface, border: "1px solid " + c.outlineVariant }} />
            <motion.button whileHover={bounce ? { scale: 1.05 } : undefined} transition={spring}
              onClick={send} disabled={routing}
              className="rounded-2xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: c.primary }}>Send</motion.button>
          </div>
          <div className="text-center text-xs mt-2" style={{ color: c.onSurfaceVariant }}>
            Notice of AI Assistance — The Wire swarm output is educational and procedural, not legal advice.
          </div>
        </div>
      </div>

      {/* ===== SETTINGS MODAL ===== */}
      <AnimatePresence>
        {settings && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center" style={{ background: "rgba(40,19,48,0.4)" }}
            onClick={() => setSettings(false)}>
            <motion.div initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} transition={spring}
              onClick={(e) => e.stopPropagation()}
              className="w-[560px] max-w-[92vw] rounded-3xl p-6" style={{ background: c.surfaceContainer, border: "1px solid " + c.cardBorder, color: c.onSurface }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold">Workspace & Bench Settings</h2>
                <button onClick={() => setSettings(false)} className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: c.surfaceHighest, color: c.onSurfaceVariant }}>✕</button>
              </div>
              <div className="flex gap-2 mb-5">
                {["Appearance & Theme", "Swarm Models", "Second Brain", "Call & Voice"].map((t, i) => (
                  <span key={t} className="px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: i === 0 ? c.primary : c.surfaceHighest,
                      color: i === 0 ? "#ffffff" : c.onSurfaceVariant }}>{t}</span>
                ))}
              </div>

              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.onSurfaceVariant }}>Design Scheme & Color Mode</div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[["light", "Candy Light", "☀", "Joyful Pop — #fff7fb surface"], ["dark", "Candy Dark", "🌙", "Neon Plum — #1d0e23 surface"]].map(([id, label, icon, desc]) => (
                  <button key={id} onClick={() => setTheme(id as "light" | "dark")}
                    className="rounded-2xl p-4 text-left"
                    style={{ background: c.cardBg,
                      border: "2px solid " + (theme === id ? c.primary : c.outlineVariant) }}>
                    <div className="text-lg font-extrabold">{icon} {label}</div>
                    <div className="text-xs mt-1" style={{ color: c.onSurfaceVariant }}>{desc}</div>
                    {theme === id && <div className="text-xs font-bold mt-2" style={{ color: c.primary }}>Active</div>}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-bold">Bounce Microinteractions</div>
                  <div className="text-xs" style={{ color: c.onSurfaceVariant }}>Playful hover springs & scale animations</div>
                </div>
                <button onClick={() => setBounce(!bounce)}
                  className="w-12 h-7 rounded-full flex items-center px-1 transition-all"
                  style={{ background: bounce ? c.online : c.outlineVariant }}>
                  <span className="w-5 h-5 rounded-full bg-white transition-all" style={{ marginLeft: bounce ? "20px" : "0px" }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">Typography</div>
                  <div className="text-xs" style={{ color: c.onSurfaceVariant }}>DM Sans rounded typography (Candy standard)</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: c.primary, color: "#ffffff" }}>Active</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Agent Rolodex overlay — stays over the task thread */}
      <AnimatePresence>
        {rolodexOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(8,6,12,0.72)", backdropFilter: "blur(6px)" }}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              aria-label="Dismiss rolodex"
              onClick={() => setRolodexOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-5xl"
              initial={{ y: 28, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              transition={spring}
            >
              <AgentRolodex3D variant="overlay" onClose={() => setRolodexOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
