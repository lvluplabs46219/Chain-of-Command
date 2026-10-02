"use client";

import React from "react";
import {
  LayoutDashboard,
  Gavel,
  Users,
  BookOpen,
  Search,
  Clock,
  FileSignature,
  Eye,
  UserCheck,
  CalendarCheck2,
  Shield,
  Layers,
} from "lucide-react";

export type WorkspaceTab =
  | "dashboard"
  | "docket"
  | "chambers"
  | "library"
  | "investigations"
  | "timeline"
  | "draft_desk"
  | "court_watch"
  | "directory"
  | "tasks"
  | "audit"
  | "archive";

interface WorkspaceNavigationProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
}

const TABS: { id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
  { id: "docket", label: "The Docket", icon: Gavel },
  { id: "chambers", label: "Chambers (AI Team)", icon: Users },
  { id: "library", label: "Legal Library", icon: BookOpen },
  { id: "investigations", label: "Investigations", icon: Search },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "draft_desk", label: "Draft Desk", icon: FileSignature },
  { id: "court_watch", label: "Court Watch", icon: Eye },
  { id: "directory", label: "Attorney Directory", icon: UserCheck },
  { id: "tasks", label: "Tasks & Deadlines", icon: CalendarCheck2 },
  { id: "audit", label: "Audit & Security", icon: Shield },
  { id: "archive", label: "Design Archive", icon: Layers },
];

export function WorkspaceNavigation({ activeTab, onTabChange }: WorkspaceNavigationProps) {
  return (
    <nav className="bg-[#111215] border-b border-[#222328] px-4 overflow-x-auto whitespace-nowrap hide-scrollbar flex items-center gap-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-medium border-b-2 transition-all shrink-0 ${
            
  isActive
                ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 font-semibold"
                : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D4AF37]" : "text-neutral-400"}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
