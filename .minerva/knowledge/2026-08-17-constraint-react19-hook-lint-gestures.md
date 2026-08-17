# React 19's hook lint rules dictate how gestures are built here

**Date**: 2026-08-17
**Type**: constraint
**Summary**: react-hooks lint forbids ref reads during render, forcing state-based gesture handlers
**Context**: .minerva/work/2026-08-17-toddler-coloring-app (see git history if the worktree has been cleaned up)

## Context

The colouring canvas collects finger positions during a pan gesture and commits them as a
stroke when the gesture ends. The natural React Native implementation keeps the in-progress
points in a `useRef` — it avoids a re-render per point — and builds the `Gesture.Pan()` inside
a `useMemo`.

This entry is back-filled testimony rather than a diff. The failed attempts were never
committed, so the record is the lint output quoted below and the shape of the code that
survived, not a reverted commit. A review pass checked an earlier version of this note that
claimed a specific commit showed the final rename; it does not, and the claim was withdrawn.

## Finding

`eslint-plugin-react-hooks` 7.x ships error-level rules that make that natural implementation
unbuildable:

- **`react-hooks/refs`** — *"Cannot access refs during render"*. Passing handlers that read
  `livePoints.current` into `.onEnd()` / `.onFinalize()` counts as accessing the ref during
  render, because the handler is handed over while rendering even though it runs later. Five
  errors from one `useMemo`.
- **`react-hooks/set-state-in-effect`** — rejects the obvious workaround of flipping an
  `ending` flag in `onFinalize` and committing the stroke from an effect.

What works: keep the in-progress points in **state**, and build the gesture fresh on each
render rather than memoising it, so `onFinalize` closes over the current list. Rebuilding
looks wasteful and is not — every added point re-renders anyway, so there is nothing to
memoise away.

Separately, `react-hooks/exhaustive-deps` treats any dependency path ending in `.current` as a
ref and warns that it is not a valid dependency, **even when it is a plain state field**. A
state object whose field was named `current` produced *"Mutable values like 'editor.current'
aren't valid dependencies"*; renaming the field to `art` cleared it.

## Implications

Gesture code in this repo should not reach for refs to avoid re-renders — the lint rules will
reject it, and the state-based version is fast enough for a finger-tracking stroke. Anyone
"optimising" a gesture back into a memoised ref-reading handler will reintroduce five lint
errors.

Do not name a state field `current`. The lint heuristic is textual, so the collision is with
the *name*, not with any actual mutability.

## Related
- [[2026-08-17-constraint-expo57-ts6-test-toolchain]] — the other toolchain constraint this repo's setup has to live with
