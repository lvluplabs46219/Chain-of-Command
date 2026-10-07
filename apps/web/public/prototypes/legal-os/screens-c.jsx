/* Screens C — Records, Chronology, Court Watch, Tasks, Investigations, Counsel */

function Records() {
  const docs = [
    { name: "Charging Information.pdf", type: "Court", pages: 4, status: "indexed" },
    { name: "Police Incident Report.pdf", type: "Upload", pages: 12, status: "indexed" },
    { name: "Bodycam Request Letter.docx", type: "Draft", pages: 2, status: "draft" },
    { name: "Merchant CCTV Notes.txt", type: "Upload", pages: 1, status: "indexed" },
  ];
  return (
    <div className="view-inner">
      <PageHead eyebrow="Record Room · Draft Desk" title="Documents & Evidence Index" desc="Immutable originals · derived drafts labeled · AI cannot mark filed." actions={<Btn primary sm><Ico d={I.plus} s={14} /> Upload</Btn>} />
      <Disclaimer>Drafts are for your review only. You must authorize any court filing outside this system.</Disclaimer>
      <div style={{ display: "grid", gap: 8 }}>
        {docs.map((d) => (
          <Card key={d.name}>
            <div className="row" style={{ padding: 14 }}>
              <Ico d={I.file} s={18} style={{ color: "var(--a1)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                <div className="faint" style={{ fontSize: 11 }}>{d.type} · {d.pages} page(s)</div>
              </div>
              <Tag ok={d.status === "indexed"} gold={d.status === "draft"}>{d.status}</Tag>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Chronology() {
  const events = [
    { date: "Jan 12, 2026 · 14:22", title: "Alleged incident at retail location", cat: "Incident", flag: false },
    { date: "Jan 12, 2026 · 14:41", title: "911 CAD dispatch logged", cat: "Police", flag: false },
    { date: "Jan 12, 2026 · 15:05", title: "Vehicle search conducted", cat: "Police", flag: true, note: "No warrant; consent disputed vs bodycam timeline." },
    { date: "Jan 15, 2026", title: "Arraignment · Speedy trial clock starts", cat: "Court", flag: false },
    { date: "Aug 12, 2026", title: "Brady demand served", cat: "Discovery", flag: false },
  ];
  return (
    <div className="view-inner">
      <PageHead eyebrow="Chronology Engine" title="Case Timeline & Contradiction Audit" desc="Proposed events stay unverified until you confirm them." actions={<Btn primary sm><Ico d={I.plus} s={14} /> Log Event</Btn>} />
      <div style={{ position: "relative", paddingLeft: 28, borderLeft: "1px solid var(--line)", marginLeft: 8 }}>
        {events.map((e) => (
          <div key={e.title} style={{ position: "relative", marginBottom: 16 }}>
            <div style={{ position: "absolute", left: -34, top: 8, width: 12, height: 12, borderRadius: "50%", background: e.flag ? "var(--warn)" : "var(--a1)", border: "2px solid var(--bg)" }} />
            <Card style={{ borderColor: e.flag ? "color-mix(in oklch, var(--warn) 35%, transparent)" : undefined }}>
              <div style={{ padding: 14 }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 12 }}>{e.date}</span>
                  <Tag gold>{e.cat}</Tag>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{e.title}</div>
                {e.note && <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: "color-mix(in oklch, var(--warn) 12%, transparent)", fontSize: 12, color: "var(--warn)" }}>{e.note}</div>}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourtWatch() {
  return (
    <div className="view-inner">
      <PageHead eyebrow="Hearing Preparation" title="Court Watch & Filing Gate" desc="Human-controlled authorization only. AI never files." actions={<Tag gold>Omnibus Hearing</Tag>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <Metric label="Date & Time" value="Oct 28" sub="Arrive by 08:15 AM" />
        <Metric label="Courtroom" value="402" sub="Marion Superior · 4th Floor" />
        <Metric label="Bench" value="Hon. Chen" sub='Address as "Your Honor"' />
      </div>
      <Card>
        <CardH title="Human Authorization Gate" kicker="Boundary" right={<Ico d={I.lock} s={16} style={{ color: "var(--a1)" }} />} />
        <div style={{ padding: 16, fontSize: 13, color: "var(--ink2)", lineHeight: 1.5 }}>
          Chain of Command will never autonomously file, sign, or transmit documents to a court. All external legal actions require your explicit, per-action approval.
        </div>
        <div style={{ padding: "0 16px 16px" }}>
          <Btn primary>Authorize Document for Manual Filing</Btn>
        </div>
      </Card>
    </div>
  );
}

function TasksScreen() {
  const tasks = [
    { t: "Serve Brady Discovery Demand", due: "2026-08-26", st: "completed" },
    { t: "File Motion to Suppress", due: "2026-10-10", st: "urgent" },
    { t: "Inspect merchant video", due: "2026-10-18", st: "in_progress" },
    { t: "Subpoena shift manager", due: "2026-10-20", st: "pending" },
  ];
  return (
    <div className="view-inner">
      <PageHead eyebrow="Rules Engine" title="Tasks, Deadlines & Audit" desc="Deadlines are deterministic rule math — never model guesses." />
      <div style={{ display: "grid", gap: 8 }}>
        {tasks.map((x) => (
          <Card key={x.t}>
            <div className="row" style={{ padding: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, textDecoration: x.st === "completed" ? "line-through" : "none", opacity: x.st === "completed" ? 0.6 : 1 }}>{x.t}</div>
                <div className="mono faint" style={{ fontSize: 11 }}>Due {x.due}</div>
              </div>
              <Tag ok={x.st === "completed"} bad={x.st === "urgent"} warn={x.st === "in_progress" || x.st === "pending"}>{x.st}</Tag>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Investigations() {
  const exhibits = [
    { id: "EX-A", name: "Body-worn camera (arresting officer)", chain: "Sealed · Hash verified" },
    { id: "EX-B", name: "Merchant POS register tape", chain: "Pending inspection" },
    { id: "EX-C", name: "911 CAD audio", chain: "Received · Indexed" },
  ];
  return (
    <div className="view-inner">
      <PageHead eyebrow="Evidence Locker" title="Investigations & Chain of Custody" desc="Index exhibits and map them to statutory elements. Authenticity is for the court — not asserted as fact by AI." />
      <div style={{ display: "grid", gap: 8 }}>
        {exhibits.map((e) => (
          <Card key={e.id}>
            <div className="row" style={{ padding: 14 }}>
              <span className="mono" style={{ color: "var(--a1)", fontSize: 12, minWidth: 48 }}>{e.id}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{e.name}</div>
                <div className="faint" style={{ fontSize: 11 }}>{e.chain}</div>
              </div>
              <Ico d={I.shield} s={16} style={{ color: "var(--ok)" }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CounselDirectory() {
  const list = [
    { name: "Indiana Legal Services", type: "Pro Bono / Legal Aid", city: "Indianapolis", phone: "(317) 631-9410" },
    { name: "Marion County Public Defender", type: "Public Defender", city: "Indianapolis", phone: "(317) 327-4747" },
  ];
  return (
    <div className="view-inner">
      <PageHead eyebrow="Neutral Directory" title="Independent Attorney & Legal Aid" desc="Filter and search only. No ranking, scoring, or AI recommendation." />
      <Disclaimer>Chain of Command does not endorse or rank attorneys. You select counsel independently.</Disclaimer>
      <div style={{ display: "grid", gap: 8 }}>
        {list.map((a) => (
          <Card key={a.name}>
            <div style={{ padding: 14 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</div>
                <Tag ok>{a.type}</Tag>
              </div>
              <div className="faint" style={{ fontSize: 12, marginTop: 6 }}>{a.city} · {a.phone}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

window.Records = Records;
window.Chronology = Chronology;
window.CourtWatch = CourtWatch;
window.TasksScreen = TasksScreen;
window.Investigations = Investigations;
window.CounselDirectory = CounselDirectory;
