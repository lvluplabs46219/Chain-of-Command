import * as THREE from "three";

/**
 * Procedural Canvas Textures for Chain of Command 3D Courtroom
 * Zero external asset dependencies — guaranteed zero 404s.
 * Enforces SRGBColorSpace and maximum anisotropy.
 */

export function createProceduralWoodTexture(
  theme: "walnut" | "oak" | "mahogany" = "walnut"
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  // Base stain color gradient
  const palette = {
    walnut: { base: "#362214", grain1: "#24150b", grain2: "#4a3220", highlight: "#5b3d28" },
    oak: { base: "#68482d", grain1: "#47301c", grain2: "#855d3a", highlight: "#9c6f46" },
    mahogany: { base: "#2f1412", grain1: "#1d0a09", grain2: "#451c19", highlight: "#572420" },
  }[theme];

  ctx.fillStyle = palette.base;
  ctx.fillRect(0, 0, 512, 512);

  // Planks and longitudinal wood fibers
  for (let y = 0; y < 512; y += 4) {
    const alpha = 0.08 + Math.sin(y * 0.12) * 0.05 + Math.random() * 0.04;
    ctx.fillStyle = y % 8 === 0 ? palette.grain1 : palette.grain2;
    ctx.globalAlpha = Math.max(0.02, Math.min(0.25, alpha));
    ctx.fillRect(0, y, 512, 2 + Math.random() * 2);
  }

  // Soft wood rings
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 6; i++) {
    const cx = (i * 90) % 512;
    const cy = (i * 120) % 512;
    const rad = 60 + i * 25;
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rad);
    grad.addColorStop(0, palette.highlight);
    grad.addColorStop(0.7, palette.grain1);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Parquet plank dividers
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = "#120905";
  ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createProceduralCarpetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Traditional deep courtroom navy-slate or burgundian charcoal weave
  ctx.fillStyle = "#161922";
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = "#222736";
  for (let x = 0; x < 256; x += 4) {
    for (let y = 0; y < 256; y += 4) {
      if ((x + y) % 8 === 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  // Golden border accents for aisle runner
  ctx.fillStyle = "rgba(212, 175, 55, 0.15)";
  ctx.fillRect(0, 0, 12, 256);
  ctx.fillRect(244, 0, 12, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createProceduralLeatherTexture(color = "#18181c"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);

  // Tumbled pebble grain pattern
  ctx.fillStyle = "#0c0d10";
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 1800; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    const r = 1 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.arc(rx, ry, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createEvidenceConeTexture(markerNumber: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // High-visibility forensic yellow
  ctx.fillStyle = "#F5C21B";
  ctx.fillRect(0, 0, 256, 256);

  // Black hazard chevron border
  ctx.fillStyle = "#111215";
  ctx.fillRect(0, 0, 256, 24);
  ctx.fillRect(0, 232, 256, 24);

  // Large bold numeral
  ctx.fillStyle = "#0C0D10";
  ctx.font = "bold 130px 'JetBrains Mono', 'Roboto Mono', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(markerNumber), 128, 128);

  // Subtitle
  ctx.font = "bold 20px monospace, sans-serif";
  ctx.fillText("EXHIBIT", 128, 208);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createProceduralDocketTexture(
  caseNumber: string,
  court: string
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Cream parchment paper
  ctx.fillStyle = "#F6F3EB";
  ctx.fillRect(0, 0, 512, 512);

  // Red margin rule line
  ctx.strokeStyle = "rgba(220, 60, 60, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 0);
  ctx.lineTo(70, 512);
  ctx.stroke();

  // Court Caption Header
  ctx.fillStyle = "#1A1A1A";
  ctx.font = "bold 22px 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.fillText(court.toUpperCase() || "UNITED STATES DISTRICT COURT", 256, 45);

  ctx.font = "14px 'Times New Roman', serif";
  ctx.fillText("IN THE MATTER OF DEFENSE TRIAL DOCKET", 256, 75);

  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.fillText(`CAUSE NO: ${caseNumber || "PRO SE MATTERS FILE"}`, 256, 105);

  // Ruled pleading lines
  ctx.strokeStyle = "rgba(100, 110, 140, 0.25)";
  ctx.lineWidth = 1;
  for (let y = 140; y < 490; y += 22) {
    ctx.beginPath();
    ctx.moveTo(85, y);
    ctx.lineTo(475, y);
    ctx.stroke();
  }

  // Simulated text paragraphs
  ctx.fillStyle = "rgba(30, 35, 45, 0.65)";
  for (let i = 0; i < 14; i++) {
    const y = 158 + i * 22;
    const width = 280 + Math.random() * 90;
    ctx.fillRect(90, y - 8, width, 5);
  }

  // Gold stamp seal
  ctx.fillStyle = "rgba(212, 175, 55, 0.35)";
  ctx.beginPath();
  ctx.arc(430, 85, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(180, 140, 30, 0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createProceduralRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  grad.addColorStop(0, "rgba(0, 0, 0, 0.75)");
  grad.addColorStop(0.4, "rgba(0, 0, 0, 0.35)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
