/* Chain of Command — Legal OS UI primitives */
const { useState, useEffect, useMemo } = React;

/* —— Icons (inline SVG paths) —— */
const I = {
  system: "M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z",
  command: "M3 12h18M12 3v18M5 5l14 14M19 5L5 19",
  docket: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  chambers: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 10v-2a4 4 0 0 0-3-3.87",
  library: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  invest: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6",
  records: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  chrono: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  watch: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  counsel: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  tasks: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-7-1V6a4 4 0 0 1 8 0v4",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2l-4.35-4.35",
  plus: "M12 5v14M5 12h14",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  check: "M20 6L9 17l-5-5",
  chevron: "M9 18l6-6-6-6",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  spark: "M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z",
  scale: "M12 3v18M5 7l7-4 7 4M5 7l7 4 7-4M5 7v10l7 4 7-4V7",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  clock: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
};

function Ico({ d, s = 16, style }) {
  return (
    <svg className="ico" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={d} />
    </svg>
  );
}

function Tag({ children, ok, warn, bad, gold }) {
  let cls = "tag";
  if (ok) cls += " ok";
  const style = {};
  if (warn) { style.borderColor = "color-mix(in oklch, var(--warn) 40%, transparent)"; style.color = "var(--warn)"; }
  if (bad) { style.borderColor = "color-mix(in oklch, var(--bad) 40%, transparent)"; style.color = "var(--bad)"; }
  if (gold) { style.borderColor = "color-mix(in oklch, var(--a1) 40%, transparent)"; style.color = "var(--a1)"; }
  return (
    <span className={cls} style={style}>
      <span className="d" />
      {children}
    </span>
  );
}

function Btn({ children, primary, sm, onClick, style }) {
  return (
    <button className={"btn" + (primary ? " primary" : "") + (sm ? " sm" : "")} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

function Card({ children, edge, style }) {
  return <div className={"card" + (edge ? " edge" : "")} style={style}>{children}</div>;
}

function CardH({ title, kicker, right }) {
  return (
    <div className="card-h">
      {kicker && <span className="k">{kicker}</span>}
      {title && <h3>{title}</h3>}
      {right && <div className="r">{right}</div>}
    </div>
  );
}

function PageHead({ eyebrow, title, desc, actions }) {
  return (
    <div className="ph">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="serif">{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

function Disclaimer({ children }) {
  return (
    <div className="disclaimer">
      <Ico d={I.alert} s={14} style={{ color: "var(--a1)", marginTop: 1 }} />
      <span>{children || "[PREPARED FOR SELF-REPRESENTED LITIGANT — NOT LEGAL ADVICE — REQUIRES INDEPENDENT HUMAN REVIEW]"}</span>
    </div>
  );
}

function Metric({ label, value, sub, accent }) {
  return (
    <Card style={{ padding: "14px 16px" }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", color: accent || "var(--ink)" }}>{value}</div>
      {sub && <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

function useTweaks(defaults) {
  const [t, setT] = useState(() => {
    try {
      const raw = localStorage.getItem("coc.tweaks");
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    } catch { return defaults; }
  });
  const setTweak = (key, val) => {
    setT((prev) => {
      const next = typeof key === "object" ? { ...prev, ...key } : { ...prev, [key]: val };
      try { localStorage.setItem("coc.tweaks", JSON.stringify(next)); } catch {}
      return next;
    });
  };
  return [t, setTweak];
}

window.I = I;
window.Ico = Ico;
window.Tag = Tag;
window.Btn = Btn;
window.Card = Card;
window.CardH = CardH;
window.PageHead = PageHead;
window.Disclaimer = Disclaimer;
window.Metric = Metric;
window.useTweaks = useTweaks;
