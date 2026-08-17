import type { Drawing, Shape } from '@/types/drawing';
import { blobPath, circlePath, ellipsePath, polyPath, roundRectPath } from '@/lib/path';

/**
 * Authoring helpers. Every drawing is composed from these so that each region is
 * guaranteed to be one closed subpath — the invariant the whole rendering and
 * clipping model rests on.
 */

/** A colourable region. */
export const f = (d: string): Shape => ({ d, fillable: true });

/** A detail mark that stays black: eyes, nostrils, mouths. */
export const k = (d: string): Shape => ({ d, fillable: false, ink: true });

export const ell = ellipsePath;
export const cir = circlePath;
export const poly = polyPath;
export const rr = roundRectPath;
export const blob = blobPath;

export const drawing = (id: string, shapes: Shape[]): Drawing => ({
  id,
  viewBox: [100, 100],
  shapes,
});

/**
 * A sea/ground band with a wavy top edge, as straight segments. Deliberately not
 * blobPath: smoothing a shape with square corners overshoots its own control
 * points and pushes the path outside the viewBox.
 */
export const wave = (
  yTop: number,
  amplitude: number,
  yBottom: number,
  x0 = 2,
  x1 = 98,
  steps = 16,
): string => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    pts.push([x, yTop + Math.sin(t * Math.PI * 2) * amplitude]);
  }
  pts.push([x1, yBottom], [x0, yBottom]);
  return poly(pts);
};

/** Two eyes at a mirrored offset — by far the most repeated detail in the set. */
export const eyes = (cx: number, cy: number, dx: number, r = 2.6): Shape[] => [
  k(cir(cx - dx, cy, r)),
  k(cir(cx + dx, cy, r)),
];

/** One eye, for the side-on subjects where a mirrored pair would stack. */
export const eye = (cx: number, cy: number, r = 2.6): Shape => k(cir(cx, cy, r));
