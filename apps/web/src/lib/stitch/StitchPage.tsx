import fs from "fs/promises";
import path from "path";

const NAV_ROUTE_TEXT: Record<string, string> = {
  "command center": "/",
  "the docket": "/docket",
  docket: "/docket",
  chambers: "/chambers",
  "ai legal team": "/chambers",
  "law library": "/law-library",
  "record room": "/record-room",
  documents: "/record-room",
  "court watch": "/court-watch",
  timeline: "/timeline",
  "case timeline": "/timeline",
  investigations: "/investigations",
  evidence: "/investigations",
  "evidence locker": "/investigations",
  "counsel directory": "/counsel",
  counsel: "/counsel",
  "filing center": "/filing",
  "court submission": "/filing",
  security: "/security",
  "system audit": "/audit",
  settings: "/audit",
  calendar: "/calendar",
  "court calendar": "/calendar",
  motions: "/motions",
  "motions & tasks": "/motions",
};

const navigationScript = `
  <script>
    (function() {
      document.addEventListener('click', function(e) {
        var target = e.target.closest('a, button');
        if (!target) return;
        var text = (target.innerText || '').trim().toLowerCase();
        var routeMap = ${JSON.stringify(NAV_ROUTE_TEXT)};
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

export async function loadStitchHtml(folder: string): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "assets",
    "stitch",
    folder,
    "code.html"
  );
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    console.error(`[stitch] Error reading design ${folder}:`, error);
    return "";
  }
}

function injectNavigationScript(html: string): string {
  if (html.includes("</body>")) {
    return html.replace("</body>", `${navigationScript}</body>`);
  }
  return html + navigationScript;
}

/**
 * Renders a Stitch design as the actual, full-bleed application page.
 * Edge-to-edge: no gallery chrome, no viewer shell.
 */
export default async function StitchPage({
  folder,
}: {
  folder: string;
}) {
  const rawHtml = await loadStitchHtml(folder);

  if (!rawHtml) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-semibold text-white">
            Design unavailable: {folder}
          </h1>
          <p className="text-white/60">
            Run <code>npm run mockups:copy</code> from <code>apps/web</code> and retry.
          </p>
        </div>
      </main>
    );
  }

  const processedHtml = injectNavigationScript(rawHtml);

  return (
    <div
      className="w-screen min-h-screen"
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}
