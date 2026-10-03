"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Matter,
  INITIAL_MATTERS,
  SpecialistAgent,
  SPECIALIST_AGENTS_ROSTER,
  TimelineRecord,
  EvidenceRecord,
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
import { DashboardView } from "./workspace/DashboardView";
import { DocketView } from "./workspace/DocketView";
import { ChambersView } from "./workspace/ChambersView";
import { LibraryView } from "./workspace/LibraryView";
import { InvestigationsView } from "./workspace/InvestigationsView";
import { TimelineView } from "./workspace/TimelineView";
import { DraftDeskView } from "./workspace/DraftDeskView";
import { CourtWatchView } from "./workspace/CourtWatchView";
import { DirectoryView } from "./workspace/DirectoryView";
import { TasksDeadlinesView } from "./workspace/TasksDeadlinesView";
import { DesignArchiveView } from "./workspace/DesignArchiveView";
import { Plus } from "lucide-react";

interface ChainOfCommandMasterAppProps {
  initialTab?: WorkspaceTab;
}

export function ChainOfCommandMasterApp({ initialTab = "dashboard" }: ChainOfCommandMasterAppProps) {
  const pathname = usePathname();
  const [matters, setMatters] = useState<Matter[]>(INITIAL_MATTERS);
  const [activeMatter, setActiveMatter] = useState<Matter>(INITIAL_MATTERS[0]);
  const [agents, setAgents] = useState<SpecialistAgent[]>(SPECIALIST_AGENTS_ROSTER);
  const [timeline, setTimeline] = useState<TimelineRecord[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);
  const [jurisdiction, setJurisdiction] = useState<string>("Indiana");

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
      const loaded = await loadMatters();
      if (loaded && loaded.length > 0) {
        setMatters(loaded);
        setActiveMatter(loaded[0]);
        setJurisdiction(loaded[0].jurisdiction || "Indiana");
      }
      setAgents(loadAgents());
    }
    initData();
  }, []);

  useEffect(() => {
    if (activeMatter) {
      setTimeline(loadTimeline(activeMatter.id));
      setEvidence(loadEvidence(activeMatter.id));
      if (activeMatter.jurisdiction) {
        setJurisdiction(activeMatter.jurisdiction);
      }
    }
  }, [activeMatter.id]);

  const handleSelectMatter = (m: Matter) => {
    setActiveMatter(m);
    setTimeline(loadTimeline(m.id));
    setEvidence(loadEvidence(m.id));
    if (m.jurisdiction) setJurisdiction(m.jurisdiction);
  };

  const handleSaveMatter = async (updated: Matter) => {
    setActiveMatter(updated);
    setMatters((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    await saveMatter(updated);
  };

  const handleUpdateAgent = (updated: SpecialistAgent) => {
    const newAgents = agents.map((a) => (a.id === updated.id ? updated : a));
    setAgents(newAgents);
    saveAgents(newAgents);
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
      courtName: newMatterCourt.trim() || "Superior Court of California / Indiana",
      jurisdiction: jurisdiction,
      judge: newMatterJudge.trim() || "Hon. Presiding Magistrate",
      prosecutor: "Office of the District Attorney",
      defenseStatus: "Self-Represented (Pro Se)",
      status: "active",
      nextCourtDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      nextCourtType: "Initial Case Management & Discovery Review",
      speedyTrialDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      summary: newMatterSummary.trim() || "Pro se litigation matter opened in Chain of Command.",
      charges: [
        {
          id: `ch-${Date.now()}`,
          statute: "Penal Code § 100",
          title: "Preliminary Charged Allegation",
          level: "Misdemeanor Class A",
          allegedDate: new Date().toISOString().split("T")[0],
          statutoryMaxPenalty: "1 year; $1,000 fine",
          statutoryMinPenalty: "Probation eligible",
          elements: [
            {
              name: "Statutory Allegation",
              description: "Alleged conduct requiring proof beyond reasonable doubt.",
              stateProofStatus: "Contested",
            },
          ],
        },
      ],
    };

    await saveMatter(newM);
    setMatters((prev) => [newM, ...prev]);
    setActiveMatter(newM);
    setShowNewMatterModal(false);
    setNewMatterTitle("");
    setNewMatterCaseNumber("");
    setNewMatterCourt("");
    setNewMatterJudge("");
    setNewMatterSummary("");
    setActiveTab("docket");
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#E1E2E5] flex flex-col font-sans selection:bg-[#D4AF37]/30">
      {/* Header */}
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
          <ChambersView
            agents={agents}
            matter={activeMatter}
            onUpdateAgent={handleUpdateAgent}
          />
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

        {activeTab === "directory" && <DirectoryView />}

        {activeTab === "tasks" && <TasksDeadlinesView matter={activeMatter} />}

        {activeTab === "audit" && <TasksDeadlinesView matter={activeMatter} />}

        {activeTab === "archive" && <DesignArchiveView />}
      </section>

      {/* Universal Mandatory Legal Footer Disclaimer (GEMINI.md Rule 5.B) */}
      <footer className="border-t border-[#1F2026] bg-[#0A0B0E] py-4 px-6 text-center text-xs text-neutral-500 font-sans mt-auto">
        <div className="max-w-4xl mx-auto">
          <p className="leading-relaxed">
            This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation.
          </p>
          <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-neutral-600 font-mono">
            <span>Chain of Command Legal OS</span>
            <span>·</span>
            <span>Pro Se Workspace</span>
            <span>·</span>
            <span>Zero Hallucination Protocol Active</span>
          </div>
        </div>
      </footer>

      {/* Open New Legal Matter Modal */}
      {showNewMatterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141519] border border-[#2A2B35] rounded-xl max-w-lg w-full p-6 text-neutral-200 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-1">Open New Legal Matter Workspace</h3>
            <p className="text-xs text-neutral-400 mb-4">Initialize a dedicated case folder for self-representation.</p>

            <form onSubmit={handleCreateNewMatter} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Case Caption / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State v. Smith or People v. Johnson"
                  value={newMatterTitle}
                  onChange={(e) => setNewMatterTitle(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Case Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24-CR-008412"
                    value={newMatterCaseNumber}
                    onChange={(e) => setNewMatterCaseNumber(e.target.value)}
                    className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Presiding Judge</label>
                  <input
                    type="text"
                    placeholder="e.g. Hon. Arthur Miller"
                    value={newMatterJudge}
                    onChange={(e) => setNewMatterJudge(e.target.value)}
                    className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Court Name</label>
                <input
                  type="text"
                  placeholder="e.g. Superior Court of California, County of Los Angeles"
                  value={newMatterCourt}
                  onChange={(e) => setNewMatterCourt(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Case Summary / Allegations</label>
                <textarea
                  rows={2}
                  placeholder="Summary of factual dispute, charges, or defense posture..."
                  value={newMatterSummary}
                  onChange={(e) => setNewMatterSummary(e.target.value)}
                  className="w-full bg-[#101114] border border-[#2A2B35] rounded-md p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#23242B] mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewMatterModal(false)}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold rounded-md text-xs"
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
