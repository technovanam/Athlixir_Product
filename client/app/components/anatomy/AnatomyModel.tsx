'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LAYER_STYLES } from './layers';
import type { AnatomyStats, FocusId, HoveredStructure, LayerId } from './layers';
import { loadLeg, structureAt } from './loadLeg';
import type { ManifestLayer, Structure } from './loadLeg';

interface Props {
  visible: Record<LayerId, boolean>;
  xray: boolean;
  focus: FocusId;
  onLoaded?: (stats: AnatomyStats) => void;
  onHover?: (structure: HoveredStructure | null) => void;
}

// Camera targets in model space (metres, origin at the asset centre, Y-up).
// The asset spans roughly y = -0.53 (sole) to +0.53 (iliac crest).
const FOCUS: Record<FocusId, { target: [number, number, number]; distance: number }> = {
  full: { target: [0, -0.05, 0], distance: 2.35 },
  hip: { target: [0, 0.38, 0], distance: 1.05 },
  knee: { target: [0, -0.1, 0], distance: 0.95 },
  foot: { target: [0, -0.47, 0.03], distance: 0.8 },
};

export default function AnatomyModel({ visible, xray, focus, onLoaded, onHover }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');

  // Live values read by the render loop without re-creating the scene.
  const propsRef = useRef({ visible, xray, focus, onLoaded, onHover });
  propsRef.current = { visible, xray, focus, onLoaded, onHover };
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

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.display = 'block';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, el.clientWidth / el.clientHeight, 0.05, 20);
    camera.position.set(1.15, 0.25, 2.25);

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
    // Wheel zoom would hijack page scrolling on the landing page; focus presets zoom instead.
    controls.enableZoom = false;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI - 0.35;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 1.1;
    // OrbitControls sets touch-action: none; let vertical swipes keep scrolling the page.
    renderer.domElement.style.touchAction = 'pan-y';

    const root = new THREE.Group();
    scene.add(root);

    const meshes = new Map<LayerId, THREE.Mesh>();
    const layerData = new Map<LayerId, ManifestLayer>();
    const materials = new Map<LayerId, THREE.MeshStandardMaterial>();
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb08f,
      emissive: 0xff4f21,
      emissiveIntensity: 0.65,
      roughness: 0.4,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    let highlight: THREE.Mesh | null = null;
    let highlighted: Structure | null = null;

    // Camera tween towards the selected focus preset.
    const desiredTarget = new THREE.Vector3();
    let desiredDistance = FOCUS.full.distance;
    let tweening = false;
    let currentFocus: FocusId | null = null;

    const apply = () => {
      const { visible: v, xray: x, focus: f } = propsRef.current;
      meshes.forEach((mesh, id) => {
        mesh.visible = v[id];
      });
      const muscle = materials.get('muscles');
      if (muscle) {
        muscle.transparent = x;
        muscle.opacity = x ? 0.22 : 1;
        muscle.depthWrite = !x;
        muscle.needsUpdate = true;
      }
      if (highlight && highlighted) {
        const layer = (highlight.userData.layer as LayerId) ?? 'muscles';
        if (!v[layer]) clearHighlight();
      }
      if (f !== currentFocus) {
        currentFocus = f;
        desiredTarget.fromArray(FOCUS[f].target);
        desiredDistance = FOCUS[f].distance;
        tweening = true;
      }
    };
    applyRef.current = apply;

    const clearHighlight = () => {
      if (highlight) {
        root.remove(highlight);
        highlight.geometry.dispose();
        highlight = null;
      }
      highlighted = null;
    };

    const setHighlight = (layerId: LayerId, s: Structure) => {
      if (highlighted === s) return;
      clearHighlight();
      const source = meshes.get(layerId);
      if (!source) return;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', source.geometry.getAttribute('position'));
      g.setAttribute('normal', source.geometry.getAttribute('normal'));
      const index = source.geometry.getIndex()!;
      const ArrayType = index.array.constructor as Uint16ArrayConstructor | Uint32ArrayConstructor;
      const start = s.triStart * 3;
      g.setIndex(new THREE.BufferAttribute(new ArrayType(index.array.subarray(start, start + s.triCount * 3)), 1));
      highlight = new THREE.Mesh(g, highlightMaterial);
      highlight.userData.layer = layerId;
      highlight.renderOrder = 10;
      root.add(highlight);
      highlighted = s;
    };

    // Hover / tap picking.
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
      // In X-ray mode, see-through muscles should not block what is behind them.
      const targets = [...meshes.entries()]
        .filter(([id, m]) => m.visible && v[id] && !(x && id === 'muscles'))
        .map(([, m]) => m);
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

    const stopAutoRotate = () => {
      controls.autoRotate = false;
    };
    const onPointerDown = (e: PointerEvent) => {
      downAt = { x: e.clientX, y: e.clientY };
      dragging = false;
      stopAutoRotate();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 4) dragging = true;
      if (e.pointerType === 'mouse' && !e.buttons) pendingPick = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) pendingPick = { x: e.clientX, y: e.clientY };
      downAt = null;
    };
    const onPointerLeave = (e: PointerEvent) => {
      // Touch taps keep their selection; only a mouse leaving clears it.
      if (e.pointerType !== 'mouse' || downAt) return;
      pendingPick = null;
      clearHighlight();
      propsRef.current.onHover?.(null);
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);

    // Render only while on screen.
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(el);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const offset = new THREE.Vector3();
    let frame = 0;
    let lastPick = 0;
    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (!onScreen) return;
      if (tweening) {
        controls.target.lerp(desiredTarget, 0.12);
        offset.subVectors(camera.position, controls.target);
        const distance = THREE.MathUtils.lerp(offset.length(), desiredDistance, 0.12);
        camera.position.copy(controls.target).add(offset.setLength(distance));
        if (controls.target.distanceTo(desiredTarget) < 0.002 && Math.abs(distance - desiredDistance) < 0.002) tweening = false;
      }
      controls.update();
      if (pendingPick && time - lastPick > 60 && meshes.size) {
        pick(pendingPick.x, pendingPick.y);
        pendingPick = null;
        lastPick = time;
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(loop);

    const abort = new AbortController();
    let disposed = false;
    (async () => {
      try {
        const { manifest, layers } = await loadLeg(abort.signal);
        if (disposed) return;

        root.scale.setScalar(manifest.half);
        const byLayer = {} as Record<LayerId, number>;
        let structures = 0;
        for (const { layer, positions, normals, indices } of layers) {
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.BufferAttribute(positions, 3, true));
          g.setAttribute('normal', new THREE.BufferAttribute(normals, 3, true));
          g.setIndex(new THREE.BufferAttribute(indices, 1));
          g.computeBoundingSphere();
          g.computeBoundingBox();

          const vessel = layer.id === 'arteries' || layer.id === 'veins';
          const material = new THREE.MeshStandardMaterial({
            color: LAYER_STYLES[layer.id].color,
            roughness: layer.id === 'bones' ? 0.75 : vessel ? 0.35 : 0.55,
            metalness: 0,
            emissive: vessel ? LAYER_STYLES[layer.id].color : 0x000000,
            emissiveIntensity: vessel ? 0.18 : 0,
          });
          const mesh = new THREE.Mesh(g, material);
          mesh.userData.layer = layer.id;
          // See-through muscles must draw after everything they cover.
          mesh.renderOrder = layer.id === 'muscles' ? 5 : 0;
          root.add(mesh);
          meshes.set(layer.id, mesh);
          materials.set(layer.id, material);
          layerData.set(layer.id, layer);
          byLayer[layer.id] = layer.structures.length;
          structures += layer.structures.length;
        }
        apply();
        camera.position.copy(controls.target).add(new THREE.Vector3(1.15, 0.25, 2.25).setLength(FOCUS.full.distance));
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
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      controls.dispose();
      clearHighlight();
      meshes.forEach((m) => m.geometry.dispose());
      materials.forEach((m) => m.dispose());
      highlightMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    applyRef.current();
  }, [visible, xray, focus]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
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
