// Shared by the landing section and the three.js viewer. Kept separate so the
// section can use it without pulling three.js into the landing bundle.

export type ProductId = 'sleeve' | 'insole' | 'pod';

export const PRODUCTS: { id: ProductId; name: string; tagline: string; description: string }[] = [
  {
    id: 'sleeve',
    name: 'Smart Leg Sleeve',
    tagline: 'Calf & shin',
    description:
      'Stretch-knit sleeve with an EMG electrode layer, motion and temperature sensing, and flexible wiring that runs inside the fabric to the pod dock.',
  },
  {
    id: 'pod',
    name: 'Telemetry Pod',
    tagline: 'MCU + Bluetooth',
    description:
      'Compact pod with a rechargeable Li-Po battery, main board with microcontroller and Bluetooth, and an antenna, sealed in a two-part enclosure.',
  },
  {
    id: 'insole',
    name: 'Smart Insole',
    tagline: 'Foot pressure',
    description:
      'Six-layer insole: breathable top fabric, cushioning, a multi-zone pressure sensor array, flexible interconnect, a support layer and a durable base.',
  },
];

export interface HoveredPart {
  label: string;
  sub?: string;
}
