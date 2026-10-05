"use client";

import React, { useState } from "react";
import {
  Matter,
  SpecialistAgent,
  EvidenceRecord,
  TimelineRecord,
} from "@/lib/workspace-data";
import {
  Gavel,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  Scale,
  FileSignature,
  Package,
  Info,
} from "lucide-react";
import { WorkspaceTab } from "./WorkspaceNavigation";

interface DashboardViewProps {
  matter: Matter;
  agents: SpecialistAgent[];
  evidence: EvidenceRecord[];
  timeline: TimelineRecord[];
  onNavigateTab: (tab: WorkspaceTab) => void;
  onOpenAddTimeline: () => void;
  onOpenAddEvidence: () => void;
}

export function DashboardView({
  matter,
  agents,
  evidence,
  timeline,
  onNavigateTab,
  onOpenAddTimeline,
  onOpenAddEvidence,
}: DashboardViewProps) {
  const [showSpeedyTooltip, setShowSpeedyTooltip] = useState(false);

  // Calculate days to next court date
  const nextDate = new Date(matter.nextCourtDate);
  const now = new Date();
  const diffTime = nextDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const contradictionCount = timeline.filter((t) => t.isContradiction).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Case Posture */}
      <div className="bg-[#141519] border border-[#272830] rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4 border-b border-[#23242B] pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider">Active Legal Workspace</span>
              <span className="text-neutral-600">·</span>
              <span className="text-[11px] text-neutral-300 font-mono bg-neutral-800/80 border border-neutral-700/70 px-2 py-0.5 rounded">
                {matter.caseNumber}
              </span>
              <span className="text-neutral-600">·</span>
              {/* Hardened Pro Se badge – WCAG AA compliant capsule */}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {matter.defenseStatus}
              </span>
            </div>

            {/* Elevated case caption – primary visual anchor */}
            <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-white tracking-tight drop-shadow-sm leading-tight">
              {matter.title}
            </h1>

            <p className="text-xs text-neutral-400 mt-2">
              <span className="text-neutral-300">{matter.courtName}</span>
              {" · Presiding: "}
              <span className="text-neutral-200">{matter.judge}</span>
              {" · Prosecutor: "}
              <span className="text-neutral-200">{matter.prosecutor}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab("docket")}
              className="px-3.5 py-2 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Gavel className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>View Full Docket</span>
            </button>
            <button
              onClick={() => onNavigateTab("chambers")}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-[#D4AF37] hover:bg-[#c49f27] rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-[#D4AF37]/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consult AI Team</span>
            </button>
          </div>
        </div>

        {/* 4 Case Metrics – clear value vs label contrast */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
          <div className="bg-[#191A20] border border-[#2A2B33] rounded-lg p-3.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium tracking-wider uppercase mb-1.5">
              <span>Next Appearance</span>
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {diffDays > 0 ? `${diffDays} Days` : "Today"}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-1">{matter.nextCourtType}</div>
          </div>

          {/* Speedy Trial with contextual tooltip */}
          <div
            className="bg-[#191A20] border border-[#2A2B33] rounded-lg p-3.5 relative"
            onMouseEnter={() => setShowSpeedyTooltip(true)}
            onMouseLeave={() => setShowSpeedyTooltip(false)}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium tracking-wider uppercase mb-1.5">
              <span className="flex items-center gap-1">
                Speedy Trial Clock
                <Info className="w-3 h-3 text-slate-500" />
              </span>
              <Clock className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {matter.speedyTrialDeadline}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-1">Statutory Expiration Date</div>

            {showSpeedyTooltip && (
              <div className="absolute z-20 left-0 right-0 top-full mt-2 p-3 bg-[#0F1014] border border-[#D4AF37]/40 rounded-lg shadow-xl text-left">
                <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider mb-1.5">Statutory Basis</div>
                <ul className="text-[11px] text-neutral-300 space-y-1 leading-relaxed">
                  <li>• Ind. Crim. R. 4(B) — 70-day discharge calendar</li>
                  <li>• Ind. Crim. R. 4(C) — 1-year trial rule</li>
                  <li>• Ind. Code § 35-36-8-1 — Speedy trial rights</li>
                </ul>
                <div className="text-[10px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800">
                  Accrual begins on arrest / initial appearance. Tolling may apply for defense continuances.
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#191A20] border border-[#2A2B33] rounded-lg p-3.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium tracking-wider uppercase mb-1.5">
              <span>Contested Charges</span>
              <Scale className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {matter.charges.length} Counts
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-1">
              Primary: {matter.charges[0]?.title}
            </div>
          </div>

          <div className="bg-[#191A20] border border-[#2A2B33] rounded-lg p-3.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium tracking-wider uppercase mb-1.5">
              <span>Evidence & Exhibits</span>
              <Package className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {evidence.length} Logged
            </div>
            <div className="text-[11px] text-emerald-400/90 truncate mt-1">
              {contradictionCount} Contradictions Detected
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Workbench */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 font-mono">
            Pro Se Quick Action Workbench
          </h2>
          <span className="text-xs text-neutral-500">Execute structured legal workflows</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <button
            onClick={() => onNavigateTab("chambers")}
            className="text-left bg-[#141519] hover:bg-[#1A1B22] border border-[#252630] hover:border-[#D4AF37]/40 rounded-xl p-4 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/30">
                <FileText className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Run Charge Explainer</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Translate statutory elements, Actus Reus, Mens Rea, and penalty maximums into plain 8th-grade English.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab("chambers")}
            className="text-left bg-[#141519] hover:bg-[#1A1B22] border border-[#252630] hover:border-[#D4AF37]/40 rounded-xl p-4 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/30">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Check Constitutional Rights</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Audit for 4th Amendment unlawful search, Miranda violations, and failure to produce Brady material.
            </p>
          </button>

          <button
            onClick={onOpenAddTimeline}
            className="text-left bg-[#141519] hover:bg-[#1A1B22] border border-[#252630] hover:border-[#D4AF37]/40 rounded-xl p-4 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-800/30">
                <Clock className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Log Timeline Event</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Add chronological events from police narratives and 911 dispatch to highlight contradictions.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab("draft_desk")}
            className="text-left bg-[#141519] hover:bg-[#1A1B22] border border-[#252630] hover:border-[#D4AF37]/40 rounded-xl p-4 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                <FileSignature className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Draft Brady Discovery Demand</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Generate court-ready formal discovery demand requesting bodycam footage, dispatch audio, and witness notes.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab("court_watch")}
            className="text-left bg-[#141519] hover:bg-[#1A1B22] border border-[#252630] hover:border-[#D4AF37]/40 rounded-xl p-4 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-purple-950/40 text-purple-400 border border-purple-800/30">
                <Gavel className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Court Appearance Prep Kit</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              1-page hearing preparation checklist, addressing the judge as "Your Honor", and ADA accommodations.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab("library")}
            className="text-left bg-[#141519] hover:bg-[#1A1B22] border border-[#252630] hover:border-[#D4AF37]/40 rounded-xl p-4 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-800/30">
                <Search className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Search Grounded Precedents</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Query landmark rulings (Terry v. Ohio, Miranda, Brady) with verified holdings and zero hallucinations.
            </p>
          </button>
        </div>
      </div>

      {/* Split Section: Active AI Team Roster & Contradiction Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#141519] border border-[#272830] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white text-sm">Assigned AI Legal Team</h3>
              <p className="text-xs text-neutral-400">Specialist agents active for {matter.title}</p>
            </div>
            <button
              onClick={() => onNavigateTab("chambers")}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              <span>Manage Team</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agents.slice(0, 6).map((agent) => (
              <div
                key={agent.id}
                className="bg-[#191A20] border border-[#2A2B33] rounded-lg p-3 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0 font-serif font-bold text-xs">
                  {agent.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-white truncate">{agent.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">{agent.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#141519] border border-[#272830] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-semibold text-sm text-white">Investigation Factual Radar</h3>
            </div>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Discrepancies identified between official officer accounts and tangible evidence:
            </p>

            <div className="space-y-2.5">
              {timeline
                .filter((t) => t.isContradiction)
                .slice(0, 2)
                .map((item) => (
                  <div key={item.id} className="p-3 bg-[#1B1813] border border-amber-900/40 rounded-lg text-xs">
                    <div className="font-medium text-amber-200">{item.title}</div>
                    <div className="text-[11px] text-neutral-400 mt-1">{item.contradictionNote}</div>
                  </div>
                ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#23242B] mt-4 flex items-center justify-between">
            <span className="text-xs text-neutral-400">Total flags: {contradictionCount}</span>
            <button
              onClick={() => onNavigateTab("timeline")}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              <span>Audit Timeline</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
