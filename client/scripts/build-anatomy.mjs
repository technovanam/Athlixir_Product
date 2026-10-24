// Builds the landing-page lower-limb anatomy asset from the Human Atlas
// packaging of BodyParts3D 4.0 (CC BY 4.0 — see public/anatomy/ATTRIBUTION.md).
//
//   git clone --depth 1 https://github.com/ashemag/human-atlas.git
//   node scripts/build-anatomy.mjs path/to/human-atlas
//
// Output: public/anatomy/leg.json (manifest) + public/anatomy/leg.bin.gz.
// Per layer the binary holds int16 positions (normalized to the asset
// bounds), int16 normals, and uint16/uint32 indices.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { MeshoptSimplifier } from 'meshoptimizer';

const source = process.argv[2];
if (!source) {
  console.error('Usage: node scripts/build-anatomy.mjs <human-atlas checkout>');
  process.exit(1);
}
const modelDir = path.join(source, 'public', 'models');
const outDir = fileURLToPath(new URL('../public/anatomy/', import.meta.url));
const TRIANGLE_BUDGET = 120_000;

const atlas = JSON.parse(fs.readFileSync(path.join(modelDir, 'atlas.json'), 'utf8'));

// Word boundaries keep muscles like "fibularis" and "tibialis" out of bones.
const BONE = /\bbone\b|\b(femur|tibia|fibula|patella|phalanx|calcaneus|talus|cuboid|cuneiform|navicular|sesamoid|sacrum|coccyx)\b/i;
const CONNECTIVE = /ligament|\btract\b|retinaculum|\bfascia\b|aponeurosis|meniscus|tendon|bursa|membrane/i;
const MUSCLE = /tensor fasciae latae/i;
// Hand structures and pelvic viscera (with their vessels) sit inside the leg's height band.
const EXCLUDED = /psoas|metacarp|palm|finger|thumb|\bhand\b|carpal|rectal|rectum|vesical|prostat|penis|penile|testic|scrot|pudend|anal|anus|bladder|colic|mesenter|sigmoid|cecal|ileal|ileocolic|appendic|ureter|urethr|deferen|seminal|epigastric|lumbar|renal|perine|bulb|cavernos|levator ani|coccygeus|sphincter|ischiocavernosus|bulbospongiosus|vertebra|disk|intertransversari|interspinal|linea alba|obliqu|rectus abdominis|transversus abdominis|pyramidalis/i;
// Hip structures centred above the femoral head that anchor the leg.
const HIP = /hip bone|sacrum|coccyx|gluteus|iliacus|piriformis|common iliac|external iliac|internal iliac|superior gluteal|inferior gluteal/i;

const center = (p, axis) => (p.bounds[0][axis] + p.bounds[1][axis]) / 2;

function layerOf(p) {
  if (p.system === 'arterial') return 'arteries';
  if (p.system === 'venous') return 'veins';
  if (p.system === 'skeletal' && BONE.test(p.name)) return 'bones';
  if (MUSCLE.test(p.name)) return 'muscles';
  if (p.system === 'connective' || CONNECTIVE.test(p.name)) return 'ligaments';
  if (p.system === 'muscular' || p.system === 'skeletal') return 'muscles';
  return null;
}

const parts = atlas.parts.filter((p) => {
  if (!layerOf(p) || EXCLUDED.test(p.name)) return false;
  if (Math.abs(center(p, 0)) > 0.2) return false; // hands hang beside the thighs
  const y = center(p, 1);
  return y < 0.92 || (y < 1.08 && HIP.test(p.name));
});

const chunks = new Map();
function chunk(i) {
  if (!chunks.has(i)) {
    const file = path.join(modelDir, path.basename(atlas.chunks[i].url));
    const buf = fs.existsSync(file) ? fs.readFileSync(file) : zlib.gunzipSync(fs.readFileSync(`${file}.gz`));
    chunks.set(i, buf);
  }
  return chunks.get(i);
}

