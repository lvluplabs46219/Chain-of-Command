import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");

const SOURCE = path.join(
  webRoot,
  "components",
  "mockups",
  "acquit-case-workspace",
  "NEWSTITCH",
  "stitch_acquit.ai_legal_operating_system"
);

/**
 * Copies every Stitch mockup folder into the public directory twice:
 *  1. public/mockups/<name>/index.html  -> served at /mockups/<name>/index.html
 *  2. public/assets/stitch/<name>/code.html -> consumed by StitchMockup.tsx / StitchGallery.tsx
 * screen.png is copied to both locations for thumbnails.
 */
function main() {
  if (!fs.existsSync(SOURCE)) {
    console.warn(`[copy-mockups] Source not found: ${SOURCE}. Skipping.`);
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
    if (!html) {
      console.warn(`[copy-mockups] No HTML file in ${name}; skipping.`);
      continue;
    }
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
  console.log(`[copy-mockups] Copied ${copied} mockups into public/mockups and public/assets/stitch.`);
}

main();
