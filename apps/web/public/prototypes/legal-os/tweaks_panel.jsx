/* Tweaks panel — live design controls */
function TweaksPanel({ t, setTweak }) {
  const [open, setOpen] = useState(false);
  const palettes = [
    ["#F3C152", "#8B6CFF", "#3DD9EB"],
    ["#C8FF4D", "#6B7CFF", "#2EC4B6"],
    ["#FF7A59", "#E040FB", "#40C4FF"],
    ["#E6E9F2", "#7AA2FF", "#5CDBB0"],
  ];
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", right: 16, bottom: 16, zIndex: 50,
          width: 44, height: 44, borderRadius: 12,
          background: "linear-gradient(135deg,var(--a1),var(--a2))", color: "#0a0a0f",
          display: "grid", placeItems: "center", boxShadow: "0 8px 32px rgba(0,0,0,.4)",
        }}
        title="Design tweaks"
      >
        <Ico d={I.settings} s={18} />
      </button>
    );
  }
  return (
    <div style={{
      position: "fixed", right: 16, bottom: 16, zIndex: 50, width: 280,
      background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: 14,
      padding: 14, boxShadow: "0 16px 48px rgba(0,0,0,.5)",
    }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>Design tweaks</span>
        <button onClick={() => setOpen(false)} className="faint" style={{ fontSize: 12 }}>Close</button>
      </div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>Palette</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {palettes.map((p) => (
          <button
            key={p[0]}
            onClick={() => setTweak("palette", p)}
            style={{
              display: "flex", gap: 4, padding: 6, borderRadius: 8,
              border: t.palette[0] === p[0] ? "1px solid var(--a1)" : "1px solid var(--line)",
              background: "var(--glass)",
            }}
          >
            {p.map((c) => <span key={c} style={{ width: 16, height: 16, borderRadius: 4, background: c }} />)}
          </button>
        ))}
      </div>
      <label className="eyebrow" style={{ display: "block", marginBottom: 4 }}>Glow {Number(t.glow).toFixed(1)}</label>
      <input type="range" min="0" max="1.5" step="0.1" value={t.glow}
        onChange={(e) => setTweak("glow", Number(e.target.value))}
        style={{ width: "100%", marginBottom: 10 }} />
      <label className="eyebrow" style={{ display: "block", marginBottom: 4 }}>Radius {t.radius}px</label>
      <input type="range" min="6" max="20" step="1" value={t.radius}
        onChange={(e) => setTweak("radius", Number(e.target.value))}
        style={{ width: "100%", marginBottom: 10 }} />
      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <Btn sm onClick={() => setTweak("density", t.density === "Compact" ? "Comfortable" : "Compact")}>
          Density: {t.density}
        </Btn>
        <Btn sm onClick={() => setTweak("grid", !t.grid)}>Grid: {t.grid ? "On" : "Off"}</Btn>
      </div>
      <Btn sm onClick={() => setTweak("calm", !t.calm)}>Calm mode: {t.calm ? "On" : "Off"}</Btn>
    </div>
  );
}
window.TweaksPanel = TweaksPanel;
