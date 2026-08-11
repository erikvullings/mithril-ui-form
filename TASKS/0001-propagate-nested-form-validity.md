# 0001 Propagate nested-form validity instead of dropping it

Status: open
Priority: high
Subsystem: mithril-ui-form
Depends on: none

## Context
`LayoutForm`'s public interface promises `onChange(isValid, obj)`, and `isValid` is computed correctly for a top-level `LayoutForm` (`packages/mithril-ui-form/src/index.ts:20-34`). But every internal caller of a *nested* `LayoutForm` ignores the `isValid` argument and forwards only the raw object:

- `packages/mithril-ui-form/src/components/repeat-list.ts:273` — `onchange: () => onchange && onchange(obj)`
- `packages/mithril-ui-form/src/components/form-field.ts:344` — `onchange: () => onFormChange && onFormChange(obj)`
- `packages/mithril-ui-form/src/components/array-layout-form.ts:108-113, 188-197` — `updateItem = (index) => (_isValid: boolean, item?: T) => {...}` (parameter explicitly unused, named `_isValid`)

So `required`-field validation only actually blocks submission for a top-level form a consumer wires up directly — required fields nested inside a `repeat`, an object field, or an array item silently don't enforce validity even though the top-level `onChange` signature implies they do. This was found during an architecture review (`/improve-codebase-architecture`) as a "computed then discarded" locality violation — the fix is deferred to this task.

## Acceptance Criteria
- Validity from a nested `LayoutForm` (inside `repeat-list.ts`, `form-field.ts` object fields, and `array-layout-form.ts` items) is threaded up into the parent form's own validity computation, not discarded.
- A top-level `LayoutForm.onChange(isValid, obj)` reports `false` when a `required` field nested inside a repeat/array/object sub-form is empty.
- Existing behavior for non-nested forms is unchanged.
- A test exercises at least one nesting case (repeat, array, or nested object) and asserts `isValid` reflects an unmet `required` constraint inside it.

## Implementation Notes
- Validity computation lives in `packages/mithril-ui-form/src/index.ts:20-34` — reuse/extend rather than reimplementing per call site.
- Three call sites need updating in lockstep: `repeat-list.ts`, `form-field.ts`, `array-layout-form.ts`. Consider whether a single shared "aggregate child validity" helper removes the need to edit all three independently in the future.
- No test framework existed until a recent switch to vitest (see `c7aeaec`); check `packages/mithril-ui-form/test/` for existing patterns/harness for rendering `LayoutForm`.

## Agent Notes
- (none yet)
