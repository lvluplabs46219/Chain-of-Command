import { useEffect, useState, type ComponentType } from "react";
import { modules as discoveredModules } from "./.generated/mockup-components";

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

  if (!Component) return null;

  return <Component />;
}

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function Gallery() {
  const keys = Object.keys(discoveredModules).map(k => k.replace('./components/mockups/', '').replace('.tsx', ''));
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl w-full">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Component Preview Server
        </h1>
        <p className="text-gray-500 mb-8">
          This server renders individual components for the workspace canvas.
        </p>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-left overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-700">Available Previews</h2>
          </div>
          <ul className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {keys.map((key) => (
              <li key={key} className="px-6 py-3 hover:bg-gray-50">
                <a href={`${getBasePath()}/preview/${key}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium block">
                  {key}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
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

  return <Gallery />;
}

export default App;
