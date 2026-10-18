"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  Matter,
  EvidenceRecord,
  EMPTY_MATTER,
} from "@/lib/workspace-data";
import {
  createCourtroomMaterials,
  buildJudgeBench,
  buildWitnessStand,
  buildPodiumLectern,
  buildCounselTable,
  buildJuryBox,
  buildStenographerStation,
  buildCourtroomArchitecture,
  buildEvidenceSpatialMarkers,
  CourtroomMaterials,
} from "./courtroom-models";
import {
  Gavel,
  Shield,
  Eye,
  Camera,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Info,
  Scale,
  Users,
  Clock,
  Radio,
  FileText,
  Sliders,
  RotateCcw,
} from "lucide-react";

/**
 * Camera preset definitions for courtroom vantage points
 */
export type CourtroomViewPreset =
  | "DEFENSE"
  | "PODIUM"
  | "BENCH"
  | "WITNESS"
  | "JURY"
  | "TACTICAL"
  | "FREE";

interface ViewpointConfig {
  id: CourtroomViewPreset;
  label: string;
  sublabel: string;
  iconName: string;
  pos: THREE.Vector3;
  target: THREE.Vector3;
  description: string;
}

const VIEWPOINTS: Record<CourtroomViewPreset, ViewpointConfig> = {
  DEFENSE: {
    id: "DEFENSE",
    label: "Pro Se Station",
    sublabel: "Defense Table",
    iconName: "Shield",
    pos: new THREE.Vector3(-3.2, 1.45, 2.5),
    target: new THREE.Vector3(0, 1.8, -4.0),
    description: "Vantage from the pro se defense desk looking toward the presiding judge, witness stand, and center podium.",
  },
  PODIUM: {
    id: "PODIUM",
    label: "Center Lectern",
    sublabel: "The Well",
    iconName: "Gavel",
    pos: new THREE.Vector3(0, 1.45, 0.4),
    target: new THREE.Vector3(0, 2.0, -4.5),
    description: "Standing position at the lectern delivering oral arguments and motion arguments directly to the bench.",
  },
  BENCH: {
    id: "BENCH",
    label: "Full Bench View",
    sublabel: "Judicial Dais",
    iconName: "Scale",
    pos: new THREE.Vector3(0, 2.8, -4.2),
    target: new THREE.Vector3(0, 1.0, 2.0),
    description: "Overhead perspective from the judge's bench looking down across counsel tables, well, and spectator gallery.",
  },
  WITNESS: {
    id: "WITNESS",
    label: "Witness Stand",
    sublabel: "Testimony Box",
    iconName: "Eye",
    pos: new THREE.Vector3(4.2, 1.5, -4.0),
    target: new THREE.Vector3(-1.5, 1.2, 1.0),
    description: "Perspective of the sworn witness facing cross-examination from defense counsel and the prosecutor.",
  },
  JURY: {
    id: "JURY",
    label: "Jury Box",
    sublabel: "12 Finders of Fact",
    iconName: "Users",
    pos: new THREE.Vector3(-7.2, 2.0, -1.0),
    target: new THREE.Vector3(0, 1.4, -1.0),
    description: "Jury box vantage point evaluating demeanor, exhibit projections, and counsel credibility.",
  },
  TACTICAL: {
    id: "TACTICAL",
    label: "War Room Bird's-Eye",
    sublabel: "Isometric Map",
    iconName: "Compass",
    pos: new THREE.Vector3(0, 18, 14),
    target: new THREE.Vector3(0, 1, 0),
    description: "Overhead tactical war room layout showing sightlines, spatial distances, and evidence locations.",
  },
  FREE: {
    id: "FREE",
    label: "Free Orbit",
    sublabel: "Manual Pan",
    iconName: "Camera",
    pos: new THREE.Vector3(-6, 8, 10),
    target: new THREE.Vector3(0, 1.5, 0),
    description: "Unlocked 3D orbit. Click and drag with mouse/touch to inspect any angle of the courtroom.",
  },
};

// Module-level pre-allocated scratch objects for zero GC per frame
const _scratchPos = new THREE.Vector3();
const _scratchTarget = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _pointer = new THREE.Vector2();

