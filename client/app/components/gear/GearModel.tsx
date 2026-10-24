'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildProduct } from './models';
import type { HoveredPart, ProductId } from './products';

interface Props {
  product: ProductId;
  exploded: boolean;
  onHover?: (part: HoveredPart | null) => void;
}

// Camera direction per product (normalised); matches the angles of the concept sheet.
const VIEW: Record<ProductId, [number, number, number]> = {
  sleeve: [2.1, 0.35, 1.25],
  insole: [1.25, 1.35, 1.7],
  pod: [1.1, 1.05, 1.8],
};
const FIT_SIZE = 1.6; // every product is scaled so its largest side is this long
const CALLOUT_MIN_WIDTH = 640; // narrower stages show only the hover readout
const LABEL_WIDTH = 190;
const LABEL_GAP = 44;

interface Callout {
  label: string;
  sub?: string;
  obj: THREE.Object3D;
  el: HTMLDivElement;
  line: SVGPolylineElement;
  dot: SVGCircleElement;
}

function contactShadow(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/** Nearest ancestor (or self) carrying a part label. */
function labelled(o: THREE.Object3D | null): THREE.Object3D | null {
  while (o && !o.userData.label) o = o.parent;
  return o;
}

export default function GearModel({ product, exploded, onHover }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState('');
  const propsRef = useRef({ product, exploded, onHover });
  propsRef.current = { product, exploded, onHover };
  const applyRef = useRef<() => void>(() => {});

  useEffect(() => {
    const el = containerRef.current;
    const overlay = overlayRef.current;
    const svg = svgRef.current;
    if (!el || !overlay || !svg) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setError('3D view needs WebGL, which this browser has disabled.');
      return;
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.display = 'block';
    el.appendChild(renderer.domElement);

    // Dark studio: soft environment reflections plus key and rim lights to pull black products off the backdrop.
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.55;
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(2.5, 3, 2.5);
    scene.add(key);
    const rimLeft = new THREE.DirectionalLight(0xcfdcff, 2.6);
    rimLeft.position.set(-3, 1.5, -2);
    scene.add(rimLeft);
    const rimRight = new THREE.DirectionalLight(0xffffff, 1.6);
    rimRight.position.set(3, 0.5, -3);
    scene.add(rimRight);
    const fill = new THREE.DirectionalLight(0xffe2d2, 0.5);
    fill.position.set(-1, -0.5, 3);
    scene.add(fill);

    const camera = new THREE.PerspectiveCamera(28, el.clientWidth / el.clientHeight, 0.05, 50);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false; // keep the wheel for page scrolling
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 1.1;
    // OrbitControls sets touch-action: none; let vertical swipes keep scrolling the page.
    renderer.domElement.style.touchAction = 'pan-y';

    const shadow = contactShadow();
    scene.add(shadow);

    const setExplode = (root: THREE.Object3D, amount: number) =>
      root.traverse((o) => {
        if (o.userData.home && o.userData.explode) o.position.copy(o.userData.home).addScaledVector(o.userData.explode, amount);
        if (o.userData.internal) o.visible = amount > 0.02;
      });
    // Bounding sphere of a product at a given explode amount, for camera framing.
    const sphereAt = (root: THREE.Object3D, amount: number) => {
      setExplode(root, amount);
      root.updateMatrixWorld(true);
      return new THREE.Box3().setFromObject(root).getBoundingSphere(new THREE.Sphere());
    };

    // Build each product once, normalised to the same on-screen size.
    const roots = new Map<ProductId, THREE.Group>();
    const pickables = new Map<ProductId, THREE.Mesh[]>();
    const calloutTargets = new Map<ProductId, { label: string; sub?: string; obj: THREE.Object3D }[]>();
    const pulsing: THREE.MeshStandardMaterial[] = [];
    const replaced = new Set<THREE.Material>(); // originals swapped for per-mesh clones
    for (const id of ['sleeve', 'insole', 'pod'] as ProductId[]) {
      const model = buildProduct(id);
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = FIT_SIZE / Math.max(size.x, size.y, size.z);
      model.position.copy(center).multiplyScalar(-scale);
      model.scale.setScalar(scale);
      const root = new THREE.Group();
      root.add(model);
      root.visible = false;
      root.userData.floor = -(size.y * scale) / 2;
      root.userData.footprint = Math.max(size.x, size.z) * scale;
      scene.add(root);
      roots.set(id, root);

      const meshes: THREE.Mesh[] = [];
      const targets: { label: string; sub?: string; obj: THREE.Object3D }[] = [];
      const seen = new Set<string>();
      model.traverse((o) => {
        const owner = labelled(o);
        if (owner === o && !seen.has(o.userData.label) && o.userData.callout !== false) {
          seen.add(o.userData.label);
          targets.push({ label: o.userData.label, sub: o.userData.sub, obj: o });
        }
        if (!(o instanceof THREE.Mesh) || !owner) return;
        // Own material per mesh so highlighting one part never lights up another.
        const materials = (Array.isArray(o.material) ? o.material : [o.material]) as THREE.MeshStandardMaterial[];
        const clones = materials.map((m) => {
          replaced.add(m);
          const c = m.clone();
          c.userData.baseEmissive = c.emissive.clone();
          c.userData.baseIntensity = c.emissiveIntensity;
          return c;
        });
        o.material = Array.isArray(o.material) ? clones : clones[0];
        o.userData.pickLabel = owner.userData.label;
        o.userData.pickSub = owner.userData.sub;
        meshes.push(o);
        if (o.userData.pulse) pulsing.push(clones[0]);
      });
      pickables.set(id, meshes);
      calloutTargets.set(id, targets);

      const explodedSphere = sphereAt(root, 1);
      const assembledSphere = sphereAt(root, 0); // measured last so the model is left assembled
      root.userData.spheres = [assembledSphere, explodedSphere];
    }

    let active: ProductId | null = null;
    let explodeAmount = 0;
    let highlightedLabel: string | null = null;
    let callouts: Callout[] = [];
    let spin = !reducedMotion; // auto-rotate until the visitor grabs the model

    // Every mesh of the hovered part lights up together.
    const setHighlight = (label: string | null) => {
      if (highlightedLabel === label || !active) return;
      for (const mesh of pickables.get(active)!) {
        const on = label !== null && mesh.userData.pickLabel === label;
        for (const m of (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshStandardMaterial[]) {
          m.emissive.copy(on ? new THREE.Color(0xff4f21) : m.userData.baseEmissive);
          m.emissiveIntensity = on ? Math.max(0.45, m.userData.baseIntensity) : m.userData.baseIntensity;
          m.userData.highlighted = on;
        }
      }
      for (const c of callouts) c.el.dataset.active = String(c.label === label);
      highlightedLabel = label;
    };

    const buildCallouts = (id: ProductId) => {
      for (const c of callouts) {
        c.el.remove();
        c.line.remove();
        c.dot.remove();
      }
      callouts = calloutTargets.get(id)!.map((t) => {
        const div = document.createElement('div');
        div.className = 'gear-callout';
        div.innerHTML = `<div class="gear-callout-title"></div>${t.sub ? '<div class="gear-callout-sub"></div>' : ''}`;
        (div.firstChild as HTMLElement).textContent = t.label;
        if (t.sub) (div.lastChild as HTMLElement).textContent = `(${t.sub})`;
        overlay.appendChild(div);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('r', '2.5');
        svg.append(line, dot);
        return { ...t, el: div, line, dot };
      });
    };

    const showCallouts = () => el.clientWidth >= CALLOUT_MIN_WIDTH;

    // Fit the bounding sphere inside the narrower field of view. With callouts the
    // model shifts left to leave the right-hand column for labels.
    const frame = (id: ProductId, isExploded: boolean, dir?: THREE.Vector3) => {
      const sphere: THREE.Sphere = roots.get(id)!.userData.spheres[isExploded ? 1 : 0];
      const d = (dir ?? new THREE.Vector3(...VIEW[id])).clone().normalize();
      const withLabels = isExploded && showCallouts();
      const aspect = withLabels ? camera.aspect * (1 - (LABEL_WIDTH + 70) / el.clientWidth) : camera.aspect;
      const halfV = THREE.MathUtils.degToRad(camera.fov / 2);
      const halfH = Math.atan(Math.tan(halfV) * aspect);
      const distance = (sphere.radius * (isExploded ? 1.04 : 1.14)) / Math.sin(Math.min(halfV, halfH));
      const center = sphere.center.clone();
      if (withLabels) {
        const right = new THREE.Vector3().crossVectors(d.clone().negate(), new THREE.Vector3(0, 1, 0)).normalize();
        const visibleHalfWidth = Math.tan(Math.atan(Math.tan(halfV) * camera.aspect)) * distance;
        center.addScaledVector(right, visibleHalfWidth * ((LABEL_WIDTH + 70) / el.clientWidth));
      }
      return { dir: d, distance, center };
    };

    let desired = { dir: new THREE.Vector3(...VIEW.sleeve).normalize(), distance: 4, center: new THREE.Vector3() };
    let tween = false;
    const currentDir = () => camera.position.clone().sub(controls.target).normalize();

    const apply = () => {
      const { product: p, exploded: x } = propsRef.current;
      if (p !== active) {
        setHighlight(null);
        propsRef.current.onHover?.(null);
        roots.forEach((root, id) => (root.visible = id === p));
        const root = roots.get(p)!;
        shadow.position.y = root.userData.floor - 0.01;
        shadow.scale.setScalar(root.userData.footprint * 1.6);
        // Start the incoming product assembled; the loop animates it to the current state.
        setExplode(root, 0);
        explodeAmount = 0;
        const first = active === null;
        active = p;
        buildCallouts(p);
        desired = frame(p, x);
        if (first) {
          controls.target.copy(desired.center);
          camera.position.copy(desired.center).addScaledVector(desired.dir, desired.distance);
        } else tween = true;
      } else {
        desired = frame(p, x, x ? undefined : currentDir());
        tween = true;
      }
    };
    applyRef.current = apply;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pending: { x: number; y: number } | null = null;
    let downAt: { x: number; y: number } | null = null;
    let dragging = false;
    const pick = (cx: number, cy: number) => {
      if (!active) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const visible = pickables.get(active)!.filter((m) => {
        for (let o: THREE.Object3D | null = m; o; o = o.parent) if (!o.visible) return false;
        return true;
      });
      const hit = raycaster.intersectObjects(visible, false)[0];
      const label = (hit?.object.userData.pickLabel as string | undefined) ?? null;
      setHighlight(label);
      propsRef.current.onHover?.(label ? { label, sub: hit!.object.userData.pickSub } : null);
    };
    const onDown = (e: PointerEvent) => {
      downAt = { x: e.clientX, y: e.clientY };
      dragging = false;
      spin = false;
    };
    const onMove = (e: PointerEvent) => {
      if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 4) dragging = true;
      if (e.pointerType === 'mouse' && !e.buttons) pending = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) pending = { x: e.clientX, y: e.clientY };
      downAt = null;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || downAt) return;
      pending = null;
      setHighlight(null);
      propsRef.current.onHover?.(null);
    };
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onLeave);

    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    io.observe(el);
    const ro = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return;
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      if (active) {
        desired = frame(active, propsRef.current.exploded, currentDir());
        tween = true;
      }
    });
    ro.observe(el);

    apply();

    // Project each callout's part, then stack the labels down the right-hand column.
    const box = new THREE.Box3();
    const corner = new THREE.Vector3();
    const layoutCallouts = () => {
      const fade = THREE.MathUtils.smoothstep(explodeAmount, 0.6, 1);
      const show = fade > 0.01 && showCallouts();
      overlay.style.opacity = show ? String(fade) : '0';
      if (!show) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const labelX = w - LABEL_WIDTH - 18;
      const items = callouts.map((c) => {
        box.setFromObject(c.obj);
        let maxX = -Infinity;
        let sumY = 0;
        for (let i = 0; i < 8; i++) {
          corner.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera);
          maxX = Math.max(maxX, ((corner.x + 1) / 2) * w);
          sumY += ((1 - corner.y) / 2) * h;
        }
        box.getCenter(corner).project(camera);
        const cx = ((corner.x + 1) / 2) * w;
        const cy = ((1 - corner.y) / 2) * h;
        // Anchor between the part's centre and its right edge so the line lands on the part.
        return { c, ax: THREE.MathUtils.lerp(cx, maxX, 0.6), ay: THREE.MathUtils.lerp(cy, sumY / 8, 0.3), y: 0 };
      });
      items.sort((a, b) => a.ay - b.ay);
      let prev = -Infinity;
      for (const it of items) {
        it.y = Math.max(it.ay - 14, prev + LABEL_GAP, 14);
        prev = it.y;
      }
      // If the stack overflows the bottom, push it back up.
      let next = h - 14 - 34;
      for (let i = items.length - 1; i >= 0; i--) {
        items[i].y = Math.min(items[i].y, next);
        next = items[i].y - LABEL_GAP;
      }
      for (const { c, ax, ay, y } of items) {
        c.el.style.transform = `translate(${labelX}px, ${y}px)`;
        const ly = y + 9;
        const x = Math.min(ax, labelX - 36);
        c.line.setAttribute('points', `${x},${ay} ${labelX - 28},${ly} ${labelX - 8},${ly}`);
        c.dot.setAttribute('cx', String(x));
        c.dot.setAttribute('cy', String(ay));
      }
    };

    const offset = new THREE.Vector3();
    let raf = 0;
    let lastPick = 0;
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!onScreen || !active) return;

      const target = propsRef.current.exploded ? 1 : 0;
      if (Math.abs(explodeAmount - target) > 0.001) {
        explodeAmount = THREE.MathUtils.lerp(explodeAmount, target, 0.09);
        if (Math.abs(explodeAmount - target) <= 0.001) explodeAmount = target;
        setExplode(roots.get(active)!, explodeAmount);
      }
      if (tween) {
        offset.subVectors(camera.position, controls.target);
        const length = THREE.MathUtils.lerp(offset.length(), desired.distance, 0.1);
        offset.normalize().lerp(desired.dir, 0.08).normalize();
        controls.target.lerp(desired.center, 0.1);
        camera.position.copy(controls.target).addScaledVector(offset, length);
        if (Math.abs(length - desired.distance) < 0.005 && offset.distanceTo(desired.dir) < 0.01 && controls.target.distanceTo(desired.center) < 0.003) tween = false;
      }
      const pulse = 1.6 + Math.sin(time / 420) * 1.1;
      for (const m of pulsing) if (!m.userData.highlighted) m.emissiveIntensity = pulse;
      // Hold still while labels are up so they stay readable.
      controls.autoRotate = spin && !(propsRef.current.exploded && showCallouts());
      controls.update();
      if (pending && time - lastPick > 50) {
        pick(pending.x, pending.y);
        pending = null;
        lastPick = time;
      }
      renderer.render(scene, camera);
      layoutCallouts();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      controls.dispose();
      for (const c of callouts) {
        c.el.remove();
        c.line.remove();
        c.dot.remove();
      }
      const disposeMaterial = (m: THREE.Material) => {
        const s = m as THREE.MeshStandardMaterial;
        s.map?.dispose();
        s.bumpMap?.dispose();
        m.dispose();
      };
      scene.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        o.geometry.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(disposeMaterial);
      });
      replaced.forEach(disposeMaterial);
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  useEffect(() => {
    applyRef.current();
  }, [product, exploded]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      <svg ref={svgRef} className="gear-callout-lines pointer-events-none absolute inset-0 h-full w-full" />
      <div ref={overlayRef} className="pointer-events-none absolute inset-0 transition-opacity duration-200" style={{ opacity: 0 }} />
      <style>{`
        .gear-callout { position: absolute; left: 0; top: 0; width: ${LABEL_WIDTH}px; line-height: 1.25; }
        .gear-callout-title { font-size: 12.5px; font-weight: 600; color: #f2f2f5; transition: color .15s; }
        .gear-callout-sub { font-size: 10.5px; color: rgba(255,255,255,0.5); margin-top: 1px; }
        .gear-callout[data-active="true"] .gear-callout-title { color: #ff6a3d; }
        .gear-callout-lines polyline { fill: none; stroke: rgba(255,255,255,0.42); stroke-width: 1; }
        .gear-callout-lines circle { fill: #ffffff; }
      `}</style>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/60">{error}</div>
      )}
    </div>
  );
}
