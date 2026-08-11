# 0002 Unify array-item mutation logic between ArrayLayoutForm and RepeatList

Status: done
Priority: medium
Subsystem: mithril-ui-form
Depends on: none

## Context
`packages/mithril-ui-form/src/utils/index.ts:557-625` defines `arrayUtils` (`moveItem`, `insertAt`, `removeAt`, `swap`, `duplicate`, `isValidArray`) and it is thoroughly unit-tested in `packages/mithril-ui-form/test/utils/comprehensive-utils.test.ts:571-676`. However, `grep` confirms `arrayUtils` is only referenced from within its own definition (`duplicate` calls `arrayUtils.insertAt`) and re-exported — it is never called by the components that actually manage arrays at runtime:

- `packages/mithril-ui-form/src/components/array-layout-form.ts:58-113` — own inline `addItem`/`removeItem`/`handleDrop` (splice logic reimplemented)
- `packages/mithril-ui-form/src/components/repeat-list.ts:38-355` — own inline `addEmptyItem`/`getItems`/`handleDragStart`/`handleDrop`/`handleDragOver` (separate reimplementation again)

Found during an architecture review (`/improve-codebase-architecture`): this is a "pure helper extracted for testability but not on the real code path" pattern. The tests currently give false confidence — they verify `arrayUtils`, not the array-mutation code that actually runs when a user adds/removes/reorders items in the app. `ArrayLayoutForm` and `RepeatList` also duplicate drag-and-drop handling between themselves independently.

## Acceptance Criteria
- `ArrayLayoutForm` and `RepeatList` both call into `arrayUtils` (or a shared module built from it) for add/remove/reorder, rather than each owning a parallel splice implementation.
- No behavior change from a user's perspective (same add/remove/drag-drop UX).
- Existing `arrayUtils` tests still pass, and now exercise code that is actually on the runtime path (verify e.g. via a rendered-component test or by removing the duplicated inline logic entirely so there's only one implementation to test).
- Drag-and-drop handling duplicated between `array-layout-form.ts` and `repeat-list.ts` is consolidated into one place, or a documented reason is recorded for why it can't be (e.g. differing DOM structure).

## Implementation Notes
- Deletion test result during review: deleting `arrayUtils` today would break nothing at runtime — confirm this is still true before starting, then use the tested functions as the real implementation instead of writing new ones.
- Watch for subtle differences between the two current inline implementations (e.g. `array-layout-form.ts` vs `repeat-list.ts` handling of drag state) — reconcile intentionally, don't silently pick one.

## Agent Notes
- Confirmed the deletion-test premise still held: `arrayUtils` was reachable only from its own `duplicate` method and the re-export in [index.ts](packages/mithril-ui-form/src/index.ts); nothing in `array-layout-form.ts` or `repeat-list.ts` called it.
- `ArrayLayoutForm` ([array-layout-form.ts](packages/mithril-ui-form/src/components/array-layout-form.ts)) is fully immutable already, so `addItem`/`removeItem`/`handleDrop` now call `arrayUtils.insertAt`/`removeAt`/`moveItem` directly — straightforward 1:1 swap.
- `RepeatList` ([repeat-list.ts](packages/mithril-ui-form/src/components/repeat-list.ts)) mutates in place rather than going through an `onchange(items)` contract, so the swap needed more care:
  - `addEmptyItem`: when `obj` is a plain object, now builds the new array with `arrayUtils.insertAt` and reassigns `obj[id]` instead of `.push`-ing into the existing array in place. When `obj` itself *is* the array (the no-`id` case), left as `obj.push(...)` — there's no property to reassign a new array into, so mutation is the only way the change can propagate to the caller; documented this with an inline comment rather than silently deviating from the "always use arrayUtils" rule.
  - `handleDrop`: was manually splicing a copy of `obj[id]`; now `obj[id] = arrayUtils.moveItem(obj[id], draggedIndex, index)`. Exact behavioral match — `moveItem`'s internal implementation was already identical to what this code did by hand.
  - Delete-confirmation modal's "Agree" handler: previously called `items.splice(...)` (mutating in place — and since `items` is often the *same reference* as `obj[id]` when unfiltered, this silently mutated `obj[id]` before the subsequent `obj[id] = [...items]` reassignment even ran, i.e. a redundant double-write). Replaced with `arrayUtils.removeAt(items, state.curItemIdx)`, which doesn't mutate `items`, then a single assignment to `obj`/`obj[id]`. This is a genuine (harmless) correctness cleanup, not just a rename — the old code relied on `items` and `obj[id]` being the same array reference, which is fragile.
  - Note: `state.curItemIdx` in that same delete handler indexes into `items`, which can be a *filtered* view (`propertyFilter`) distinct from `obj[id]`. That's a pre-existing indexing mismatch, not something introduced or fixed here — left alone since it's out of this task's scope (flag separately if it turns out to be a real bug).
- Drag-and-drop consolidation: extracted `dragDropUtils` (`handleDragStart`, `handleDragOver`, `getDragIndex`) into [utils/index.ts](packages/mithril-ui-form/src/utils/index.ts), next to `arrayUtils`, and exported it from [index.ts](packages/mithril-ui-form/src/index.ts). Both components now call the same three functions for the DOM-event plumbing (`dataTransfer.setData`/`getData`/`preventDefault`). `handleDrop` itself stays per-component (different signatures: `ArrayLayoutForm` takes an `items` array and returns via `onchange(isValid, items)`; `RepeatList` mutates `obj[id]` and calls `onchange(obj)`) — the reorder *computation* inside each is now the shared `arrayUtils.moveItem`, so the only remaining duplication is genuinely different data-shape glue code, not logic.
- Standardized both components on the `'text/plain'` MIME type for `dataTransfer` get/set (previously `RepeatList` used the `'text'` alias on `getData` only). Browsers treat `'text'` as an alias for `'text/plain'`, so this is not a behavior change, just naming consistency.
- Added [test/array-mutation.test.ts](packages/mithril-ui-form/test/array-mutation.test.ts): mounts `ArrayLayoutForm` for real via `m.mount` into a jsdom container and drives add/remove/drag-drop through actual DOM events (`.click()`, `dragstart`/`drop` with a stub `DataTransfer`), asserting the `onchange` callback receives the correctly mutated array. This is the "verify via a rendered-component test" branch of the acceptance criteria — it exercises the runtime path directly rather than only `arrayUtils` in isolation. Did not add an equivalent render test for `RepeatList` (it pulls in `ModalPanel`/`Pagination` and mutates via URL/route state, which looked like a bigger render-harness lift); its drag/add/delete logic is exercised indirectly by the same `arrayUtils`/`dragDropUtils` unit tests instead.
- `tsc --noEmit -p . --rootDir .` clean; full vitest suite: 140 passed (133 pre-existing + 4 from task 0001 + 3 new here).
