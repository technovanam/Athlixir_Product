'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LAYER_STYLES } from './layers';
import type { AnatomyStats, HoveredStructure, LayerId } from './layers';
import { loadLeg, structureAt } from './loadLeg';
import type { LegLayer, ManifestLayer, Structure } from './loadLeg';
import { MUSCLE_GROUPS, STRIDE_SECONDS, TOE_OFF, bump, leg, phaseName } from '../gait';

export type RunView = 'side' | 'three-quarter' | 'front' | 'back';

export interface RunFrame {
  phase: number;
  phaseName: string;
  hip: number;
  knee: number;
  ankle: number;
  activity: Record<string, number>;
}

interface Props {
  visible: Record<LayerId, boolean>;
  xray: boolean;
  activity: boolean;
  playing: boolean;
  speed: number;
  /** Stride phase of the right leg, used while paused (for scrubbing). */
  phase: number;
  view: RunView;
  onLoaded?: (stats: AnatomyStats) => void;
  onHover?: (structure: HoveredStructure | null) => void;
  onFrame?: (frame: RunFrame) => void;
}

const RAD = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);

// Skeleton: 0 = pelvis; per side (0 right, 1 left) thigh, shank, foot, toes.
type Segment = 'pelvis' | 'thigh' | 'shank' | 'foot' | 'toes';
const SEGMENTS: Segment[] = ['thigh', 'shank', 'foot', 'toes'];
const boneIndex = (segment: Segment, side: number) => (segment === 'pelvis' ? 0 : 1 + side * 4 + SEGMENTS.indexOf(segment));

// Bones are rigid, so each one follows a single segment.
const BONE_SEGMENT: [RegExp, Segment][] = [
  [/hip bone|sacrum|coccyx|vertebra/i, 'pelvis'],
  [/femur/i, 'thigh'],
  [/patella|tibia|fibula/i, 'shank'],
  [/phalanx/i, 'toes'],
  [/talus|calcaneus|navicular|cuboid|cuneiform|metatarsal|sesamoid/i, 'foot'],
];

const sideOf = (name: string) => (/\bleft\b/i.test(name) ? 1 : /\bright\b/i.test(name) ? 0 : -1);

function structureVertices(indices: ArrayLike<number>, s: Structure): number[] {
  const seen = new Set<number>();
  for (let i = s.triStart * 3, end = (s.triStart + s.triCount) * 3; i < end; i++) seen.add(indices[i]);
  return [...seen];
}

function centroid(points: THREE.Vector3[]) {
  const c = new THREE.Vector3();
  for (const p of points) c.add(p);
  return c.divideScalar(Math.max(1, points.length));
}

/** Least-squares sphere through points (used for the femoral head). */
function fitSphere(points: THREE.Vector3[]): { centre: THREE.Vector3; radius: number } | null {
  if (points.length < 10) return null;
  const c0 = centroid(points);
  const m = Array.from({ length: 4 }, () => [0, 0, 0, 0, 0]);
  for (const p of points) {
    const x = p.x - c0.x;
    const y = p.y - c0.y;
    const z = p.z - c0.z;
    const row = [x, y, z, 1];
    const rhs = -(x * x + y * y + z * z);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) m[i][j] += row[i] * row[j];
      m[i][4] += row[i] * rhs;
    }
  }
  for (let col = 0; col < 4; col++) {
    let pivot = col;
    for (let r = col + 1; r < 4; r++) if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    [m[col], m[pivot]] = [m[pivot], m[col]];
    if (Math.abs(m[col][col]) < 1e-12) return null;
    for (let r = 0; r < 4; r++) {
      if (r === col) continue;
      const f = m[r][col] / m[col][col];
      for (let k = col; k < 5; k++) m[r][k] -= f * m[col][k];
    }
  }
  const [a, b, c, d] = [0, 1, 2, 3].map((i) => m[i][4] / m[i][i]);
  const centre = new THREE.Vector3(-a / 2, -b / 2, -c / 2);
  const r2 = centre.lengthSq() - d;
  if (r2 <= 0) return null;
  return { centre: centre.add(c0), radius: Math.sqrt(r2) };
}

