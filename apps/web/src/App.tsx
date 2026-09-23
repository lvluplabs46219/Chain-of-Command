import { useEffect, useState, type ComponentType } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import { modules as discoveredModules } from "./.generated/mockup-components";
import { StitchMasterNav } from "./components/stitch/StitchMasterNav";
import { StitchCategoryPage } from "./components/stitch/StitchCategoryPage";
import { StitchMockupDirectPage } from "./components/stitch/StitchMockupDirectPage";
import { StitchGallery } from "./components/mockups/acquit-case-workspace/StitchGallery";
import { AcquitAcademy } from "./components/mockups/acquit-case-workspace/AcquitAcademy";
import { DocumentEditorVSCode } from "./components/mockups/acquit-case-workspace/DocumentEditorVSCode";
import { SovereignCylinder } from "./components/mockups/acquit-case-workspace/SovereignCylinder";
import { GoogleWorkspaceIntegration } from "./components/mockups/acquit-case-workspace/GoogleWorkspaceIntegration";
import { RagCitationViewer } from "./components/mockups/acquit-case-workspace/RagCitationViewer";
import { FeaturedAttorneysCarousel } from "./components/mockups/acquit-case-workspace/FeaturedAttorneysCarousel";
import { FeaturedCoursesCarousel } from "./components/mockups/acquit-case-workspace/FeaturedCoursesCarousel";
import { MOCK_RAG_MESSAGES } from "./components/mockups/acquit-case-workspace/legalData";
import { ChainOfCommandWorkspace } from "./components/mockups/chain-of-command/ChainOfCommandWorkspace";
import { AuthProvider, WorkspaceGuard } from "./contexts/AuthContext";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

type RouteDefinition = {
  path: string;
  label: string;
  componentPath: string;
};

const ROUTES: RouteDefinition[] = [
  { path: "/case-workspace", label: "Case Workspace", componentPath: "acquit-case-workspace/CaseWorkspace" },
  { path: "/ai-lab", label: "AI Lab", componentPath: "acquit-case-workspace/AILab" },
  { path: "/timeline", label: "Timeline", componentPath: "acquit-case-workspace/CaseTimeline" },
  { path: "/law-library", label: "Law Library", componentPath: "acquit-case-workspace/LawLibraryExplorer" },
  { path: "/filing-center", label: "Filing Center", componentPath: "acquit-case-workspace/FilingCenter" },
  { path: "/attorney-directory", label: "Attorney Directory", componentPath: "acquit-case-workspace/AttorneyDirectory" },
  { path: "/academy", label: "Acquit Academy", componentPath: "acquit-case-workspace/AcquitAcademy" },
  { path: "/document-vault", label: "Document Vault", componentPath: "acquit-case-workspace/SovereignCylinder" },
  { path: "/document-editor", label: "Document Editor", componentPath: "acquit-case-workspace/DocumentEditorVSCode" },
  { path: "/evidence", label: "Evidence", componentPath: "acquit-case-workspace/EvidenceCarousel" },
  { path: "/featured-attorneys", label: "Featured Attorneys", componentPath: "acquit-case-workspace/FeaturedAttorneysCarousel" },
  { path: "/featured-courses", label: "Featured Courses", componentPath: "acquit-case-workspace/FeaturedCoursesCarousel" },
  { path: "/google-workspace", label: "Google Workspace", componentPath: "acquit-case-workspace/GoogleWorkspaceIntegration" },
  { path: "/rag-citations", label: "RAG Citations", componentPath: "acquit-case-workspace/RagCitationViewer" },
  { path: "/gallery", label: "Mockup Gallery", componentPath: "acquit-case-workspace/StitchGallery" },
];

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const exportedFunctions = Object.values(mod).filter(
    (value) => typeof value === "function",
  ) as ComponentType[];

  return (
    (mod.default as ComponentType | undefined) ||
    (mod.Preview as ComponentType | undefined) ||
    (mod[name] as ComponentType | undefined) ||
    exportedFunctions[exportedFunctions.length - 1]
  );
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const keys = Object.keys(modules);
      const exactMatch = keys.find(
        (key) =>
          key.includes(`/${componentPath}.tsx`) ||
          key.includes(`/${componentPath}`),
      );
      const loader = exactMatch ? modules[exactMatch] : undefined;

      if (!loader) {
        setError(`No component found for ${componentPath}`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) return;

        const name = componentPath.split("/").pop()!;
        const component = _resolveComponent(mod, name);
        if (!component) {
          setError(`No React component export found in ${exactMatch}`);
          return;
        }

        setComponent(() => component);
      } catch (cause) {
        if (cancelled) return;
        setError(
          `Failed to load ${componentPath}: ${
            cause instanceof Error ? cause.message : String(cause)
          }`,
        );
      }
    }

    void loadComponent();
    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] p-8 text-white">
        <h1 className="mb-3 text-xl font-semibold text-[#D4AF37]">Mockup Load Error</h1>
        <pre className="max-w-3xl whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-red-300">
          {error}
        </pre>
      </main>
    );
  }

  if (!Component) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#174E48] border-t-[#D4AF37]" />
          <p className="font-mono text-sm tracking-widest text-[#D4AF37]">LOADING ACQUIT...</p>
        </div>
      </main>
    );
  }

  return <Component />;
}

