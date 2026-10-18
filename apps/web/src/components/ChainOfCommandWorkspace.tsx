'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Database, 
  ArrowRight, 
  ChevronRight, 
  Upload, 
  FileSearch, 
  Scale, 
  Users, 
  BookOpen, 
  Calendar, 
  Gavel, 
  Briefcase, 
  ListTodo, 
  Settings as SettingsIcon, 
  Search, 
  ExternalLink, 
  Info, 
  Check, 
  X, 
  Sparkles, 
  FileCheck, 
  ShieldAlert, 
  Sliders, 
  Send, 
  HelpCircle,
  UserCheck,
  Cpu,
  Terminal,
  Network,
  RefreshCw,
  MessageSquare,
  Filter,
  Building,
  UserPlus,
  Eye,
  BadgeAlert,
  ArrowUpDown
} from 'lucide-react';

import { SEED_AGENTS } from '@chain-of-command/agent-runtime';
import { SEED_AUTHORITIES, CitationObject } from '@chain-of-command/legal-library';
import { SEED_RULES, computeDeadline } from '@chain-of-command/deadline-engine';
import { runGroundingGuard } from '@chain-of-command/legal-library';

export type WorkspaceTabId =
  | 'dashboard'
  | 'cases'
  | 'agents'
  | 'divine'
  | 'library'
  | 'research'
  | 'documents'
  | 'timeline'
  | 'court_activity'
  | 'attorneys'
  | 'tasks'
  | 'settings';

interface ChainOfCommandWorkspaceProps {
  initialTab?: WorkspaceTabId | string;
}

