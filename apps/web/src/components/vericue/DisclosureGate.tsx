"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, Lock, CheckCircle2 } from "lucide-react";

interface DisclosureGateProps {
  onAccept: () => void;
}

export function DisclosureGate({ onAccept }: DisclosureGateProps) {
  const [checkedItems, setCheckedItems] = useState({
    cannotProve: false,
    mayBeWrong: false,
    notSoleBasis: false,
    hasConsent: false,
    wiretapLaws: false,
    noSurveillance: false,
  });

  const allChecked =
    checkedItems.cannotProve &&
    checkedItems.mayBeWrong &&
    checkedItems.notSoleBasis &&
    checkedItems.hasConsent &&
    checkedItems.wiretapLaws &&
    checkedItems.noSurveillance;

  const handleCheckboxChange = (key: keyof typeof checkedItems) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirm = () => {
    if (!allChecked) return;
    const consentPayload = {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: "v2.0-authoritative",
      statementsAccepted: Object.keys(checkedItems),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("vericue_consent_gate_v2", JSON.stringify(consentPayload));
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B0E]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-2xl w-full bg-[#12141A] border border-[#252836] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-[#232636] pb-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Ethical & Legal Compliance Gate
              </span>
              <span className="text-xs text-neutral-400">VeriCue Blueprint §5 Page 3</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mt-1">
              Mandatory Consent & Limitations Disclosure
            </h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              VeriCue AI provides probability-based behavioral cue triage — never definitive proof of deception.
              To access the workspace, you must explicitly confirm each required compliance statement below.
            </p>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Non-Negotiable Positioning:</strong> This system does not declare truth, intent, or guilt. Results are affected by anxiety, neurodivergence, culture, and data quality. Covert or non-consensual surveillance is strictly prohibited by terms of service and applicable law.
          </span>
        </div>

        {/* Six Required Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#252836] bg-[#161822] hover:bg-[#1a1d29] cursor-pointer transition-colors group">
            <input
              type="checkbox"
              checked={checkedItems.cannotProve}
              onChange={() => handleCheckboxChange("cannotProve")}
              className="mt-0.5 h-4 w-4 rounded border-[#383C4E] text-amber-500 focus:ring-amber-500 bg-[#0F1117]"
            />
            <span className="text-xs text-neutral-200 leading-snug">
              <strong className="text-white block font-medium">1. Probabilistic Analysis, Not Proof</strong>
              I understand this app cannot prove someone is lying, dishonest, or deceptive with certainty.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#252836] bg-[#161822] hover:bg-[#1a1d29] cursor-pointer transition-colors group">
            <input
              type="checkbox"
              checked={checkedItems.mayBeWrong}
              onChange={() => handleCheckboxChange("mayBeWrong")}
              className="mt-0.5 h-4 w-4 rounded border-[#383C4E] text-amber-500 focus:ring-amber-500 bg-[#0F1117]"
            />
            <span className="text-xs text-neutral-200 leading-snug">
              <strong className="text-white block font-medium">2. False Positive & Uncertainty Awareness</strong>
              I understand results may be wrong, incomplete, or affected by environmental noise, anxiety, or fatigue.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#252836] bg-[#161822] hover:bg-[#1a1d29] cursor-pointer transition-colors group">
            <input
              type="checkbox"
              checked={checkedItems.notSoleBasis}
              onChange={() => handleCheckboxChange("notSoleBasis")}
              className="mt-0.5 h-4 w-4 rounded border-[#383C4E] text-amber-500 focus:ring-amber-500 bg-[#0F1117]"
            />
            <span className="text-xs text-neutral-200 leading-snug">
              <strong className="text-white block font-medium">3. Prohibition on Sole-Basis Decision Making</strong>
              I will not use this tool as the sole basis for employment, credit, housing, legal, or other life-altering decisions.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#252836] bg-[#161822] hover:bg-[#1a1d29] cursor-pointer transition-colors group">
            <input
              type="checkbox"
              checked={checkedItems.hasConsent}
              onChange={() => handleCheckboxChange("hasConsent")}
              className="mt-0.5 h-4 w-4 rounded border-[#383C4E] text-amber-500 focus:ring-amber-500 bg-[#0F1117]"
            />
            <span className="text-xs text-neutral-200 leading-snug">
              <strong className="text-white block font-medium">4. Explicit Subject Consent</strong>
              I have obtained proper consent to record, transcribe, and analyze the individual whose media is processed.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#252836] bg-[#161822] hover:bg-[#1a1d29] cursor-pointer transition-colors group">
            <input
              type="checkbox"
              checked={checkedItems.wiretapLaws}
              onChange={() => handleCheckboxChange("wiretapLaws")}
              className="mt-0.5 h-4 w-4 rounded border-[#383C4E] text-amber-500 focus:ring-amber-500 bg-[#0F1117]"
            />
            <span className="text-xs text-neutral-200 leading-snug">
              <strong className="text-white block font-medium">5. Wiretap & Two-Party Recording Compliance</strong>
              I understand federal, state, and regional laws (including two-party wiretap regimes) restrict unconsented recording.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#252836] bg-[#161822] hover:bg-[#1a1d29] cursor-pointer transition-colors group">
            <input
              type="checkbox"
              checked={checkedItems.noSurveillance}
              onChange={() => handleCheckboxChange("noSurveillance")}
              className="mt-0.5 h-4 w-4 rounded border-[#383C4E] text-amber-500 focus:ring-amber-500 bg-[#0F1117]"
            />
            <span className="text-xs text-neutral-200 leading-snug">
              <strong className="text-white block font-medium">6. No Unlawful or Covert Surveillance</strong>
              I will not use this application or connected smart glasses for covert spying, harassment, or unlawful surveillance.
            </span>
          </label>
        </div>

        {/* Footer & Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#232636]">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Acknowledgements are cryptographically timestamped in workspace audit ledger.</span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!allChecked}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              allChecked
                ? "bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 cursor-pointer"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept Terms & Open Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