const _ab = new THREE.Vector3();
const _ap = new THREE.Vector3();
function distanceToSegment(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) {
  _ab.subVectors(b, a);
  const t = THREE.MathUtils.clamp(_ab.dot(_ap.subVectors(p, a)) / Math.max(1e-9, _ab.lengthSq()), 0, 1);
  return p.distanceTo(_ab.multiplyScalar(t).add(a));
}

interface SideRig {
  hip: THREE.Vector3;
  knee: THREE.Vector3;
  ankle: THREE.Vector3;
  mtp: THREE.Vector3;
  toeTip: THREE.Vector3;
  heel: THREE.Vector3;
  contacts: { point: THREE.Vector3; segment: Segment }[];
}

/** Joint centres and contact points, in normalised model units, from the bone geometry. */
function buildRig(bones: LegLayer, half: number) {
  const metre = 1 / half;
  const vert = (i: number) =>
    new THREE.Vector3(bones.positions[i * 3] / 32767, bones.positions[i * 3 + 1] / 32767, bones.positions[i * 3 + 2] / 32767);
  const points = (re: RegExp, side?: number) =>
    bones.layer.structures
      .filter((s) => re.test(s.name) && (side === undefined || sideOf(s.name) === side))
      .flatMap((s) => structureVertices(bones.indices, s).map(vert));

  const forward = centroid(points(/phalanx/i)).sub(centroid(points(/calcaneus/i)));
  forward.y = 0;
  forward.normalize();
  const lateral = new THREE.Vector3().crossVectors(UP, forward).normalize();
  const along = (p: THREE.Vector3) => p.dot(forward);
  const midline = (centroid(points(/femur/i, 0)).dot(lateral) + centroid(points(/femur/i, 1)).dot(lateral)) / 2;

  const sides: SideRig[] = [0, 1].map((side) => {
    const femur = points(/femur/i, side);
    const yMax = Math.max(...femur.map((p) => p.y));
    const yMin = Math.min(...femur.map((p) => p.y));
    // The femoral head is the medial half of the top of the femur (the trochanter is lateral).
    const top = femur.filter((p) => p.y > yMax - 0.05 * metre);
    const medialDistance = (p: THREE.Vector3) => Math.abs(p.dot(lateral) - midline);
    const sorted = top.map(medialDistance).sort((a, b) => a - b);
    const head = top.filter((p) => medialDistance(p) <= sorted[Math.floor(sorted.length / 2)]);
    const sphere = fitSphere(head);
    const hip = sphere && sphere.radius > 0.015 * metre && sphere.radius < 0.035 * metre ? sphere.centre : centroid(head);
    const knee = centroid(femur.filter((p) => p.y < yMin + 0.04 * metre));

    const talus = points(/talus/i, side);
    const talusTop = Math.max(...talus.map((p) => p.y));
    const ankle = centroid(talus).lerp(centroid(talus.filter((p) => p.y > talusTop - 0.015 * metre)), 0.5);

    const metatarsals = points(/metatarsal|sesamoid/i, side);
    const metMax = Math.max(...metatarsals.map(along));
    const mtp = centroid(metatarsals.filter((p) => along(p) > metMax - 0.015 * metre));
    const phalanges = points(/phalanx/i, side);
    const toeMax = Math.max(...phalanges.map(along));
    const toeTip = centroid(phalanges.filter((p) => along(p) > toeMax - 0.008 * metre));
    const calcaneus = points(/calcaneus/i, side);
    const heelMin = Math.min(...calcaneus.map(along));
    const heel = centroid(calcaneus.filter((p) => along(p) < heelMin + 0.015 * metre));

    const lowest = (pts: THREE.Vector3[]) => pts.reduce((a, b) => (b.y < a.y ? b : a));
    const contacts: SideRig['contacts'] = [
      { point: lowest(calcaneus.filter((p) => along(p) < heelMin + 0.03 * metre)), segment: 'foot' },
      { point: lowest(metatarsals.filter((p) => along(p) > metMax - 0.02 * metre)), segment: 'foot' },
      { point: lowest(phalanges.filter((p) => along(p) > toeMax - 0.02 * metre)), segment: 'toes' },
    ];
    return { hip, knee, ankle, mtp, toeTip, heel, contacts };
  });
  const midHip = sides[0].hip.clone().add(sides[1].hip).multiplyScalar(0.5);
  // Which side of the body sits on +lateral (used to put the camera on the right leg).
  const rightSign = Math.sign(sides[0].hip.dot(lateral) - midline) || 1;
  return { forward, lateral, sides, midHip, rightSign, metre };
}

