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

const OUT_DIR = path.join(webRoot, "src", "components", "stitch", "pages");
const REGISTRY = path.join(webRoot, "src", "components", "stitch", "registry.ts");
const TOKENS = path.join(webRoot, "src", "components", "stitch", "tokens.css");

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const ATTR_MAP = {
  "class": "className",
  "for": "htmlFor",
  "tabindex": "tabIndex",
  "autocomplete": "autoComplete",
  "autofocus": "autoFocus",
  "colspan": "colSpan",
  "rowspan": "rowSpan",
  "readonly": "readOnly",
  "maxlength": "maxLength",
  "minlength": "minLength",
  "novalidate": "noValidate",
  "srcset": "srcSet",
  "crossorigin": "crossOrigin",
  "datetime": "dateTime",
  "contenteditable": "contentEditable",
  "spellcheck": "spellCheck",
  "playsinline": "playsInline",
};

function camelAttr(name) {
  if (ATTR_MAP[name] !== undefined) return ATTR_MAP[name];
  if (name.startsWith("data-") || name.startsWith("aria-")) return name;
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function cssPropToJs(prop) {
  return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function inlineStyleToObject(raw) {
  const entries = [];
  for (const decl of raw.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (!prop || !value) continue;
    entries.push(cssPropToJs(prop) + ": " + JSON.stringify(value));
  }
  return entries.length ? "{{ " + entries.join(", ") + " }}" : undefined;
}

function pascal(name) {
  const parts = name
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  let out = parts.join("");
  if (/^[0-9]/.test(out)) out = "Page" + out;
  return out || "Page";
}

function convertAttrs(attrText) {
  const out = [];
  const attrRe = /([a-zA-Z_:@\.\-][\w:\.@\-\[\]]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = attrRe.exec(attrText))) {
    const rawName = m[1];
    const value = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : m[4]);
    const name = camelAttr(rawName);
    if (value === undefined) { out.push(name); continue; }
    if (name === "style") {
      const obj = inlineStyleToObject(value);
      if (obj) { out.push("style=" + obj); continue; }
    }
    const escaped = value.replace(/"/g, "&quot;").replace(/\n/g, " ");
    out.push(name + '="' + escaped + '"');
  }
  return out.length ? " " + out.join(" ") : "";
}

function escapeTextBraces(text) {
  return text.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
}

function htmlToJsx(html) {
  let out = "";
  let last = 0;
  const tagRe = /<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)(\/?)>/g;
  let m;
  while ((m = tagRe.exec(html))) {
    out += escapeTextBraces(html.slice(last, m.index));
    const close = m[1], name = m[2], attrText = m[3], selfClose = m[4];
    if (selfClose || VOID_ELEMENTS.has(name.toLowerCase())) {
      out += "<" + name + convertAttrs(attrText) + " />";
    } else if (close) {
      out += "</" + name + ">";
    } else {
      out += "<" + name + convertAttrs(attrText) + ">";
    }
    last = m.index + m[0].length;
  }
  out += escapeTextBraces(html.slice(last));
  return out;
}

function extractBody(doc) {
  const bodyMatch = doc.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const raw = bodyMatch ? bodyMatch[1] : doc;
  return raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");
}

function extractBodyClasses(doc) {
  const m = doc.match(/<body[^>]*class="([^"]*)"/i);
  return m ? m[1] : "";
}

function extractStyles(doc) {
  const styles = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(doc))) styles.push(m[1]);
  return styles.join("\n\n");
}

// ---- Tailwind config parsing (v4) ----
// Extracts the tailwind.config object from ANY <script> tag (with or without
// id="tailwind-config") using a balanced-brace scan that respects strings and
// comments. Tolerates trailing commas, stray statements after the object, and
// malformed trailing braces.

function extractBalancedObject(text, startIdx) {
  let depth = 0;
  let i = startIdx;
  const n = text.length;
  let inStr = null; // '"', "'", or '`'
  while (i < n) {
    const ch = text[i];
    if (inStr) {
      if (ch === "\\") { i += 2; continue; }
      if (ch === inStr) inStr = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; i++; continue; }
    if (ch === "/" && text[i + 1] === "/") {
      while (i < n && text[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < n && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(startIdx, i + 1);
    }
    i++;
  }
  return null; // unbalanced
}

function tryEvalObject(obj) {
  try {
    return { cfg: new Function("return (" + obj + ")")() };
  } catch (e) {
    // Retry with trailing commas stripped (JS objects tolerate them, but be safe)
    try {
      const cleaned = obj.replace(/,(\s*[}\]])/g, "$1");
      return { cfg: new Function("return (" + cleaned + ")")() };
    } catch (e2) {
      return { err: e2.message };
    }
  }
}

