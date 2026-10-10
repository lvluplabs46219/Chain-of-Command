"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Lock,
  Trash2,
  Download,
  AlertTriangle,
  Scale,
  FileText,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { MANDATORY_DISCLOSURE_BANNER } from "@/lib/sanitizer";

export function SettingsComplianceView() {
  const [retentionDays, setRetentionDays] = useState("30");
  const [localEncryption, setLocalEncryption] = useState(true);
  const [purgedSuccess, setPurgedSuccess] = useState(false);

  const handlePurgeAll = () => {
    setPurgedSuccess(true);
    setTimeout(() => setPurgedSuccess(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-[#E1E2E5]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            Privacy, Retention & Legal Posture (§5 Pages 23–25)
          </span>
          <span className="text-xs text-neutral-400">Governance & Risk Boundaries</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Settings, Data Retention & Regulatory Boundaries
        </h1>
        <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
          Manage workspace data retention lifecycles, configure local encryption keys,
          and review the regulatory restrictions governing automated cue analysis across key jurisdictions.
        </p>
      </div>

      {/* Grid: Data Retention Controls (6 cols) vs Regulatory Landmines (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Retention & Privacy Settings */}
        <div className="lg:col-span-6 bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="border-b border-[#202330] pb-3">
            <h3 className="text-sm font-semibold text-white">Data Retention & Cryptographic Privacy</h3>
            <p className="text-xs text-neutral-400">Control automated deletion of raw audio and video.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Raw Media Deletion Schedule
              </label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#161824] border border-[#262A3C] text-white focus:outline-none focus:border-amber-500"
              >
                <option value="0">Immediate Purge (Delete media immediately after feature extraction)</option>
                <option value="7">Auto-Purge Raw Media After 7 Days</option>
                <option value="30">Auto-Purge Raw Media After 30 Days (Standard Audit)</option>
                <option value="90">Auto-Purge Raw Media After 90 Days</option>
              </select>
              <p className="text-[11px] text-neutral-500 mt-1">
                Extracted feature vectors and sanitized score reports remain archived with customer retention keys.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161824] border border-[#262A3C] flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">AES-256 Workspace Key Encryption</span>
                <span className="text-[11px] text-neutral-400">All session transcripts and audio encrypted with tenant keys.</span>
              </div>
              <button
                onClick={() => setLocalEncryption(!localEncryption)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  localEncryption ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {localEncryption ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="pt-2 border-t border-[#202330] flex flex-wrap gap-3">
              <button
                onClick={handlePurgeAll}
                className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{purgedSuccess ? "Workspace Purged!" : "Purge All Media in Workspace"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Regulatory Landmines & Legal Gates (§3 & §16) */}
        <div className="lg:col-span-6 bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#202330] pb-3">
            <h3 className="text-sm font-semibold text-white">Regulatory Gates & Prohibited Verticals (§3)</h3>
            <p className="text-xs text-neutral-400">Strict legal constraints enforced by software boundaries.</p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3 rounded-xl bg-[#161824] border border-[#262A3C] space-y-1">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>1. US Pre-Employment Polygraph Protection Act (EPPA)</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                US federal law strictly restricts private employers' use of lie-detection equipment on job candidates. The pre-employment vertical is gated until counsel signs off.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#161824] border border-[#262A3C] space-y-1">
              <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>2. EU AI Act — Workplace Emotion Inference Prohibition</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                The EU AI Act prohibits AI emotion-inference systems in workplaces and educational institutions. VeriCue applies geolocation gating blocking EU workplace deployments.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#161824] border border-[#262A3C] space-y-1">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Insurance Claims (SIU) & Corporate Audit (Permitted Beachhead)</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Insurance fraud claims investigation operates under contractual policy cooperation clauses. This represents the primary, legally defensible B2B beachhead.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
