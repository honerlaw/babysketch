# Proposal: toddler-coloring-app

**Date**: 2026-08-17
**Status**: Draft

## Goal

Turn this untouched Expo starter into BabySketch: a wordless coloring-book app a toddler can
operate alone. A gallery of 52 simple black-and-white line drawings (elephant, dolphin, dog,
cat, ...); tap one to open it; color it either by dragging a finger (freehand) or by tapping a
region to flood it with the selected color (bucket); pick colors from a visual color wheel.
Every drawing's coloring is saved to local storage automatically and is still there after the
app is killed and relaunched. The interface contains no words at all.

## Why

The user asked for exactly this and the repo is currently the stock `create-expo-app` template
(Home/Explore demo tabs) — there is no product here yet. The audience sets the hard constraints:
a toddler cannot read, cannot be taught a gesture vocabulary, has poor fine motor control, and
will hand the device to a parent the moment something feels broken. That drives three
non-obvious requirements — no text anywhere, large forgiving touch targets, and coloring that
survives an app restart without anyone pressing a save button.

## Approach

**Chosen: declarative shape-composed SVG, with colorable regions as first-class data objects.**

Two alternatives were considered and rejected. A **Skia raster canvas with pixel flood fill**
would allow filling any enclosed area, including areas the child's own scribbles enclose, but a
flood fill over a ~1000x1000 buffer visits hundreds of thousands of pixels per tap in JS —
visibly janky on the low-end tablets toddlers actually get handed — anti-aliased outlines make
fills leak or halo without per-image tolerance tuning, persistence becomes a PNG per drawing,
and it does not solve where 52 source bitmaps come from. A **hybrid (SVG outlines over a Skia
paint surface)** pays every one of those costs and additionally requires keeping two coordinate
spaces in lockstep. Since the images are *predefined*, their regions are known ahead of time, so
the raster generality buys nothing the product needs.

### Data model

A drawing is data, not an asset:

```ts
type Shape = { d: string; fillable: boolean; ink?: boolean };
type Drawing = { id: string; viewBox: [number, number]; shapes: Shape[] };
```

`d` is SVG path data in a 100x100 coordinate space. Each subject is composed from chunky
primitives into roughly 8-16 shapes. Because the fill geometry and the outline geometry are
*literally the same string*, every colorable region is closed by construction and a fill can
never leak past a line.

### Rendering — three layers in one `<Svg>`

1. **Fill layer** — one `<Path d fill={fills[i] ?? paper} onPress={...}>` per fillable shape.
   Bucket fill is therefore O(1): a tap sets that region's color. No pixel work at all.
2. **Freehand layer** — committed strokes plus the in-progress stroke, wrapped in
   `<G clipPath="url(#art)">`, where the clip holds one `<Path>` per fillable region so paint
   stays inside the subject's silhouette instead of smearing across the background.
3. **Outline layer** — every shape re-rendered `stroke fill="none"`, plus `ink` shapes filled
   solid black. Drawn last, so the line art is never covered by paint and `ink` details (eyes,
   nostrils, whiskers) can never be painted over or bucket-filled.

### Interaction

- **Mode toggle** — two icon buttons (crayon / paint bucket). No words.
- **Freehand** — a `react-native-gesture-handler` `Pan`, `.enabled(mode === 'brush')` so that in
  bucket mode taps pass through to the SVG children instead of being swallowed. Touch points are
  converted from view coordinates to viewBox coordinates using the measured canvas layout.
  Points closer than 1.2 viewBox units to the previous point are dropped, which keeps stroke
  data small without visibly changing the line. Stroke data is bounded so it cannot grow without
  limit across repeat sessions: at most 600 points per stroke and at most 400 strokes per
  drawing, with the oldest strokes dropped past that ceiling.
- **Bucket** — `onPress` on a fill-layer `<Path>`. A tap that lands on no region is a no-op.
- **Color wheel** — geometry is fixed in points so the touch-target claim is checkable. A ring
  of **12 hue sectors** drawn as SVG annulus paths, outer radius 112pt and inner radius 64pt, so
  each sector is 48pt thick radially and subtends 2*pi*88/12 = ~46pt of arc at its mid-radius —
  both dimensions clear 44pt. (24 sectors was the first draft and was cut: at this radius it
  would give only ~23pt of arc per sector, well under the toddler touch-target floor.) A centre
  disc of radius 52pt previews the currently selected color. Six neutrals (white, black, grey,
  brown, tan, pink) sit beneath the wheel as circular swatches 56pt in diameter. Dragging a
  finger around the ring scrubs the selection continuously as it crosses sectors — this is the
  "scroll through and select visually" the request describes — and tapping a sector selects it
  directly.
- **Undo** — single tap, backed by a bounded in-memory stack (last 40 states of
  `{fills, strokes}`). Snapshots share structure rather than deep-copying: a fill pushes a new
  `fills` object beside the *same* `strokes` array reference, and a stroke pushes a new `strokes`
  array beside the same `fills` reference, so 40 snapshots cost 40 shallow objects, not 40 copies
  of a 400-stroke drawing. The undo stack is deliberately *not* persisted; undo history does not
  survive leaving the screen.
