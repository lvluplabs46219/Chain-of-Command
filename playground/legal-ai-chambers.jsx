// Chambers — Legal AI Team Agent Playground
// Legal-themed multi-agent playground styled after the Empyrean "Candy (Joyful Pop)" scheme.
// Sidebar naming follows the case-app page layout spec (Command Center, The Docket, Chambers,
// Law Library, Investigations, Record Room, Case Timeline, Court Watch, Counsel Directory,
// Motions & Tasks). Chain of command: Head Legal AI -> Research AI -> Rights Checker -> Head.
// Deps: react, framer-motion. Single self-contained component — export default App.

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   CANDY DESIGN TOKENS (from Empyrean "Joyful Pop" scheme)
   ============================================================ */
const candy = {
  light: {
    bg: "#fff7fb", surface: "#ffefff", surfaceContainer: "#fde7ff",
    surfaceHigh: "#fae0ff", surfaceHighest: "#f8d8ff", dim: "#efd0f7",
    onSurface: "#281330", onSurfaceVariant: "#57414a",
    primary: "#af0a78", primaryAccent: "#e040a0", inversePrimary: "#ffafd5",
    secondary: "#744aa2", secondaryAccent: "#9d6ee8",
    tertiary: "#001e2d", msgIn: "#ffffff", msgInText: "#281330",
    outline: "#77566a", outlineVariant: "#ddbfca",
    online: "#34d399", error: "#ba1a1a", cardBg: "#ffffff", cardBorder: "#f8d8ff",
  },
  dark: {
    bg: "#170a1b", surface: "#22102a", surfaceContainer: "#2c1536",
    surfaceHigh: "#371a43", surfaceHighest: "#432052", dim: "#16081b",
    onSurface: "#feebff", onSurfaceVariant: "#e0bfd2",
    primary: "#ff4db8", primaryAccent: "#ff75c8", inversePrimary: "#af0a78",
    secondary: "#cda0fe", secondaryAccent: "#9d6ee8",
    tertiary: "#c5e7ff", msgIn: "#2c1536", msgInText: "#feebff",
    outline: "#8a707b", outlineVariant: "#492a3e",
    online: "#10b981", error: "#ffb4ab", cardBg: "#271330", cardBorder: "#442154",
  },
};

/* ============================================================
   COUNSEL ROSTER — Chain of Command (Empyrean-style hierarchy)
   ============================================================ */
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

/* Routing chain: user directive -> Head -> specialist -> Rights Checker -> Head -> user */
const ROUTE = ["head", "research", "rights", "head"];

const NAV = [
  { id: "command", label: "Command Center", icon: "⚖" },
  { id: "docket", label: "The Docket", icon: "📁" },
  { id: "chambers", label: "Chambers", icon: "🏛" },
  { id: "library", label: "Law Library", icon: "📚" },
  { id: "investigations", label: "Investigations", icon: "🔍" },
  { id: "records", label: "Record Room", icon: "🗄" },
  { id: "timeline", label: "Case Timeline", icon: "🕰" },
  { id: "courtwatch", label: "Court Watch", icon: "🔔" },
  { id: "directory", label: "Counsel Directory", icon: "👤" },
  { id: "tasks", label: "Motions & Tasks", icon: "✅" },
];

const CASES = [
  { id: "CF-2026-0142", client: "State v. M. Delgado", status: "Active", charges: [" Burglary 2°", "Criminal Mischief"], nextHearing: "Nov 4, 2026", color: "#af0a78" },
  { id: "CF-2026-0155", client: "State v. R. Okafor", status: "Arraignment", charges: ["DUI 1st", "Reckless Driving"], nextHearing: "Nov 12, 2026", color: "#744aa2" },
  { id: "CM-2026-0031", client: "In re: Estate of Vance", status: "Probate", charges: ["Contested Will"], nextHearing: "Dec 1, 2026", color: "#0ea5e9" },
];

const CANNED = {
  head: "Directive received. Delegating research to Research AI; chain of command logged in the Court Log.",
  research: "Reviewed 12 authorities in the stacks. Key precedent: *Miranda v. Arizona*, 384 U.S. 436 (1966) and *Edwards v. Arizona*, 451 U.S. 477 (1981). A research brief has been filed to the Brief Board.",
  rights: "Rights Audit complete. No Fourth or Fifth Amendment violations flagged in the response. Cleared for delivery.",
};

