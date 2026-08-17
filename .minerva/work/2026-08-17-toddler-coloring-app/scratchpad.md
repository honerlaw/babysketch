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
- [3/3 accept] completion verification: all three panellists independently re-ran `tsc`, `expo lint` and `jest`; accepted that criteria 1-6 and 13-15 are fully met, that 7 is met against a statically rendered DOM, and that 8-12 have their logic tested but their gesture wiring unverified for want of a simulator

## Panel concerns 2026-08-17

Carried forward from the approach panel (must be the first two things checked in Stage A):

- Multi-child `<ClipPath>` union semantics are asserted, not verified, for `react-native-svg` specifically — the library has a history of iOS/Android clip divergence. Fallback ladder is in the proposal; taking a fallback is a load-bearing divergence and triggers a replan.
- Overlapping fillable regions must stay individually tappable under the array-order rule. Verify on the seed drawing chosen for layered regions.

Carried forward from the proposal panel (fix before marking the related criterion done):

- The 6-unit minor-axis bounding-box floor is a proxy for tappability, not a proof — a diagonal sliver can pass it. Raise the floor during Stage A if seed authoring shows regions that feel hard to hit.
- Criteria 13 and 15 are manual checks, not machine-verifiable, unlike 1-6 and 14.

## Stage A findings 2026-08-17

The two checks the approach panel demanded before anything else:

- **Multi-child `<ClipPath>` unions correctly.** Verified by rendering the real drawing
  data through the exact layer structure `ColoringCanvas` emits, with a stroke authored to
  run deliberately off the subject (`p: [2, 8, 30, 40, 55, 55, 95, 92]`), then rasterising
  with `qlmanage` (WebKit). On both the cat and the dolphin the stroke appears only inside
  the subject's regions and nowhere on the background. No fallback needed, so no replan.
  Caveat: this exercises a standards SVG renderer, not react-native-svg's iOS/Android
  backends. The SVG structure is right; per-platform behaviour is unverified here.
- **Overlapping regions stay individually addressable.** Array order determines both paint
  order and tap precedence as designed — confirmed by the butterfly (body over four wings)
  and the cat (head over ears): each region renders separately and none is swallowed.

Cosmetic finding, accepted rather than fixed: because the outline layer draws last, the
outline of a shape that sits *behind* another is still visible through it (an ear's base
across the head, the giraffe's neck edges across the body). It reads as chunky segmented
parts, and each visible line is a genuine region boundary the child can fill — so it works
*for* the product rather than against it. Not a divergence from the proposal; it is what
"outline drawn last" necessarily looks like.

Fixed while looking: the dolphin used the mirrored `eyes()` helper with `dx: 0`, stacking
both eyes at one point. Side-on subjects now use a new single `eye()` helper.

## Verification not possible in this environment 2026-08-17

No browser automation (the Chrome extension is not connected) and no simulator, so the
interactive criteria — 7, 8, 9, 10, 11, 12 — were NOT exercised by hand. What was verified
mechanically: the web bundle builds and serves (HTTP 200, 7.3MB, resolving react-native-svg,
expo-file-system and gesture-handler), typecheck, lint, and the full test suite. The
interactive criteria remain unverified and are reported as such.

## Stage B 2026-08-17

46 more subjects authored against the frozen format, for 52 total: 16 land animals,
11 sea (10 creatures plus an ice cream, so the gallery is not wall-to-wall animals),
8 birds and bugs, 11 everyday objects.

Three authoring rules emerged and are now the house style, each because the validator
caught the violation:

- **Decoration goes last.** A spot or stripe added before the body trips the
  covered-region check, because the body's bounding box then encloses it. Put
  decorative regions after every structural one and the check passes by construction.
- **Ears must poke past the head.** Same check, same reason: an ear entirely inside
  the head's bounding box reads as untappable and is rejected.
- **`blobPath` overshoots its own control points.** Smoothing a shape with square
  corners pushed the dolphin's wave to x[-12.2, 112.2] — well outside a 100-unit
  viewBox. Bands with straight edges use the new `wave()` helper instead, and the
  heart needed explicit cubics rather than any composition of primitives, because
  circles-plus-a-triangle leaves the triangle's top edge drawn straight through the
  middle once the outline layer paints.

Redrawn after looking at a rendered contact sheet of all 52: the heart (was unreadable
as a heart), the apple, the flamingo (read as a goose), and one weak composition
replaced outright by the ice cream.

## Static-render verification 2026-08-17

`npx expo export --platform web` static-renders the routes, which turned criterion 7
from an unverifiable claim into a real check against the produced DOM:

- 36 `<svg>` thumbnails in the gallery route (36 rather than 52 is `initialNumToRender`
  plus `windowSize` — the virtualization working), 823 `<path>` elements, and 72
  clip-path references, i.e. two per thumbnail: the `<clipPath>` definition and the
  attribute referencing it.
- **Zero visible text nodes** in `<body>` after stripping tags, scripts and styles.
- 36 `aria-label`s survive, so the wordless UI is still navigable by a parent's
  screen reader.

## Panel concerns 2026-08-17 (completion verification)

Carried into the review phase rather than fixed at the gate:

- **[high] Silent save failures.** `artwork-store.ts` wraps `ensureDir`, `loadArtwork` and
  `saveArtwork` in try/catch with empty or comment-only catch blocks. Degrading a corrupt
  *load* to a blank picture is deliberate and right; extending the same silence to *saves*
  means a child's colouring can vanish — disk full, permission denial, storage eviction —
  with no log, no retry and no indicator. The architecture currently has no path to ever
  learning a save failed.
- **[high] The clipping claim is over-stated by one word.** The `qlmanage` check exercises
  WebKit's SVG renderer, not react-native-svg's CoreGraphics (iOS) or Skia-derived (Android)
  backends, which is the exact divergence the approach panel asked about. Saying "the
  clipping half is verified" drops that hedge; the honest claim is "verified against a
  standards SVG renderer; native backends unverified".
- **[medium] The wordlessness test matches tag names, not import provenance.**
  `react-native-svg` exports its own `Text`; an aliased import would slip past. No such
  usage exists today.
- **[medium] The static-render check covers 36 of 52 thumbnails** (virtualisation) and is a
  one-off manual `expo export` inspection, not a CI-gated assertion that would catch a
  regression.
- **[low] Gesture objects are rebuilt every render** in `coloring-canvas.tsx` and
  `color-wheel.tsx`. Deliberate, so `onFinalize` closes over the current points, but
  non-idiomatic for `GestureDetector`.
- **[low] Dead tap handler.** Each colour-wheel sector carries `onPress` while the wrapping
  `GestureDetector` runs `Gesture.Pan().minDistance(0)` whose `onBegin` already selects; the
  pan recogniser likely claims the touch first.
- **[low] Only the web bundle was checked**, never the native Metro bundle.
