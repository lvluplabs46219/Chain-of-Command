import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Locate apps/web directory
let webRoot = path.resolve(__dirname, "..");
if (!fs.existsSync(path.join(webRoot, "components"))) {
  if (fs.existsSync(path.resolve(process.cwd(), "apps/web/components"))) {
    webRoot = path.resolve(process.cwd(), "apps/web");
  } else if (fs.existsSync(path.resolve(process.cwd(), "components"))) {
    webRoot = process.cwd();
  }
}

const SOURCE = path.join(
  webRoot,
  "components",
  "mockups",
  "acquit-case-workspace",
  "NEWSTITCH",
  "stitch_acquit.ai_legal_operating_system"
);

const SUPPRESS_TAILWIND_WARN = `<script>(function(){var w=console.warn;console.warn=function(){if(arguments[0]&&typeof arguments[0]==="string"&&(arguments[0].indexOf("cdn.tailwindcss.com")!==-1||arguments[0].indexOf("Tailwind CSS in production")!==-1))return;w.apply(console,arguments);};})();</script>\n`;

function transformHtml(raw) {
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

function main() {
  if (!fs.existsSync(SOURCE)) {
    return;
  }

  const mockups = fs
    .readdirSync(SOURCE, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  let copied = 0;
  for (const name of mockups) {
    const srcDir = path.join(SOURCE, name);
    const html = fs.readdirSync(srcDir).find((f) => f.endsWith(".html"));
    if (!html) continue;

    const mockupDir = path.join(webRoot, "public", "mockups", name);
    const stitchDir = path.join(webRoot, "public", "assets", "stitch", name);
    const targetHtml = path.join(stitchDir, "code.html");

    // Fast-path: Skip if already extracted to avoid disk churn on dev startup
    if (fs.existsSync(targetHtml) && !process.env.FORCE_COPY_MOCKUPS) {
      continue;
    }

    const htmlSrc = path.join(srcDir, html);
    const pngSrc = path.join(srcDir, "screen.png");

    fs.mkdirSync(mockupDir, { recursive: true });
    fs.mkdirSync(stitchDir, { recursive: true });

    const rawHtml = fs.readFileSync(htmlSrc, "utf-8");
    const cleanHtml = transformHtml(rawHtml);

    fs.writeFileSync(path.join(mockupDir, "index.html"), cleanHtml, "utf-8");
    fs.writeFileSync(path.join(stitchDir, "code.html"), cleanHtml, "utf-8");
    if (fs.existsSync(pngSrc)) {
      fs.copyFileSync(pngSrc, path.join(mockupDir, "screen.png"));
      fs.copyFileSync(pngSrc, path.join(stitchDir, "screen.png"));
    }
    copied += 1;
  }
}

main();
