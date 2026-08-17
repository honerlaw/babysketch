# Follow-ups: toddler-coloring-app

## 2026-08-17

- **Run the app on an iOS or Android simulator.** The one genuinely open gap this unit
  shipped with. Cover paint containment (does the `<ClipPath>` union hold on the native
  backends, not just WebKit), both colouring modes, colour-wheel selection and drag-scrub,
  undo, long-press clear, and colour → force-quit → relaunch. Several fixes in this unit —
  notably the write-through cache closing the focus/write race — were reasoned from library
  lifecycles rather than observed, and are best-effort until this runs.
- Extract the duplicated three-layer SVG rendering shared by `coloring-canvas.tsx` and
  `drawing-thumbnail.tsx`. Deliberately deferred: it is a pure refactor of rendering code
  whose native behaviour is unverified, and bundling it with the review's bug fixes would
  have multiplied regression risk for no correctness gain. Worth doing once a simulator pass
  exists, because the gallery's correctness for freehand-coloured drawings depends on the two
  staying in lockstep.
- Make the wordlessness test match import provenance rather than JSX tag names.
  `react-native-svg` exports its own `Text`, so an aliased import would slip past the current
  regex. No such usage exists today.
- Turn the static-render DOM check into a CI-gated assertion. Today it is a manual
  `npx expo export --platform web` followed by inspecting the produced HTML; it also only
  covers 36 of 52 thumbnails, because `FlatList` virtualisation is doing its job.
- Verify the native Metro bundle, not only the web one.
