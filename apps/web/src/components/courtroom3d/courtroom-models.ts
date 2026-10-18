import * as THREE from "three";
import {
  createProceduralWoodTexture,
  createProceduralCarpetTexture,
  createProceduralLeatherTexture,
  createEvidenceConeTexture,
  createProceduralDocketTexture,
  createProceduralRadialShadowTexture,
} from "./courtroom-textures";

/**
 * 3D Courtroom Procedural Geometry & Material Assembly
 * Adheres strictly to the Three.js skill:
 * - 3–12 part composite procedural models (THREE.Group)
 * - PBR material pairing with varied roughness & metalness
 * - Bottom-center ground pivots + radial contact shadows
 * - Zero external URLs or 404 dependencies
 */

export interface CourtroomMaterials {
  woodPolished: THREE.MeshStandardMaterial;
  woodDark: THREE.MeshStandardMaterial;
  woodTrim: THREE.MeshStandardMaterial;
  brassPolished: THREE.MeshStandardMaterial;
  leatherBlack: THREE.MeshStandardMaterial;
  leatherBurgundy: THREE.MeshStandardMaterial;
  steelBrushed: THREE.MeshStandardMaterial;
  glassCarafe: THREE.MeshPhysicalMaterial;
  carpetRunner: THREE.MeshStandardMaterial;
  parquetFloor: THREE.MeshStandardMaterial;
  wallPlaster: THREE.MeshStandardMaterial;
  wallWoodPanel: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  goldTrim: THREE.MeshStandardMaterial;
  laserLine: THREE.LineBasicMaterial;
}

export function createCourtroomMaterials(theme: "walnut" | "oak" | "mahogany" = "walnut"): CourtroomMaterials {
  const woodTexture = createProceduralWoodTexture(theme);
  const carpetTexture = createProceduralCarpetTexture();
  const leatherTexture = createProceduralLeatherTexture("#14151a");
  const shadowTexture = createProceduralRadialShadowTexture();

  const woodPolished = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.28,
    metalness: 0.08,
  });

  const woodDark = new THREE.MeshStandardMaterial({
    color: theme === "walnut" ? 0x24150b : theme === "oak" ? 0x3d2716 : 0x1d0a09,
    roughness: 0.55,
    metalness: 0.04,
  });

  const woodTrim = new THREE.MeshStandardMaterial({
    color: 0x4a3220,
    roughness: 0.35,
    metalness: 0.12,
  });

  const brassPolished = new THREE.MeshStandardMaterial({
    color: 0xe8be6b,
    roughness: 0.18,
    metalness: 0.92,
  });

  const goldTrim = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.24,
    metalness: 0.88,
  });

  const leatherBlack = new THREE.MeshStandardMaterial({
    map: leatherTexture,
    color: 0x181920,
    roughness: 0.72,
    metalness: 0.1,
  });

  const leatherBurgundy = new THREE.MeshStandardMaterial({
    map: leatherTexture,
    color: 0x4a181d,
    roughness: 0.65,
    metalness: 0.12,
  });

  const steelBrushed = new THREE.MeshStandardMaterial({
    color: 0xc8cdd5,
    roughness: 0.32,
    metalness: 0.85,
  });

  const glassCarafe = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.92,
    opacity: 1,
    transparent: true,
    roughness: 0.08,
    ior: 1.52,
    thickness: 0.6,
  });

  const parquetFloor = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.42,
    metalness: 0.05,
  });

  const carpetRunner = new THREE.MeshStandardMaterial({
    map: carpetTexture,
    roughness: 0.88,
    metalness: 0.02,
  });

  const wallPlaster = new THREE.MeshStandardMaterial({
    color: 0x1c1e26,
    roughness: 0.88,
    metalness: 0.02,
  });

  const wallWoodPanel = new THREE.MeshStandardMaterial({
    map: woodTexture,
    color: 0x2b1c13,
    roughness: 0.48,
    metalness: 0.05,
  });

  const contactShadow = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });

  const laserLine = new THREE.LineBasicMaterial({
    color: 0xd4af37,
    linewidth: 2,
    transparent: true,
    opacity: 0.85,
  });

  return {
    woodPolished,
    woodDark,
    woodTrim,
    brassPolished,
    goldTrim,
    leatherBlack,
    leatherBurgundy,
    steelBrushed,
    glassCarafe,
    parquetFloor,
    carpetRunner,
    wallPlaster,
    wallWoodPanel,
    contactShadow,
    laserLine,
  };
}

/**
 * Creates a soft radial contact shadow plane flush with the floor
 */
