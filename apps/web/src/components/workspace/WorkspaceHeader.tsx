"use client";

import React, { useState } from "react";
import {
  Scale,
  Clock,
  ShieldAlert,
  PhoneCall,
  ChevronDown,
  Check,
  Plus,
  Info,
} from "lucide-react";
import { Matter } from "@/lib/workspace-data";

interface WorkspaceHeaderProps {
  matters: Matter[];
  activeMatter: Matter;
  onSelectMatter: (matter: Matter) => void;
  onOpenNewMatterModal?: () => void;
  jurisdiction?: string;
  onChangeJurisdiction?: (jurisdiction: string) => void;
  readingLevel?: "Plain English" | "Standard Legal" | "Detailed Statutory";
  onSetReadingLevel?: (level: "Plain English" | "Standard Legal" | "Detailed Statutory") => void;
}

export function WorkspaceHeader({
  matters,
  activeMatter,
  onSelectMatter,
  onOpenNewMatterModal,
  jurisdiction,
  onChangeJurisdiction,
}: WorkspaceHeaderProps) {
  const [matterDropdownOpen, setMatterDropdownOpen] = useState(false);
  const [crisisModalOpen, setCrisisModalOpen] = useState(false);

  const speedyDays =
    typeof (activeMatter as { speedyTrialDaysRemaining?: number }).speedyTrialDaysRemaining ===
    "number"
      ? (activeMatter as { speedyTrialDaysRemaining: number }).speedyTrialDaysRemaining
      : null;
  const speedyLimit =
    typeof (activeMatter as { speedyTrialLimit?: number }).speedyTrialLimit === "number"
      ? (activeMatter as { speedyTrialLimit: number }).speedyTrialLimit
      : null;

  return (
    <>
      {/* Sticky obsidian-glass header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-900/70">
        {/* Utility tray — global safety + disclaimer only */}
        <div className="flex items-center justify-end gap-2 px-4 sm:px-6 py-1.5 border-b border-zinc-800/80 bg-zinc-950/40">
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amber-500/80">
            <Info className="w-3 h-3" />
            Pro se workspace — not legal advice
          </span>
          <button
            type="button"
            onClick={() => setCrisisModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/50 border border-red-800/50 hover:bg-red-900/50 text-red-300 text-[11px] font-medium transition-colors"
            title="Crisis & Safety Protocol"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-400" />
            <span>Crisis Help (988)</span>
          </button>
        </div>

        {/* Brand + matter switcher */}
        <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-wide text-white uppercase font-mono">
                    Chain of Command
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Legal OS
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 font-medium hidden sm:block">
                  Case operating workspace for self-represented litigants
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-zinc-800 hidden md:block" />

            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setMatterDropdownOpen(!matterDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-[#D4AF37]/50 text-xs font-medium text-zinc-200 transition-colors max-w-full"
              >
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0" />
                <div className="text-left min-w-0 leading-tight">
                  <div className="font-semibold text-white text-xs max-w-[180px] sm:max-w-[240px] truncate leading-5">
                    {activeMatter.title || "No matter open"}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono tracking-wide truncate leading-4 mt-0.5">
                    {(activeMatter.caseNumber && activeMatter.caseNumber !== "—")
                      ? activeMatter.caseNumber
                      : "No case number"}
                    {jurisdiction ? ` · ${jurisdiction}` : ""}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1 shrink-0" />
              </button>

              {matterDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50">
                  <div className="text-[10px] uppercase font-mono text-zinc-500 px-2 py-1">
                    Active legal matters
                  </div>
                  {matters.length === 0 && (
                    <p className="px-2 py-2 text-xs text-zinc-500">No matters open yet.</p>
                  )}
                  {matters.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSelectMatter(m);
                        setMatterDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                        m.id === activeMatter.id
                          ? "bg-[#D4AF37]/15 text-white border border-[#D4AF37]/30"
                          : "hover:bg-zinc-900 text-zinc-300 border border-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{m.title}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                          {m.caseNumber}
                        </div>
                      </div>
                      {m.id === activeMatter.id && (
                        <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                  {onOpenNewMatterModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setMatterDropdownOpen(false);
                        onOpenNewMatterModal();
                      }}
                      className="w-full mt-1 flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-[#D4AF37] hover:bg-[#D4AF37]/10 border border-dashed border-[#D4AF37]/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Open new matter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {speedyLimit != null &&
              speedyLimit > 0 &&
              speedyDays != null &&
              activeMatter.id !== "matter-empty" &&
              Boolean(jurisdiction && jurisdiction.trim()) && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-amber-900/40 text-xs" title="Only shown when a matter and jurisdiction are set. Confirm against your court rules.">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <div>
                  <span className="text-zinc-500">Speedy trial window: </span>
                  <span className="font-mono font-semibold text-amber-300">
                    Day {speedyDays} of {speedyLimit}
                  </span>
                </div>
              </div>
            )}
            {onChangeJurisdiction && jurisdiction !== undefined && (
              <span className="hidden xl:inline text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                {jurisdiction || "Jurisdiction unset"}
              </span>
            )}
          </div>
        </div>
      </header>

      {crisisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-red-800/60 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Emergency & crisis safety resources</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              If you or someone you know is in immediate danger, active crisis, or experiencing domestic
              violence, reach out to dedicated confidential hotlines:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl">
                <div className="font-semibold text-white text-sm">National Suicide & Crisis Lifeline</div>
                <p className="text-xs text-zinc-400 mt-0.5">Call or text 988 (24/7, free & confidential)</p>
              </div>
              <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl">
                <div className="font-semibold text-white text-sm">National Domestic Violence Hotline</div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Call 1-800-799-SAFE (7233) or text "START" to 88788
                </p>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCrisisModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Close safety notice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
