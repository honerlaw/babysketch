import type { Drawing } from '@/types/drawing';
import { shapeKey } from '@/lib/artwork-state';
import { bboxContains, bboxMinorAxis, parsePath, pathBBox } from '@/lib/path';

/**
 * Registry invariants. These exist because 46 of the 52 drawings are authored as
 * bulk data entry after the format freezes, and hand-written path data is exactly
 * where a silent defect slips in at that volume.
 */
export const MIN_REGION_MINOR_AXIS = 6;
export const MIN_FILLABLE_REGIONS = 3;

export function validateDrawing(drawing: Drawing): string[] {
  const errors: string[] = [];
  const where = (i: number) => `${drawing.id}[${i}]`;

  if (!drawing.id || !/^[a-z0-9-]+$/.test(drawing.id)) {
    errors.push(`${drawing.id}: id must be lowercase kebab-case`);
  }
  if (!drawing.viewBox || drawing.viewBox.length !== 2) {
    errors.push(`${drawing.id}: viewBox must be [width, height]`);
    return errors;
  }
  const [vw, vh] = drawing.viewBox;
  if (vw <= 0 || vh <= 0) errors.push(`${drawing.id}: viewBox must be positive`);

  const fillable = drawing.shapes.filter((s) => s.fillable);
  if (fillable.length < MIN_FILLABLE_REGIONS) {
    errors.push(
      `${drawing.id}: needs at least ${MIN_FILLABLE_REGIONS} fillable regions, has ${fillable.length}`,
    );
  }

  drawing.shapes.forEach((shape, i) => {
    if (shape.fillable && shape.ink) {
      errors.push(`${where(i)}: a shape cannot be both fillable and ink`);
    }

    let segs;
    try {
      segs = parsePath(shape.d);
    } catch (e) {
      errors.push(`${where(i)}: ${(e as Error).message}`);
      return;
    }

    const moves = segs.filter((s) => s.cmd === 'M');
    if (moves.length !== 1) {
      errors.push(`${where(i)}: must be a single subpath (found ${moves.length} M commands)`);
    }
    if (segs.length === 0 || segs[0].cmd !== 'M') {
      errors.push(`${where(i)}: must start with M`);
    }
    if (segs.length === 0 || segs[segs.length - 1].cmd !== 'Z') {
      errors.push(`${where(i)}: must be closed with Z`);
    }
    if (segs.some((s) => s.args.some((a) => !Number.isFinite(a)))) {
      errors.push(`${where(i)}: contains a non-finite coordinate`);
    }

    const box = pathBBox(shape.d);
    if (box.minX < -0.5 || box.minY < -0.5 || box.maxX > vw + 0.5 || box.maxY > vh + 0.5) {
      errors.push(`${where(i)}: extends outside the viewBox`);
    }
    if (shape.fillable && bboxMinorAxis(box) < MIN_REGION_MINOR_AXIS) {
      errors.push(
        `${where(i)}: fillable region minor axis ${bboxMinorAxis(box).toFixed(1)} is below ${MIN_REGION_MINOR_AXIS}`,
      );
    }
  });

  // Saved colours are keyed by a hash of the region's own path data, so two
  // fillable regions with identical geometry in one drawing would share a key and
  // always fill together. Authoring them as one region is what was meant anyway.
  const seenGeometry = new Map<string, number>();
  drawing.shapes.forEach((shape, i) => {
    if (!shape.fillable) return;
    const key = shapeKey(shape.d);
    const first = seenGeometry.get(key);
    if (first !== undefined) {
      errors.push(`${where(i)}: identical geometry to ${where(first)} — they would share a fill`);
    } else {
      seenGeometry.set(key, i);
    }
  });

  // Paint order is array order, so a fillable region completely covered by a later
  // one can never be tapped. Bounding-box containment over-reports rather than
  // under-reports, which is the safe direction for a reachability check.
  const boxes = drawing.shapes.map((s) => (s.fillable ? pathBBox(s.d) : null));
  for (let i = 0; i < boxes.length; i++) {
    const inner = boxes[i];
    if (!inner) continue;
    for (let j = i + 1; j < boxes.length; j++) {
      const outer = boxes[j];
      if (outer && bboxContains(outer, inner)) {
        errors.push(`${where(i)}: fully covered by later fillable region ${where(j)} — untappable`);
      }
    }
  }

  return errors;
}

export function validateRegistry(drawings: readonly Drawing[]): string[] {
  const errors = drawings.flatMap(validateDrawing);
  const seen = new Set<string>();
  for (const d of drawings) {
    if (seen.has(d.id)) errors.push(`duplicate drawing id: ${d.id}`);
    seen.add(d.id);
  }
  return errors;
}
