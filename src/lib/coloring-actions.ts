import {
  type ColoringState,
  type Stroke,
  clampStrokes,
  emptyState,
} from '@/lib/artwork-state';

/**
 * Every way a picture can change, as pure functions. They live here rather than
 * inline in the canvas screen so the rules a toddler actually experiences — a
 * bucket tap recolours exactly one region, undo steps back one action, clear is
 * itself undoable — are testable without a renderer or a device.
 */

/** Bucket fill: sets one region's colour and touches nothing else. */
export function applyFill(
  state: ColoringState,
  shapeIndex: number,
  color: string,
): ColoringState {
  return { ...state, fills: { ...state.fills, [String(shapeIndex)]: color } };
}

/** Freehand: appends a committed stroke, respecting the growth ceiling. */
export function applyStroke(state: ColoringState, stroke: Stroke): ColoringState {
  return { ...state, strokes: clampStrokes([...state.strokes, stroke]) };
}

/** Clear: back to an uncoloured picture. Callers push the previous state for undo. */
export function applyClear(): ColoringState {
  return emptyState();
}
