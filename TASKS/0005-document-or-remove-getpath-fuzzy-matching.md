# 0005 Document or remove getPath's undocumented fuzzy ID-matching heuristic

Status: done
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
- Skipped the "search examples for real usage" step in the acceptance criteria — the user confirmed directly that the heuristic is load-bearing ("used to resolve a dynamic key"), and a grep of `packages/example/src` and `docs/` turned up no capitalized `show`/path expressions anyway, consistent with this being used by consumer forms not present in this repo.
- Given "both versions are needed" (plain index access AND the fuzzy dynamic-key lookup, used together depending on the segment), did **not** split `getPath` into two functions callers must choose between — that would require every existing dynamic-key-based `show`/path expression to be rewritten to call a different function, a behavior-breaking migration for exactly the use case the user said is load-bearing. Instead: `getPath`'s public signature and behavior are unchanged (byte-for-byte — same routing decision, same fallback-to-index-when-not-capitalized logic), and the previously-inline regex block is extracted into a new named, documented, and separately exported function `getPathFuzzy(array, key)` in [utils/index.ts](packages/mithril-ui-form/src/utils/index.ts), which `getPath` calls internally. This satisfies the acceptance criteria's "split it into an explicitly named function... document the matching rule inline" without an API break.
- Preserved the exact original gating regex (`/([A-Z]\w+)/`, capital letter + at least one more word char) at the call site in `getPath`, rather than loosening it to a plain `/[A-Z]/` test — even though `getPathFuzzy`'s own internal regex would safely return `undefined` for a stray single trailing capital either way, keeping the outer gate identical to the original avoids any risk of behavioral drift for edge-case keys.
- `getPathFuzzy` is also exported from [index.ts](packages/mithril-ui-form/src/index.ts) alongside `getPath`, so it's independently visible/importable/testable — matching how `arrayUtils`/`dragDropUtils` were surfaced in tasks 0002/0003 — but `getPath` remains the function every existing caller (`evalExpression`/`checkExpression`, `resolveExpression`, and every `show`/placeholder evaluation in `form-field.ts`/`layout-form.ts`) continues to use unchanged.
- Added a `describe('dynamic-key (fuzzy) array segments', ...)` block in [test/utils/comprehensive-utils.test.ts](packages/mithril-ui-form/test/utils/comprehensive-utils.test.ts) pinning down: a capitalized segment matches an item whose lowercased-property value equals the *literal capitalized segment string itself* (not some separate id); no match returns `undefined` rather than falling back to index access; non-object array items are skipped safely; and a plain lowercase/numeric segment is unaffected (still treated as an index).
- `tsc --noEmit -p . --rootDir .` clean; full vitest suite 147/147 (140 prior + 7 new for the dynamic-key behavior).
