# Colouring-book drawings are declarative shape data, not image assets

**Date**: 2026-08-17
**Type**: pattern
**Summary**: Drawings are shape arrays whose path data is both fillable region and outline
**Context**: .minerva/work/2026-08-17-toddler-coloring-app (see git history if the worktree has been cleaned up)

## Context

BabySketch needs 52+ simple line drawings a toddler can colour, with a bucket tool that fills
"the space between the black lines". The obvious approach — ship bitmaps and run a pixel flood
fill — was considered and rejected: a flood fill over a ~1000x1000 buffer visits hundreds of
thousands of pixels per tap in JavaScript, anti-aliased outlines make fills leak or halo
without per-image tolerance tuning, persistence becomes a PNG per drawing, and it leaves the
actual hard problem — where 52 source images come from — completely unsolved.

## Finding

A drawing is data: `{ id, viewBox, shapes: Shape[] }` with `Shape = { d, fillable, ink? }`,
where `d` is SVG path data. The key property is that a shape's path data serves as **both**
the colourable region and the black outline. Because they are literally the same string, a
region is closed by construction and a bucket fill cannot leak past a line — the guarantee
comes from the data model rather than from tuning.

Rendering is three layers in one `<Svg>`: tappable fills, freehand strokes clipped to the
union of the fillable regions, then the outline drawn last so line art survives any amount of
paint. Bucket fill is O(1) — a tap sets one region's colour, with no pixel work at all.

The authoring rules that make this hold, each learned by having the validator reject a real
drawing:

- **One subpath per region** — starts `M`, ends `Z`. This keeps clip-union semantics
  independent of winding order, because each region is a separate `<Path>` inside the
  `<ClipPath>` rather than a multi-subpath path whose fill rule could punch holes.
- **Paint order is array order**, so a later shape wins both the paint and the tap.
- **Decoration is authored last.** A spot added before the body is enclosed by the body's
  bounding box, which the untappable-region check rejects.
- **Appendages must extend past their parent's bounding box** — an ear entirely inside the
  head reads as unreachable, for the same reason.
- **Smoothing helpers overshoot their own control points.** A `blobPath`-style smoothed shape
  with square corners pushed a wave to x[-12.2, 112.2] inside a 100-unit viewBox. Bands with
  straight edges use a dedicated `wave()` helper, and a heart needs explicit cubics — every
  attempt to compose one from circles plus a triangle leaves the triangle's top edge drawn
  straight through the middle once the outline layer paints.

## Implications

Each subject costs roughly 10-16 lines of declarative data, which is what makes 52 of them
tractable by hand at all. The same dataset serves the full-size canvas and the gallery
thumbnails, at any resolution, with no asset pipeline.

A machine-checked registry test is what keeps this honest across 52 hand-authored subjects: it
enforces the count, unique ids, single-subpath closed geometry, a minimum region size, and
that no region is enclosed by a later one. Bulk-authored data needs a mechanical gate, because
the failure mode at that volume is a silent one-character mistake, not a crash.

The accepted tradeoff: bucket fills only author-defined regions, never an arbitrary area a
child encloses with their own scribbles. For predefined colouring pages that costs nothing,
since every region is known ahead of time.

## Related
- [[2026-08-17-constraint-fills-keyed-by-geometry]] — how a region's colour is persisted, and why not by index
- [[2026-08-17-decision-seed-then-freeze-bulk-authoring]] — the ordering that let this format settle before 46 more drawings were authored against it
- [[2026-08-17-pattern-write-through-cache-beats-focus-race]] — see also
