// Procedural product models for the landing-page hardware showcase, styled
// after the Athlixir hardware concept sheet. Units are metres.
//
// Object userData contract (read by GearModel):
//   label / sub  – part name and subtitle; descendants inherit it for picking
//   callout      – false to keep a part out of the exploded-view callouts
//   explode      – Vector3 offset (parent frame) at full explode
//   home         – assembled position
//   internal     – hidden while assembled (sits inside a shell)
//   pulse        – emissive material that breathes (status LED)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ProductId } from './products';

const LED_BLUE = 0x3d8bff;
const FONT = '"Poppins", "Helvetica Neue", Arial, sans-serif';

interface PartOptions {
  explode?: [number, number, number];
  internal?: boolean;
  callout?: boolean;
}

function part<T extends THREE.Object3D>(obj: T, label: string, sub: string | undefined, opts: PartOptions = {}): T {
  obj.userData.label = label;
  if (sub) obj.userData.sub = sub;
  if (opts.callout === false) obj.userData.callout = false;
  if (opts.internal) obj.userData.internal = true;
  obj.userData.explode = new THREE.Vector3(...(opts.explode ?? [0, 0, 0]));
  obj.userData.home = obj.position.clone();
  return obj;
}

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, color = true) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d')!, w, h);
  const texture = new THREE.CanvasTexture(canvas);
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Rib-knit height map. `horizontal` turns the ribs for elastic bands. */
function knitBump(horizontal = false, repeat: [number, number] = [1, 1]) {
  const rand = seeded(7);
  const t = canvasTexture(
    256,
    256,
    (ctx, w, h) => {
      const img = ctx.createImageData(w, h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const a = horizontal ? y : x;
          const b = horizontal ? x : y;
          const rib = 0.5 + 0.5 * Math.cos(((a % 16) / 16) * Math.PI * 2);
          const loop = 0.5 + 0.5 * Math.sin((b / 256) * Math.PI * 2 * 32 + (a % 16 < 8 ? 0 : Math.PI));
          const v = Math.min(255, Math.max(0, (0.45 * rib + 0.4 * loop * rib + 0.15 * rand()) * 255));
          const i = (y * w + x) * 4;
          img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
          img.data[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    },
    false,
  );
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  return t;
}

/** Fine random grain for foams and plastics. */
function grainBump(seed: number, repeat: number) {
  const rand = seeded(seed);
  const t = canvasTexture(
    128,
    128,
    (ctx, w, h) => {
      const img = ctx.createImageData(w, h);
      for (let i = 0; i < w * h; i++) {
        const v = 110 + rand() * 90;
        img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
        img.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    },
    false,
  );
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  return t;
}

function logoTexture(text: string, color: string, widthPx = 512) {
  return canvasTexture(widthPx, widthPx / 4, (ctx, w, h) => {
    ctx.fillStyle = color;
    ctx.font = `italic 700 ${h * 0.62}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
  });
}

function roundedRect<T extends THREE.Path>(path: T, w: number, d: number, r: number): T {
  const x = w / 2;
  const y = d / 2;
  path.moveTo(-x + r, -y);
  path.lineTo(x - r, -y);
  path.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false);
  path.lineTo(x, y - r);
  path.absarc(x - r, y - r, r, 0, Math.PI / 2, false);
  path.lineTo(-x + r, y);
  path.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(-x, -y + r);
  path.absarc(-x + r, -y + r, r, Math.PI, Math.PI * 1.5, false);
  return path;
}

/** Flat slab with a rounded-rectangle outline, lying in XZ, from y = 0 upwards. */
function slab(w: number, d: number, r: number, h: number, bevel: number, hole?: [number, number, number]) {
  const shape = roundedRect(new THREE.Shape(), w - bevel * 2, d - bevel * 2, Math.max(0.0005, r - bevel));
  if (hole) shape.holes.push(roundedRect(new THREE.Path(), hole[0], hole[1], hole[2]));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.0001, h - bevel * 2),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 24,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  return g;
}

// ── Telemetry pod ───────────────────────────────────────────────────────────

const POD = 0.044; // square footprint
const POD_R = 0.011; // plan-view corner radius
const POD_WALL = 0.0016;

function podPlastic() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x16171b,
    roughness: 0.62,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.55,
    bumpMap: grainBump(3, 6),
    bumpScale: 0.15,
  });
}

function podShell(includeInterior: boolean) {
  const plastic = podPlastic();
  const group = new THREE.Group();

  // Bottom cover: a tray with walls, floor and screw bosses.
  const bottom = new THREE.Group();
  bottom.add(new THREE.Mesh(slab(POD, POD, POD_R, 0.0092, 0.0012, [POD - POD_WALL * 2, POD - POD_WALL * 2, POD_R - POD_WALL]), plastic));
  bottom.add(new THREE.Mesh(slab(POD - 0.001, POD - 0.001, POD_R - 0.0005, 0.0016, 0.0006), plastic));
  if (includeInterior) {
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.0021, 0.0023, 0.0062, 20), plastic);
      boss.position.set(x * (POD / 2 - 0.0062), 0.0045, z * (POD / 2 - 0.0062));
      bottom.add(boss);
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.0009, 0.0009, 0.0002, 16), new THREE.MeshStandardMaterial({ color: 0x050506 }));
      hole.position.set(boss.position.x, 0.0077, boss.position.z);
      bottom.add(hole);
    }
  }
  // USB-C port on the front wall.
  const port = new THREE.Mesh(new RoundedBoxGeometry(0.009, 0.0033, 0.0016, 3, 0.0014), new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.25 }));
  port.position.set(0, 0.0048, POD / 2 - 0.0005);
  bottom.add(port);
  const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.0055, 0.0007, 0.0012), new THREE.MeshStandardMaterial({ color: 0xa9adb5, metalness: 1, roughness: 0.3 }));
  tongue.position.set(0, 0.0048, POD / 2 - 0.0003);
  bottom.add(tongue);
  group.add(bottom);

  // Strap lugs on both sides.
  const lugs = new THREE.Group();
  const lugMaterial = new THREE.MeshPhysicalMaterial({ color: 0x1d1e23, roughness: 0.45, clearcoat: 0.4 });
  for (const s of [-1, 1]) {
    const bar = new THREE.Mesh(new RoundedBoxGeometry(0.0032, 0.0056, 0.024, 3, 0.0012), lugMaterial);
    bar.position.set(s * (POD / 2 + 0.0016), 0.0062, 0);
    lugs.add(bar);
  }
  group.add(lugs);

  // Top cover with logo and status LED.
  const top = new THREE.Group();
  top.add(new THREE.Mesh(slab(POD, POD, POD_R, 0.0068, 0.0026), plastic));
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.026, 0.0065),
    new THREE.MeshStandardMaterial({ map: logoTexture('Athlixir', 'rgba(222,224,230,0.92)'), transparent: true, roughness: 0.5 }),
  );
  logo.rotation.x = -Math.PI / 2;
  logo.position.set(0, 0.00685, -0.003);
  top.add(logo);
  const led = new THREE.Mesh(
    new RoundedBoxGeometry(0.0042, 0.0004, 0.001, 2, 0.0002),
    new THREE.MeshStandardMaterial({ color: 0x9cc4ff, emissive: LED_BLUE, emissiveIntensity: 2.2 }),
  );
  led.position.set(0, 0.0069, 0.0085);
  led.userData.pulse = true;
  top.add(led);
  top.position.y = 0.0092;
  group.add(top);

  return { group, bottom, top, lugs };
}

/** Assembled pod with no labelled sub-parts, for mounting on the sleeve. */
function podLite() {
  return podShell(false).group;
}

function circuitTexture(seed: number, base: string, trace: string, w = 512, h = 400) {
  const rand = seeded(seed);
  return canvasTexture(w, h, (ctx) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = trace;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
      let x = rand() * w;
      let y = rand() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 3; s++) {
        if (rand() > 0.5) x += (rand() - 0.5) * 180;
        else y += (rand() - 0.5) * 160;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = '#d9b45a';
    for (let i = 0; i < 70; i++) ctx.fillRect(rand() * w, rand() * h, 7, 7);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 24; i++) ctx.fillRect(rand() * w, rand() * h, 18, 2);
  });
}

function buildPod(): THREE.Group {
  const group = new THREE.Group();
  const { bottom, top, lugs } = podShell(true);
  group.add(part(top, 'Top cover', '3D-printed enclosure', { explode: [0, 0.056, 0] }));
  group.add(part(bottom, 'Bottom cover', '3D-printed enclosure'));
  group.add(part(lugs, 'Strap lugs', 'Clip into the sleeve dock', { callout: false }));

  // Li-Po battery with kapton-taped edge and nickel tabs.
  const battery = new THREE.Group();
  battery.add(new THREE.Mesh(new RoundedBoxGeometry(0.033, 0.0046, 0.027, 4, 0.0016), new THREE.MeshStandardMaterial({ color: 0xc3c7cf, metalness: 1, roughness: 0.28 })));
  const tape = new THREE.Mesh(new RoundedBoxGeometry(0.0055, 0.0049, 0.0274, 3, 0.0012), new THREE.MeshStandardMaterial({ color: 0xd9a21b, roughness: 0.35, metalness: 0.2 }));
  tape.position.x = 0.0145;
  battery.add(tape);
  for (const z of [-0.004, 0.004]) {
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.0003, 0.0025), new THREE.MeshStandardMaterial({ color: 0xb9bcc2, metalness: 1, roughness: 0.35 }));
    tab.position.set(0.019, 0, z);
    battery.add(tab);
  }
  battery.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.021, 0, 0), new THREE.Vector3(0.024, 0.004, 0.002), new THREE.Vector3(0.02, 0.009, 0.006)]), 16, 0.0005, 6),
      new THREE.MeshStandardMaterial({ color: 0xd8501c, roughness: 0.5 }),
    ),
  );
  battery.position.y = 0.0042;
  group.add(part(battery, 'Battery', 'Rechargeable Li-Po', { explode: [0, 0.04, 0], internal: true }));

  // Main PCB: green board, MCU, RF shield can, passives and USB-C receptacle.
  const pcb = new THREE.Group();
  const boardSide = new THREE.MeshStandardMaterial({ color: 0x0f5c34, roughness: 0.45 });
  const boardTop = new THREE.MeshStandardMaterial({ map: circuitTexture(11, '#0f5c34', '#2f8a4f'), roughness: 0.42 });
  // BoxGeometry face order is +x, −x, +y, −y, +z, −z: only the top carries traces.
  pcb.add(new THREE.Mesh(new THREE.BoxGeometry(0.037, 0.0014, 0.03), [boardSide, boardSide, boardTop, boardSide, boardSide, boardSide]));
  const black = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.4 });
  const mcu = new THREE.Mesh(new RoundedBoxGeometry(0.0075, 0.0012, 0.0075, 1, 0.0003), black);
  mcu.position.set(-0.007, 0.0012, -0.002);
  pcb.add(mcu);
  const shield = new THREE.Mesh(new RoundedBoxGeometry(0.0115, 0.0017, 0.01, 1, 0.0004), new THREE.MeshStandardMaterial({ color: 0xc8ccd3, metalness: 1, roughness: 0.32 }));
  shield.position.set(0.008, 0.0014, 0.001);
  pcb.add(shield);
  const imu = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.0009, 0.003), black);
  imu.position.set(-0.012, 0.0011, 0.009);
  pcb.add(imu);
  const rand = seeded(5);
  const passiveColors = [0xc9a26b, 0x1a1a1d, 0xb7bac0, 0x8b6a45];
  for (let i = 0; i < 34; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.0013, 0.0006, 0.0007), new THREE.MeshStandardMaterial({ color: passiveColors[i % 4], roughness: 0.5, metalness: i % 4 === 2 ? 0.8 : 0.1 }));
    p.position.set((rand() - 0.5) * 0.033, 0.001, (rand() - 0.5) * 0.026);
    p.rotation.y = rand() > 0.5 ? Math.PI / 2 : 0;
    pcb.add(p);
  }
  const usb = new THREE.Mesh(new RoundedBoxGeometry(0.0089, 0.0031, 0.007, 2, 0.0013), new THREE.MeshStandardMaterial({ color: 0xbfc3ca, metalness: 1, roughness: 0.3 }));
  usb.position.set(0, 0.0022, 0.0125);
  pcb.add(usb);
  pcb.position.y = 0.0073;
  group.add(part(pcb, 'Main PCB', 'MCU + Bluetooth', { explode: [0, 0.024, 0], internal: true }));

  // Flex antenna: copper meander on an orange polyimide strip.
  const antenna = new THREE.Group();
  const antennaMap = canvasTexture(512, 192, (ctx, w, h) => {
    ctx.fillStyle = '#c4521c';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e8b25d';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(20, h - 30);
    for (let i = 0; i < 9; i++) {
      const x = 40 + i * 50;
      ctx.lineTo(x, 30);
      ctx.lineTo(x + 25, 30);
      ctx.lineTo(x + 25, h - 30);
      ctx.lineTo(x + 50, h - 30);
    }
    ctx.stroke();
  });
  antenna.add(new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.0005, 0.011, 1, 0.0002), new THREE.MeshStandardMaterial({ map: antennaMap, roughness: 0.38, metalness: 0.3 })));
  const plug = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.0012, 0.004), new THREE.MeshStandardMaterial({ color: 0xd1d4da, metalness: 1, roughness: 0.3 }));
  plug.position.set(-0.016, 0.0006, 0);
  antenna.add(plug);
  antenna.position.set(0, 0.0024, -0.006);
  group.add(part(antenna, 'Antenna', 'Bluetooth / optional long range', { explode: [0, 0.012, 0], internal: true }));

  return group;
}

// ── Smart leg sleeve ────────────────────────────────────────────────────────

// Radius profile from the ankle (y = 0) to below the knee.
const SLEEVE_PROFILE: [number, number][] = [
  [0.0405, 0], [0.0415, 0.035], [0.0455, 0.09], [0.0525, 0.16], [0.0605, 0.235], [0.0625, 0.28], [0.0605, 0.33], [0.0585, 0.37], [0.0578, 0.405],
];
const SLEEVE_TOP = 0.405;
const BAND_Y = 0.35; // start of the elastic top band
const DEPTH = 0.86; // calves are flatter front-to-back
const PANEL_PHI = 0.95; // electronics panel faces front-lateral

const sleeveSamples = new THREE.SplineCurve(SLEEVE_PROFILE.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(400);

function sleeveRadius(y: number) {
  for (let i = 1; i < sleeveSamples.length; i++) {
    const a = sleeveSamples[i - 1];
    const b = sleeveSamples[i];
    if (y <= b.y) return THREE.MathUtils.lerp(a.x, b.x, (y - a.y) / Math.max(1e-6, b.y - a.y));
  }
  return sleeveSamples[sleeveSamples.length - 1].x;
}

function sleevePoint(phi: number, y: number, off: number) {
  const r = sleeveRadius(y) + off;
  return new THREE.Vector3(Math.sin(phi) * r, y, Math.cos(phi) * r * DEPTH);
}

function sleeveNormal(phi: number) {
  return new THREE.Vector3(Math.sin(phi), 0, Math.cos(phi) / DEPTH).normalize();
}

/** Place an object on the sleeve: local x along the girth, y up, z outward. */
function onSleeve<T extends THREE.Object3D>(obj: T, phi: number, y: number, off: number): T {
  const n = sleeveNormal(phi);
  const up = new THREE.Vector3(0, 1, 0);
  const t = new THREE.Vector3().crossVectors(up, n).normalize();
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(t, up, n));
  obj.position.copy(sleevePoint(phi, y, off));
  return obj;
}

function sleeveLathe(y0: number, y1: number, off: (y: number) => number, opts: { phiStart?: number; phiLength?: number; steps?: number; segments?: number } = {}) {
  const steps = opts.steps ?? 80;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const y = y0 + ((y1 - y0) * i) / steps;
    pts.push(new THREE.Vector2(sleeveRadius(y) + off(y), y));
  }
  const g = new THREE.LatheGeometry(pts, opts.segments ?? 160, opts.phiStart ?? 0, opts.phiLength ?? Math.PI * 2);
  g.scale(1, 1, DEPTH);
  return g;
}

/** Rolled hem joining the inner and outer fabric at a cut edge. */
function sleeveHem(y: number, inner: number, outer: number, material: THREE.Material, down: boolean) {
  const pts: THREE.Vector2[] = [];
  const r = sleeveRadius(y);
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * Math.PI;
    pts.push(new THREE.Vector2(r + THREE.MathUtils.lerp(inner, outer, i / 10), y + (down ? -1 : 1) * Math.sin(a) * 0.0012));
  }
  const g = new THREE.LatheGeometry(pts, 160);
  g.scale(1, 1, DEPTH);
  return new THREE.Mesh(g, material);
}

function sleeveFabricMap() {
  // u wraps the girth (front at u = 0, lateral at 0.25), v runs ankle → band.
  const W = 1024;
  const H = Math.round((W * BAND_Y) / 0.33);
  return canvasTexture(W, H, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#17181c');
    g.addColorStop(1, '#121316');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const vy = (y: number) => (1 - y / BAND_Y) * H;
    // Shaping seams.
    ctx.strokeStyle = '#25272c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.02, vy(0.33));
    ctx.bezierCurveTo(W * 0.09, vy(0.25), W * 0.16, vy(0.15), W * 0.2, vy(0.03));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W * 0.42, vy(0.34));
    ctx.bezierCurveTo(W * 0.38, vy(0.24), W * 0.33, vy(0.12), W * 0.31, vy(0.02));
    ctx.stroke();
    // Reflective stripe down the front-lateral line.
    const sx = W * 0.075;
    const stripe = ctx.createLinearGradient(sx - 7, 0, sx + 7, 0);
    stripe.addColorStop(0, '#5b5e66');
    stripe.addColorStop(0.5, '#9a9ea8');
    stripe.addColorStop(1, '#5b5e66');
    ctx.fillStyle = stripe;
    ctx.fillRect(sx - 7, vy(0.335), 14, vy(0.04) - vy(0.335));
    // Vertical wordmark on the lateral side.
    ctx.save();
    ctx.translate(W * 0.25, vy(0.21));
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#e7e8ec';
    ctx.font = `italic 700 ${Math.round(W * 0.055)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Athlixir', 0, 0);
    ctx.restore();
  });
}

function buildSleeve(): THREE.Group {
  const group = new THREE.Group();
  const fabricOuter = new THREE.MeshPhysicalMaterial({
    map: sleeveFabricMap(),
    roughness: 0.92,
    bumpMap: knitBump(false, [72, 36]),
    bumpScale: 1.1,
    sheen: 1,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(0x5b5f68),
  });
  const bandMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0f1012,
    roughness: 0.85,
    bumpMap: knitBump(true, [90, 6]),
    bumpScale: 1.2,
    sheen: 1,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(0x4a4d55),
  });
  const comfort = new THREE.MeshPhysicalMaterial({
    color: 0x5d6067,
    roughness: 0.95,
    bumpMap: knitBump(false, [60, 30]),
    bumpScale: 0.8,
    sheen: 0.6,
    sheenColor: new THREE.Color(0x8a8e96),
    side: THREE.DoubleSide,
  });

  // Outer fabric (body + elastic band + hems) moves back as one layer.
  const outer = new THREE.Group();
  outer.add(new THREE.Mesh(sleeveLathe(0, BAND_Y + 0.002, () => 0.0016), fabricOuter));
  outer.add(new THREE.Mesh(sleeveLathe(BAND_Y, SLEEVE_TOP, (y) => 0.0026 + Math.sin(((y - BAND_Y) / (SLEEVE_TOP - BAND_Y)) * Math.PI) * 0.0006, { steps: 16 }), bandMaterial));
  const seam = new THREE.Mesh(new THREE.TorusGeometry(1, 0.0007 / (sleeveRadius(BAND_Y) + 0.0024), 6, 160), new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 0.7 }));
  seam.rotation.x = Math.PI / 2;
  const seamR = sleeveRadius(BAND_Y) + 0.0024;
  seam.scale.set(seamR, seamR * DEPTH, seamR);
  seam.position.y = BAND_Y;
  outer.add(seam);
  outer.add(sleeveHem(SLEEVE_TOP, -0.0008, 0.0026, bandMaterial, false));
  outer.add(sleeveHem(0, -0.0008, 0.0016, fabricOuter, true));
  // Exploded, the outer fabric slides off to the side (screen left from the default view).
  const n0 = sleeveNormal(PANEL_PHI);
  const aside = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), n0).normalize().multiplyScalar(-0.15);
  group.add(part(outer, 'Outer fabric layer', 'Stretchable & breathable', { explode: [aside.x, 0, aside.z] }));

  // Inner comfort layer stays in place.
  const inner = new THREE.Mesh(sleeveLathe(0.004, SLEEVE_TOP - 0.004, () => -0.0008), comfort);
  group.add(part(inner, 'Inner comfort layer', 'Soft & skin friendly'));

  // Electronics sit between the layers; shown only when exploded.
  const panelOut = n0.clone().multiplyScalar(0.022);
  const partsOut = n0.clone().multiplyScalar(0.04);

  const electrodes = new THREE.Group();
  electrodes.add(
    new THREE.Mesh(
      sleeveLathe(0.1, 0.325, () => 0.0004, { phiStart: PANEL_PHI - 0.55, phiLength: 1.1, steps: 40, segments: 48 }),
      new THREE.MeshPhysicalMaterial({ color: 0x7c7f86, roughness: 0.9, bumpMap: knitBump(false, [30, 50]), bumpScale: 0.6, side: THREE.DoubleSide }),
    ),
  );
  const padMaterial = new THREE.MeshPhysicalMaterial({ color: 0x0c0c0e, roughness: 0.42, clearcoat: 0.5 });
  const snapMaterial = new THREE.MeshStandardMaterial({ color: 0xb4b8c0, metalness: 1, roughness: 0.3 });
  const padGeometry = new THREE.CylinderGeometry(0.0082, 0.0082, 0.0018, 36).rotateX(Math.PI / 2);
  const snapGeometry = new THREE.CylinderGeometry(0.0022, 0.0022, 0.0012, 20).rotateX(Math.PI / 2);
  for (const dphi of [0.14, 0.4]) {
    for (const y of [0.135, 0.185, 0.235, 0.285]) {
      electrodes.add(onSleeve(new THREE.Mesh(padGeometry, padMaterial), PANEL_PHI + dphi, y, 0.0013));
      electrodes.add(onSleeve(new THREE.Mesh(snapGeometry, snapMaterial), PANEL_PHI + dphi, y, 0.0024));
    }
  }
  group.add(part(electrodes, 'EMG electrode layer', 'Conductive textile', { explode: [panelOut.x, 0, panelOut.z], internal: true }));

  const cPhi = PANEL_PHI - 0.3;
  const out = (o: THREE.Object3D, label: string, sub: string) =>
    group.add(part(o, label, sub, { explode: [partsOut.x, 0, partsOut.z], internal: true }));

  const imu = new THREE.Group();
  imu.add(new THREE.Mesh(new RoundedBoxGeometry(0.014, 0.018, 0.005, 2, 0.0012), new THREE.MeshPhysicalMaterial({ color: 0x0f1012, roughness: 0.4, clearcoat: 0.6 })));
  const can = new THREE.Mesh(new RoundedBoxGeometry(0.0085, 0.0085, 0.0012, 1, 0.0003), snapMaterial);
  can.position.z = 0.0028;
  imu.add(can);
  out(onSleeve(imu, cPhi, 0.29, 0.0035), 'IMU module', 'Acceleration + gyroscope');

  const temp = new THREE.Group();
  temp.add(new THREE.Mesh(new RoundedBoxGeometry(0.0065, 0.0065, 0.002, 1, 0.0005), new THREE.MeshStandardMaterial({ color: 0xb06a2a, metalness: 0.7, roughness: 0.35 })));
  const tempCore = new THREE.Mesh(new THREE.BoxGeometry(0.0028, 0.0028, 0.0006), new THREE.MeshStandardMaterial({ color: 0x141416 }));
  tempCore.position.z = 0.0012;
  temp.add(tempCore);
  out(onSleeve(temp, cPhi, 0.243, 0.0022), 'Temperature sensor', 'Skin temperature');

  const sig = new THREE.Group();
  sig.add(new THREE.Mesh(new RoundedBoxGeometry(0.016, 0.024, 0.0014, 1, 0.0005), new THREE.MeshStandardMaterial({ map: circuitTexture(21, '#0f5c34', '#2f8a4f', 256, 384), roughness: 0.45 })));
  const sigChip = new THREE.Mesh(new RoundedBoxGeometry(0.007, 0.007, 0.0012, 1, 0.0003), new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.4 }));
  sigChip.position.z = 0.0012;
  sig.add(sigChip);
  out(onSleeve(sig, cPhi, 0.19, 0.0018), 'Signal conditioning PCB', 'Filters & amplifies EMG');

  // Flexible wiring from the board down to the pod dock.
  const flexMaterial = new THREE.MeshStandardMaterial({ color: 0xd9822b, roughness: 0.35, metalness: 0.45, side: THREE.DoubleSide });
  const route = (from: [number, number], to: [number, number], width: number) => {
    const pos: number[] = [];
    const idx: number[] = [];
    const N = 40;
    const phiAt = (t: number) => THREE.MathUtils.lerp(from[0], to[0], t * t * (3 - 2 * t));
    const at = (t: number) => sleevePoint(phiAt(t), THREE.MathUtils.lerp(from[1], to[1], t), 0.0012);
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const p = at(t);
      const dir = at(Math.min(1, t + 0.01)).sub(at(Math.max(0, t - 0.01))).normalize();
      const side = new THREE.Vector3().crossVectors(sleeveNormal(phiAt(t)), dir).normalize().multiplyScalar(width / 2);
      pos.push(...p.clone().add(side).toArray(), ...p.clone().sub(side).toArray());
      if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return new THREE.Mesh(g, flexMaterial);
  };
  const wiring = new THREE.Group();
  wiring.add(route([cPhi, 0.178], [Math.PI / 2 - 0.05, 0.085], 0.0065));
  wiring.add(route([cPhi, 0.28], [cPhi, 0.202], 0.003));
  wiring.add(route([cPhi + 0.06, 0.285], [PANEL_PHI + 0.14, 0.285], 0.0025));
  out(wiring, 'Flexible wiring', 'Runs inside the fabric');

  // Pod dock and pod on the lateral side above the ankle.
  const dock = new THREE.Group();
  dock.add(new THREE.Mesh(new RoundedBoxGeometry(0.036, 0.034, 0.003, 3, 0.0012), new THREE.MeshPhysicalMaterial({ color: 0x0b0b0d, roughness: 0.5, clearcoat: 0.3 })));
  const pod = podLite();
  pod.scale.setScalar(0.7);
  pod.rotation.x = Math.PI / 2;
  pod.position.z = 0.0015;
  dock.add(pod);
  onSleeve(dock, Math.PI / 2, 0.075, 0.0032);
  const lateral = sleeveNormal(Math.PI / 2).multiplyScalar(0.045);
  group.add(part(dock, 'Telemetry pod', 'Clips into the sleeve dock', { explode: [lateral.x, 0, lateral.z] }));

  return group;
}

