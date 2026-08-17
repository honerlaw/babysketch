import { MAX_STROKES, type ColoringState, emptyState, pushUndo } from '@/lib/artwork-state';
import { applyClear, applyFill, applyStroke } from '@/lib/coloring-actions';

const stroke = (c: string) => ({ c, w: 7, p: [1, 2, 3, 4] });

describe('bucket fill', () => {
  it('colours exactly the tapped region and leaves neighbours alone', () => {
    const before: ColoringState = { fills: { ear: '#111111' }, strokes: [] };
    const after = applyFill(before, 'body', '#E23B3B');
    expect(after.fills).toEqual({ ear: '#111111', body: '#E23B3B' });
  });

  it('recolours a region that was already filled', () => {
    const after = applyFill({ fills: { body: '#111111' }, strokes: [] }, 'body', '#2D9BE0');
    expect(after.fills.body).toBe('#2D9BE0');
  });

  it('uses the colour it is given, so wheel selection reaches the fill', () => {
    expect(applyFill(emptyState(), 'body', '#8B4FE0').fills.body).toBe('#8B4FE0');
  });

  it('does not mutate the previous state, so undo can restore it', () => {
    const before = emptyState();
    applyFill(before, 'body', '#E23B3B');
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
    const filled = applyFill(start, 'body', '#E23B3B');
    expect(filled.fills.body).toBe('#E23B3B');
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
    const busy = applyFill(applyStroke(emptyState(), stroke('#a')), 'body', '#b');
    expect(applyClear()).toEqual(emptyState());
    expect(busy.strokes).toHaveLength(1);
  });

  it('makes an accidental clear recoverable, because the prior state is pushed', () => {
    const busy = applyFill(emptyState(), 'body', '#E23B3B');
    const stack = pushUndo([], busy);
    applyClear();
    expect(stack[stack.length - 1]).toEqual(busy);
  });
});