export function createContactShadow(
  width: number,
  depth: number,
  material: THREE.MeshBasicMaterial
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(width, depth);
  const mesh = new THREE.Mesh(geo, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.015; // slightly above 0 to prevent coplanar z-fighting
  mesh.renderOrder = 1;
  return mesh;
}

/**
 * 1. THE BENCH (Hero subject, 9 distinct parts)
 * Elevated judicial dais, judge's leather chair, brass banker lamp, gavel & block, seal
 */
export function buildJudgeBench(
  mats: CourtroomMaterials,
  judgeName = "Hon. Presiding Magistrate",
  courtName = "District Court"
): THREE.Group {
  const benchGroup = new THREE.Group();
  benchGroup.name = "Station_JudgeBench";

  // Part 1: Elevated Dais Platform (Primary Silhouette)
  const daisGeo = new THREE.BoxGeometry(6.4, 0.45, 3.2);
  const dais = new THREE.Mesh(daisGeo, mats.woodDark);
  dais.position.set(0, 0.225, 0);
  dais.castShadow = true;
  dais.receiveShadow = true;
  benchGroup.add(dais);

  // Dais Gold edge trim
  const daisTrimGeo = new THREE.BoxGeometry(6.44, 0.04, 3.24);
  const daisTrim = new THREE.Mesh(daisTrimGeo, mats.goldTrim);
  daisTrim.position.set(0, 0.45, 0);
  benchGroup.add(daisTrim);

  // Part 2: Main Bench Counter Front & Modesty Paneling (Fluted wainscoting)
  const frontPanelGeo = new THREE.BoxGeometry(5.2, 1.1, 0.9);
  const frontPanel = new THREE.Mesh(frontPanelGeo, mats.woodDark);
  frontPanel.position.set(0, 0.45 + 0.55, 0.8);
  frontPanel.castShadow = true;
  frontPanel.receiveShadow = true;
  benchGroup.add(frontPanel);

  // Decorative fluted front pilasters
  for (let x = -2.3; x <= 2.3; x += 0.92) {
    const pilasterGeo = new THREE.BoxGeometry(0.14, 1.12, 0.96);
    const pilaster = new THREE.Mesh(pilasterGeo, mats.woodTrim);
    pilaster.position.set(x, 0.45 + 0.56, 0.8);
    benchGroup.add(pilaster);
  }

  // Part 3: Beveled Mahogany Desktop / Bench Ledge
  const deskTopGeo = new THREE.BoxGeometry(5.4, 0.1, 1.4);
  const deskTop = new THREE.Mesh(deskTopGeo, mats.woodPolished);
  deskTop.position.set(0, 0.45 + 1.15, 0.65);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  benchGroup.add(deskTop);

  // Part 4: Judge's Executive High-Back Chair (5 sub-parts)
  const chairGroup = new THREE.Group();
  chairGroup.position.set(0, 0.45, -0.4);

  // Seat cushion
  const seatGeo = new THREE.BoxGeometry(0.72, 0.12, 0.68);
  const seat = new THREE.Mesh(seatGeo, mats.leatherBurgundy);
  seat.position.set(0, 0.54, 0);
  chairGroup.add(seat);

  // Tufted backrest
  const backGeo = new THREE.BoxGeometry(0.68, 1.05, 0.14);
  const back = new THREE.Mesh(backGeo, mats.leatherBurgundy);
  back.position.set(0, 1.1, -0.3);
  chairGroup.add(back);

  // Chair armrests
  const armLGeo = new THREE.BoxGeometry(0.1, 0.35, 0.48);
  const armL = new THREE.Mesh(armLGeo, mats.woodPolished);
  armL.position.set(-0.36, 0.76, -0.05);
  const armR = armL.clone();
  armR.position.x = 0.36;
  chairGroup.add(armL, armR);

  // Chrome base stem
  const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.48, 12);
  const stem = new THREE.Mesh(stemGeo, mats.steelBrushed);
  stem.position.set(0, 0.24, 0);
  chairGroup.add(stem);

  benchGroup.add(chairGroup);

  // Part 5: Brass Banker's Reading Lamp
  const lampGroup = new THREE.Group();
  lampGroup.position.set(-1.6, 0.45 + 1.2, 0.5);

  const lampBaseGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.03, 16);
  const lampBase = new THREE.Mesh(lampBaseGeo, mats.brassPolished);
  lampGroup.add(lampBase);

  const lampStemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.32, 10);
  const lampStem = new THREE.Mesh(lampStemGeo, mats.brassPolished);
  lampStem.position.y = 0.16;
  lampGroup.add(lampStem);

  const shadeGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.26, 16, 1, false, 0, Math.PI);
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.15, metalness: 0.4 });
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  shade.rotation.z = Math.PI / 2;
  shade.rotation.x = Math.PI / 2;
  shade.position.set(0, 0.32, 0);
  lampGroup.add(shade);

  benchGroup.add(lampGroup);

  // Part 6: Judicial Gavel & Felted Sound Block
  const gavelGroup = new THREE.Group();
  gavelGroup.position.set(1.4, 0.45 + 1.2, 0.5);

  // Sound block
  const blockGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.04, 16);
  const block = new THREE.Mesh(blockGeo, mats.woodPolished);
  gavelGroup.add(block);

  // Gavel head
  const headGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.16, 14);
  const head = new THREE.Mesh(headGeo, mats.woodPolished);
  head.rotation.z = Math.PI / 2;
  head.position.set(0.02, 0.07, 0.05);
  gavelGroup.add(head);

  // Gavel brass rings
  const ringGeo = new THREE.TorusGeometry(0.044, 0.005, 8, 16);
  const ring1 = new THREE.Mesh(ringGeo, mats.brassPolished);
  ring1.rotation.y = Math.PI / 2;
  ring1.position.set(-0.04, 0.07, 0.05);
  const ring2 = ring1.clone();
  ring2.position.set(0.08, 0.07, 0.05);
  gavelGroup.add(ring1, ring2);

  // Gavel handle
  const handleGeo = new THREE.CylinderGeometry(0.012, 0.016, 0.28, 10);
  const handle = new THREE.Mesh(handleGeo, mats.woodPolished);
  handle.rotation.x = Math.PI / 2;
  handle.position.set(0.02, 0.07, -0.09);
  gavelGroup.add(handle);

  benchGroup.add(gavelGroup);

  // Part 7: Bench Microphone
  const micGroup = new THREE.Group();
  micGroup.position.set(0.4, 0.45 + 1.2, 0.7);
  const micBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.02, 12), mats.steelBrushed);
  const micStem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.24, 8), mats.steelBrushed);
  micStem.position.y = 0.12;
  micStem.rotation.z = -0.25;
  const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), mats.steelBrushed);
  micHead.position.set(-0.06, 0.23, 0);
  micGroup.add(micBase, micStem, micHead);
  benchGroup.add(micGroup);

  // Part 8: Backdrop Wall Panel & Courtroom Seal
  const backdropGeo = new THREE.BoxGeometry(6.6, 3.8, 0.2);
  const backdrop = new THREE.Mesh(backdropGeo, mats.wallWoodPanel);
  backdrop.position.set(0, 1.9 + 0.45, -1.5);
  benchGroup.add(backdrop);

  // Courtroom Seal (Lathe / Cylinders composite)
  const sealGroup = new THREE.Group();
  sealGroup.position.set(0, 3.1, -1.38);

  const outerRingGeo = new THREE.TorusGeometry(0.55, 0.045, 12, 32);
  const outerRing = new THREE.Mesh(outerRingGeo, mats.goldTrim);
  sealGroup.add(outerRing);

  const sealFaceGeo = new THREE.CylinderGeometry(0.54, 0.54, 0.02, 32);
  const sealFaceMat = new THREE.MeshStandardMaterial({
    color: 0x1b2838,
    roughness: 0.35,
    metalness: 0.3,
  });
  const sealFace = new THREE.Mesh(sealFaceGeo, sealFaceMat);
  sealFace.rotation.x = Math.PI / 2;
  sealGroup.add(sealFace);

  const eagleShieldGeo = new THREE.ConeGeometry(0.18, 0.32, 4);
  const eagleShield = new THREE.Mesh(eagleShieldGeo, mats.goldTrim);
  eagleShield.rotation.z = Math.PI;
  eagleShield.position.set(0, 0, 0.02);
  sealGroup.add(eagleShield);

  benchGroup.add(sealGroup);

  // Part 9: Contact shadow beneath dais
  const shadow = createContactShadow(7.0, 3.8, mats.contactShadow);
  benchGroup.add(shadow);

  // User metadata label tag
  benchGroup.userData = {
    stationId: "bench",
    name: "The Judicial Bench",
    role: "Presiding Magistrate",
    summary: `${judgeName} presiding. Primary authority for rulings, objection decisions, and sentencing hearings.`,
    protocols: [
      "Address as 'Your Honor'",
      "Stand when the judge enters or when speaking on the record",
      "Wait for permission before approaching the bench",
      "Present objections clearly citing evidence rule",
    ],
  };

  return benchGroup;
}

