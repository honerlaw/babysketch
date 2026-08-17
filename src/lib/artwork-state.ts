/**
 * Pure colouring state: no Expo or React Native imports anywhere in this file, so
 * it can be tested in plain Node. The file-system half lives in artwork-store.ts.
 */

/** Points are stored flat ([x, y, x, y, ...]) — it roughly halves the saved JSON. */
export type Stroke = { c: string; w: number; p: number[] };

export type ColoringState = {
  fills: Record<string, string>;
  strokes: Stroke[];
};

export type SavedArtwork = { v: 1; fills: Record<string, string>; strokes: Stroke[] };

export const SAVE_VERSION = 1;

/** Ceilings so a picture coloured over and over across days cannot grow without bound. */
export const MAX_POINTS_PER_STROKE = 600;
export const MAX_STROKES = 400;

export const emptyState = (): ColoringState => ({ fills: {}, strokes: [] });

/**
 * The key a region's colour is saved under. Deliberately derived from the region's
 * own geometry rather than its position in the shapes array: an array index means
 * that inserting a spot or reordering ears-before-head in any of the 52 drawings
 * would silently reapply every saved colour to the wrong region, and a version
 * check cannot catch that because the payload's shape is unchanged — only its
 * meaning. Keyed by geometry, colours survive reordering and insertion, and a
 * region whose shape genuinely changed simply loses its colour, which is the
 * safe direction to fail.
 */
export function shapeKey(d: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < d.length; i++) {
    hash ^= d.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

export const isEmptyState = (s: ColoringState) =>
  Object.keys(s.fills).length === 0 && s.strokes.length === 0;

export function clampStroke(stroke: Stroke): Stroke {
  if (stroke.p.length <= MAX_POINTS_PER_STROKE * 2) return stroke;
  return { ...stroke, p: stroke.p.slice(0, MAX_POINTS_PER_STROKE * 2) };
}

export function clampStrokes(strokes: Stroke[]): Stroke[] {
  const capped = strokes.length > MAX_STROKES ? strokes.slice(strokes.length - MAX_STROKES) : strokes;
  return capped.map(clampStroke);
}

export function serialize(state: ColoringState): string {
  const payload: SavedArtwork = {
    v: SAVE_VERSION,
    fills: state.fills,
    strokes: clampStrokes(state.strokes),
  };
  return JSON.stringify(payload);
}

const isStroke = (v: unknown): v is Stroke => {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Partial<Stroke>;
  return (
    typeof s.c === 'string' &&
    typeof s.w === 'number' &&
    Array.isArray(s.p) &&
    s.p.length % 2 === 0 &&
    s.p.every((x) => typeof x === 'number' && Number.isFinite(x))
  );
};

/**
 * Never throws. A corrupt, truncated, or future-versioned save degrades to an
 * uncoloured picture, which is a recoverable disappointment; a crash on launch is not.
 */
export function deserialize(raw: string | null | undefined): ColoringState {
  if (!raw) return emptyState();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyState();
  }
  if (typeof parsed !== 'object' || parsed === null) return emptyState();
  const data = parsed as Partial<SavedArtwork>;
  if (data.v !== SAVE_VERSION) return emptyState();

  const fills: Record<string, string> = {};
  if (data.fills && typeof data.fills === 'object') {
    for (const [k, v] of Object.entries(data.fills)) {
      if (typeof v === 'string') fills[k] = v;
    }
  }
  const strokes = Array.isArray(data.strokes) ? data.strokes.filter(isStroke) : [];
  return { fills, strokes: clampStrokes(strokes) };
}

/** Flat point pairs to SVG path data. A one-point stroke becomes a dot. */
export function strokeToPath(stroke: Stroke): string {
  const { p } = stroke;
  if (p.length < 2) return '';
  const r = (v: number) => Math.round(v * 100) / 100;
  if (p.length === 2) return `M ${r(p[0])} ${r(p[1])} L ${r(p[0] + 0.01)} ${r(p[1])}`;
  let d = `M ${r(p[0])} ${r(p[1])}`;
  for (let i = 2; i < p.length; i += 2) d += ` L ${r(p[i])} ${r(p[i + 1])}`;
  return d;
}

/**
 * Undo snapshots share structure instead of deep-copying: a fill pushes a fresh
 * `fills` object beside the same `strokes` reference and vice versa, so forty
 * snapshots cost forty shallow objects, not forty copies of a 400-stroke drawing.
 */
export const MAX_UNDO = 40;

export function pushUndo(stack: ColoringState[], snapshot: ColoringState): ColoringState[] {
  const next = [...stack, snapshot];
  return next.length > MAX_UNDO ? next.slice(next.length - MAX_UNDO) : next;
}
