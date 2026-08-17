import { HUES, NEUTRALS } from '@/lib/palette';

/**
 * Colour-wheel geometry, in points, so the touch-target claim is arithmetic rather
 * than a hope. Twelve sectors at an 88pt mid-radius give 2*pi*88/12 = ~46pt of arc,
 * and the ring is 48pt thick; both clear the 44pt floor.
 */
export const WHEEL_OUTER_R = 112;
export const WHEEL_INNER_R = 64;
export const WHEEL_CENTER_R = 52;
export const SWATCH_D = 56;
export const WHEEL_SIZE = WHEEL_OUTER_R * 2;

export const SECTOR_COUNT = HUES.length;
export const SECTOR_ANGLE = (Math.PI * 2) / SECTOR_COUNT;

export const midRadius = () => (WHEEL_OUTER_R + WHEEL_INNER_R) / 2;
export const sectorArcLength = () => (Math.PI * 2 * midRadius()) / SECTOR_COUNT;
export const ringThickness = () => WHEEL_OUTER_R - WHEEL_INNER_R;

/** Sectors start at 12 o'clock and run clockwise, so index 0 is straight up. */
export function sectorStartAngle(index: number): number {
  return index * SECTOR_ANGLE - Math.PI / 2 - SECTOR_ANGLE / 2;
}

/**
 * Which sector a touch at (dx, dy) from the wheel centre falls in. Returns null
 * outside the ring, so a stray tap in the middle or beyond the rim does nothing.
 */
export function sectorAt(dx: number, dy: number): number | null {
  const dist = Math.hypot(dx, dy);
  if (dist < WHEEL_INNER_R || dist > WHEEL_OUTER_R) return null;
  const raw = Math.atan2(dy, dx) + Math.PI / 2 + SECTOR_ANGLE / 2;
  const twoPi = Math.PI * 2;
  const normalized = ((raw % twoPi) + twoPi) % twoPi;
  return Math.floor(normalized / SECTOR_ANGLE) % SECTOR_COUNT;
}

/** An annulus sector as SVG path data, centred on (cx, cy). */
export function sectorPath(index: number, cx: number, cy: number): string {
  const a0 = sectorStartAngle(index);
  const a1 = a0 + SECTOR_ANGLE;
  const large = SECTOR_ANGLE > Math.PI ? 1 : 0;
  const p = (r: number, a: number) =>
    `${(cx + r * Math.cos(a)).toFixed(3)} ${(cy + r * Math.sin(a)).toFixed(3)}`;
  return [
    `M ${p(WHEEL_INNER_R, a0)}`,
    `L ${p(WHEEL_OUTER_R, a0)}`,
    `A ${WHEEL_OUTER_R} ${WHEEL_OUTER_R} 0 ${large} 1 ${p(WHEEL_OUTER_R, a1)}`,
    `L ${p(WHEEL_INNER_R, a1)}`,
    `A ${WHEEL_INNER_R} ${WHEEL_INNER_R} 0 ${large} 0 ${p(WHEEL_INNER_R, a0)}`,
    'Z',
  ].join(' ');
}

export const wheelColors = () => HUES;
export const swatchColors = () => NEUTRALS;