/**
 * 2. WITNESS STAND (Hero composite, 6 parts)
 * Raised platform, acoustic modesty balustrade, witness swivel chair, microphone, water carafe
 */
export function buildWitnessStand(mats: CourtroomMaterials): THREE.Group {
  const standGroup = new THREE.Group();
  standGroup.name = "Station_WitnessStand";

  // Part 1: Raised Platform
  const platGeo = new THREE.BoxGeometry(2.0, 0.35, 1.8);
  const plat = new THREE.Mesh(platGeo, mats.woodDark);
  plat.position.set(0, 0.175, 0);
  plat.castShadow = true;
  plat.receiveShadow = true;
  standGroup.add(plat);

  // Part 2: Front & Side Railing (Protective acoustic partition)
  const railFrontGeo = new THREE.BoxGeometry(1.8, 0.9, 0.1);
  const railFront = new THREE.Mesh(railFrontGeo, mats.woodTrim);
  railFront.position.set(0, 0.35 + 0.45, 0.85);
  standGroup.add(railFront);

  const railSideGeo = new THREE.BoxGeometry(0.1, 0.9, 1.6);
  const railSide = new THREE.Mesh(railSideGeo, mats.woodTrim);
  railSide.position.set(0.9, 0.35 + 0.45, 0);
  standGroup.add(railSide);

  // Part 3: Beveled Ledge
  const ledgeGeo = new THREE.BoxGeometry(1.9, 0.08, 0.3);
  const ledge = new THREE.Mesh(ledgeGeo, mats.woodPolished);
  ledge.position.set(0, 0.35 + 0.94, 0.85);
  standGroup.add(ledge);

  // Part 4: Witness Swivel Chair
  const chairGroup = new THREE.Group();
  chairGroup.position.set(0, 0.35, 0);

  const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.1, 0.52), mats.leatherBlack);
  seatMesh.position.y = 0.5;
  const backMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.7, 0.1), mats.leatherBlack);
  backMesh.position.set(0, 0.88, -0.22);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 10), mats.steelBrushed);
  stem.position.y = 0.225;
  chairGroup.add(seatMesh, backMesh, stem);
  standGroup.add(chairGroup);

  // Part 5: Articulated Witness Microphone
  const micGroup = new THREE.Group();
  micGroup.position.set(-0.35, 0.35 + 0.96, 0.8);
  const mStem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 8), mats.steelBrushed);
  mStem.rotation.x = -0.35;
  mStem.position.set(0, 0.12, -0.05);
  const mHead = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), mats.steelBrushed);
  mHead.position.set(0, 0.24, -0.1);
  micGroup.add(mStem, mHead);
  standGroup.add(micGroup);

  // Part 6: Water Carafe & Tumbler
  const carafeGeo = new THREE.CylinderGeometry(0.04, 0.065, 0.22, 12);
  const carafe = new THREE.Mesh(carafeGeo, mats.glassCarafe);
  carafe.position.set(0.5, 0.35 + 0.96 + 0.11, 0.85);
  standGroup.add(carafe);

  // Contact shadow
  standGroup.add(createContactShadow(2.4, 2.2, mats.contactShadow));

  standGroup.userData = {
    stationId: "witness",
    name: "The Witness Stand",
    role: "Testimony & Cross-Examination",
    summary: "Focal point of factual cross-examination. Officer testimony, credibility challenges, and prior contradictory statements are tested here.",
    protocols: [
      "Impeach with prior written statements or body-camera transcripts",
      "Ask leading questions on cross-examination ('Isn't it true that...?')",
      "Do not argue with the witness; introduce contradiction into the record",
      "Listen carefully for hearsay or speculation",
    ],
  };

  return standGroup;
}

