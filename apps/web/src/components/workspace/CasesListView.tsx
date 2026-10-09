"use client";

import React, { useState } from "react";
import { FolderKanban, Plus, Search, Scale, ArrowRight, Gavel } from "lucide-react";
import { Matter } from "@/lib/workspace-data";

interface CasesListViewProps {
  matters: Matter[];
  activeMatter: Matter;
  onSelectMatter: (matter: Matter) => void;
  onSwitchToDashboard: () => void;
}

export function CasesListView({
  matters,
  activeMatter,
  onSelectMatter,
  onSwitchToDashboard,
}: CasesListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMatters = matters.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.court.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#272830]">
        <div>
          <span className="text-xs font-mono uppercase text-[#D4AF37] font-semibold">
            Case Files & Matter Portfolio
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Legal Matters Index</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage multiple active criminal and civil cases with separate evidence lockers and timelines.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter cases by title, court, or case number..."
          className="w-full bg-[#14151C] border border-[#272938] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatters.map((matter) => (
          <div
            key={matter.id}
            className={`p-5 rounded-2xl border transition-all ${
              matter.id === activeMatter.id
                ? "bg-[#181924] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/5"
                : "bg-[#14151C] border-[#262835] hover:border-[#D4AF37]/40"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {matter.caseNumber}
                </span>
                <h3 className="font-bold text-white text-base mt-1.5">{matter.title}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{matter.court}</p>
              </div>

              {matter.id === activeMatter.id && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#E6C65A] border border-[#D4AF37]/30">
                  Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300 pt-3 border-t border-[#23242E] mt-3">
              <div>
                <span className="text-neutral-500 block text-[11px]">Judge:</span>
                <span className="text-white font-medium">{matter.judge}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Speedy Trial:</span>
                <span className="text-amber-400 font-mono">
                  {matter.speedyTrialDaysRemaining > 0 ? `${matter.speedyTrialDaysRemaining}d remaining` : "N/A"}
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => {
                  onSelectMatter(matter);
                  onSwitchToDashboard();
                }}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>Enter Case Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
