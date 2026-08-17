# A jest toolchain for Expo SDK 57 needs three non-obvious pins

**Date**: 2026-08-17
**Type**: constraint
**Summary**: Expo SDK 57 jest setup needs explicit tsconfig types, Babel 7, and inline presets
**Context**: .minerva/work/2026-08-17-toddler-coloring-app (see git history if the worktree has been cleaned up)

## Context

The project had no test framework. Four of the work unit's success criteria depended on
`npm test`, so a runner had to be added to an Expo SDK 57 / React Native 0.86 / React 19.2 /
TypeScript 6 project. A review panel refused to accept the proposal until the toolchain was
verified rather than assumed, which turned out to be the right call — all three findings
below appeared within minutes of actually trying it.

## Finding

Three things are required, and none is the default:

1. **`tsconfig.json` needs an explicit `"types": ["jest", "node"]`.** Under TypeScript 6 the
   ambient jest globals are not picked up automatically, even with `@types/jest` installed
   and no `types` restriction anywhere in `expo/tsconfig.base`. Without it every spec file
   fails `tsc --noEmit` with `TS2593: Cannot find name 'describe'`. Babel-based test runs
   still pass, because Babel strips types without checking them — so the gap only shows up
   at the typecheck gate, not in the test run.
2. **`@babel/core` must be pinned to `^7`.** `babel-preset-expo` calls `assertVersion('^7.0.0-0')`
   and throws during transform under `@babel/core@8`: *"Requires Babel ^7.0.0-0, but was loaded
   with 8.0.1"*. Installing `@babel/core@latest` alongside it is enough to break every test.
3. **Declare jest's Babel presets inline** in `jest.config.js`'s `transform` entry with
   `babelrc: false, configFile: false`, rather than adding a root `babel.config.js`. Metro
   reads a root Babel config, so a `babel.config.js` carrying `@babel/preset-env` would break
   the app bundle while making the tests pass.

The working combination: `jest`, `babel-jest`, `@babel/core@^7.28`, `@babel/preset-env`,
`@babel/preset-typescript`, `@types/jest`, `testEnvironment: 'node'`, and a
`moduleNameMapper` for the project's `@/*` path alias.

## Implications

Test targets that avoid React Native imports entirely — pure logic modules, or tests that
read source text off disk — need no `jest-expo` preset, no React renderer, and no native
mocks. That is worth preserving: it keeps the test path completely independent of the
RN/React version churn that makes renderer-based setups brittle. A future test that must
render a component will need `jest-expo` and will reopen all of this.

Any change to the Babel or TypeScript setup should be checked against BOTH `npx tsc --noEmit`
and `npx expo export --platform web`, because the two gates fail independently: finding 1 is
invisible to the test run, and finding 3 is invisible to the typecheck.

## Related
- [[2026-08-17-constraint-react19-hook-lint-gestures]] — the other toolchain constraint this repo's setup has to live with
