/* Screens B — Chambers, Library */

function Chambers() {
  const agents = [
    { id: "lead", name: "Lead Counsel Coordinator", role: "Litigation Strategy", model: "gemini-2.5-flash" },
    { id: "charge", name: "Charge Explainer AI", role: "Statutory Elements", model: "gemini-2.5-flash" },
    { id: "rights", name: "Rights Checker AI", role: "Constitutional Audit", model: "gemini-2.5-flash" },
    { id: "para", name: "Paralegal AI", role: "Discovery & Brady", model: "gemini-2.5-flash" },
    { id: "research", name: "Legal Research AI", role: "Authorities & Citations", model: "gemini-2.5-flash" },
    { id: "draft", name: "Document Drafting AI", role: "Motions & Notices", model: "gemini-2.5-flash" },
  ];
  const [sel, setSel] = useState("lead");
  const [msgs, setMsgs] = useState([
    {
      who: "agent",
      name: "Lead Counsel Coordinator",
      text: "Welcome to Chambers. I have reviewed the record for State of Indiana v. Marcus Vance (49D01-2601-CM-000842). Our specialist roster is ready to assist with statutory elements, police-report audits, exhibits, and pro se motions.\n\n[PREPARED FOR SELF-REPRESENTED LITIGANT — NOT LEGAL ADVICE — REQUIRES INDEPENDENT HUMAN REVIEW]",
      cites: ["Ind. Code § 35-41-3-2", "Terry v. Ohio, 392 U.S. 1"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const active = agents.find((a) => a.id === sel) || agents[0];

  const prompts = [
    "Explain the statutory elements of my primary charge.",
    "Audit the police narrative for 4th Amendment issues.",
    "Draft a Brady discovery demand checklist.",
  ];

  const send = (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setMsgs((m) => [...m, { who: "user", name: "Self-Represented Litigant", text: t }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          who: "agent",
          name: active.name,
          text: `[PREPARED FOR SELF-REPRESENTED LITIGANT — NOT LEGAL ADVICE]\n\n### Analysis (${active.role})\n\nRegarding: "${t}"\n\n1. **Framework** — Under Indiana criminal procedure, pro se litigants must meet the same deadlines as counsel while retaining the right to fair notice.\n2. **Next step** — Correlate claims against exhibits (CCTV, receipts, CAD logs) before any motion practice.\n3. **Sources** — See cited authorities below. Independent human review is required before filing.`,
          cites: ["Ind. Crim. R. 2.5", "Local Court Rules"],
        },
      ]);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="view-inner">
      <PageHead
        eyebrow="Chambers Consultation · 6 Specialists"
        title="AI Legal Team & Specialist Roster"
        desc="Configure agents and run structured legal inquiries. AI prepares drafts only — you authorize every external action."
        actions={<Btn primary sm><Ico d={I.chambers} s={14} /> Summon Full Bench</Btn>}
      />
      <Disclaimer />
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 12, minHeight: 480 }}>
        <Card style={{ overflow: "auto" }}>
          <CardH title="Agents" kicker={`${agents.length}`} />
          <div style={{ padding: 8 }}>
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => setSel(a.id)}
                className="row"
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: 10,
                  borderRadius: 10,
                  marginBottom: 4,
                  border: sel === a.id ? "1px solid color-mix(in oklch, var(--a1) 40%, transparent)" : "1px solid transparent",
                  background: sel === a.id ? "color-mix(in oklch, var(--a1) 12%, transparent)" : "transparent",
                }}
              >
                <div className="avatar" style={{ width: 28, height: 28, borderColor: "var(--line2)", background: "var(--glass2)", color: "var(--a1)" }}>{a.name[0]}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: sel === a.id ? "var(--a1)" : "var(--ink)" }}>{a.name}</div>
                  <div className="faint" style={{ fontSize: 11 }}>{a.role}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <CardH title={active.name} kicker={active.role} right={<Tag ok>Grounded RAG</Tag>} />
          <div className="row" style={{ padding: "8px 12px", gap: 6, overflowX: "auto", borderBottom: "1px solid var(--line)" }}>
            {prompts.map((p) => (
              <Btn key={p} sm onClick={() => send(p)}>{p.slice(0, 36)}…</Btn>
            ))}
          </div>
          <div style={{ flex: 1, padding: 16, overflow: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.who === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div className="mono faint" style={{ fontSize: 11, marginBottom: 4 }}>{m.name}</div>
                <div style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  background: m.who === "user" ? "var(--glass2)" : "var(--glass)",
                  fontSize: 13,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}>{m.text}</div>
                {m.cites && (
                  <div className="row" style={{ marginTop: 6, gap: 6, flexWrap: "wrap" }}>
                    {m.cites.map((c) => <span key={c} className="tag mono" style={{ color: "var(--a1)" }}>{c}</span>)}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="faint mono" style={{ fontSize: 12 }}>Specialist synthesizing…</div>}
          </div>
          <div style={{ padding: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask a structured legal question…"
              style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", fontSize: 13 }}
            />
            <Btn primary onClick={() => send()}><Ico d={I.send} s={14} /></Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Library() {
  const [q, setQ] = useState("");
  const authorities = [
    { cite: "Ind. Code § 35-42-2-1", title: "Battery", tier: "T1 Statute", status: "verified" },
    { cite: "Ind. Code § 35-41-3-2", title: "Use of force to protect person", tier: "T1 Statute", status: "verified" },
    { cite: "Terry v. Ohio, 392 U.S. 1", title: "Stop and frisk", tier: "T1 Case", status: "verified" },
    { cite: "Brady v. Maryland, 373 U.S. 83", title: "Exculpatory evidence", tier: "T1 Case", status: "verified" },
    { cite: "Ind. Crim. R. 4", title: "Speedy trial", tier: "T1 Rule", status: "verified" },
  ].filter((a) => !q || a.cite.toLowerCase().includes(q.toLowerCase()) || a.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="view-inner">
      <PageHead
        eyebrow="Law Library · RAG Document Intelligence"
        title="Authorities & Research Workbench"
        desc="Search statutes, rules, and case law with provenance. Unverified sources never ground legal claims."
      />
      <Disclaimer>Every legal claim must map to a resolvable citation. Fabricated authorities are blocked.</Disclaimer>
      <div className="row" style={{ gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Ico d={I.search} s={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink3)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search citation, statute, or topic…"
            style={{ width: "100%", padding: "10px 12px 10px 36px", background: "var(--bg3)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13 }}
          />
        </div>
        <Btn primary sm>Search</Btn>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {authorities.map((a) => (
          <Card key={a.cite}>
            <div className="row" style={{ padding: 14, justifyContent: "space-between" }}>
              <div>
                <div className="mono" style={{ color: "var(--a1)", fontSize: 12 }}>{a.cite}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{a.title}</div>
                <div className="faint" style={{ fontSize: 11 }}>{a.tier}</div>
              </div>
              <Tag ok>{a.status}</Tag>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

window.Chambers = Chambers;
window.Library = Library;
