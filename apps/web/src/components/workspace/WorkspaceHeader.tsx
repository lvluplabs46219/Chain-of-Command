"use client";

import React, { useState } from "react";
import {
  Scale,
  Clock,
  ShieldAlert,
  PhoneCall,
  ChevronDown,
  BookOpen,
  Info,
  Check,
} from "lucide-react";
import { Matter } from "@/lib/workspace-data";

interface WorkspaceHeaderProps {
  matters: Matter[];
  activeMatter: Matter;
  onSelectMatter: (matter: Matter) => void;
  readingLevel: "Plain English" | "Standard Legal" | "Detailed Statutory";
  onSetReadingLevel: (level: "Plain English" | "Standard Legal" | "Detailed Statutory") => void;
}

export function WorkspaceHeader({
  matters,
  activeMatter,
  onSelectMatter,
  readingLevel,
  onSetReadingLevel,
}: WorkspaceHeaderProps) {
  const [matterDropdownOpen, setMatterDropdownOpen] = useState(false);
  const [readingDropdownOpen, setReadingDropdownOpen] = useState(false);
  const [crisisModalOpen, setCrisisModalOpen] = useState(false);

  const readingLevels: Array<"Plain English" | "Standard Legal" | "Detailed Statutory"> = [
    "Plain English",
    "Standard Legal",
    "Detailed Statutory",
  ];

  return (
    <>
      <header className="bg-[#111216] border-b border-[#23242B] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 backdrop-blur">
        {/* Left: Brand & Matter Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-white uppercase font-mono">
                  Chain of Command
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Legal OS
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Case Operating Workspace for Pro Se Litigants
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-neutral-800 hidden md:block" />

          {/* Active Matter Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setMatterDropdownOpen(!matterDropdownOpen);
                setReadingDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181920] border border-[#2B2D38] hover:border-[#D4AF37]/40 text-xs font-medium text-neutral-200 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="text-left">
                <div className="font-semibold text-white max-w-[180px] sm:max-w-[240px] truncate">
                  {activeMatter.title}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  {activeMatter.caseNumber}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1" />
            </button>

            {matterDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-[#16171E] border border-[#2B2D38] rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[10px] uppercase font-mono text-neutral-400 px-2 py-1">
                  Active Legal Matters
                </div>
                {matters.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMatter(m);
                      setMatterDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                      m.id === activeMatter.id
                        ? "bg-[#D4AF37]/15 text-white border border-[#D4AF37]/30"
                        : "hover:bg-[#1E202A] text-neutral-300"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {m.caseNumber} · {m.court}
                      </div>
                    </div>
                    {m.id === activeMatter.id && (
                      <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Speedy Trial, Reading Level, Crisis Helpline */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Speedy Trial Clock */}
          {activeMatter.speedyTrialLimit > 0 && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181920] border border-[#2B2D38] text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <span className="text-neutral-400">Speedy Trial: </span>
                <span className="font-mono font-semibold text-amber-300">
                  {activeMatter.speedyTrialDaysRemaining} / {activeMatter.speedyTrialLimit}d
                </span>
              </div>
            </div>
          )}

          {/* Reading Level Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setReadingDropdownOpen(!readingDropdownOpen);
                setMatterDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181920] border border-[#2B2D38] hover:border-[#D4AF37]/40 text-xs font-medium text-neutral-300 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline text-neutral-400">Reading:</span>
              <span className="text-white font-medium">{readingLevel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {readingDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-[#16171E] border border-[#2B2D38] rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[10px] uppercase font-mono text-neutral-400 px-2 py-1">
                  Adjust Cognitive Complexity
                </div>
                {readingLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      onSetReadingLevel(lvl);
                      setReadingDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      readingLevel === lvl
                        ? "bg-[#D4AF37]/15 text-[#E6C65A] border border-[#D4AF37]/30"
                        : "hover:bg-[#1E202A] text-neutral-300"
                    }`}
                  >
                    <span>{lvl}</span>
                    {readingLevel === lvl && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Crisis Hotline Button */}
          <button
            onClick={() => setCrisisModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-800/50 hover:bg-red-900/50 text-red-300 text-xs font-medium transition-colors"
            title="Crisis & Safety Protocol"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden md:inline">Crisis (988)</span>
          </button>
        </div>
      </header>

      {/* Crisis Protocol Modal */}
      {crisisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181920] border border-red-800/60 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Emergency & Crisis Safety Resources</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              If you or someone you know is in immediate danger, active crisis, or experiencing domestic violence,
              please reach out immediately to dedicated confidential hotlines:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl">
                <div className="font-semibold text-white text-sm">National Suicide & Crisis Lifeline</div>
                <p className="text-xs text-neutral-400 mt-0.5">Call or text 988 (Available 24/7, Free & Confidential)</p>
              </div>
              <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl">
                <div className="font-semibold text-white text-sm">National Domestic Violence Hotline</div>
                <p className="text-xs text-neutral-400 mt-0.5">Call 1-800-799-SAFE (7233) or text &quot;START&quot; to 88788</p>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCrisisModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Close Safety Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