function parseTailwindConfig(doc) {
  const scripts = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(doc))) scripts.push(m[2]);
  // Prefer the id="tailwind-config" script if present
  const idMatch = doc.match(/<script id="tailwind-config"[^>]*>([\s\S]*?)<\/script>/i);
  if (idMatch) scripts.unshift(idMatch[1]);

  let lastErr = null;
  for (const s of scripts) {
    const idx = s.search(/tailwind\.config\s*=/);
    if (idx === -1) continue;
    const brace = s.indexOf("{", idx);
    if (brace === -1) continue;
    const obj = extractBalancedObject(s, brace);
    if (!obj) { lastErr = "unbalanced braces"; continue; }
    const res = tryEvalObject(obj);
    if (res.cfg) return res.cfg;
    lastErr = res.err;
    console.warn("[stitch:convert] Config eval failed, trying fallback parse: " + lastErr);
  }
  if (lastErr) console.warn("[stitch:convert] Could not parse tailwind config: " + lastErr);
  return null;
}

function themeOf(cfg) {
  if (!cfg || !cfg.theme) return {};
  const t = cfg.theme;
  return t.extend ? Object.assign({}, t, t.extend) : t;
}

// ---- Token flattening (v3) ----
// Handles: nested color objects (lemon: {300,400}), fontSize arrays with
// typography modifiers, fontFamily arrays, DEFAULT keys.

const FONT_SIZE_MODS = {
  lineHeight: "--line-height",
  fontWeight: "--font-weight",
  letterSpacing: "--letter-spacing",
};

// Returns array of { name, cssVar, value, mods? }
function flattenTokens(catKey, prefix, entries) {
  const out = [];
  if (!entries || typeof entries !== "object") return out;
  for (const [name, val] of Object.entries(entries)) {
    if (val === undefined || val === null) continue;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      // Nested object (e.g. colors: lemon: { 300: '#fef08a' })
      for (const [sub, sv] of Object.entries(val)) {
        if (sv === undefined || sv === null || typeof sv === "object") continue;
        const subName = sub === "DEFAULT" ? name : name + "-" + sub;
        out.push({ name: subName, cssVar: prefix + subName, value: String(sv).trim() });
      }
      continue;
    }
    if (Array.isArray(val)) {
      if (catKey === "fontSize") {
        const mods = (val[1] && typeof val[1] === "object") ? val[1] : {};
        const cleanMods = {};
        for (const [k, v] of Object.entries(mods)) {
          if (FONT_SIZE_MODS[k]) cleanMods[k] = String(v);
        }
        out.push({ name, cssVar: prefix + name, value: String(val[0]).trim(), mods: cleanMods });
      } else if (catKey === "fontFamily") {
        out.push({ name, cssVar: prefix + name, value: val.join(", ").trim() });
      } else {
        out.push({ name, cssVar: prefix + name, value: String(val[0]).trim() });
      }
      continue;
    }
    out.push({ name, cssVar: prefix + name, value: String(val).trim() });
  }
  return out;
}

const CATS = [
  ["colors", "--color-", "#000000", true],
  ["spacing", "--spacing-", "1rem", true],
  ["fontFamily", "--font-", "sans-serif", true],
  ["fontSize", "--text-", "1rem", true],
  ["fontWeight", "--font-weight-", "400", true],
  ["borderRadius", "--radius-", "0.5rem", true],
  ["lineHeight", "--leading-", "1.5", true],
  ["boxShadow", "--shadow-", "0 0 #0000", true],
  ["opacity", "--opacity-", "1", true],
  ["zIndex", "--z-", "1", true],
];

