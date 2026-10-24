import type { LayerId } from './layers';

// Asset produced by scripts/build-anatomy.mjs from BodyParts3D (CC BY 4.0).
const MANIFEST_URL = '/anatomy/leg.json';
const BINARY_URL = '/anatomy/leg.bin.gz';

export interface Structure {
  name: string;
  id: string;
  triStart: number;
  triCount: number;
}

export interface ManifestLayer {
  id: LayerId;
  vertexCount: number;
  indexCount: number;
  indexType: 'uint16' | 'uint32';
  positions: number;
  normals: number;
  indices: number;
  structures: Structure[];
}

export interface Manifest {
  half: number;
  bytes: number;
  layers: ManifestLayer[];
}

export interface LegLayer {
  layer: ManifestLayer;
  /** int16-normalised positions in [-1, 1]; multiply by manifest.half for metres. */
  positions: Int16Array;
  normals: Int16Array;
  indices: Uint16Array | Uint32Array;
}

async function fetchBinary(expectedBytes: number, signal: AbortSignal): Promise<ArrayBuffer> {
  const response = await fetch(BINARY_URL, { signal });
  if (!response.ok) throw new Error('The anatomy model could not be loaded.');
  const payload = await response.arrayBuffer();
  // Hosts may decode Content-Encoding themselves; only gunzip a real gzip payload.
  const head = new Uint8Array(payload, 0, Math.min(2, payload.byteLength));
  const gzip = head[0] === 0x1f && head[1] === 0x8b;
  const buffer = gzip
    ? await new Response(new Blob([payload]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
    : payload;
  if (buffer.byteLength !== expectedBytes) throw new Error('The anatomy model was incomplete. Please reload.');
  return buffer;
}

export async function loadLeg(signal: AbortSignal): Promise<{ manifest: Manifest; layers: LegLayer[] }> {
  const manifestResponse = await fetch(MANIFEST_URL, { signal });
  if (!manifestResponse.ok) throw new Error('The anatomy model could not be loaded.');
  const manifest = (await manifestResponse.json()) as Manifest;
  const buffer = await fetchBinary(manifest.bytes, signal);
  const layers = manifest.layers.map((layer) => ({
    layer,
    positions: new Int16Array(buffer, layer.positions, layer.vertexCount * 3),
    normals: new Int16Array(buffer, layer.normals, layer.vertexCount * 3),
    indices:
      layer.indexType === 'uint32'
        ? new Uint32Array(buffer, layer.indices, layer.indexCount)
        : new Uint16Array(buffer, layer.indices, layer.indexCount),
  }));
  return { manifest, layers };
}

export function structureAt(structures: Structure[], triangle: number): Structure | null {
  let lo = 0;
  let hi = structures.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const s = structures[mid];
    if (triangle < s.triStart) hi = mid - 1;
    else if (triangle >= s.triStart + s.triCount) lo = mid + 1;
    else return s;
  }
  return null;
}
