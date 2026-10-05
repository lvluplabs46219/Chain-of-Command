"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  LayoutDashboard,
  Gavel,
  Users,
  BookOpen,
  Clock,
  FileSignature,
  Eye,
  UserCheck,
  CalendarCheck2,
  Shield,
  Layers,
  ArrowRight,
  CornerDownLeft,
  X,
  Sparkles,
} from "lucide-react";
import { WorkspaceTab } from "./WorkspaceNavigation";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenCrisisHelp?: () => void;
  onOpenNewMatter?: () => void;
}

interface CommandItem {
  id: string;
  tabId?: WorkspaceTab;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  onSelectTab,
  onOpenCrisisHelp,
  onOpenNewMatter,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = useMemo(() => [
    {
      id: "dashboard",
      tabId: "dashboard",
      title: "Command Center",
      subtitle: "Overview dashboard, case posture, speedy trial clock, and appearance calendar",
      badge: "NODE 01",
      icon: LayoutDashboard,
    },
    {
      id: "docket",
      tabId: "docket",
      title: "The Docket",
      subtitle: "Chronological court filings, motions, orders, and verified entries",
      badge: "NODE 02",
      icon: Gavel,
    },
    {
      id: "chambers",
      tabId: "chambers",
      title: "Chambers (AI Legal Team)",
      subtitle: "6 specialized AI legal agents, rights audit, plea analysis, mitigation builder",
      badge: "NODE 03",
      icon: Users,
    },
    {
      id: "library",
      tabId: "library",
      title: "Legal Library",
      subtitle: "Statutory codes, appellate precedents, court rules, and verified authorities",
      badge: "NODE 04",
      icon: BookOpen,
    },
    {
      id: "investigations",
      tabId: "investigations",
      title: "Investigations",
      subtitle: "Evidence organizer, exhibits, contradict detector, and forensic records",
      badge: "NODE 05",
      icon: Search,
    },
    {
      id: "timeline",
      tabId: "timeline",
      title: "Timeline",
      subtitle: "Arrest to arraignment chronology, factual events, and discrepancy ledger",
      badge: "NODE 06",
      icon: Clock,
    },
    {
      id: "draft_desk",
      tabId: "draft_desk",
      title: "Draft Desk",
      subtitle: "Pro se legal document drafting, motion templates, and human review packets",
      badge: "NODE 07",
      icon: FileSignature,
    },
    {
      id: "court_watch",
      tabId: "court_watch",
      title: "Court Watch",
      subtitle: "Courtroom readiness kits, logistics checklists, and judicial monitors",
      badge: "NODE 08",
      icon: Eye,
    },
    {
      id: "directory",
      tabId: "directory",
      title: "Attorney Directory",
      subtitle: "Independent non-promoted pro bono, legal aid, and defense bar search",
      badge: "NODE 09",
      icon: UserCheck,
    },
    {
      id: "tasks",
      tabId: "tasks",
      title: "Tasks & Deadlines",
      subtitle: "Deterministic court rules calendar, statutory cutoffs, and motion filings",
      badge: "NODE 10",
      icon: CalendarCheck2,
    },
    {
      id: "audit",
      tabId: "audit",
      title: "Audit & Security",
      subtitle: "Cryptographic case log, provenance ledger, and AI action authorizations",
      badge: "NODE 11",
      icon: Shield,
    },
    {
      id: "archive",
      tabId: "archive",
      title: "Design Archive",
      subtitle: "Stitch OS design system, high-fidelity mockups, and UI prototypes",
      badge: "NODE 12",
      icon: Layers,
    },
  ], []);

  // Filter commands by query
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.badge.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Autofocus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === "Enter" && filtered.length > 0) {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          if (selected.tabId) onSelectTab(selected.tabId);
          if (selected.action) selected.action();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, onSelectTab]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Workspace Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0F1015] border border-[#2E313D] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ring-1 ring-[#D4AF37]/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#222430] bg-[#14151C]">
          <Search className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to any workspace category (e.g. 'Docket', 'AI Team', 'Timeline')..."
            className="w-full bg-transparent text-white placeholder-neutral-500 text-sm md:text-base outline-none font-mono"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700">
              ESC TO CLOSE
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1 flex-1 hide-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 font-mono text-sm">
              <Search className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p>No matching workspace categories found.</p>
              <p className="text-xs text-neutral-500 mt-1">Try searching for "docket", "agents", "rules", or "evidence"</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.tabId) onSelectTab(item.tabId);
                    if (item.action) item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all font-mono ${
                    isSelected
                      ? "bg-gradient-to-r from-[#241F14] via-[#161822] to-[#12141C] border border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)] text-white"
                      : "bg-[#12131A]/60 border border-transparent text-neutral-300 hover:bg-[#161822] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-[#D4AF37] text-black shadow-[0_0_12px_#D4AF37]"
                          : "bg-[#1E212E] text-neutral-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{item.title}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                            isSelected
                              ? "bg-[#D4AF37]/20 border-[#D4AF37]/60 text-[#EFE6D0]"
                              : "bg-white/5 border-white/10 text-neutral-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-0.5 font-sans">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 pl-3">
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-[#D4AF37] font-semibold">
                        <span>SELECT</span>
                        <CornerDownLeft className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-neutral-600" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-[#0C0D12] border-t border-[#222430] flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-300">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-300">↓</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-300">↵</kbd>
              <span className="ml-1">Open Node</span>
            </span>
          </div>
          <span className="text-[#D4AF37] font-medium hidden sm:inline">12 WORKSPACE NODES INDEXED</span>
        </div>
      </div>
    </div>
  );
}