// ── Smart insole ────────────────────────────────────────────────────────────

const INSOLE_LENGTH = 0.274;
const INSOLE_HALF_WIDTH = 0.05;

function footShape(): THREE.Shape {
  // Right foot seen from above: +y towards the toes, +x lateral, −x medial (arch side).
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.03, 0, 0.036, 0.03, 0.035, 0.06);
  s.bezierCurveTo(0.034, 0.11, 0.04, 0.15, 0.045, 0.19);
  s.bezierCurveTo(0.05, 0.23, 0.04, 0.268, 0.01, 0.272);
  s.bezierCurveTo(-0.012, 0.274, -0.04, 0.266, -0.045, 0.238);
  s.bezierCurveTo(-0.05, 0.2, -0.04, 0.17, -0.031, 0.13);
  s.bezierCurveTo(-0.025, 0.1, -0.035, 0.06, -0.034, 0.04);
  s.bezierCurveTo(-0.033, 0.01, -0.02, 0, 0, 0);
  return s;
}

/** Surface lift for the medial arch and the heel cup. */
function insoleLift(x: number, y: number) {
  const arch = 0.011 * Math.exp(-(((y - 0.115) / 0.05) ** 2)) * Math.min(1, Math.max(0, (-x + 0.005) / 0.04)) ** 1.5;
  const d = Math.hypot(x, y - 0.035);
  const cup = y < 0.1 ? 0.007 * Math.min(1, Math.max(0, (d - 0.016) / 0.018)) ** 2 * (1 - Math.max(0, y - 0.05) / 0.05) : 0;
  return arch + cup;
}