/* ============================================================
   HELPERS
   ============================================================ */
function Pill({ active, onClick, children, c }) {
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

function Card({ title, badge, children, c, className = "" }) {
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

/* ============================================================
   CHAMBERS — the agent playground (Conference Room)
   ============================================================ */
function Chambers({ c }) {
  const [activeAgent, setActiveAgent] = useState("head");
  const [input, setInput] = useState("");
  const [log, setLog] = useState([
    { agent: "head", text: "Chambers is in session. Issue a directive and watch it travel the chain of command.", mine: false },
  ]);
  const [routing, setRouting] = useState(false);
  const [routeStep, setRouteStep] = useState(-1);
  const endRef = useRef(null);
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
        setLog((l) => [...l, { agent: agentId, text: CANNED[agentId] || "Working…", mine: false }]);
        if (i === ROUTE.length - 1) { setRouting(false); setRouteStep(-1); }
      }, 1600 + i * 1400);
    });
  };

  const agent = AGENTS.find((a) => a.id === activeAgent);

  return (
    <div className="flex h-full gap-0">
      {/* Counsel Roster */}
      <div className="w-56 shrink-0 border-r overflow-y-auto p-3" style={{ borderColor: c.cardBorder, background: c.surface }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.onSurfaceVariant }}>Counsel Roster</h3>
        {AGENTS.map((a) => (
          <button key={a.id} onClick={() => setActiveAgent(a.id)}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl mb-1 text-left transition-all"
            style={{ background: activeAgent === a.id ? c.surfaceHighest : "transparent" }}>
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
          </button>
        ))}
        <button className="w-full mt-1 p-2 rounded-xl text-sm font-semibold"
          style={{ border: "1px dashed " + c.outlineVariant, color: c.onSurfaceVariant }}>+ Appoint Counsel</button>

        {/* Chain of Command visual */}
        <div className="mt-4 p-3 rounded-xl" style={{ background: c.surfaceContainer }}>
          <div className="text-xs font-bold uppercase mb-2" style={{ color: c.onSurfaceVariant }}>Chain of Command</div>
          {AGENTS.map((a, i) => (
            <div key={a.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                {i > 0 && <div className="w-0.5 h-2" style={{ background: c.outlineVariant }} />}
                <div className="w-2.5 h-2.5 rounded-full" style={{
                  background: routeStep >= 0 && ROUTE[Math.min(routeStep, ROUTE.length - 1)] === a.id ? c.primary : c.outlineVariant,
                  boxShadow: routeStep >= 0 && ROUTE[routeStep] === a.id ? "0 0 8px " + c.primaryAccent : "none",
                }} />
              </div>
              <span className="text-xs" style={{ color: c.onSurfaceVariant }}>{a.rank}. {a.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conference Room */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 p-3 border-b" style={{ borderColor: c.cardBorder, background: c.surface }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: agent.color }}>
            {agent.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="font-bold" style={{ color: c.onSurface }}>{agent.name} — Conference Room</div>
            <div className="text-xs" style={{ color: c.onSurfaceVariant }}>
              {routing ? "Directive in transit through the chain…" : agent.desc}
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Pill c={c} active={false} onClick={() => {}}>Full Bench View</Pill>
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
                <div className="max-w-[70%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap"
                  style={{
                    background: m.mine ? c.primary : c.msgIn,
                    color: m.mine ? "#ffffff" : c.msgInText,
                    borderBottomRightRadius: m.mine ? "6px" : undefined,
                    borderBottomLeftRadius: !m.mine ? "6px" : undefined,
                  }}>
                  {!m.mine && a && <div className="text-xs font-bold mb-1" style={{ color: a.color }}>{a.name}</div>}
                  {m.text}
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
          {routing && routeStep >= 0 && ROUTE[routeStep] && (
            <motion.div key={"typing-" + routeStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex gap-2 items-center text-xs" style={{ color: c.onSurfaceVariant }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: AGENTS.find((a) => a.id === ROUTE[routeStep])?.color }}>
                {AGENTS.find((a) => a.id === ROUTE[routeStep])?.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              {AGENTS.find((a) => a.id === ROUTE[routeStep])?.name} is conferring…
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-3 border-t" style={{ borderColor: c.cardBorder, background: c.surface }}>
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Issue a directive to the bench…"
              className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
              style={{ background: c.surfaceContainer, color: c.onSurface, border: "1px solid " + c.outlineVariant }} />
            <button onClick={send} disabled={routing}
              className="rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: c.primary }}>Send ⚡</button>
          </div>
          <div className="text-center text-xs mt-2" style={{ color: c.onSurfaceVariant }}>
            Notice of AI Assistance — Chambers output is not legal advice.
          </div>
        </div>
      </div>

      {/* Brief Board */}
      <div className="w-60 shrink-0 border-l p-3 overflow-y-auto" style={{ borderColor: c.cardBorder, background: c.surface }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.onSurfaceVariant }}>Brief Board</h3>
        <Card c={c} className="mb-2 p-3">
          <div className="text-xs font-semibold mb-1" style={{ color: c.onSurface }}>Active case</div>
          <div className="text-xs" style={{ color: c.onSurfaceVariant }}>State v. Delgado — CF-2026-0142</div>
        </Card>
        <Card c={c} className="mb-2 p-3">
          <div className="text-xs font-semibold mb-1" style={{ color: c.onSurface }}>Docs in context</div>
          <div className="text-xs" style={{ color: c.onSurfaceVariant }}>Charging Instrument · Officer's Report · 2 Exhibits</div>
        </Card>
        <Card c={c} className="mb-2 p-3">
          <div className="text-xs font-semibold mb-1" style={{ color: c.onSurface }}>Tools</div>
          {["Search the Stacks", "Issue Spotter", "Rights Audit"].map((t) => (
            <div key={t} className="flex items-center justify-between text-xs py-0.5" style={{ color: c.onSurfaceVariant }}>
              {t}
              <span className="w-8 h-4 rounded-full flex items-center px-0.5" style={{ background: c.online }}>
                <span className="w-3 h-3 rounded-full bg-white ml-auto" />
              </span>
            </div>
          ))}
        </Card>
        <Card c={c} className="p-3">
          <div className="text-xs font-semibold mb-1" style={{ color: c.onSurface }}>Audit log</div>
          <div className="text-xs space-y-1" style={{ color: c.onSurfaceVariant }}>
            <div>Directive #041 routed: Head → Research → Rights</div>
            <div>Research brief filed 09:42</div>
            <div>Rights Audit cleared 09:43</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   OTHER SECTIONS (themed per the page-layout PDF)
   ============================================================ */
function CommandCenter({ c, go }) {
  return (
    <div className="p-5 overflow-y-auto h-full">
      {/* File/Edit/View menubar */}
      <div className="flex gap-1 mb-4 text-sm" style={{ background: c.surfaceContainer }} >
        {[["File", "Case actions"], ["Edit", "Case info"], ["View", "Layout"], ["Team", "Manage agents"]].map(([m, hint]) => (
          <button key={m} title={hint} className="px-3 py-1 rounded-lg font-semibold"
            style={{ color: c.onSurfaceVariant }}>{m}</button>
        ))}
      </div>

      {/* Case File Banner */}
      <div className="rounded-2xl p-4 mb-4 flex items-center gap-4" style={{ background: c.primary }}>
        <div className="text-white">
          <div className="text-xs uppercase font-bold opacity-80">Case File Banner</div>
          <div className="text-xl font-extrabold">State v. M. Delgado — CF-2026-0142</div>
        </div>
        <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "rgba(255,255,255,.25)" }}>
          Docket Status: Active
        </span>
      </div>

      {/* Urgent Notice */}
      <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold" style={{ background: "#ffdad6", color: "#93000a" }}>
        ⚠ Urgent Notice — Filing Deadline in 3 days: Response to Motion due Oct 31, 2026.
      </div>

      {/* Brief Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[["Open Matters", "3"], ["Days to Hearing", "7"], ["Unfiled Records", "5"], ["Counsel Active", "4"]].map(([k, v]) => (
          <Card key={k} c={c}>
            <div className="text-2xl font-extrabold" style={{ color: c.primary }}>{v}</div>
            <div className="text-xs font-semibold" style={{ color: c.onSurfaceVariant }}>{k}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card title="Charge Sheet" c={c}>
          {[["Burglary 2°", "Class 3 Felony"], ["Criminal Mischief", "Class 1 Misd."]].map(([ch, cls]) => (
            <div key={ch} className="flex justify-between text-sm py-1" style={{ color: c.onSurface }}>
              <span>{ch}</span><span className="text-xs" style={{ color: c.onSurfaceVariant }}>{cls}</span>
            </div>
          ))}
        </Card>
        <Card title="Chronology Rail" c={c}>
          {[["Arrest", "Oct 2"], ["First Appearance", "Oct 5"], ["Arraignment", "Oct 19"], ["Motion Hearing", "Nov 4"]].map(([e, d], i) => (
            <div key={e} className="flex items-center gap-2 py-0.5">
              <div className="w-2 h-2 rounded-full" style={{ background: c.primary }} />
              <span className="text-sm" style={{ color: c.onSurface }}>{e}</span>
              <span className="ml-auto text-xs" style={{ color: c.onSurfaceVariant }}>{d}</span>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Chambers Panel" c={c}>
          <div className="flex flex-wrap gap-2">
            {AGENTS.slice(0, 4).map((a) => (
              <button key={a.id} onClick={() => go("chambers")} className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold"
                style={{ background: c.surfaceHighest, color: c.onSurface }}>
                <span className="w-2 h-2 rounded-full" style={{ background: a.online ? c.online : c.outline }} />
                {a.name}
              </button>
            ))}
          </div>
        </Card>
        <Card title="Court Log" c={c}>
          <div className="text-xs space-y-1" style={{ color: c.onSurfaceVariant }}>
            <div>🏛 Order Entered — arraignment minutes filed</div>
            <div>🤖 Counsel Update — Research AI filed a brief</div>
            <div>🗑 Record Ready — Officer's Report extracted</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Docket({ c, go }) {
  return (
    <div className="p-5 h-full overflow-y-auto">
      <div className="flex gap-2 mb-4">
        <input placeholder="Search the Docket…" className="flex-1 rounded-full px-4 py-2 text-sm outline-none"
          style={{ background: c.surfaceContainer, color: c.onSurface, border: "1px solid " + c.outlineVariant }} />
        <Pill c={c} active onClick={() => {}}>Open a Matter</Pill>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {CASES.map((cs) => (
          <Card key={cs.id} c={c}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold" style={{ color: cs.color }}>{cs.id}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: c.surfaceHighest, color: c.onSurfaceVariant }}>{cs.status}</span>
            </div>
            <div className="font-bold mb-2" style={{ color: c.onSurface }}>{cs.client}</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {cs.charges.map((ch) => (
                <span key={ch} className="text-xs px-2 py-0.5 rounded-full" style={{ background: c.surfaceContainer, color: c.onSurfaceVariant }}>{ch}</span>
              ))}
            </div>
            <div className="text-xs mb-3" style={{ color: c.onSurfaceVariant }}>Next: {cs.nextHearing}</div>
            <button onClick={() => go("chambers")} className="w-full py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: c.primary }}>
              Enter Chambers
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SimpleSection({ c, title, blocks }) {
  return (
    <div className="p-5 h-full overflow-y-auto">
      <h2 className="text-xl font-extrabold mb-4" style={{ color: c.onSurface }}>{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {blocks.map(([t, body, must]) => (
          <Card key={t} title={t} badge={must ? "MUST" : "MAY"} c={c}>
            <div className="text-sm" style={{ color: c.onSurfaceVariant }}>{body}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   APP SHELL
   ============================================================ */
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("command");
  const [clerk, setClerk] = useState(2);
  const c = candy[theme];

  const go = (id) => setPage(id);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: c.bg, color: c.onSurface, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div className="w-60 shrink-0 flex flex-col" style={{ background: c.surface }}>
        <div className="p-4 border-b" style={{ borderColor: c.cardBorder }}>
          <div className="font-extrabold text-lg flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm" style={{ background: c.primary }}>⚖</span>
            <span style={{ color: c.onSurface }}>Chambers</span>
          </div>
          <div className="text-xs mt-1" style={{ color: c.onSurfaceVariant }}>Legal AI Team · Chain of Command</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setPage(n.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-0.5 text-sm font-semibold transition-all"
              style={{
                background: page === n.id ? c.primary : "transparent",
                color: page === n.id ? "#ffffff" : c.onSurfaceVariant,
              }}>
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t flex items-center justify-between" style={{ borderColor: c.cardBorder }}>
          <span className="text-xs" style={{ color: c.onSurfaceVariant }}>Joyful Pop theme</span>
          <Pill c={c} active={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "🌙 Dark" : "☀ Light"}
          </Pill>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="h-14 shrink-0 flex items-center px-5 gap-4 border-b" style={{ borderColor: c.cardBorder, background: c.surface }}>
          <div className="font-extrabold text-lg" style={{ color: c.onSurface }}>
            {NAV.find((n) => n.id === page)?.label}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setClerk(0)} className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: c.surfaceContainer }}>
                <span style={{ color: c.onSurfaceVariant }}>🔔</span>
              </button>
              {clerk > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: c.primary }}>{clerk}</span>
              )}
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: c.secondary }}>
              AB
            </div>
          </div>
        </div>

        {/* Page body */}
        <div className="flex-1 min-h-0">
          {page === "chambers" && <Chambers c={c} />}
          {page === "command" && <CommandCenter c={c} go={go} />}
          {page === "docket" && <Docket c={c} go={go} />}
          {page === "library" && (
            <SimpleSection c={c} title="Law Library" blocks={[
              ["Search the Stacks", "Query statutes, cases, regulations, rules and forms.", true],
              ["Research Brief", "AI synthesis of retrieved authorities with citations.", true],
              ["Citation Web", "Graph view of how authorities cite each other.", false],
              ["Marked Volumes", "Your bookmarks and Case Folders of saved research.", false],
            ]} />
          )}
          {page === "investigations" && (
            <SimpleSection c={c} title="Investigations" blocks={[
              ["Case Research", "Case-scoped searches with charges pre-populated as hints.", true],
              ["Evidence Log", "Photo Evidence · Documentary · Testimonial exhibits with Chain of Custody tags.", true],
              ["Issue Spotter", "Agent that flags latent legal issues in the file.", false],
              ["Exhibit Analysis", "AI extraction summaries for each logged exhibit.", false],
            ]} />
          )}
          {page === "records" && (
            <SimpleSection c={c} title="Record Room" blocks={[
              ["Filing Table", "Charging Instrument · Officer's Report · Order of Court · Filed Motion · Working Draft · Exhibit · Court Transcript.", true],
              ["File a Record", "Upload zone with Extraction Status (OCR) and Cleared-for-Filing scan badge.", true],
              ["Filing Cabinet", "Filter by type, date filed, and Needs Review.", true],
              ["Draft Desk", "Generate working drafts with Amendment History.", false],
            ]} />
          )}
          {page === "timeline" && (
            <SimpleSection c={c} title="Case Timeline" blocks={[
              ["Chronology", "Full matter chronology from Arrest to resolution.", true],
              ["Case Events", "Arrest · Booking & Processing · First Appearance · Arraignment · Motion Hearing · Filing Deadline · Order Entered · Discovery Deadline.", true],
              ["Date Conflict Alert", "Detector flags overlapping or contradictory dates.", false],
              ["Deadline Calculator", "Compute filing deadlines from court rules.", false],
            ]} />
          )}
          {page === "courtwatch" && (
            <SimpleSection c={c} title="Court Watch" blocks={[
              ["Upcoming Appearances", "Hearing cards with dates and reminders.", true],
              ["Docket Activity", "Live feed of docket entries.", true],
              ["Deadline Engine", "Rules engine for filing deadlines.", true],
              ["Hearing Prep Kit", "Workspace the Court Prep AI assembles before each hearing.", false],
            ]} />
          )}
          {page === "directory" && (
            <SimpleSection c={c} title="Counsel Directory" blocks={[
              ["Counsel Listings", "Attorney cards — Bar Verified and Featured Listings.", true],
              ["Directory Notice", "A directory, not recommendations. Not legal advice.", true],
              ["Narrow Your Search", "Filter by practice area, jurisdiction and distance.", true],
              ["Pro Bono & Legal Aid", "Legal aid section for qualifying users.", false],
            ]} />
          )}
          {page === "tasks" && (
            <SimpleSection c={c} title="Motions & Tasks" blocks={[
              ["Motion Board", "Kanban board of Action Items across To File / Filed / Granted / Denied.", true],
              ["Deadline Notices", "Alerts on approaching filing deadlines.", true],
              ["Counsel Recommendations", "Tasks the AI team proposes for the case.", false],
              ["Court Calendar", "Calendar view of every deadline and appearance.", false],
            ]} />
          )}
        </div>
      </div>
    </div>
  );
}
