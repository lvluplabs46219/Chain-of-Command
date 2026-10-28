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
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#af0a78] to-[#e040a0] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(175,10,120,0.25)]">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-wide text-[#281330] font-sans">
                    Chain of Command
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#ffd8e8] text-[#8a005e] font-bold">
                    Legal OS
                  </span>
                </div>
                <p className="text-[11px] text-[#604868] font-medium hidden sm:block">
                  Case operating workspace for self-represented litigants
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-[#f0d5e2] hidden md:block" />

            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setMatterDropdownOpen(!matterDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ddbfca] hover:border-[#af0a78] text-xs font-semibold text-[#281330] transition-colors max-w-full shadow-sm"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#e040a0] shrink-0" />
                <div className="text-left min-w-0 leading-tight">
                  <div className="font-bold text-[#281330] text-xs max-w-[180px] sm:max-w-[240px] truncate leading-5">
                    {activeMatter.title || "No matter open"}
                  </div>
                  <div className="text-[10px] text-[#604868] font-mono tracking-wide truncate leading-4 mt-0.5">
                    {(activeMatter.caseNumber && activeMatter.caseNumber !== "—")
                      ? activeMatter.caseNumber
                      : "No case number"}
                    {jurisdiction ? ` · ${jurisdiction}` : ""}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#604868] ml-1 shrink-0" />
              </button>

              {matterDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white border border-[#f0d5e2] rounded-2xl shadow-2xl p-2.5 z-50">
                  <div className="text-[10px] uppercase font-mono text-[#8a707b] font-bold px-2 py-1">
                    Active legal matters
                  </div>
                  {matters.length === 0 && (
                    <p className="px-2 py-2 text-xs text-[#604868]">No matters open yet.</p>
                  )}
                  {matters.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSelectMatter(m);
                        setMatterDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start justify-between ${
                        m.id === activeMatter.id
                          ? "bg-[#ffd8e8] text-[#8a005e] font-semibold border border-[#ffafd5]"
                          : "hover:bg-[#fff7fb] text-[#281330] border border-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold truncate">{m.title}</div>
                        <div className="text-[10px] text-[#604868] font-mono mt-0.5 truncate">
                          {m.caseNumber}
                        </div>
                      </div>
                      {m.id === activeMatter.id && (
                        <Check className="w-4 h-4 text-[#af0a78] shrink-0 mt-0.5" />
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
                      className="w-full mt-1.5 flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs text-[#8a005e] bg-[#ffd8e8]/60 hover:bg-[#ffd8e8] border border-dashed border-[#ffafd5] font-bold transition-colors"
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
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efdbff] border border-[#d3b4fc] text-xs" title="Only shown when a matter and jurisdiction are set. Confirm against your court rules.">
                <Clock className="w-3.5 h-3.5 text-[#7c52aa]" />
                <div>
                  <span className="text-[#5b3188] font-medium">Speedy trial: </span>
                  <span className="font-mono font-bold text-[#2b0052]">
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
