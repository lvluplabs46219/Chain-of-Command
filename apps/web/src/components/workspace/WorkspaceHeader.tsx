"use client";

import React, { useState } from "react";
import { Scale, AlertCircle, Phone, FileWarning, ChevronDown, Plus } from "lucide-react";
import { Matter } from "@/lib/workspace-data";
import { TelemetryPill } from "./primitives";

interface WorkspaceHeaderProps {
  matters: Matter[];
  activeMatter: Matter;
  onSelectMatter: (matter: Matter) => void;
  onOpenNewMatterModal: () => void;
  jurisdiction: string;
  onChangeJurisdiction: (j: string) => void;
}

export function WorkspaceHeader({
  matters,
  activeMatter,
  onSelectMatter,
  onOpenNewMatterModal,
  jurisdiction,
  onChangeJurisdiction,
}: WorkspaceHeaderProps) {
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showUplModal, setShowUplModal] = useState(false);
  const [matterDropdownOpen, setMatterDropdownOpen] = useState(false);

  return (
    <>
      <header className="bg-[#0E0E10] border-b border-[#222328] px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-white tracking-wide">CHAIN OF COMMAND</span>
              <span className="text-[11px] font-mono text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20 uppercase">
                Pro Se Legal OS
              </span>
            </div>
            <p className="text-xs text-neutral-400">Legal Self-Representation & Multi-Agent Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setMatterDropdownOpen(!matterDropdownOpen)}
              className="flex items-center gap-2 bg-[#17181C] hover:bg-[#1E1F24] border border-[#2D2E35] text-neutral-200 text-xs px-3 py-1.5 rounded-md transition-colors"
            >
              <span className="text-neutral-400">Case:</span>
              <span className="font-medium text-white max-w-[200px] truncate">{activeMatter.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {matterDropdownOpen && (
              <div className="absolute left-0 mt-1 w-72 bg-[#17181C] border border-[#2D2E35] rounded-md shadow-xl z-50 py-1">
                <div className="px-3 py-1.5 text-[11px] font-mono text-neutral-400 uppercase tracking-wider border-b border-[#26272E]">
                  Active Matters
                </div>
                {matters.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMatter(m);
                      setMatterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-[#222329] transition-colors ${
                      m.id === activeMatter.id ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-neutral-200"
                    }`}
                  >
                    <span className="font-medium truncate">{m.title}</span>
                    <span className="text-[10px] text-neutral-400">
                      {m.caseNumber} · {m.courtName}
                    </span>
                  </button>
                ))}
                <div className="border-t border-[#26272E] mt-1 pt-1">
                  <button
                    onClick={() => {
                      setMatterDropdownOpen(false);
                      onOpenNewMatterModal();
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-[#D4AF37] hover:bg-[#222329]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Open New Legal Matter</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <select
            value={jurisdiction}
            onChange={(e) => onChangeJurisdiction(e.target.value)}
            className="bg-[#17181C] border border-[#2D2E35] text-neutral-200 text-xs px-2.5 py-1.5 rounded-md focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="Indiana">Indiana (State & Local Rules)</option>
            <option value="California">California (Penal & Court Rules)</option>
            <option value="Federal">Federal (US Code & Fed. R. Crim. P.)</option>
            <option value="New York">New York (CPL & Penal Law)</option>
            <option value="Texas">Texas (Penal & Code of Crim. Proc.)</option>
            <option value="Florida">Florida (Fla. Statutes & Rules)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <TelemetryPill className="hidden sm:inline-flex" />

          <button
            onClick={() => setShowCrisisModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-200 bg-rose-950/50 border border-rose-700/50 rounded-md hover:bg-rose-900/50 transition-colors"
            title="Immediate Safety & Crisis Lifelines"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Crisis Help (988)</span>
          </button>

          <button
            onClick={() => setShowUplModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-md hover:bg-[#D4AF37]/20 transition-colors"
          >
            <FileWarning className="w-3.5 h-3.5" />
            <span>Pro Se Disclaimer</span>
          </button>
        </div>
      </header>

      {showCrisisModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-rose-700/60 rounded-xl max-w-lg w-full p-6 text-neutral-200 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-lg font-bold text-white">Emergency Safety & Crisis Lifelines</h2>
            </div>
            <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
              If you or someone else is in immediate danger, experiencing domestic violence, or in distress, please
              prioritize personal safety above legal proceedings:
            </p>
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-lg">
                <div className="font-semibold text-rose-300 text-sm">988 Suicide & Crisis Lifeline</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Call or text 988 (Available 24 hours / Free & Confidential)
                </div>
              </div>
              <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-lg">
                <div className="font-semibold text-amber-300 text-sm">National Domestic Violence Hotline</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Call 1-800-799-SAFE (7233) or text "START" to 88788
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCrisisModal(false)}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-xs font-medium"
            >
              Close Safety Notice
            </button>
          </div>
        </div>
      )}

      {showUplModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-[#D4AF37]/50 rounded-xl max-w-lg w-full p-6 text-neutral-200 shadow-2xl">
            <div className="flex items-center gap-3 text-[#D4AF37] mb-4">
              <FileWarning className="w-6 h-6" />
              <h2 className="text-lg font-serif font-bold text-white">Notice to Self-Represented Litigant</h2>
            </div>
            <div className="text-xs text-neutral-300 space-y-3 mb-6 leading-relaxed">
              <p className="font-mono text-[#D4AF37] bg-[#D4AF37]/10 p-2 rounded border border-[#D4AF37]/20">
                [PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]
              </p>
              <p>
                Chain of Command is a legal technology operating system built to assist individuals in organizing
                factual records, understanding procedural rules, and researching statutory authorities.
              </p>
              <p>
                <strong>No Attorney-Client Relationship:</strong> Use of this software does not create an
                attorney-client relationship. The AI agents do not act as licensed legal counsel, cannot represent you
                in court, and will never autonomously file documents or enter pleas on your behalf.
              </p>
              <p>
                All generated drafts, checklists, and statutory citations must be reviewed independently by you or a
                licensed attorney before any court appearance or submission.
              </p>
            </div>
            <button
              onClick={() => setShowUplModal(false)}
              className="w-full py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-semibold rounded-md text-xs"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>
      )}
    </>
  );
}