/**
 * 3. THE SPEAKING PODIUM / LECTERN (Hero composite, 6 parts)
 * Fluted column, angled desk with brass retaining lip, digital hearing timer LED, microphone
 */
export function buildPodiumLectern(mats: CourtroomMaterials): THREE.Group {
  const podiumGroup = new THREE.Group();
  podiumGroup.name = "Station_Podium";

  // Part 1: Weighted Brass Base Plate
  const baseGeo = new THREE.BoxGeometry(0.75, 0.06, 0.65);
  const base = new THREE.Mesh(baseGeo, mats.brassPolished);
  base.position.y = 0.03;
  base.castShadow = true;
  base.receiveShadow = true;
  podiumGroup.add(base);

  // Part 2: Fluted Wooden Column Body
  const bodyGeo = new THREE.BoxGeometry(0.52, 1.15, 0.44);
  const body = new THREE.Mesh(bodyGeo, mats.woodDark);
  body.position.y = 0.06 + 0.575;
  body.castShadow = true;
  podiumGroup.add(body);

  // Fluted brass side inlays
  for (const side of [-0.27, 0.27]) {
    const inlay = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.12, 0.42), mats.goldTrim);
    inlay.position.set(side, 0.06 + 0.575, 0);
    podiumGroup.add(inlay);
  }

  // Part 3: Slanted Oak Lectern Cap
  const capGeo = new THREE.BoxGeometry(0.72, 0.08, 0.55);
  const cap = new THREE.Mesh(capGeo, mats.woodPolished);
  cap.rotation.x = -0.22;
  cap.position.set(0, 1.25, 0.02);
  cap.castShadow = true;
  podiumGroup.add(cap);

  // Brass retaining lip
  const lipGeo = new THREE.BoxGeometry(0.72, 0.04, 0.03);
  const lip = new THREE.Mesh(lipGeo, mats.brassPolished);
  lip.rotation.x = -0.22;
  lip.position.set(0, 1.2, 0.25);
  podiumGroup.add(lip);

  // Part 4: Digital Hearing Timer Box (LED readout)
  const timerBoxGeo = new THREE.BoxGeometry(0.24, 0.08, 0.08);
  const timerMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.2 });
  const timerBox = new THREE.Mesh(timerBoxGeo, timerMat);
  timerBox.position.set(0, 1.34, -0.15);
  podiumGroup.add(timerBox);

  // LED Screen
  const ledCanvas = document.createElement("canvas");
  ledCanvas.width = 128;
  ledCanvas.height = 48;
  const ledCtx = ledCanvas.getContext("2d");
  if (ledCtx) {
    ledCtx.fillStyle = "#0c1015";
    ledCtx.fillRect(0, 0, 128, 48);
    ledCtx.fillStyle = "#22c55e"; // Green timer
    ledCtx.font = "bold 28px monospace";
    ledCtx.textAlign = "center";
    ledCtx.fillText("14:45", 64, 34);
  }
  const ledTex = new THREE.CanvasTexture(ledCanvas);
  ledTex.colorSpace = THREE.SRGBColorSpace;
  const ledScreenMat = new THREE.MeshBasicMaterial({ map: ledTex });
  const ledScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.06), ledScreenMat);
  ledScreen.position.set(0, 1.34, -0.108);
  podiumGroup.add(ledScreen);

  // Part 5: Articulated Dual Gooseneck Microphones
  for (const side of [-0.15, 0.15]) {
    const micStem = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.32, 8), mats.steelBrushed);
    micStem.rotation.x = 0.4;
    micStem.position.set(side, 1.38, -0.06);
    const micCapsule = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), mats.steelBrushed);
    micCapsule.position.set(side, 1.5, 0.04);
    podiumGroup.add(micStem, micCapsule);
  }

  // Part 6: Contact shadow
  podiumGroup.add(createContactShadow(1.1, 1.0, mats.contactShadow));

  podiumGroup.userData = {
    stationId: "podium",
    name: "The Center Lectern & Well",
    role: "Oral Argument & Opening Statement",
    summary: "Where motions to suppress, motions to dismiss, and oral arguments are delivered directly to the bench.",
    protocols: [
      "State: 'May it please the Court, [Your Name] appearing pro se'",
      "Keep hands on the lectern; do not pace or wander the well without leave",
      "Speak directly into the microphones for the audio docket record",
      "Monitor the countdown timer to reserve rebuttal time",
    ],
  };

  return podiumGroup;
}

