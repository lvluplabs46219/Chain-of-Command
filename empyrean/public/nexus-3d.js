import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Pre-allocated scratch objects for zero-GC animation loop
const _scratchVec3 = new THREE.Vector3();
const _scratchMat4 = new THREE.Matrix4();
const _scratchQuat = new THREE.Quaternion();
const _scratchColor = new THREE.Color();

let scene, camera, renderer, controls;
let container = null;
let animId = null;
let clock = new THREE.Clock();

// Hero Beacon Group & Components (11 distinct parts)
let heroBeaconGroup = null;
let partPlinth, partPedestal, partStator;
let partGimbalOuter, partGimbalMid, partGimbalInner;
let partQuantumCore, partCollimator, partHelicalTubes;
let partOutriggersGroup, partContactShadow;
let beaconPBRMaterials = [];

// Satellite Agent Groups
const agentNodes = [];
let swarmPacketsMesh = null;
const packetCount = 120;
const packetData = [];

// Interactive state
let currentExplode = 0;
let targetExplode = 0;
let simSpeed = 1.0;
let isControlsCollapsed = false;

// Camera transition state
let isTransitioningCam = false;
const targetCamPos = new THREE.Vector3(18, 14, 22);
const targetCamLook = new THREE.Vector3(0, 2, 0);

// FPS Meter
let frameCount = 0;
let lastFpsTime = performance.now();

/** Procedural Radial Contact Shadow Texture */
function createContactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 240);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.5)');
  grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Procedural Cybernetic Holographic Ground Grid */
function createProceduralGroundTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep twilight background
  ctx.fillStyle = '#170a1b';
  ctx.fillRect(0, 0, 1024, 1024);

  // Minor sub-grid
  ctx.strokeStyle = 'rgba(116, 74, 162, 0.16)';
  ctx.lineWidth = 1;
  const step = 64;
  for (let x = 0; x <= 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(1024, x);
    ctx.stroke();
  }

  // Major accent coordinate lines
  ctx.strokeStyle = 'rgba(224, 64, 160, 0.35)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 1024; x += 256) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(1024, x);
    ctx.stroke();
  }

  // Cross-hair intersections
  ctx.fillStyle = 'rgba(255, 77, 184, 0.8)';
  for (let x = 0; x <= 1024; x += 256) {
    for (let y = 0; y <= 1024; y += 256) {
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

/** Build the 11-Part Composite Hero Subject: YHWH/Michael Orchestration Beacon */
function buildHeroBeacon() {
  const beaconGroup = new THREE.Group();
  beaconGroup.position.set(0, 0, 0);

  // 1. Base Octagonal Plinth (ExtrudeGeometry with Bevels)
  const baseShape = new THREE.Shape();
  const sides = 8;
  const plinthRadius = 3.2;
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const x = Math.cos(a) * plinthRadius;
    const y = Math.sin(a) * plinthRadius;
    if (i === 0) baseShape.moveTo(x, y);
    else baseShape.lineTo(x, y);
  }
  baseShape.closePath();

  const plinthGeo = new THREE.ExtrudeGeometry(baseShape, {
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.15,
    bevelSegments: 4,
  });
  plinthGeo.rotateX(-Math.PI / 2);
  plinthGeo.computeVertexNormals();

  const matPlinth = new THREE.MeshStandardMaterial({
    color: 0x24142e,
    roughness: 0.65,
    metalness: 0.85,
  });
  partPlinth = new THREE.Mesh(plinthGeo, matPlinth);
  partPlinth.castShadow = true;
  partPlinth.receiveShadow = true;
  partPlinth.position.y = 0;
  beaconGroup.add(partPlinth);
  beaconPBRMaterials.push(matPlinth);

  // 2. Stepped Turntable Collar
  const pedestalGeo = new THREE.CylinderGeometry(2.5, 2.7, 0.35, 32);
  const matPedestal = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.2,
    metalness: 0.95,
  });
  partPedestal = new THREE.Mesh(pedestalGeo, matPedestal);
  partPedestal.castShadow = true;
  partPedestal.receiveShadow = true;
  partPedestal.position.y = 0.52;
  beaconGroup.add(partPedestal);
  beaconPBRMaterials.push(matPedestal);

  // 3. Magnetic Stator Emitter Cone
  const statorGeo = new THREE.CylinderGeometry(1.4, 2.2, 0.65, 24);
  const matStator = new THREE.MeshStandardMaterial({
    color: 0x3d204a,
    roughness: 0.55,
    metalness: 0.35,
  });
  partStator = new THREE.Mesh(statorGeo, matStator);
  partStator.castShadow = true;
  partStator.receiveShadow = true;
  partStator.position.y = 1.02;
  beaconGroup.add(partStator);
  beaconPBRMaterials.push(matStator);

  // 4. Outer Astrolabe Celestial Ring
  const ringOuterGeo = new THREE.TorusGeometry(2.15, 0.09, 16, 64);
  const matRingOuter = new THREE.MeshStandardMaterial({
    color: 0xc8963e,
    roughness: 0.35,
    metalness: 0.85,
  });
  partGimbalOuter = new THREE.Mesh(ringOuterGeo, matRingOuter);
  partGimbalOuter.castShadow = true;
  partGimbalOuter.position.y = 2.4;
  beaconGroup.add(partGimbalOuter);
  beaconPBRMaterials.push(matRingOuter);

  // 5. Middle Coordinate Meridian Ring
  const ringMidGeo = new THREE.TorusGeometry(1.75, 0.08, 16, 64);
  const matRingMid = new THREE.MeshStandardMaterial({
    color: 0xe0e6ed,
    roughness: 0.08,
    metalness: 1.0,
  });
  partGimbalMid = new THREE.Mesh(ringMidGeo, matRingMid);
  partGimbalMid.castShadow = true;
  partGimbalMid.position.y = 2.4;
  beaconGroup.add(partGimbalMid);
  beaconPBRMaterials.push(matRingMid);

  // 6. Inner Armillary Gimbal Ring
  const ringInnerGeo = new THREE.TorusGeometry(1.35, 0.07, 16, 64);
  const matRingInner = new THREE.MeshStandardMaterial({
    color: 0xffcc33,
    roughness: 0.12,
    metalness: 0.98,
  });
  partGimbalInner = new THREE.Mesh(ringInnerGeo, matRingInner);
  partGimbalInner.castShadow = true;
  partGimbalInner.position.y = 2.4;
  beaconGroup.add(partGimbalInner);
  beaconPBRMaterials.push(matRingInner);

  // 7. Quantum Crystalline Core (YHWH Intent Engine)
  const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
  const matQuantumCore = new THREE.MeshPhysicalMaterial({
    color: 0xff4db8,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.92,
    ior: 1.62,
    thickness: 1.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  partQuantumCore = new THREE.Mesh(coreGeo, matQuantumCore);
  partQuantumCore.castShadow = true;
  partQuantumCore.position.y = 2.4;
  beaconGroup.add(partQuantumCore);
  beaconPBRMaterials.push(matQuantumCore);

  // 8. Upper Optical Collimator Crown (LatheGeometry)
  const crownPoints = [
    new THREE.Vector2(0.25, 0.0),
    new THREE.Vector2(0.85, 0.2),
    new THREE.Vector2(1.05, 0.45),
    new THREE.Vector2(0.75, 0.75),
    new THREE.Vector2(0.35, 0.95),
  ];
  const crownGeo = new THREE.LatheGeometry(crownPoints, 32);
  const matCrown = new THREE.MeshStandardMaterial({
    color: 0x930864,
    roughness: 0.2,
    metalness: 0.92,
  });
  partCollimator = new THREE.Mesh(crownGeo, matCrown);
  partCollimator.castShadow = true;
  partCollimator.position.y = 3.65;
  beaconGroup.add(partCollimator);
  beaconPBRMaterials.push(matCrown);

  // 9. Helical Energy Conduit Tubes
  const helicalPoints = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const angle = t * Math.PI * 4;
    const rad = 1.35 - t * 0.45;
    const y = 1.1 + t * 2.6;
    helicalPoints.push(new THREE.Vector3(Math.cos(angle) * rad, y, Math.sin(angle) * rad));
  }
  const helicalCurve = new THREE.CatmullRomCurve3(helicalPoints);
  const tubeGeo = new THREE.TubeGeometry(helicalCurve, 48, 0.045, 8, false);
  const matTube = new THREE.MeshStandardMaterial({
    color: 0x56ccf2,
    roughness: 0.25,
    metalness: 0.75,
  });
  partHelicalTubes = new THREE.Mesh(tubeGeo, matTube);
  partHelicalTubes.castShadow = true;
  beaconGroup.add(partHelicalTubes);
  beaconPBRMaterials.push(matTube);

  // 10. Four Symmetrical Stabilizing Outrigger Pylons
  partOutriggersGroup = new THREE.Group();
  const pylonGeo = new THREE.BoxGeometry(0.2, 0.4, 1.2);
  pylonGeo.translate(0, 0.2, 2.5);
  const pylonNodeGeo = new THREE.SphereGeometry(0.12, 12, 12);
  pylonNodeGeo.translate(0, 0.4, 3.1);

  const matPylon = new THREE.MeshStandardMaterial({
    color: 0x5a3086,
    roughness: 0.4,
    metalness: 0.8,
  });
  const matPylonNode = new THREE.MeshStandardMaterial({
    color: 0xff4db8,
    roughness: 0.1,
    metalness: 0.9,
  });

  for (let i = 0; i < 4; i++) {
    const pylonSub = new THREE.Group();
    pylonSub.rotation.y = (i / 4) * Math.PI * 2;
    const pylonMesh = new THREE.Mesh(pylonGeo, matPylon);
    pylonMesh.castShadow = true;
    pylonMesh.receiveShadow = true;
    const nodeMesh = new THREE.Mesh(pylonNodeGeo, matPylonNode);
    nodeMesh.castShadow = true;
    pylonSub.add(pylonMesh);
    pylonSub.add(nodeMesh);
    partOutriggersGroup.add(pylonSub);
  }
  partOutriggersGroup.position.y = 0.1;
  beaconGroup.add(partOutriggersGroup);
  beaconPBRMaterials.push(matPylon);

  // 11. Soft Radial Contact Shadow Plane (Ground Contact Shadowing)
  const shadowGeo = new THREE.PlaneGeometry(9, 9);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(),
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  partContactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  partContactShadow.position.y = 0.005;
  beaconGroup.add(partContactShadow);

  return beaconGroup;
}

