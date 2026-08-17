import {
  MAX_POINTS_PER_STROKE,
  MAX_STROKES,
  MAX_UNDO,
  type ColoringState,
  clampStrokes,
  deserialize,
  emptyState,
  pushUndo,
  serialize,
  strokeToPath,
} from '@/lib/artwork-state';

const sample: ColoringState = {
  fills: { '0': '#E23B3B', '3': '#2D9BE0' },
  strokes: [{ c: '#4CAF50', w: 7, p: [10, 10, 20, 22, 30, 18] }],
};

describe('serialization', () => {
  it('round-trips a coloured state', () => {
    expect(deserialize(serialize(sample))).toEqual(sample);
  });

  it('writes the version marker', () => {
    expect(JSON.parse(serialize(sample)).v).toBe(1);
  });
});

describe('deserialize degrades instead of throwing', () => {
  it('returns blank state for unparseable JSON', () => {
    expect(deserialize('{not json')).toEqual(emptyState());
  });

  it('returns blank state for a missing file', () => {
    expect(deserialize(null)).toEqual(emptyState());
    expect(deserialize(undefined)).toEqual(emptyState());
  });

  it('returns blank state for an unrecognised version', () => {
    expect(deserialize(JSON.stringify({ v: 99, fills: { '0': '#fff' }, strokes: [] }))).toEqual(
      emptyState(),
    );
  });

  it('drops malformed strokes rather than rendering them', () => {
    const raw = JSON.stringify({
      v: 1,
      fills: {},
      strokes: [{ c: '#fff', w: 5, p: [1, 2] }, { c: 5, w: 'x', p: 'nope' }, { c: '#f00', w: 3, p: [1] }],
    });
    expect(deserialize(raw).strokes).toHaveLength(1);
  });

  it('ignores non-string fill values', () => {
    const raw = JSON.stringify({ v: 1, fills: { '0': 12, '1': '#abc' }, strokes: [] });
    expect(deserialize(raw).fills).toEqual({ '1': '#abc' });
  });
});

describe('growth ceilings', () => {
  it('caps points per stroke', () => {
    const long = { c: '#000', w: 7, p: Array(MAX_POINTS_PER_STROKE * 2 + 500).fill(1) };
    expect(clampStrokes([long])[0].p).toHaveLength(MAX_POINTS_PER_STROKE * 2);
  });

  it('keeps the most recent strokes when over the ceiling', () => {
    const strokes = Array.from({ length: MAX_STROKES + 10 }, (_, i) => ({
      c: '#000',
      w: 7,
      p: [i, i],
    }));
    const capped = clampStrokes(strokes);
    expect(capped).toHaveLength(MAX_STROKES);
    expect(capped[capped.length - 1].p[0]).toBe(MAX_STROKES + 9);
  });

  it('bounds the undo stack', () => {
    let stack: ColoringState[] = [];
    for (let i = 0; i < MAX_UNDO + 15; i++) stack = pushUndo(stack, emptyState());
    expect(stack).toHaveLength(MAX_UNDO);
  });
});

describe('strokeToPath', () => {
  it('emits a moveto followed by linetos', () => {
    expect(strokeToPath({ c: '#000', w: 7, p: [0, 0, 5, 5] })).toBe('M 0 0 L 5 5');
  });

  it('renders a single tap as a visible dot', () => {
    expect(strokeToPath({ c: '#000', w: 7, p: [3, 4] })).toContain('M 3 4');
  });

  it('returns empty for an empty stroke', () => {
    expect(strokeToPath({ c: '#000', w: 7, p: [] })).toBe('');
  });
});
