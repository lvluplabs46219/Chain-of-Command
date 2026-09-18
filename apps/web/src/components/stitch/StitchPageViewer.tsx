import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  formatMockupName,
  STITCH_CATEGORIES,
  type StitchCategory,
} from "./stitchConfig";
import {
  Layers,
  Code2,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";

interface StitchPageViewerProps {
  mockupName: string;
  category?: StitchCategory;
  onSelectMockup?: (name: string) => void;
}

export function StitchPageViewer({
  mockupName,
  category,
  onSelectMockup,
}: StitchPageViewerProps) {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<"code" | "spec">("code");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [showInfo, setShowInfo] = useState(false);

  // Fetch the code.html content
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function loadContent() {
      try {
        const res = await fetch(`/assets/stitch/${mockupName}/code.html`);
        if (!res.ok) {
          throw new Error(`Failed to load stitch code (${res.status})`);
        }
        let html = await res.text();

        // Inject navigation interception script so links inside the stitch mockups route within the parent React app
        const navScript = `
          <script>
            (function() {
              document.addEventListener('click', function(e) {
                var target = e.target.closest('a, button');
                if (!target) return;
                var text = (target.innerText || '').trim().toLowerCase();
                var href = target.getAttribute('href');

                // Check for known navigation target words in sidebar and menus
                var routeMap = {
                  'command center': '/',
                  'the docket': '/docket',
                  'docket': '/docket',
                  'chambers': '/chambers',
                  'ai legal team': '/chambers',
                  'law library': '/law-library',
                  'record room': '/record-room',
                  'documents': '/record-room',
                  'court watch': '/court-watch',
                  'timeline': '/timeline',
                  'case timeline': '/timeline',
                  'investigations': '/investigations',
                  'evidence': '/investigations',
                  'evidence locker': '/investigations',
                  'counsel directory': '/counsel',
                  'counsel': '/counsel',
                  'filing center': '/filing',
                  'court submission': '/filing',
                  'security': '/security',
                  'system audit': '/security',
                  'settings': '/security',
                  'calendar': '/motions',
                  'court calendar': '/motions',
                  'motions': '/motions',
                  'motions & tasks': '/motions',
                  'appoint counsel': '/chambers?sub=chambers_appoint_counsel',
                  'plea analysis': '/chambers?sub=chambers_plea_analysis',
                  'mitigation memo': '/chambers?sub=chambers_mitigation_memo',
                  'full bench': '/chambers?sub=chambers_full_bench_view',
                  'draft desk': '/record-room?sub=record_room_draft_desk',
                  'exhibit gallery': '/record-room?sub=record_room_exhibit_gallery',
                  'open matter': '/docket?sub=the_docket_open_a_matter',
                  'open new matter': '/docket?sub=the_docket_open_a_matter',
                  'court retrieval': '/docket?sub=the_docket_retrieve_from_court'
                };

                for (var key in routeMap) {
                  if (text.indexOf(key) !== -1) {
                    e.preventDefault();
                    window.parent.postMessage({ type: 'ACQUIT_NAVIGATE', path: routeMap[key] }, '*');
                    return;
                  }
                }
              }, true);
            })();
          </script>
        `;

        // Inject script right before closing body or head
        if (html.includes("</body>")) {
          html = html.replace("</body>", `${navScript}</body>`);
        } else {
          html += navScript;
        }

        if (!cancelled) {
          setHtmlContent(html);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading mockup code:", err);
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContent();
    return () => {
      cancelled = true;
    };
  }, [mockupName]);

  // Listen for navigation messages from within the iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === "ACQUIT_NAVIGATE" && event.data.path) {
        navigate(event.data.path);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [navigate]);

  const currentCategory =
    category ||
    STITCH_CATEGORIES.find((c) =>
      c.screens.some((s) => s.id === mockupName)
    );

  const currentScreenInfo = currentCategory?.screens.find(
    (s) => s.id === mockupName
  );

  return (
    <div
      className={`flex flex-col bg-[#141313] ${
        isFullscreen
          ? "fixed inset-0 z-[100000] h-screen w-screen"
          : "h-[calc(100vh-64px)] w-full"
      }`}
    >
      {/* Sub-Screen / Spec Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#44474a]/40 bg-[#1c1b1b] px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto text-xs hide-scrollbar">
          {currentCategory && (
            <div className="flex items-center gap-1 font-mono text-[#b5c8df] font-bold tracking-wider shrink-0 pr-2 border-r border-[#44474a]/40 uppercase">
              <span>{currentCategory.label}</span>
              <ChevronRight size={13} className="text-[#8f9194]" />
            </div>
          )}

          {/* If the category has multiple screens, show sub-view switcher */}
          {currentCategory && currentCategory.screens.length > 1 ? (
            <div className="flex items-center gap-1">
              {currentCategory.screens.map((screen) => {
                const isActive = screen.id === mockupName;
                return (
                  <button
                    key={screen.id}
                    onClick={() => {
                      if (onSelectMockup) {
                        onSelectMockup(screen.id);
                      } else {
                        navigate(`${currentCategory.route}?sub=${screen.id}`);
                      }
                    }}
                    className={`shrink-0 rounded px-2.5 py-1 transition-all text-xs font-medium ${
                      isActive
                        ? "bg-[#36485b] text-[#d1e4fb] shadow-sm font-semibold border border-[#b5c8df]/40"
                        : "text-[#c5c6ca] hover:bg-[#2a2a2a] hover:text-white"
                    }`}
                  >
                    {screen.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="font-semibold text-[#e5e2e1]">
              {currentScreenInfo?.label || formatMockupName(mockupName)}
            </span>
          )}
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 shrink-0 pl-2">
          {/* Info toggle */}
          {currentScreenInfo?.description && (
            <button
              onClick={() => setShowInfo(!showInfo)}
              title="Screen Purpose"
              className={`rounded p-1 transition ${
                showInfo
                  ? "bg-[#36485b] text-[#d1e4fb]"
                  : "text-[#8f9194] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
              }`}
            >
              <Info size={15} />
            </button>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center rounded border border-[#44474a]/60 bg-[#141313] p-0.5">
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs transition ${
                viewMode === "code"
                  ? "bg-[#36485b] text-white font-medium"
                  : "text-[#8f9194] hover:text-[#e5e2e1]"
              }`}
              title="Interactive Live Layout"
            >
              <Code2 size={13} />
              <span className="hidden sm:inline">Interactive</span>
            </button>
            <button
              onClick={() => setViewMode("spec")}
              className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs transition ${
                viewMode === "spec"
                  ? "bg-[#36485b] text-white font-medium"
                  : "text-[#8f9194] hover:text-[#e5e2e1]"
              }`}
              title="Rendered Screenshot Specification"
            >
              <Layers size={13} />
              <span className="hidden sm:inline">Mockup Spec</span>
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded p-1 text-[#8f9194] hover:bg-[#2a2a2a] hover:text-[#e5e2e1] transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Direct URL */}
          <a
            href={`/assets/stitch/${mockupName}/code.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 text-[#8f9194] hover:bg-[#2a2a2a] hover:text-[#e5e2e1] transition"
            title="Open Raw HTML in Tab"
          >
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* Optional Description Banner */}
      {showInfo && currentScreenInfo?.description && (
        <div className="shrink-0 border-b border-[#44474a]/30 bg-[#201f1f] px-4 py-2 text-xs text-[#c5c6ca] flex items-center justify-between">
          <p>
            <strong className="text-[#b5c8df]">Screen Intent:</strong>{" "}
            {currentScreenInfo.description}
          </p>
          <button
            onClick={() => setShowInfo(false)}
            className="text-[#8f9194] hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main View Area */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#141313]">
        {viewMode === "code" ? (
          loading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[#36485b] border-t-[#b5c8df]" />
                <p className="font-mono text-xs tracking-widest text-[#b5c8df]">
                  LOADING {formatMockupName(mockupName).toUpperCase()}...
                </p>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              srcDoc={htmlContent}
              title={formatMockupName(mockupName)}
              className="h-full w-full border-none"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
            <img
              src={`/assets/stitch/${mockupName}/screen.png`}
              alt={formatMockupName(mockupName)}
              className="max-h-full max-w-full rounded border border-[#44474a]/60 shadow-2xl object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
