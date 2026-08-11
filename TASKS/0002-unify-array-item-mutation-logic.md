# 0002 Unify array-item mutation logic between ArrayLayoutForm and RepeatList

Status: open
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
- (none yet)
