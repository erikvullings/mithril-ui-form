# 0005 Document or remove getPath's undocumented fuzzy ID-matching heuristic

Status: open
Priority: low
Subsystem: mithril-ui-form
Depends on: none

## Context
`getPath(obj, path)` in `packages/mithril-ui-form/src/utils/index.ts:27-62` looks like plain path traversal, but for array segments (lines 43-55) it silently attempts a regex-based heuristic: it lowercases the first letter of a capitalized path segment and searches the array for an object whose matching property equals the *original key string itself* (not a value lookup — a property-name-to-key-string comparison). None of this is visible from the `(obj, path) => any` signature. It's exercised implicitly by `evalExpression`/`checkExpression` (utils/index.ts:73-117) and `resolveExpression` (utils/index.ts:142-146), which underpin all `show`/placeholder conditional logic throughout `form-field.ts` and `layout-form.ts`. Found during an architecture review (`/improve-codebase-architecture`) — a shallow-looking-deep case where the interface hides a behavior a caller must know about to predict `show` conditions on array paths.

## Acceptance Criteria
- First: determine whether the heuristic is load-bearing (used by any real form definition/example) or vestigial. Check `packages/example` and any published form JSON for path expressions that would only work via this heuristic.
- If load-bearing: split it into an explicitly named function (e.g. `getPath` vs. `getPathFuzzy`) so the behavior is visible at call sites, and document the matching rule inline.
- If vestigial: remove it, and add a regression test confirming plain array-index path traversal still works.
- Either way, add a test that pins down the exact matching behavior at the boundary (what happens with a capitalized segment against an array of objects) so future changes can't silently alter it.

## Implementation Notes
- Callers to check after any change: `evalExpression`/`checkExpression` (utils/index.ts:73-117), `resolveExpression` (utils/index.ts:142-146), and everywhere `show` conditions or placeholders are evaluated in `form-field.ts` and `layout-form.ts`.
- Low priority relative to 0001-0004 since no bug report currently points at this — it's a clarity/documentation risk, not a known-broken behavior.

## Agent Notes
- (none yet)
