"use client";

// Chambers Playground — legal AI team agent playground in the Empyrean "Candy (Joyful Pop)" design scheme.
// Chain of command: Head Legal AI -> Research AI -> Rights Checker -> Head. Not legal advice.
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const candy = {
  light: {
    bg: "#fff7fb", surface: "#ffefff", surfaceContainer: "#fde7ff",
    surfaceHighest: "#f8d8ff",
    onSurface: "#281330", onSurfaceVariant: "#57414a",
    primary: "#af0a78", primaryAccent: "#e040a0",
    secondary: "#744aa2", msgIn: "#ffffff", msgInText: "#281330",
    outline: "#77566a", outlineVariant: "#ddbfca",
    online: "#34d399", cardBg: "#ffffff", cardBorder: "#f8d8ff",
  },
  dark: {
    bg: "#170a1b", surface: "#22102a", surfaceContainer: "#2c1536",
    surfaceHighest: "#432052",
    onSurface: "#feebff", onSurfaceVariant: "#e0bfd2",
    primary: "#ff4db8", primaryAccent: "#ff75c8",
    secondary: "#cda0fe", msgIn: "#2c1536", msgInText: "#feebff",
    outline: "#8a707b", outlineVariant: "#492a3e",
    online: "#10b981", cardBg: "#271330", cardBorder: "#442154",
  },
};

const AGENTS = [
  { id: "head", name: "Head Legal AI", role: "Presiding Counsel", rank: 1,
    desc: "Plans strategy. Issues directives down the chain.", color: "#af0a78", online: true },
  { id: "research", name: "Research AI", role: "Associate", rank: 2,
    desc: "Searches the stacks, drafts research briefs.", color: "#744aa2", online: true },
  { id: "paralegal", name: "Paralegal AI", role: "Clerk", rank: 3,
    desc: "Files records, organizes exhibits, cites everything.", color: "#0ea5e9", online: true },
  { id: "courtprep", name: "Court Prep AI", role: "Advocate", rank: 4,
    desc: "Prepares hearing kits and mock arguments.", color: "#f59e0b", online: true },
  { id: "rights", name: "Rights Checker", role: "Rights Audit", rank: 5,
    desc: "Audits every answer for rights violations.", color: "#10b981", online: false },
];

const ROUTE = ["head", "research", "rights", "head"];

const CANNED: Record<string, string> = {
  head: "Directive received. Delegating research to Research AI; chain of command logged in the Court Log.",
  research: "Reviewed 12 authorities in the stacks. Key precedent: Miranda v. Arizona, 384 U.S. 436 (1966) and Edwards v. Arizona, 451 U.S. 477 (1981). A research brief has been filed to the Brief Board.",
  rights: "Rights Audit complete. No Fourth or Fifth Amendment violations flagged in the response. Cleared for delivery.",
};

type Candy = (typeof candy)["light"];

function Pill({ active, onClick, children, c }: { active: boolean; onClick: () => void; children: React.ReactNode; c: Candy }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={{
        background: active ? c.primary : c.surfaceContainer,
        color: active ? "#ffffff" : c.onSurfaceVariant,
        border: "1px solid " + (active ? c.primary : c.outlineVariant),
      }}>
      {children}
    </button>
  );
}