type Rig = ReturnType<typeof buildRig>;

/** Skin weights: rigid for bones, blended across joints for soft tissue. */
function skinWeights(data: LegLayer, rig: Rig) {
  const count = data.layer.vertexCount;
  const skinIndex = new Uint16Array(count * 4);
  const skinWeight = new Float32Array(count * 4);

  if (data.layer.id === 'bones') {
    for (const s of data.layer.structures) {
      const segment = BONE_SEGMENT.find(([re]) => re.test(s.name))?.[1] ?? 'pelvis';
      const side = sideOf(s.name);
      const bone = side < 0 ? 0 : boneIndex(segment, side);
      for (const v of structureVertices(data.indices, s)) {
        skinIndex[v * 4] = bone;
        skinWeight[v * 4] = 1;
      }
    }
    return { skinIndex, skinWeight };
  }

  const { metre, sides, midHip } = rig;
  const raise = UP.clone().multiplyScalar(0.06 * metre);
  const capsules: { bone: number; a: THREE.Vector3; b: THREE.Vector3; r: number }[] = [
    { bone: 0, a: sides[0].hip.clone().add(raise), b: sides[1].hip.clone().add(raise), r: 0.06 * metre },
    { bone: 0, a: midHip.clone().add(raise), b: midHip.clone().addScaledVector(UP, 0.2 * metre), r: 0.07 * metre },
  ];
  sides.forEach((s, side) => {
    capsules.push(
      { bone: boneIndex('thigh', side), a: s.hip, b: s.knee, r: 0 },
      { bone: boneIndex('shank', side), a: s.knee, b: s.ankle, r: 0 },
      { bone: boneIndex('foot', side), a: s.heel, b: s.mtp, r: 0 },
      { bone: boneIndex('foot', side), a: s.ankle, b: s.mtp, r: 0 },
      { bone: boneIndex('toes', side), a: s.mtp, b: s.toeTip, r: 0 },
    );
  });
  const sigma = 0.012 * metre;
  const p = new THREE.Vector3();
  const best = new Map<number, number>();
  for (let v = 0; v < count; v++) {
    p.set(data.positions[v * 3] / 32767, data.positions[v * 3 + 1] / 32767, data.positions[v * 3 + 2] / 32767);
    best.clear();
    let dMin = Infinity;
    for (const c of capsules) {
      const d = distanceToSegment(p, c.a, c.b) - c.r;
      if (d < (best.get(c.bone) ?? Infinity)) best.set(c.bone, d);
      dMin = Math.min(dMin, d);
    }
    const ranked = [...best.entries()]
      .map(([bone, d]) => [bone, Math.exp(-(d - dMin) / sigma)] as const)
      .filter(([, w]) => w > 0.03)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    const total = ranked.reduce((sum, [, w]) => sum + w, 0);
    ranked.forEach(([bone, w], i) => {
      skinIndex[v * 4 + i] = bone;
      skinWeight[v * 4 + i] = w / total;
    });
  }
  return { skinIndex, skinWeight };
}

function trackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#3a1a12';
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(40, 0, 6, 512);
  ctx.fillRect(466, 0, 6, 512);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let y = 0; y < 512; y += 64) ctx.fillRect(46, y, 420, 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function fadeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, '#000000');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

