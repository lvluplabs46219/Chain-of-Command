"use client";

import React from "react";
import {
  Activity,
  Upload,
  Radio,
  Glasses,
  FileText,
  DollarSign,
  Cpu,
  BarChart3,
  Database,
  SlidersHorizontal,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export type VeriCueTab =
  | "home"
  | "new_analysis"
  | "live_mode"
  | "smart_glasses"
  | "results"
  | "cue_breakdown"
  | "reports"
  | "profit_model"
  | "calibration"
  | "model_center"
  | "governance"
  | "settings";

interface VeriCueHeaderProps {
  activeTab: VeriCueTab;
  onSelectTab: (tab: VeriCueTab) => void;
  selectedSessionTitle?: string;
}

export function VeriCueHeader({
  activeTab,
  onSelectTab,
  selectedSessionTitle,
}: VeriCueHeaderProps) {
  const primaryNavItems: Array<{ id: VeriCueTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "home", label: "Dashboard", icon: Activity },
    { id: "new_analysis", label: "New Analysis", icon: Upload },
    { id: "live_mode", label: "Live Mode", icon: Radio },
    { id: "smart_glasses", label: "Smart Glasses HUD", icon: Glasses },
    { id: "results", label: "Results Detail", icon: Layers },
    { id: "cue_breakdown", label: "18 Cues", icon: SlidersHorizontal },
    { id: "reports", label: "Reports & Reviewer", icon: FileText },
    { id: "profit_model", label: "Profit & Monetization", icon: DollarSign },
    { id: "calibration", label: "Calibration (Brier)", icon: BarChart3 },
    { id: "model_center", label: "Model Center", icon: Cpu },
    { id: "governance", label: "Datasets", icon: Database },
  ];

  return (
    <header className="bg-[#0E1017] border-b border-[#202330] text-[#E1E2E5] sticky top-0 z-40">
      {/* Top Bar: Brand, Model Status, Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1D28]">
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectTab("home")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-neutral-950 text-sm shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">VeriCue AI</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1C2030] border border-[#2D334A] text-amber-400">
                  v2.0 Blueprint
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 hidden sm:block">
                Deception-Risk Signal Triage & Probability Architecture
              </span>
            </div>
          </div>

          {selectedSessionTitle && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400 pl-3 border-l border-[#232636]">
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-neutral-200 font-medium truncate max-w-xs">
                {selectedSessionTitle}
              </span>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-mono">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141722] border border-[#242838] text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ollama 70B Local: Ready</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141722] border border-[#242838] text-neutral-300">
            <span className="text-amber-400 font-semibold">Brier: 0.114</span>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-400">Studio FPR: 6.1%</span>
          </div>

          <button
            onClick={() => onSelectTab("reports")}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Reviewer Gate</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <nav aria-label="Main Navigation" className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto no-scrollbar">
        <ul className="flex items-center gap-1 py-1.5 list-none">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-[#161924] border border-transparent"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-neutral-400"}`} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