/**
 * 4. COUNSEL TABLE (Defense or Prosecution) (Composite 8 parts)
 * Oak desk, modesty panel, steel legs, 2 swivel executive chairs, laptop/tablet with case files, contact shadow
 */
export function buildCounselTable(
  type: "defense" | "prosecution",
  mats: CourtroomMaterials,
  matterTitle = "State v. Defendant",
  caseNumber = "CR-2026-0819"
): THREE.Group {
  const tableGroup = new THREE.Group();
  tableGroup.name = type === "defense" ? "Station_DefenseTable" : "Station_ProsecutionTable";

  const isDefense = type === "defense";

  // Part 1: Solid Oak Tabletop (Primary read)
  const topGeo = new THREE.BoxGeometry(3.2, 0.09, 1.4);
  const top = new THREE.Mesh(topGeo, mats.woodPolished);
  top.position.set(0, 0.74, 0);
  top.castShadow = true;
  top.receiveShadow = true;
  tableGroup.add(top);

  // Part 2: Acoustic Modesty Panel
  const modestyGeo = new THREE.BoxGeometry(3.0, 0.54, 0.04);
  const modesty = new THREE.Mesh(modestyGeo, mats.woodDark);
  modesty.position.set(0, 0.44, 0.58);
  modesty.castShadow = true;
  tableGroup.add(modesty);

  // Part 3: Brushed Steel Leg Frames (4 legs with crossbar)
  const legPositions = [
    [-1.45, 0.35, -0.55],
    [1.45, 0.35, -0.55],
    [-1.45, 0.35, 0.55],
    [1.45, 0.35, 0.55],
  ];
  for (const pos of legPositions) {
    const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.7, 10);
    const leg = new THREE.Mesh(legGeo, mats.steelBrushed);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    tableGroup.add(leg);
  }

  // Part 4 & 5: Two Counsel Executive Swivel Chairs
  for (const xOff of [-0.75, 0.75]) {
    const chair = new THREE.Group();
    chair.position.set(xOff, 0, -0.85);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.09, 0.54), mats.leatherBlack);
    seat.position.y = 0.48;
    seat.castShadow = true;

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.72, 0.08), mats.leatherBlack);
    back.position.set(0, 0.86, -0.22);
    back.castShadow = true;

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.44, 10), mats.steelBrushed);
    stem.position.y = 0.22;

    chair.add(seat, back, stem);
    tableGroup.add(chair);
  }

  // Part 6: Pro Se Litigant Pleading File / Docket Binder
  const docketTex = createProceduralDocketTexture(caseNumber, "DISTRICT COURT");
  const docketMat = new THREE.MeshStandardMaterial({ map: docketTex, roughness: 0.45 });
  const docketGeo = new THREE.PlaneGeometry(0.44, 0.58);
  const docketDoc = new THREE.Mesh(docketGeo, docketMat);
  docketDoc.rotation.x = -Math.PI / 2 + 0.15;
  docketDoc.position.set(isDefense ? -0.7 : 0.7, 0.80, 0.05);
  tableGroup.add(docketDoc);

  // Part 7: Laptop / Evidence Monitor Station
  const laptopGroup = new THREE.Group();
  laptopGroup.position.set(isDefense ? 0.6 : -0.6, 0.785, 0.05);

  const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.015, 0.26), mats.steelBrushed);
  const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.015), mats.steelBrushed);
  screenMesh.rotation.x = -0.2;
  screenMesh.position.set(0, 0.12, -0.12);

  // Screen display glowing with case files
  const screenFaceMat = new THREE.MeshBasicMaterial({
    color: isDefense ? 0x0f2a40 : 0x1f1f28,
  });
  const screenFace = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.21), screenFaceMat);
  screenFace.rotation.x = -0.2;
  screenFace.position.set(0, 0.12, -0.11);

  laptopGroup.add(baseMesh, screenMesh, screenFace);
  tableGroup.add(laptopGroup);

  // Part 8: Contact shadow
  tableGroup.add(createContactShadow(3.8, 2.2, mats.contactShadow));

  tableGroup.userData = {
    stationId: isDefense ? "defense_table" : "prosecution_table",
    name: isDefense ? "Defense Counsel Table (Pro Se Station)" : "Prosecution Table (State / AUSA)",
    role: isDefense ? "Pro Se Litigant Headquarters" : "Opposing State Counsel",
    summary: isDefense
      ? `Active station for ${matterTitle}. Organize evidence binders, track Brady obligations, and review real-time objection checklists.`
      : "Assigned to the Assistant United States Attorney or State Prosecutor. Observe document exchanges and discovery disclosures.",
    protocols: isDefense
      ? [
          "Keep physical exhibit folders organized and numbered (Exhibit A, B, C)",
          "Take contemporaneous notes during witness examinations",
          "Stand up immediately to state objections clearly on the record",
          "Ensure audio equipment captures your voice for the transcript",
        ]
      : [
          "Request discovery inspection on any physical item before it is shown to witness",
          "Listen for unverified factual assertions not in the police complaint",
        ],
  };

  return tableGroup;
}

