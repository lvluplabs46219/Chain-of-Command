"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  Matter,
  EMPTY_MATTER,
  SpecialistAgent,
  SPECIALIST_AGENTS_ROSTER,
  TimelineRecord,
  EvidenceRecord,
  normalizeMatter,
  isDemoMatter,
} from "@/lib/workspace-data";
import {
  loadMatters,
  saveMatter,
  loadAgents,
  saveAgents,
  loadTimeline,
  saveTimelineRecord,
  loadEvidence,
  saveEvidenceRecord,
} from "@/lib/workspace-sync";
import { WorkspaceHeader } from "./workspace/WorkspaceHeader";
import {
  WorkspaceNavigation,
  WorkspaceTab,
  pathToTab,
} from "./workspace/WorkspaceNavigation";
import { FirstRunWizard, type OnboardingResult } from "./onboarding/FirstRunWizard";
import { useAuth } from "@/contexts/AuthContext";
const viewFallback = () => (
  <div className="p-8 text-center text-sm text-neutral-500">Loading module…</div>
);
const DashboardView = dynamic(
  () => import("./workspace/DashboardView").then((m) => ({ default: m.DashboardView })),
  { loading: viewFallback },
);
const DocketView = dynamic(
  () => import("./workspace/DocketView").then((m) => ({ default: m.DocketView })),
  { loading: viewFallback },
);
// Multi-agent / Wire section UI — same app shell, distinct surface (AI Lawyer nav slot)
const ChambersPlayground = dynamic(
  () => import("./playground/ChambersPlayground").then((m) => ({ default: m.ChambersPlayground })),
  { loading: viewFallback },
);
const LibraryView = dynamic(
  () => import("./workspace/LibraryView").then((m) => ({ default: m.LibraryView })),
  { loading: viewFallback },
);
const InvestigationsView = dynamic(
  () => import("./workspace/InvestigationsView").then((m) => ({ default: m.InvestigationsView })),
  { loading: viewFallback },
);
const TimelineView = dynamic(
  () => import("./workspace/TimelineView").then((m) => ({ default: m.TimelineView })),
  { loading: viewFallback },
);
const DraftDeskView = dynamic(
  () => import("./workspace/DraftDeskView").then((m) => ({ default: m.DraftDeskView })),
  { loading: viewFallback },
);
const CourtWatchView = dynamic(
  () => import("./workspace/CourtWatchView").then((m) => ({ default: m.CourtWatchView })),
  { loading: viewFallback },
);
const Courtroom3DWarRoom = dynamic(
  () => import("./courtroom3d/Courtroom3DWarRoom").then((m) => ({ default: m.Courtroom3DWarRoom })),
  { loading: viewFallback },
);
const DirectoryView = dynamic(
  () => import("./workspace/DirectoryView").then((m) => ({ default: m.DirectoryView })),
  { loading: viewFallback },
);
const TasksDeadlinesView = dynamic(
  () => import("./workspace/TasksDeadlinesView").then((m) => ({ default: m.TasksDeadlinesView })),
  { loading: viewFallback },
);
const DesignArchiveView = dynamic(
  () => import("./workspace/DesignArchiveView").then((m) => ({ default: m.DesignArchiveView })),
  { loading: viewFallback },
);
import { Plus } from "lucide-react";

interface ChainOfCommandMasterAppProps {
  initialTab?: WorkspaceTab;
}

