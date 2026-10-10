"use client";

import React, { useState } from "react";
import {
  Cpu,
  Zap,
  Lock,
  RefreshCw,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sliders,
} from "lucide-react";
import { MODEL_ROUTES } from "@/lib/vericue-data";
import { ModelRouteEntry } from "@/lib/vericue-types";

export function ModelCenterView() {
  const [privacyOnlyMode, setPrivacyOnlyMode] = useState(false);
  const [routes, setRoutes] = useState<ModelRouteEntry[]>(MODEL_ROUTES);
  const [isPinging, setIsPinging] = useState(false);

  const handleTestLatency = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-[#E1E2E5]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            Model Routing & Latency Budgets (§7 Table)
          </span>
          <span className="text-xs text-neutral-400">Local Ollama Runtime + Edge Inference</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Model Center & Hybrid Inference Architecture
        </h1>
        <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
          VeriCue combines local on-prem inference (Ollama 70B) for sensitive depositions with edge fast models
          for sub-800ms live scoring and Gemini reasoning models for deep longitudinal analysis.
        </p>
      </div>

      {/* Local Privacy Mode Switch Banner */}
      <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Enterprise Local-Only Privacy Mode (Zero Cloud Egress)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Forces all speech transcription, diarization, and cue fusion to execute exclusively on local Ollama runtime. Media never leaves your network perimeter.
            </p>
          </div>
        </div>

        <button
          onClick={() => setPrivacyOnlyMode(!privacyOnlyMode)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            privacyOnlyMode
              ? "bg-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20"
              : "bg-[#1E2232] border border-[#2D334A] text-neutral-300 hover:bg-[#252a3d]"
          }`}
        >
          {privacyOnlyMode ? "Strict Local Active" : "Enable Local Only"}
        </button>
      </div>

      {/* Latency Budget Routing Matrix (§7 Table) */}
      <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#202330] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Model Routing Matrix & Latency Budgets (§7 Table)
            </h3>
            <p className="text-xs text-neutral-400">
              Each pipeline task operates within a strictly measured latency envelope.
            </p>
          </div>

          <button
            onClick={handleTestLatency}
            disabled={isPinging}
            className="px-3 py-1.5 rounded-lg bg-[#181B26] border border-[#2B3044] text-xs font-medium text-neutral-200 hover:bg-[#202534] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-amber-400" : ""}`} />
            <span>Test Route Latency</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-[#242838] text-neutral-400 text-[11px]">
                <th className="py-2.5 pr-4 font-semibold text-neutral-300">Use Case</th>
                <th className="py-2.5 px-4">Latency Budget</th>
                <th className="py-2.5 px-4">Actual p95 Latency</th>
                <th className="py-2.5 px-4">Primary Provider</th>
                <th className="py-2.5 px-4">Local Fallback</th>
                <th className="py-2.5 pl-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2130]">
              {routes.map((route) => {
                const isWithinBudget = route.actualP95Ms <= route.latencyBudgetMs;
                return (
                  <tr key={route.useCase} className="hover:bg-[#161924] transition-colors">
                    <td className="py-3 pr-4 font-sans font-medium text-white">{route.useCase}</td>
                    <td className="py-3 px-4 text-neutral-400">&lt; {route.latencyBudgetMs} ms</td>
                    <td className="py-3 px-4 font-bold text-amber-400">{route.actualP95Ms} ms</td>
                    <td className="py-3 px-4 text-neutral-300">{route.primaryProvider}</td>
                    <td className="py-3 px-4 text-neutral-400">{route.fallbackProvider}</td>
                    <td className="py-3 pl-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        {route.activeStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
