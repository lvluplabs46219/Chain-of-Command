"use client";

import React from "react";
import { Layers, ExternalLink, Monitor, LayoutGrid } from "lucide-react";
import { SectionHeader, StatusBadge } from "./primitives";

const SCREENS = [
  { id: "command", label: "Command Center", desc: "Case KPIs, speedy-trial clock, agent roster" },
  { id: "docket", label: "The Docket", desc: "Charges & statutory elements" },
  { id: "chambers", label: "Chambers", desc: "Multi-agent consultation" },
  { id: "library", label: "Law Library", desc: "Authority search & citations" },
  { id: "invest", label: "Investigations", desc: "Evidence locker" },
  { id: "records", label: "Record Room", desc: "Documents & drafts" },
  { id: "chrono", label: "Case Timeline", desc: "Chronology & contradictions" },
  { id: "watch", label: "Court Watch", desc: "Hearing prep & filing gate" },
  { id: "counsel", label: "Counsel Directory", desc: "Neutral attorney search" },
  { id: "tasks", label: "Motions & Tasks", desc: "Deadlines & audit" },
  { id: "system", label: "Design System", desc: "Tokens & components" },
];

export function DesignArchiveView() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SectionHeader
        eyebrow="Visual Architectural Archive"
        title="Legal OS Design Prototype"
        description="Fully interactive design exploration. Production pages live in the workspace React components."
        actions={<StatusBadge variant="gold">Interactive</StatusBadge>}
      />

      <div className="bg-[#141519] border border-[#272830] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Chain of Command — Legal OS</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-lg leading-relaxed">
              Standalone prototype with live navigation, Chambers chat, docket charges, timeline, court watch, and
              design tweaks. Static Stitch HTML mockups are retired in favor of this interactive shell and the built
              workspace views.
            </p>
          </div>
        </div>
        <a
          href="/prototypes/legal-os/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 text-xs font-semibold text-neutral-950 bg-[#D4AF37] hover:bg-[#c49f27] rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <span>Open Legal OS Prototype</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-sm font-semibold text-white">Screens in the prototype</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCREENS.map((s) => (
            <div
              key={s.id}
              className="bg-[#141519] border border-[#272830] hover:border-[#D4AF37]/30 rounded-xl p-4 transition-colors"
            >
              <div className="text-xs font-mono text-[#D4AF37] uppercase mb-1">{s.id}</div>
              <div className="text-sm font-medium text-white">{s.label}</div>
              <div className="text-xs text-neutral-400 mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#101114] border border-[#23242B] rounded-lg p-4 flex items-center gap-3 text-xs text-neutral-500">
        <Layers className="w-4 h-4 text-neutral-600 shrink-0" />
        <span>
          Path: <span className="font-mono text-neutral-400">apps/web/public/prototypes/legal-os/</span> · Production
          workspace: <span className="font-mono text-neutral-400">apps/web/src/components/workspace/</span>
        </span>
      </div>
    </div>
  );
}
