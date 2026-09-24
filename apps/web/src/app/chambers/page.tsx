import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";

export const metadata: Metadata = {
  title: "Chambers - AI Legal Team | Acquit.ai",
  description: "Multi-agent legal workspace with specialized AI counselors",
};

async function getMockupHtml(mockupName: string): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "assets",
    "stitch",
    mockupName,
    "code.html"
  );

  try {
    const html = await fs.readFile(filePath, "utf-8");
    return html;
  } catch (error) {
    console.error(`Error reading mockup ${mockupName}:`, error);
    return "";
  }
}

// Mockup navigation interceptor script
const navigationScript = `
  <script>
    (function() {
      document.addEventListener('click', function(e) {
        var target = e.target.closest('a, button');
        if (!target) return;
        var text = (target.innerText || '').trim().toLowerCase();
        var href = target.getAttribute('href');

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
          'motions & tasks': '/motions'
        };

        for (var key in routeMap) {
          if (text.indexOf(key) !== -1) {
            e.preventDefault();
            window.location.href = routeMap[key];
            return;
          }
        }
      }, true);
    })();
  </script>
`;

function injectNavigationScript(html: string): string {
  if (html.includes("</body>")) {
    return html.replace("</body>", `${navigationScript}</body>`);
  }
  return html + navigationScript;
}

function addBaseHref(html: string, basePath: string = ""): string {
  // Add base href for relative links
  if (!html.includes("<base")) {
    const baseTag = `<base href="${basePath}/" />`;
    if (html.includes("<head>")) {
      return html.replace("<head>", `<head>${baseTag}`);
    } else if (html.includes("<head")) {
      return html.replace("<head", `<head${baseTag}`);
    }
  }
  return html;
}

export default async function ChambersPage() {
  // Use the primary chambers mockup
  const html = await getMockupHtml("chambers_ai_legal_team");
  
  if (!html) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">
            Chambers Mockup Not Found
          </h1>
          <p className="text-white/60">
            The AI Legal Team mockup could not be loaded.
          </p>
          <a
            href="/gallery"
            className="inline-block mt-6 px-4 py-2 bg-[#D4AF37] text-black rounded hover:bg-[#D4AF37]/80 transition-colors"
          >
            View All Mockups
          </a>
        </div>
      </main>
    );
  }

  const processedHtml = injectNavigationScript(html);

  return (
    <main className="min-h-screen bg-[#141313]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs tracking-widest text-[#D4AF37] uppercase">
              ACQUIT.AI / CHAMBERS
            </p>
            <h1 className="text-lg font-semibold text-white">
              AI Legal Team Workspace
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/chambers?view=spec"
              className="px-3 py-1.5 text-xs font-medium text-[#8f9194] hover:bg-white/10 hover:text-white rounded transition-colors"
            >
              View Mockup Spec
            </a>
            <a
              href="/gallery"
              className="px-3 py-1.5 text-xs font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded transition-colors"
            >
              All Mockups
            </a>
          </div>
        </div>
      </header>

      {/* Mockup Content */}
      <div
        className="w-full h-[calc(100vh-64px)]"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    </main>
  );
}
