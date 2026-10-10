"use client";

import React from "react";
import {
  Database,
  ShieldCheck,
  AlertTriangle,
  FileBadge,
  Layers,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { DATASET_REGISTRY } from "@/lib/vericue-data";

export function DatasetGovernanceView() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-[#E1E2E5]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            Data Governance & Training Integrity (§5 Page 21 & §7)
          </span>
          <span className="text-xs text-neutral-400">Strict Provenance & Speaker Isolation</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Dataset Registry & Ground Truth Governance
        </h1>
        <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
          VeriCue AI enforces strict dataset isolation: acted deception lab data is never mixed into real-world validation sets. Every corpus records verifiable licensing, subject consent, and speaker-disjoint splits.
        </p>
      </div>

      {/* Critical Non-Negotiable Warning */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-medium">
            Non-Negotiable Training Rule (Blueprint §7):
          </strong>
          Acted lab deception datasets make models look deceptively accurate under artificial conditions.
          VeriCue isolates acted data from production validation and evaluates exclusively on speaker-disjoint real-world ground truth with published false-positive rates.
        </div>
      </div>

      {/* Dataset Registry Table */}
      <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#202330] pb-3">
          <h3 className="text-sm font-semibold text-white">Registered Training & Validation Corpora</h3>
          <span className="text-[11px] font-mono text-neutral-400">{DATASET_REGISTRY.length} Registered Corpora</span>
        </div>

        <div className="space-y-3">
          {DATASET_REGISTRY.map((ds) => (
            <div
              key={ds.id}
              className="p-4 rounded-xl bg-[#161824] border border-[#262A3C] space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{ds.name}</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202434] text-neutral-400">
                      {ds.version}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {ds.sampleCount.toLocaleString()} Samples · {ds.languages.join(", ")}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      ds.labelMeaning === "Real-World Ground Truth"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {ds.labelMeaning}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202434] border border-[#2D334A] text-neutral-300">
                    {ds.license}
                  </span>
                  {ds.activeInProductionModel ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Production Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                      Isolated (Not in Prod)
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#222534] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-300">
                <div>
                  <span className="text-neutral-500 font-mono block text-[10px]">CONSENT & SPLIT POSTURE</span>
                  <span>{ds.consentStatus} · {ds.splitIsolation}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-mono block text-[10px]">KNOWN BIAS & STRATIFICATION</span>
                  <span>{ds.knownBiasNotes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