await MeshoptSimplifier.ready;
const sourceTriangles = parts.reduce((n, p) => n + p.indexCount / 3, 0);
const ratio = Math.min(1, TRIANGLE_BUDGET / sourceTriangles);

const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (const p of parts) for (let a = 0; a < 3; a++) {
  min[a] = Math.min(min[a], p.bounds[0][a]);
  max[a] = Math.max(max[a], p.bounds[1][a]);
}
const mid = min.map((v, a) => (v + max[a]) / 2);
const half = Math.max(...max.map((v, a) => (v - min[a]) / 2));

const LAYERS = ['bones', 'muscles', 'ligaments', 'arteries', 'veins'];
const layers = Object.fromEntries(LAYERS.map((id) => [id, { positions: [], normals: [], indices: [], vertexCount: 0, structures: [] }]));

for (const p of parts) {
  const b = chunk(p.chunk);
  const pos = new Float32Array(b.buffer, b.byteOffset + p.positions, p.vertexCount * 3);
  const nrm = new Int16Array(b.buffer, b.byteOffset + p.normals, p.vertexCount * 3);
  const idx = new Uint32Array(b.buffer, b.byteOffset + p.indices, p.indexCount);
  const target = Math.max(60, Math.floor((p.indexCount * ratio) / 3) * 3);
  const [simplified] = MeshoptSimplifier.simplify(idx, pos, 3, Math.min(idx.length, target), 0.01);

  const layer = layers[layerOf(p)];
  const remap = new Map();
  const triStart = layer.indices.length / 3;
  for (const old of simplified) {
    let n = remap.get(old);
    if (n === undefined) {
      n = layer.vertexCount++;
      remap.set(old, n);
      for (let a = 0; a < 3; a++) {
        layer.positions.push(Math.round(((pos[old * 3 + a] - mid[a]) / half) * 32767));
        layer.normals.push(nrm[old * 3 + a]);
      }
    }
    layer.indices.push(n);
  }
  layer.structures.push({ name: p.name, id: p.id, triStart, triCount: simplified.length / 3 });
}

const segments = [];
let bytes = 0;
const append = (typed) => {
  const pad = (4 - (bytes % 4)) % 4;
  if (pad) { segments.push(Buffer.alloc(pad)); bytes += pad; }
  const offset = bytes;
  segments.push(Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength));
  bytes += typed.byteLength;
  return offset;
};

const manifest = {
  version: 1,
  source: 'BodyParts3D 4.0 via Human Atlas (github.com/ashemag/human-atlas)',
  license: 'CC BY 4.0',
  // Decoded position = mid + normalized * half (metres, Y-up).
  mid,
  half,
  layers: [],
};
let triangles = 0;
for (const id of LAYERS) {
  const l = layers[id];
  if (!l.vertexCount) continue;
  const wide = l.vertexCount > 65535;
  const indexArray = wide ? Uint32Array.from(l.indices) : Uint16Array.from(l.indices);
  manifest.layers.push({
    id,
    vertexCount: l.vertexCount,
    indexCount: l.indices.length,
    indexType: wide ? 'uint32' : 'uint16',
    positions: append(Int16Array.from(l.positions)),
    normals: append(Int16Array.from(l.normals)),
    indices: append(indexArray),
    structures: l.structures,
  });
  triangles += l.indices.length / 3;
}
manifest.bytes = bytes;
manifest.triangles = triangles;

fs.mkdirSync(outDir, { recursive: true });
const gz = zlib.gzipSync(Buffer.concat(segments), { level: 9 });
fs.writeFileSync(path.join(outDir, 'leg.bin.gz'), gz);
fs.writeFileSync(path.join(outDir, 'leg.json'), JSON.stringify(manifest));
console.log(JSON.stringify({
  structures: parts.length,
  sourceTriangles,
  triangles,
  layers: Object.fromEntries(manifest.layers.map((l) => [l.id, l.structures.length])),
  rawBytes: bytes,
  gzipBytes: gz.length,
}));