/** Map a texture across the foot outline (cap UVs are the shape's x/y in metres). */
function footMapped<T extends THREE.Texture>(t: T): T {
  t.repeat.set(1 / (INSOLE_HALF_WIDTH * 2), 1 / INSOLE_LENGTH);
  t.offset.set(0.5, 0);
  return t;
}

function footCanvas(draw: (ctx: CanvasRenderingContext2D, px: (x: number) => number, py: (y: number) => number, w: number, h: number) => void) {
  const W = 512;
  const H = Math.round((W * INSOLE_LENGTH) / (INSOLE_HALF_WIDTH * 2));
  return footMapped(
    canvasTexture(W, H, (ctx) =>
      draw(ctx, (x) => ((x + INSOLE_HALF_WIDTH) / (INSOLE_HALF_WIDTH * 2)) * W, (y) => (1 - y / INSOLE_LENGTH) * H, W, H),
    ),
  );
}

function insoleLayer(depth: number, z: number, inset: number, bevel: number, material: THREE.Material) {
  const g = new THREE.ExtrudeGeometry(footShape(), {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 64,
  });
  const mid = INSOLE_LENGTH / 2;
  g.translate(0, -mid, 0);
  g.scale(1 - inset, 1 - inset * 0.6, 1);
  g.translate(0, mid, z);
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) + insoleLift(pos.getX(i), pos.getY(i)));
  g.computeVertexNormals();
  return new THREE.Mesh(g, material);
}

