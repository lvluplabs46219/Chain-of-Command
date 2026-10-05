"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
  Cpu,
  Orbit,
  Command,
  X,
  ArrowRight,
  Sparkles,
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

interface NavTabItem {
  id: WorkspaceTab;
  index: string;
  hotkey: string;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: NavTabItem[] = [
  { id: "dashboard", index: "01", hotkey: "1", label: "Command Center", badge: "WORKSPACE", icon: LayoutDashboard },
  { id: "docket", index: "02", hotkey: "2", label: "The Docket", badge: "FILINGS", icon: Gavel },
  { id: "chambers", index: "03", hotkey: "3", label: "Chambers (AI Team)", badge: "6 AGENTS", icon: Users },
  { id: "library", index: "04", hotkey: "4", label: "Legal Library", badge: "AUTHORITIES", icon: BookOpen },
  { id: "investigations", index: "05", hotkey: "5", label: "Investigations", badge: "EVIDENCE", icon: Search },
  { id: "timeline", index: "06", hotkey: "6", label: "Timeline", badge: "CHRONOLOGY", icon: Clock },
  { id: "draft_desk", index: "07", hotkey: "7", label: "Draft Desk", badge: "DOCUMENTS", icon: FileSignature },
  { id: "court_watch", index: "08", hotkey: "8", label: "Court Watch", badge: "MONITOR", icon: Eye },
  { id: "directory", index: "09", hotkey: "9", label: "Attorney Directory", badge: "COUNSEL", icon: UserCheck },
  { id: "tasks", index: "10", hotkey: "0", label: "Tasks & Deadlines", badge: "CALENDAR", icon: CalendarCheck2 },
  { id: "audit", index: "11", hotkey: "-", label: "Audit & Security", badge: "ENCRYPTED", icon: Shield },
  { id: "archive", index: "12", hotkey: "=", label: "Design Archive", badge: "STITCH UI", icon: Layers },
];

export function WorkspaceNavigation({ activeTab, onTabChange }: WorkspaceNavigationProps) {
  const activeIndex = Math.max(0, TABS.findIndex((t) => t.id === activeTab));
  const activeNumber = activeIndex + 1;
  const stageRef = useRef<HTMLDivElement>(null);

  // Command Palette State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  // Drag & Swipe State for 3D Turn Spiral Carousel
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentDragDelta = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const lastWheelTime = useRef(0);

  // Rotate turn spiral step-by-step
  const rotateStep = useCallback(
    (step: number) => {
      const nextIndex = (activeIndex + step + TABS.length) % TABS.length;
      onTabChange(TABS[nextIndex].id);
    },
    [activeIndex, onTabChange]
  );

  // Global Keyboard Shortcuts (Cmd+K, numbers 1-9)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if typing inside an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Cmd+K or Ctrl+K triggers command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === "Escape" && commandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
        return;
      }

      if (isInput) return;

      // Hotkeys 1-9, 0, -, = to directly jump to node
      const tabMatch = TABS.find((t) => t.hotkey === e.key);
      if (tabMatch) {
        e.preventDefault();
        onTabChange(tabMatch.id);
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        rotateStep(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        rotateStep(1);
      }
    };