/**
 * 5. THE JURY BOX (Composite 6 parts + Instanced chairs)
 * 2 tiered platform, hardwood banister railing, 12 jury chairs
 */
export function buildJuryBox(mats: CourtroomMaterials): THREE.Group {
  const boxGroup = new THREE.Group();
  boxGroup.name = "Station_JuryBox";

  // Tier 1 Platform
  const tier1Geo = new THREE.BoxGeometry(1.6, 0.25, 5.4);
  const tier1 = new THREE.Mesh(tier1Geo, mats.woodDark);
  tier1.position.set(0.8, 0.125, 0);
  tier1.castShadow = true;
  tier1.receiveShadow = true;
  boxGroup.add(tier1);

  // Tier 2 Platform
  const tier2Geo = new THREE.BoxGeometry(1.6, 0.5, 5.4);
  const tier2 = new THREE.Mesh(tier2Geo, mats.woodDark);
  tier2.position.set(-0.8, 0.25, 0);
  tier2.castShadow = true;
  tier2.receiveShadow = true;
  boxGroup.add(tier2);

  // Front Enclosure Balustrade Rail
  const frontRailGeo = new THREE.BoxGeometry(0.12, 0.9, 5.4);
  const frontRail = new THREE.Mesh(frontRailGeo, mats.woodTrim);
  frontRail.position.set(1.6, 0.45, 0);
  boxGroup.add(frontRail);

  // Side Rails
  for (const z of [-2.7, 2.7]) {
    const sideRail = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.1), mats.woodTrim);
    sideRail.position.set(0, 0.45, z);
    boxGroup.add(sideRail);
  }

  // 12 Jury Chairs using InstancedMesh for performance
  const chairSeatGeo = new THREE.BoxGeometry(0.48, 0.08, 0.46);
  const instancedSeats = new THREE.InstancedMesh(chairSeatGeo, mats.leatherBurgundy, 12);
  instancedSeats.castShadow = true;

  const dummy = new THREE.Object3D();
  let idx = 0;
  // Row 1 (Tier 1) - 6 jurors
  for (let z = -2.1; z <= 2.1; z += 0.84) {
    dummy.position.set(0.8, 0.25 + 0.42, z);
    dummy.rotation.y = Math.PI / 2; // Facing into the courtroom
    dummy.updateMatrix();
    instancedSeats.setMatrixAt(idx++, dummy.matrix);
  }
  // Row 2 (Tier 2) - 6 jurors
  for (let z = -2.1; z <= 2.1; z += 0.84) {
    dummy.position.set(-0.8, 0.5 + 0.42, z);
    dummy.rotation.y = Math.PI / 2;
    dummy.updateMatrix();
    instancedSeats.setMatrixAt(idx++, dummy.matrix);
  }
  instancedSeats.computeBoundingSphere();
  boxGroup.add(instancedSeats);

  // Contact shadow
  boxGroup.add(createContactShadow(3.8, 5.8, mats.contactShadow));

  boxGroup.userData = {
    stationId: "jury_box",
    name: "The Jury Box",
    role: "Finders of Fact",
    summary: "12 jurors evaluate witness credibility, adherence to reasonable doubt, and physical exhibit authenticity.",
    protocols: [
      "Maintain clear eye contact during opening and closing arguments",
      "Do not attempt ex parte communications with jurors",
      "Explain technical statutes in plain, relatable language",
      "Emphasize the state's non-shifting burden of proof beyond a reasonable doubt",
    ],
  };

  return boxGroup;
}