const SENSOR_PADS: [number, number][] = [
  [-0.012, 0.03], [0.012, 0.03], [0, 0.056],
  [0.024, 0.1], [0.027, 0.137],
  [-0.028, 0.18], [-0.008, 0.186], [0.012, 0.186], [0.032, 0.18],
  [-0.027, 0.235], [-0.005, 0.241], [0.015, 0.232],
];

function buildInsole(): THREE.Group {
  const flat = new THREE.Group();
  // Layers climb and step towards the toes when exploded, like a staircase.
  const step = (i: number): [number, number, number] => [0, i * 0.017, i * 0.021];

  // 0 — base layer: durable orange outsole with perforations; slightly larger so its rim shows.
  const baseMap = footCanvas((ctx, px, py, w, h) => {
    ctx.fillStyle = '#e94a12';
    ctx.fillRect(0, 0, w, h);
    const rand = seeded(9);
    ctx.fillStyle = '#5a1c06';
    for (let i = 0; i < 160; i++) {
      ctx.beginPath();
      ctx.arc(px((rand() - 0.5) * 0.07), py(0.02 + rand() * 0.23), 4 + rand() * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const base = insoleLayer(0.0024, 0, -0.035, 0.0012, new THREE.MeshPhysicalMaterial({ map: baseMap, roughness: 0.7, clearcoat: 0.1, clearcoatRoughness: 0.7 }));
  flat.add(part(base, 'Base layer', 'Durable & flexible'));

  // 1 — support layer.
  const foam = (color: number, seed: number) => new THREE.MeshStandardMaterial({ color, roughness: 0.95, bumpMap: footMapped(grainBump(seed, 1)), bumpScale: 0.5 });
  flat.add(part(insoleLayer(0.0018, 0.0042, 0, 0.0008, foam(0x6c6e74, 2)), 'Support layer', 'Structural support', { explode: step(1) }));

  // 2 — flexible PCB interconnect.
  const flexMap = footCanvas((ctx, px, py, w, h) => {
    ctx.fillStyle = '#1b6a3a';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d6913f';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    const hub: [number, number] = [0.036, 0.11];
    for (const [x, y] of SENSOR_PADS) {
      ctx.beginPath();
      ctx.moveTo(px(x), py(y));
      ctx.bezierCurveTo(px(x), py((y + hub[1]) / 2), px(hub[0] - 0.01), py(hub[1]), px(hub[0]), py(hub[1]));
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    const rand = seeded(4);
    for (let i = 0; i < 40; i++) ctx.fillRect(px((rand() - 0.5) * 0.06), py(0.04 + rand() * 0.2), 10, 3);
  });
  const flex = new THREE.Group();
  flex.add(insoleLayer(0.0006, 0.0066, 0.05, 0, new THREE.MeshStandardMaterial({ map: flexMap, roughness: 0.4, metalness: 0.15 })));
  const chipMaterial = new THREE.MeshStandardMaterial({ color: 0x121215, roughness: 0.4 });
  for (const [x, y, w] of [[0.026, 0.115, 0.007], [0.018, 0.13, 0.004], [0.03, 0.135, 0.004]] as const) {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(w, w, 0.0012), chipMaterial);
    chip.position.set(x, y, 0.0078 + insoleLift(x, y));
    flex.add(chip);
  }
  const tab = new THREE.Mesh(new RoundedBoxGeometry(0.016, 0.011, 0.0018, 2, 0.0007), new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.4 }));
  tab.position.set(0.048, 0.11, 0.007);
  flex.add(tab);
  flat.add(part(flex, 'Flexible PCB', 'Sensor interconnect', { explode: step(2) }));

  // 3 — pressure sensor array: dark film with metallic pads and orange traces.
  const sensorMap = footCanvas((ctx, px, py, w, h) => {
    ctx.fillStyle = '#26282e';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e0662a';
    ctx.lineWidth = 5;
    for (let i = 0; i < SENSOR_PADS.length - 1; i++) {
      const [x1, y1] = SENSOR_PADS[i];
      const [x2, y2] = SENSOR_PADS[i + 1];
      ctx.beginPath();
      ctx.moveTo(px(x1), py(y1));
      ctx.lineTo(px(x2), py(y2));
      ctx.stroke();
    }
    ctx.strokeStyle = '#c86a2c';
    ctx.lineWidth = 6;
    for (const [x, y] of SENSOR_PADS) {
      ctx.beginPath();
      ctx.arc(px(x), py(y), 46, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  const sensors = new THREE.Group();
  sensors.add(insoleLayer(0.0007, 0.0076, 0.035, 0, new THREE.MeshStandardMaterial({ map: sensorMap, roughness: 0.45 })));
  const padGeometry = new THREE.CylinderGeometry(0.0074, 0.0074, 0.0011, 40).rotateX(Math.PI / 2);
  const padMaterial = new THREE.MeshStandardMaterial({ color: 0xd8d0bd, metalness: 0.9, roughness: 0.28 });
  for (const [x, y] of SENSOR_PADS) {
    const pad = new THREE.Mesh(padGeometry, padMaterial);
    pad.position.set(x, y, 0.0088 + insoleLift(x, y));
    sensors.add(pad);
  }
  flat.add(part(sensors, 'Pressure sensor array', 'Multiple zones', { explode: step(3) }));

  // 4 — cushion layer.
  flat.add(part(insoleLayer(0.0024, 0.0092, 0, 0.0009, foam(0x8d9096, 6)), 'Cushion layer', 'Shock absorption', { explode: step(4) }));

  // 5 — top fabric with wordmark.
  const topMap = footCanvas((ctx, px, py, w) => {
    ctx.fillStyle = '#141518';
    ctx.fillRect(0, 0, w, ctx.canvas.height);
    ctx.save();
    ctx.translate(px(0.002), py(0.168));
    ctx.rotate(-Math.PI / 2 + 0.06);
    ctx.fillStyle = '#ecedf1';
    ctx.font = `italic 700 ${Math.round(w * 0.2)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Athlixir', 0, 0);
    ctx.restore();
  });
  const topBump = footMapped(knitBump(false));
  topBump.repeat.multiplyScalar(14);
  const top = insoleLayer(
    0.0011,
    0.0123,
    0,
    0.0008,
    new THREE.MeshPhysicalMaterial({ map: topMap, roughness: 0.9, bumpMap: topBump, bumpScale: 0.7, sheen: 0.5, sheenColor: new THREE.Color(0x33353b) }),
  );
  flat.add(part(top, 'Top fabric layer', 'Comfortable & breathable', { explode: step(5) }));

  // Lie flat: the shape's +z thickness becomes world up, toes point away from the camera.
  flat.rotation.x = -Math.PI / 2;
  flat.position.z = INSOLE_LENGTH / 2;
  const group = new THREE.Group();
  group.add(flat);
  return group;
}

export function buildProduct(id: ProductId): THREE.Group {
  if (id === 'sleeve') return buildSleeve();
  if (id === 'insole') return buildInsole();
  return buildPod();
}