- **Clear** — long-press only (600ms), so a toddler cannot wipe a finished picture with a
  stray tap. **Clear pushes the pre-clear state onto the undo stack**, so an accidental
  long-press is recoverable with one undo tap.

### Authoring rules (enforced by tests where mechanically checkable)

- Every fillable `d` is a **single subpath**: exactly one `M`, terminated by `Z`. This makes the
  clip-path union winding-order-independent, because each region is a separate `<Path>` element
  inside the `<ClipPath>` rather than a multi-subpath path where fill-rule cancellation could
  punch holes. A region that visually needs a hole is expressed by layering a smaller region
  *on top*, never by punching one.
- **Paint order is array order; later shapes sit on top.** Where two fillable regions overlap,
  the later one wins the tap in the overlap area. Authors therefore order shapes back-to-front
  (body, then head, then ear) and must never let a region be *entirely* covered by later ones,
  or it becomes untappable. This is not left to author discipline: the registry test flags any
  fillable region whose bounding box is fully contained within the bounding box of a *later*
  fillable region. Bounding-box containment is a conservative approximation of "entirely
  covered" — it can flag a region that is in fact still reachable, which is the safe direction
  to err, and any flagged pair is resolved by reordering or reshaping.
- Every fillable region's bounding box is at least 6 units on its minor axis in the 100-unit
  viewBox. This is a floor that rules out sliver regions; it is not a guarantee of tappability
  for diagonal or curved shapes, so the authoring style is deliberately chunky throughout.
- Drawings live in `src/drawings/`, grouped by theme, re-exported through a single registry.

### Persistence

Per-drawing JSON at `<documentDirectory>/artwork/<id>.json` via `expo-file-system`'s modern
`File` / `Paths` class API (SDK 57 dropped the legacy `FileSystem.*` function API). Payload is
`{ v: 1, fills: Record<string, string>, strokes: Stroke[] }`, where each fill is keyed by a
hash of its region's own path data rather than the region's index in the shapes array, so
reordering or inserting a shape can never reapply saved colours to the wrong regions. Saves are debounced ~400ms after
the last change, flushed when the canvas unmounts, and flushed again on an `AppState` transition
away from `active`, and once more immediately before back-navigation — without those, a
toddler swiping the app away or tapping back inside the debounce window would silently lose
their most recent stroke. A write-through memory cache sits in front of the files so the
gallery reads the latest picture even while a write is still pending. The loader returns blank state for an
unrecognized `v`, unparseable JSON, or a missing file, so a corrupt save degrades to an
uncolored picture and never crashes. The module is split so that pure serialize/deserialize
logic is testable with no Expo imports.

### New dependencies

Installed with `npx expo install` so SDK 57 picks compatible versions:

- `react-native-svg` — the entire rendering approach depends on it (fills, `onPress` hit-testing,
  `ClipPath`). `react-native-gesture-handler` is already a dependency.
- `expo-file-system` — persistence.

Test tooling, installed as devDependencies with plain `npm i -D`:

- `jest`, `babel-jest`, `@babel/core@^7.28`, `@babel/preset-env`, `@babel/preset-typescript`,
  and **`@types/jest`**. The type package is not optional: `tsconfig.json` sets no `types`
  restriction and its `include` covers every `.ts`/`.tsx` file, so a spec file calling
  `describe`/`it`/`expect` without ambient jest types fails success criterion 1 (`tsc --noEmit`).
  The Babel verification below would not have caught that, because Babel strips types without
  checking them.

A `"test": "jest"` script is added to `package.json`, and `jest.config.js` maps the project's
path alias with `moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }` so tests resolve `@/...`
imports the same way the app does.

**This toolchain was verified empirically this session, not assumed.** In a scratch project a
test importing a TypeScript module through the `@/` path alias compiled and passed under
`jest@30` with `@babel/core@7.29.7`. Two findings drove the choice:

- `babel-preset-expo` (the React Native preset) **fails** when `@babel/core@8` is installed —
  it asserts `^7.0.0-0` and throws during transform. Avoiding the RN preset in the test path
  avoids that whole class of version friction.
- The Babel presets are declared **inline in `jest.config.js`'s `transform` entry** with
  `configFile: false, babelrc: false`, so no root `babel.config.js` is introduced. This matters:
  a root babel config carrying `@babel/preset-env` would be picked up by Metro and break the
  Expo app build. The app's bundling path is left completely untouched by the test setup.

No React renderer, no `@testing-library/react-native`, and no native-module mocks are needed,
because every test target is either a pure TypeScript module (registry, geometry, wheel math,
serialization) or a static read of source text (the wordlessness scan). `testEnvironment` is
`node`.

### Screens (expo-router)