/** Build the 5 Composite Orbiting Satellite Agent Nodes */
function buildSatelliteAgents() {
  const configs = [
    {
      id: 'michael',
      name: 'Michael (Commander)',
      color: 0x0284c7,
      accent: 0xffcc33,
      radius: 9.2,
      speed: 0.22,
      elevation: 2.8,
      tilt: 0.1,
      builder: (group) => {
        // Michael: Cobalt hull, gold halo ring, antenna spire, 4 thruster nacelles
        const hull = new THREE.Mesh(
          new THREE.CylinderGeometry(0.65, 0.85, 0.45, 6),
          new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.9 })
        );
        hull.castShadow = true;
        group.add(hull);

        const halo = new THREE.Mesh(
          new THREE.TorusGeometry(0.95, 0.045, 12, 32),
          new THREE.MeshStandardMaterial({ color: 0xffcc33, roughness: 0.1, metalness: 1.0 })
        );
        halo.rotation.x = Math.PI / 2;
        group.add(halo);

        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.06, 0.75, 12),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.95 })
        );
        spire.position.y = 0.45;
        group.add(spire);

        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0x56ccf2, roughness: 0.1, metalness: 0.9 })
        );
        beacon.position.y = 0.85;
        group.add(beacon);
      },
    },
    {
      id: 'raphael',
      name: 'Raphael (Worker Specialist)',
      color: 0xf59e0b,
      accent: 0xff75c8,
      radius: 8.4,
      speed: 0.35,
      elevation: 2.2,
      tilt: -0.15,
      builder: (group) => {
        // Raphael: Industrial hexagonal chassis, articulating arm, amber visor, dual thrusters
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.75, 0.75, 0.4, 6),
          new THREE.MeshStandardMaterial({ color: 0x3d204a, roughness: 0.6, metalness: 0.8 })
        );
        body.castShadow = true;
        group.add(body);

        const visor = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.14, 16),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.15, metalness: 0.95 })
        );
        visor.position.y = 0.25;
        group.add(visor);

        // Robotic Manipulator Arm (TubeGeometry)
        const armCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.5, 0, 0),
          new THREE.Vector3(0.85, 0.2, 0.2),
          new THREE.Vector3(1.15, -0.1, 0.1),
        ]);
        const arm = new THREE.Mesh(
          new THREE.TubeGeometry(armCurve, 16, 0.05, 8, false),
          new THREE.MeshStandardMaterial({ color: 0xffafd5, roughness: 0.25, metalness: 0.9 })
        );
        group.add(arm);

        const dataRing = new THREE.Mesh(
          new THREE.RingGeometry(0.45, 0.65, 24),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.85, side: THREE.DoubleSide })
        );
        dataRing.rotation.x = Math.PI / 2;
        dataRing.position.y = -0.3;
        group.add(dataRing);
      },
    },
    {
      id: 'metatron',
      name: 'Metatron (Gateway Oracle)',
      color: 0xa855f7,
      accent: 0x0096cc,
      radius: 10.4,
      speed: 0.18,
      elevation: 3.4,
      tilt: 0.2,
      builder: (group) => {
        // Metatron: Dual-cone spindle crystal, counter-rotating sapphire rings, ocular crystal
        const spindleTop = new THREE.Mesh(
          new THREE.ConeGeometry(0.65, 1.1, 8),
          new THREE.MeshStandardMaterial({ color: 0x5a3086, roughness: 0.2, metalness: 0.85 })
        );
        spindleTop.position.y = 0.55;
        group.add(spindleTop);

        const spindleBot = new THREE.Mesh(
          new THREE.ConeGeometry(0.65, 1.1, 8),
          new THREE.MeshStandardMaterial({ color: 0x5a3086, roughness: 0.2, metalness: 0.85 })
        );
        spindleBot.position.y = -0.55;
        spindleBot.rotation.x = Math.PI;
        group.add(spindleBot);

        const sRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.05, 0.045, 12, 32),
          new THREE.MeshStandardMaterial({ color: 0x0096cc, roughness: 0.08, metalness: 1.0 })
        );
        sRing.rotation.x = Math.PI / 3;
        group.add(sRing);

        const ocular = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.28, 1),
          new THREE.MeshStandardMaterial({ color: 0xff4db8, roughness: 0.1, metalness: 0.9 })
        );
        group.add(ocular);
      },
    },
    {
      id: 'gabriel',
      name: 'Gabriel (Comms Scout)',
      color: 0x10b981,
      accent: 0xffd8e8,
      radius: 7.8,
      speed: 0.42,
      elevation: 1.8,
      tilt: -0.25,
      builder: (group) => {
        // Gabriel: Aerodynamic delta body, swept emerald vanes, parabolic dish
        const delta = new THREE.Mesh(
          new THREE.ConeGeometry(0.55, 1.3, 4),
          new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, metalness: 0.9 })
        );
        delta.rotation.z = Math.PI / 2;
        group.add(delta);

        const dishCurve = [
          new THREE.Vector2(0.05, 0),
          new THREE.Vector2(0.35, 0.15),
          new THREE.Vector2(0.55, 0.35),
        ];
        const dish = new THREE.Mesh(
          new THREE.LatheGeometry(dishCurve, 16),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.95 })
        );
        dish.position.set(0, 0.45, 0);
        dish.rotation.x = -Math.PI / 2;
        group.add(dish);

        const vaneL = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.7, 0.25),
          new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.3, metalness: 0.8 })
        );
        vaneL.position.set(-0.4, 0, 0.3);
        group.add(vaneL);

        const vaneR = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.7, 0.25),
          new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.3, metalness: 0.8 })
        );
        vaneR.position.set(0.4, 0, 0.3);
        group.add(vaneR);
      },
    },
    {
      id: 'seraphim',
      name: 'Seraphim (Vertex AI Deep Reason)',
      color: 0xef4444,
      accent: 0xffffff,
      radius: 11.2,
      speed: 0.15,
      elevation: 4.0,
      tilt: 0.3,
      builder: (group) => {
        // Seraphim: Ruby crystalline spindle, 6 orbital shielding foils
        const octa = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.65, 0),
          new THREE.MeshStandardMaterial({ color: 0xba1a1a, roughness: 0.1, metalness: 0.95 })
        );
        group.add(octa);

        // 6 Orbital Shielding Foils
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const foil = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.55, 0.2),
            new THREE.MeshStandardMaterial({ color: 0xffd8e8, roughness: 0.15, metalness: 0.9 })
          );
          foil.position.set(Math.cos(a) * 0.9, Math.sin(a * 2) * 0.15, Math.sin(a) * 0.9);
          foil.rotation.y = a + Math.PI / 2;
          group.add(foil);
        }
      },
    },
  ];

  configs.forEach((cfg, idx) => {
    const group = new THREE.Group();
    cfg.builder(group);

    // Add grounding contact shadow for each satellite
    const satShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.4),
      new THREE.MeshBasicMaterial({
        map: createContactShadowTexture(),
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      })
    );
    satShadow.rotation.x = -Math.PI / 2;
    satShadow.position.y = 0.01;

    scene.add(group);
    scene.add(satShadow);

    agentNodes.push({
      ...cfg,
      group,
      shadowMesh: satShadow,
      angle: (idx / configs.length) * Math.PI * 2,
    });
  });
}