function PCard({ title, badge, children, c, className = "" }: { title?: string; badge?: string; children: React.ReactNode; c: Candy; className?: string }) {
  return (
    <div className={"rounded-2xl p-4 " + className}
      style={{ background: c.cardBg, border: "1px solid " + c.cardBorder }}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-wide uppercase" style={{ color: c.onSurfaceVariant }}>{title}</h3>
          {badge && <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: c.surfaceHighest, color: c.onSurfaceVariant }}>{badge}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

function ConferenceRoom({ c }: { c: Candy }) {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<{ agent: string; text: string; mine: boolean }[]>([
    { agent: "head", text: "Chambers is in session. Issue a directive and watch it travel the chain of command.", mine: false },
  ]);
  const [routing, setRouting] = useState(false);
  const [routeStep, setRouteStep] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [log, routeStep]);

  const send = () => {
    const text = input.trim();
    if (!text || routing) return;
    setInput("");
    setLog((l) => [...l, { agent: "user", text, mine: true }]);
    setRouting(true);
    ROUTE.forEach((agentId, i) => {
      setTimeout(() => setRouteStep(i), 700 + i * 1400);
      setTimeout(() => {
        setLog((l) => [...l, { agent: agentId, text: CANNED[agentId] || "Working...", mine: false }]);
        if (i === ROUTE.length - 1) { setRouting(false); setRouteStep(-1); }
      }, 1600 + i * 1400);
    });
  };

  const activeRouteAgent = routeStep >= 0 ? AGENTS.find((a) => a.id === ROUTE[routeStep]) : undefined;

  return (
    <div className="flex flex-1 min-w-0 flex-col">
      <div className="flex items-center gap-3 p-3 border-b" style={{ borderColor: c.cardBorder, background: c.surface }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: c.primary }}>HL</div>
        <div>
          <div className="font-bold" style={{ color: c.onSurface }}>Conference Room — Full Bench</div>
          <div className="text-xs" style={{ color: c.onSurfaceVariant }}>
            {routing ? "Directive in transit through the chain: Head → Research → Rights → Head" : "Issue a directive and watch it travel the chain of command."}
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: c.surfaceHighest, color: c.onSurfaceVariant }}>Counsel: {AGENTS.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {log.map((m, i) => {
          const a = AGENTS.find((x) => x.id === m.agent);
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={"flex " + (m.mine ? "justify-end" : "gap-2")}>
              {!m.mine && a && (
                <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold self-end" style={{ background: a.color }}>
                  {a.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
              )}
              <div className="max-w-[70%] rounded-2xl px-4 py-2.5 text-sm"
                style={{
                  background: m.mine ? c.primary : c.msgIn,
                  color: m.mine ? "#ffffff" : c.msgInText,
                  borderBottomRightRadius: m.mine ? "6px" : undefined,
                  borderBottomLeftRadius: !m.mine ? "6px" : undefined,
                }}>
                {!m.mine && a && <div className="text-xs font-bold mb-1" style={{ color: a.color }}>{a.name}</div>}
                <div className="whitespace-pre-wrap">{m.text}</div>
                {!m.mine && a && a.id === "research" && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Miranda v. Arizona", "Edwards v. Arizona"].map((cite) => (
                      <span key={cite} className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: c.surfaceHighest, color: c.secondary }}>{cite}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {routing && activeRouteAgent && (
          <div className="flex gap-2 items-center text-xs" style={{ color: c.onSurfaceVariant }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: activeRouteAgent.color }}>
              {activeRouteAgent.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            {activeRouteAgent.name} is conferring...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t" style={{ borderColor: c.cardBorder, background: c.surface }}>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Issue a directive to the bench..."
            className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
            style={{ background: c.surfaceContainer, color: c.onSurface, border: "1px solid " + c.outlineVariant }} />
          <button onClick={send} disabled={routing}
            className="rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: c.primary }}>Send</button>
        </div>
        <div className="text-center text-xs mt-2" style={{ color: c.onSurfaceVariant }}>
          Notice of AI Assistance — Chambers output is not legal advice.
        </div>
      </div>
    </div>
  );
}

export function ChambersPlayground() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const c = candy[theme];

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: c.bg, color: c.onSurface, fontFamily: "DM Sans, system-ui, sans-serif" }}>
      <div className="w-56 shrink-0 border-r overflow-y-auto p-3 hidden md:block" style={{ borderColor: c.cardBorder, background: c.surface }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.onSurfaceVariant }}>Counsel Roster</h3>
        {AGENTS.map((a) => (
          <div key={a.id} className="flex items-center gap-2.5 p-2 rounded-xl mb-1">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: a.color }}>{a.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: a.online ? c.online : c.outline, borderColor: c.surface }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: c.onSurface }}>{a.name}</div>
              <div className="text-xs truncate" style={{ color: c.onSurfaceVariant }}>{a.role}</div>
            </div>
          </div>
        ))}
        <div className="mt-4 p-3 rounded-xl" style={{ background: c.surfaceContainer }}>
          <div className="text-xs font-bold uppercase mb-2" style={{ color: c.onSurfaceVariant }}>Chain of Command</div>
          {AGENTS.map((a, i) => (
            <div key={a.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                {i > 0 && <div className="w-0.5 h-2" style={{ background: c.outlineVariant }} />}
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: a.rank <= 3 ? c.primary : c.outlineVariant }} />
              </div>
              <span className="text-xs" style={{ color: c.onSurfaceVariant }}>{a.rank}. {a.role}</span>
            </div>
          ))}
        </div>
        <div className="p-3">
          <Pill c={c} active={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Dark mode" : "Light mode"}
          </Pill>
        </div>
      </div>

      <ConferenceRoom c={c} />

      <div className="w-60 shrink-0 border-l p-3 overflow-y-auto hidden lg:block" style={{ borderColor: c.cardBorder, background: c.surface }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.onSurfaceVariant }}>Brief Board</h3>
        <PCard c={c} className="mb-2 p-3">
          <div className="text-xs font-semibold mb-1" style={{ color: c.onSurface }}>Docs in context</div>
          <div className="text-xs" style={{ color: c.onSurfaceVariant }}>Charging Instrument · Officer Report · 2 Exhibits</div>
        </PCard>
        <PCard c={c} className="mb-2 p-3">
          <div className="text-xs font-semibold mb-1" style={{ color: c.onSurface }}>Tools</div>
          {["Search the Stacks", "Issue Spotter", "Rights Audit"].map((t) => (
            <div key={t} className="flex items-center justify-between text-xs py-0.5" style={{ color: c.onSurfaceVariant }}>
              {t}
              <span className="w-8 h-4 rounded-full flex items-center px-0.5" style={{ background: c.online }}>
                <span className="w-3 h-3 rounded-full bg-white ml-auto" />
              </span>
            </div>
          ))}
        </PCard>
        <PCard c={c} className="p-3">
          <div className="text-xs font-semibold mb-1" style={{ color: c.onSurface }}>Audit log</div>
          <div className="text-xs space-y-1" style={{ color: c.onSurfaceVariant }}>
            <div>Directive routed: Head → Research → Rights</div>
            <div>Rights Audit cleared</div>
          </div>
        </PCard>
      </div>
    </div>
  );
}
