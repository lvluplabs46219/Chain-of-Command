"use client";

import React, { useState } from "react";
import {
  Scale,
  AlertTriangle,
  HelpCircle,
  FileText,
  Shield,
  X,
  Printer,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Matter } from "@/lib/workspace-data";

interface PleaDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  matter: Matter;
}

export function PleaDecisionModal({ isOpen, onClose, matter }: PleaDecisionModalProps) {
  const [activeTab, setActiveTab] = useState<"factors" | "questions" | "missing">("factors");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#141519] border border-[#2B2D3A] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl my-8">
        {/* Header Warning */}
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2 font-mono uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>[NEUTRAL PLEA DECISION ASSISTANT - STRICTLY EDUCATIONAL - NEVER ADVISES ACCEPTANCE OR REJECTION]</span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Title & Navigation */}
        <div className="p-6 border-b border-[#23242B] bg-[#171821]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40">
                  Plea Assessment Framework
                </span>
                <span className="text-xs text-neutral-400">Matter: {matter.caseNumber}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Structured Decision Analysis Board
              </h2>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-[#222430] hover:bg-[#2B2D3C] text-xs font-semibold text-neutral-200 border border-[#323546] flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Print Counsel Worksheet</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab("factors")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "factors"
                  ? "bg-[#D4AF37] text-neutral-950 font-bold"
                  : "bg-[#1E202B] text-neutral-300 hover:bg-[#262836]"
              }`}
            >
              Option Space & Collateral Risks
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "questions"
                  ? "bg-[#D4AF37] text-neutral-950 font-bold"
                  : "bg-[#1E202B] text-neutral-300 hover:bg-[#262836]"
              }`}
            >
              Questions to Ask Your Defense Attorney
            </button>
            <button
              onClick={() => setActiveTab("missing")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "missing"
                  ? "bg-[#D4AF37] text-neutral-950 font-bold"
                  : "bg-[#1E202B] text-neutral-300 hover:bg-[#262836]"
              }`}
            >
              Missing Discovery & Evidentiary Gaps
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-neutral-300 leading-relaxed">
          {activeTab === "factors" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Entering a Plea Agreement */}
                <div className="bg-[#181922] border border-[#2B2D3A] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2B2D3A]">
                    <span className="font-bold text-sm text-white">Path A: Plea Agreement Consideration</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-800/40">
                      Predictable Outcome
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="font-semibold text-neutral-200">Potential Procedural Upsides:</div>
                      <p className="text-neutral-400 mt-0.5">
                        Known sentencing cap or diversion; elimination of trial uncertainty; potential reduction of felony tier to misdemeanor.
                      </p>
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-200">Irreversible Rights Forfeitures:</div>
                      <p className="text-neutral-400 mt-0.5">
                        Waives right to jury trial, right to cross-examine accusers, right against self-incrimination, and nearly all appellate challenges to search legality.
                      </p>
                    </div>
                    <div className="p-2.5 bg-red-950/30 border border-red-800/40 rounded-lg">
                      <div className="font-semibold text-red-300">Collateral Civil Consequences:</div>
                      <p className="text-red-200/80 mt-0.5 text-[11px]">
                        Criminal record, potential employment exclusions, housing application restrictions, professional license suspension, firearm prohibition (if felony).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Option 2: Proceeding to Trial / Motion to Suppress */}
                <div className="bg-[#181922] border border-[#2B2D3A] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2B2D3A]">
                    <span className="font-bold text-sm text-white">Path B: Trial / Motion to Suppress</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                      Full Constitutional Defense
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="font-semibold text-neutral-200">Potential Procedural Upsides:</div>
                      <p className="text-neutral-400 mt-0.5">
                        Preserves right to challenge warrantless stop; potential complete suppression of evidence or acquittal on all counts.
                      </p>
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-200">Exposure & Uncertainty Risks:</div>
                      <p className="text-neutral-400 mt-0.5">
                        If convicted after trial, judge has discretion up to statutory maximum (up to 2.5 years on Level 6 Felony); trial preparation costs and prolonged stress.
                      </p>
                    </div>
                    <div className="p-2.5 bg-blue-950/30 border border-blue-800/40 rounded-lg">
                      <div className="font-semibold text-blue-300">Speedy Trial Considerations:</div>
                      <p className="text-blue-200/80 mt-0.5 text-[11px]">
                        Indiana Rule 4(B) requires state trial within 70 days unless defendant requests continuances. Current days remaining: {matter.speedyTrialDaysRemaining} days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="space-y-3">
              <p className="text-neutral-400">
                Take these specific, legally-grounded questions to your public defender or retained attorney to clarify
                your strategic posture:
              </p>
              <div className="space-y-2.5">
                {[
                  "What is the statistical likelihood that our Motion to Suppress the initial traffic stop will be granted under Terry v. Ohio and Indiana Article 1 § 11?",
                  "Does the state's proposed agreement include an explicit waiver of my right to appeal the court's suppression ruling?",
                  "Can the Level 6 Felony Resisting count be reduced to a Class A Misdemeanor pursuant to Indiana alternative misdemeanor sentencing (Ind. Code § 35-50-2-7)?",
                  "If this charge remains on my record, how many years must elapse before I become eligible for expungement under Ind. Code § 35-38-9?",
                  "Has the prosecutor reviewed the full unedited CAD dispatch audio (CAD-901) confirming the lack of reasonable suspicion before the stop?",
                  "What are the specific probation reporting requirements, drug testing terms, and community service conditions attached to this proposed agreement?",
                ].map((q, idx) => (
                  <div key={idx} className="p-3 bg-[#181922] border border-[#2B2D3A] rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold flex items-center justify-center shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <p className="text-white text-xs leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "missing" && (
            <div className="space-y-3">
              <p className="text-neutral-400">
                You should never decide on a plea without access to mandatory discovery. The following critical materials
                must be verified:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#181922] border border-[#2B2D3A] rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Officer Miller Body Camera (BWC-04)</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Status: Received & reviewed. Corroborates lack of violent struggle.
                  </p>
                </div>

                <div className="p-3.5 bg-[#181922] border border-amber-800/40 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Secondary Officer Cruiser Dashcam Video</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Status: Missing from initial production. Formal motion to compel discovery pending.
                  </p>
                </div>

                <div className="p-3.5 bg-[#181922] border border-amber-800/40 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>911 Anonymous Caller Audio Recording</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Status: Only dispatch CAD log received; raw audio recording not yet furnished.
                  </p>
                </div>

                <div className="p-3.5 bg-[#181922] border border-[#2B2D3A] rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Arrest Narrative & Probable Cause Affidavit</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Status: Received. Identified factual contradictions with video timestamps.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#23242B] bg-[#111216] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-neutral-500" />
            <span>Chain of Command never tells you what choice to make. You hold absolute agency.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-bold rounded-lg transition-colors"
          >
            Done Reviewing Factors
          </button>
        </div>
      </div>
    </div>
  );
}
