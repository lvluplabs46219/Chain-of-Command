"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Languages,
  ShieldCheck,
  FileCheck2,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  CALIBRATION_BUCKETS,
  LANGUAGE_PERFORMANCE,
  QUALITY_BAND_PERFORMANCE,
} from "@/lib/vericue-data";

export function EvaluationCalibrationView() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English (US/UK)");

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-[#E1E2E5]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            Model Governance & Statistical Validation (§5 Page 22)
          </span>
          <span className="text-xs text-neutral-400">The Regulated Buyer’s Deciding Factor</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Evaluation, Calibration & Empirical Error Rates
        </h1>
        <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
          Uncalibrated AI claims are unsellable in legal and compliance settings.
          VeriCue AI applies isotonic regression fitted on reviewer-corrected ground truth
          and openly publishes false-positive curves broken down by language and recording quality.
        </p>
      </div>

      {/* Top Statistical Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Brier Calibration Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">0.114</span>
            <span className="text-[10px] text-neutral-400 font-mono">(&lt; 0.15 Ideal)</span>
          </div>
          <p className="text-[10px] text-neutral-500">Isotonic regression minimizes probabilistic error.</p>
        </div>

        <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Studio Audio False Positive</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-amber-400">6.1%</span>
            <span className="text-[10px] text-emerald-400 font-mono">FPR</span>
          </div>
          <p className="text-[10px] text-neutral-500">Clean 48kHz SNR with frontal facial tracking.</p>
        </div>

        <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Overall Precision / Recall</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">78.4%</span>
            <span className="text-[10px] text-neutral-400 font-mono">F1: 0.772</span>
          </div>
          <p className="text-[10px] text-neutral-500">Cross-validated across 5,000+ deposition turns.</p>
        </div>

        <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block">Indeterminate Abstention</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-indigo-400">14.6%</span>
            <span className="text-[10px] text-neutral-400 font-mono">Abstains</span>
          </div>
          <p className="text-[10px] text-neutral-500">Refuses to guess on noisy or conflicting data.</p>
        </div>
      </div>

      {/* Grid: Reliability Diagram (Left) vs Quality & Language Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Calibration Curve / Reliability Diagram (6 cols) */}
        <div className="lg:col-span-6 bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#202330] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Reliability Diagram (Calibration Curve)</h3>
              <p className="text-xs text-neutral-400">Predicted Risk Band vs. Empirical Verified Outcomes</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Isotonic Calibrated
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {CALIBRATION_BUCKETS.map((b) => {
              const predictedPct = Math.round(b.predictedMean * 100);
              const empiricalPct = Math.round(b.empiricalTruePositiveRate * 100);
              const delta = Math.abs(predictedPct - empiricalPct);
              return (
                <div key={b.predictedBin} className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300 font-medium">Bin {b.predictedBin}</span>
                    <span className="text-neutral-400 text-[11px]">
                      Predicted: <strong className="text-white">{predictedPct}%</strong> · Empirical: <strong className="text-amber-400">{empiricalPct}%</strong> ({b.sampleCount} samples)
                    </span>
                  </div>

                  {/* Dual bar: Predicted vs Empirical */}
                  <div className="space-y-1">
                    <div className="w-full bg-[#181B26] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-neutral-500 h-full rounded-full"
                        style={{ width: `${predictedPct}%` }}
                      />
                    </div>
                    <div className="w-full bg-[#181B26] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${empiricalPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#202330] flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-500 inline-block" />
              Predicted Probability
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Empirical Observed Rate
            </span>
          </div>
        </div>

        {/* Right: Performance by Quality & Language (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Quality Band Matrix */}
          <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 space-y-3">
            <div className="border-b border-[#202330] pb-2">
              <h3 className="text-sm font-semibold text-white">Error Rates by Recording Quality Band</h3>
              <p className="text-xs text-neutral-400">
                Notice the impact: noisy audio triples false positives (from 6.1% to 16.8%).
              </p>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {QUALITY_BAND_PERFORMANCE.map((q) => (
                <div
                  key={q.band}
                  className="p-3 rounded-xl bg-[#161824] border border-[#252838] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="font-sans font-medium text-white text-xs">{q.band}</div>
                  <div className="flex items-center gap-3 text-neutral-300 text-[11px]">
                    <span>FPR: <strong className="text-amber-400">{(q.falsePositiveRate * 100).toFixed(1)}%</strong></span>
                    <span>FNR: <strong className="text-neutral-400">{(q.falseNegativeRate * 100).toFixed(1)}%</strong></span>
                    {q.confidencePenaltyApplied > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">
                        -{Math.round(q.confidencePenaltyApplied * 100)}% Penalty
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Breakdown Matrix */}
          <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 space-y-3">
            <div className="border-b border-[#202330] pb-2">
              <h3 className="text-sm font-semibold text-white">Accuracy & Calibration by Language</h3>
              <p className="text-xs text-neutral-400">
                Published cross-lingual metrics across evaluated deposition datasets.
              </p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {LANGUAGE_PERFORMANCE.map((l) => (
                <div
                  key={l.language}
                  className="p-2.5 rounded-xl bg-[#161824] border border-[#252838] flex items-center justify-between"
                >
                  <span className="font-sans text-neutral-200">{l.language}</span>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-neutral-400">{l.sessionsTested} tests</span>
                    <span className="text-white font-semibold">Acc: {(l.accuracy * 100).toFixed(1)}%</span>
                    <span className="text-amber-400 font-semibold">FPR: {(l.falsePositiveRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
