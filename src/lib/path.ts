/**
 * Minimal absolute-only SVG path builders and a sampler.
 *
 * The grammar is deliberately tiny — `M`, `L`, `C`, `Q`, `Z` — because every
 * drawing in the registry is machine-validated, and a small grammar is one a
 * few dozen lines of pure TypeScript can actually parse. Ellipses are built
 * from cubic Beziers rather than arc (`A`) commands for the same reason: a
 * cubic is trivial to sample, an arc is not.
 */

export type Pt = { x: number; y: number };

export type BBox = { minX: number; minY: number; maxX: number; maxY: number };

/** Bezier circle constant: handle length as a fraction of the radius. */
const KAPPA = 0.5522847498307936;

const n = (v: number) => {
  const r = Math.round(v * 1000) / 1000;
  return Object.is(r, -0) ? 0 : r;
};

export function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  const ox = rx * KAPPA;
  const oy = ry * KAPPA;
  return [
    `M ${n(cx)} ${n(cy - ry)}`,
    `C ${n(cx + ox)} ${n(cy - ry)} ${n(cx + rx)} ${n(cy - oy)} ${n(cx + rx)} ${n(cy)}`,
    `C ${n(cx + rx)} ${n(cy + oy)} ${n(cx + ox)} ${n(cy + ry)} ${n(cx)} ${n(cy + ry)}`,
    `C ${n(cx - ox)} ${n(cy + ry)} ${n(cx - rx)} ${n(cy + oy)} ${n(cx - rx)} ${n(cy)}`,
    `C ${n(cx - rx)} ${n(cy - oy)} ${n(cx - ox)} ${n(cy - ry)} ${n(cx)} ${n(cy - ry)}`,
    'Z',
  ].join(' ');
}

export function circlePath(cx: number, cy: number, r: number): string {
  return ellipsePath(cx, cy, r, r);
}

export function polyPath(points: readonly (readonly [number, number])[]): string {
  if (points.length < 3) throw new Error('polyPath needs at least 3 points');
  const [first, ...rest] = points;
  return `M ${n(first[0])} ${n(first[1])} ${rest.map(([x, y]) => `L ${n(x)} ${n(y)}`).join(' ')} Z`;
}

/** Axis-aligned rectangle with equal corner radii, clamped to fit. */
export function roundRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  const o = rr * KAPPA;
  return [
    `M ${n(x + rr)} ${n(y)}`,
    `L ${n(x + w - rr)} ${n(y)}`,
    `C ${n(x + w - rr + o)} ${n(y)} ${n(x + w)} ${n(y + rr - o)} ${n(x + w)} ${n(y + rr)}`,
    `L ${n(x + w)} ${n(y + h - rr)}`,
    `C ${n(x + w)} ${n(y + h - rr + o)} ${n(x + w - rr + o)} ${n(y + h)} ${n(x + w - rr)} ${n(y + h)}`,
    `L ${n(x + rr)} ${n(y + h)}`,
    `C ${n(x + rr - o)} ${n(y + h)} ${n(x)} ${n(y + h - rr + o)} ${n(x)} ${n(y + h - rr)}`,
    `L ${n(x)} ${n(y + rr)}`,
    `C ${n(x)} ${n(y + rr - o)} ${n(x + rr - o)} ${n(y)} ${n(x + rr)} ${n(y)}`,
    'Z',
  ].join(' ');
}

/**
 * A closed shape through the given points, rounded by treating each point's
 * neighbours as Bezier handles. Used for organic outlines (bodies, fins, clouds).
 */
export function blobPath(points: readonly (readonly [number, number])[], smooth = 0.35): string {
  const len = points.length;
  if (len < 3) throw new Error('blobPath needs at least 3 points');
  const at = (i: number) => points[((i % len) + len) % len];
  let d = `M ${n(at(0)[0])} ${n(at(0)[1])}`;
  for (let i = 0; i < len; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) * smooth;
    const c1y = p1[1] + (p2[1] - p0[1]) * smooth;
    const c2x = p2[0] - (p3[0] - p1[0]) * smooth;
    const c2y = p2[1] - (p3[1] - p1[1]) * smooth;
    d += ` C ${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(p2[0])} ${n(p2[1])}`;
  }
  return `${d} Z`;
}

type Seg = { cmd: 'M' | 'L' | 'C' | 'Q' | 'Z'; args: number[] };

export function parsePath(d: string): Seg[] {
  const tokens = d.trim().match(/[MLCQZmlcqz]|-?\d*\.?\d+(?:e-?\d+)?/g);
  if (!tokens) return [];
  const segs: Seg[] = [];
  let i = 0;
  const arity: Record<string, number> = { M: 2, L: 2, C: 6, Q: 4, Z: 0 };
  while (i < tokens.length) {
    const cmd = tokens[i].toUpperCase() as Seg['cmd'];
    if (!(cmd in arity)) throw new Error(`unsupported path command: ${tokens[i]}`);
    i++;
    const count = arity[cmd];
    const args: number[] = [];
    for (let k = 0; k < count; k++) args.push(Number(tokens[i++]));
    segs.push({ cmd, args });
  }
  return segs;
}

const cubicAt = (t: number, a: number, b: number, c: number, dd: number) => {
  const mt = 1 - t;
  return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * dd;
};

const quadAt = (t: number, a: number, b: number, c: number) => {
  const mt = 1 - t;
  return mt * mt * a + 2 * mt * t * b + t * t * c;
};

/** Flatten a path to points. Curves are sampled, which is accurate enough for bounds. */
export function samplePath(d: string, perCurve = 16): Pt[] {
  const pts: Pt[] = [];
  let cx = 0;
  let cy = 0;
  for (const { cmd, args } of parsePath(d)) {
    if (cmd === 'M' || cmd === 'L') {
      cx = args[0];
      cy = args[1];
      pts.push({ x: cx, y: cy });
    } else if (cmd === 'C') {
      for (let s = 1; s <= perCurve; s++) {
        const t = s / perCurve;
        pts.push({
          x: cubicAt(t, cx, args[0], args[2], args[4]),
          y: cubicAt(t, cy, args[1], args[3], args[5]),
        });
      }
      cx = args[4];
      cy = args[5];
    } else if (cmd === 'Q') {
      for (let s = 1; s <= perCurve; s++) {
        const t = s / perCurve;
        pts.push({
          x: quadAt(t, cx, args[0], args[2]),
          y: quadAt(t, cy, args[1], args[3]),
        });
      }
      cx = args[2];
      cy = args[3];
    }
  }
  return pts;
}

export function pathBBox(d: string): BBox {
  const pts = samplePath(d);
  if (pts.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

export const bboxWidth = (b: BBox) => b.maxX - b.minX;
export const bboxHeight = (b: BBox) => b.maxY - b.minY;
export const bboxMinorAxis = (b: BBox) => Math.min(bboxWidth(b), bboxHeight(b));

/** True when `inner` sits entirely inside `outer` — used to catch untappable regions. */
export function bboxContains(outer: BBox, inner: BBox): boolean {
  return (
    outer.minX <= inner.minX &&
    outer.minY <= inner.minY &&
    outer.maxX >= inner.maxX &&
    outer.maxY >= inner.maxY
  );
}
