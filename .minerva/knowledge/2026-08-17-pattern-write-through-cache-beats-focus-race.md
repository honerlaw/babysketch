# A write-through cache beats a focus-reload versus debounced-write race

**Date**: 2026-08-17
**Type**: pattern
**Summary**: List screens reloading on focus can read stale files behind a debounced write
**Context**: .minerva/work/2026-08-17-toddler-coloring-app (see git history if the worktree has been cleaned up)

## Context

The gallery re-reads every drawing's saved colours on focus so thumbnails show what the child
coloured. The canvas screen saves on a ~400ms debounce, flushing on unmount. That looks
airtight and is not.

## Finding

The two are not synchronised, and the timing works against the obvious assumption. expo-router
emits `focus` from a plain effect reacting to a navigation-state index change — it is not
gated on the transition or animation completing — while react-native-screens keeps a popped
screen mounted until its pop animation finishes, roughly 300ms on iOS. The unmount flush that
actually writes the file therefore runs *after* the gallery's focus effect has already started
reading.

So a child who fills a region and immediately taps back — a completely natural sequence, and
well inside the 400ms debounce — can have the gallery read all 52 files before the write
lands, leaving the just-coloured drawing's thumbnail stale until some later focus transition.

The fix is not to win the race with a shorter debounce or a synchronous write. It is to remove
it: a write-through memory cache sits in front of the file layer, updated the moment state
changes and consulted first on read. The gallery then sees the latest picture regardless of
whether the disk write has landed, and the debounce goes back to being purely an I/O
optimisation. Flushing before `router.back()` as well is belt-and-braces, not the mechanism.

## Implications

Any screen pair where one edits behind a debounce and the other re-reads on focus has this
bug, whether or not it has been noticed — the window is a few hundred milliseconds and needs
a fast user to hit it, which describes a toddler exactly.

The cache is process-lifetime only, so it does not paper over a failed write across a restart;
that is what makes surfacing save failures a separate concern rather than a solved one. This
fix was reasoned from expo-router's and react-native-screens' actual lifecycle rather than
observed on a device, so it is best-effort until a simulator run confirms it.

## Related
- [[2026-08-17-constraint-fills-keyed-by-geometry]] — the other persistence defect from the same review pass
- [[2026-08-17-pattern-drawings-as-declarative-shape-data]] — what the cached state describes
