"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Volume2,
  Eye,
  MessageSquare,
  FileCheck2,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { CUE_CATALOG } from "@/lib/vericue-data";
import { CueCategory } from "@/lib/vericue-types";

export function CueBreakdownView() {
  const [selectedCategory, setSelectedCategory] = useState<CueCategory | "all">("all");

  const categories: Array<{ id: CueCategory | "all"; label: string; count: number }> = [
    { id: "all", label: "All 18 Cues", count: 18 },
    { id: "contextual", label: "Contextual (Highest Weight)", count: 3 },
    { id: "linguistic", label: "Linguistic & Speech", count: 6 },
    { id: "audio", label: "Acoustic & Vocal", count: 5 },
    { id: "visual", label: "Visual & Motor", count: 4 },
  ];

  const filteredCues = CUE_CATALOG.filter((c) => {
    if (selectedCategory === "all") return true;
    return c.category === selectedCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-[#E1E2E5]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            Multimodal Feature Taxonomy (§8 Table)
          </span>
          <span className="text-xs text-neutral-400">18-Cue Calibrated Catalog · Weights Sum = 1.00</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Multimodal Cue Catalog & Behavioral Weighting
        </h1>
        <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
          Contextual cues (contradictions with facts and timelines) carry the highest weights by design.
          Linguistic, vocal, and visual cues are cross-referenced with potential benign explanations
          (anxiety, culture, neurodivergence).
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-amber-500 text-neutral-950 font-semibold shadow-md shadow-amber-500/20"
                : "bg-[#141724] border border-[#25283A] text-neutral-300 hover:bg-[#1b1f2e]"
            }`}
          >
            <span>{cat.label}</span>
            <span className="ml-1.5 opacity-70 font-mono text-[10px]">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Cue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCues.map((cue) => {
          const isHighWeight = cue.weight >= 0.12;
          return (
            <div
              key={cue.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                isHighWeight
                  ? "bg-[#151928] border-amber-500/40 shadow-lg shadow-amber-500/5"
                  : "bg-[#12141D] border-[#232636] hover:border-[#32374E]"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      {cue.category}
                    </span>
                    <h3 className="text-sm font-bold text-white">{cue.name}</h3>
                  </div>
                  <div className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#1C2030] text-amber-400 border border-[#2D334A]">
                    Weight: {cue.weight.toFixed(2)}
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {cue.description}
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-[#202330] text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Empirical Grounding</span>
                  </span>
                  <p className="text-[11px] text-neutral-300 leading-snug">
                    {cue.empiricalBasis}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Counter-Explanation / Benign Causes</span>
                  </span>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    {cue.typicalCounterExplanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
