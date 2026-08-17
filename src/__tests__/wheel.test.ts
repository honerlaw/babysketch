import { HUES, NEUTRALS } from '@/lib/palette';
import {
  SECTOR_COUNT,
  SWATCH_D,
  WHEEL_INNER_R,
  WHEEL_OUTER_R,
  ringThickness,
  sectorArcLength,
  sectorAt,
  sectorPath,
} from '@/lib/wheel';

const TOUCH_FLOOR = 44;

describe('colour wheel geometry', () => {
  it('gives every sector at least the minimum touch target in both dimensions', () => {
    expect(sectorArcLength()).toBeGreaterThanOrEqual(TOUCH_FLOOR);
    expect(ringThickness()).toBeGreaterThanOrEqual(TOUCH_FLOOR);
  });

  it('makes the neutral swatches at least the minimum touch target', () => {
    expect(SWATCH_D).toBeGreaterThanOrEqual(TOUCH_FLOOR);
  });

  it('has one sector per hue', () => {
    expect(SECTOR_COUNT).toBe(HUES.length);
  });

  it('offers a distinct colour for every sector and swatch', () => {
    const all = [...HUES, ...NEUTRALS];
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('sectorAt', () => {
  it('maps straight up to sector zero', () => {
    expect(sectorAt(0, -(WHEEL_INNER_R + WHEEL_OUTER_R) / 2)).toBe(0);
  });

  it('ignores taps inside the centre disc and beyond the rim', () => {
    expect(sectorAt(0, 0)).toBeNull();
    expect(sectorAt(0, -(WHEEL_OUTER_R + 20))).toBeNull();
  });

  it('covers every sector index as the angle sweeps a full turn', () => {
    const r = (WHEEL_INNER_R + WHEEL_OUTER_R) / 2;
    const seen = new Set<number>();
    for (let deg = 0; deg < 360; deg += 1) {
      const a = (deg * Math.PI) / 180;
      const idx = sectorAt(r * Math.cos(a), r * Math.sin(a));
      if (idx !== null) seen.add(idx);
    }
    expect(seen.size).toBe(SECTOR_COUNT);
  });
});

describe('sectorPath', () => {
  it('emits a closed annulus sector', () => {
    const d = sectorPath(0, 112, 112);
    expect(d.startsWith('M ')).toBe(true);
    expect(d.trim().endsWith('Z')).toBe(true);
    expect(d).toContain('A ');
  });
});