function MockupNavigation({ activePath }: { activePath: string }) {
  const base = getBasePath();

  return (
    <nav
      aria-label="Acquit mockup navigation"
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-[#D4AF37]/20 bg-[#0A0A0A]/95 px-3 py-2 shadow-2xl backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
        {ROUTES.map((route) => (
          <a
            key={route.path}
            href={`${base}${route.path}`}
            aria-current={activePath === route.path ? "page" : undefined}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              activePath === route.path
                ? "bg-[#D4AF37] text-black shadow-[0_0_18px_rgba(212,175,55,.35)]"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {route.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function Gallery() {
  const base = getBasePath();

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-6 pb-24 text-white md:p-10 md:pb-24">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 font-mono text-xs tracking-[0.25em] text-[#D4AF37]">ACQUIT.AI / MOCKUP ROUTER</p>
          <h1 className="text-3xl font-semibold">Platform Screen Map</h1>
          <p className="mt-2 max-w-2xl text-white/60">
            All mockup surfaces are now addressable through stable routes. This is the visual integration layer; it does not imply AI filing or court-system automation.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((route) => (
            <a
              key={route.path}
              href={`${base}${route.path}`}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#D4AF37]/50 hover:bg-white/[0.06]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{route.label}</span>
                <span className="text-[#D4AF37] transition-transform group-hover:translate-x-1">→</span>
              </div>
              <code className="text-xs text-white/40">{route.path}</code>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-45px)] bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-white font-sans">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-serif text-[#D4AF37] mb-4">Acquit.ai Platform</h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          The legal operating system for self-represented litigants. Access the full suite of AI tools, research modules, and legal workspaces.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          <button onClick={() => navigate('/case-workspace')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#174E48] transition-all group flex flex-col items-center justify-center gap-3">
            <span className="text-[#D4AF37] font-medium group-hover:text-[#34D399] transition-colors">Case Workspace</span>
          </button>
          <button onClick={() => navigate('/ai-lab')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#174E48] transition-all group flex flex-col items-center justify-center gap-3">
            <span className="text-[#D4AF37] font-medium group-hover:text-[#34D399] transition-colors">AI Lab</span>
          </button>
          <button onClick={() => navigate('/law-library')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#174E48] transition-all group flex flex-col items-center justify-center gap-3">
            <span className="text-[#D4AF37] font-medium group-hover:text-[#34D399] transition-colors">Law Library</span>
          </button>
          <button onClick={() => navigate('/attorney-directory')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#174E48] transition-all group flex flex-col items-center justify-center gap-3">
            <span className="text-[#D4AF37] font-medium group-hover:text-[#34D399] transition-colors">Attorney Directory</span>
          </button>
          <button onClick={() => navigate('/filing-center')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#174E48] transition-all group flex flex-col items-center justify-center gap-3">
            <span className="text-[#D4AF37] font-medium group-hover:text-[#34D399] transition-colors">Filing Center</span>
          </button>
          <button onClick={() => navigate('/chain-of-command')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#34D399] transition-all group flex flex-col items-center justify-center gap-3">
            <span className="text-[#34D399] font-medium group-hover:text-[#34D399] transition-colors">Chain of Command</span>
          </button>
          <button onClick={() => navigate('/academy')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#174E48] transition-all group flex flex-col items-center justify-center gap-3">
            <span className="text-[#D4AF37] font-medium group-hover:text-[#34D399] transition-colors">Acquit Academy</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StitchCategoryPageRoute() {
  const { categoryId } = useParams<{ categoryId: string }>();
  return <StitchCategoryPage categoryId={categoryId || "command_center"} />;
}

function MainApp() {
  const location = useLocation();
  const isStitchOrTool =
    location.pathname.startsWith("/stitch") ||
    location.pathname.startsWith("/stitch-view") ||
    location.pathname.startsWith("/category") ||
    location.pathname === "/gallery" ||
    location.pathname === "/chain-of-command" ||
    location.pathname === "/document-editor" ||
    location.pathname === "/editor" ||
    location.pathname === "/document-vault" ||
    location.pathname === "/cylinder" ||
    location.pathname === "/academy" ||
    location.pathname === "/google-workspace" ||
    location.pathname === "/google" ||
    location.pathname === "/rag-citations" ||
    location.pathname === "/rag" ||
    location.pathname === "/featured-attorneys" ||
    location.pathname === "/carousel-attorneys" ||
    location.pathname === "/featured-courses" ||
    location.pathname === "/carousel-courses";

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e0e]">
      <StitchMasterNav />
      <div className="flex-1 relative">
        <Routes>
          {/* Primary Legal OS Workspace Pages */}
          <Route path="/" element={<StitchCategoryPage categoryId="command_center" />} />
          <Route path="/command-center" element={<StitchCategoryPage categoryId="command_center" />} />
          <Route path="/docket" element={<StitchCategoryPage categoryId="the_docket" />} />
          <Route path="/cases" element={<StitchCategoryPage categoryId="the_docket" />} />
          <Route path="/case-workspace" element={<StitchCategoryPage categoryId="the_docket" />} />
          <Route path="/workspace" element={<StitchCategoryPage categoryId="the_docket" />} />
          <Route path="/chambers" element={<StitchCategoryPage categoryId="chambers" />} />
          <Route path="/ai-lab" element={<StitchCategoryPage categoryId="chambers" />} />
          <Route path="/ai-legal-team" element={<StitchCategoryPage categoryId="chambers" />} />
          <Route path="/timeline" element={<StitchCategoryPage categoryId="case_timeline" />} />
          <Route path="/case-timeline" element={<StitchCategoryPage categoryId="case_timeline" />} />
          <Route path="/investigations" element={<StitchCategoryPage categoryId="investigations" />} />
          <Route path="/evidence" element={<StitchCategoryPage categoryId="investigations" />} />
          <Route path="/record-room" element={<StitchCategoryPage categoryId="record_room" />} />
          <Route path="/documents" element={<StitchCategoryPage categoryId="record_room" />} />
          <Route path="/records" element={<StitchCategoryPage categoryId="record_room" />} />
          <Route path="/law-library" element={<StitchCategoryPage categoryId="law_library" />} />
          <Route path="/library" element={<StitchCategoryPage categoryId="law_library" />} />
          <Route path="/motions" element={<StitchCategoryPage categoryId="motions_tasks" />} />
          <Route path="/motions-tasks" element={<StitchCategoryPage categoryId="motions_tasks" />} />
          <Route path="/calendar" element={<StitchCategoryPage categoryId="motions_tasks" />} />
          <Route path="/tasks" element={<StitchCategoryPage categoryId="motions_tasks" />} />
          <Route path="/court-watch" element={<StitchCategoryPage categoryId="court_watch" />} />
          <Route path="/hearings" element={<StitchCategoryPage categoryId="court_watch" />} />
          <Route path="/counsel" element={<StitchCategoryPage categoryId="counsel_directory" />} />
          <Route path="/directory" element={<StitchCategoryPage categoryId="counsel_directory" />} />
          <Route path="/attorney-directory" element={<StitchCategoryPage categoryId="counsel_directory" />} />
          <Route path="/filing" element={<StitchCategoryPage categoryId="record_room" />} />
          <Route path="/filing-center" element={<StitchCategoryPage categoryId="record_room" />} />
          <Route path="/accessibility" element={<StitchCategoryPage categoryId="accessibility" />} />
          <Route path="/accessibility-settings" element={<StitchCategoryPage categoryId="accessibility" />} />
          <Route path="/security" element={<StitchCategoryPage categoryId="system_settings" />} />
          <Route path="/audit" element={<StitchCategoryPage categoryId="system_settings" />} />
          <Route path="/settings" element={<StitchCategoryPage categoryId="system_settings" />} />
          <Route path="/system" element={<StitchCategoryPage categoryId="system_settings" />} />
          <Route path="/system-settings" element={<StitchCategoryPage categoryId="system_settings" />} />

          {/* Stitch Category Deep Screens */}
          <Route path="/stitch-view/:categoryId" element={<StitchCategoryPageRoute />} />
          <Route path="/category/:categoryId" element={<StitchCategoryPageRoute />} />

          {/* Direct Mockup and Matrix Gallery */}
          <Route path="/stitch/:mockupName" element={<StitchMockupDirectPage />} />
          <Route path="/gallery" element={<StitchGallery />} />
          <Route path="/stitch" element={<StitchGallery />} />

          {/* Pro Workspace Tools (Protected with WorkspaceGuard) */}
          <Route
            path="/chain-of-command"
            element={
              <WorkspaceGuard>
                <ChainOfCommandWorkspace />
              </WorkspaceGuard>
            }
          />
          <Route
            path="/document-editor"
            element={
              <WorkspaceGuard>
                <DocumentEditorVSCode />
              </WorkspaceGuard>
            }
          />
          <Route
            path="/editor"
            element={
              <WorkspaceGuard>
                <DocumentEditorVSCode />
              </WorkspaceGuard>
            }
          />
          <Route
            path="/document-vault"
            element={
              <WorkspaceGuard>
                <SovereignCylinder />
              </WorkspaceGuard>
            }
          />
          <Route
            path="/cylinder"
            element={
              <WorkspaceGuard>
                <SovereignCylinder />
              </WorkspaceGuard>
            }
          />
          <Route path="/academy" element={<AcquitAcademy />} />
          <Route
            path="/google-workspace"
            element={
              <WorkspaceGuard>
                <GoogleWorkspaceIntegration matterTitle="State v. Doe" caseNumber="2024-CR-04821" courtName="SF Superior Court" />
              </WorkspaceGuard>
            }
          />
          <Route
            path="/google"
            element={
              <WorkspaceGuard>
                <GoogleWorkspaceIntegration matterTitle="State v. Doe" caseNumber="2024-CR-04821" courtName="SF Superior Court" />
              </WorkspaceGuard>
            }
          />
          <Route
            path="/rag-citations"
            element={
              <WorkspaceGuard>
                <div className="p-6 max-w-5xl mx-auto">
                  <RagCitationViewer enableLiveStreaming={true} onOpenLawLibrary={() => {}} />
                </div>
              </WorkspaceGuard>
            }
          />
          <Route
            path="/rag"
            element={
              <WorkspaceGuard>
                <div className="p-6 max-w-5xl mx-auto">
                  <RagCitationViewer enableLiveStreaming={true} onOpenLawLibrary={() => {}} />
                </div>
              </WorkspaceGuard>
            }
          />
          <Route path="/featured-attorneys" element={<div className="p-8"><FeaturedAttorneysCarousel lawyers={[]} /></div>} />
          <Route path="/carousel-attorneys" element={<div className="p-8"><FeaturedAttorneysCarousel lawyers={[]} /></div>} />
          <Route path="/featured-courses" element={<div className="p-8"><FeaturedCoursesCarousel courses={[]} onSelect={() => {}} /></div>} />
          <Route path="/carousel-courses" element={<div className="p-8"><FeaturedCoursesCarousel courses={[]} onSelect={() => {}} /></div>} />

          {/* Default Fallback to Command Center */}
          <Route path="*" element={<StitchCategoryPage categoryId="command_center" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const basePath = getBasePath();
  const pathname = window.location.pathname;
  const localPath =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname || "/";
  const previewMatch = localPath.match(/^\/preview\/(.+)$/);

  if (previewMatch) {
    return (
      <PreviewRenderer
        componentPath={previewMatch[1]}
        modules={discoveredModules}
      />
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
