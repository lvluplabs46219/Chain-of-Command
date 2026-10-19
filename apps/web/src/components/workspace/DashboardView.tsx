"use client";

import React, { useEffect } from "react";
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
  onOpenNewMatter?: () => void;
}

export function DashboardView({
  matter,
  agents,
  evidence,
  timeline,
  onNavigateTab,
  onOpenAddTimeline,
  onOpenAddEvidence,
  onOpenNewMatter,
}: DashboardViewProps) {
  const hasMatter = matter.id !== "matter-empty";
  const nextDate = matter.nextCourtDate
    ? new Date(matter.nextCourtDate)
    : matter.deadlines?.[0]?.dueDate
      ? new Date(matter.deadlines[0].dueDate)
      : null;
  const now = new Date();
  const diffDays =
    nextDate && !Number.isNaN(nextDate.getTime())
      ? Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

  const contradictionCount = (timeline ?? []).filter((t) => t?.isContradiction).length;

  // Direct corner hotkey keyboard triggers (1-6) when not typing in form inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      switch (e.key) {
        case "1":
          e.preventDefault();
          onNavigateTab("chambers");
          break;
        case "2":
          e.preventDefault();
          onNavigateTab("chambers");
          break;
        case "3":
          e.preventDefault();
          onOpenAddTimeline();
          break;
        case "4":
          e.preventDefault();
          onNavigateTab("draft_desk");
          break;
        case "5":
          e.preventDefault();
          onNavigateTab("court_watch");
          break;
        case "6":
          e.preventDefault();
          onNavigateTab("library");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNavigateTab, onOpenAddTimeline]);

  if (!hasMatter) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-[#141519] border border-[#272830] rounded-xl p-8 text-center space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
            Command Center
          </p>
          <h1 className="text-2xl font-serif font-bold text-white">Welcome to your workspace</h1>
          <p className="text-sm text-zinc-100 max-w-md mx-auto leading-relaxed font-medium">
            You do not have an open matter yet. Start by creating or opening a case file — that unlocks
            deadlines, evidence, and the AI team on your data.
          </p>
          <div className="flex flex-col items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => (onOpenNewMatter ? onOpenNewMatter() : onNavigateTab("docket"))}
              className="px-5 py-2.5 text-xs font-bold rounded-lg bg-[#D4AF37] text-neutral-950 hover:bg-[#c49f27] transition-colors shadow-md shadow-[#D4AF37]/10"
            >
              Create / open matter
            </button>
            <p className="text-[11px] text-zinc-500 max-w-sm">
              After you open a matter, you can use The Docket and Chambers on your real case data.
            </p>
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
              <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                Active Legal Workspace
              </span>
              <span className="text-zinc-500">·</span>
              <span className="text-xs text-white font-mono bg-zinc-900 border border-zinc-700/80 px-2.5 py-0.5 rounded font-bold tracking-wide">
                {matter.caseNumber}
              </span>
              <span className="text-zinc-500">·</span>
              {/* Static data value: high contrast neutral, reserving amber for interactive focal elements */}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-100 bg-zinc-900/90 border border-zinc-700 px-2.5 py-0.5 rounded font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                <span>{matter.defenseStatus || "Self-Represented (Pro Se)"}</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-white tracking-tight drop-shadow-sm leading-tight">
              {matter.title}
            </h1>
            {/* Enhanced typography & micro-contrast for secondary body description (WCAG AA compliant: >= 4.5:1) */}
            <p className="text-sm font-semibold text-zinc-100 mt-2 leading-relaxed">
              <span>{matter.courtName || matter.court || "—"}</span>
              <span className="text-zinc-400 mx-2">·</span>
              <span>Presiding: </span>
              <span className="text-white font-bold">{matter.judge || "Unassigned"}</span>
              <span className="text-zinc-400 mx-2">·</span>
              <span>Prosecutor: </span>
              <span className="text-white font-bold">
                {matter.prosecutor || "Office of the District Attorney"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab("docket")}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Gavel className="w-3.5 h-3.5 text-zinc-300" />
              <span>View Full Docket</span>
            </button>
            {/* Primary interactive CTA: reserved Amber focus */}
            <button
              onClick={() => onNavigateTab("chambers")}
              className="px-4 py-2 text-xs font-bold text-neutral-950 bg-[#D4AF37] hover:bg-[#c49f27] rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-[#D4AF37]/20 ring-1 ring-[#D4AF37]/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
              <span>Consult AI Team</span>
            </button>
          </div>
        </div>

        {/* 4 Case Metrics — clean high-contrast static data values, letter-spaced all-caps headers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between text-[10px] text-zinc-200 font-mono uppercase tracking-widest mb-1.5 font-semibold">
              <span>Next appearance</span>
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {diffDays == null ? "—" : diffDays > 0 ? `${diffDays} Days` : "Today"}
            </div>
            <div className="text-xs font-semibold text-zinc-200 truncate mt-1">
              {matter.nextCourtType || "Hearing scheduled"}
            </div>
          </div>

          <div className="group relative bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 cursor-help">
            <div className="flex items-center justify-between text-[10px] text-zinc-200 font-mono uppercase tracking-widest mb-1.5 font-semibold">
              <span className="flex items-center gap-1">
                <span>Speedy trial clock</span>
                <Info className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200" />
              </span>
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {matter.speedyTrialLimit != null && matter.speedyTrialDaysRemaining != null
                ? `Day ${matter.speedyTrialDaysRemaining} of ${matter.speedyTrialLimit}`
                : matter.speedyTrialDeadline ||
                  (matter.speedyTrialDaysRemaining != null
                    ? `Day ${matter.speedyTrialDaysRemaining}`
                    : "—")}
            </div>
            <div className="text-xs font-semibold text-zinc-200 truncate mt-1">
              Days into the statutory speedy-trial window
            </div>

            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-72 p-3 rounded-lg bg-zinc-950 border border-zinc-700 shadow-2xl text-xs text-zinc-200 pointer-events-none">
              <div className="flex items-center gap-1.5 text-zinc-100 font-bold font-mono mb-1">
                <Clock className="w-3.5 h-3.5 text-zinc-300" />
                <span>Statutory speedy trial</span>
              </div>
              <p className="text-zinc-200 leading-relaxed mb-1.5 text-xs font-medium">
                Under applicable state speedy-trial rules, the defense may demand trial within the
                calculated statutory window. Confirm with primary sources for your jurisdiction.
              </p>
              <div className="pt-1.5 border-t border-zinc-800 font-mono text-[10px] text-zinc-300">
                Deadline on file:{" "}
                <span className="text-white font-bold">{matter.speedyTrialDeadline || "—"}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between text-[10px] text-zinc-200 font-mono uppercase tracking-widest mb-1.5 font-semibold">
              <span>Contested charges</span>
              <Scale className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {matter.charges.length} Counts
            </div>
            <div className="text-xs font-semibold text-zinc-200 truncate mt-1">
              Primary: {matter.charges[0]?.title || "Pending count"}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between text-[10px] text-zinc-200 font-mono uppercase tracking-widest mb-1.5 font-semibold">
              <span>Evidence & exhibits</span>
              <Package className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">{evidence.length} Logged</div>
            <div className="text-xs font-semibold text-zinc-200 truncate mt-1">
              {contradictionCount} contradictions flagged
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Workbench — Consolidated with subtle corner hotkey badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-100 font-mono">
            Pro Se Quick Action Workbench
          </h2>
          <span className="text-xs text-zinc-300 font-medium">
            Press hotkeys <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[10px] font-semibold">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[10px] font-semibold">6</kbd> to launch workflows
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Card 1: Hotkey 1 */}
          <button
            onClick={() => onNavigateTab("chambers")}
            className="relative text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-900/60 hover:border-[#D4AF37]/50 group"
          >
            {/* Corner hotkey badge */}
            <div className="absolute top-3.5 right-3.5 z-10">
              <kbd className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 group-hover:text-amber-400 group-hover:border-amber-500/40 group-hover:bg-amber-950/20 transition-all shadow-sm">
                1
              </kbd>
            </div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 group-hover:text-amber-400 group-hover:border-amber-500/30 group-hover:bg-amber-950/20 transition-colors">
                <FileText className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all mr-7" />
            </div>
            <h3 className="font-bold text-white text-sm">Run Charge Explainer</h3>
            <p className="text-xs text-zinc-200 mt-1.5 leading-relaxed font-medium">
              Plain-language elements, mental state, and statutory penalty tiers.
            </p>
          </button>

          {/* Card 2: Hotkey 2 */}
          <button
            onClick={() => onNavigateTab("chambers")}
            className="relative text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-900/60 hover:border-[#D4AF37]/50 group"
          >
            <div className="absolute top-3.5 right-3.5 z-10">
              <kbd className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 group-hover:text-amber-400 group-hover:border-amber-500/40 group-hover:bg-amber-950/20 transition-all shadow-sm">
                2
              </kbd>
            </div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 group-hover:text-amber-400 group-hover:border-amber-500/30 group-hover:bg-amber-950/20 transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all mr-7" />
            </div>
            <h3 className="font-bold text-white text-sm">Check Constitutional Rights</h3>
            <p className="text-xs text-zinc-200 mt-1.5 leading-relaxed font-medium">
              Fourth, Fifth, and Sixth Amendment checklist evaluated against your case facts.
            </p>
          </button>

          {/* Card 3: Hotkey 3 */}
          <button
            onClick={onOpenAddTimeline}
            className="relative text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-900/60 hover:border-[#D4AF37]/50 group"
          >
            <div className="absolute top-3.5 right-3.5 z-10">
              <kbd className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 group-hover:text-amber-400 group-hover:border-amber-500/40 group-hover:bg-amber-950/20 transition-all shadow-sm">
                3
              </kbd>
            </div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 group-hover:text-amber-400 group-hover:border-amber-500/30 group-hover:bg-amber-950/20 transition-colors">
                <Clock className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all mr-7" />
            </div>
            <h3 className="font-bold text-white text-sm">Log Timeline Event</h3>
            <p className="text-xs text-zinc-200 mt-1.5 leading-relaxed font-medium">
              Chronological ledger tracking police narratives, dispatch audio, and gap flags.
            </p>
          </button>

          {/* Card 4: Hotkey 4 */}
          <button
            onClick={() => onNavigateTab("draft_desk")}
            className="relative text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-900/60 hover:border-[#D4AF37]/50 group"
          >
            <div className="absolute top-3.5 right-3.5 z-10">
              <kbd className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 group-hover:text-amber-400 group-hover:border-amber-500/40 group-hover:bg-amber-950/20 transition-all shadow-sm">
                4
              </kbd>
            </div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 group-hover:text-amber-400 group-hover:border-amber-500/30 group-hover:bg-amber-950/20 transition-colors">
                <FileSignature className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all mr-7" />
            </div>
            <h3 className="font-bold text-white text-sm">Draft Brady Discovery Demand</h3>
            <p className="text-xs text-zinc-200 mt-1.5 leading-relaxed font-medium">
              Draft formal discovery request for BWC footage and CAD logs, prepared for human review.
            </p>
          </button>

          {/* Card 5: Hotkey 5 */}
          <button
            onClick={() => onNavigateTab("court_watch")}
            className="relative text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-900/60 hover:border-[#D4AF37]/50 group"
          >
            <div className="absolute top-3.5 right-3.5 z-10">
              <kbd className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 group-hover:text-amber-400 group-hover:border-amber-500/40 group-hover:bg-amber-950/20 transition-all shadow-sm">
                5
              </kbd>
            </div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 group-hover:text-amber-400 group-hover:border-amber-500/30 group-hover:bg-amber-950/20 transition-colors">
                <Gavel className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all mr-7" />
            </div>
            <h3 className="font-bold text-white text-sm">Court Appearance Prep Kit</h3>
            <p className="text-xs text-zinc-200 mt-1.5 leading-relaxed font-medium">
              One-page hearing preparation checklist, addressing the judge, and courtroom etiquette.
            </p>
          </button>

          {/* Card 6: Hotkey 6 */}
          <button
            onClick={() => onNavigateTab("library")}
            className="relative text-left bg-zinc-950 border border-zinc-800 rounded-xl p-4 transition-all duration-200 hover:bg-zinc-900/60 hover:border-[#D4AF37]/50 group"
          >
            <div className="absolute top-3.5 right-3.5 z-10">
              <kbd className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 group-hover:text-amber-400 group-hover:border-amber-500/40 group-hover:bg-amber-950/20 transition-all shadow-sm">
                6
              </kbd>
            </div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 group-hover:text-amber-400 group-hover:border-amber-500/30 group-hover:bg-amber-950/20 transition-colors">
                <Search className="w-4 h-4" />
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all mr-7" />
            </div>
            <h3 className="font-bold text-white text-sm">Search Grounded Precedents</h3>
            <p className="text-xs text-zinc-200 mt-1.5 leading-relaxed font-medium">
              Query landmark rulings with primary statutory holdings and zero ungrounded assertions.
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
              <h3 className="font-bold text-white text-sm">Assigned AI Legal Team</h3>
              <p className="text-xs font-semibold text-zinc-200 mt-0.5">
                Specialist agents active for {matter.title}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("chambers")}
              className="text-xs font-bold text-[#D4AF37] hover:text-amber-300 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Manage Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agents.slice(0, 6).map((agent) => (
              <div
                key={agent.id}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-200 shrink-0 font-serif font-bold text-xs">
                  {agent.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white truncate">{agent.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                  </div>
                  <p className="text-xs text-zinc-200 truncate mt-0.5 font-medium">{agent.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contradictions & Discrepancies Radar */}
        <div className="bg-[#141519] border border-[#272830] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-zinc-100 mb-2">
              <AlertTriangle className="w-4 h-4 text-zinc-300" />
              <h3 className="font-bold text-sm text-white">Investigation Factual Radar</h3>
            </div>
            <p className="text-xs text-zinc-200 mb-4 leading-relaxed font-medium">
              Discrepancies identified between official officer accounts and tangible evidence:
            </p>

            <div className="space-y-2.5">
              {timeline
                .filter((t) => t.isContradiction)
                .slice(0, 2)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                  >
                    <div className="font-bold text-white">{item.title}</div>
                    <div className="text-xs text-zinc-200 mt-1 leading-relaxed font-medium">
                      {item.contradictionNote}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 mt-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">
              Total flags: {contradictionCount}
            </span>
            <button
              onClick={() => onNavigateTab("timeline")}
              className="text-xs font-bold text-[#D4AF37] hover:text-amber-300 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Audit Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
