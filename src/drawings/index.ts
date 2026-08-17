import type { Drawing } from '@/types/drawing';
import { LAND_DRAWINGS } from '@/drawings/land';
import { SEA_DRAWINGS } from '@/drawings/sea';
import { SEED_DRAWINGS } from '@/drawings/seed';
import { SKY_DRAWINGS } from '@/drawings/sky';
import { THING_DRAWINGS } from '@/drawings/things';

/** Every subject a child can open, in the order the gallery shows them. */
export const DRAWINGS: readonly Drawing[] = [
  ...SEED_DRAWINGS,
  ...LAND_DRAWINGS,
  ...SEA_DRAWINGS,
  ...SKY_DRAWINGS,
  ...THING_DRAWINGS,
];

export const DRAWING_IDS: readonly string[] = DRAWINGS.map((d) => d.id);

export const getDrawing = (id: string): Drawing | undefined =>
  DRAWINGS.find((d) => d.id === id);
