"use client";

import React, { useState } from "react";
import { STITCH_FOLDERS } from "@/lib/stitch/route-map";
import { Layers, ExternalLink, Search, Check, Folder } from "lucide-react";
import { SectionHeader, StatusBadge } from "./primitives";

export function DesignArchiveView() {
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("command_center_home");

  const filteredFolders = STITCH_FOLDERS.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SectionHeader
        eyebrow="Visual Architectural Archive"
        title="Design Blueprint Archive"
        description="Browse and inspect the 85 original Stitch design blueprint mockups, UI wireframes, and layout references."
        actions={<StatusBadge variant="gold">85 Screens</StatusBadge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-[#141519] border border-[#272830] rounded-xl p-4 flex flex-col max-h-[700px]">
          <div className="mb-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter 85 design screens..."
              className="w-full bg-[#101114] border border-[#2A2B35] rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredFolders.map((folder) => {
              const isSelected = selectedFolder === folder;
              return (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30"
                      : "text-neutral-300 hover:bg-neutral-800/60"
                  }`}
                >
                  <span className="truncate">{folder}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 bg-[#141519] border border-[#272830] rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-[#23242B] pb-3 mb-4">
            <div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Selected Blueprint</span>
              <h3 className="text-base font-mono font-bold text-white mt-0.5">{selectedFolder}</h3>
            </div>
            <a
              href={`/mockups/${selectedFolder}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <span>Full Screen Window</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-[#101114] border border-[#23242B] rounded-lg p-4 flex-1 flex flex-col justify-center items-center text-center">
            <Layers className="w-12 h-12 text-[#D4AF37]/40 mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1">Blueprint Specification: {selectedFolder}</h4>
            <p className="text-xs text-neutral-400 max-w-md leading-relaxed mb-4">
              This layout template defines domain-specific typography tokens, button contracts, and table alignments
              preserved in the Chain of Command platform.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded">
              Path: components/mockups/acquit-case-workspace/NEWSTITCH/{selectedFolder}/code.html
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
