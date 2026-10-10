"use client";

import React, { useState, useEffect } from "react";
import { SAMPLE_SESSIONS } from "@/lib/vericue-data";
import { SessionAnalysis, ReviewerSignOff } from "@/lib/vericue-types";
import { DisclosureGate } from "./DisclosureGate";
import { PersistentDisclosureBanner } from "./PersistentDisclosureBanner";
import { VeriCueHeader, VeriCueTab } from "./VeriCueHeader";
import { HomeDashboard } from "./HomeDashboard";
import { NewAnalysisView } from "./NewAnalysisView";
import { LiveAnalysisView } from "./LiveAnalysisView";
import { SmartGlassesView } from "./SmartGlassesView";
import { ResultsDetailView } from "./ResultsDetailView";
import { CueBreakdownView } from "./CueBreakdownView";
import { ReportsReviewerView } from "./ReportsReviewerView";
import { ProfitModelView } from "./ProfitModelView";
import { EvaluationCalibrationView } from "./EvaluationCalibrationView";
import { ModelCenterView } from "./ModelCenterView";
import { DatasetGovernanceView } from "./DatasetGovernanceView";
import { SettingsComplianceView } from "./SettingsComplianceView";

interface VeriCueMasterAppProps {
  initialTab?: VeriCueTab;
}

export function VeriCueMasterApp({ initialTab = "home" }: VeriCueMasterAppProps) {
  const [hasConsented, setHasConsented] = useState<boolean>(true); // Start true then verify client-side to avoid SSR flash
  const [activeTab, setActiveTab] = useState<VeriCueTab>(initialTab);
  const [sessions, setSessions] = useState<SessionAnalysis[]>(SAMPLE_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(SAMPLE_SESSIONS[0].id);

  // Check consent gate in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vericue_consent_gate_v2");
      if (!stored) {
        setHasConsented(false);
      }
    }
  }, []);

  const handleConsentAccepted = () => {
    setHasConsented(true);
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActiveTab("results");
  };

  const handleSessionCreated = (newSession: SessionAnalysis) => {
    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
    setActiveTab("results");
  };

  const handleSignOffSession = (sessionId: string, signOff: ReviewerSignOff) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            reviewerSignOff: signOff,
            exportLocked: false, // Unlocks PDF export
            status: "completed",
          };
        }
        return s;
      })
    );
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  return (
    <div className="min-h-screen bg-[#0A0C12] text-[#E1E2E5] flex flex-col font-sans selection:bg-amber-500/30 selection:text-white">
      {/* Blocking Disclosure & Consent Gate if not yet accepted */}
      {!hasConsented && <DisclosureGate onAccept={handleConsentAccepted} />}

      {/* Mandatory Regulatory Header Banner (Blueprint §9 & §10) */}
      <PersistentDisclosureBanner />

      {/* Main App Navigation Header */}
      <VeriCueHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedSessionTitle={activeTab === "results" ? selectedSession?.title : undefined}
      />

      {/* Workspace Views */}
      <main className="flex-1 pb-16">
        {activeTab === "home" && (
          <HomeDashboard
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "new_analysis" && (
          <NewAnalysisView onSessionCreated={handleSessionCreated} />
        )}

        {activeTab === "live_mode" && <LiveAnalysisView />}

        {activeTab === "smart_glasses" && <SmartGlassesView />}

        {activeTab === "results" && (
          <ResultsDetailView
            session={selectedSession}
            onOpenReviewModal={() => setActiveTab("reports")}
          />
        )}

        {activeTab === "cue_breakdown" && <CueBreakdownView />}

        {activeTab === "reports" && (
          <ReportsReviewerView
            sessions={sessions}
            onSignOffSession={handleSignOffSession}
          />
        )}

        {activeTab === "profit_model" && <ProfitModelView />}

        {activeTab === "calibration" && <EvaluationCalibrationView />}

        {activeTab === "model_center" && <ModelCenterView />}

        {activeTab === "governance" && <DatasetGovernanceView />}

        {activeTab === "settings" && <SettingsComplianceView />}
      </main>

      {/* Compact Global Footer */}
      <footer className="border-t border-[#1C202E] bg-[#0E1017] px-6 py-4 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VeriCue AI v2.0 · Multimodal Deception-Risk Triage Platform</span>
          <span className="text-amber-400/80">
            Probability Estimates with Uncertainty Bounds · Human Review Recommended
          </span>
        </div>
      </footer>
    </div>
  );
}
