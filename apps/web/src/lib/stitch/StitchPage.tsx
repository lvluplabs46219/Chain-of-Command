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

const SUPPRESS_TAILWIND_WARN = `<script>(function(){var w=console.warn;console.warn=function(){if(arguments[0]&&typeof arguments[0]==="string"&&(arguments[0].indexOf("cdn.tailwindcss.com")!==-1||arguments[0].indexOf("Tailwind CSS in production")!==-1))return;w.apply(console,arguments);};})();</script>\n`;

function transformStitchHtml(raw: string): string {
  let content = raw
    .replace(/ACQUIT\.AI/g, "CHAIN OF COMMAND")
    .replace(/Acquit\.ai/g, "Chain of Command")
    .replace(/acquit\.ai/g, "chainofcommand.law")
    .replace(/Acquit Platform/g, "Chain of Command Platform")
    .replace(/Acquit Legal OS/g, "Chain of Command Legal OS")
    .replace(/Acquit/g, "Chain of Command");

  if (content.includes("cdn.tailwindcss.com") && !content.includes("arguments[0].indexOf(\"cdn.tailwindcss.com\")")) {
    content = content.replace(
      /<script src="https:\/\/cdn\.tailwindcss\.com/g,
      SUPPRESS_TAILWIND_WARN + '<script src="https://cdn.tailwindcss.com'
    );
  }
  return content;
}

export async function loadStitchHtml(folder: string): Promise<string> {
  const candidatePaths = [
    path.join(process.cwd(), "public", "assets", "stitch", folder, "code.html"),
    path.join(process.cwd(), "apps", "web", "public", "assets", "stitch", folder, "code.html"),
    path.join(process.cwd(), "apps", "web", "src", "assets", "stitch", folder, "code.html"),
    path.join(process.cwd(), "src", "assets", "stitch", folder, "code.html"),
    path.join(process.cwd(), "apps", "web", "components", "mockups", "acquit-case-workspace", "NEWSTITCH", "stitch_acquit.ai_legal_operating_system", folder, "code.html"),
    path.join(process.cwd(), "components", "mockups", "acquit-case-workspace", "NEWSTITCH", "stitch_acquit.ai_legal_operating_system", folder, "code.html"),
  ];

  for (const filePath of candidatePaths) {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      if (content) return transformStitchHtml(content);
    } catch {
      // Continue to next candidate
    }
  }

  console.error(`[stitch] Error reading design ${folder}: not found in any candidate path`);
  return "";
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
