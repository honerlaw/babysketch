# Persisted region colours are keyed by geometry, never by array index

**Date**: 2026-08-17
**Type**: constraint
**Summary**: Saved fills key on a hash of region path data, not the shape's array index
**Context**: .minerva/work/2026-08-17-toddler-coloring-app (see git history if the worktree has been cleaned up)

## Context

Each drawing's saved state records which colour a child put in which region. The first
implementation keyed those fills by the shape's position in the drawing's `shapes` array —
`fills: { "3": "#E23B3B" }` — which is the obvious choice and reads fine until someone edits
a drawing.

## Finding

Index keying is silently corrupting. Inserting a decorative spot, or reordering ears before
head in any of the 52 authored drawings, shifts every later index by one, so every saved
colour on every device reapplies to the wrong region on the next load. A payload version
field cannot catch it: the payload's *shape* is unchanged, only its *meaning*, so `v: 1`
still validates and the loader has no way to know.

Fills are therefore keyed by a 32-bit FNV hash of the region's own path data. Colours then
survive reordering and insertion, and a region whose geometry genuinely changed simply loses
its colour — which is the safe direction to fail, because an uncoloured region invites the
child to colour it again while a mis-coloured one just looks broken.

The corollary the registry test now enforces: two fillable regions with identical geometry in
one drawing would hash to the same key and always fill together. That was already an
authoring mistake — they wanted to be one region — so the test rejects it rather than
tolerating the collision.

## Implications

This has to be decided before a release, not after. While nothing has shipped there are no
save files in the world, so changing the key scheme is free; once a child has coloured
anything the same change needs a migration that reads the old index-keyed payload, maps it
through the shapes array as it existed at the time, and rewrites it. Any persisted reference
into a hand-authored data set should be checked for the same hazard.

## Related
- [[2026-08-17-pattern-drawings-as-declarative-shape-data]] — the data model whose regions these keys point at
- [[2026-08-17-pattern-write-through-cache-beats-focus-race]] — the other persistence defect this work unit's review pass found
