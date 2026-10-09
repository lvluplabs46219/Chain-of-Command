"use client";

import React from "react";
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
  const hasMatter = matter.id !== "matter-empty";
  const nextDate = matter.nextCourtDate ? new Date(matter.nextCourtDate) : (matter.deadlines?.[0]?.dueDate ? new Date(matter.deadlines[0].dueDate) : null);
  const now = new Date();
  const diffDays =
    nextDate && !Number.isNaN(nextDate.getTime())
      ? Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

  const contradictionCount = timeline.filter((t) => t.isContradiction).length;

  if (!hasMatter) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-[#141519] border border-[#272830] rounded-xl p-8 text-center space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">Command Center</p>
          <h1 className="text-2xl font-serif font-bold text-white">Welcome to your workspace</h1>
          <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            You do not have an open matter yet. Create one from the header, or open the Docket to
            start organizing filings, evidence, and deadlines.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab("docket")}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#D4AF37] text-neutral-950 hover:bg-[#c49f27]"
            >
              Go to The Docket
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab("chambers")}
              className="px-4 py-2.5 text-xs font-medium rounded-lg border border-[#2A2B35] text-neutral-200 hover:border-[#D4AF37]/40"
            >
              Open Chambers (AI)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Case Posture */}
      <div className="bg-[#141519] border border-[#272830] rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-[#23242B] pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-semibold">Active Legal Workspace</span>
              <span className="text-neutral-600">·</span>
              <span className="text-xs text-neutral-300 font-mono bg-neutral-800/80 border border-neutral-700/70 px-2 py-0.5 rounded font-semibold">{matter.caseNumber}</span>
              <span className="text-neutral-600">·</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{matter.defenseStatus || "Self-Represented (Pro Se)"}</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-white tracking-tight drop-shadow-sm leading-tight">
              {matter.title}
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1.5">
              {matter.courtName || matter.court || "—"} · Presiding: <span className="text-neutral-200 font-medium">{matter.judge}</span> · Prosecutor: <span className="text-neutral-200 font-medium">{matter.prosecutor}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
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

        {/* 4 Case Metrics — bento cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
              <span>Next appearance</span>
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <div className="text-xl font-bold text-white tabular-nums">
              {diffDays == null ? "—" : diffDays > 0 ? `${diffDays} Days` : "Today"}
            </div>
            <div className="text-[11px] text-zinc-500 truncate mt-0.5">{matter.nextCourtType}</div>
          </div>

          <div className="group relative bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 overflow-hidden cursor-help">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-700/80" aria-hidden />
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1">
                <span>Speedy trial clock</span>
                <Info className="w-3 h-3 text-amber-500/80 group-hover:text-amber-400" />
              </span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-white tabular-nums">{matter.speedyTrialDeadline || (matter.speedyTrialDaysRemaining ? `${matter.speedyTrialDaysRemaining} days remaining` : "—")}</div>
            <div className="text-[11px] text-zinc-500 truncate mt-0.5">Statutory expiration date</div>

            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-72 p-3 rounded-lg bg-zinc-950 border border-amber-700/50 shadow-2xl text-[11px] text-zinc-200 pointer-events-none">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Statutory speedy trial</span>
              </div>
              <p className="text-zinc-300 leading-relaxed mb-1.5">
                Under applicable state speedy-trial rules, the defense may demand trial within the calculated statutory window. Confirm with primary sources for your jurisdiction.
              </p>
              <div className="pt-1.5 border-t border-white/10 font-mono text-[10px] text-zinc-500">
                Deadline on file: <span className="text-zinc-200">{matter.speedyTrialDeadline || "—"}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
              <span>Contested charges</span>
              <Scale className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-white tabular-nums">{matter.charges.length} Counts</div>
            <div className="text-[11px] text-zinc-500 truncate mt-0.5">Primary: {matter.charges[0]?.title}</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
              <span>Evidence & exhibits</span>
              <Package className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white tabular-nums">{evidence.length} Logged</div>
            <div className="text-[11px] text-emerald-400/90 truncate mt-0.5">{contradictionCount} contradictions flagged</div>
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
            className="text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-800/50 hover:border-[#D4AF37]/40 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/30">
                <FileText className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Run Charge Explainer</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">
              Plain-language elements, mental state, and max penalties.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab("chambers")}
            className="text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-800/50 hover:border-[#D4AF37]/40 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/30">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Check Constitutional Rights</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">
              Fourth, Fifth, and Sixth Amendment checklist against your facts.
            </p>
          </button>

          <button
            onClick={onOpenAddTimeline}
            className="text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-800/50 hover:border-[#D4AF37]/40 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-800/30">
                <Clock className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Log Timeline Event</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">
              Log events from reports and flags timeline gaps.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab("draft_desk")}
            className="text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-800/50 hover:border-[#D4AF37]/40 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                <FileSignature className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Draft Brady Discovery Demand</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">
              Draft a discovery demand labeled for human review.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab("court_watch")}
            className="text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-800/50 hover:border-[#D4AF37]/40 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-purple-950/40 text-purple-400 border border-purple-800/30">
                <Gavel className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Court Appearance Prep Kit</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">
              One-page hearing checklist and courtroom basics.
            </p>
          </button>

          <button
            onClick={() => onNavigateTab("library")}
            className="text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-800/50 hover:border-[#D4AF37]/40 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-800/30">
                <Search className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-semibold text-white text-sm">Search Grounded Precedents</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">
              Search verified authorities with citations required.
            </p>
          </button>
        </div>
      </div>

      {/* Split Section: Active AI Team Roster & Contradiction Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Legal Team Roster Preview */}
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

        {/* Right: Contradictions & Discrepancies Radar */}
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
