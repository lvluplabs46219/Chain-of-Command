"use client";

import React from "react";
import {
  Activity,
  Upload,
  Radio,
  Glasses,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Clock,
  Sparkles,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { SessionAnalysis } from "@/lib/vericue-types";
import { SCORE_BANDS, getBandForScore } from "@/lib/vericue-data";
import { VeriCueTab } from "./VeriCueHeader";

interface HomeDashboardProps {
  sessions: SessionAnalysis[];
  onSelectSession: (sessionId: string) => void;
  onNavigateTab: (tab: VeriCueTab) => void;
}

export function HomeDashboard({
  sessions,
  onSelectSession,
  onNavigateTab,
}: HomeDashboardProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-[#E1E2E5]">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#121520] via-[#151928] to-[#12141F] border border-[#232738] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>10-Stage Pipeline · Calibrated Probability · Non-Negotiable Restraint</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            VeriCue AI — Deception-Risk Behavioral Signal Triage
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed font-sans">
            Analyzes uploaded audio/video and real-time dialogue to estimate probability-based
            deception-risk cues with explicit uncertainty bounds. Scores compare against the subject’s
            own baseline, never population stereotypes.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab("new_analysis")}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-semibold text-xs flex items-center gap-2 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Start New Analysis</span>
            </button>
            <button
              onClick={() => onNavigateTab("live_mode")}
              className="px-4 py-2.5 rounded-xl bg-[#1C202E] border border-[#2F354D] text-neutral-200 font-semibold text-xs flex items-center gap-2 hover:bg-[#252a3d] hover:border-amber-500/40 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Launch Live Mode</span>
            </button>
            <button
              onClick={() => onNavigateTab("profit_model")}
              className="px-4 py-2.5 rounded-xl bg-[#1C202E] border border-[#2F354D] text-neutral-200 font-semibold text-xs flex items-center gap-2 hover:bg-[#252a3d] hover:border-amber-500/40 transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>3-Scenario Profit Model</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#12141C] border border-[#222534] rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-neutral-400">Calibration Brier Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">0.114</span>
            <span className="text-[10px] text-emerald-400 font-medium font-mono">Well-Calibrated</span>
          </div>
          <span className="text-[10px] text-neutral-500 block">Isotonic regression on reviewer history</span>
        </div>

        <div className="bg-[#12141C] border border-[#222534] rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-neutral-400">Studio Audio FPR</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">6.1%</span>
            <span className="text-[10px] text-neutral-400 font-mono">Mobile: 8.9%</span>
          </div>
          <span className="text-[10px] text-neutral-500 block">Published empirical false-positive rate</span>
        </div>

        <div className="bg-[#12141C] border border-[#222534] rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-neutral-400">Active Workspaces</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">3 Teams</span>
            <span className="text-[10px] text-amber-400 font-mono">SIU & Audit</span>
          </div>
          <span className="text-[10px] text-neutral-500 block">Insurance SIU, Internal Audit, M&A Due Diligence</span>
        </div>

        <div className="bg-[#12141C] border border-[#222534] rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-neutral-400">Human Review Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">8.0%</span>
            <span className="text-[10px] text-orange-400 font-mono">Elevated/High</span>
          </div>
          <span className="text-[10px] text-neutral-500 block">Mandatory reviewer sign-off gate enforced</span>
        </div>
      </div>

      {/* Quick Launchpad Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Upload */}
        <div
          onClick={() => onNavigateTab("new_analysis")}
          className="bg-[#131622] border border-[#232738] hover:border-amber-500/40 rounded-xl p-5 cursor-pointer transition-all hover:bg-[#161a29] group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
              Media Ingest & Pipeline
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Upload MP4, MOV, WAV audio/video or transcripts through the 10-stage cue extraction pipeline.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
            <span>Open Ingestion Console</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Smart Glasses */}
        <div
          onClick={() => onNavigateTab("smart_glasses")}
          className="bg-[#131622] border border-[#232738] hover:border-amber-500/40 rounded-xl p-5 cursor-pointer transition-all hover:bg-[#161a29] group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <Glasses className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
              Smart Glasses HUD Overlay
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Minimal wearable optical visor view. Per-answer scoring only after complete answers. Zero "LIAR" labels.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-indigo-400 font-medium">
            <span>Launch Glasses Simulator</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Monetization & Profit Model */}
        <div
          onClick={() => onNavigateTab("profit_model")}
          className="bg-[#131622] border border-[#232738] hover:border-emerald-500/40 rounded-xl p-5 cursor-pointer transition-all hover:bg-[#161a29] group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
              3-Scenario Profit Model (P&L)
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Full 3-year financial model from the blueprint. 51.2% consumer margin vs 74.3% B2B margin reality.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <span>Explore 3-Year Model</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-[#12141C] border border-[#222534] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202330] pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Analyzed Sessions & Depositions</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Review statement-by-statement probability bands, cue breakdowns, and reviewer sign-offs.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("reports")}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Reports & Reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => {
            const bandConfig = getBandForScore(session.overallProbability);
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className="bg-[#161924] border border-[#252838] hover:border-amber-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all hover:bg-[#191d2a]"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-white hover:text-amber-300 transition-colors">
                      {session.title}
                    </span>
                    {session.caseRef && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202330] text-neutral-400">
                        {session.caseRef}
                      </span>
                    )}
                    {session.exportLocked && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Sign-off Pending</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                    <span>Subject: <strong className="text-neutral-200">{session.subjectName}</strong></span>
                    <span>Date: {session.date}</span>
                    <span>Duration: {session.durationFormatted}</span>
                    <span>Statements: {session.statements.length}</span>
                    <span>Quality: <strong className="text-emerald-400">{session.dataQualitySummary.split(",")[0]}</strong></span>
                  </div>
                </div>

                {/* Score & Band Badge */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-mono text-neutral-400">Estimated Risk</div>
                    <div className="text-xl font-bold font-mono text-white">
                      {session.overallProbability}%
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${bandConfig.badgeColor}`}>
                    {bandConfig.label}
                  </div>

                  <ArrowRight className="w-4 h-4 text-neutral-500 hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
