// Shared by the landing section and the three.js viewer. Kept separate so the
// section can use it without pulling three.js into the landing bundle.

export type LayerId = 'bones' | 'muscles' | 'ligaments' | 'arteries' | 'veins';
export type FocusId = 'full' | 'hip' | 'knee' | 'foot';

export const LAYER_STYLES: Record<LayerId, { label: string; color: string }> = {
  muscles: { label: 'Muscles', color: '#b5483d' },
  bones: { label: 'Bones', color: '#e9dfc6' },
  ligaments: { label: 'Tendons & ligaments', color: '#d8d2c4' },
  arteries: { label: 'Arteries', color: '#ff4f21' },
  veins: { label: 'Veins', color: '#4f7fc4' },
};

export interface AnatomyStats {
  structures: number;
  byLayer: Record<LayerId, number>;
}

export interface HoveredStructure {
  name: string;
  layer: LayerId;
}
