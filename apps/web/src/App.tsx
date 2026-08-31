import { useEffect, useState, type ComponentType } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { modules as discoveredModules } from "./.generated/mockup-components";
import { Navigation } from "./components/Navigation";
import { CaseWorkspace } from "./components/mockups/acquit-case-workspace/CaseWorkspace";
import { AILab } from "./components/mockups/acquit-case-workspace/AILab";
import { AttorneyDirectory } from "./components/mockups/acquit-case-workspace/AttorneyDirectory";
import { AcquitAcademy } from "./components/mockups/acquit-case-workspace/AcquitAcademy";
import { FilingCenter } from "./components/mockups/acquit-case-workspace/FilingCenter";
import { LawLibraryExplorer } from "./components/mockups/acquit-case-workspace/LawLibraryExplorer";
import { DocumentEditorVSCode } from "./components/mockups/acquit-case-workspace/DocumentEditorVSCode";
import { CaseTimeline } from "./components/mockups/acquit-case-workspace/CaseTimeline";
import { EvidenceCarousel } from "./components/mockups/acquit-case-workspace/EvidenceCarousel";
import { SovereignCylinder } from "./components/mockups/acquit-case-workspace/SovereignCylinder";
import { StitchGallery } from "./components/mockups/acquit-case-workspace/StitchGallery";
import { GoogleWorkspaceIntegration } from "./components/mockups/acquit-case-workspace/GoogleWorkspaceIntegration";
import { RagCitationViewer } from "./components/mockups/acquit-case-workspace/RagCitationViewer";
import { FeaturedAttorneysCarousel } from "./components/mockups/acquit-case-workspace/FeaturedAttorneysCarousel";
import { FeaturedCoursesCarousel } from "./components/mockups/acquit-case-workspace/FeaturedCoursesCarousel";
import { MOCK_RAG_MESSAGES } from "./components/mockups/acquit-case-workspace/legalData";
import { ChainOfCommandWorkspace } from "./components/mockups/chain-of-command/ChainOfCommandWorkspace";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
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
      // Fuzzy matching instead of exact path
      const keys = Object.keys(modules);
      const exactMatch = keys.find(k => k.includes(`/${componentPath}.tsx`) || k.includes(`/${componentPath}`));
      
      const loader = exactMatch ? modules[exactMatch] : null;

      if (!loader) {
        setError(
          `No component found matching: ${componentPath}\n\nAvailable components:\n` +
          keys.map(k => ` - ${k.replace('./components/mockups/', '').replace('.tsx', '')}`).join('\n')
        );
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) {
          return;
        }

        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);

        if (!comp) {
          setError(
            `No exported React component found in ${exactMatch}\n\nMake sure the file has at least one exported function component.`,
          );
          return;
        }

        setComponent(() => comp);
      } catch (e) {
        if (cancelled) {
          return;
        }
        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to load preview.\n${message}`);
      }
    }

    void loadComponent();

    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "800px", margin: "0 auto" }}>
        <h2 style={{ color: "#ef4444", borderBottom: "1px solid #fee2e2", paddingBottom: "0.5rem" }}>Preview Error</h2>
        <pre style={{ color: "#374151", backgroundColor: "#f3f4f6", padding: "1rem", borderRadius: "0.5rem", overflowX: "auto", marginTop: "1rem" }}>
          {error}
        </pre>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#174E48] border-t-[#D4AF37]" />
          <p className="text-[#D4AF37] font-mono text-sm tracking-widest animate-pulse">LOADING WORKSPACE...</p>
        </div>
      </div>
    );
  }

  return <Component />;
}

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;

  const local =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;

  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
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
          <button onClick={() => navigate('/workspace')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#174E48] transition-all group flex flex-col items-center justify-center gap-3">
            <span className="text-[#D4AF37] font-medium group-hover:text-[#34D399] transition-colors">Case Workspace</span>
          </button>
          <button onClick={() => navigate('/ai-lab')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#174E48] transition-all group flex flex-col items-center justify-center gap-3">
            <span className="text-[#D4AF37] font-medium group-hover:text-[#34D399] transition-colors">AI Lab</span>
          </button>
          <button onClick={() => navigate('/library')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#174E48] transition-all group flex flex-col items-center justify-center gap-3">
            <span className="text-[#D4AF37] font-medium group-hover:text-[#34D399] transition-colors">Law Library</span>
          </button>
          <button onClick={() => navigate('/directory')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#174E48] transition-all group flex flex-col items-center justify-center gap-3">
            <span className="text-[#D4AF37] font-medium group-hover:text-[#34D399] transition-colors">Attorney Directory</span>
          </button>
          <button onClick={() => navigate('/filing')} className="p-8 rounded-xl border border-[#1A1A1A] bg-[#0E0E0E] hover:bg-[#111214] hover:border-[#174E48] transition-all group flex flex-col items-center justify-center gap-3">
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

function MainApp() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <Navigation />
      <div className="flex-1 relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/workspace" element={<CaseWorkspace />} />
          <Route path="/ai-lab" element={<AILab />} />
          <Route path="/directory" element={<AttorneyDirectory />} />
          <Route path="/academy" element={<AcquitAcademy />} />
          <Route path="/filing" element={<FilingCenter />} />
          <Route path="/library" element={<LawLibraryExplorer />} />
          <Route path="/editor" element={<DocumentEditorVSCode />} />
          <Route path="/timeline" element={<CaseTimeline onSelectEventDoc={() => {}} onOpenFilingCenter={() => {}} />} />
          <Route path="/evidence" element={<EvidenceCarousel />} />
          <Route path="/cylinder" element={<SovereignCylinder />} />
          <Route path="/stitch" element={<StitchGallery />} />
          <Route path="/google" element={<GoogleWorkspaceIntegration matterTitle="Sample Matter" caseNumber="IN-12345" courtName="Sample Court" />} />
          <Route path="/rag" element={<div className="p-8"><RagCitationViewer message={MOCK_RAG_MESSAGES[0]} onOpenLawLibrary={() => {}} /></div>} />
          <Route path="/chain-of-command" element={<ChainOfCommandWorkspace />} />
          <Route path="/carousel-attorneys" element={<div className="p-8"><FeaturedAttorneysCarousel lawyers={[]} /></div>} />
          <Route path="/carousel-courses" element={<div className="p-8"><FeaturedCoursesCarousel courses={[]} onSelect={() => {}} /></div>} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const previewPath = getPreviewPath();

  if (previewPath) {
    return (
      <PreviewRenderer
        componentPath={previewPath}
        modules={discoveredModules}
      />
    );
  }

  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}

export default App;
