import { MAX_STROKES, type ColoringState, emptyState, pushUndo } from '@/lib/artwork-state';
import { applyClear, applyFill, applyStroke } from '@/lib/coloring-actions';

const stroke = (c: string) => ({ c, w: 7, p: [1, 2, 3, 4] });

describe('bucket fill', () => {
  it('colours exactly the tapped region and leaves neighbours alone', () => {
    const before: ColoringState = { fills: { '1': '#111111' }, strokes: [] };
    const after = applyFill(before, 4, '#E23B3B');
    expect(after.fills).toEqual({ '1': '#111111', '4': '#E23B3B' });
  });

  it('recolours a region that was already filled', () => {
    const after = applyFill({ fills: { '2': '#111111' }, strokes: [] }, 2, '#2D9BE0');
    expect(after.fills['2']).toBe('#2D9BE0');
  });

  it('uses the colour it is given, so wheel selection reaches the fill', () => {
    expect(applyFill(emptyState(), 0, '#8B4FE0').fills['0']).toBe('#8B4FE0');
  });

  it('does not mutate the previous state, so undo can restore it', () => {
    const before = emptyState();
    applyFill(before, 0, '#E23B3B');
    expect(before.fills).toEqual({});
  });
});

describe('freehand', () => {
  it('appends a stroke in the selected colour', () => {
    const after = applyStroke(emptyState(), stroke('#4CAF50'));
    expect(after.strokes).toHaveLength(1);
    expect(after.strokes[0].c).toBe('#4CAF50');
  });

  it('keeps earlier strokes', () => {
    const after = applyStroke(applyStroke(emptyState(), stroke('#a')), stroke('#b'));
    expect(after.strokes.map((s) => s.c)).toEqual(['#a', '#b']);
  });

  it('never grows past the stroke ceiling', () => {
    let state = emptyState();
    for (let i = 0; i < MAX_STROKES + 5; i++) state = applyStroke(state, stroke('#a'));
    expect(state.strokes).toHaveLength(MAX_STROKES);
  });
});

describe('undo and clear', () => {
  it('steps back one fill', () => {
    const start = emptyState();
    const stack = pushUndo([], start);
    const filled = applyFill(start, 3, '#E23B3B');
    expect(filled.fills['3']).toBe('#E23B3B');
    expect(stack[stack.length - 1]).toEqual(start);
  });

  it('steps back one stroke', () => {
    const start = applyStroke(emptyState(), stroke('#a'));
    const stack = pushUndo([], start);
    const next = applyStroke(start, stroke('#b'));
    expect(next.strokes).toHaveLength(2);
    expect(stack[stack.length - 1].strokes).toHaveLength(1);
  });

  it('clears everything', () => {
    const busy = applyFill(applyStroke(emptyState(), stroke('#a')), 1, '#b');
    expect(applyClear()).toEqual(emptyState());
    expect(busy.strokes).toHaveLength(1);
  });

  it('makes an accidental clear recoverable, because the prior state is pushed', () => {
    const busy = applyFill(emptyState(), 1, '#E23B3B');
    const stack = pushUndo([], busy);
    applyClear();
    expect(stack[stack.length - 1]).toEqual(busy);
  });
});
