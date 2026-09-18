import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Gavel,
  Scale,
  MessageSquare,
  Bot,
  FileText,
  BookOpen,
  ChevronDown,
  LayoutGrid,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

export type CanvaViewId =
  | "command-center"
  | "docket"
  | "chambers"
  | "law-library"
  | "investigations"
  | "record-room"
  | "case-timeline"
  | "court-watch"
  | "counsel-directory"
  | "motions-tasks"
  | "accessibility-settings"
  | "system-settings";

interface CanvaLegalOSViewerProps {
  defaultView?: CanvaViewId;
  stitchCategoryFallback?: string;
}

const VIEW_TO_ROUTE: Record<string, string> = {
  "command-center": "/",
  "docket": "/docket",
  "chambers": "/chambers",
  "law-library": "/law-library",
  "investigations": "/investigations",
  "record-room": "/record-room",
  "case-timeline": "/timeline",
  "court-watch": "/court-watch",
  "counsel-directory": "/counsel",
  "motions-tasks": "/motions",
  "accessibility-settings": "/accessibility",
  "system-settings": "/security",
};

const ROUTE_TO_VIEW: Record<string, CanvaViewId> = {
  "/": "command-center",
  "/command-center": "command-center",
  "/docket": "docket",
  "/cases": "docket",
  "/chambers": "chambers",
  "/ai-lab": "chambers",
  "/ai-legal-team": "chambers",
  "/law-library": "law-library",
  "/library": "law-library",
  "/investigations": "investigations",
  "/evidence": "investigations",
  "/record-room": "record-room",
  "/documents": "record-room",
  "/records": "record-room",
  "/timeline": "case-timeline",
  "/case-timeline": "case-timeline",
  "/court-watch": "court-watch",
  "/hearings": "court-watch",
  "/counsel": "counsel-directory",
  "/counsel-directory": "counsel-directory",
  "/directory": "counsel-directory",
  "/attorney-directory": "counsel-directory",
  "/motions": "motions-tasks",
  "/motions-tasks": "motions-tasks",
  "/calendar": "motions-tasks",
  "/tasks": "motions-tasks",
  "/accessibility": "accessibility-settings",
  "/accessibility-settings": "accessibility-settings",
  "/security": "system-settings",
  "/settings": "system-settings",
  "/system": "system-settings",
  "/system-settings": "system-settings",
  "/audit": "system-settings",
};

const VIEW_TO_STITCH_MOCKUP: Record<string, string> = {
  "command-center": "command_center_dashboard",
  "docket": "the_docket_cases",
  "chambers": "chambers_ai_legal_team",
  "law-library": "law_library_research",
  "investigations": "investigations_evidence_locker",
  "record-room": "record_room_documents",
  "case-timeline": "case_timeline_chronology",
  "court-watch": "court_watch_docket_activity",
  "counsel-directory": "counsel_directory_counsel_listings",
  "motions-tasks": "motions_tasks_court_calendar",
  "accessibility-settings": "accessibility_settings",
  "system-settings": "workspace_security",
};

