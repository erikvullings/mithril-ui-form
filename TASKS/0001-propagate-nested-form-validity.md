# 0001 Propagate nested-form validity instead of dropping it

Status: done
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
- Chose a different mechanism than "thread `isValid` through every internal `onchange` callback" (which would have required changing `IFormField.onchange`, `IRepeatList.onchange`, and `IGeoJSONFeatureList.onchange` signatures and adding stateful per-field/per-item validity tracking, since those callbacks fire per-field and don't see the whole form on every event). Instead, made `isValid` in [layout-form.ts:26-60](packages/mithril-ui-form/src/components/layout-form.ts) recursive and stateless: it walks `form`, and for any field whose `type` is itself a sub-form (`fieldType instanceof Array`), recurses into `item[id]` — as a single nested object, as every item of a `repeat` array, or (for `repeat: 'geojson'`) as `feature.properties` of every feature after `JSON.parse`. This is computed fresh on every call from `res` alone, so there's no risk of stale/missing entries for untouched fields (the failure mode the stateful approach would have had).
- This required no changes to `form-field.ts`, `repeat-list.ts`, or `geojson-feature-list.ts` — their `onchange`/`oninput` chains were already unwind up to `LayoutForm.view`'s `onchange` at [layout-form.ts:81](packages/mithril-ui-form/src/components/layout-form.ts), which already calls `isValid(res, form)`; making that function itself recursive was sufficient.
- Exported `isValid` from `layout-form.ts` (was previously module-private) and used it in `array-layout-form.ts` to fix the third drop site named in this task: `ArrayLayoutForm`'s own `updateItem`/`addItem`/`removeItem`/`handleDrop` all discarded `_isValid`. Since `ArrayLayoutForm` is a standalone component (not wired into `LayoutForm`'s own field-type dispatch — confirmed via grep, nothing in `form-field.ts` handles a `type: 'array'` case), its own public `onchange` contract needed to change to carry validity: `onchange?: (items: T[]) => void` → `onchange?: (isValid: boolean, items?: T[]) => void`, matching the `(isValid, obj)` ordering convention already used by top-level `FormAttributes.onchange` (`mithril-ui-form-plugin/src/form.ts:108`). Confirmed via grep that no code in `packages/example` or `packages/mithril-ui-form/test` calls `ArrayLayoutForm` today, so this was a safe signature change with no call sites to migrate.
- Added `packages/mithril-ui-form/test/validity.test.ts` — calls `isValid` directly (no Mithril render harness needed, since it's a pure function) covering: top-level required field, required field nested inside an object field, and required field nested inside a repeated item.
- `npx tsc --noEmit -p . --rootDir .` is clean (plain `tsc --noEmit -p .` fails on `vitest.config.ts` being outside `rootDir: ./src` — pre-existing, unrelated to this change). `npm run build` (rollup) fails with `tsModule.createDocumentRegistry is not a function` — pre-existing TypeScript 7 / rollup-plugin-typescript2 incompatibility (see commit `c7aeaec`, the vitest migration), not something this task introduced or fixed.
- Not done: `RepeatList`'s and `GeoJSONFeatureList`'s own internal `onchange?: (result: O) => void` types still don't literally carry a validity flag — this was deliberately left as-is since the recursive-`isValid` approach makes that plumbing unnecessary for the stated acceptance criteria. If a future task wants per-field-level validity feedback (e.g. to show an inline error on the specific nested field that's invalid, not just gate the top-level submit), that would need the stateful approach instead.