/** Build Instanced Swarm Data Packets */
function buildSwarmPackets() {
  const packetGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  swarmPacketsMesh = new THREE.InstancedMesh(packetGeo, packetMat, packetCount);
  swarmPacketsMesh.frustumCulled = false;

  for (let i = 0; i < packetCount; i++) {
    const agentIdx = i % 5;
    packetData.push({
      progress: Math.random(),
      speed: 0.2 + Math.random() * 0.35,
      agentIdx,
      radiusOffset: (Math.random() - 0.5) * 0.6,
      color: new THREE.Color(i % 2 === 0 ? 0xff4db8 : 0x56ccf2),
    });
    _scratchColor.copy(packetData[i].color);
    swarmPacketsMesh.setColorAt(i, _scratchColor);
  }
  swarmPacketsMesh.instanceColor.needsUpdate = true;
  swarmPacketsMesh.computeBoundingSphere();
  scene.add(swarmPacketsMesh);
}

/** Update Swarm Packets along Trajectories */
function updateSwarmPackets(delta) {
  if (!swarmPacketsMesh || agentNodes.length === 0) return;

  for (let i = 0; i < packetCount; i++) {
    const p = packetData[i];
    p.progress += delta * p.speed * simSpeed;
    if (p.progress > 1) p.progress -= 1;

    const agent = agentNodes[p.agentIdx];
    const t = p.progress;

    // Bezier flow between Beacon Core (0, 2.4, 0) and Agent Position
    const p0 = _scratchVec3.set(0, 2.4, 0);
    const p2 = agent.group.position;
    const midY = Math.max(p0.y, p2.y) + 1.2;
    const midX = p2.x * 0.5 + Math.sin(t * Math.PI * 2) * p.radiusOffset;
    const midZ = p2.z * 0.5 + Math.cos(t * Math.PI * 2) * p.radiusOffset;

    // Quadratic bezier curve interpolation
    const bx = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * midX + t * t * p2.x;
    const by = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * midY + t * t * p2.y;
    const bz = (1 - t) * (1 - t) * p0.z + 2 * (1 - t) * t * midZ + t * t * p2.z;

    _scratchMat4.makeTranslation(bx, by, bz);
    const scale = Math.sin(t * Math.PI) * 0.9 + 0.3;
    _scratchMat4.scale(_scratchVec3.set(scale, scale, scale));
    swarmPacketsMesh.setMatrixAt(i, _scratchMat4);
  }
  swarmPacketsMesh.instanceMatrix.needsUpdate = true;
}