/**
 * 6. STENOGRAPHER / COURT CLERK STATION (Composite 5 parts)
 * Desk, stenotype machine on tripod, monitor, desk lamp, chair
 */
export function buildStenographerStation(mats: CourtroomMaterials): THREE.Group {
  const stenoGroup = new THREE.Group();
  stenoGroup.name = "Station_ClerkSteno";

  // Desk
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.9), mats.woodPolished);
  desk.position.set(0, 0.72, 0);
  stenoGroup.add(desk);

  // Legs
  for (const x of [-0.7, 0.7]) {
    for (const z of [-0.35, 0.35]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.68, 8), mats.steelBrushed);
      leg.position.set(x, 0.34, z);
      stenoGroup.add(leg);
    }
  }

  // Stenograph machine on tripod
  const stenoTripod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), mats.steelBrushed);
  stenoTripod.position.set(-0.35, 0.65, 0.7);
  const stenoMachine = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.22), mats.steelBrushed);
  stenoMachine.position.set(-0.35, 0.98, 0.7);
  stenoMachine.rotation.x = -0.2;
  stenoGroup.add(stenoTripod, stenoMachine);

  // Clerk Docket Monitor
  const mon = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.26, 0.02), mats.steelBrushed);
  mon.position.set(0.2, 0.9, -0.1);
  stenoGroup.add(mon);

  // Chair
  const chair = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.44), mats.leatherBlack);
  chair.position.set(0, 0.46, -0.55);
  stenoGroup.add(chair);

  stenoGroup.add(createContactShadow(2.0, 1.8, mats.contactShadow));

  stenoGroup.userData = {
    stationId: "clerk",
    name: "Court Clerk & Official Stenographer",
    role: "Official Record & Exhibit Stamping",
    summary: "Records verbatim hearing transcript and formally stamps evidence exhibits into the court docket.",
    protocols: [
      "Spell difficult names and technical terms for the court reporter",
      "Do not speak over opposing counsel so the reporter captures clean audio",
      "Request exhibit marking before showing any document to a witness",
    ],
  };

  return stenoGroup;
}

/**
 * 7. COURTROOM ARCHITECTURE (Room perimeter, floor, bar rail, spectator gallery, ceiling)
 */