export default function RunningLegModel(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const propsRef = useRef(props);
  propsRef.current = props;
  const applyRef = useRef<() => void>(() => {});

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setStatus('error');
      setError('3D view needs WebGL, which this browser has disabled.');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.display = 'block';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, el.clientWidth / el.clientHeight, 0.05, 30);
    scene.add(new THREE.HemisphereLight(0xfff4ec, 0x1a1a22, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(1.5, 2, 2.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff8a5c, 1.4);
    rim.position.set(-2, 1, -2);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0x9fb8ff, 0.5);
    fill.position.set(-1.5, -0.5, 2);
    scene.add(fill);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 0.6;
    controls.maxDistance = 5;
    controls.minPolarAngle = 0.3;
    controls.maxPolarAngle = Math.PI - 0.3;

    const root = new THREE.Group();
    scene.add(root);

    const meshes = new Map<LayerId, THREE.SkinnedMesh>();
    const layerData = new Map<LayerId, ManifestLayer>();
    const materials = new Map<LayerId, THREE.MeshStandardMaterial>();
    const activityUniform = { value: new Float32Array(16) };
    const activityOn = { value: 0 };
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb08f,
      emissive: 0xff4f21,
      emissiveIntensity: 0.65,
      roughness: 0.4,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    let highlight: THREE.SkinnedMesh | null = null;
    let highlighted: Structure | null = null;
    let skeleton: THREE.Skeleton | null = null;
    let rig: Rig | null = null;
    const bones: THREE.Bone[] = [];
    const contacts: { obj: THREE.Object3D; side: number }[] = [];
    let restContactY = 0;
    const rootRest = new THREE.Vector3();
    let floor: THREE.Mesh | null = null;
    let floorTexture: THREE.Texture | null = null;
    const textures: THREE.Texture[] = [];

    // Camera framing per view, tweened.
    const desired = { dir: new THREE.Vector3(1, 0, 0), distance: 2.6, target: new THREE.Vector3(0, -0.03, 0) };
    let tweening = false;
    let currentView: RunView | null = null;
    const viewDir = (view: RunView) => {
      if (!rig) return new THREE.Vector3(1, 0.1, 0).normalize();
      const right = rig.lateral.clone().multiplyScalar(rig.rightSign);
      if (view === 'side') return right.addScaledVector(UP, 0.08).normalize();
      if (view === 'front') return rig.forward.clone().addScaledVector(UP, 0.12).normalize();
      if (view === 'back') return rig.forward.clone().negate().addScaledVector(UP, 0.12).normalize();
      return right.addScaledVector(rig.forward, 0.9).addScaledVector(UP, 0.25).normalize();
    };
    const fitDistance = () => {
      const halfV = THREE.MathUtils.degToRad(camera.fov / 2);
      const halfH = Math.atan(Math.tan(halfV) * camera.aspect);
      // Height ≈ 1.2 m; the stride spans ≈ 1.5 m at full extension.
      return Math.max(0.66 / Math.tan(halfV), 0.8 / Math.tan(halfH));
    };

    const clearHighlight = () => {
      if (highlight) {
        root.remove(highlight);
        highlight.geometry.dispose();
        highlight = null;
      }
      highlighted = null;
    };

    const apply = () => {
      const { visible: v, xray: x, activity, view } = propsRef.current;
      meshes.forEach((mesh, id) => (mesh.visible = v[id]));
      const muscle = materials.get('muscles');
      if (muscle) {
        muscle.transparent = x;
        muscle.opacity = x ? 0.22 : 1;
        muscle.depthWrite = !x;
        muscle.needsUpdate = true;
      }
      activityOn.value = activity ? 1 : 0;
      if (highlight && !v[highlight.userData.layer as LayerId]) clearHighlight();
      if (view !== currentView && rig) {
        currentView = view;
        desired.dir.copy(viewDir(view));
        desired.distance = fitDistance();
        tweening = true;
      }
    };
    applyRef.current = apply;

    const setHighlight = (layerId: LayerId, s: Structure) => {
      if (highlighted === s || !skeleton) return;
      clearHighlight();
      const source = meshes.get(layerId);
      if (!source) return;
      const g = new THREE.BufferGeometry();
      for (const name of ['position', 'normal', 'skinIndex', 'skinWeight']) g.setAttribute(name, source.geometry.getAttribute(name));
      const index = source.geometry.getIndex()!;
      const ArrayType = index.array.constructor as Uint16ArrayConstructor | Uint32ArrayConstructor;
      const start = s.triStart * 3;
      g.setIndex(new THREE.BufferAttribute(new ArrayType(index.array.subarray(start, start + s.triCount * 3)), 1));
      highlight = new THREE.SkinnedMesh(g, highlightMaterial);
      highlight.bind(skeleton, source.bindMatrix);
      highlight.frustumCulled = false;
      highlight.userData.layer = layerId;
      highlight.renderOrder = 10;
      root.add(highlight);
      highlighted = s;
    };

    // Picking skinned meshes is costly, so hover picks only while paused; taps always pick.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pendingPick: { x: number; y: number } | null = null;
    let dragging = false;
    let downAt: { x: number; y: number } | null = null;
    const pick = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const { visible: v, xray: x } = propsRef.current;
      const targets = [...meshes.entries()].filter(([id]) => v[id] && !(x && id === 'muscles')).map(([, m]) => m);
      const hit = raycaster.intersectObjects(targets, false)[0];
      if (!hit || hit.faceIndex == null) {
        clearHighlight();
        propsRef.current.onHover?.(null);
        return;
      }
      const layerId = hit.object.userData.layer as LayerId;
      const s = structureAt(layerData.get(layerId)!.structures, hit.faceIndex);
      if (!s) return;
      setHighlight(layerId, s);
      propsRef.current.onHover?.({ name: s.name, layer: layerId });
    };
    const onPointerDown = (e: PointerEvent) => {
      downAt = { x: e.clientX, y: e.clientY };
      dragging = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 4) dragging = true;
      if (e.pointerType === 'mouse' && !e.buttons && !propsRef.current.playing) pendingPick = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) pendingPick = { x: e.clientX, y: e.clientY };
      downAt = null;
    };
    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || downAt || propsRef.current.playing) return;
      pendingPick = null;
      clearHighlight();
      propsRef.current.onHover?.(null);
    };
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);

    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    io.observe(el);
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (rig) {
        desired.distance = fitDistance();
        desired.dir.copy(camera.position).sub(controls.target).normalize();
        tweening = true;
      }
    });
    ro.observe(el);

    // Pose both legs for a phase of the right leg, keep the lowest foot on the track.
    const contactPoint = new THREE.Vector3();
    const lastAlong = [NaN, NaN];
    let floorTravel = 0;
    let groundSpeed = 0;
    const pose = (phase: number, dt: number, playing: boolean) => {
      if (!rig || !floor) return;
      const phases = [phase, (phase + 0.5) % 1];
      phases.forEach((p, side) => {
        const k = leg(p);
        bones[boneIndex('thigh', side)].quaternion.setFromAxisAngle(rig!.lateral, -k.thigh * RAD);
        bones[boneIndex('shank', side)].quaternion.setFromAxisAngle(rig!.lateral, k.kneeFlex * RAD);
        bones[boneIndex('foot', side)].quaternion.setFromAxisAngle(rig!.lateral, k.plantar * RAD);
        bones[boneIndex('toes', side)].quaternion.setFromAxisAngle(rig!.lateral, -k.toe * RAD);
      });
      // Pelvis turns with the swinging leg.
      bones[0].quaternion.setFromAxisAngle(UP, -rig.rightSign * 4 * RAD * Math.cos(2 * Math.PI * (phase - 0.8)));
      bones[0].position.copy(rootRest);
      root.updateMatrixWorld(true);

      let lowest = Infinity;
      // Mean position of each foot's contact points along the direction of travel.
      const along = [0, 0];
      const counts = [0, 0];
      for (const c of contacts) {
        root.worldToLocal(c.obj.getWorldPosition(contactPoint));
        lowest = Math.min(lowest, contactPoint.y);
        along[c.side] += contactPoint.dot(rig.forward);
        counts[c.side]++;
      }
      const stanceAlong = phases.map((p, side) => (p < TOE_OFF ? along[side] / counts[side] : NaN));
      const flight = 0.02 * rig.metre * (bump(phase, 0.4, 0.07) + bump(phase, 0.9, 0.07));
      bones[0].position.y += restContactY - lowest + flight;

      // The track moves with the planted foot, so the foot never slides.
      if (playing && dt > 0) {
        const side = phases[0] < TOE_OFF ? 0 : phases[1] < TOE_OFF ? 1 : -1;
        if (side >= 0 && !Number.isNaN(lastAlong[side])) {
          const dx = stanceAlong[side] - lastAlong[side];
          floorTravel += dx;
          groundSpeed = THREE.MathUtils.lerp(groundSpeed, dx / dt, 0.2);
        } else if (side < 0) floorTravel += groundSpeed * dt;
      }
      lastAlong[0] = stanceAlong[0];
      lastAlong[1] = stanceAlong[1];
      if (floorTexture) floorTexture.offset.y = -floorTravel / floor.userData.tile;

      phases.forEach((p, side) => {
        for (const g of MUSCLE_GROUPS) activityUniform.value[g.id + side * 8] = g.act(p);
      });
    };

    const offset = new THREE.Vector3();
    let raf = 0;
    let last = performance.now();
    let phase = propsRef.current.phase;
    let lastReport = 0;
    let lastPick = 0;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;
      if (!onScreen || !rig) return;
      const { playing, speed, onFrame } = propsRef.current;
      if (playing) phase = (phase + (dt * speed) / STRIDE_SECONDS) % 1;
      else phase = propsRef.current.phase;
      pose(phase, dt * speed, playing);

      if (tweening) {
        offset.subVectors(camera.position, controls.target);
        const length = THREE.MathUtils.lerp(offset.length(), desired.distance, 0.1);
        offset.normalize().lerp(desired.dir, 0.1).normalize();
        controls.target.lerp(desired.target, 0.1);
        camera.position.copy(controls.target).addScaledVector(offset, length);
        if (Math.abs(length - desired.distance) < 0.005 && offset.distanceTo(desired.dir) < 0.005) tweening = false;
      }
      controls.update();
      if (pendingPick && time - lastPick > 80) {
        pick(pendingPick.x, pendingPick.y);
        pendingPick = null;
        lastPick = time;
      }
      renderer.render(scene, camera);

      if (onFrame && time - lastReport > 100) {
        lastReport = time;
        const k = leg(phase);
        const activity: Record<string, number> = {};
        for (const g of MUSCLE_GROUPS) activity[g.name] = g.act(phase);
        onFrame({ phase, phaseName: phaseName(phase), hip: k.thigh, knee: k.kneeFlex, ankle: k.plantar, activity });
      }
    };
    raf = requestAnimationFrame(loop);

    const abort = new AbortController();
    let disposed = false;
    (async () => {
      try {
        const { manifest, layers } = await loadLeg(abort.signal);
        if (disposed) return;
        const bonesLayer = layers.find((l) => l.layer.id === 'bones');
        if (!bonesLayer) throw new Error('The anatomy model has no skeleton.');
        rig = buildRig(bonesLayer, manifest.half);
        root.scale.setScalar(manifest.half);

        // Skeleton.
        const pelvis = new THREE.Bone();
        pelvis.position.copy(rig.midHip);
        rootRest.copy(rig.midHip);
        bones.push(pelvis);
        rig.sides.forEach((s) => {
          const joints = [s.hip, s.knee, s.ankle, s.mtp];
          let parent = pelvis;
          let parentAt = rig!.midHip;
          for (const at of joints) {
            const bone = new THREE.Bone();
            bone.position.subVectors(at, parentAt);
            parent.add(bone);
            bones.push(bone);
            parent = bone;
            parentAt = at;
          }
        });
        root.add(pelvis);
        rig.sides.forEach((s, side) => {
          for (const c of s.contacts) {
            const obj = new THREE.Object3D();
            const joint = c.segment === 'toes' ? s.mtp : s.ankle;
            obj.position.subVectors(c.point, joint);
            bones[boneIndex(c.segment, side)].add(obj);
            contacts.push({ obj, side });
          }
        });
        root.updateMatrixWorld(true);
        skeleton = new THREE.Skeleton(bones);
        restContactY = Math.min(...rig.sides.flatMap((s) => s.contacts.map((c) => c.point.y)));

        const byLayer = {} as Record<LayerId, number>;
        let structures = 0;
        let floorY = Infinity;
        for (const data of layers) {
          const { layer, positions, normals, indices } = data;
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.BufferAttribute(positions, 3, true));
          g.setAttribute('normal', new THREE.BufferAttribute(normals, 3, true));
          g.setIndex(new THREE.BufferAttribute(indices, 1));
          const { skinIndex, skinWeight } = skinWeights(data, rig);
          g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
          g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
          for (let i = 1; i < positions.length; i += 3) floorY = Math.min(floorY, positions[i] / 32767);

          const vessel = layer.id === 'arteries' || layer.id === 'veins';
          const material = new THREE.MeshStandardMaterial({
            color: LAYER_STYLES[layer.id].color,
            roughness: layer.id === 'bones' ? 0.75 : vessel ? 0.35 : 0.55,
            metalness: 0,
            emissive: vessel ? LAYER_STYLES[layer.id].color : 0x000000,
            emissiveIntensity: vessel ? 0.18 : 0,
          });
          if (layer.id === 'muscles') {
            // Per-vertex muscle group (+8 for the left side) looks up its live activation.
            const group = new Float32Array(layer.vertexCount);
            for (const s of layer.structures) {
              const match = MUSCLE_GROUPS.find((m) => m.match.test(s.name));
              const side = sideOf(s.name);
              if (!match || side < 0) continue;
              for (const v of structureVertices(indices, s)) group[v] = match.id + side * 8;
            }
            g.setAttribute('aGroup', new THREE.BufferAttribute(group, 1));
            material.onBeforeCompile = (shader) => {
              shader.uniforms.uAct = activityUniform;
              shader.uniforms.uActOn = activityOn;
              shader.vertexShader = shader.vertexShader
                .replace('#include <common>', '#include <common>\nattribute float aGroup;\nuniform float uAct[16];\nvarying float vAct;')
                .replace('#include <begin_vertex>', '#include <begin_vertex>\nvAct = uAct[int(aGroup + 0.5)];');
              shader.fragmentShader = shader.fragmentShader
                .replace('#include <common>', '#include <common>\nuniform float uActOn;\nvarying float vAct;')
                .replace(
                  '#include <emissivemap_fragment>',
                  // Working muscle shifts to a saturated orange; resting muscle dims a little.
                  '#include <emissivemap_fragment>\n' +
                    'float act = vAct * uActOn;\n' +
                    'diffuseColor.rgb = mix(diffuseColor.rgb * (1.0 - uActOn * 0.35), vec3(1.0, 0.32, 0.05), act * 0.75);\n' +
                    'totalEmissiveRadiance += vec3(0.9, 0.18, 0.02) * act * 0.35;',
                );
            };
          }
          const mesh = new THREE.SkinnedMesh(g, material);
          mesh.userData.layer = layer.id;
          mesh.renderOrder = layer.id === 'muscles' ? 5 : 0;
          mesh.frustumCulled = false;
          root.add(mesh);
          mesh.bind(skeleton);
          // Raycasts test this sphere first; make it cover every pose.
          mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
          meshes.set(layer.id, mesh);
          materials.set(layer.id, material);
          layerData.set(layer.id, layer);
          byLayer[layer.id] = layer.structures.length;
          structures += layer.structures.length;
        }

        // Track under the runner, scrolling with the stance foot.
        const size = 6;
        floorTexture = trackTexture();
        floorTexture.repeat.set(1, 4);
        const fade = fadeTexture();
        textures.push(floorTexture, fade);
        floor = new THREE.Mesh(
          new THREE.PlaneGeometry(size * 0.25, size),
          new THREE.MeshBasicMaterial({ map: floorTexture, alphaMap: fade, transparent: true, depthWrite: false }),
        );
        floor.userData.tile = size / 4;
        floor.rotation.order = 'YXZ';
        floor.rotation.set(-Math.PI / 2, Math.atan2(-rig.forward.x, -rig.forward.z), 0);
        floor.position.y = floorY - 0.002;
        root.add(floor);

        apply();
        camera.position.copy(desired.target).addScaledVector(viewDir(propsRef.current.view), fitDistance());
        controls.target.copy(desired.target);
        setStatus('ready');
        propsRef.current.onLoaded?.({ structures, byLayer });
      } catch (e) {
        if (disposed || (e instanceof DOMException && e.name === 'AbortError')) return;
        setStatus('error');
        setError(e instanceof Error ? e.message : 'The anatomy model could not be loaded.');
      }
    })();

    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      controls.dispose();
      clearHighlight();
      meshes.forEach((m) => m.geometry.dispose());
      materials.forEach((m) => m.dispose());
      highlightMaterial.dispose();
      skeleton?.dispose();
      if (floor) {
        floor.geometry.dispose();
        (floor.material as THREE.Material).dispose();
      }
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  useEffect(() => {
    applyRef.current();
  }, [props.visible, props.xray, props.activity, props.view]);

  return (
    <div className="absolute inset-0">
      {/* data-lenis-prevent keeps smooth scrolling from eating wheel zoom */}
      <div ref={containerRef} data-lenis-prevent className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      {status !== 'ready' && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
          {status === 'loading' ? (
            <>
              <div className="h-8 w-8 rounded-full border-2 border-white/15 border-t-[#FF4F21] animate-spin" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Loading anatomy</p>
            </>
          ) : (
            <p className="text-sm text-white/70 max-w-xs">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
