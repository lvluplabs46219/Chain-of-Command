import { useState, useEffect, type ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  FolderOpen,
  Gavel,
  GraduationCap,
  HelpCircle,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UsersRound,
  X,
  UserCheck,
} from "lucide-react";
import { AttorneyDirectory } from "./AttorneyDirectory";
import { RagCitationViewer } from "./RagCitationViewer";
import { CaseTimeline } from "./CaseTimeline";
import { LawLibraryExplorer } from "./LawLibraryExplorer";
import { AcquitAcademy } from "./AcquitAcademy";
import { AILab } from "./AILab";
import { SovereignCylinder } from "./SovereignCylinder";
import { FilingCenter } from "./FilingCenter";
import { MOCK_RAG_MESSAGES, type LegalAuthority } from "./legalData";

type IconType = typeof Scale;

const navItems: { label: string; icon: IconType }[] = [
  { label: "Case overview", icon: BriefcaseBusiness },
  { label: "AI Lab", icon: Sparkles },
  { label: "Find an attorney", icon: UserCheck },
  { label: "Timeline", icon: FolderOpen },
  { label: "Documents", icon: FileText },
  { label: "Filing center", icon: BookOpen },
  { label: "Acquit Academy", icon: GraduationCap },
];

function Pill({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "glass" | "sand";
}) {
  const tones = {
    gold: "bg-[#D4AF37]/15 text-[#D4AF37] ring-[#D4AF37]/20",
    glass: "bg-white/10 text-white/60 ring-white/10",
    sand: "bg-[#D4AF37]/10 text-[#EFE6D0] ring-[#D4AF37]/10",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-widest ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  action,
}: {
  icon: IconType;
  eyebrow: string;
  title: string;
  action?: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-[10px] tracking-widest text-[#D4AF37]">
          <Icon size={14} className="opacity-80" />
          {eyebrow.toUpperCase()}
        </div>
        <h2 className="mt-1 font-serif text-[24px] text-white">
          {title}
        </h2>
      </div>
      {action && (
        <button className="text-[11px] font-bold tracking-widest text-[#D4AF37] hover:text-white transition">
          {action.toUpperCase()}
        </button>
      )}
    </div>
  );
}

export function CaseWorkspace() {
  const [activeNav, setActiveNav] = useState("Case overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [agentOpen, setAgentOpen] = useState<string | null>("Paralegal AI");
  const [plainEnglish, setPlainEnglish] = useState(true);
  const [showNotice, setShowNotice] = useState(true);
  const [selectedLawAuth, setSelectedLawAuth] = useState<LegalAuthority | undefined>();
  const [matters, setMatters] = useState<any[]>([]);


  useEffect(() => {
    fetch('/api/matters')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data?.success && Array.isArray(data.matters)) {
          setMatters(data.matters);
        }
      })
      .catch(err => {
        console.warn("Could not fetch matters:", err);
      });
  }, []);

  const agents = [
    {
      name: "Head Legal AI",
      role: "Strategy & overview",
      initials: "HL",
      color: "bg-[#D4AF37] text-black",
      note: "I have prepared 3 questions to ask your prospective attorney.",
    },
    {
      name: "Paralegal AI",
      role: "Documents & timeline",
      initials: "PL",
      color: "bg-white/10 border border-white/20 text-white",
      note: "Extracted 4 deadlines from the new police report.",
    },
    {
      name: "Research AI",
      role: "Authorities & statutes",
      initials: "RA",
      color: "bg-white/10 border border-white/20 text-white",
      note: "Found 2 binding precedents regarding suppression.",
    },
  ];

  // If the active view is Sovereign Cylinder, we mount it directly, filling the screen.
  if (activeNav === "Documents" || activeTab === "Documents") {
    return (
      <div className="flex h-screen w-full flex-col bg-[#0A0A0A] font-mono text-white">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-8 relative z-20">
          <div className="flex items-center gap-3">
             <button
              onClick={() => setActiveTab("Overview")}
              className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition"
            >
              <ArrowRight size={14} className="rotate-180" /> Back to Dashboard
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-[#D4AF37] font-serif tracking-widest">AQUIT.AI</span>
          </div>
        </header>
        <div className="flex-1 overflow-hidden relative">
           <SovereignCylinder />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] pt-[env(safe-area-inset-top)] w-full flex-col bg-[#0A0A0A] font-mono text-white selection:bg-[#D4AF37]/30 md:flex-row">
      {/* Mobile nav overlay */}
      {mobileNav && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[#0A0A0A]/95 backdrop-blur-md transition-transform md:static md:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#D4AF37] text-[14px] font-black text-black shadow-[0_0_20px_rgba(212,175,55,0.35)]">
              A
            </div>
            <div>
              <p className="text-[12px] font-bold tracking-[0.18em] text-[#D4AF37]">
                ACQUIT.AI
              </p>
              <p className="text-[10px] tracking-widest text-white/40">
                SOVEREIGN OS
              </p>
            </div>
          </div>
          <button
            className="ml-auto text-white/40 sm:hidden"
            onClick={() => setMobileNav(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-6 px-2">
            <p className="text-[9px] font-bold tracking-widest text-white/30">
              WORKSPACE
            </p>
          </div>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveNav(item.label);
                setMobileNav(false);
              }}
              className={`mb-1.5 flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-xs tracking-widest transition ${
                activeNav === item.label
                  ? "bg-white/10 text-white ring-1 ring-white/10"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon
                size={16}
                className={activeNav === item.label ? "text-[#D4AF37]" : ""}
              />
              {item.label}
            </button>
          ))}

          <div className="mb-3 mt-8 px-2">
            <p className="text-[9px] font-bold tracking-widest text-white/30">
              INTELLIGENCE
            </p>
          </div>
          <button
            onClick={() => {
              setActiveNav("AI legal team");
              setMobileNav(false);
            }}
            className="mb-1.5 flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-xs tracking-widest text-white/60 hover:bg-white/5 hover:text-white transition"
          >
            <UsersRound size={16} /> AI legal team
          </button>
          <button
            onClick={() => {
              setActiveNav("Law library");
              setMobileNav(false);
            }}
            className="mb-1.5 flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-xs tracking-widest text-white/60 hover:bg-white/5 hover:text-white transition"
          >
            <BookOpen size={16} /> Law library
          </button>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="rounded-[14px] bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#D4AF37]">
              <ShieldCheck size={14} /> ENCLAVE SECURED
            </div>
            <p className="text-[10px] leading-[1.6] text-white/50">
              Your case data is stored in a private vault. No third-party training.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white ring-1 ring-white/20">
              AT
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-white">
                Alex Thompson
              </p>
              <p className="text-[10px] text-white/50">Pro Se Litigant</p>
            </div>
            <MoreHorizontal size={16} className="ml-auto text-white/30" />
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="min-w-0 flex-1 flex flex-col h-full bg-[#0A0A0A] relative z-0">
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-5 md:px-8 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNav(true)}
              className="text-white/60 md:hidden hover:text-white"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/40">
                <span>CASES</span>
                <ChevronRight size={12} />
                <span className="text-white">{activeNav.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-widest text-white/50 backdrop-blur-md">
              <span className="text-[#D4AF37]">DOCKET:</span> {matters[0]?.caseNumber || "IN-MAR-24-0187"}
            </div>
            <button               onClick={() => alert("Global search is coming soon!")}              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold tracking-widest text-white/70 hover:bg-white/10 hover:text-white transition sm:flex"            >              <Search size={14} /> SEARCH            </button>
            <button               onClick={() => alert("No new notifications")}              className="relative rounded-full p-2 text-white/60 hover:bg-white/10 transition"            >              <Bell size={18} />              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto min-h-[100dvh] pb-32">
          <div className="mx-auto max-w-[1260px] px-5 pb-32 pt-8 sm:px-8">
            

            {/* Sub-routing */}
            {activeNav === "AI Lab" ? (
              <AILab />
            ) : activeNav === "Find an attorney" ? (
              <AttorneyDirectory
                initialPracticeFilter="Criminal Defense"
                initialJurisdictionFilter="Indiana"
              />
            ) : activeNav === "Acquit Academy" ? (
              <AcquitAcademy />
            ) : activeNav === "Filing center" ? (
              <FilingCenter />
            ) : activeNav === "Timeline" || activeTab === "Timeline" ? (
              <div>
                <div className="mb-8 flex gap-4 border-b border-white/10">
                  {["Overview", "Timeline", "Documents", "Court activity"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        if (tab === "Overview") setActiveNav("Case overview");
                        if (tab === "Documents") setActiveNav("Documents");
                      }}
                      className={`relative px-2 pb-4 text-[11px] font-bold tracking-widest transition ${
                        activeTab === tab || (activeNav === "Timeline" && tab === "Timeline")
                          ? "text-[#D4AF37]"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {tab.toUpperCase()}
                      {(activeTab === tab || (activeNav === "Timeline" && tab === "Timeline")) && (
                        <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                      )}
                    </button>
                  ))}
                </div>
                <CaseTimeline
                  onOpenFilingCenter={() => setActiveNav("Filing center")}
                />
              </div>
            ) : activeNav === "Law library" ? (
              <LawLibraryExplorer
                initialSelectedAuthority={selectedLawAuth}
                onCiteAuthority={(auth) => {
                  setActiveNav("Case overview");
                  setActiveTab("Overview");
                }}
              />
            ) : activeNav === "Case overview" && activeTab === "Overview" ? (
              <>
                <div className="mb-8 flex gap-4 border-b border-white/10">
                  {["Overview", "Timeline", "Documents", "Court activity"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        if (tab === "Timeline") setActiveNav("Timeline");
                        if (tab === "Documents") setActiveNav("Documents");
                      }}
                      className={`relative px-2 pb-4 text-[11px] font-bold tracking-widest transition ${
                        activeTab === tab
                          ? "text-[#D4AF37]"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {tab.toUpperCase()}
                      {activeTab === tab && (
                        <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    {/* Status Card */}
                    <section className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl shadow-2xl">
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D4AF37]"></span>
                            </span>
                            <span className="text-[10px] font-bold tracking-widest text-[#D4AF37]">
                              UPCOMING DEADLINE
                            </span>
                          </div>
                          <h2 className="font-serif text-[28px] text-white">
                            Pretrial Conference
                          </h2>
                          <p className="mt-2 text-xs text-white/50 tracking-wide">
                            Thursday, Oct 12 · 9:00 AM EST
                          </p>
                        </div>
                        <div className="rounded-[12px] border border-white/10 bg-black/40 p-3 text-center">
                          <p className="text-[20px] font-light text-white">14</p>
                          <p className="text-[9px] font-bold tracking-widest text-white/40">
                            DAYS
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-5">                        <button                           onClick={() => alert("Agenda review coming soon")}                          className="rounded-full bg-white px-5 py-2.5 text-[10px] font-bold tracking-widest text-black hover:bg-[#EFE6D0] transition"                        >                          REVIEW AGENDA                        </button>                        <button                           onClick={() => alert("Question generation coming soon")}                          className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-[10px] font-bold tracking-widest text-white hover:bg-white/10 transition"                        >                          GENERATE QUESTIONS                        </button>                      </div>
                    </section>

                    {/* AI Assessment */}
                    <section className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
                      <SectionHeading
                        icon={Sparkles}
                        eyebrow="Intelligence"
                        title="Acquit Assessment"
                      />
                      <div className="space-y-4">
                        <div className="rounded-[14px] border border-white/10 bg-black/40 p-4">
                          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-widest text-[#D4AF37]">
                            <Scale size={14} /> PROCEDURAL POSTURE
                          </div>
                          <p className="text-xs leading-[1.6] text-white/70">
                            Discovery phase is active. The prosecution has produced the police report, but body camera footage is still pending. We recommend filing a Motion to Compel if not received within 7 days.
                          </p>
                        </div>
                        <div className="rounded-[14px] border border-white/10 bg-black/40 p-4">
                          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-widest text-[#D4AF37]">
                            <BookOpen size={14} /> STATUTORY EXPOSURE
                          </div>
                          <p className="text-xs leading-[1.6] text-white/70">                            You are charged under IC 35-43-2-1. This is a Level 6 felony carrying a potential sentence of 6 months to 2.5 years.                          </p>                          <button                             onClick={() => alert("Statute details coming soon")}                            className="mt-3 text-[10px] font-bold tracking-widest text-[#D4AF37] hover:text-white transition"                          >                            VIEW STATUTE DETAILS →                          </button>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Legal Team */}
                    <section className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold tracking-widest text-white/40 mb-1">
                            COORDINATED
                          </div>
                          <h2 className="font-serif text-[22px] text-white">
                            Your Legal Team
                          </h2>
                        </div>
                        <button                           onClick={() => alert("Add agent coming soon")}                          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"                        >                          <Plus size={14} />                        </button>                      </div>                                            <div className="space-y-3">                        {agents.map((agent) => (                          <div                            key={agent.name}                            className="overflow-hidden rounded-[14px] border border-white/10 bg-black/40"                          >                            <button                              onClick={() =>                                setAgentOpen(agentOpen === agent.name ? null : agent.name)                              }                              className="flex w-full items-center gap-3 p-3 text-left hover:bg-white/5 transition"                            >                              <div                                className={`flex h-9 w-9 items-center justify-center rounded-[10px] text-[11px] font-bold ${agent.color}`}                              >                                {agent.initials}                              </div>                              <div className="min-w-0 flex-1">                                <p className="text-xs font-bold text-white">{agent.name}</p>                                <p className="mt-0.5 text-[10px] text-white/50">{agent.role}</p>                              </div>                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />                              {agentOpen === agent.name ? (                                <ChevronDown size={14} className="text-white/40" />                              ) : (                                <ChevronRight size={14} className="text-white/40" />                              )}                            </button>                            {agentOpen === agent.name && (                              <div className="border-t border-white/10 px-3 pb-3 pt-3 text-[11px] leading-[1.5] text-white/70">                                <span className="mr-2 font-bold text-[#D4AF37]">LATEST:</span>                                {agent.note}                                <button                                   onClick={() => alert(`Opening conversation with ${agent.name}`)}                                  className="mt-3 flex items-center gap-1 text-[10px] font-bold tracking-widest text-white hover:text-[#D4AF37] transition"                                >                                  OPEN CONVERSATION <ArrowRight size={12} />                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setActiveNav("Find an attorney")}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 py-3 text-[10px] font-bold tracking-widest text-white hover:bg-white/10 transition"
                      >
                        <UserCheck size={14} /> FIND ATTORNEY
                      </button>
                    </section>

                    {/* Evidence */}
                    <section className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
                      <SectionHeading
                        icon={FolderOpen}
                        eyebrow="Materials"
                        title="Evidence"
                        action="Open Vault"
                      />
                      <div className="mb-5 flex items-end justify-between">
                        <div>
                          <p className="font-serif text-[32px] text-white leading-none">82<span className="text-[20px] text-white/40">%</span></p>
                          <p className="mt-1 text-[10px] tracking-widest text-white/40">ORGANIZED</p>
                        </div>
                        <div className="h-1 w-[58%] overflow-hidden rounded-full bg-white/10 mb-2">
                          <div className="h-full w-[82%] rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 rounded-[12px] bg-black/40 p-3 border border-white/5">
                          <FileText size={16} className="text-[#D4AF37]" />
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-white">Police report</p>
                            <p className="text-[10px] text-white/40 mt-0.5">May 03 · 8 pages</p>
                          </div>
                          <Check size={14} className="text-emerald-400" />
                        </div>
                        <div className="flex items-center gap-3 rounded-[12px] bg-black/40 p-3 border border-white/5">
                          <Upload size={16} className="text-white/40" />
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-white">Body cam footage</p>
                            <p className="text-[10px] text-[#D4AF37] mt-0.5">Needs description</p>
                          </div>
                          <Pill tone="glass">Review</Pill>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => { setActiveTab("Documents"); setActiveNav("Documents"); }}
                        className="mt-4 flex items-center gap-1 text-[10px] font-bold tracking-widest text-[#D4AF37] hover:text-white transition"
                      >
                        SEE ALL 12 ITEMS <ArrowRight size={13} />
                      </button>
                    </section>
                  </div>
                </div>
              </>
            ) : null}

            {/* Footer Control Info */}
            {activeNav !== "Documents" && activeTab !== "Documents" && (
              <div className="mt-8 rounded-[16px] border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3 text-[11px] leading-[1.5] text-white/50">
                    <CircleHelp size={16} className="mt-px shrink-0 text-white/30" />
                    <span>
                      Acquit provides intelligence and organization. It does not provide legal advice. Nothing is filed or sent without your explicit review and approval.
                    </span>
                  </div>
                  <label className="flex shrink-0 items-center gap-3 text-[10px] font-bold tracking-widest text-white/70 cursor-pointer">
                    <span>PLAIN ENGLISH</span>
                    <button
                      onClick={() => setPlainEnglish(!plainEnglish)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        plainEnglish ? "bg-[#D4AF37]" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-black shadow-sm transition-transform ${
                          plainEnglish ? "translate-x-4.5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