- `/` — gallery: a virtualized `FlatList` grid of SVG thumbnails rendering each drawing's saved
  colors. Thumbnails render **all three layers**, freehand strokes included, because success
  criterion 11 requires a drawing coloured purely by dragging to show up in the gallery — a
  thumbnail that skipped strokes would leave freehand work invisible there forever. Strokes are
  cheap to draw here because a thumbnail is static: no gesture handler, no interactivity, and
  stroke counts are already capped. Saved colorings are loaded by a **single
  asynchronous batch read on first focus** into an in-memory cache — never a synchronous
  read-and-parse of 52 files on mount — and returning from the canvas refreshes only the one
  drawing that changed. `initialNumToRender` is bounded so first paint does not depend on all
  52 thumbnails mounting.
- `/color/[id]` — canvas: the drawing, the color wheel, mode toggle, undo, clear, back.
- The starter demo is removed outright, not just unrouted. `src/app/explore.tsx`,
  `src/components/app-tabs.tsx` (+ its `.web` variant), `themed-text.tsx`, `hint-row.tsx`,
  `web-badge.tsx`, `external-link.tsx`, `animated-icon.tsx` (+ `.web` and `.module.css`) and
  `ui/collapsible.tsx` are deleted, and `src/app/_layout.tsx` is rewritten from a native tab
  layout to a plain `Stack`. This is required work, not tidying: `themed-text.tsx` renders
  `<Text>`, `hint-row.tsx` and `ui/collapsible.tsx` render `<ThemedText>`, and `app-tabs.tsx`
  mounts a tab bar with literal "Home" and "Explore" labels — so success criterion 5's scan of
  `src/components/**` fails while any of them remain, and the tab bar would show words on screen
  regardless.

### Staged implementation (chosen by the user when the scope panel escalated)

- **Stage A** — build the entire engine against **6 deliberately awkward seed drawings** chosen
  to stress the schema: thin appendages, overlapping/layered regions, a multi-part silhouette,
  plus simpler cases. The **first two things checked** are the two gaps the approach panel
  flagged: (a) that a multi-child `<ClipPath>` really does union on `react-native-svg` rather
  than diverging per platform, and (b) that overlapping regions stay individually tappable under
  the array-order rule. Stage A exits when the app runs, all six behaviors work, and typecheck +
  tests + lint pass.
- **Stage B** — only then is the format frozen and the remaining 46 drawings authored as pure
  data entry. The Stage A exit is a distinct commit so the boundary is visible in history.

If (a) fails, the fallback is a single concatenated clip path with `clipRule="nonzero"`; if that
also fails, freehand renders unclipped beneath the outline layer and the containment guarantee is
dropped and recorded. Either fallback is a load-bearing divergence and triggers a replan.

## Success criteria

Each item is answerable yes/no by running a command or performing one stated action.

1. `npx tsc --noEmit` exits 0.
2. `npm run lint` exits 0.
3. `npm test` exits 0.
4. A registry test asserts: at least 50 drawings are registered; all ids are unique; every
   drawing has a viewBox; every drawing has at least 3 fillable regions; every fillable `d`
   starts with exactly one `M` and ends with `Z`; every fillable region's bounding box is at
   least 6 units on its minor axis.
5. A wordlessness test **statically scans the source text** of `src/app/**` and
   `src/components/**` and asserts no file renders a `<Text`, `<ThemedText`, or `<RNText` JSX
   element. It reads files with `fs`, so it needs no React renderer and no native mocks.
   `accessibilityLabel` and `accessibilityHint` string props are explicitly permitted and are
   not counted as rendered text — the requirement is that a toddler sees no words, not that a
   parent's screen reader is starved.
6. Serialization round-trips: a test asserts `deserialize(serialize(state))` equals the input,
   and that unparseable JSON, a missing file, and an unrecognized `v` each yield blank state
   rather than throwing.
7. Launching the app shows a grid of drawing thumbnails and no words.
8. In brush mode, dragging a finger across the drawing leaves a stroke in the selected color
   that follows the finger and does not extend outside the subject's silhouette.
9. In bucket mode, tapping inside a region fills exactly that region with the selected color,
   and neighbouring regions are unchanged.
10. Tapping a color-wheel sector changes the color used by both subsequent brush strokes and
    subsequent bucket fills.
11. Coloring a drawing, force-quitting the app, and relaunching shows the coloring still
    present both on the canvas and on that drawing's gallery thumbnail.
12. Undo reverts the most recent stroke or fill. Long-pressing clear resets the drawing; a
    single tap on clear does not.
13. The Stage A -> Stage B boundary is a distinct commit whose message records that the data
    format is frozen.
14. The registry test flags no fillable region whose bounding box is fully contained within a
    later fillable region's bounding box.
15. No root `babel.config.js` is introduced, and `npx expo start` still bundles the app — the
    test toolchain does not touch the Metro build path.

## Open Questions

- Whether `react-native-svg`'s multi-child `<ClipPath>` unions consistently across iOS and
  Android is resolved empirically in Stage A rather than assumed; the fallback ladder is in the
  Approach section and a fallback triggers a replan.
- The 6-unit minor-axis floor is a proxy for tappability, not a proof of it. If seed authoring
  shows chunky-style regions still feel hard to hit, the floor is raised during Stage A while
  only 6 drawings exist.
- Landscape orientation and tablet-specific layout are out of scope for this unit; the app is
  portrait-locked. Sharing/printing artwork is also out of scope.
