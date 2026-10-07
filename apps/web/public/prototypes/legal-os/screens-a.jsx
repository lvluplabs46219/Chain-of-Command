/* Screens A — System, Command Center, Docket */

function SystemPage({ pal }) {
  return (
    <div className="view-inner">
      <PageHead
        eyebrow="00 · Design System"
        title={<span className="grad">Chain of Command Tokens</span>}
        desc="Palette, density, and component primitives powering the Legal OS exploration."
      />
      <Disclaimer />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {(pal?.c || ["#F3C152", "#8B6CFF", "#3DD9EB"]).map((c, i) => (
          <Card key={c} style={{ padding: 16 }}>
            <div style={{ height: 48, borderRadius: 10, background: c, marginBottom: 10 }} />
            <div className="mono" style={{ fontSize: 13 }}>{c}</div>
            <div className="faint" style={{ fontSize: 12 }}>{(pal?.names || [])[i] || "Accent"}</div>
          </Card>
        ))}
      </div>
      <Card>
        <CardH title="Status capsules" kicker="Components" />
        <div style={{ padding: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag ok>ACTIVE</Tag>
          <Tag gold>PRO SE</Tag>
          <Tag warn>URGENT</Tag>
          <Tag bad>OVERDUE</Tag>
          <Btn sm>Secondary</Btn>
          <Btn sm primary>Primary action</Btn>
        </div>
      </Card>
    </div>
  );
}

function CommandCenter({ go }) {
  const metrics = [
    { label: "Charges", value: "2", sub: "+0 this week" },
    { label: "Next Hearing", value: "Oct 28", sub: "Omnibus · 09:00" },
    { label: "Records", value: "23", sub: "3 new exhibits" },
    { label: "Tasks", value: "7", sub: "2 overdue", accent: "var(--bad)" },
  ];
  const agents = [
    { name: "Lead Counsel", role: "Strategy", status: "ready" },
    { name: "Charge Explainer", role: "Elements", status: "ready" },
    { name: "Rights Checker", role: "4th Amend.", status: "busy" },
    { name: "Paralegal", role: "Discovery", status: "ready" },
    { name: "Research AI", role: "Authorities", status: "ready" },
  ];
  return (
    <div className="view-inner">
      <PageHead
        eyebrow="01 · Active Legal Workspace"
        title={<span className="serif">State of Indiana v. Marcus Vance</span>}
        desc="Marion County Superior Court · Cause No. 49D01-2601-CM-000842 · Self-Represented (Pro Se)"
        actions={
          <>
            <Tag gold>PRO SE</Tag>
            <Tag ok>ACTIVE</Tag>
            <Btn primary sm onClick={() => go && go("chambers")}><Ico d={I.spark} s={14} /> Open Chambers</Btn>
          </>
        }
      />
      <Disclaimer />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {metrics.map((m) => <Metric key={m.label} {...m} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
        <Card edge>
          <CardH title="Speedy Trial Clock" kicker="Ind. Crim. R. 4" right={<Tag warn>24 days elapsed</Tag>} />
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.04em" }}>46 <span style={{ fontSize: 16, color: "var(--ink2)", fontWeight: 400 }}>days remaining</span></div>
            <div className="faint" style={{ fontSize: 12, marginTop: 8 }}>Accrual: Jan 15, 2026 · Rule 4(B) 70-day discharge · Ind. Code § 35-36-8-1</div>
            <div style={{ marginTop: 14, height: 6, borderRadius: 99, background: "var(--glass2)", overflow: "hidden" }}>
              <div style={{ width: "34%", height: "100%", background: "linear-gradient(90deg,var(--a1),var(--a2))" }} />
            </div>
          </div>
        </Card>
        <Card>
          <CardH title="AI Legal Team" kicker="Chambers" right={<Btn sm onClick={() => go && go("chambers")}>All agents</Btn>} />
          <div style={{ padding: "8px 12px 12px" }}>
            {agents.map((a) => (
              <div key={a.name} className="row" style={{ padding: "8px 4px", borderBottom: "1px solid var(--line)" }}>
                <div className="avatar" style={{ width: 28, height: 28, borderColor: "var(--line2)", background: "var(--glass2)", color: "var(--a1)" }}>{a.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                  <div className="faint" style={{ fontSize: 11 }}>{a.role}</div>
                </div>
                <Tag ok={a.status === "ready"} warn={a.status === "busy"}>{a.status}</Tag>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <CardH title="Next actions" kicker="Priority" />
        <div style={{ padding: 12, display: "grid", gap: 8 }}>
          {[
            ["Draft Motion to Suppress", "Omnibus cutoff Oct 10", "urgent"],
            ["Review Brady demand response", "Prosecutor disclosure", "pending"],
            ["Log merchant video inspection", "Evidence locker", "pending"],
          ].map(([t, s, st]) => (
            <div key={t} className="row" style={{ padding: "10px 12px", borderRadius: 10, background: "var(--glass)", border: "1px solid var(--line)" }}>
              <Ico d={I.tasks} s={16} style={{ color: "var(--a1)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div>
                <div className="faint" style={{ fontSize: 11 }}>{s}</div>
              </div>
              <Tag bad={st === "urgent"} warn={st === "pending"}>{st}</Tag>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Docket() {
  const [tab, setTab] = useState(0);
  const charges = [
    {
      statute: "Ind. Code § 35-42-2-1",
      title: "Battery",
      level: "Misdemeanor Class A",
      max: "1 year; $5,000 fine",
      elements: [
        { name: "Knowingly or intentionally", status: "Contested" },
        { name: "Touches another in a rude, insolent, or angry manner", status: "Insufficient Evidence" },
      ],
    },
    {
      statute: "Ind. Code § 35-43-4-2",
      title: "Theft",
      level: "Misdemeanor Class A",
      max: "1 year; $5,000 fine",
      elements: [
        { name: "Knowingly or intentionally exerts unauthorized control", status: "Contested" },
        { name: "With intent to deprive the other person of any part of its value", status: "Contested" },
      ],
    },
  ];
  const c = charges[tab];
  return (
    <div className="view-inner">
      <PageHead
        eyebrow="The Docket · Case Matter Registry"
        title="State of Indiana v. Marcus Vance"
        desc="Marion County Superior Court · 49D01-2601-CM-000842"
        actions={<Btn primary sm><Ico d={I.plus} s={14} /> Open New Matter</Btn>}
      />
      <Disclaimer />
      <Card>
        <CardH title="Case Facts & Procedural Summary" kicker="Record" right={<Tag gold>Self-Represented (Pro Se)</Tag>} />
        <div style={{ padding: 16, fontSize: 13, color: "var(--ink2)", lineHeight: 1.55 }}>
          Defendant is charged with Battery and Theft arising from an incident on or about January 12, 2026, at a retail establishment in Marion County. Defendant asserts self-defense and challenges the lawfulness of the subsequent vehicle search.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, padding: "0 16px 16px" }}>
          {[
            ["Presiding Judge", "Hon. Sarah M. Chen"],
            ["Prosecuting Agency", "Marion County Prosecutor"],
            ["Representation", "Self-Represented (Pro Se)"],
            ["Speedy Trial Cutoff", "2026-03-26"],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="eyebrow">{l}</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardH title="Formal Charges & Statutory Elements" kicker="Counts" />
        <div className="row" style={{ padding: "0 16px 12px", gap: 8, flexWrap: "wrap" }}>
          {charges.map((ch, i) => (
            <button key={ch.title} className={"btn sm" + (tab === i ? " primary" : "")} onClick={() => setTab(i)}>
              Count {i + 1}: {ch.title}
            </button>
          ))}
        </div>
        <div style={{ padding: "0 16px 16px" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div className="mono" style={{ color: "var(--a1)", fontSize: 12 }}>{c.statute}</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{c.title}</div>
              <div className="faint" style={{ fontSize: 12 }}>Classification: {c.level}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="eyebrow">Max Exposure</div>
              <div style={{ color: "var(--bad)", fontWeight: 600, fontSize: 13 }}>{c.max}</div>
            </div>
          </div>
          {c.elements.map((e) => (
            <div key={e.name} style={{ padding: 12, borderRadius: 10, border: "1px solid var(--line)", background: "var(--glass)", marginBottom: 8 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{e.name}</span>
                <Tag warn={e.status !== "Refuted by Exhibit"} ok={e.status === "Refuted by Exhibit"}>{e.status}</Tag>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

window.SystemPage = SystemPage;
window.CommandCenter = CommandCenter;
window.Docket = Docket;
