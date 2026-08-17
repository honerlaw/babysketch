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

/**
 * A heart. Written out as explicit cubics rather than composed from primitives:
 * the two lobes and the point need control over the tangents, and every attempt to
 * fake it with circles plus a triangle leaves the triangle's top edge showing
 * straight through the middle once the outline layer draws.
 */
export const heart = (cx: number, cy: number, w: number, h: number): string => {
  const hw = w / 2;
  const hh = h / 2;
  const x = (t: number) => cx + t * hw;
  const y = (t: number) => cy + t * hh;
  return [
    `M ${x(0)} ${y(1)}`,
    `C ${x(-0.72)} ${y(0.42)} ${x(-1)} ${y(-0.06)} ${x(-1)} ${y(-0.34)}`,
    `C ${x(-1)} ${y(-0.72)} ${x(-0.72)} ${y(-1)} ${x(-0.42)} ${y(-1)}`,
    `C ${x(-0.22)} ${y(-1)} ${x(-0.06)} ${y(-0.86)} ${x(0)} ${y(-0.66)}`,
    `C ${x(0.06)} ${y(-0.86)} ${x(0.22)} ${y(-1)} ${x(0.42)} ${y(-1)}`,
    `C ${x(0.72)} ${y(-1)} ${x(1)} ${y(-0.72)} ${x(1)} ${y(-0.34)}`,
    `C ${x(1)} ${y(-0.06)} ${x(0.72)} ${y(0.42)} ${x(0)} ${y(1)}`,
    'Z',
  ].join(' ');
};

/** A pointed star as one closed polygon. */
export const star = (
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points = 5,
): string => {
  const pts: [number, number][] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return poly(pts);
};

/** Two eyes at a mirrored offset — by far the most repeated detail in the set. */
export const eyes = (cx: number, cy: number, dx: number, r = 2.6): Shape[] => [
  k(cir(cx - dx, cy, r)),
  k(cir(cx + dx, cy, r)),
];

/** One eye, for the side-on subjects where a mirrored pair would stack. */
export const eye = (cx: number, cy: number, r = 2.6): Shape => k(cir(cx, cy, r));