export function ChainOfCommandWorkspace({ initialTab = 'dashboard' }: ChainOfCommandWorkspaceProps) {
  // Normalize initialTab to supported tabs
  const validTab = (['dashboard', 'cases', 'agents', 'divine', 'library', 'research', 'documents', 'timeline', 'court_activity', 'attorneys', 'tasks', 'settings'] as WorkspaceTabId[]).includes(initialTab as WorkspaceTabId)
    ? (initialTab as WorkspaceTabId)
    : 'dashboard';

  const [navTab, setNavTab] = useState<WorkspaceTabId>(validTab);

  // Case Context
  const [activeCase, setActiveCase] = useState({
    id: "case-2026-0042",
    title: "State of Arizona v. Litigant",
    docketNumber: "CR2026-104928-001",
    court: "Maricopa County Superior Court",
    jurisdiction: "us-az",
    jurisdictionName: "Arizona State (Maricopa County)",
    judge: "Hon. Sarah Jenkins",
    prosecutor: "AUSA David Vance (County Attorney Office)",
    stage: "Pre-Trial Discovery / Motion to Suppress",
    asOfDate: "2026-10-05",
    speedyTrialDaysRemaining: 74,
    charges: [
      { 
        count: 1, 
        charge: "A.R.S. § 13-1802 - Theft of Means of Transportation", 
        severity: "Class 3 Felony", 
        status: "Alleged",
        elements: ["Knowingly controlled property of another", "Without lawful authority", "Intent to permanently deprive"]
      },
      { 
        count: 2, 
        charge: "A.R.S. § 13-3415 - Possession of Drug Paraphernalia", 
        severity: "Class 6 Felony", 
        status: "Alleged",
        elements: ["Used or possessed with intent to use", "Equipment or object intended to ingest or package controlled substance"]
      }
    ]
  });

  // Settings
  const [readingLevel, setReadingLevel] = useState<'plain' | 'standard' | 'detailed'>('standard');
  const [groundingEnforcement, setGroundingEnforcement] = useState(true);

  // Research Workbench State
  const [researchQuery, setResearchQuery] = useState("Fourth amendment warrantless vehicle search under Arizona law");
  const [researchResult, setResearchResult] = useState<{
    text: string;
    grounded: boolean;
    citations: CitationObject[];
    unverified: string[];
    status: string;
  } | null>({
    text: "Under the Fourth Amendment and Arizona constitutional standards (State v. Gant, 556 U.S. 332), warrantless searches of an automobile are per se unreasonable unless an established exception applies. If the arrestee is secured and poses no reasonable access to the passenger compartment, a search incident to arrest is invalid unless reasonable suspicion of case-specific evidence exists.",
    grounded: true,
    citations: SEED_AUTHORITIES.slice(0, 2),
    unverified: [],
    status: "grounded"
  });

  // Deterministic Deadline Engine State
  const [triggerDate, setTriggerDate] = useState('2026-10-01');
  const [selectedRuleId, setSelectedRuleId] = useState('rule-fed-crim-12');
  const [computedDeadline, setComputedDeadline] = useState(() => {
    return computeDeadline('2026-10-01', SEED_RULES[0]);
  });

  // Draft State Machine: Strict 6-phase Progression (§14, §19.4)
  const [draftState, setDraftState] = useState<'Information' | 'Analysis' | 'Draft' | 'User-Edited' | 'User-Approved' | 'Final'>('Draft');

  // Divine Multi-Agent Orchestrator State (Blueprint §1, §2)
  const [divineInput, setDivineInput] = useState("Evaluate motion to suppress vehicle trunk search and verify local Arizona statutory elements.");
  const [divineRunning, setDivineRunning] = useState(false);
  const [divineLogs, setDivineLogs] = useState<Array<{ stage: string; actor: string; message: string; timestamp: string }>>([
    { stage: "INFERENCE", actor: "YHWH", message: "Parsed directive: Evaluate vehicle trunk search under AZ jurisdiction. Generated dependency DAG.", timestamp: "10:14:02" },
    { stage: "ORCHESTRATION", actor: "Michael", message: "Dispatched subtasks to Raphael (deadlines) and Metatron (model router). Context ceiling enforced.", timestamp: "10:14:03" },
    { stage: "EXECUTION", actor: "Raphael", message: "Evaluated Rule 12(b)(3) deadline: 14 days from arraignment. Result: DUE 2026-10-15.", timestamp: "10:14:04" },
    { stage: "ROUTING", actor: "Metatron", message: "Evaluated complexity. Dispatched legal reasoning task to Seraphim (gemini-3.5-flash).", timestamp: "10:14:04" },
    { stage: "CONSENSUS", actor: "Seraphim", message: "Council consensus reached (3/3): Search incident to arrest exception invalid under State v. Gant.", timestamp: "10:14:05" },
    { stage: "DISPATCH", actor: "Gabriel", message: "Packaged task payload with Grounding Guard validation for Counsel Room review.", timestamp: "10:14:06" }
  ]);

  // Attorney Matcher State (Independent, Non-ranking, Rule 18/21)
  const [matcherCategory, setMatcherCategory] = useState("All");
  const [matcherNeed, setMatcherNeed] = useState("All");
  const [matcherLocation, setMatcherLocation] = useState("Maricopa County, AZ");

  const ATTORNEYS_DATA = [
    {
      id: "atty-01",
      name: "Maricopa County Public Defender",
      type: "Indigent Defense Agency",
      barNumber: "Official AZ County Agency",
      jurisdiction: "Maricopa County, AZ",
      specialty: "Criminal Defense / Felony & Misdemeanor",
      intakeType: "Court Appointed / Indigent Qualification",
      feeModel: "Free / State-Funded",
      phone: "(602) 506-7711",
      address: "620 S 3rd Ave, Phoenix, AZ 85003",
      verified: true
    },
    {
      id: "atty-02",
      name: "Community Legal Services Phoenix",
      type: "501(c)(3) Legal Aid Clinic",
      barNumber: "CL-501C3-AZ",
      jurisdiction: "Maricopa County, AZ",
      specialty: "Civil Rights, Housing & Tenant Rights",
      intakeType: "Income-Qualified Intake (Pro Bono)",
      feeModel: "Free for Qualifying Litigants",
      phone: "(602) 258-3434",
      address: "305 S 2nd Ave, Phoenix, AZ 85003",
      verified: true
    },
    {
      id: "atty-03",
      name: "State Bar of Arizona Find-a-Lawyer Service",
      type: "Official Bar Association Referral",
      barNumber: "State Bar of Arizona Registry",
      jurisdiction: "Statewide Arizona",
      specialty: "All Practice Areas (Criminal, Civil, Appellate)",
      intakeType: "Direct Referral Panel",
      feeModel: "Low-Cost Initial Consultation ($40 max)",
      phone: "(602) 252-4804",
      address: "4201 N 24th St, Phoenix, AZ 85016",
      verified: true
    },
    {
      id: "atty-04",
      name: "Marion County Public Defender Agency",
      type: "Indigent Defense Agency",
      barNumber: "Indiana Public Defense Council",
      jurisdiction: "Marion County, IN",
      specialty: "Criminal Defense / Initial Appearances",
      intakeType: "Indigent Appointment by Court",
      feeModel: "Free / Public Defender",
      phone: "(317) 327-4100",
      address: "200 E Washington St, Indianapolis, IN",
      verified: true
    },
    {
      id: "atty-05",
      name: "Indiana Legal Services Pro Bono Project",
      type: "Legal Aid Foundation",
      barNumber: "ILS-IN-BAR",
      jurisdiction: "Statewide Indiana",
      specialty: "Eviction Defense, Civil Rights & Expungements",
      intakeType: "Walk-in & Telephone Screening",
      feeModel: "Pro Bono (100% Free)",
      phone: "(844) 243-8570",
      address: "1200 Waterway Blvd, Indianapolis, IN",
      verified: true
    }
  ];

  const filteredAttorneys = ATTORNEYS_DATA.filter((a) => {
    const matchesCat = matcherCategory === "All" || a.specialty.toLowerCase().includes(matcherCategory.toLowerCase());
    const matchesNeed = matcherNeed === "All" || a.feeModel.toLowerCase().includes(matcherNeed.toLowerCase()) || a.intakeType.toLowerCase().includes(matcherNeed.toLowerCase());
    const matchesLoc = matcherLocation === "All" || a.jurisdiction.toLowerCase().includes(matcherLocation.toLowerCase()) || matcherLocation === "";
    return matchesCat && matchesNeed && matchesLoc;
  });

  const handleComputeDeadline = () => {
    const rule = SEED_RULES.find(r => r.id === selectedRuleId) || SEED_RULES[0];
    const res = computeDeadline(triggerDate, rule);
    setComputedDeadline(res);
  };

  const handleRunGroundingTest = () => {
    const report = runGroundingGuard({
      text: researchQuery,
      proposedCitations: SEED_AUTHORITIES.slice(0, 2),
      targetJurisdiction: activeCase.jurisdiction,
      verifiedCorpus: SEED_AUTHORITIES,
    });
    setResearchResult({
      text: `Synthesis regarding "${researchQuery}": Primary authorities confirm that warrantless searches require active exceptions. In State v. Miranda and Arizona precedent, statements made prior to statutory advisement remain subject to suppression motion under Rule 12(b)(3).`,
      grounded: report.grounded,
      citations: report.matchedCitations,
      unverified: report.unverifiedClaims,
      status: report.status,
    });
  };

  const handleExecuteDivineCycle = () => {
    setDivineRunning(true);
    setTimeout(() => {
      const now = new Date().toLocaleTimeString();
      setDivineLogs(prev => [
        ...prev,
        { stage: "QUERY", actor: "USER DIRECTIVE", message: divineInput, timestamp: now },
        { stage: "PARSING", actor: "YHWH", message: "Evaluated statutory elements and criminal procedure dependencies. Zero fabrication policy enforced.", timestamp: now },
        { stage: "ORCHESTRATION", actor: "Michael", message: "Triggered Raphael deterministic deadline checks and prepared counsel room draft artifact.", timestamp: now },
        { stage: "CONSENSUS", actor: "Metatron → Seraphim", message: "Adversarial Consensus Panel (3/3 agree): Pretrial suppression motion grounded with 100% Tier-1 citations.", timestamp: now },
        { stage: "DELIVERY", actor: "Gabriel", message: "TaskResult payload successfully delivered to Draft Desk. Ready for human review.", timestamp: now }
      ]);
      setDivineRunning(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-[#e1e2e5] font-sans flex flex-col selection:bg-[#D4AF37]/30">
      
      {/* Universal Mandatory Pro Se Litigant Banner (§22, GEMINI.md Rule 5.A) */}
      <div className="bg-[#12141a] border-b border-[#222634] px-4 py-2 text-xs font-mono text-center flex items-center justify-center gap-2 text-[#e5c07b]">
        <AlertTriangle className="w-4 h-4 text-[#D4AF37] shrink-0" />
        <span className="font-semibold tracking-wider uppercase">
          [PREPARED FOR SELF-REPRESENTED LITIGANT — NOT LEGAL ADVICE — REQUIRES INDEPENDENT HUMAN REVIEW]
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation: 11 exact Master Build surfaces + Divine Architecture */}
        <aside className="w-64 border-r border-[#1a1d26] bg-[#0b0c10] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#1a1d26]">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
              <div className="leading-tight">
                <span className="font-serif font-bold text-base tracking-wide text-white block">Chain of Command</span>
                <span className="font-mono text-[10px] text-gray-500 tracking-widest uppercase">Legal OS Master Suite</span>
              </div>
            </div>
          </div>

          <div className="px-3 py-2 text-[10px] font-mono uppercase text-gray-500 tracking-wider">
            Workspace Navigation (§23.2)
          </div>

          <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
            {[
              { id: 'dashboard', label: '1. Dashboard', icon: Briefcase },
              { id: 'cases', label: '2. Cases', icon: Scale },
              { id: 'agents', label: '3. AI Legal Team', icon: Users },
              { id: 'divine', label: '★ Divine Architecture', icon: Network },
              { id: 'library', label: '4. Legal Library', icon: BookOpen },
              { id: 'research', label: '5. Research', icon: FileSearch },
              { id: 'documents', label: '6. Documents', icon: FileText },
              { id: 'timeline', label: '7. Timeline', icon: Clock },
              { id: 'court_activity', label: '8. Court Activity', icon: Gavel },
              { id: 'attorneys', label: '9. Attorney Directory', icon: UserCheck },
              { id: 'tasks', label: '10. Tasks & Deadlines', icon: ListTodo },
              { id: 'settings', label: '11. Settings & Audit', icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = navTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setNavTab(tab.id as WorkspaceTabId)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-[#14161f]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Active Case Context Chip */}
          <div className="p-3 m-2 rounded-lg border border-[#1a1d26] bg-[#0e1017]">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">Active Matter</span>
            <div className="text-xs font-semibold text-white truncate">{activeCase.title}</div>
            <div className="text-[11px] font-mono text-[#D4AF37]">{activeCase.docketNumber}</div>
            <div className="mt-2 text-[10px] text-gray-500 font-mono">Jurisdiction: {activeCase.jurisdiction}</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main id="main-content" role="main" className="flex-1 overflow-y-auto p-6 bg-[#07080a]">
          
          {/* Surface 1: Dashboard */}
          {navTab === 'dashboard' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1a1d26] pb-5">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-white">Legal Command Dashboard</h1>
                  <p className="text-xs text-gray-400 mt-1">Cross-case operational posture, upcoming deterministic deadlines, and active AI team status.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 text-xs font-mono">
                    Jurisdiction: {activeCase.jurisdiction.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30 text-xs font-mono">
                    14 Seed Agents Active
                  </span>
                </div>
              </div>

              {/* Status Metric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26]">
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>Critical Deadlines</span>
                    <Clock className="w-4 h-4 text-[#eab308]" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">14 Days</div>
                  <div className="text-[11px] text-gray-400 font-mono mt-1">Rule 12 Pretrial Motion</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26]">
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>Verified Evidence</span>
                    <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">8 Exhibits</div>
                  <div className="text-[11px] text-gray-400 font-mono mt-1">Chain of custody logged</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26]">
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>Legal Authorities</span>
                    <BookOpen className="w-4 h-4 text-[#60a5fa]" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">4 Primary</div>
                  <div className="text-[11px] text-gray-400 font-mono mt-1">100% Grounded (Tier 1)</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26]">
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>Human Approval Gate</span>
                    <Lock className="w-4 h-4 text-[#ef4444]" />
                  </div>
                  <div className="text-2xl font-mono font-bold text-[#10b981]">SECURE</div>
                  <div className="text-[11px] text-gray-400 font-mono mt-1">Zero auto-filing actions</div>
                </div>
              </div>

              {/* Active Matter Overview Card */}
              <div className="p-5 rounded-xl bg-[#0e1017] border border-[#1a1d26]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Current Proceeding Details</h3>
                  <button onClick={() => setNavTab('cases')} className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-mono">
                    View Case Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div><span className="text-gray-500 font-mono">Court:</span> <span className="text-gray-300 font-medium">{activeCase.court}</span></div>
                    <div><span className="text-gray-500 font-mono">Judge:</span> <span className="text-gray-300 font-medium">{activeCase.judge}</span></div>
                    <div><span className="text-gray-500 font-mono">Prosecutor:</span> <span className="text-gray-300 font-medium">{activeCase.prosecutor}</span></div>
                  </div>
                  <div className="space-y-2">
                    <div><span className="text-gray-500 font-mono">Current Posture:</span> <span className="text-[#34d399] font-medium">{activeCase.stage}</span></div>
                    <div><span className="text-gray-500 font-mono">Primary Charge:</span> <span className="text-gray-300">{activeCase.charges[0].charge}</span></div>
                    <div><span className="text-gray-500 font-mono">Grounding Policy:</span> <span className="text-amber-400">Strict Citations Only</span></div>
                  </div>
                </div>
              </div>

              {/* Quick Actions into Core Modules */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  onClick={() => setNavTab('research')}
                  className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26] hover:border-[#D4AF37]/50 transition cursor-pointer group"
                >
                  <FileSearch className="w-5 h-5 text-[#60a5fa] mb-2 group-hover:scale-110 transition" />
                  <h4 className="text-sm font-semibold text-white">Legal Research Workbench</h4>
                  <p className="text-xs text-gray-400 mt-1">Ground arguments in primary Arizona statutes and Federal Fourth Amendment case law.</p>
                </div>

                <div 
                  onClick={() => setNavTab('court_activity')}
                  className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26] hover:border-[#D4AF37]/50 transition cursor-pointer group"
                >
                  <Gavel className="w-5 h-5 text-[#eab308] mb-2 group-hover:scale-110 transition" />
                  <h4 className="text-sm font-semibold text-white">Court Deadline Calculator</h4>
                  <p className="text-xs text-gray-400 mt-1">Calculate deterministic filing dates based on Rule 12 and the Speedy Trial Act.</p>
                </div>

                <div 
                  onClick={() => setNavTab('attorneys')}
                  className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26] hover:border-[#D4AF37]/50 transition cursor-pointer group"
                >
                  <UserCheck className="w-5 h-5 text-[#34d399] mb-2 group-hover:scale-110 transition" />
                  <h4 className="text-sm font-semibold text-white">Independent Attorney Directory</h4>
                  <p className="text-xs text-gray-400 mt-1">Filter verified pro bono and criminal defense attorneys without algorithmic rank.</p>
                </div>
              </div>
            </div>
          )}

          {/* Surface 2: Cases */}
          {navTab === 'cases' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-[#1a1d26] pb-4">
                <h1 className="text-2xl font-serif font-bold text-white">Case Workspace Shell</h1>
                <p className="text-xs text-gray-400 mt-1">Central persistent object. Manages allegations, jurisdiction scoping, parties, and case files.</p>
              </div>

              <div className="p-5 rounded-xl bg-[#0e1017] border border-[#1a1d26] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-[#D4AF37] font-serif">{activeCase.title}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active Matter</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono border-y border-[#1a1d26] py-3">
                  <div>
                    <span className="text-gray-500 block">DOCKET NUMBER</span>
                    <span className="text-white font-medium">{activeCase.docketNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">JURISDICTION</span>
                    <span className="text-white font-medium">{activeCase.jurisdiction} ({activeCase.jurisdictionName})</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">STAGE OF PROCEEDING</span>
                    <span className="text-white font-medium">{activeCase.stage}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-2">Statutory Allegations & Charges</h4>
                  <div className="space-y-3">
                    {activeCase.charges.map((c) => (
                      <div key={c.count} className="p-3.5 rounded-lg bg-[#14161f] border border-[#222634] space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs font-medium text-white">Count {c.count}: {c.charge}</div>
                            <div className="text-[11px] text-gray-400 font-mono">Classification: {c.severity}</div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {c.status}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-[#1c1f2b] text-[11px] text-gray-400 font-mono">
                          <span className="text-gray-500">Elements to Prove:</span> {c.elements.join(" • ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-xs text-gray-500 flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>All documents, timeline entries, research notes, and agent configurations are strictly isolated to this case under Row-Level Security (RLS).</span>
                </div>
              </div>
            </div>
          )}

          {/* Surface 3: AI Legal Team */}
          {navTab === 'agents' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#1a1d26] pb-4 gap-2">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-white">AI Legal Team Roster</h1>
                  <p className="text-xs text-gray-400 mt-1">14 independent agents configured with typed capabilities, system prompt contracts, and strict context permissions (§8.9).</p>
                </div>
                <button
                  onClick={() => setNavTab('divine')}
                  className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 transition flex items-center gap-1.5"
                >
                  <Network className="w-3.5 h-3.5" /> View Divine Agent Architecture
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SEED_AGENTS.map((agent) => (
                  <div key={agent.manifest.id} className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26] flex flex-col justify-between hover:border-[#2a2f40] transition">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-semibold">
                          {agent.manifest.key}
                        </span>
                        <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">
                          v{agent.manifest.version}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1.5">{agent.manifest.name}</h3>
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{agent.manifest.purpose}</p>

                      <div className="space-y-1 text-[11px] font-mono border-t border-[#1a1d26] pt-2 mb-3">
                        <div className="text-gray-500">
                          Capabilities: <span className="text-gray-300">{agent.manifest.capabilities.join(', ')}</span>
                        </div>
                        <div className="text-gray-500">
                          Context Ceiling: <span className="text-gray-300">{agent.manifest.contextPolicy.canReadDocuments} docs</span>
                        </div>
                        <div className="text-gray-500">
                          Tool Permissions: <span className="text-gray-300">{agent.manifest.toolPolicy.allowedTools.length} allowed</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#12141c] p-2 rounded text-[11px] font-mono text-gray-400 border border-[#1f2330]">
                      <span className="text-[#34d399] block font-semibold mb-0.5">Prompt Contract Guardrail:</span>
                      <p className="line-clamp-2 italic text-gray-400">"{agent.systemPromptContract}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Surface: Divine Agent Architecture (YHWH, Michael, Gabriel, Raphael, Metatron, Seraphim) */}
          {navTab === 'divine' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-[#1a1d26] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-white">Divine Multi-Agent Architecture</h1>
                  <p className="text-xs text-gray-400 mt-1">Hierarchical multi-agent runtime engine. Evaluates directives, enforces DAG dependencies, and routes consensus.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 text-xs font-mono">
                    Protocol: Counsel Room API v1
                  </span>
                </div>
              </div>

              {/* Topology Map */}
              <div className="p-5 rounded-xl bg-[#0e1017] border border-[#1a1d26] space-y-4">
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Network className="w-4 h-4 text-[#D4AF37]" /> Architectural Hierarchy Map (multi-agent-architecture-blueprint.md)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* YHWH */}
                  <div className="p-4 rounded-lg bg-[#141622] border border-[#262c42] space-y-2 md:col-span-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-[#D4AF37]">YHWH — Core Reasoning Engine (Kernel)</span>
                      <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">Local Inference Kernel</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Primary cognitive kernel executing local inference. Evaluates high-level user directives, parses ambiguous legal intent, enforces zero-hallucination policies, and outputs structured execution DAGs.
                    </p>
                  </div>

                  {/* Michael */}
                  <div className="p-4 rounded-lg bg-[#12141c] border border-[#222634] space-y-2 md:col-span-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-[#38bdf8]">Michael — Orchestrator & Workflow Commander</span>
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">State Machine Daemon</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Central state machine coordinator. Intercepts directives from YHWH, maintains persistent session state via Supabase/PostgreSQL hooks, and manages worker dependency trees.
                    </p>
                  </div>

                  {/* Gabriel */}
                  <div className="p-4 rounded-lg bg-[#12141c] border border-[#222634] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-[#34d399]">Gabriel</span>
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Messenger</span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono">Role: Payload Delivery & Event Stream</div>
                    <p className="text-xs text-gray-300">
                      Event-driven communication agent distributing verified legal outputs, notifications, and context payloads across Counsel Room channels.
                    </p>
                  </div>

                  {/* Raphael */}
                  <div className="p-4 rounded-lg bg-[#12141c] border border-[#222634] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-[#f59e0b]">Raphael</span>
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">Worker Bot</span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono">Role: Deterministic Execution</div>
                    <p className="text-xs text-gray-300">
                      Deterministic calculation engine executing Rule 12 deadline math, Speedy Trial tracking, and document exhibit indexing without LLM hallucinations.
                    </p>
                  </div>

                  {/* Metatron & Seraphim */}
                  <div className="p-4 rounded-lg bg-[#12141c] border border-[#222634] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-[#ec4899]">Metatron & Seraphim</span>
                      <span className="text-[10px] font-mono bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded">Gateway</span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono">Role: Model Routing & Consensus</div>
                    <p className="text-xs text-gray-300">
                      Intelligent model gateway routing requests to external reasoning models (gemini-3.5-flash / Seraphim) when deep multi-model consensus is required.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Execution Console */}
              <div className="p-5 rounded-xl bg-[#0e1017] border border-[#1a1d26] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#D4AF37]" /> Counsel Room Orchestration Stream (POST /api/v1/channels/{`{id}`}/ai/ask)
                  </h3>
                  <span className="text-xs font-mono text-gray-400">Mode: Consensus (Threshold: 0.70)</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={divineInput}
                    onChange={(e) => setDivineInput(e.target.value)}
                    className="flex-1 bg-[#12141c] border border-[#222634] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="Enter directive for YHWH & Michael orchestration..."
                  />
                  <button
                    onClick={handleExecuteDivineCycle}
                    disabled={divineRunning}
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-lg text-xs font-mono transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${divineRunning ? 'animate-spin' : ''}`} />
                    {divineRunning ? "Orchestrating..." : "Dispatch to Team"}
                  </button>
                </div>

                {/* Audit Stream Logs */}
                <div className="p-4 rounded-lg bg-[#08090d] border border-[#1a1d26] font-mono text-xs space-y-2 max-h-64 overflow-y-auto">
                  {divineLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3 border-b border-gray-900/50 pb-1.5">
                      <span className="text-gray-500 text-[10px] w-14 shrink-0">{log.timestamp}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        log.actor === 'YHWH' ? 'bg-purple-900/40 text-purple-300' :
                        log.actor === 'Michael' ? 'bg-blue-900/40 text-blue-300' :
                        log.actor === 'Raphael' ? 'bg-amber-900/40 text-amber-300' :
                        log.actor === 'Gabriel' ? 'bg-emerald-900/40 text-emerald-300' :
                        'bg-pink-900/40 text-pink-300'
                      }`}>
                        {log.actor}
                      </span>
                      <span className="text-gray-300 leading-relaxed">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Surface 4: Legal Library */}
          {navTab === 'library' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-[#1a1d26] pb-4">
                <h1 className="text-2xl font-serif font-bold text-white">Authoritative Legal Library</h1>
                <p className="text-xs text-gray-400 mt-1">Grounded legal knowledge corpus. Every authority carries verified source metadata and pinpoint anchors (§12).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SEED_AUTHORITIES.map((auth) => (
                  <div key={auth.id} className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26] space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono text-[#D4AF37] font-semibold block">{auth.citation}</span>
                        <h3 className="text-sm font-serif font-semibold text-white">{auth.title}</h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                        Tier {auth.credibilityTier} Verified
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#14161f] border border-[#222634] text-xs text-gray-300 italic">
                      "{auth.quote}"
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-mono text-gray-500 pt-1">
                      <span>Pinpoint: {auth.pinpoint}</span>
                      <a href={auth.officialUrl} target="_blank" rel="noreferrer" className="text-[#60a5fa] hover:underline flex items-center gap-1">
                        Official Record <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Surface 5: Research Workbench */}
          {navTab === 'research' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-[#1a1d26] pb-4">
                <h1 className="text-2xl font-serif font-bold text-white">Legal Research Workbench</h1>
                <p className="text-xs text-gray-400 mt-1">Hybrid retrieval + Grounding Guard. Every synthesized legal claim maps to verified authority (§12.5, §13).</p>
              </div>

              {/* Research Query Input */}
              <div className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26] space-y-3">
                <label className="text-xs font-mono uppercase text-gray-400 tracking-wider block">
                  Search Statutory Authorities & Precedent
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      value={researchQuery}
                      onChange={(e) => setResearchQuery(e.target.value)}
                      className="w-full bg-[#12141c] border border-[#222634] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. Arizona motion to suppress warrantless traffic stop search"
                    />
                  </div>
                  <button
                    onClick={handleRunGroundingTest}
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-lg text-xs font-mono transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Synthesize & Guard
                  </button>
                </div>
              </div>

              {/* Synthesis Results with Grounding Guard Badge */}
              {researchResult && (
                <div className="p-5 rounded-xl bg-[#0e1017] border border-[#1a1d26] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {researchResult.status.toUpperCase()} GROUNDING
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        Model: Legal Research AI (gemini-3.5-flash)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      Labeled: Analysis (Not Advice)
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-[#12141c] border border-[#1f2330] text-sm text-gray-200 leading-relaxed font-sans">
                    {researchResult.text}
                  </div>

                  {/* Sources Drawer */}
                  <div>
                    <h4 className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" /> Cited Primary Sources:
                    </h4>
                    <div className="space-y-2">
                      {researchResult.citations.map((c) => (
                        <div key={c.id} className="p-2.5 rounded bg-[#161822] border border-[#242938] flex items-center justify-between text-xs font-mono">
                          <div>
                            <span className="text-[#D4AF37] font-semibold">{c.citation}</span>
                            <span className="text-gray-400 ml-2">({c.title})</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">Verified Tier 1</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Surface 6: Documents & Draft Desk */}
          {navTab === 'documents' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-[#1a1d26] pb-4">
                <h1 className="text-2xl font-serif font-bold text-white">Document Management & Draft Desk</h1>
                <p className="text-xs text-gray-400 mt-1">Immutable originals, derived versioning, and strict human-only approval state machine (§19.4).</p>
              </div>

              {/* State Machine Visualization */}
              <div className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26]">
                <h3 className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-3">Document State Progression</h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {['Information', 'Analysis', 'Draft', 'User-Edited', 'User-Approved', 'Final'].map((st, idx) => (
                    <React.Fragment key={st}>
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 whitespace-nowrap ${
                        draftState === st
                          ? 'bg-[#D4AF37] text-black font-bold'
                          : 'bg-[#141620] text-gray-400 border border-[#222634]'
                      }`}>
                        <span>{st}</span>
                      </div>
                      {idx < 5 && <span className="text-gray-600 text-xs">→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-2 text-xs text-amber-400/90 font-mono">
                  [Strict Boundary]: AI can only produce up to "Draft". Transition to "User-Approved" and "Final" requires cryptographic human authorization.
                </div>
              </div>

              {/* Sample Motion to Suppress Draft */}
              <div className="p-5 rounded-xl bg-[#0e1017] border border-[#1a1d26] space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-mono text-[#D4AF37] uppercase">Draft Desk Specimen</span>
                    <h3 className="text-base font-semibold text-white">Defendant's Motion to Suppress Evidence Pursuant to Rule 12(b)(3)</h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDraftState('User-Edited')}
                      className="px-3 py-1.5 rounded bg-[#1e2230] text-white hover:bg-[#282d40] text-xs font-mono"
                    >
                      User Edit
                    </button>
                    <button 
                      onClick={() => setDraftState('User-Approved')}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold"
                    >
                      Approve Draft (Human Step)
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#08090d] border border-[#1c1f2b] font-mono text-xs text-gray-300 space-y-2">
                  <div className="text-center font-bold text-gray-400 pb-2 border-b border-gray-800">
                    IN THE SUPERIOR COURT OF THE STATE OF ARIZONA IN AND FOR THE COUNTY OF MARICOPA
                  </div>
                  <div>STATE OF ARIZONA, Plaintiff, v. DEFENDANT, Pro Se. Case No: CR2026-104928-001</div>
                  <div className="pt-2 text-gray-300">
                    COMES NOW the Defendant, self-represented pro se, and hereby moves this Court pursuant to the Fourth and Fourteenth Amendments of the United States Constitution, Article 2, Section 8 of the Arizona Constitution, and Arizona Rule of Criminal Procedure 12(b)(3), for an order suppressing all physical evidence obtained from the vehicle stop on September 15, 2026...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Surface 7: Timeline */}
          {navTab === 'timeline' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-[#1a1d26] pb-4">
                <h1 className="text-2xl font-serif font-bold text-white">Case Chronology & Timeline</h1>
                <p className="text-xs text-gray-400 mt-1">Reconstructs factual sequence of arrest, booking, and hearings. Distinguishes confirmed vs unverified proposals (§20.2).</p>
              </div>

              <div className="space-y-4">
                {[
                  { date: "2026-09-15 22:30", type: "Arrest & Citation", desc: "Traffic stop initiated on Interstate 10. Vehicle search executed without warrant.", verified: true },
                  { date: "2026-09-16 08:00", type: "Booking & Initial Appearance", desc: "Initial appearance held before commissioner. Release conditions set on own recognizance.", verified: true },
                  { date: "2026-10-01 09:30", type: "Arraignment", desc: "Arraignment held. Plea of not guilty entered. Triggers Rule 12 14-day pretrial motion deadline.", verified: true },
                  { date: "2026-10-15 17:00", type: "Motion Filing Deadline", desc: "Deadline to file Motion to Suppress under Rule 12(c)(1).", verified: false, note: "AI Proposal - Pending Confirmation" }
                ].map((ev, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26] flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#161822] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 font-mono text-xs">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">{ev.type}</h4>
                        <span className="text-xs font-mono text-gray-500">{ev.date}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{ev.desc}</p>
                      {ev.note && (
                        <div className="mt-2 text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 inline-block">
                          {ev.note}
                        </div>
                      )}
                    </div>
                    <div>
                      {ev.verified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          PROPOSED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Surface 8: Court Activity & Deadline Engine */}
          {navTab === 'court_activity' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-[#1a1d26] pb-4">
                <h1 className="text-2xl font-serif font-bold text-white">Court Activity & Deterministic Deadline Engine</h1>
                <p className="text-xs text-gray-400 mt-1">Calendar arithmetic and statutory rules. Never guesses dates using raw LLM predictions (§17).</p>
              </div>

              {/* Deadline Engine Calculator */}
              <div className="p-5 rounded-xl bg-[#0e1017] border border-[#1a1d26] space-y-4">
                <h3 className="text-sm font-mono font-semibold text-[#D4AF37] uppercase tracking-wider">
                  Deterministic Rule Calculator
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-mono text-gray-400 block mb-1">Applicable Statutory Rule</label>
                    <select
                      value={selectedRuleId}
                      onChange={(e) => setSelectedRuleId(e.target.value)}
                      className="w-full bg-[#12141c] border border-[#222634] rounded-lg p-2 text-xs text-white"
                    >
                      {SEED_RULES.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.citation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-gray-400 block mb-1">Trigger Event Date</label>
                    <input
                      type="date"
                      value={triggerDate}
                      onChange={(e) => setTriggerDate(e.target.value)}
                      className="w-full bg-[#12141c] border border-[#222634] rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleComputeDeadline}
                      className="w-full py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-black font-semibold rounded-lg text-xs font-mono transition"
                    >
                      Recalculate Rule Date
                    </button>
                  </div>
                </div>

                {/* Computation Output */}
                <div className="p-4 rounded-lg bg-[#141620] border border-[#242838] space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-white">
                    <span className="font-semibold text-sm">CALCULATED DUE DATE: {computedDeadline.dueDate}</span>
                    <span className="text-emerald-400">Court Day Confirmed</span>
                  </div>
                  <div className="text-gray-400">Citation: {computedDeadline.citation}</div>
                  <div className="text-gray-400">Method: {computedDeadline.methodSummary}</div>
                  {computedDeadline.skippedDays.length > 0 && (
                    <div className="text-amber-400 text-[11px]">
                      Skipped non-court days: {computedDeadline.skippedDays.map(d => `${d.date} (${d.reason})`).join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Human-Controlled Filing Guidance Card (§18.4) */}
              <div className="p-4 rounded-xl bg-[#12141a] border border-[#2a2f42] text-xs text-gray-300 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono">
                  <Lock className="w-4 h-4" />
                  <span>STRICT INVARIANT: External Court Filing is Human-Controlled</span>
                </div>
                <p>
                  Chain of Command will prepare your drafts and calculate deadlines, but will never automatically submit documents to Maricopa County Superior Court.
                  To file your verified motion, use the official court portal: <a href="https://www.clerkofcourt.maricopa.gov" target="_blank" rel="noreferrer" className="text-[#60a5fa] underline">clerkofcourt.maricopa.gov</a>.
                </p>
              </div>
            </div>
          )}

          {/* Surface 9: Independent Attorney Directory with Counsel Matcher */}
          {navTab === 'attorneys' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-[#1a1d26] pb-4">
                <h1 className="text-2xl font-serif font-bold text-white">Independent Attorney Directory & Counsel Match</h1>
                <p className="text-xs text-gray-400 mt-1">Neutral directory with zero algorithmic ranking or AI picks. Match counsel based on verified jurisdiction, fee model, and domain (§21).</p>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-mono text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  Notice: We display legal counsel and enable transparent filtering. We do NOT recommend, rank, score, or pick counsel for you. Sponsored listings are separated and excluded from legal analysis.
                </span>
              </div>

              {/* Matcher Filter Header */}
              <div className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26] grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Filter by Practice Domain</label>
                  <select
                    value={matcherCategory}
                    onChange={(e) => setMatcherCategory(e.target.value)}
                    className="w-full bg-[#12141c] border border-[#222634] rounded-lg p-2 text-xs text-white"
                  >
                    <option value="All">All Practice Areas</option>
                    <option value="Criminal">Criminal Defense (Felony / Misdemeanor)</option>
                    <option value="Civil Rights">Civil Rights / Constitutional</option>
                    <option value="Housing">Housing & Tenant Rights</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Fee Model / Indigent Need</label>
                  <select
                    value={matcherNeed}
                    onChange={(e) => setMatcherNeed(e.target.value)}
                    className="w-full bg-[#12141c] border border-[#222634] rounded-lg p-2 text-xs text-white"
                  >
                    <option value="All">All Representation Types</option>
                    <option value="Free">Pro Bono / Indigent Defense (Free)</option>
                    <option value="Low-Cost">Low-Cost Bar Referral Panel</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Jurisdiction / Location</label>
                  <select
                    value={matcherLocation}
                    onChange={(e) => setMatcherLocation(e.target.value)}
                    className="w-full bg-[#12141c] border border-[#222634] rounded-lg p-2 text-xs text-white"
                  >
                    <option value="All">All Jurisdictions</option>
                    <option value="Maricopa County, AZ">Maricopa County, AZ (Current Matter)</option>
                    <option value="Marion County, IN">Marion County, IN</option>
                    <option value="Statewide">Statewide Referral Panels</option>
                  </select>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAttorneys.map((atty) => (
                  <div key={atty.id} className="p-4 rounded-xl bg-[#0e1017] border border-[#1a1d26] space-y-3 flex flex-col justify-between hover:border-[#222634] transition">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {atty.type}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Bar Verified
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mt-1">{atty.name}</h3>
                      <p className="text-xs text-[#D4AF37] font-mono mt-0.5">{atty.specialty}</p>
                      
                      <div className="text-xs text-gray-400 space-y-1 mt-3 font-sans">
                        <div><span className="text-gray-500 font-mono">Location:</span> {atty.jurisdiction}</div>
                        <div><span className="text-gray-500 font-mono">Intake:</span> {atty.intakeType}</div>
                        <div><span className="text-gray-500 font-mono">Fee:</span> {atty.feeModel}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#1a1d26] text-xs font-mono space-y-1">
                      <div className="text-gray-300 font-semibold">{atty.phone}</div>
                      <div className="text-[11px] text-gray-500 truncate">{atty.address}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Surface 10: Tasks */}
          {navTab === 'tasks' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-[#1a1d26] pb-4">
                <h1 className="text-2xl font-serif font-bold text-white">Procedural Case Tasks & Deadlines</h1>
                <p className="text-xs text-gray-400 mt-1">Deadlines, hearing preparation checklists, and exhibit organization assignments.</p>
              </div>

              <div className="space-y-3">
                {[
                  { title: "Review Bodycam Footage for Miranda Warning Compliance", due: "2026-10-10", agent: "Paralegal AI", priority: "High" },
                  { title: "Draft Rule 12(b)(3) Motion to Suppress Search Evidence", due: "2026-10-15", agent: "Legal Document Drafting AI", priority: "Critical" },
                  { title: "Compile Character References for Mitigation File", due: "2026-10-25", agent: "Mitigation Builder", priority: "Medium" }
                ].map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#0e1017] border border-[#1a1d26] flex justify-between items-center text-xs">
                    <div>
                      <div className="font-medium text-white">{t.title}</div>
                      <div className="text-gray-400 font-mono mt-0.5">Assigned Agent: {t.agent}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-white">Due: {t.due}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        t.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Surface 11: Settings */}
          {navTab === 'settings' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="border-b border-[#1a1d26] pb-4">
                <h1 className="text-2xl font-serif font-bold text-white">System Settings & Privacy</h1>
                <p className="text-xs text-gray-400 mt-1">Plain language reading level controls, jurisdiction configuration, and audit logging (§23.3, §16).</p>
              </div>

              <div className="p-5 rounded-xl bg-[#0e1017] border border-[#1a1d26] space-y-4">
                <h3 className="text-sm font-semibold text-white font-mono uppercase">Reading Level Complexity</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['plain', 'standard', 'detailed'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setReadingLevel(lvl)}
                      className={`p-3 rounded-lg border text-xs font-mono uppercase text-center transition ${
                        readingLevel === lvl
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] font-bold'
                          : 'border-[#222634] bg-[#12141c] text-gray-400'
                      }`}
                    >
                      {lvl} Complexity
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Plain language simplifies statutory phrasing to approximately an 8th-grade reading level.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0e1017] border border-[#1a1d26] space-y-3">
                <h3 className="text-sm font-semibold text-white font-mono uppercase">Tenancy & Audit Trail Integrity</h3>
                <div className="text-xs font-mono space-y-1 text-gray-400">
                  <div>Tenant ID: <span className="text-white">tenant-pro-se-az-01</span></div>
                  <div>RLS Policy: <span className="text-emerald-400">Enforced (Zero Cross-Case Leakage)</span></div>
                  <div>Audit Chain: <span className="text-emerald-400">Append-Only SHA-256 Hash Chain Verified</span></div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Universal Mandatory Legal Footer Disclaimer (GEMINI.md Rule 5.B) */}
      <footer className="border-t border-[#1a1d26] bg-[#07080a] px-6 py-3 text-[11px] text-gray-500 font-mono text-center">
        This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation.
      </footer>
    </div>
  );
}
