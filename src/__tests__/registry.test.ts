import { DRAWINGS } from '@/drawings';
import { MIN_FILLABLE_REGIONS, validateRegistry } from '@/lib/validate';
import { bboxMinorAxis, pathBBox } from '@/lib/path';

describe('drawing registry', () => {
  it('registers at least 50 drawings', () => {
    expect(DRAWINGS.length).toBeGreaterThanOrEqual(50);
  });

  it('has no duplicate ids', () => {
    const ids = DRAWINGS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('satisfies every structural invariant', () => {
    expect(validateRegistry(DRAWINGS)).toEqual([]);
  });

  it('gives every drawing a viewBox and enough fillable regions', () => {
    for (const d of DRAWINGS) {
      expect(d.viewBox).toHaveLength(2);
      expect(d.shapes.filter((s) => s.fillable).length).toBeGreaterThanOrEqual(
        MIN_FILLABLE_REGIONS,
      );
    }
  });

  it('keeps every fillable region large enough for a toddler to hit', () => {
    for (const d of DRAWINGS) {
      for (const shape of d.shapes) {
        if (!shape.fillable) continue;
        expect(bboxMinorAxis(pathBBox(shape.d))).toBeGreaterThanOrEqual(6);
      }
    }
  });
});
