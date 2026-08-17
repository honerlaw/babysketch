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

- **Multi-child `<ClipPath>` unions correctly *against a standards SVG renderer*.**
  Checked by rendering the real drawing
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

## React 19 hook lint, during Stage A 2026-08-17

Back-filled: this cost real time during Stage A and I failed to write it down at the
time, which a later review pass rightly could not verify.

`eslint-plugin-react-hooks` 7.x ships error-level rules that shaped how the canvas is
written:

- `react-hooks/refs` — "Cannot access refs during render". The first `ColoringCanvas`
  kept the in-progress stroke in a `useRef` and built `Gesture.Pan()` inside a
  `useMemo` from handlers that read `livePoints.current`. Passing those handlers to
  `.onEnd()`/`.onFinalize()` counts as accessing the ref during render, five errors.
- `react-hooks/set-state-in-effect` then rejected the obvious workaround — setting an
  `ending` flag and committing the finished stroke from an effect.
- What actually works: keep the in-progress points in **state**, and build the gesture
  fresh each render (not memoised) so `onFinalize` closes over the current list. Every
  added point re-renders anyway, so there is nothing to memoise away.
- Separately, `react-hooks/exhaustive-deps` treats any dependency ending in `.current`
  as a ref and warns it is not a valid dependency — even when it is a plain state
  field. The canvas screen's editor state therefore names its field `art`, not
  `current`; that rename in commit `e5cb7e8` is the whole reason for the name.

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

Small corrections the validator or the contact sheet caught, recorded for completeness
rather than because any of them is interesting: the bee's antennae were 5 units wide and
the minimum-region floor rejected them at 6, so they went to 7; the ice cream's top scoop
sat above y=0 and was nudged back inside the viewBox; the dolphin used the mirrored
`eyes()` helper with `dx: 0` and stacked both eyes at one point. The bee case is worth one
sentence of interpretation: it is the minimum-region floor doing exactly its job on a
real drawing rather than in theory.

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

## Review triage 2026-08-17

Twelve findings, from the completion panel's skeptic and a fresh-context code review.
The triage panel accepted the disposition set 2/3; the dissent moved three of them and
is recorded below because it was right.

FIXED on this branch:

1. **[high] Load race discarded the child's first edit.** `loadArtwork` resolved and
   overwrote state unconditionally, so a tap before the file read landed was replaced by
   the loaded content and the armed timer then persisted the stale version. The picture
   and its undo history are now one state object with a `revision` counter, and a load
   only applies while `revision === 0`.
2. **[medium-high] Stale thumbnail after back-navigation.** expo-router emits `focus`
   from a plain effect while react-native-screens keeps the popped screen mounted through
   its pop animation, so the gallery could read all 52 files before the canvas's debounced
   write landed. Fixed by a write-through memory cache in `artwork-store.ts` that
   `loadArtwork` consults first, plus a flush before `router.back()` — the race is removed
   rather than won on timing.
3. **[medium] Saved fills were keyed by shape array index.** Now keyed by an FNV hash of
   the region's own path data, so colours survive reordering and insertion and a region
   whose geometry genuinely changed just loses its colour. Done now rather than deferred
   for a specific reason: nothing has shipped, so no save files exist in the wild — the
   same change after release would need a migration.
4. **[low] Impure state updaters.** `setUndoStack` was called from inside `setState`'s
   updater. One `Editor` state object makes every edit a single pure updater.
6. **[high] Silent save failures.** `saveArtwork` now returns whether the write landed and
   logs on failure; loads and clears log too. Scoped deliberately to logging — no
   user-facing failure UI, which would be new chrome the wordless design never accounted
   for and which could trip the wordlessness scan.
7. **[medium] Over-stated clipping claim** — the Stage A note above now says "against a
   standards SVG renderer" rather than implying native backends were covered.
11. **[low] Dead tap handler** on each colour-wheel sector removed; the pan recogniser's
   `onBegin` was already doing the work, and the comment now says so.

Also added: the registry test now rejects two fillable regions with identical geometry in
one drawing, since keying by geometry would make them share a fill.

DEFERRED (`SUGGEST`) — recorded, not changed:

5. Extract the duplicated three-layer SVG rendering shared by `coloring-canvas.tsx` and
   `drawing-thumbnail.tsx`. Deferred on the triage skeptic's argument, which persuaded me:
   it is a pure refactor of the exact rendering code whose native behaviour is unverified,
   and bundling it with three real bug fixes right before shipping multiplies regression
   risk for no correctness gain today.
8. Make the wordlessness test match import provenance, not tag names, so an aliased `Text`
   import cannot slip past.
9. Turn the static-render DOM check into a CI-gated assertion. It also only covers 36 of 52
   thumbnails, because `FlatList` virtualisation is doing its job.
12. Verify the native Metro bundle, not only the web one.

IGNORED:

10. Gesture objects rebuilt every render. Deliberate and commented: it is what lets
    `onFinalize` close over the current point list without reading a ref during render.

## Open question that survives this unit 2026-08-17

**The native rendering backends have never been exercised.** The clip-union check ran
against WebKit; the gesture wiring for brush, bucket, wheel selection, undo and clear was
never driven by a real finger; and the disk round-trip behind criterion 11 never ran. The
triage skeptic's sharpest point was that finding 7 ("fix the wording") and finding 12
("suggest") together dissolve what is really *one* load-bearing gap into two small ones.
It is one gap, and it is stated as one here: **before this is put in front of an actual
toddler, it needs a run on an iOS or Android simulator** covering paint containment, both
colouring modes, wheel selection, undo, long-press clear, and a force-quit/relaunch. The
fix for finding 2 in particular is a best-effort fix for a timing race that cannot be
confirmed shut without a device.

## Open question resolved 2026-08-17

The proposal asked whether the 6-unit minor-axis floor is a real tappability bar or just
a proxy. Answer from authoring all 52: the floor held and was never raised. It rejected
exactly one region across the whole set — the bee's antennae at 5 units — and widening
them to 7 was the right call rather than evidence the floor was wrong. It remains a
bounding-box proxy, so a long diagonal sliver could still pass it; nothing in this set is
shaped that way, and the chunky house style is what keeps that true.