interface Courtroom3DWarRoomProps {
  matter?: Matter;
  evidence?: EvidenceRecord[];
  onNavigateTab?: (tab: string) => void;
}

export function Courtroom3DWarRoom({
  matter = EMPTY_MATTER,
  evidence = [],
  onNavigateTab,
}: Courtroom3DWarRoomProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // UI state
  const [activePreset, setActivePreset] = useState<CourtroomViewPreset>("DEFENSE");
  const [selectedStation, setSelectedStation] = useState<Record<string, any> | null>(null);
  const [explodedRatio, setExplodedRatio] = useState<number>(0);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [theme, setTheme] = useState<"walnut" | "oak" | "mahogany">("walnut");
  const [showSightlines, setShowSightlines] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [simulationScenario, setSimulationScenario] = useState<
    "SUPPRESSION" | "PRELIMINARY" | "ORAL_ARGUMENT" | "CROSS_EXAM"
  >("SUPPRESSION");

  // Three.js internal references stored in ref to prevent teardown on React renders
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    materials: CourtroomMaterials;
    interactiveObjects: THREE.Object3D[];
    architectureGroup: THREE.Group;
    evidenceGroup: THREE.Group;
    targetCamPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    animFrameId: number;
    clock: THREE.Clock;
    audioCtx: AudioContext | null;
  } | null>(null);

  // Procedural Web Audio Sound Generator (Zero external MP3 files)
  const playTacticalClick = useCallback(
    (frequency = 520, duration = 0.08) => {
      if (!soundEnabled) return;
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) return;
        if (!threeRef.current?.audioCtx) {
          threeRef.current!.audioCtx = new AudioCtxClass();
        }
        const ctx = threeRef.current.audioCtx;
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // audio disabled or restricted by browser gesture
      }
    },
    [soundEnabled]
  );

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    const fogColor = new THREE.Color(0x0e1017);
    scene.background = fogColor;
    scene.fog = new THREE.FogExp2(0x0e1017, 0.024);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
    const initialConfig = VIEWPOINTS.DEFENSE;
    camera.position.copy(initialConfig.pos);

    // 3. Renderer with PBR standard settings
    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Studio Environment Lighting (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Key & Fill Lighting
    const hemiLight = new THREE.HemisphereLight(0x94b4e0, 0x22160d, 0.55);
    scene.add(hemiLight);

    const warmKeyLight = new THREE.DirectionalLight(0xfff1dc, 2.4);
    warmKeyLight.position.set(10, 16, 8);
    warmKeyLight.castShadow = true;
    warmKeyLight.shadow.mapSize.width = 2048;
    warmKeyLight.shadow.mapSize.height = 2048;
    warmKeyLight.shadow.camera.near = 1;
    warmKeyLight.shadow.camera.far = 40;
    warmKeyLight.shadow.camera.left = -12;
    warmKeyLight.shadow.camera.right = 12;
    warmKeyLight.shadow.camera.top = 12;
    warmKeyLight.shadow.camera.bottom = -12;
    warmKeyLight.shadow.bias = -0.0004;
    warmKeyLight.shadow.normalBias = 0.02;
    scene.add(warmKeyLight);

    const rimBackLight = new THREE.DirectionalLight(0x7090c0, 0.85);
    rimBackLight.position.set(-10, 12, -10);
    scene.add(rimBackLight);

    // 6. OrbitControls with smooth damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't clip below floor
    controls.minDistance = 1.5;
    controls.maxDistance = 35;
    controls.target.copy(initialConfig.target);
    controls.update();

    // 7. Assemble Courtroom Models & Materials
    const materials = createCourtroomMaterials(theme);
    const interactiveObjects: THREE.Object3D[] = [];

    // Courtroom Architecture
    const architectureGroup = buildCourtroomArchitecture(materials);
    scene.add(architectureGroup);

    // Judge's Bench (Station)
    const judgeBench = buildJudgeBench(
      materials,
      matter.judge || "Hon. Presiding Magistrate",
      matter.court || "District Court"
    );
    judgeBench.position.set(0, 0, -6.2);
    scene.add(judgeBench);
    interactiveObjects.push(judgeBench);

    // Witness Stand (Station)
    const witnessStand = buildWitnessStand(materials);
    witnessStand.position.set(4.4, 0, -4.6);
    scene.add(witnessStand);
    interactiveObjects.push(witnessStand);

    // Podium / Lectern in the Well (Station)
    const podium = buildPodiumLectern(materials);
    podium.position.set(0, 0, 0.4);
    scene.add(podium);
    interactiveObjects.push(podium);

    // Defense Table (Pro Se Litigant Station)
    const defenseTable = buildCounselTable("defense", materials, matter.title, matter.caseNumber);
    defenseTable.position.set(-3.4, 0, 2.2);
    scene.add(defenseTable);
    interactiveObjects.push(defenseTable);

    // Prosecution Table (State / AUSA Station)
    const prosecutionTable = buildCounselTable("prosecution", materials, matter.title, matter.caseNumber);
    prosecutionTable.position.set(3.4, 0, 2.2);
    scene.add(prosecutionTable);
    interactiveObjects.push(prosecutionTable);

    // Jury Box
    const juryBox = buildJuryBox(materials);
    juryBox.position.set(-8.4, 0, -3.2);
    scene.add(juryBox);
    interactiveObjects.push(juryBox);

    // Clerk & Stenographer Station
    const clerkStation = buildStenographerStation(materials);
    clerkStation.position.set(-4.2, 0, -5.6);
    scene.add(clerkStation);
    interactiveObjects.push(clerkStation);

    // Spatial Evidence Markers
    const evidenceGroup = buildEvidenceSpatialMarkers(evidence, materials);
    scene.add(evidenceGroup);
    interactiveObjects.push(evidenceGroup);

    // Pre-warm shaders
    renderer.compile(scene, camera);

    const targetCamPos = initialConfig.pos.clone();
    const targetLookAt = initialConfig.target.clone();
    const clock = new THREE.Clock();

    // 8. Animation & Render Loop with silky exponential damping
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);

      // Smooth camera translation damping: 1 - Math.exp(-6 * dt)
      const dampFactor = 1 - Math.exp(-6 * dt);
      camera.position.x += (targetCamPos.x - camera.position.x) * dampFactor;
      camera.position.y += (targetCamPos.y - camera.position.y) * dampFactor;
      camera.position.z += (targetCamPos.z - camera.position.z) * dampFactor;

      controls.target.x += (targetLookAt.x - controls.target.x) * dampFactor;
      controls.target.y += (targetLookAt.y - controls.target.y) * dampFactor;
      controls.target.z += (targetLookAt.z - controls.target.z) * dampFactor;

      controls.update();

      // Gentle floating animation on evidence markers
      if (evidenceGroup && evidenceGroup.children) {
        evidenceGroup.children.forEach((child, i) => {
          if (child.userData?.isEvidenceMarker) {
            child.position.y = Math.sin(clock.elapsedTime * 2.5 + i) * 0.03;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    // Resize Observer for stable responsive canvas
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Store references
    threeRef.current = {
      renderer,
      scene,
      camera,
      controls,
      materials,
      interactiveObjects,
      architectureGroup,
      evidenceGroup,
      targetCamPos,
      targetLookAt,
      animFrameId: animId,
      clock,
      audioCtx: null,
    };

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (threeRef.current?.audioCtx) {
        threeRef.current.audioCtx.close().catch(() => {});
      }
      threeRef.current = null;
    };
  }, [theme, matter.judge, matter.court, matter.title, matter.caseNumber, evidence]);

  // Handle Raycasting Pointer Clicks for Interactive Stations
  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const ref = threeRef.current;
    if (!ref || !mountRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    _pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_pointer, ref.camera);
    const intersects = _raycaster.intersectObjects(ref.interactiveObjects, true);

    if (intersects.length > 0) {
      // Find the closest ancestor group with userData
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !obj.userData?.stationId && !obj.userData?.isEvidenceMarker) {
        obj = obj.parent;
      }

      if (obj && (obj.userData?.stationId || obj.userData?.isEvidenceMarker)) {
        setSelectedStation(obj.userData);
        playTacticalClick(640, 0.09);
      }
    }
  };

  // Change Viewpoint Preset
  const handleSelectPreset = (preset: CourtroomViewPreset) => {
    setActivePreset(preset);
    playTacticalClick(480, 0.08);

    const ref = threeRef.current;
    if (!ref) return;

    const config = VIEWPOINTS[preset];
    if (config) {
      ref.targetCamPos.copy(config.pos);
      ref.targetLookAt.copy(config.target);
    }
  };

  // Handle Exploded View Separation
  const handleExplodedChange = (ratio: number) => {
    setExplodedRatio(ratio);
    const ref = threeRef.current;
    if (!ref) return;

    // Shift ceiling and walls upward along Y
    if (ref.architectureGroup) {
      ref.architectureGroup.children.forEach((child) => {
        if (child.name.includes("Wall") || child.position.y > 2.0) {
          child.position.y = (child.userData?.origY || child.position.y) + ratio * 3.5;
        }
      });
    }

    // Shift evidence layer upward
    if (ref.evidenceGroup) {
      ref.evidenceGroup.position.y = ratio * 1.5;
    }
  };

  // Toggle Evidence Sightline Trajectories
  const handleToggleSightlines = () => {
    const nextVal = !showSightlines;
    setShowSightlines(nextVal);
    playTacticalClick(nextVal ? 720 : 380, 0.07);

    const ref = threeRef.current;
    if (ref && ref.evidenceGroup) {
      ref.evidenceGroup.visible = nextVal;
    }
  };

  return (
    <div className="w-full h-full min-h-[640px] lg:min-h-[82vh] relative flex flex-col rounded-2xl overflow-hidden border border-[#272832] bg-[#0A0B0E] select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      {/* Top Floating Minimal HUD Bar (Clean static typography, zero pulsating dots) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Matter Context Badge */}
        <div className="pointer-events-auto bg-[#12131A]/95 border border-[#2C2E3B] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Gavel className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white tracking-wide">
                {matter.caseNumber || "PRO SE MATTER"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1D1E28] border border-[#333544] text-[#D4AF37]">
                3D War Room
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
              {matter.court || "District Court"} · {matter.judge || "Hon. Presiding Magistrate"}
            </p>
          </div>
        </div>

        {/* Right: Simulation Mode & Tools */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Audio Feedback Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playTacticalClick(soundEnabled ? 300 : 600, 0.06);
            }}
            title={soundEnabled ? "Mute audio cues" : "Enable tactile sound cues"}
            className="p-2.5 rounded-xl bg-[#12131A]/95 border border-[#2C2E3B] text-neutral-300 hover:text-white hover:border-[#D4AF37]/40 transition-colors shadow-xl"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          {/* Reset Camera Button */}
          <button
            type="button"
            onClick={() => handleSelectPreset("DEFENSE")}
            title="Reset to Pro Se Station"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#12131A]/95 border border-[#2C2E3B] text-xs font-medium text-neutral-300 hover:text-white hover:border-[#D4AF37]/40 transition-colors shadow-xl"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Reset Station</span>
          </button>

          {/* Scenario Selector Dropdown */}
          <div className="bg-[#12131A]/95 border border-[#2C2E3B] rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-xl">
            <span className="text-[10px] font-mono uppercase text-neutral-400">Simulation:</span>
            <select
              value={simulationScenario}
              onChange={(e) => {
                setSimulationScenario(e.target.value as any);
                playTacticalClick(550, 0.08);
              }}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="SUPPRESSION" className="bg-[#161720] text-white">
                Suppression Hearing (4th Amend)
              </option>
              <option value="PRELIMINARY" className="bg-[#161720] text-white">
                Probable Cause Hearing
              </option>
              <option value="ORAL_ARGUMENT" className="bg-[#161720] text-white">
                Oral Argument on Motion
              </option>
              <option value="CROSS_EXAM" className="bg-[#161720] text-white">
                Witness Cross-Examination
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Selected Station / Tactical Inspector Overlay Card */}
      {selectedStation && (
        <div className="absolute top-20 right-4 z-20 w-80 sm:w-96 bg-[#12131A] border border-[#D4AF37]/40 rounded-xl p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2 border-b border-[#252733] pb-2.5">
            <div>
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider">
                {selectedStation.isEvidenceMarker ? "Spatial Forensics Exhibit" : "Tactical Station Protocol"}
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {selectedStation.name || selectedStation.title}
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                {selectedStation.role || selectedStation.locationNote || selectedStation.type}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedStation(null)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            {selectedStation.summary || "Physical spatial coordinate logged in court record."}
          </p>

          {/* Protocols List */}
          {selectedStation.protocols && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
                Critical Station Rules & Etiquette:
              </span>
              <ul className="space-y-1">
                {selectedStation.protocols.map((rule: string, i: number) => (
                  <li key={i} className="text-xs text-neutral-200 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-[#252733] flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-400">Click anywhere to dismiss</span>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("court_watch")}
                className="text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
              >
                Open Hearing Kit →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ergonomic Collapsible Bottom Control Dock (<= 15% Viewport Occlusion) */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-4xl transition-all duration-300 ease-out ${
          isDockCollapsed ? "translate-y-[calc(100%-2.25rem)]" : "translate-y-0"
        }`}
      >
        {/* Drawer Collapse / Expand Tab Button */}
        <div className="flex justify-center -mb-px">
          <button
            type="button"
            onClick={() => {
              setIsDockCollapsed(!isDockCollapsed);
              playTacticalClick(isDockCollapsed ? 600 : 400, 0.07);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl bg-[#14151E] border-t border-x border-[#2C2E3C] text-[11px] font-mono text-[#D4AF37] hover:text-white transition-colors shadow-2xl cursor-pointer"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show War Room Dock</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Zen Mode (Hide Dock)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container (Solid surface, zero backdrop-filter over WebGL) */}
        <div className="bg-[#12131A] border border-[#2C2E3C] rounded-2xl p-3 sm:p-4 shadow-2xl space-y-3">
          {/* Row 1: Camera Vantage Presets */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono uppercase text-neutral-400 shrink-0 font-semibold flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
              Vantage:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(Object.keys(VIEWPOINTS) as CourtroomViewPreset[]).map((presetKey) => {
                const vp = VIEWPOINTS[presetKey];
                const isActive = activePreset === presetKey;
                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => handleSelectPreset(presetKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                      isActive
                        ? "bg-[#D4AF37] text-neutral-950 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20"
                        : "bg-[#181A24] border-[#2B2E3D] text-neutral-300 hover:text-white hover:bg-[#202330]"
                    }`}
                  >
                    <span>{vp.label}</span>
                    <span className="text-[10px] opacity-75 ml-1 hidden md:inline">({vp.sublabel})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Tactical Sliders & Environmental Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#222430] text-xs">
            {/* Exploded Architecture Separation Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-neutral-400 shrink-0 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-[#D4AF37]" />
                Exploded:
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodedRatio}
                onChange={(e) => handleExplodedChange(parseFloat(e.target.value))}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
              <span className="text-[10px] font-mono text-neutral-400 w-8 text-right">
                {Math.round(explodedRatio * 100)}%
              </span>
            </div>

            {/* Spatial Sightlines Toggle */}
            <div className="flex items-center justify-between sm:justify-center gap-2">
              <span className="text-[11px] font-mono text-neutral-400">Forensic Sightlines:</span>
              <button
                type="button"
                onClick={handleToggleSightlines}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors border ${
                  showSightlines
                    ? "bg-sky-950/50 border-sky-600 text-sky-400"
                    : "bg-neutral-800 border-neutral-700 text-neutral-400"
                }`}
              >
                {showSightlines ? "VISIBLE" : "MUTED"}
              </button>
            </div>

            {/* Courtroom Finish Swatch */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-[11px] font-mono text-neutral-400">Wood Finish:</span>
              <div className="flex items-center gap-1">
                {(["walnut", "oak", "mahogany"] as const).map((wTheme) => (
                  <button
                    key={wTheme}
                    type="button"
                    onClick={() => {
                      setTheme(wTheme);
                      playTacticalClick(500, 0.06);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                      theme === wTheme
                        ? "bg-[#D4AF37] text-neutral-950 border-[#D4AF37] font-bold"
                        : "bg-[#181A24] border-[#2A2D3C] text-neutral-400 hover:text-white"
                    }`}
                  >
                    {wTheme}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
