"use client";

import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  Share2,
  UserCheck,
  FileBadge,
  Sparkles,
} from "lucide-react";
import { SessionAnalysis, ReviewerSignOff } from "@/lib/vericue-types";
import { SCORE_BANDS, getBandForScore } from "@/lib/vericue-data";
import { MANDATORY_DISCLOSURE_BANNER } from "@/lib/sanitizer";

interface ReportsReviewerViewProps {
  sessions: SessionAnalysis[];
  onSignOffSession: (sessionId: string, signOff: ReviewerSignOff) => void;
}

export function ReportsReviewerView({
  sessions,
  onSignOffSession,
}: ReportsReviewerViewProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || "");
  const [showSignOffModal, setShowSignOffModal] = useState(false);

  // Sign-off modal state
  const [reviewerName, setReviewerName] = useState("David M. Sterling, Esq. (Certified Reviewer)");
  const [licenseOrRole, setLicenseOrRole] = useState("CFE #48201 · Senior SIU Investigator");
  const [organization, setOrganization] = useState("North American Fraud Review Services");
  const [concurrence, setConcurrence] = useState<ReviewerSignOff["concurrence"]>("concurs");
  const [reviewNotes, setReviewNotes] = useState(
    "Cross-referenced statement #2 and #3 against the verified tollway transponder records. The external mismatch on vehicle movement confirms the automated cue elevation. Independent human review concludes elevated inconsistency."
  );

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const overallBand = selectedSession ? getBandForScore(selectedSession.overallProbability) : SCORE_BANDS.low;
  const isLocked = selectedSession?.exportLocked && !selectedSession?.reviewerSignOff?.signedOff;

  const handleExecuteSignOff = () => {
    if (!selectedSession) return;
    const signOff: ReviewerSignOff = {
      signedOff: true,
      reviewerId: `rev-${Date.now()}`,
      reviewerName,
      licenseOrRole,
      organization,
      timestamp: new Date().toISOString(),
      notes: reviewNotes,
      concurrence,
      certificationCode: `CERT-VC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`,
    };
    onSignOffSession(selectedSession.id, signOff);
    setShowSignOffModal(false);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-[#E1E2E5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232636] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              Audit & Review Gate (§5 Page 17 & 18)
            </span>
            <span className="text-xs text-neutral-400">Compliance & Certified PDF Deliverables</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Formal Report Generation & Human Reviewer Sign-Off
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Elevated and High risk band reports are locked until certified human reviewer concurrence is logged.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isLocked ? (
            <button
              onClick={() => setShowSignOffModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-semibold text-xs flex items-center gap-2 hover:bg-amber-400 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign Off as Certified Reviewer</span>
            </button>
          ) : (
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-neutral-950 font-semibold text-xs flex items-center gap-2 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Certified PDF Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Session Selector vs Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Session Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">Select Report to Audit</h2>
          <div className="space-y-2">
            {sessions.map((s) => {
              const band = getBandForScore(s.overallProbability);
              const isSelected = s.id === selectedSessionId;
              const hasSignedOff = s.reviewerSignOff?.signedOff;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSessionId(s.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#181B28] border-amber-500/50 shadow-md"
                      : "bg-[#12141D] border-[#222534] hover:bg-[#161924]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
                    <span>{s.date}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${band.badgeColor}`}>
                      {band.label} ({s.overallProbability}%)
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white line-clamp-1">{s.title}</div>
                  <div className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
                    <span>Subject: {s.subjectName}</span>
                    {s.exportLocked && !hasSignedOff ? (
                      <span className="text-orange-400 flex items-center gap-1 font-mono text-[10px]">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                        <FileBadge className="w-3 h-3" /> Certified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: PDF Report Sheet Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSession && (
            <div className="bg-[#12141D] border border-[#262A3C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
              {/* Report Header Stamp */}
              <div className="border-b-2 border-neutral-700 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    VERICUE AI · OFFICIAL PROBABILISTIC ASSESSMENT REPORT
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {selectedSession.title}
                  </h2>
                  <div className="text-xs text-neutral-400 mt-1 font-mono">
                    Case Ref: {selectedSession.caseRef || "N/A"} · Media Duration: {selectedSession.durationFormatted}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono text-neutral-400">MODEL ENSEMBLE</div>
                  <div className="text-xs font-bold font-mono text-white">v2.4.1 ISOTONIC</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Brier Score: 0.114</div>
                </div>
              </div>

              {/* Status Banner */}
              {isLocked ? (
                <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/40 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-orange-300">
                      Report Export Locked — Elevated / High Indicators Flagged
                    </h3>
                    <p className="text-xs text-orange-200/80 mt-1">
                      Per VeriCue Non-Negotiable Guardrails (§10), automated elevated risk scores cannot be issued as final deliverables without verified sign-off by a certified human investigator.
                    </p>
                  </div>
                </div>
              ) : selectedSession.reviewerSignOff?.signedOff ? (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-emerald-300">
                      Certified Reviewer Sign-Off Stamp Applied
                    </div>
                    <div className="text-neutral-300 font-mono text-[11px]">
                      Reviewer: {selectedSession.reviewerSignOff.reviewerName} ({selectedSession.reviewerSignOff.licenseOrRole})
                    </div>
                    <div className="text-neutral-400 text-[10px]">
                      Timestamp: {selectedSession.reviewerSignOff.timestamp} · Code: {selectedSession.reviewerSignOff.certificationCode}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Executive Assessment Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#161824] border border-[#252838] font-mono text-xs">
                <div>
                  <span className="text-neutral-400 text-[10px] block">ESTIMATED DECEPTION RISK</span>
                  <span className="text-xl font-bold text-white">{selectedSession.overallProbability}%</span>
                  <span className={`text-[11px] block font-sans font-semibold ${overallBand.textColor}`}>
                    {overallBand.label}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-400 text-[10px] block">MODEL CONFIDENCE</span>
                  <span className="text-xl font-bold text-white">{Math.round(selectedSession.overallConfidence * 100)}%</span>
                  <span className="text-[10px] text-neutral-400 block font-sans">High Statistical Signal</span>
                </div>

                <div>
                  <span className="text-neutral-400 text-[10px] block">DATA QUALITY RATING</span>
                  <span className="text-xl font-bold text-emerald-400">{Math.round(selectedSession.overallDataQuality * 100)}%</span>
                  <span className="text-[10px] text-neutral-400 block font-sans">Studio SNR Standard</span>
                </div>
              </div>

              {/* Statement-by-Statement Findings */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
                  Statement Findings & Cue Highlights
                </h3>

                <div className="space-y-2">
                  {selectedSession.statements.map((stmt) => {
                    const band = getBandForScore(stmt.probabilityScore);
                    return (
                      <div
                        key={stmt.id}
                        className="p-3.5 rounded-xl bg-[#151722] border border-[#232636] space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
                          <span>Statement #{stmt.statementIndex} · [{stmt.timestampStart}]</span>
                          <span className={`px-1.5 py-0.5 rounded font-semibold border ${band.badgeColor}`}>
                            {stmt.probabilityScore}% {band.label}
                          </span>
                        </div>
                        <p className="text-white italic">"{stmt.transcript}"</p>
                        <p className="text-neutral-300 text-[11px] leading-relaxed pt-1">
                          {stmt.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviewer Notes Section */}
              {selectedSession.reviewerSignOff?.signedOff && (
                <div className="p-4 rounded-xl bg-[#151722] border border-[#252838] space-y-2 text-xs">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                    Independent Certified Reviewer Analysis
                  </span>
                  <p className="text-neutral-200 leading-relaxed font-sans">
                    "{selectedSession.reviewerSignOff.notes}"
                  </p>
                </div>
              )}

              {/* Mandatory Regulatory Footer */}
              <div className="pt-4 border-t border-[#232636] text-[10px] text-neutral-400 leading-relaxed space-y-1">
                <span className="font-bold text-neutral-300 block">Universal Regulatory & Compliance Notice (§9):</span>
                <p>{MANDATORY_DISCLOSURE_BANNER}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviewer Sign-Off Modal */}
      {showSignOffModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0B0E]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#131622] border border-[#282D42] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#222636] pb-3">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white">Certified Human Reviewer Sign-Off</h3>
                <p className="text-xs text-neutral-400">Log professional concurrence to unlock PDF export.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Reviewer Full Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B28] border border-[#2B3044] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">License, Certification or Role</label>
                <input
                  type="text"
                  value={licenseOrRole}
                  onChange={(e) => setLicenseOrRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B28] border border-[#2B3044] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Concurrence Assessment</label>
                <select
                  value={concurrence}
                  onChange={(e) => setConcurrence(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B28] border border-[#2B3044] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="concurs">Concur with Automated Elevated Indicators</option>
                  <option value="adjusted_downward">Adjust Downward (Benign Stress / Anxiety Explained)</option>
                  <option value="flagged_inconclusive">Flag as Inconclusive / Indeterminate</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Investigator Audit Notes</label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B28] border border-[#2B3044] text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#222636]">
              <button
                onClick={() => setShowSignOffModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1A1E2C] border border-[#2A2E40] text-neutral-300 hover:bg-[#202538] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteSignOff}
                className="px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 text-xs font-semibold cursor-pointer shadow-md shadow-amber-500/20"
              >
                Apply Stamp & Unlock Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
