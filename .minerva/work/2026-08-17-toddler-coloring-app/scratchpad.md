# Scratchpad: toddler-coloring-app

> **Ephemeral working memory.** Most of what lands here is noise — small
> decisions that don't matter, dead ends, momentary confusion. At feature
> completion, run `minerva:promote`: significant items get promoted to
> `.minerva/knowledge/`, `proposal.md` gets updated to match reality, and
> the raw scratchpad is archived.

## Panel decisions 2026-08-17

- [escalated to user] scope check: panel deadlocked 1/3 twice — dissenters wanted bulk 50+ drawing authoring split into a follow-on unit; user chose "one unit + hard freeze gate", keeping the full 52 in this unit with a Stage A seed / freeze / Stage B ordering
- [3/3 accept] approach selection: option B, declarative shape-composed SVG with regions as first-class data (rejected: A — Skia raster flood fill, jank + fill leakage + PNG-per-drawing storage + unsolved artwork pipeline; C — SVG/Skia hybrid, pays A's costs and doubles the surface area)
- [3/3 accept] whole-proposal acceptance (round 2, after 1/3 in round 1): round 1 dissent was that no test framework was named though 4 of 13 success criteria depend on `npm test`; closed by verifying the toolchain empirically before re-voting

## Panel concerns 2026-08-17

Carried forward from the approach panel (must be the first two things checked in Stage A):

- Multi-child `<ClipPath>` union semantics are asserted, not verified, for `react-native-svg` specifically — the library has a history of iOS/Android clip divergence. Fallback ladder is in the proposal; taking a fallback is a load-bearing divergence and triggers a replan.
- Overlapping fillable regions must stay individually tappable under the array-order rule. Verify on the seed drawing chosen for layered regions.

Carried forward from the proposal panel (fix before marking the related criterion done):

- The 6-unit minor-axis bounding-box floor is a proxy for tappability, not a proof — a diagonal sliver can pass it. Raise the floor during Stage A if seed authoring shows regions that feel hard to hit.
- Criteria 13 and 15 are manual checks, not machine-verifiable, unlike 1-6 and 14.