export function ChainOfCommandMasterApp({ initialTab = "dashboard" }: ChainOfCommandMasterAppProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, isFirstRun, completeFirstRun } = useAuth();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [activeMatter, setActiveMatter] = useState<Matter>(EMPTY_MATTER);
  const [agents, setAgents] = useState<SpecialistAgent[]>(SPECIALIST_AGENTS_ROSTER);
  const [timeline, setTimeline] = useState<TimelineRecord[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);
  const [jurisdiction, setJurisdiction] = useState<string>("");
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    const fromPath = pathToTab(pathname || "/");
    if (fromPath) setActiveTab(fromPath);
  }, [pathname]);

  // New Matter Modal
  const [showNewMatterModal, setShowNewMatterModal] = useState<boolean>(false);
  const [newMatterTitle, setNewMatterTitle] = useState<string>("");
  const [newMatterCaseNumber, setNewMatterCaseNumber] = useState<string>("");
  const [newMatterCourt, setNewMatterCourt] = useState<string>("");
  const [newMatterJudge, setNewMatterJudge] = useState<string>("");
  const [newMatterSummary, setNewMatterSummary] = useState<string>("");

  useEffect(() => {
    async function initData() {
      // Drop legacy demo seed if still in localStorage
      try {
        const raw = localStorage.getItem("chain_of_command_matters");
        if (raw) {
          const parsed = JSON.parse(raw) as Matter[];
          if (
            Array.isArray(parsed) &&
            parsed.some((m) => m.id === "matter-001" || m.id === "case-01" || (m.title || "").includes("Marcus Vance") || (m as any).isDemo)
          ) {
            localStorage.removeItem("chain_of_command_matters");
          }
        }
      } catch {
        /* ignore */
      }

      const loaded = (await loadMatters()).filter((m) => !isDemoMatter(m)).map((m) => normalizeMatter(m));
      if (loaded.length > 0) {
        setMatters(loaded);
        setActiveMatter(loaded[0]);
        setJurisdiction(loaded[0].jurisdiction || "");
      } else {
        setMatters([]);
        setActiveMatter(EMPTY_MATTER);
      }
      setAgents(loadAgents());
      setDataReady(true);
    }
    initData();
  }, []);

  useEffect(() => {
    if (activeMatter && activeMatter.id !== "matter-empty") {
      setTimeline(loadTimeline(activeMatter.id));
      setEvidence(loadEvidence(activeMatter.id));
      if (activeMatter.jurisdiction) {
        setJurisdiction(activeMatter.jurisdiction);
      }
    } else {
      setTimeline([]);
      setEvidence([]);
    }
  }, [activeMatter.id]);

  const handleOnboardingComplete = async (result: OnboardingResult) => {
    completeFirstRun();
    setJurisdiction(result.jurisdiction);
    // Never seed demo/fake cases — only the matter the user created (or empty)
    if (result.matter) {
      const saved = await saveMatter(normalizeMatter(result.matter));
      setMatters([saved]);
      setActiveMatter(normalizeMatter(saved));
    } else {
      setMatters([]);
      setActiveMatter(EMPTY_MATTER);
    }
  };


  // Complete first-run after Google OAuth return
  useEffect(() => {
    if (authLoading || !isAuthenticated || !isFirstRun) return;
    try {
      const raw = sessionStorage.getItem("coc_pending_onboarding");
      if (!raw) {
        // Signed in but no pending wizard payload — mark first-run done
        completeFirstRun();
        return;
      }
      const pending = JSON.parse(raw) as {
        name: string;
        email: string;
        jurisdiction: string;
        matter: Matter | null;
      };
      sessionStorage.removeItem("coc_pending_onboarding");
      void handleOnboardingComplete({
        name: pending.name,
        email: pending.email,
        jurisdiction: pending.jurisdiction,
        matter: pending.matter,
      });
    } catch (e) {
      console.warn("[onboarding] pending restore failed", e);
      completeFirstRun();
    }
  }, [authLoading, isAuthenticated, isFirstRun]);

  if (authLoading || !dataReady) {
    return (
      <div className="min-h-screen bg-[#0C0D10] flex items-center justify-center text-neutral-400 text-sm">
        Preparing your workspace…
      </div>
    );
  }

  if (isFirstRun || !isAuthenticated) {
    return <FirstRunWizard onComplete={handleOnboardingComplete} />;
  }

  const handleSelectMatter = (m: Matter) => {
    setActiveMatter(m);
    setTimeline(loadTimeline(m.id));
    setEvidence(loadEvidence(m.id));
    if (m.jurisdiction) setJurisdiction(m.jurisdiction);
  };

  const handleSaveMatter = async (updated: Matter) => {
    const saved = await saveMatter(normalizeMatter(updated));
    setActiveMatter(normalizeMatter(saved));
    setMatters((prev) => {
      const without = prev.filter((m) => m.id !== updated.id && m.id !== saved.id);
      return [saved, ...without];
    });
  };

  const handleUpdateAgent = (updated: SpecialistAgent) => {
    const newAgents = agents.map((a) => (a.id === updated.id ? updated : a));
    setAgents(newAgents);
    saveAgents(newAgents);
  };

  const handleAddAgent = (newAgent: SpecialistAgent) => {
    const exists = agents.some((a) => a.id === newAgent.id);
    const updated = exists
      ? agents.map((a) => (a.id === newAgent.id ? { ...a, status: "Active" as const } : a))
      : [...agents, { ...newAgent, status: "Active" as const }];
    setAgents(updated);
    saveAgents(updated);
  };

  const handleRemoveAgent = (agentId: string) => {
    if (agentId === "agent-head") return;
    const updated = agents.filter((a) => a.id !== agentId);
    setAgents(updated);
    saveAgents(updated);
  };

  const handleSaveTimeline = (rec: TimelineRecord) => {
    saveTimelineRecord(rec);
    setTimeline(loadTimeline(activeMatter.id));
  };

  const handleSaveEvidence = (rec: EvidenceRecord) => {
    saveEvidenceRecord(rec);
    setEvidence(loadEvidence(activeMatter.id));
  };

  const handleCreateNewMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatterTitle.trim() || !newMatterCaseNumber.trim()) return;

    const newM: Matter = {
      id: `matter-${Date.now()}`,
      title: newMatterTitle.trim(),
      caseNumber: newMatterCaseNumber.trim(),
      court: newMatterCourt.trim() || "",
      courtName: newMatterCourt.trim() || "",
      jurisdiction: jurisdiction || "",
      judge: newMatterJudge.trim() || "",
      prosecutor: "",
      filingDate: new Date().toISOString().split("T")[0],
      status: "Active",
      speedyTrialDaysRemaining: 0,
      speedyTrialLimit: 70,
      readingLevel: "Plain English",
      defenseStatus: "Self-Represented (Pro Se)",
      nextCourtDate: "",
      nextCourtType: "",
      speedyTrialDeadline: "",
      createdAt: new Date().toISOString().split("T")[0],
      summary: newMatterSummary.trim() || "",
      charges: [],
      timeline: [],
      authorities: [],
      evidence: [],
      deadlines: [],
      isDemo: false,
    };

    const saved = await saveMatter(newM);
    setMatters((prev) => [saved, ...prev.filter((m) => m.id !== newM.id && m.id !== saved.id)]);
    setActiveMatter(saved);
    setShowNewMatterModal(false);
    setNewMatterTitle("");
    setNewMatterCaseNumber("");
    setNewMatterCourt("");
    setNewMatterJudge("");
    setNewMatterSummary("");
    setActiveTab("docket");
  };

  const isEmptyWorkspace = !matters.length || activeMatter.id === "matter-empty";

  return (
    <div className="min-h-screen bg-[#fff7fb] text-[#281330] flex flex-col font-sans selection:bg-[#ffd8e8]">
      {/* Header */}
      {isDemoMatter(activeMatter) && (
        <div className="bg-[#ffd8e8] text-[#8a005e] border-b border-[#ffafd5] text-center text-xs font-bold tracking-wide py-1.5 px-3" role="status">
          DEMO DATA — sample case for exploration only. Not your real matter.
        </div>
      )}
      <WorkspaceHeader
        matters={matters}
        activeMatter={activeMatter}
        onSelectMatter={handleSelectMatter}
        onOpenNewMatterModal={() => setShowNewMatterModal(true)}
        jurisdiction={jurisdiction}
        onChangeJurisdiction={setJurisdiction}
      />

      {/* Navigation */}
      <WorkspaceNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {isEmptyWorkspace && (
        <div className="mx-4 mt-3 rounded-2xl border border-[#f0d5e2] bg-white px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div>
            <p className="text-sm text-[#281330] font-bold">No active matter open</p>
            <p className="text-xs text-[#604868] mt-0.5">
              Open a case file to unlock deadlines, evidence, and the AI team on real data.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewMatterModal(true)}
            className="shrink-0 px-4 py-2 rounded-full bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white text-xs font-bold shadow-[0_4px_16px_rgba(224,64,160,0.22)] hover:scale-[1.02] transition-transform"
          >
            Open new matter
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <section aria-label="Active Case Workspace" className="flex-1">
        {activeTab === "dashboard" && (
          <DashboardView
            matter={activeMatter}
            agents={agents}
            evidence={evidence}
            timeline={timeline}
            onNavigateTab={setActiveTab}
            onOpenAddTimeline={() => setActiveTab("timeline")}
            onOpenAddEvidence={() => setActiveTab("investigations")}
            onOpenNewMatter={() => setShowNewMatterModal(true)}
          />
        )}

        {activeTab === "docket" && (
          <DocketView
            matters={matters}
            activeMatter={activeMatter}
            onSelectMatter={handleSelectMatter}
            onSaveMatter={handleSaveMatter}
            onOpenNewMatterModal={() => setShowNewMatterModal(true)}
          />
        )}

        {activeTab === "chambers" && (
          <ChambersPlayground embedded />
        )}

        {activeTab === "library" && (
          <LibraryView evidence={evidence} matter={activeMatter} />
        )}

        {activeTab === "investigations" && (
          <InvestigationsView
            evidence={evidence}
            onSaveEvidence={handleSaveEvidence}
            matterId={activeMatter.id}
          />
        )}

        {activeTab === "timeline" && (
          <TimelineView
            timeline={timeline}
            onSaveTimelineRecord={handleSaveTimeline}
            matterId={activeMatter.id}
          />
        )}

        {activeTab === "draft_desk" && <DraftDeskView matter={activeMatter} />}

        {activeTab === "court_watch" && <CourtWatchView matter={activeMatter} />}

        {activeTab === "courtroom_3d" && (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
            <Courtroom3DWarRoom
              matter={activeMatter}
              evidence={evidence}
              onNavigateTab={(tab) => setActiveTab(tab as WorkspaceTab)}
            />
          </div>
        )}

        {activeTab === "directory" && (
          <DirectoryView
            matter={activeMatter}
            agents={agents}
            onAddAgent={handleAddAgent}
            onRemoveAgent={handleRemoveAgent}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "tasks" && <TasksDeadlinesView matter={activeMatter} />}

        {activeTab === "audit" && <TasksDeadlinesView matter={activeMatter} />}

        {activeTab === "archive" && <DesignArchiveView />}
      </section>

      {/* Universal Mandatory Legal Footer Disclaimer */}
      <footer className="border-t border-[#f0d5e2] bg-white py-5 px-6 text-center text-xs text-[#604868] font-sans mt-auto">
        <div className="max-w-4xl mx-auto">
          <p className="leading-relaxed">
            This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation.
          </p>
          <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-[#8a707b] font-mono">
            <span>Chain of Command Legal OS</span>
            <span>·</span>
            <span>Pro Se Workspace</span>
            <span>·</span>
            <span>Educational information only · Not legal advice</span>
          </div>
        </div>
      </footer>

      {/* Open New Legal Matter Modal */}
      {showNewMatterModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#f0d5e2] rounded-3xl max-w-lg w-full p-6 sm:p-7 text-[#281330] shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#af0a78]">Matter Workspace</span>
              <h3 className="text-lg font-bold text-[#281330] mt-0.5">Open New Legal Matter</h3>
              <p className="text-xs text-[#604868]">Initialize a dedicated case folder for self-representation.</p>
            </div>

            <form onSubmit={handleCreateNewMatter} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#604868] mb-1 font-mono uppercase text-[10px] font-bold">Case Caption / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State v. Smith or In Re Paternity of Baby Doe"
                  value={newMatterTitle}
                  onChange={(e) => setNewMatterTitle(e.target.value)}
                  className="w-full bg-[#fff7fb] border border-[#ddbfca] focus:border-[#af0a78] focus:ring-2 focus:ring-[#e040a0]/25 rounded-2xl px-3.5 py-2 text-[#281330]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#604868] mb-1 font-mono uppercase text-[10px] font-bold">Case Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 73C01-2205-JP-000025"
                    value={newMatterCaseNumber}
                    onChange={(e) => setNewMatterCaseNumber(e.target.value)}
                    className="w-full bg-[#fff7fb] border border-[#ddbfca] focus:border-[#af0a78] focus:ring-2 focus:ring-[#e040a0]/25 rounded-2xl px-3.5 py-2 text-[#281330] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#604868] mb-1 font-mono uppercase text-[10px] font-bold">Presiding Judge</label>
                  <input
                    type="text"
                    placeholder="e.g. Hon. Arthur Miller"
                    value={newMatterJudge}
                    onChange={(e) => setNewMatterJudge(e.target.value)}
                    className="w-full bg-[#fff7fb] border border-[#ddbfca] focus:border-[#af0a78] focus:ring-2 focus:ring-[#e040a0]/25 rounded-2xl px-3.5 py-2 text-[#281330]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#604868] mb-1 font-mono uppercase text-[10px] font-bold">Court Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shelby Circuit Court, County of Shelby"
                  value={newMatterCourt}
                  onChange={(e) => setNewMatterCourt(e.target.value)}
                  className="w-full bg-[#fff7fb] border border-[#ddbfca] focus:border-[#af0a78] focus:ring-2 focus:ring-[#e040a0]/25 rounded-2xl px-3.5 py-2 text-[#281330]"
                />
              </div>

              <div>
                <label className="block text-[#604868] mb-1 font-mono uppercase text-[10px] font-bold">Case Summary / Allegations</label>
                <textarea
                  rows={2}
                  placeholder="Summary of factual dispute, allegations, or defense posture..."
                  value={newMatterSummary}
                  onChange={(e) => setNewMatterSummary(e.target.value)}
                  className="w-full bg-[#fff7fb] border border-[#ddbfca] focus:border-[#af0a78] focus:ring-2 focus:ring-[#e040a0]/25 rounded-2xl p-2.5 text-[#281330]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#f0d5e2] mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewMatterModal(false)}
                  className="px-4 py-2 bg-[#fff7fb] hover:bg-[#ffd8e8] text-[#8a005e] border border-[#f0d5e2] rounded-full text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#e040a0] to-[#af0a78] text-white font-bold rounded-full text-xs shadow-[0_4px_16px_rgba(224,64,160,0.25)] hover:scale-[1.02] transition-transform"
                >
                  Create Matter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
