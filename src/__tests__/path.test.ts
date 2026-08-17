import {
  bboxContains,
  bboxHeight,
  bboxMinorAxis,
  bboxWidth,
  circlePath,
  ellipsePath,
  parsePath,
  pathBBox,
  polyPath,
  roundRectPath,
} from '@/lib/path';

describe('path builders', () => {
  it('builds a single closed subpath for every primitive', () => {
    const paths = [
      ellipsePath(50, 50, 20, 10),
      circlePath(50, 50, 20),
      polyPath([[0, 0], [10, 0], [5, 10]]),
      roundRectPath(10, 10, 30, 20, 5),
    ];
    for (const d of paths) {
      const segs = parsePath(d);
      expect(segs.filter((s) => s.cmd === 'M')).toHaveLength(1);
      expect(segs[0].cmd).toBe('M');
      expect(segs[segs.length - 1].cmd).toBe('Z');
    }
  });

  it('rejects path commands outside the supported grammar', () => {
    expect(() => parsePath('M 0 0 A 5 5 0 1 0 10 10 Z')).toThrow(/unsupported path command/);
  });
});

describe('pathBBox', () => {
  it('measures a circle through its curve, not just its endpoints', () => {
    const box = pathBBox(circlePath(50, 50, 20));
    expect(box.minX).toBeCloseTo(30, 1);
    expect(box.maxX).toBeCloseTo(70, 1);
    expect(box.minY).toBeCloseTo(30, 1);
    expect(box.maxY).toBeCloseTo(70, 1);
  });

  it('reports width, height and minor axis of an ellipse', () => {
    const box = pathBBox(ellipsePath(50, 50, 30, 8));
    expect(bboxWidth(box)).toBeCloseTo(60, 1);
    expect(bboxHeight(box)).toBeCloseTo(16, 1);
    expect(bboxMinorAxis(box)).toBeCloseTo(16, 1);
  });

  it('detects containment in both directions', () => {
    const outer = pathBBox(circlePath(50, 50, 30));
    const inner = pathBBox(circlePath(50, 50, 5));
    expect(bboxContains(outer, inner)).toBe(true);
    expect(bboxContains(inner, outer)).toBe(false);
  });
});