    const handleCustomOpen = () => setCommandPaletteOpen(true);
    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [commandPaletteOpen, onTabChange, rotateStep]);

  // Filtered results for Command Palette
  const filteredTabs = TABS.filter(
    (t) =>
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.index.includes(searchQuery)
  );

  // Mouse wheel rotation through the spiral
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 200) return;
    if (Math.abs(e.deltaX) > 12 || Math.abs(e.deltaY) > 12) {
      const direction = (e.deltaX !== 0 ? e.deltaX : e.deltaY) > 0 ? 1 : -1;
      rotateStep(direction);
      lastWheelTime.current = now;
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startX.current = e.clientX;
    currentDragDelta.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const delta = e.clientX - startX.current;
    currentDragDelta.current = delta;
    setDragOffset(delta);
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const threshold = 40;
    if (currentDragDelta.current > threshold) {
      rotateStep(-1);
    } else if (currentDragDelta.current < -threshold) {
      rotateStep(1);
    }
    setDragOffset(0);
    currentDragDelta.current = 0;
  };

  // Touch handlers for mobile spiral turn
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      isDragging.current = true;
      startX.current = e.touches[0].clientX;
      currentDragDelta.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || e.touches.length === 0) return;
    const delta = e.touches[0].clientX - startX.current;
    currentDragDelta.current = delta;
    setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Current spiral turn angle
  const currentAngle = (activeIndex * (360 / TABS.length)).toFixed(0);

  return (
    <>
      <nav
        aria-label="Chain of Command 3D Turn Spiral Navigation Carousel"
        tabIndex={0}
        className="relative bg-[#07080C] border-b border-[#222530] select-none w-full z-40 outline-none transition-all shadow-[0_12px_36px_rgba(0,0,0,0.7)]"
      >
        {/* Top Cyber Telemetry & Spiral Protocol Tracker Bar */}
        <div className="flex items-center justify-between px-3 md:px-6 py-2 border-b border-white/[0.06] bg-[#0A0B10] text-[11px] font-mono tracking-wider">
          <div className="flex items-center gap-3 text-neutral-300">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#174E48]/50 border border-[#174E48] text-[#34D399]">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
              <span className="font-bold tracking-widest uppercase">3D TURN SPIRAL // 0xCOC</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-neutral-400">
              <Orbit className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>SPIRAL ANGLE:</span>
              <span className="text-[#D4AF37] font-bold">{currentAngle}°</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-neutral-400">
              <Cpu className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>ACTIVE:</span>
              <span className="text-white font-bold">{TABS[activeIndex]?.label.toUpperCase()}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-neutral-300">
            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-[#141620] hover:bg-[#1A1D2A] border border-[#2D3040] hover:border-[#D4AF37]/50 text-neutral-300 text-xs transition-colors"
            >
              <Command className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Search Tabs</span>
              <kbd className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-1 rounded border border-neutral-700">⌘K</kbd>
            </button>

            <span className="text-xs font-mono">
              NODE <span className="text-[#D4AF37] font-bold">{String(activeNumber).padStart(2, "0")}</span>
              <span className="text-neutral-500"> / {String(TABS.length).padStart(2, "0")}</span>
            </span>

            {/* Chevrons to turn the spiral carousel */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <button
                type="button"
                onClick={() => rotateStep(-1)}
                aria-label="Turn Spiral Left"
                className="px-2 py-1 rounded-md border border-[#D4AF37]/60 bg-[#161822] text-[#D4AF37] hover:bg-[#D4AF37]/25 hover:border-[#D4AF37] active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-all flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">PREV</span>
              </button>
              <button
                type="button"
                onClick={() => rotateStep(1)}
                aria-label="Turn Spiral Right"
                className="px-2 py-1 rounded-md border border-[#D4AF37]/60 bg-[#161822] text-[#D4AF37] hover:bg-[#D4AF37]/25 hover:border-[#D4AF37] active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-all flex items-center gap-1 text-xs font-bold"
              >
                <span className="hidden sm:inline">NEXT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main 3D Turn Spiral Stage */}
        <div
          ref={stageRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-label="3D Turn Spiral Carousel Viewport"
          className="relative h-32 md:h-36 w-full flex items-center justify-center cursor-grab active:cursor-grabbing [perspective:1400px] [transform-style:preserve-3d] select-none py-2 overflow-hidden bg-gradient-to-b from-[#090A0E] via-[#0B0C12] to-[#07080C]"
        >
          {/* Subtle Ambient Radial Lighting */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12)_0%,transparent_70%)]"
          />

          {/* Central Vertical Helix Laser Axis */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent pointer-events-none shadow-[0_0_10px_#D4AF37]"
          />

          {/* Floating Left Spiral Turn Button */}
          <button
            type="button"
            onClick={() => rotateStep(-1)}
            aria-label="Turn Spiral Left"
            className="absolute left-3 md:left-6 z-40 p-2.5 rounded-full border border-[#D4AF37]/70 bg-[#12131A]/95 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:scale-110 active:scale-95 hover:bg-[#D4AF37]/25 transition-all backdrop-blur-md cursor-pointer flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Floating Right Spiral Turn Button */}
          <button
            type="button"
            onClick={() => rotateStep(1)}
            aria-label="Turn Spiral Right"
            className="absolute right-3 md:right-6 z-40 p-2.5 rounded-full border border-[#D4AF37]/70 bg-[#12131A]/95 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:scale-110 active:scale-95 hover:bg-[#D4AF37]/25 transition-all backdrop-blur-md cursor-pointer flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* 3D Helical Turn Spiral Stage Container */}
          <div
            role="tablist"
            aria-label="3D Spiral Workspace Nodes"
            className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d] pointer-events-none"
          >
            {TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              // Calculate nearest circular offset from activeIndex
              let diff = idx - activeIndex;
              const half = TABS.length / 2;
              if (diff > half) diff -= TABS.length;
              if (diff < -half) diff += TABS.length;

              // Only render items within viewable range of the spiral (-3 to +3)
              const isVisible = Math.abs(diff) <= 3;
              if (!isVisible) return null;

              // Continuous drag offset for fluid real-time spiral rotation
              const visualDiff = diff - dragOffset / 180;

              // 3D TURN SPIRAL (HELIX) MATHEMATICS - SOFTENED ANGLES & PLANAR READABILITY
              const spacingX = typeof window !== "undefined" && window.innerWidth < 640 ? 190 : 260;
              const translateX = visualDiff * spacingX;

              // Helical turn elevation
              const translateY = -visualDiff * 8;

              // Z depth displacement
              const translateZ = -Math.abs(visualDiff) * 45;

              // Softened rotational angles so text stays flat, planar, and effortless to read
              const rotateY = -visualDiff * 8; // Gentle yaw
              const rotateX = visualDiff * 1;  // Almost flat pitch
              const rotateZ = 0;              // 0 roll (completely upright!)

              // High contrast and legible scale
              const scale = Math.max(0.85, 1 - Math.abs(visualDiff) * 0.07);
              const opacity = Math.max(0.65, 1 - Math.abs(visualDiff) * 0.15);
              const zIndex = 60 - Math.round(Math.abs(visualDiff) * 10);

              return (
                <div
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabChange(tab.id);
                  }}
                  style={{
                    transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                    opacity,
                    zIndex,
                    transition: isDragging.current
                      ? "none"
                      : "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease",
                  }}
                  className={`absolute w-60 md:w-68 h-20 md:h-22 rounded-xl border-2 p-3 flex items-center gap-3.5 cursor-pointer pointer-events-auto transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#241F14] via-[#161822] to-[#12141C] border-[#D4AF37] text-white shadow-[0_0_40px_rgba(212,175,55,0.45)] ring-2 ring-[#D4AF37]/50"
                      : "backdrop-blur-md bg-[#101117]/90 border-[#262A38] text-neutral-300 hover:border-[#D4AF37]/60 hover:bg-[#161824] hover:text-white"
                  }`}
                >
                  {/* Index & Hotkey Badge */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span
                      className={`text-[11px] font-mono font-bold tracking-tighter ${
                        isActive ? "text-[#D4AF37]" : "text-neutral-400"
                      }`}
                    >
                      {tab.index}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500 bg-neutral-800/80 px-1 rounded border border-neutral-700/60 mt-0.5">
                      [{tab.hotkey}]
                    </span>
                  </div>

                  {/* Cyber Icon Bezel */}
                  <div
                    className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                      isActive
                        ? "bg-[#D4AF37] text-black shadow-[0_0_18px_rgba(212,175,55,0.6)] scale-110"
                        : "bg-[#1E212E] text-neutral-300"
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  {/* Tab Label and Telemetry */}
                  <div className="flex flex-col min-w-0 flex-1 justify-center">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm md:text-base font-mono font-bold tracking-wide truncate ${
                          isActive ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" : "text-neutral-100"
                        }`}
                      >
                        {tab.label}
                      </span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-ping shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border ${
                          isActive
                            ? "bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#EFE6D0]"
                            : "bg-white/5 border-white/10 text-neutral-400"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    </div>
                  </div>

                  {/* Active Apex Laser Glow Bar on Bottom */}
                  {isActive && (
                    <div
                      aria-hidden="true"
                      className="absolute -bottom-[2px] inset-x-3 h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_14px_#D4AF37]"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2D Quick-Jump Strip with Linear Hotkey Indicators */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#050608] border-t border-white/[0.04] text-[10px] font-mono text-neutral-400">
          <div className="hidden sm:flex items-center gap-2 text-neutral-500">
            <span>QUICK JUMP:</span>
            <span className="text-neutral-400">Press hotkeys [1] through [9] to instantly navigate</span>
          </div>

          <div className="flex items-center justify-center gap-2 mx-auto sm:mx-0">
            {TABS.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  title={`[Hotkey: ${tab.hotkey}] ${tab.label}`}
                  className={`flex items-center gap-1 h-5 px-1.5 rounded transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#D4AF37]/20 border border-[#D4AF37]/70 text-[#D4AF37] font-bold shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                      : "bg-[#141620] border border-[#222533] text-neutral-400 hover:text-white hover:border-neutral-500"
                  }`}
                >
                  <span className="text-[9px] font-bold">{tab.hotkey}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-neutral-500">
            <span>SHORTCUT:</span>
            <kbd className="bg-neutral-800 text-neutral-300 px-1 py-0.5 rounded border border-neutral-700 text-[9px]">⌘K PALETTE</kbd>
          </div>
        </div>
      </nav>

      {/* Global Command Palette Modal (Cmd + K) */}
      {commandPaletteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#0E1017] border border-[#2D3142] rounded-xl shadow-2xl overflow-hidden text-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#242735] bg-[#12141D]">
              <Search className="w-5 h-5 text-[#D4AF37]" />
              <input
                type="text"
                autoFocus
                placeholder="Type to jump to any tab, docket, or legal tool (or press 1-9)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedResultIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedResultIndex((prev) => (prev + 1) % Math.max(1, filteredTabs.length));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedResultIndex((prev) => (prev - 1 + filteredTabs.length) % Math.max(1, filteredTabs.length));
                  } else if (e.key === "Enter" && filteredTabs[selectedResultIndex]) {
                    e.preventDefault();
                    onTabChange(filteredTabs[selectedResultIndex].id);
                    setCommandPaletteOpen(false);
                  }
                }}
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-neutral-500 font-sans"
              />
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                Workspace Nodes ({filteredTabs.length})
              </div>

              {filteredTabs.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No matching workspace nodes found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                filteredTabs.map((tab, idx) => {
                  const Icon = tab.icon;
                  const isSelected = idx === selectedResultIndex;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        onTabChange(tab.id);
                        setCommandPaletteOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-[#D4AF37]/15 text-white border border-[#D4AF37]/40 shadow-sm"
                          : "text-neutral-300 hover:bg-[#161822] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-md ${
                            isSelected ? "bg-[#D4AF37] text-black" : "bg-[#1E212E] text-neutral-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-white">{tab.label}</span>
                          <span className="text-[10px] font-mono text-neutral-500 ml-2">[{tab.badge}]</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
                          Key: {tab.hotkey}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer Hotkey Hints */}
            <div className="px-4 py-2 bg-[#090B10] border-t border-[#1F2230] text-[10px] font-mono text-neutral-500 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span className="text-[#D4AF37]">Chain of Command OS</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