export function buildCourtroomArchitecture(mats: CourtroomMaterials): THREE.Group {
  const roomGroup = new THREE.Group();
  roomGroup.name = "Architecture_Perimeter";

  // Main Parquet Courtroom Floor (22m x 26m)
  const floorGeo = new THREE.PlaneGeometry(22, 26);
  const floor = new THREE.Mesh(floorGeo, mats.parquetFloor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // Center Aisle Runner Carpet
  const runnerGeo = new THREE.PlaneGeometry(3.2, 18);
  const runner = new THREE.Mesh(runnerGeo, mats.carpetRunner);
  runner.rotation.x = -Math.PI / 2;
  runner.position.set(0, 0.008, 2); // Coplanar offset to prevent Z-fighting
  runner.receiveShadow = true;
  roomGroup.add(runner);

  // Bar Rail / Gate (Divides well from gallery)
  const barRailGroup = new THREE.Group();
  barRailGroup.position.set(0, 0, 5.5);

  const railL = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.85, 0.1), mats.woodTrim);
  railL.position.set(-5.0, 0.425, 0);
  const railR = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.85, 0.1), mats.woodTrim);
  railR.position.set(5.0, 0.425, 0);
  // Center swinging gate with brass hinges
  const gate = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.78, 0.08), mats.woodPolished);
  gate.position.set(0, 0.39, 0);

  barRailGroup.add(railL, railR, gate);
  roomGroup.add(barRailGroup);

  // Spectator Gallery Pews (3 rows of long wooden benches)
  for (let row = 0; row < 3; row++) {
    const z = 7.5 + row * 1.8;
    for (const side of [-5.0, 5.0]) {
      const pew = new THREE.Group();
      pew.position.set(side, 0, z);

      const seat = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.08, 0.44), mats.woodPolished);
      seat.position.y = 0.46;
      const back = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.52, 0.06), mats.woodDark);
      back.position.set(0, 0.72, -0.2);
      pew.add(seat, back);
      roomGroup.add(pew);
    }
  }

  // Side Wall Paneling (Acoustic wood lower half, plaster upper half)
  for (const side of [-11, 11]) {
    const lowerWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.6, 26), mats.wallWoodPanel);
    lowerWall.position.set(side, 1.3, 0);
    const upperWall = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.4, 26), mats.wallPlaster);
    upperWall.position.set(side, 4.8, 0);
    roomGroup.add(lowerWall, upperWall);
  }

  // Front Wall (Behind Judge) & Back Wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 7.0, 0.3), mats.wallPlaster);
  backWall.position.set(0, 3.5, 13);
  roomGroup.add(backWall);

  return roomGroup;
}

/**
 * 8. SPATIAL FORENSIC EVIDENCE MARKERS & TRAJECTORIES
 * High-visibility numbered yellow/black cones with laser sightlines
 */
export function buildEvidenceSpatialMarkers(
  exhibits: Array<{ id: string; exhibitNumber?: string; title: string; type: string }>,
  mats: CourtroomMaterials
): THREE.Group {
  const evidenceGroup = new THREE.Group();
  evidenceGroup.name = "Layer_SpatialEvidence";

  // Pre-configured tactical coordinates in courtroom for exhibits
  const markerPositions = [
    { x: -2.8, z: 0.6, label: "Exhibit A: BWC Initial Encounter" },
    { x: -1.2, z: 1.8, label: "Exhibit B: Time-Stamped POS Receipt" },
    { x: 3.4, z: 1.2, label: "Exhibit C: 911 CAD Dispatch Audio" },
    { x: 0.0, z: -1.0, label: "Exhibit D: Boundary Signage Photo" },
  ];

  exhibits.slice(0, 4).forEach((ex, idx) => {
    const pos = markerPositions[idx] || { x: (idx - 1.5) * 2, z: 1.0, label: ex.title };
    const marker = new THREE.Group();
    marker.position.set(pos.x, 0, pos.z);

    // Numbered Cone (Pyramid / Cone geometry)
    const coneTex = createEvidenceConeTexture(idx + 1);
    const coneMat = new THREE.MeshStandardMaterial({
      map: coneTex,
      roughness: 0.3,
      metalness: 0.1,
    });
    const coneGeo = new THREE.ConeGeometry(0.18, 0.32, 4);
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.position.y = 0.16;
    coneMesh.rotation.y = Math.PI / 4;
    coneMesh.castShadow = true;
    marker.add(coneMesh);

    // Laser vertical line beacon
    const points = [
      new THREE.Vector3(0, 0.32, 0),
      new THREE.Vector3(0, 2.2, 0),
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeo, mats.laserLine);
    marker.add(line);

    // Floating pulsing indicator dot
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), mats.goldTrim);
    orb.position.y = 2.2;
    marker.add(orb);

    marker.add(createContactShadow(0.5, 0.5, mats.contactShadow));

    marker.userData = {
      isEvidenceMarker: true,
      exhibitNumber: ex.exhibitNumber || `#${idx + 1}`,
      title: ex.title,
      type: ex.type,
      locationNote: pos.label,
    };

    evidenceGroup.add(marker);
  });

  // Sightline Trajectory from Defense Table to Witness Stand
  const trajectoryPoints = [
    new THREE.Vector3(-3.2, 0.85, 2.0), // Defense Table
    new THREE.Vector3(0, 1.2, 0.2),      // Well
    new THREE.Vector3(4.2, 1.2, -4.2),   // Witness Stand
  ];
  const curve = new THREE.CatmullRomCurve3(trajectoryPoints);
  const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.015, 8, false);
  const tubeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.75,
  });
  const trajectoryMesh = new THREE.Mesh(tubeGeo, tubeMat);
  evidenceGroup.add(trajectoryMesh);

  return evidenceGroup;
}
