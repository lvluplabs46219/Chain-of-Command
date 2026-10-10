"use client";

import React, { useState } from "react";
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Volume2,
  Clock,
  Sparkles,
  ArrowRight,
  Lock,
  Download,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SessionAnalysis, StatementAnalysis, DeceptionBand } from "@/lib/vericue-types";
import { SCORE_BANDS, getBandForScore } from "@/lib/vericue-data";
import { MANDATORY_DISCLOSURE_BANNER } from "@/lib/sanitizer";

interface ResultsDetailViewProps {
  session: SessionAnalysis;
  onOpenReviewModal: () => void;
  onSelectStatement?: (statementId: string) => void;
}

export function ResultsDetailView({
  session,
  onOpenReviewModal,
  onSelectStatement,
}: ResultsDetailViewProps) {
  const [selectedStatementId, setSelectedStatementId] = useState<string>(
    session.statements[1]?.id || session.statements[0]?.id || ""
  );
  const [bandFilter, setBandFilter] = useState<string>("all");

  const overallBand = getBandForScore(session.overallProbability);

  const selectedStatement =
    session.statements.find((s) => s.id === selectedStatementId) || session.statements[0];

  const filteredStatements = session.statements.filter((s) => {
    if (bandFilter === "all") return true;
    return s.band === bandFilter;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-[#E1E2E5]">
      {/* Session Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232636] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              Session Assessment (§5 Page 13 & 14)
            </span>
            {session.caseRef && (
              <span className="text-xs font-mono text-neutral-400">Ref: {session.caseRef}</span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {session.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Subject: <strong className="text-neutral-200">{session.subjectName}</strong> · Date: {session.date} · Duration: {session.durationFormatted}
          </p>
        </div>

        {/* Export / Review Gate Button */}
        <div className="flex items-center gap-3">
          {session.exportLocked && !session.reviewerSignOff?.signedOff ? (
            <button
              onClick={onOpenReviewModal}
              className="px-4 py-2.5 rounded-xl bg-orange-500/15 border border-orange-500/40 text-orange-300 hover:bg-orange-500/25 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Reviewer Sign-off Required to Export</span>
            </button>
          ) : (
            <button
              onClick={onOpenReviewModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-emerald-500/25 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Reviewer Certified · Export PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Verdict Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Overall Score Gauge Card (4 cols) */}
        <div className="md:col-span-4 bg-[#12141D] border border-[#232636] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-mono uppercase text-neutral-400">Composite Deception-Risk Estimate</span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-extrabold font-mono text-white">
                {session.overallProbability}%
              </span>
              <div className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${overallBand.badgeColor}`}>
                {overallBand.label}
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Action: <span className="text-neutral-200">{overallBand.actionRequired}</span>
            </p>
          </div>

          <div className="pt-3 border-t border-[#202330] grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-neutral-500 text-[10px] block">MODEL CONFIDENCE</span>
              <span className="text-white font-semibold">{Math.round(session.overallConfidence * 100)}%</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">DATA QUALITY</span>
              <span className="text-emerald-400 font-semibold">{Math.round(session.overallDataQuality * 100)}% SNR</span>
            </div>
          </div>
        </div>

        {/* Data Quality & Baseline Notes (8 cols) */}
        <div className="md:col-span-8 bg-[#12141D] border border-[#232636] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#202330] pb-2">
            <h3 className="text-sm font-semibold text-white">Multimodal Pipeline Telemetry</h3>
            <span className="text-[11px] font-mono text-neutral-400">{session.modelVersion}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#161824] border border-[#252838]">
              <span className="text-neutral-400 text-[10px] font-mono block">AUDIO & VIDEO QUALITY</span>
              <p className="text-neutral-200 mt-1 font-medium leading-snug">
                {session.dataQualitySummary}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#161824] border border-[#252838]">
              <span className="text-neutral-400 text-[10px] font-mono block">SUBJECT BASELINE CALIBRATION</span>
              <p className="text-neutral-200 mt-1 font-medium leading-snug">
                Baseline: {session.speakerBaseline?.averageSpeechRateWpm || 154} WPM, {session.speakerBaseline?.averagePitchHz || 122} Hz F0.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#161824] border border-[#252838]">
              <span className="text-neutral-400 text-[10px] font-mono block">CALIBRATION SCORE</span>
              <p className="text-neutral-200 mt-1 font-medium leading-snug">
                Brier Score: <strong className="text-amber-400 font-mono">0.114</strong> (Isotonic curve applied).
              </p>
            </div>
          </div>

          {/* Mandatory Disclosure Banner Directly on Page (§13) */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/25 text-[11px] text-amber-300/90 leading-relaxed">
            <strong>Mandatory Legal Disclosure:</strong> {MANDATORY_DISCLOSURE_BANNER}
          </div>
        </div>
      </div>

      {/* Statement Explorer: Statement List (Left) vs Answer Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Statement List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Statements ({session.statements.length})</h3>
            {/* Filter */}
            <select
              value={bandFilter}
              onChange={(e) => setBandFilter(e.target.value)}
              className="px-2 py-1 rounded-lg bg-[#141722] border border-[#25293A] text-[11px] text-neutral-300 focus:outline-none"
            >
              <option value="all">All Bands</option>
              <option value="high">High Only (81-100%)</option>
              <option value="elevated">Elevated Only (61-80%)</option>
              <option value="indeterminate">Indeterminate (31-60%)</option>
              <option value="low">Low Only (0-30%)</option>
            </select>
          </div>

          <div className="space-y-2">
            {filteredStatements.map((stmt) => {
              const bandConfig = getBandForScore(stmt.probabilityScore);
              const isSelected = stmt.id === selectedStatementId;
              return (
                <div
                  key={stmt.id}
                  onClick={() => {
                    setSelectedStatementId(stmt.id);
                    if (onSelectStatement) onSelectStatement(stmt.id);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1B1F2E] border-amber-500/50 shadow-md"
                      : "bg-[#131622] border-[#222534] hover:bg-[#161926] hover:border-[#31364A]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
                    <span>
                      #{stmt.statementIndex} · [{stmt.timestampStart} - {stmt.timestampEnd}]
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${bandConfig.badgeColor}`}>
                      {stmt.probabilityScore}% {bandConfig.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 line-clamp-2 leading-relaxed font-sans">
                    "{stmt.transcript}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Answer Detail (§5 Page 14) (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedStatement ? (
            <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#202330] pb-3 gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    Statement #{selectedStatement.statementIndex} Detail
                  </span>
                  <div className="text-xs text-neutral-400 mt-1 font-mono">
                    Timestamp: {selectedStatement.timestampStart} - {selectedStatement.timestampEnd} ({selectedStatement.speaker})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono text-neutral-400">Deception-Risk</div>
                  <div className="text-xl font-bold font-mono text-white">
                    {selectedStatement.probabilityScore}%
                  </div>
                </div>
              </div>

              {/* Verbatim Transcript */}
              <div className="p-4 rounded-xl bg-[#161924] border border-[#262A3C] space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Verbatim Transcript Segment
                </span>
                <p className="text-sm text-white font-medium italic leading-relaxed">
                  "{selectedStatement.transcript}"
                </p>
              </div>

              {/* Baseline Deltas Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#161824] border border-[#252838]">
                  <span className="text-[10px] text-neutral-500 block">SPEECH RATE</span>
                  <span className={`font-semibold ${selectedStatement.baselineDeltas.speechRateDeltaPercent < -15 ? "text-orange-400" : "text-white"}`}>
                    {selectedStatement.baselineDeltas.speechRateDeltaPercent > 0 ? "+" : ""}
                    {selectedStatement.baselineDeltas.speechRateDeltaPercent}%
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#161824] border border-[#252838]">
                  <span className="text-[10px] text-neutral-500 block">PITCH DELTA</span>
                  <span className={`font-semibold ${selectedStatement.baselineDeltas.pitchDeviationHz > 15 ? "text-orange-400" : "text-white"}`}>
                    +{selectedStatement.baselineDeltas.pitchDeviationHz} Hz
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#161824] border border-[#252838]">
                  <span className="text-[10px] text-neutral-500 block">LATENCY</span>
                  <span className="font-semibold text-white">
                    {selectedStatement.baselineDeltas.responseLatencySeconds}s
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#161824] border border-[#252838]">
                  <span className="text-[10px] text-neutral-500 block">CONFIDENCE</span>
                  <span className="font-semibold text-white">
                    {Math.round(selectedStatement.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Detected Cues Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Triggered Cues ({selectedStatement.cues.length})
                </h4>

                {selectedStatement.cues.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No elevated cues detected in this segment.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStatement.cues.map((cue, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#161924] border border-[#252838] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{cue.name}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              cue.strength === "strong_evidence"
                                ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                                : "bg-neutral-800 border-neutral-700 text-neutral-300"
                            }`}
                          >
                            {cue.strength === "strong_evidence" ? "Strong Empirical Evidence" : "Weak Heuristic Signal"}
                          </span>
                        </div>
                        {cue.evidenceQuote && (
                          <p className="text-xs text-amber-300/90 font-mono">
                            Excerpt: {cue.evidenceQuote}
                          </p>
                        )}
                        <p className="text-xs text-neutral-300 leading-normal">
                          {cue.observationNote}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detailed Synthesis */}
              <div className="space-y-1 pt-2 border-t border-[#202330]">
                <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                  Objective Behavioral Explanation
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {selectedStatement.explanation}
                </p>
              </div>

              {/* Follow-Up Questions */}
              {selectedStatement.suggestedFollowUpQuestions && selectedStatement.suggestedFollowUpQuestions.length > 0 && (
                <div className="p-3 rounded-xl bg-[#161924] border border-[#282D40] space-y-1">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                    Suggested Clarifying Inquiries:
                  </span>
                  <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
                    {selectedStatement.suggestedFollowUpQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-neutral-400 bg-[#12141D] rounded-2xl border border-[#232636]">
              Select a statement on the left to inspect detailed cues.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
