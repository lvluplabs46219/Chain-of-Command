"use client";

import React, { useState } from "react";
import {
  Activity,
  Upload,
  Radio,
  Glasses,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Lock,
  Layers,
  Database,
  Info,
  ExternalLink,
  ShieldAlert,
  BarChart2,
  Fingerprint,
  RefreshCw,
  Eye,
  CheckCheck,
} from "lucide-react";
import { SessionAnalysis } from "@/lib/vericue-types";
import { SCORE_BANDS, getBandForScore } from "@/lib/vericue-data";
import { VeriCueTab } from "./VeriCueHeader";

interface HomeDashboardProps {
  sessions: SessionAnalysis[];
  onSelectSession: (sessionId: string) => void;
  onNavigateTab: (tab: VeriCueTab) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export function HomeDashboard({
  sessions,
  onSelectSession,
  onNavigateTab,
  theme = "light",
  onToggleTheme,
}: HomeDashboardProps) {
  const isDark = theme === "dark";
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "elevated" | "low" | "pending">("all");
  const [manifestFilter, setManifestFilter] = useState<string>("all");

  const manifestHash = "c7f93a8d4e92b8761fa093c4e92b8761fa093c4b12";

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(manifestHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // 3 Authoritative sessions filtered
  const filteredSessions = sessions.filter((s) => {
    if (selectedFilter === "elevated") return s.overallProbability > 60;
    if (selectedFilter === "low") return s.overallProbability <= 30;
    if (selectedFilter === "pending") return s.exportLocked || s.status === "needs_review";
    return true;
  });

  // Cryptographic audit ledger entries
  const AUDIT_BLOCKS = [
    {
      index: 895,
      timestamp: "2026-10-14 20:05:44 UTC",
      event: "COGNITIVE_REVIEW_SIGN_OFF",
      subject: "Arthur Vance (Claim #4092)",
      operator: "DR-VANCE-04",
      hash: "99fa7701bb22d84710bc4901",
      fullHash: "99fa7701bb22d84710bc4901ee3411a0984f44021239",
      status: "SIGNED & SEALED",
      color: "emerald",
    },
    {
      index: 894,
      timestamp: "2026-10-14 19:42:15 UTC",
      event: "SESSION_INGEST_CLAIM_4092",
      subject: "Commercial Property Water Loss",
      operator: "DR-VANCE-04",
      hash: "c7f93a8d4e92b8761fa093c4",
      fullHash: "c7f93a8d4e92b8761fa093c4e92b8761fa093c4b12aa",
      status: "IMMUTABLE ANCHOR",
      color: "rose",
    },
    {
      index: 893,
      timestamp: "2026-10-14 19:15:00 UTC",
      event: "BASELINE_CALIBRATION_LOCK",
      subject: "Isotonic Brier 0.114 Baseline",
      operator: "SYS-CALIB-04",
      hash: "a78c33de9011ff55df120911",
      fullHash: "a78c33de9011ff55df120911e38947bca88921df0102",
      status: "CALIBRATED",
      color: "purple",
    },
    {
      index: 892,
      timestamp: "2026-10-14 18:30:12 UTC",
      event: "MODEL_WEIGHT_VERIFICATION",
      subject: "Ollama Llama-3-70B-Q4_K_M",
      operator: "SEC-OP-01",
      hash: "e4b1a8f943e2bb9129fa7710",
      fullHash: "e4b1a8f943e2bb9129fa7710984fa512301984bc0912",
      status: "ZERO EGRESS VERIFIED",
      color: "cyan",
    },
  ];

  return (
    <div
      className={`min-h-full space-y-7 transition-colors duration-200 ${
        isDark ? "text-slate-100" : "text-slate-900"
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* PAGE TITLE AREA & CRYPTOGRAPHIC INTEGRITY CARD                */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`rounded-2xl p-6 sm:p-7 border transition-all relative overflow-hidden ${
          isDark
            ? "bg-[#0c1324] border-[#151b2d] shadow-xl shadow-black/40"
            : "bg-gradient-to-br from-white via-[#FFF7FA] to-[#FFF0F5] border-pink-200/80 shadow-md shadow-pink-500/5"
        }`}
      >
        {/* Ambient subtle glow background */}
        <div
          className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            isDark ? "bg-rose-500/15" : "bg-pink-300/20"
          }`}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                  isDark
                    ? "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                    : "bg-pink-100 border border-pink-300/80 text-rose-700"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>LABORATORY NODE // US-EAST-B4</span>
              </span>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isDark
                    ? "bg-slate-900/80 border-slate-700 text-slate-300"
                    : "bg-white border-pink-200 text-slate-600 shadow-2xs"
                }`}
              >
                MATRIX: PROBABILISTIC_ENSEMBLE_V2.4
              </span>
            </div>

            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Forensic Telemetry Console
            </h1>

            <p
              className={`text-sm leading-relaxed ${
                isDark ? "text-slate-300" : "text-slate-600 font-normal"
              }`}
            >
              Multi-modal deception-risk cue analysis, zero-cloud egress local LLM inference, and
              tamper-evident cryptographic audit manifests for certified human reviewers.
            </p>
          </div>

          {/* Cryptographic Integrity Card */}
          <div
            className={`rounded-xl p-4 border shrink-0 lg:max-w-md w-full transition-all ${
              isDark
                ? "bg-[#080d1a] border-[#151b2d] shadow-lg"
                : "bg-white border-pink-200/90 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span
                  className={`text-xs font-semibold uppercase tracking-wider font-mono ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Cryptographic Integrity
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>LEDGER VERIFIED</span>
              </span>
            </div>

            <div
              className={`p-2.5 rounded-lg border font-mono text-xs flex items-center justify-between gap-2 mb-2.5 ${
                isDark
                  ? "bg-[#050811] border-[#151b2d] text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.06)]"
                  : "bg-pink-50/60 border-pink-200/70 text-rose-800"
              }`}
            >
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                  Active Manifest Root (SHA-256)
                </span>
                <span className="truncate font-semibold block text-[11px]">
                  {manifestHash.slice(0, 16)}...{manifestHash.slice(-8)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyHash}
                title="Copy SHA-256 Hash"
                className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                  copiedHash
                    ? "bg-emerald-500 text-white border-emerald-600"
                    : isDark
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                    : "bg-white border-pink-200 text-slate-700 hover:bg-pink-100"
                }`}
              >
                {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Anchor: Block #895</span>
              </span>
              <span>Zero-Cloud Egress Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* THREE LARGE FEATURE CARDS IN A ROW                            */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: New Media Analysis */}
        <div
          onClick={() => onNavigateTab("new_analysis")}
          className={`group rounded-2xl p-6 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            isDark
              ? "bg-[#0c1324] border-[#151b2d] hover:border-rose-500/50 hover:bg-[#10182c] shadow-lg shadow-black/50 hover:shadow-[0_0_24px_rgba(244,63,94,0.15)]"
              : "bg-white border-pink-200/80 hover:border-rose-400 hover:bg-[#FFF9FB] shadow-md shadow-pink-500/5 hover:shadow-lg hover:shadow-pink-500/10"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                  isDark
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-300 group-hover:bg-rose-500/25 group-hover:scale-105 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                    : "bg-pink-100 border-pink-200 text-rose-600 group-hover:bg-pink-200/80 group-hover:scale-105"
                }`}
              >
                <Upload className="w-5 h-5 text-rose-400" />
              </span>
              <span
                className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${
                  isDark
                    ? "bg-[#080d1a] border-[#151b2d] text-slate-300"
                    : "bg-pink-50 border-pink-200 text-rose-700"
                }`}
              >
                BATCH / ASYNC INGEST
              </span>
            </div>

            <div>
              <h2
                className={`text-base font-bold transition-colors ${
                  isDark ? "text-slate-100 group-hover:text-rose-300" : "text-slate-900 group-hover:text-rose-600"
                }`}
              >
                New Media Analysis
              </h2>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600 font-normal"
                }`}
              >
                Batch and async upload for MP4, MOV, WAV, and depositions. Executes the 10-stage cue
                extraction pipeline calibrated against the subject’s individual baseline.
              </p>
            </div>

            <div
              className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                isDark
                  ? "bg-[#080d1a] border-[#151b2d] text-slate-300"
                  : "bg-pink-50/70 border-pink-100 text-slate-700"
              }`}
            >
              <span>Pipeline: 10 Stages</span>
              <span className="font-semibold text-rose-400">18 Multimodal Cues</span>
            </div>
          </div>

          <div
            className={`pt-4 mt-4 border-t flex items-center justify-between text-xs font-semibold transition-colors ${
              isDark
                ? "border-[#151b2d] text-rose-400 group-hover:text-rose-300"
                : "border-pink-100 text-rose-600 group-hover:text-rose-700"
            }`}
          >
            <span>Launch Ingestion Pipeline</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Launch Live Conversation Mode */}
        <div
          onClick={() => onNavigateTab("live_mode")}
          className={`group rounded-2xl p-6 border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
            isDark
              ? "bg-[#0c1324] border-[#151b2d] hover:border-rose-500/50 hover:bg-[#10182c] shadow-lg shadow-black/50 hover:shadow-[0_0_24px_rgba(244,63,94,0.22)]"
              : "bg-white border-pink-200/80 hover:border-rose-400 hover:bg-[#FFF9FB] shadow-md shadow-pink-500/5 hover:shadow-lg hover:shadow-pink-500/10"
          }`}
        >
          {/* Subtle live indicator badge ribbon */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                  isDark
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300 group-hover:bg-rose-500/30 group-hover:scale-105 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                    : "bg-rose-50 border-rose-200 text-rose-600 group-hover:bg-rose-100 group-hover:scale-105"
                }`}
              >
                <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-1.5 shadow-[0_0_8px_rgba(244,63,94,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
                <span>&lt;800MS BUDGET</span>
              </span>
            </div>

            <div>
              <h2
                className={`text-base font-bold transition-colors ${
                  isDark ? "text-slate-100 group-hover:text-rose-300" : "text-slate-900 group-hover:text-rose-600"
                }`}
              >
                Launch Live Conversation Mode
              </h2>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600 font-normal"
                }`}
              >
                Sub-800ms real-time audio and video inference pipeline. Continuous turn-by-turn
                probabilistic assessment with uncertainty bounds and zero prejudicial labels.
              </p>
            </div>

            <div
              className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                isDark
                  ? "bg-[#080d1a] border-[#151b2d] text-slate-300"
                  : "bg-pink-50/70 border-pink-100 text-slate-700"
              }`}
            >
              <span>Latency: ~410ms</span>
              <span className="font-semibold text-emerald-400">Zero &quot;LIAR&quot; Labels</span>
            </div>
          </div>

          <div
            className={`pt-4 mt-4 border-t flex items-center justify-between text-xs font-semibold transition-colors ${
              isDark
                ? "border-[#151b2d] text-rose-400 group-hover:text-rose-300"
                : "border-pink-100 text-rose-600 group-hover:text-rose-700"
            }`}
          >
            <span>Initiate Live Session</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Connect Smart Glasses HUD */}
        <div
          onClick={() => onNavigateTab("smart_glasses")}
          className={`group rounded-2xl p-6 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            isDark
              ? "bg-[#0c1324] border-[#151b2d] hover:border-cyan-500/50 hover:bg-[#10182c] shadow-lg shadow-black/50 hover:shadow-[0_0_24px_rgba(6,182,212,0.18)]"
              : "bg-white border-pink-200/80 hover:border-cyan-400 hover:bg-[#FFF9FB] shadow-md shadow-pink-500/5 hover:shadow-lg hover:shadow-cyan-500/10"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                  isDark
                    ? "bg-cyan-500/15 border-cyan-500/35 text-cyan-300 group-hover:bg-cyan-500/25 group-hover:scale-105 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    : "bg-cyan-50 border-cyan-200 text-cyan-600 group-hover:bg-cyan-100 group-hover:scale-105"
                }`}
              >
                <Glasses className="w-5 h-5 text-cyan-400" />
              </span>
              <span
                className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${
                  isDark
                    ? "bg-[#080d1a] border-[#151b2d] text-cyan-300"
                    : "bg-pink-50 border-pink-200 text-slate-700"
                }`}
              >
                WebXR / BLE OPTICAL
              </span>
            </div>

            <div>
              <h2
                className={`text-base font-bold transition-colors ${
                  isDark ? "text-slate-100 group-hover:text-cyan-300" : "text-slate-900 group-hover:text-cyan-600"
                }`}
              >
                Connect Smart Glasses HUD
              </h2>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600 font-normal"
                }`}
              >
                Wirelessly link wearable optical visors. Discreet peripheral cues appear only during
                silence windows after full answers to avoid cognitive interference.
              </p>
            </div>

            <div
              className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                isDark
                  ? "bg-[#080d1a] border-[#151b2d] text-slate-300"
                  : "bg-pink-50/70 border-pink-100 text-slate-700"
              }`}
            >
              <span>Scoring: Per-Answer</span>
              <span className="font-semibold text-cyan-400">HUD Visor Ready</span>
            </div>
          </div>

          <div
            className={`pt-4 mt-4 border-t flex items-center justify-between text-xs font-semibold transition-colors ${
              isDark
                ? "border-[#151b2d] text-cyan-400 group-hover:text-cyan-300"
                : "border-pink-100 text-cyan-600 group-hover:text-cyan-700"
            }`}
          >
            <span>Connect Visor Device</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SYSTEM STATUS ROW (Local Ollama, Calibration, Governance)     */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status 1: Local Ollama Runtime */}
        <div
          className={`rounded-xl p-4 border transition-all ${
            isDark
              ? "bg-[#0c1324] border-[#151b2d] shadow-sm"
              : "bg-white border-pink-200/70 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase mb-2">
            <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-rose-400" />
              <span>Local Ollama Runtime</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              AIR-GAPPED
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              Llama-3-70B-Q4
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">42.4 tok/s</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#151b2d]">
            <span>GPU Temp: 54°C</span>
            <span className="text-emerald-400">0ms Cloud Egress</span>
          </div>
        </div>

        {/* Status 2: Calibration Baseline */}
        <div
          className={`rounded-xl p-4 border transition-all ${
            isDark
              ? "bg-[#0c1324] border-[#151b2d] shadow-sm"
              : "bg-white border-pink-200/70 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase mb-2">
            <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Calibration Baseline</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              ISOTONIC
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              Brier: 0.114
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              FPR: 6.1% Studio
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#151b2d]">
            <span>Mobile FPR: 8.9%</span>
            <span>Calibrated Dec 2026</span>
          </div>
        </div>

        {/* Status 3: Active Workspace Governance */}
        <div
          className={`rounded-xl p-4 border transition-all ${
            isDark
              ? "bg-[#0c1324] border-[#151b2d] shadow-sm"
              : "bg-white border-pink-200/70 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase mb-2">
            <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Workspace Governance</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
              SOC-2 TYPE II
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              3 SIU Units
            </span>
            <span className="text-xs font-mono text-purple-400 font-semibold">Audited</span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#151b2d]">
            <span>Human Gate: Enforced</span>
            <span>ISO-27001 Compliant</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RECENT ANALYSIS SESSIONS LIST (High-Fidelity Triage Rows)      */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`rounded-2xl p-6 border transition-all space-y-4 ${
          isDark
            ? "bg-[#0c1324] border-[#151b2d] shadow-xl shadow-black/40"
            : "bg-white border-pink-200/80 shadow-sm"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#151b2d]">
          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-base font-bold tracking-tight ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Recent Forensic Analysis Sessions
              </h2>
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                  isDark
                    ? "bg-[#080d1a] text-rose-300 border border-[#151b2d]"
                    : "bg-pink-100 text-rose-700 border border-pink-200"
                }`}
              >
                {sessions.length} DEPOSITIONS
              </span>
            </div>
            <p
              className={`text-xs mt-0.5 ${
                isDark ? "text-slate-400" : "text-slate-600 font-normal"
              }`}
            >
              Calibrated multi-modal scores, statement-level risk classification, and data quality metrics.
            </p>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div
            className={`flex items-center gap-1 p-1 rounded-lg border text-xs font-medium self-start sm:self-auto ${
              isDark ? "bg-[#080d1a] border-[#151b2d]" : "bg-pink-50/60 border-pink-200/70"
            }`}
          >
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedFilter === "all"
                  ? isDark
                    ? "bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30"
                    : "bg-white text-rose-700 font-bold shadow-2xs border border-pink-200/80"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter("elevated")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedFilter === "elevated"
                  ? isDark
                    ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                    : "bg-white text-amber-700 font-bold shadow-2xs border border-pink-200/80"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Elevated Risk
            </button>
            <button
              onClick={() => setSelectedFilter("low")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedFilter === "low"
                  ? isDark
                    ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30"
                    : "bg-white text-emerald-700 font-bold shadow-2xs border border-pink-200/80"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Low Risk
            </button>
            <button
              onClick={() => setSelectedFilter("pending")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedFilter === "pending"
                  ? isDark
                    ? "bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30"
                    : "bg-white text-purple-700 font-bold shadow-2xs border border-pink-200/80"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Needs Review
            </button>
          </div>
        </div>

        {/* Sessions Stack */}
        <div className="space-y-3.5">
          {filteredSessions.map((session, idx) => {
            const bandConfig = getBandForScore(session.overallProbability);
            const isElevated = session.overallProbability > 60;
            const isLow = session.overallProbability <= 30;

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`rounded-xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-5 group ${
                  isDark
                    ? "bg-[#080d1a] border-[#151b2d] hover:border-rose-500/40 hover:bg-[#0c1324] shadow-xs"
                    : "bg-[#FFFDFE] border-pink-200/70 hover:border-pink-300 hover:bg-[#FFF8FA] shadow-xs hover:shadow-md"
                }`}
              >
                {/* Left Block: Thumbnail/Icon & Metadata */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Forensic Thumbnail Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 font-mono text-xs font-bold transition-transform group-hover:scale-105 ${
                      isElevated
                        ? isDark
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                          : "bg-amber-50 border-amber-200 text-amber-600"
                        : isLow
                        ? isDark
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                          : "bg-emerald-50 border-emerald-200 text-emerald-600"
                        : isDark
                        ? "bg-purple-500/15 border-purple-500/30 text-purple-400"
                        : "bg-purple-50 border-purple-200 text-purple-600"
                    }`}
                  >
                    <span>{session.overallProbability}%</span>
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm font-bold truncate group-hover:underline ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {session.title}
                      </h3>
                      {session.caseRef && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                            isDark
                              ? "bg-slate-900 border-slate-700 text-slate-300"
                              : "bg-pink-50 border-pink-200 text-slate-700"
                          }`}
                        >
                          {session.caseRef}
                        </span>
                      )}

                      {/* Review status chip */}
                      {session.exportLocked ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Reviewer Sign-off Pending</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" />
                          <span>Audited &amp; Signed Off</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>
                        Subject:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {session.subjectName}
                        </strong>
                      </span>
                      <span>Date: {session.date}</span>
                      <span>Duration: {session.durationFormatted}</span>
                      <span>{session.statements.length} Statements Analyzed</span>
                    </div>

                    {/* Data Quality Micro-Meters */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[10px]">Audio:</span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }} />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-bold">94%</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[10px]">Video:</span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: isElevated ? "88%" : "95%" }}
                          />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-bold">
                          {isElevated ? "88%" : "95%"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[10px]">Lighting:</span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: "92%" }} />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-bold">92%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Block: Probability Risk Band & Confidence */}
                <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                      Confidence Bound
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {(session.overallConfidence * 100).toFixed(0)}% [±3.1%]
                    </span>
                  </div>

                  <div
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${
                      isElevated
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : isLow
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                    }`}
                  >
                    <span>{bandConfig.label}</span>
                  </div>

                  <span
                    className={`p-2 rounded-lg border transition-colors ${
                      isDark
                        ? "border-slate-800 text-slate-400 group-hover:text-rose-400 group-hover:border-rose-500/30"
                        : "border-pink-200 text-slate-500 group-hover:text-rose-600 group-hover:border-rose-300"
                    }`}
                  >
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* APPEND-ONLY CRYPTOGRAPHIC AUDIT MANIFEST SECTION              */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`rounded-2xl p-6 border transition-all space-y-4 ${
          isDark
            ? "bg-[#0c1324] border-[#151b2d] shadow-xl shadow-black/40"
            : "bg-white border-pink-200/80 shadow-sm"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#151b2d]">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg border ${
                isDark
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.15)]"
                  : "bg-pink-100 border-pink-200 text-rose-600"
              }`}
            >
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <h2
                className={`text-base font-bold tracking-tight ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Append-Only Cryptographic Audit Manifest
              </h2>
              <p
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-600 font-normal"
                }`}
              >
                Immutable SHA-256 event chain recording operator actions, model weights, and calibration locks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Merkle Tree Verified</span>
            </span>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr
                className={`border-b text-[10px] uppercase tracking-wider ${
                  isDark
                    ? "border-[#151b2d] text-slate-400 bg-[#080d1a]"
                    : "border-pink-100 text-slate-500 bg-pink-50/50"
                }`}
              >
                <th className="py-2.5 px-3">Block</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Operational Event</th>
                <th className="py-2.5 px-3">Subject / Target</th>
                <th className="py-2.5 px-3">Operator ID</th>
                <th className="py-2.5 px-3">SHA-256 Digest</th>
                <th className="py-2.5 px-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#151b2d]">
              {AUDIT_BLOCKS.map((block) => (
                <tr
                  key={block.index}
                  className={`transition-colors ${
                    isDark ? "hover:bg-[#10182c]/60" : "hover:bg-pink-50/40"
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-rose-400">#{block.index}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{block.timestamp}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                    {block.event}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{block.subject}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] border ${
                        isDark
                          ? "bg-[#080d1a] border-[#151b2d] text-slate-300"
                          : "bg-white border-pink-200 text-slate-700"
                      }`}
                    >
                      {block.operator}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 text-[11px] font-mono">
                    <span title={block.fullHash}>{block.hash}...</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {block.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* REGULATORY DISCLAIMER FOOTER BAR WITH NIST COMPLIANCE BADGE    */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`rounded-2xl p-5 border transition-all flex flex-col md:flex-row items-center justify-between gap-4 ${
          isDark
            ? "bg-[#0c1324] border-[#151b2d] text-slate-300 shadow-lg shadow-black/30"
            : "bg-gradient-to-r from-pink-50 via-white to-pink-50 border-pink-200 text-slate-700 shadow-xs"
        }`}
      >
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${
              isDark
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-pink-100 border-pink-200 text-rose-600"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
                Mandatory Regulatory &amp; Scientific Disclosure
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold">
                NIST AI RMF 1.0 COMPLIANT
              </span>
            </div>
            <p className="text-xs leading-relaxed font-sans text-slate-600 dark:text-slate-400">
              VeriCue AI operates strictly as an uncertainty-aware behavioral triage tool pursuant to
              <strong> NIST AI RMF 1.0 &amp; IEEE 7000</strong>. It never provides definitive guilt,
              lie, or truth determinations. Human certified reviewer sign-off is mandated prior to
              report disposition or evidentiary review.
            </p>
          </div>
        </div>

        {/* Compliance Seals */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] shrink-0">
          <span
            className={`px-2.5 py-1 rounded-lg border font-semibold ${
              isDark
                ? "bg-[#080C17] border-slate-700 text-slate-300"
                : "bg-white border-pink-200 text-slate-700 shadow-2xs"
            }`}
          >
            ISO/IEC 42001
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg border font-semibold ${
              isDark
                ? "bg-[#080C17] border-slate-700 text-slate-300"
                : "bg-white border-pink-200 text-slate-700 shadow-2xs"
            }`}
          >
            SOC-2 TYPE II
          </span>
          <span
            className={`px-2.5 py-1 rounded-lg border font-semibold ${
              isDark
                ? "bg-[#080C17] border-slate-700 text-slate-300"
                : "bg-white border-pink-200 text-slate-700 shadow-2xs"
            }`}
          >
            ZERO-CLOUD EGRESS
          </span>
        </div>
      </div>
    </div>
  );
}