/** Main Three.js Scene Setup */
export function initThreeScene(mountElem) {
  if (renderer) return; // Already initialized

  container = mountElem;
  const width = window.innerWidth;
  const height = window.innerHeight;

  // 1. Scene & Atmosphere (Horizon-Matched Fog)
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x170a1b);
  scene.fog = new THREE.FogExp2(0x170a1b, 0.022);

  // 2. Camera with Damped Damping Parameters
  camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
  camera.position.copy(targetCamPos);

  // 3. Modern Physical Renderer (SRGB + ACES Film + RoomEnvironment)
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 4. Procedural RoomEnvironment for Studio Reflections
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  pmremGenerator.dispose();

  // 5. Studio Lighting Rig (Key Light + Cool Fill + Specular Rim)
  const keyLight = new THREE.DirectionalLight(0xfff2e2, 1.8);
  keyLight.position.set(12, 18, 14);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 45;
  keyLight.shadow.camera.left = -11;
  keyLight.shadow.camera.right = 11;
  keyLight.shadow.camera.top = 11;
  keyLight.shadow.camera.bottom = -11;
  scene.add(keyLight);

  const fillLight = new THREE.HemisphereLight(0xb8d5ff, 0x1a0f24, 1.05);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x9d6ee8, 0.7);
  rimLight.position.set(-12, 10, -10);
  scene.add(rimLight);

  // 6. Procedural Ground Plane with Polygon Offset (Zero Z-Fighting)
  const groundGeo = new THREE.PlaneGeometry(160, 160);
  groundGeo.rotateX(-Math.PI / 2);
  const groundTex = createProceduralGroundTexture();
  const groundMat = new THREE.MeshStandardMaterial({
    map: groundTex,
    roughness: 0.85,
    metalness: 0.25,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  groundTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.receiveShadow = true;
  groundMesh.position.y = 0;
  scene.add(groundMesh);

  // 7. Assemble 3D Entities
  heroBeaconGroup = buildHeroBeacon();
  scene.add(heroBeaconGroup);

  buildSatelliteAgents();
  buildSwarmPackets();

  // 8. Damped OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.03; // Never dip below ground
  controls.minDistance = 3.5;
  controls.maxDistance = 60;
  controls.target.copy(targetCamLook);

  // Resize listener
  window.addEventListener('resize', onWindowResize);

  // Pre-warm WebGL Shaders
  renderer.compile(scene, camera);

  // Start Animation Loop
  clock.start();
  renderLoop();
}

/** Window Resize Handler */
function onWindowResize() {
  if (!renderer || !camera || !container) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

/** Lossless 60fps Animation Loop with Exponential Damping */
function renderLoop() {
  animId = requestAnimationFrame(renderLoop);
  const delta = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.getElapsedTime() * simSpeed;

  // 1. Update FPS Meter
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 500) {
    const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
    const fpsCounter = document.getElementById('threeFpsCounter');
    if (fpsCounter) fpsCounter.textContent = String(fps);
    frameCount = 0;
    lastFpsTime = now;
  }

  // 2. Smooth Exploded Assembly Damping
  currentExplode = THREE.MathUtils.damp(currentExplode, targetExplode, 5, delta);
  if (heroBeaconGroup) {
    // Dynamic vertical layer separation based on explosion slider
    if (partPedestal) partPedestal.position.y = 0.52 + currentExplode * 0.4;
    if (partStator) partStator.position.y = 1.02 + currentExplode * 0.9;
    if (partGimbalOuter) partGimbalOuter.position.y = 2.4 + currentExplode * 1.6;
    if (partGimbalMid) partGimbalMid.position.y = 2.4 + currentExplode * 2.2;
    if (partGimbalInner) partGimbalInner.position.y = 2.4 + currentExplode * 2.8;
    if (partQuantumCore) partQuantumCore.position.y = 2.4 + currentExplode * 3.4;
    if (partCollimator) partCollimator.position.y = 3.65 + currentExplode * 4.6;
    if (partHelicalTubes) partHelicalTubes.position.y = currentExplode * 2.0;

    // Outriggers radial expansion
    if (partOutriggersGroup) {
      const outScale = 1 + currentExplode * 0.35;
      partOutriggersGroup.scale.set(outScale, 1, outScale);
    }
  }

  // 3. Beacon Kinematics & Gyro Rotations
  if (partGimbalOuter) partGimbalOuter.rotation.z += delta * 0.35 * simSpeed;
  if (partGimbalMid) partGimbalMid.rotation.y += delta * 0.55 * simSpeed;
  if (partGimbalInner) partGimbalInner.rotation.x += delta * 0.85 * simSpeed;
  if (partQuantumCore) {
    partQuantumCore.rotation.y += delta * 0.6 * simSpeed;
    partQuantumCore.rotation.z += delta * 0.4 * simSpeed;
    const pulseScale = 1.0 + Math.sin(elapsed * 2.5) * 0.05;
    partQuantumCore.scale.set(pulseScale, pulseScale, pulseScale);
  }
  if (partHelicalTubes) {
    partHelicalTubes.rotation.y += delta * 0.45 * simSpeed;
  }

  // 4. Orbiting Satellite Agents Kinematics
  agentNodes.forEach((agent) => {
    agent.angle += delta * agent.speed * simSpeed;
    const x = Math.cos(agent.angle) * agent.radius;
    const z = Math.sin(agent.angle) * agent.radius;
    const y = agent.elevation + Math.sin(elapsed * 2 + agent.angle) * 0.25;

    agent.group.position.set(x, y, z);
    agent.group.rotation.y = -agent.angle + Math.PI / 2;
    agent.group.rotation.z = agent.tilt + Math.cos(elapsed * 1.5) * 0.05;

    // Keep contact shadow locked beneath satellite on ground
    agent.shadowMesh.position.set(x, 0.01, z);
    const shadowOpacity = Math.max(0.15, 0.45 - y * 0.08);
    agent.shadowMesh.material.opacity = shadowOpacity;
  });

  // 5. Instanced Swarm Data Flow
  updateSwarmPackets(delta);

  // 6. Camera Preset Transition with Exponential Damping
  if (isTransitioningCam) {
    camera.position.lerp(targetCamPos, 1 - Math.exp(-6 * delta));
    controls.target.lerp(targetCamLook, 1 - Math.exp(-8 * delta));
    if (camera.position.distanceTo(targetCamPos) < 0.05 && controls.target.distanceTo(targetCamLook) < 0.05) {
      isTransitioningCam = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

/** Set Camera View Preset */
export function setCameraPreset(preset) {
  isTransitioningCam = true;
  if (preset === 'overview') {
    targetCamPos.set(18, 14, 22);
    targetCamLook.set(0, 2, 0);
  } else if (preset === 'core') {
    targetCamPos.set(4.5, 3.8, 5.5);
    targetCamLook.set(0, 2.6, 0);
  } else if (preset === 'workers') {
    const raphael = agentNodes.find((a) => a.id === 'raphael');
    if (raphael) {
      targetCamPos.set(raphael.group.position.x + 3, raphael.group.position.y + 2, raphael.group.position.z + 4);
      targetCamLook.copy(raphael.group.position);
    }
  } else if (preset === 'oracle') {
    const metatron = agentNodes.find((a) => a.id === 'metatron');
    if (metatron) {
      targetCamPos.set(metatron.group.position.x + 4, metatron.group.position.y + 2.5, metatron.group.position.z + 3);
      targetCamLook.copy(metatron.group.position);
    }
  } else if (preset === 'top') {
    targetCamPos.set(0, 26, 0.01);
    targetCamLook.set(0, 0, 0);
  }
}

/** Set Exploded View Amount (0 to 100) */
export function setExplodedAmount(val) {
  targetExplode = Math.max(0, Math.min(100, val)) / 100;
  const label = document.getElementById('threeExplodeVal');
  if (label) label.textContent = `${Math.round(targetExplode * 100)}%`;
}

/** Set Material Finish Swatches */
export function setMaterialFinish(finish) {
  if (!beaconPBRMaterials.length) return;

  if (finish === 'gold') {
    beaconPBRMaterials.forEach((m) => {
      if (m.isMeshPhysicalMaterial) {
        m.color.setHex(0xff4db8);
      } else {
        m.roughness = 0.2;
        m.metalness = 0.95;
      }
    });
    if (partPedestal) partPedestal.material.color.setHex(0xd4af37);
  } else if (finish === 'titanium') {
    beaconPBRMaterials.forEach((m) => {
      if (m.isMeshPhysicalMaterial) {
        m.color.setHex(0x56ccf2);
      } else {
        m.roughness = 0.08;
        m.metalness = 1.0;
        m.color.setHex(0xd0d7de);
      }
    });
  } else if (finish === 'obsidian') {
    beaconPBRMaterials.forEach((m) => {
      if (m.isMeshPhysicalMaterial) {
        m.color.setHex(0x9d6ee8);
      } else {
        m.roughness = 0.35;
        m.metalness = 0.85;
        m.color.setHex(0x18101e);
      }
    });
  } else if (finish === 'crystal') {
    beaconPBRMaterials.forEach((m) => {
      if (m.isMeshPhysicalMaterial) {
        m.color.setHex(0xffafd5);
        m.transmission = 0.95;
      } else {
        m.roughness = 0.15;
        m.metalness = 0.6;
        m.color.setHex(0xfde7ff);
      }
    });
  }
}

/** Set Simulation Speed Multiplier */
export function setSimulationSpeed(speed) {
  simSpeed = speed;
}

/** Pulse Autonomous Directive Packet Storm in 3D */
export function pulseDirectiveStorm() {
  packetData.forEach((p) => {
    p.speed = 1.2 + Math.random() * 1.5;
  });
  setTimeout(() => {
    packetData.forEach((p) => {
      p.speed = 0.2 + Math.random() * 0.35;
    });
  }, 2200);

  // Send real directive call to backend orchestrator
  fetch('/api/directive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: '3D Swarm Directive: Re-synchronize agent state and pulse topological DAG nodes',
      context: { origin: 'threejs_3d_nexus' },
    }),
  }).catch(() => {});
}

/** Toggle Collapsible Bottom Dock (Zen / Cinema Mode) */
export function toggleControlsDock() {
  isControlsCollapsed = !isControlsCollapsed;
  const dock = document.getElementById('threejsBottomDock');
  const icon = document.getElementById('dockToggleIcon');
  const label = document.getElementById('dockToggleLabel');
  if (dock) {
    if (isControlsCollapsed) {
      dock.classList.add('collapsed');
      if (icon) icon.textContent = '▴';
      if (label) label.textContent = 'Show Controls';
    } else {
      dock.classList.remove('collapsed');
      if (icon) icon.textContent = '▾';
      if (label) label.textContent = 'Hide Controls';
    }
  }
}

// Global Keyboard Shortcut ('H' for Cinema Mode)
window.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') {
    const active = document.getElementById('threejsViewportContainer');
    if (active && active.style.display !== 'none') {
      toggleControlsDock();
    }
  }
});

// Expose on global window object for UI event handlers
window.initThreeScene = initThreeScene;
window.setCameraPreset = setCameraPreset;
window.setExplodedAmount = setExplodedAmount;
window.setMaterialFinish = setMaterialFinish;
window.setSimulationSpeed = setSimulationSpeed;
window.pulseDirectiveStorm = pulseDirectiveStorm;
window.toggleControlsDock = toggleControlsDock;