export function CanvaLegalOSViewer({ defaultView, stitchCategoryFallback }: CanvaLegalOSViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<CanvaViewId>(() => {
    return defaultView || ROUTE_TO_VIEW[location.pathname] || "command-center";
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);

  const triggerView = (view: CanvaViewId) => {
    setActiveView(view);
    const targetRoute = VIEW_TO_ROUTE[view];
    if (targetRoute && location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "SET_VIEW", view },
        "*"
      );
    }
  };

  const triggerOpenClerk = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "OPEN_CLERK" },
        "*"
      );
    }
  };

  // Sync route changes to iframe view
  useEffect(() => {
    const matchedView = ROUTE_TO_VIEW[location.pathname];
    if (matchedView && matchedView !== activeView) {
      setActiveView(matchedView);
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "SET_VIEW", view: matchedView },
          "*"
        );
      }
    }
  }, [location.pathname]);

  // Handle messages from inside the Canva Legal OS iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data) {
        if (e.data.type === "LEGAL_OS_NAVIGATE" && e.data.view) {
          const viewId = e.data.view as CanvaViewId;
          setActiveView(viewId);
          const targetRoute = VIEW_TO_ROUTE[viewId];
          if (targetRoute && location.pathname !== targetRoute) {
            navigate(targetRoute);
          }
        } else if (e.data.type === "LEGAL_OS_OPEN_GALLERY") {
          navigate("/gallery");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate, location.pathname]);

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "SET_VIEW", view: activeView },
        "*"
      );
    }
  };

  const iframeSrc = `/assets/canva/legal-os.html?view=${activeView}`;
  const stitchMockup = stitchCategoryFallback || VIEW_TO_STITCH_MOCKUP[activeView] || "command_center_dashboard";

  return (
    <div
      className={`flex flex-col bg-[#0e0e0e] text-[#e5e2e1] ${
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "w-full min-h-[calc(100vh-64px)]"
      }`}
    >
      {/* Primary Legal OS Master Bar */}
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 border-b border-[#33302a] bg-[#141313] px-3 py-2 text-xs">
        {/* Brand & Active Matter */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 group text-white hover:text-[#d4af37] transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#1c1b1b] border border-[#d4af37]/40 text-[#d4af37]">
              <Gavel size={16} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm tracking-tight text-[#f3ede8]">
                  Acquit.ai
                </span>
                <span className="rounded bg-[#2a2413] px-1.5 py-0.2 font-mono text-[9px] font-bold text-[#d4af37] border border-[#765f21]">
                  LEGAL OS
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#8e857e]">
                State v. Marlowe · 24-CR-118
              </span>
            </div>
          </Link>
        </div>

        {/* Center Primary Action Buttons — Crystal Clear AI Lawyer & Clerk Access */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1" aria-label="Quick navigation">
          {/* 1. Command Center */}
          <button
            type="button"
            onClick={() => triggerView("command-center")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium transition-colors ${
              activeView === "command-center"
                ? "bg-[#25231d] text-[#d4af37] border border-[#765f21]"
                : "border border-[#333] bg-[#1a1a1a] text-[#cfc5be] hover:bg-[#252525] hover:text-white"
            }`}
          >
            <span>Command Center</span>
          </button>

          {/* 2. AI LAWYER / CHAMBERS — PROMINENT GOLD BUTTON */}
          <button
            type="button"
            id="nav-ai-lawyer-chambers"
            onClick={() => triggerView("chambers")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-bold transition-all shadow-sm ${
              activeView === "chambers"
                ? "bg-[#d4af37] text-black font-extrabold ring-2 ring-[#d4af37]/50"
                : "bg-[#2a2413] text-[#f5d061] border border-[#d4af37] hover:bg-[#3d3319] hover:text-[#fff]"
            }`}
            title="Open Chambers to consult your AI Legal Counsel Team"
          >
            <Scale size={14} className={activeView === "chambers" ? "text-black" : "text-[#d4af37]"} />
            <span>AI Lawyer (Chambers)</span>
            <span className="rounded bg-black/30 px-1 py-0.5 text-[9px] font-mono tracking-wider">
              TEAM
            </span>
          </button>

          {/* 3. THE CLERK AI — PROCEDURAL ASSISTANT */}
          <button
            type="button"
            id="nav-the-clerk-ai"
            onClick={triggerOpenClerk}
            className="flex items-center gap-1.5 rounded border border-[#4e5d6c] bg-[#1a222b] px-3 py-1.5 font-bold text-[#b5c8df] hover:bg-[#23303d] hover:text-white transition-colors"
            title="Open The Clerk procedural guidance drawer"
          >
            <MessageSquare size={14} className="text-[#b5c8df]" />
            <span>The Clerk (Court AI)</span>
            <span className="inline-block h-2 w-2 rounded-full bg-[#9fc6ae] animate-pulse" />
          </button>

          {/* 4. Multi-Agent Team (Chain of Command Lab) */}
          <Link
            to="/chain-of-command"
            className="flex items-center gap-1.5 rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-medium text-[#cfc5be] hover:bg-[#252525] hover:text-[#b5c8df] transition-colors"
            title="Open full-screen multi-agent AI team workstation"
          >
            <Bot size={14} className="text-[#b5c8df]" />
            <span className="hidden md:inline">Chain of Command</span>
            <span className="md:hidden">Agent Lab</span>
          </Link>

          {/* 5. Document Editor */}
          <Link
            to="/document-editor"
            className="hidden lg:flex items-center gap-1.5 rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-medium text-[#cfc5be] hover:bg-[#252525] hover:text-white transition-colors"
            title="Draft pleadings and motions in VS Code-style editor"
          >
            <FileText size={14} className="text-[#9fc6ae]" />
            <span>Pleading Drafter</span>
          </Link>

          {/* 6. Law Library */}
          <button
            type="button"
            onClick={() => triggerView("law-library")}
            className={`hidden xl:flex items-center gap-1.5 rounded px-2.5 py-1.5 font-medium transition-colors ${
              activeView === "law-library"
                ? "bg-[#25231d] text-[#d4af37] border border-[#765f21]"
                : "border border-[#333] bg-[#1a1a1a] text-[#cfc5be] hover:bg-[#252525] hover:text-white"
            }`}
          >
            <BookOpen size={14} />
            <span>Law Library</span>
          </button>
        </nav>

        {/* Right Tools & Modules Dropdown */}
        <div className="flex items-center gap-2">
          {/* Modules Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setModulesOpen(!modulesOpen)}
              className="flex items-center gap-1.5 rounded border border-[#444] bg-[#1b1b1b] px-2.5 py-1.5 text-[11px] font-medium text-[#cfc5be] hover:bg-[#252525] hover:text-white transition-colors"
            >
              <Layers size={13} className="text-[#d4af37]" />
              <span>More Modules</span>
              <ChevronDown size={12} />
            </button>

            {modulesOpen && (
              <div
                className="absolute right-0 mt-1.5 w-64 rounded-lg border border-[#444] bg-[#1c1b1b] p-2 shadow-2xl z-50 text-xs"
                onMouseLeave={() => setModulesOpen(false)}
              >
                <div className="font-mono text-[10px] text-[#8e857e] px-2 py-1 uppercase tracking-wider border-b border-[#333] mb-1">
                  Legal OS Modules
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerView("docket");
                    setModulesOpen(false);
                  }}
                  className="w-full text-left rounded px-2.5 py-1.5 hover:bg-[#252525] text-[#cfc5be] hover:text-white block"
                >
                  The Docket (Active Cases)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerView("case-timeline");
                    setModulesOpen(false);
                  }}
                  className="w-full text-left rounded px-2.5 py-1.5 hover:bg-[#252525] text-[#cfc5be] hover:text-white block"
                >
                  Case Timeline &amp; Chronology
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerView("investigations");
                    setModulesOpen(false);
                  }}
                  className="w-full text-left rounded px-2.5 py-1.5 hover:bg-[#252525] text-[#cfc5be] hover:text-white block"
                >
                  Investigations &amp; Evidence Locker
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerView("record-room");
                    setModulesOpen(false);
                  }}
                  className="w-full text-left rounded px-2.5 py-1.5 hover:bg-[#252525] text-[#cfc5be] hover:text-white block"
                >
                  Record Room (Documents)
                </button>
                <Link
                  to="/document-vault"
                  onClick={() => setModulesOpen(false)}
                  className="w-full text-left rounded px-2.5 py-1.5 hover:bg-[#252525] text-[#cfc5be] hover:text-white block"
                >
                  Sovereign Cylinder Vault
                </Link>
                <Link
                  to="/academy"
                  onClick={() => setModulesOpen(false)}
                  className="w-full text-left rounded px-2.5 py-1.5 hover:bg-[#252525] text-[#cfc5be] hover:text-white block"
                >
                  Acquit Academy (Procedural Training)
                </Link>
                <Link
                  to="/google-workspace"
                  onClick={() => setModulesOpen(false)}
                  className="w-full text-left rounded px-2.5 py-1.5 hover:bg-[#252525] text-[#cfc5be] hover:text-white block"
                >
                  Google Workspace (Drive &amp; Calendar)
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    triggerView("counsel-directory");
                    setModulesOpen(false);
                  }}
                  className="w-full text-left rounded px-2.5 py-1.5 hover:bg-[#252525] text-[#cfc5be] hover:text-white block"
                >
                  Counsel Directory (Independent)
                </button>
                <div className="border-t border-[#333] my-1"></div>
                <Link
                  to="/gallery"
                  onClick={() => setModulesOpen(false)}
                  className="w-full text-left rounded px-2.5 py-1.5 hover:bg-[#252525] text-[#d4af37] font-semibold flex items-center justify-between"
                >
                  <span>All 46 Stitch Screens Matrix</span>
                  <span className="font-mono text-[10px]">46 ↗</span>
                </Link>
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-2.5 py-1.5 text-[11px] font-mono font-medium rounded border border-[#444] bg-[#1b1b1b] text-[#cfc5be] hover:border-[#d4af37] hover:text-[#d4af37] transition-colors"
          >
            {isFullscreen ? "Exit Fullscreen" : "⛶ Fullscreen"}
          </button>
        </div>
      </header>

      {/* Canva Synced Banner */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#282520] bg-[#0c0c0c] text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#9fc6ae] animate-pulse"></span>
          <span className="font-mono text-[10px] text-[#9fc6ae] tracking-wider uppercase font-bold">
            Live Workspace Active
          </span>
          <span className="text-[#555]">|</span>
          <span className="text-[#888] font-mono text-[10px]">
            To test your AI Lawyer: Click <b className="text-[#d4af37]">AI Lawyer (Chambers)</b> above or ask <b className="text-[#b5c8df]">The Clerk</b>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/stitch/${stitchMockup}`)}
            className="px-2 py-0.5 text-[10px] font-mono rounded border border-[#333] bg-[#161616] text-[#999] hover:text-[#d4af37] transition-colors"
          >
            Stitch Spec: {stitchMockup.split('_').slice(0, 2).join(' ')} ↗
          </button>
        </div>
      </div>

      {/* Main Canva Legal OS iframe */}
      <div className="relative flex-1 w-full h-full min-h-[850px] bg-[#0e0e0e]">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          onLoad={handleIframeLoad}
          title="Acquit.ai Legal OS — Lvluplabs"
          className="w-full h-full border-0 absolute inset-0 min-h-[850px]"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
