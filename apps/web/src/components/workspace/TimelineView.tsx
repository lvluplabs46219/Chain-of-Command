"use client";

import React, { useState } from "react";
import {
  Clock,
  AlertTriangle,
  FileText,
  Shield,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { Matter, TimelineEvent } from "@/lib/workspace-data";
import { ResultEnvelope } from "./ResultEnvelope";

interface TimelineViewProps {
  matter: Matter;
}

export function TimelineView({ matter }: TimelineViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = ["All", "Arrest", "Booking", "Appearance", "Discovery", "Motion"];

  const filteredEvents =
    filterCategory === "All"
      ? matter.timeline
      : matter.timeline.filter((e) => e.category === filterCategory);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#272830]">
        <div>
          <span className="text-xs font-mono uppercase text-[#D4AF37] font-semibold">
            Chronology & Contradiction Reconstruction
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Factual Case Timeline</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Reconstructed from official court dockets, discovery logs, and body-worn camera timestamps.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? "bg-[#D4AF37] text-neutral-950 font-bold"
                : "bg-[#161720] border border-[#272935] text-neutral-300 hover:bg-[#1C1E27]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Contradiction Alert Card */}
      <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 sm:p-5 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-amber-300">
            Factual Discrepancy Flagged: Vehicle Taillight Illumination
          </h3>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Incident Narrative states the vehicle had completely unilluminated tail lamps creating safety hazard on
            dark street. However, BWC-04 timestamp 22:15 confirms LED running lights active upon officer approach.
            This contradiction is critical for the Terry stop Motion to Suppress.
          </p>
        </div>
      </div>

      {/* Chronological Timeline Stream */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#252735]">
        {filteredEvents.map((event, idx) => (
          <div key={event.id} className="relative pl-10">
            {/* Timeline Node Icon */}
            <div
              className={`absolute left-1.5 top-3 -translate-x-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                event.hasContradiction
                  ? "bg-amber-500 border-amber-300 text-black"
                  : "bg-[#13141A] border-[#D4AF37] text-[#D4AF37]"
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>

            <div
              className={`bg-[#14151C] border rounded-xl p-4 sm:p-5 space-y-2 transition-all ${
                event.hasContradiction
                  ? "border-amber-700/60 shadow-lg shadow-amber-950/20"
                  : "border-[#262835]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#D4AF37]">
                    {event.date} {event.time && `· ${event.time}`}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {event.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1E28] text-neutral-400 border border-[#2B2D3A]">
                  {event.sourceType}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">{event.title}</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">{event.description}</p>

              {event.sourceDoc && (
                <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-1">
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Source Record: {event.sourceDoc}</span>
                </div>
              )}

              {event.hasContradiction && (
                <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-lg text-xs text-amber-300 space-y-1 mt-2">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Contradiction Analysis:</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90">{event.contradictionNote}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
