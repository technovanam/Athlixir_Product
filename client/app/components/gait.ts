// Sagittal-plane sprint gait model shared by the 2D pose overlay and the 3D
// running-anatomy viewer. Phase runs 0..1 per leg: 0 = foot strike, toe-off ≈ 0.3.

export const STRIDE_SECONDS = 0.66; // one full gait cycle (two steps) ≈ 182 steps/min
export const TOE_OFF = 0.3;

/** Periodic gaussian bump on the gait cycle. */
export function bump(p: number, centre: number, width: number) {
  let d = Math.abs(p - centre) % 1;
  if (d > 0.5) d = 1 - d;
  return Math.exp(-((d / width) ** 2));
}

/** Joint angles in degrees for one leg at phase p. */
export function leg(p: number) {
  return {
    thigh: 12 + 38 * Math.cos(2 * Math.PI * (p - 0.8)), // hip flexion: thigh forward of vertical
    kneeFlex: 12 + 25 * bump(p, 0.15, 0.08) + 108 * bump(p, 0.57, 0.17),
    // + plantarflexion (toes down), − dorsiflexion; peaks at push-off, dorsiflexes through mid-stance.
    plantar: 25 * bump(p, 0.33, 0.08) - 14 * bump(p, 0.15, 0.07) - 8 * bump(p, 0.68, 0.14),
    toe: 32 * bump(p, 0.28, 0.06), // toe extension at the big-toe joint during push-off
  };
}

export function phaseName(p: number) {
  if (p < 0.05) return 'Foot strike';
  if (p < 0.2) return 'Mid-stance';
  if (p < TOE_OFF + 0.02) return 'Toe-off';
  if (p < 0.55) return 'Early swing';
  if (p < 0.8) return 'Knee drive';
  return 'Late swing';
}

// Approximate on/off pattern of the main muscle groups in sprinting, drawn from
// published sprint EMG reviews. Simplified for teaching, not a measurement.
export const MUSCLE_GROUPS = [
  { id: 1, name: 'Glutes', match: /gluteus (maximus|medius|minimus)/i, act: (p: number) => bump(p, 0.97, 0.12) },
  {
    id: 2,
    name: 'Quadriceps',
    match: /rectus femoris|vastus/i,
    act: (p: number) => Math.max(bump(p, 0.04, 0.09), 0.6 * bump(p, 0.45, 0.08)),
  },
  {
    id: 3,
    name: 'Hamstrings',
    match: /biceps femoris|semitendinosus|semimembranosus/i,
    act: (p: number) => Math.max(bump(p, 0.86, 0.08), 0.6 * bump(p, 0.05, 0.07)),
  },
  { id: 4, name: 'Calf', match: /gastrocnemius|soleus|plantaris/i, act: (p: number) => bump(p, 0.17, 0.09) },
  {
    id: 5,
    name: 'Shin',
    match: /tibialis anterior|extensor digitorum longus|extensor hallucis longus|fibularis tertius/i,
    act: (p: number) => Math.max(bump(p, 0.5, 0.12), 0.7 * bump(p, 0.97, 0.05)),
  },
  { id: 6, name: 'Adductors', match: /adductor (longus|brevis|magnus|minimus)|gracilis|pectineus/i, act: (p: number) => bump(p, 0.33, 0.08) },
  { id: 7, name: 'Hip flexors', match: /iliacus|sartorius|tensor fasciae latae/i, act: (p: number) => bump(p, 0.42, 0.09) },
] as const;