function themeTokens(theme) {
  // Returns Map key -> flattened token list, where key = catKey + "/" + name
  const all = new Map();
  for (const [catKey, prefix] of CATS) {
    const flat = flattenTokens(catKey, prefix, theme[catKey]);
    for (const t of flat) all.set(catKey + "/" + t.name, t);
  }
  return all;
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error("[stitch:convert] Source not found: " + SOURCE);
    process.exit(1);
  }

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const folders = fs
    .readdirSync(SOURCE, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  // Pass 1: parse everything
  const parsed = [];
  const skipped = [];
  let parseFailures = 0;
  for (const folder of folders) {
    const htmlPath = path.join(SOURCE, folder, "code.html");
    if (!fs.existsSync(htmlPath)) {
      skipped.push(folder + " (no code.html)");
      continue;
    }
    const doc = fs.readFileSync(htmlPath, "utf-8");
    const cfg = parseTailwindConfig(doc);
    if (!cfg) parseFailures += 1;
    parsed.push({
      folder,
      doc,
      tokens: themeTokens(themeOf(cfg)),
      bodyClasses: extractBodyClasses(doc),
    });
  }

  // Pass 2: union of all flattened tokens across pages (for global @theme)
  const union = new Map(); // key -> { cssVar, placeholder }
  for (const p of parsed) {
    for (const [key, t] of p.tokens) {
      if (!union.has(key)) {
        const catKey = key.split("/")[0];
        const cat = CATS.find((c) => c[0] === catKey);
        union.set(key, { cssVar: t.cssVar, placeholder: cat[2] });
      }
    }
  }

  // Pass 3: emit global tokens.css (placeholders; pages override with real values)
  const themeLines = [];
  const modLines = [];
  for (const [, u] of union) {
    themeLines.push("  " + u.cssVar + ": " + u.placeholder + ";");
    if (u.cssVar.startsWith("--text-")) {
      modLines.push("  " + u.cssVar + "--line-height: 1.5;");
      modLines.push("  " + u.cssVar + "--font-weight: 400;");
      modLines.push("  " + u.cssVar + "--letter-spacing: 0em;");
    }
  }

  const tokensCss = [
    "/* AUTO-GENERATED by scripts/convert-stitch-to-react.mjs -- do not edit.",
    "   Registers every Stitch design token with Tailwind v4 (flattened, incl.",
    "   nested palettes like lemon-400, custom spacing like gutter/margin-safe,",
    "   and fontSize typography modifiers). Utilities compile to var(--color-*),",
    "   var(--spacing-*) etc.; each page scopes its own real values via [data-page]. */",
    "@theme {",
    ...themeLines,
    ...modLines,
    "}",
    "",
    "/* Material Symbols support (font loaded via Google Fonts in layout.tsx) */",
    ".material-symbols-outlined {",
    '  font-family: "Material Symbols Outlined";',
    "  font-weight: normal;",
    "  font-style: normal;",
    "  display: inline-block;",
    "  line-height: 1;",
    "  letter-spacing: normal;",
    "  text-transform: none;",
    "  white-space: nowrap;",
    "  direction: ltr;",
    "  -webkit-font-smoothing: antialiased;",
    "}",
    "",
  ].join("\n");

  fs.writeFileSync(TOKENS, tokensCss);

  // Pass 4: emit components
  const registry = new Map();
  let converted = 0;
  for (const p of parsed) {
    const { folder, doc, tokens, bodyClasses } = p;
    const css = extractStyles(doc);
    const jsx = htmlToJsx(extractBody(doc));
    const componentName = pascal(folder);
    const safeFile = folder.replace(/[^a-zA-Z0-9._-]/g, "_");
    const cssFile = safeFile + ".css";

    // Page-scoped CSS variables with the page's real token values
    const varLines = [];
    for (const [, t] of tokens) {
      varLines.push("  " + t.cssVar + ": " + t.value + ";");
      if (t.mods) {
        for (const [k, v] of Object.entries(t.mods)) {
          varLines.push("  " + t.cssVar + FONT_SIZE_MODS[k] + ": " + v + ";");
        }
      }
    }
    const scopedVars = varLines.length
      ? '[data-page="' + safeFile + '"] {\n' + varLines.join("\n") + "\n}\n\n"
      : "";

    const wrapperClass = ("stitch-page " + bodyClasses).replace(/"/g, "&quot;").trim();

    const component = [
      "// AUTO-GENERATED from " + folder + "/code.html by scripts/convert-stitch-to-react.mjs -- do not edit.",
      'import AppShell from "@/components/alexandria/AppShell";',
      'import "./' + cssFile + '";',
      "",
      "export default function " + componentName + "() {",
      "  return (",
      '    <AppShell pageName="' + folder.replace(/"/g, "'") + '">',
      '      <div className="' + wrapperClass + '" data-page="' + safeFile + '">',
      jsx,
      "      </div>",
      "    </AppShell>",
      "  );",
      "}",
      "",
    ].join("\n");

    fs.writeFileSync(path.join(OUT_DIR, safeFile + ".tsx"), component);
    fs.writeFileSync(
      path.join(OUT_DIR, cssFile),
      "/* AUTO-GENERATED page styles (" + folder + ") */\n" + scopedVars + css + "\n"
    );

    registry.set(folder, { componentName, safeFile });
    converted += 1;
  }

  const importLines = [];
  const entries = [];
  for (const [folder, info] of registry) {
    importLines.push('import ' + info.componentName + ' from "./pages/' + info.safeFile + '";');
    entries.push('  ' + JSON.stringify(folder) + ": " + info.componentName + ",");
  }
  const registrySrc = [
    "// AUTO-GENERATED by scripts/convert-stitch-to-react.mjs -- do not edit.",
    'import type { ComponentType } from "react";',
    ...importLines,
    "",
    "export const stitchComponents: Record<string, ComponentType> = {",
    ...entries,
    "};",
    "",
    "export function getStitchComponent(name?: string | null): ComponentType | null {",
    "  if (!name) return null;",
    "  return stitchComponents[name] ?? null;",
    "}",
    "",
  ].join("\n");

  fs.writeFileSync(REGISTRY, registrySrc);

  console.log("[stitch:convert] Converted " + converted + " pages into React components.");
  console.log("[stitch:convert] Registered " + themeLines.length + " global design tokens.");
  if (parseFailures) {
    console.log("[stitch:convert] " + parseFailures + " pages had unparsable tailwind configs (tokens skipped).");
  }
  if (skipped.length) {
    console.log("[stitch:convert] Skipped " + skipped.length + ":");
    for (const s of skipped) console.log("  - " + s);
  }
}

main();
