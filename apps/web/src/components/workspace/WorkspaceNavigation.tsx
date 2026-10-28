"use client";

import React, { useEffect, useRef, useState } from "react";
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
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { NavFeatureCarousel } from "./NavFeatureCarousel";
import { useAuth } from "@/contexts/AuthContext";

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
  | "archive"
  | "courtroom_3d";

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
  courtroom_3d: "/courtroom-3d",
};

export function pathToTab(pathname: string): WorkspaceTab | null {
  if (pathname === "/" || pathname === "") return "dashboard";
  if (pathname.startsWith("/ai-intelligence")) return "chambers";
  const entry = Object.entries(TAB_ROUTES).find(
    ([, route]) => route !== "/" && pathname.startsWith(route)
  );
  return entry ? (entry[0] as WorkspaceTab) : null;
}

const PRIMARY_TABS: {
  id: WorkspaceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
  { id: "docket", label: "The Docket", icon: Gavel },
  { id: "chambers", label: "Chambers", icon: Users },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "draft_desk", label: "Draft Desk", icon: FileSignature },
  { id: "tasks", label: "Tasks", icon: CalendarCheck2 },
];

const MORE_TABS: {
  id: WorkspaceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "library", label: "Law Library", icon: BookOpen },
  { id: "investigations", label: "Investigations", icon: Search },
  { id: "court_watch", label: "Court Watch", icon: Eye },
  { id: "directory", label: "Counsel Directory", icon: UserCheck },
  { id: "audit", label: "Audit", icon: Shield },
  { id: "archive", label: "Archive", icon: Layers },
];

function tabActive(
  tabId: WorkspaceTab,
  activeTab: WorkspaceTab,
  pathname: string | null
): boolean {
  const href = TAB_ROUTES[tabId];
  return (
    activeTab === tabId ||
    pathname === href ||
    (href !== "/" && !!pathname?.startsWith(href))
  );
}

export function WorkspaceNavigation({ activeTab, onTabChange }: WorkspaceNavigationProps) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const moreIsActive = MORE_TABS.some((t) => tabActive(t.id, activeTab, pathname));

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [moreOpen]);

  return (
    <div className="sticky top-[73px] z-30 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-900/70">
      {/* Featured module carousel */}
      <div className="px-4 py-2 border-b border-zinc-800/80 flex items-center justify-between gap-3 flex-wrap">
        <NavFeatureCarousel className="flex-1" />
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/vericue"
            className="candy-badge candy-badge-ai flex items-center gap-1.5 text-[11px] font-bold hover:opacity-90 transition-all"
            title="VeriCue AI — Forensic Telemetry Console"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>VeriCue AI</span>
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-[11px] text-neutral-300 hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/25 transition-colors"
                title="Matter Profile"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden md:inline max-w-[120px] truncate">{user?.name || "Matter Profile"}</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-rose-300 px-2 py-1 rounded border border-transparent hover:border-rose-500/30 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 rotate-180" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Primary module tabs + More */}
      <nav
        className="px-4 overflow-x-auto whitespace-nowrap hide-scrollbar flex items-center gap-1"
        aria-label="Workspace modules"
      >
        {PRIMARY_TABS.map((tab) => {
          const Icon = tab.icon;
          const href = TAB_ROUTES[tab.id];
          const isActive = tabActive(tab.id, activeTab, pathname);

          return (
            <Link
              key={tab.id}
              href={href}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs border-b-2 transition-all shrink-0 ${
                isActive
                  ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 font-medium"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D4AF37]" : "text-neutral-400"}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        <div className="relative shrink-0" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            className={`flex items-center gap-1.5 py-3 px-4 text-xs border-b-2 transition-all ${
              moreIsActive || moreOpen
                ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 font-medium"
            }`}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
            <span>More</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
          </button>
          {moreOpen && (
            <div
              role="menu"
              className="absolute left-0 top-full mt-0 w-56 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1 z-50"
            >
              {MORE_TABS.map((tab) => {
                const Icon = tab.icon;
                const href = TAB_ROUTES[tab.id];
                const isActive = tabActive(tab.id, activeTab, pathname);
                return (
                  <Link
                    key={tab.id}
                    role="menuitem"
                    href={href}
                    onClick={() => {
                      onTabChange(tab.id);
                      setMoreOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 text-xs transition-colors ${
                      isActive
                        ? "bg-[#D4AF37]/10 text-[#D4AF37] font-semibold"
                        : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
