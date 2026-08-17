import type { Drawing } from '@/types/drawing';
import { SEED_DRAWINGS } from '@/drawings/seed';

export const DRAWINGS: readonly Drawing[] = [...SEED_DRAWINGS];

export const DRAWING_IDS: readonly string[] = DRAWINGS.map((d) => d.id);

export const getDrawing = (id: string): Drawing | undefined =>
  DRAWINGS.find((d) => d.id === id);
