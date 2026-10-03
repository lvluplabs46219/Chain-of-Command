"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  LogIn,
  User,
} from "lucide-react";
import { NavFeatureCarousel } from "./NavFeatureCarousel";

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

/** Canonical routes for Chain of Command modules */
export const TAB_ROUTES: Record<WorkspaceTab, string> = {
  dashboard: "/",
  docket: "/docket",
  chambers: "/chambers",
  library: "/library",
  investigations: "/investigations",
  timeline: "/timeline",
  draft_desk: "/draft-desk",
  court_watch: "/court-watch",
  directory: "/directory",
  tasks: "/tasks",
  audit: "/audit",
  archive: "/archive",
};

export function pathToTab(pathname: string): WorkspaceTab | null {
  if (pathname === "/" || pathname === "") return "dashboard";
  if (pathname.startsWith("/ai-intelligence")) return "chambers";
  const entry = Object.entries(TAB_ROUTES).find(
    ([, route]) => route !== "/" && pathname.startsWith(route)
  );
  return entry ? (entry[0] as WorkspaceTab) : null;
}

const TABS: {
  id: WorkspaceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
  { id: "docket", label: "The Docket", icon: Gavel },
  { id: "chambers", label: "Chambers", icon: Users },
  { id: "library", label: "Law Library", icon: BookOpen },
  { id: "investigations", label: "Investigations", icon: Search },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "draft_desk", label: "Draft Desk", icon: FileSignature },
  { id: "court_watch", label: "Court Watch", icon: Eye },
  { id: "directory", label: "Counsel Directory", icon: UserCheck },
  { id: "tasks", label: "Tasks", icon: CalendarCheck2 },
  { id: "audit", label: "Audit", icon: Shield },
  { id: "archive", label: "Archive", icon: Layers },
];

export function WorkspaceNavigation({ activeTab, onTabChange }: WorkspaceNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="bg-[#111215] border-b border-[#222328]">
      {/* Featured module carousel */}
      <div className="px-4 py-1.5 border-b border-[#1a1b20] flex items-center justify-between gap-3 flex-wrap">
        <NavFeatureCarousel className="flex-1" />
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-[#D4AF37] px-2 py-1 rounded border border-transparent hover:border-[#D4AF37]/30 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Login</span>
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-950 bg-[#D4AF37] hover:bg-[#c49f27] px-2.5 py-1 rounded transition-colors"
          >
            Sign up
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/25 transition-colors"
            title="Profile"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Profile</span>
          </Link>
        </div>
      </div>

      {/* Primary module tabs — real routes */}
      <nav
        className="px-4 overflow-x-auto whitespace-nowrap hide-scrollbar flex items-center gap-1"
        aria-label="Workspace modules"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const href = TAB_ROUTES[tab.id];
          const isActive =
            activeTab === tab.id ||
            (pathname === href) ||
            (href !== "/" && pathname?.startsWith(href));

          return (
            <Link
              key={tab.id}
              href={href}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-medium border-b-2 transition-all shrink-0 ${
                isActive
                  ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 font-semibold"
                  : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D4AF37]" : "text-neutral-400"}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
