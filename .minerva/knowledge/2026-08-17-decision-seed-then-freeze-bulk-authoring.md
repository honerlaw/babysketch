# Bulk-authored data gets a seed-then-freeze ordering inside one work unit

**Date**: 2026-08-17
**Type**: decision
**Summary**: Build the engine against awkward seed items, freeze the format, then author in bulk
**Context**: .minerva/work/2026-08-17-toddler-coloring-app (see git history if the worktree has been cleaned up)

## Context

The work unit's dominant cost was authoring 52 drawings against a data format being designed
in the same unit. That is the classic setup for expensive rework: discover late that the
schema is wrong and every already-authored file needs revisiting.

A consensus panel deadlocked on this twice — 1/3 accept both rounds — arguing the bulk
authoring should be split into a follow-on work unit so the format could be proven by a
shipped, running app first. It was escalated to the user, who chose to keep everything in one
unit with a staged ordering instead.

## Finding

Build the entire engine against a small set of **deliberately awkward** seed items, commit
that checkpoint and freeze the format, then author the remainder as pure data entry.

Here that was six seeds chosen to stress the schema rather than to be easy: a giraffe for thin
appendages, a dolphin over a wave for layered regions, a butterfly for a multi-part
silhouette, plus three ordinary animals. The freeze is a distinct commit whose message says so,
which makes the boundary visible in history rather than being a claim in a document.

The reasoning that settled the escalation: the panel's objection was about *risk*, not scope,
and the ordering delivers the same risk reduction as a unit split — a wrong schema is
discovered while only six files exist either way — while a split would have shipped the user
materially less than they asked for. Narrowing an explicitly stated scope is the user's call,
not the implementer's.

## Implications

Choose seed items for the *awkwardness* they exercise, not for how quickly they can be
written. A seed set of easy cases passes every exit criterion while proving nothing, which was
the strongest objection raised against this approach and is the way it fails.

The ordering only works if the freeze is real. Pair it with a machine-checked validator over
the bulk-authored data, so a violation of the frozen format is a failing test rather than
something noticed later by eye.

The general shape: when process ceremony and a stated requirement conflict, look for the
mechanism the ceremony was protecting and satisfy that mechanism directly. Two panels agreed
the answer was "split"; what they actually wanted was "prove the schema before paying the bulk
cost", and an ordering constraint bought that without cutting scope.

## Related
- [[2026-08-17-pattern-drawings-as-declarative-shape-data]] — the format this ordering existed to protect
