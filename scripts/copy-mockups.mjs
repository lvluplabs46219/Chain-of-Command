import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Locate apps/web directory
let webRoot = path.resolve(__dirname, "../apps/web");
if (!fs.existsSync(webRoot)) {
  webRoot = path.resolve(__dirname, "..");
}
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

    const htmlSrc = path.join(srcDir, html);
    const pngSrc = path.join(srcDir, "screen.png");

    const mockupDir = path.join(webRoot, "public", "mockups", name);
    const stitchDir = path.join(webRoot, "public", "assets", "stitch", name);
    fs.mkdirSync(mockupDir, { recursive: true });
    fs.mkdirSync(stitchDir, { recursive: true });

    fs.copyFileSync(htmlSrc, path.join(mockupDir, "index.html"));
    fs.copyFileSync(htmlSrc, path.join(stitchDir, "code.html"));
    if (fs.existsSync(pngSrc)) {
      fs.copyFileSync(pngSrc, path.join(mockupDir, "screen.png"));
      fs.copyFileSync(pngSrc, path.join(stitchDir, "screen.png"));
    }
    copied += 1;
  }
}

main();
