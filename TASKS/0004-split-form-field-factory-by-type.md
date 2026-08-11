# 0004 Split FormFieldFactory's per-type rendering out of one 850-line dual switch

Status: done
Priority: medium
Subsystem: mithril-ui-form
Depends on: none

## Context
`packages/mithril-ui-form/src/components/form-field.ts:178-1030` (`FormFieldFactory`) contains two near-parallel `switch(fieldType)` blocks covering ~20 field types each:

- readonly branch: lines 396-562
- editable branch: lines 576-1026

Understanding how a single field type (e.g. `datetime`) renders requires reading both branches plus the shared `unwrapComponent` prop-mapping helper (lines 46-155) and the `iv`/`transform`/`autogenerate` computation block (lines 359-373). The function's nominal interface (`{field, obj, onchange}`) is simple, but the real behavior surface is the union of every mithril-materialized component's props — none of which is visible without reading the whole switch. The file has zero direct test coverage (confirmed: no existing vitest suite renders `FormFieldFactory`, `LayoutForm`, `ArrayLayoutForm`, or `RepeatList` as Mithril components), plausibly because the interface is too entangled with Mithril's render lifecycle to test per type. Found during an architecture review (`/improve-codebase-architecture`) — flagged as the highest-priority shallow-module candidate but deliberately deferred pending a design discussion on shape (see below).

## Acceptance Criteria
- This is a design task first: before implementing, settle on the target shape (see Implementation Notes) with the maintainer.
- Each field type's rendering rule becomes independently locatable and (ideally) independently testable, without requiring a reader to scan an 850-line function to find one case.
- Readonly and editable variants for a given field type are defined close enough together (or derived from one another) that the drift already observed between the two branches (see task 0001/0003 for related drift examples) becomes structurally harder to introduce.
- No behavior change to existing forms — this is a pure restructuring task unless a bug is found and separately reported.
- At least one field type gets a real unit/component test as a proof of concept for the new shape.

## Implementation Notes
- Design options surfaced during review, not yet decided:
  1. Per-field-type lookup table (map of `fieldType -> renderer`), each entry a small module.
  2. Derive the readonly variant from the editable one (or vice versa) instead of hand-duplicating each case.
- `unwrapComponent` (form-field.ts:46-155) and the `iv`/`transform`/`autogenerate` block (lines 359-373) are shared infrastructure any new shape still needs — don't duplicate these into each per-type module.
- Because this file has no test harness today, the PoC test in the acceptance criteria may require setting up a minimal Mithril render harness first (check `packages/mithril-ui-form/test/` for any existing render-test patterns before building a new one).
- This is the largest and riskiest of the five review findings — consider doing 0001-0003 first to build confidence with the vitest setup before tackling this one.

## Agent Notes
- Design settled with the user before implementing (per this task's own requirement): one file per field type under a new `packages/mithril-ui-form/src/components/field-types/` directory; readonly and editable renderers co-located in the same file as independent functions (no attempt to mechanically derive one from the other); PoC test as a pure-function unit test (no render harness).
- Core insight that shaped the design: the `plugins`/`readonlyPlugins` registries `registerPlugin` already builds (used for custom field types like the leaflet/rating plugins) are exactly the lookup-table shape task 0004 was asking for built-in types to adopt. So this isn't a new pattern — `FormFieldFactory` now looks a type up in `editableFieldRenderers`/`readonlyFieldRenderers` (checked after the plugin registries) instead of running two ~850-line `switch(fieldType)` blocks. [form-field.ts](packages/mithril-ui-form/src/components/form-field.ts) went from 1053 lines to 451.
- New files: `field-types/types.ts` (`FieldRenderContext<O>` — bundles everything a renderer needs: `iv`, `props`, `options`, `i18n`, `oninput`, `onblur`/`onkeyup`/`onkeydown`, `validate`, `selectAll`/`unselectAll`, mutable `state`, plus the raw `field`/`obj`/`context` so a renderer can pull any field-specific property directly rather than the context type growing per-type-specific fields), one file per type (`colour.ts`, `time.ts`, `date.ts`, `datetime.ts`, `email.ts`, `number.ts`, `radio.ts`, `checkbox.ts`, `switch.ts`, `likert.ts`, `rating.ts`, `options.ts`, `select.ts`, `markdown.ts`, `section.ts`, `tags.ts`, `autocomplete.ts`, `textarea.ts`, `file.ts`, `base64.ts`, `url.ts`, `text.ts`), `default-readonly.ts` (the old `default:` case fallback), and `index.ts` (the two registries + re-exports).
- Verified zero behavior change at the registration level: extracted the exact case-string list from both original switches independently and diffed it against the two new registry maps programmatically (`editable`: 24 keys, `readonly`: 12 keys) — exact match, nothing dropped or renamed.
- Two intentional, documented departures from a literal 1:1 switch-to-file mapping, both preserving exact original behavior:
  - `switch`/`checkbox` and `options`/`select` shared a single readonly case each in the original switch (`case 'switch': case 'checkbox': {...}`). Rather than duplicating that body into two files, `checkbox.ts` exports `booleanReadonly` and `switch.ts`/`checkbox.ts` both re-export it (`export const switchReadonly = booleanReadonly`); same pattern for `optionsSelectReadonly` in `options.ts`, re-exported from `select.ts`.
  - `markdown.ts` has **no** readonly renderer at all. Re-reading the original guard — `if (readonly && fieldType && ['md', 'none'].indexOf(fieldType as string) < 0)` — 'md' can never satisfy this condition, so the original readonly switch's `case 'md': case 'markdown':` was already dead code, unreachable regardless of the `readonly` flag. Confirmed this by tracing the guard rather than assuming; omitting a readonly renderer for markdown is a no-op relative to the original, not a behavior change. Documented inline in `markdown.ts` so a future reader doesn't "fix" it by adding one back.
- Typing fight (same root cause as task 0003's `invokePlugin`): passing a concrete `FieldRenderContext<O>` (built with the view's own generic `O`) into `editableFieldRenderers[fieldType](ctx)` / `readonlyFieldRenderers[fieldType](ctx)` (typed as `FieldRenderer<any>` = `(ctx: FieldRenderContext<any>) => any`) trips the same `InputField.type`-self-references-`InputField`-via-`UIForm` recursive-generic false positive. Fixed the same way: added a small `runFieldRenderer(renderer, ctx)` helper in `form-field.ts` with the cast routed through `unknown`, scoped to that one call — not a loosened parameter type on the registries or the per-type renderer signatures, which stay concretely typed.
- PoC test: [test/field-types/date.test.ts](packages/mithril-ui-form/test/field-types/date.test.ts) — calls `dateEditable`/`dateReadonly` directly with a hand-built `FieldRenderContext`, no Mithril render/mount needed since `m()` just constructs a vnode object without invoking lifecycle hooks. Covers: value/minDate/maxDate computation, the `obj[id]` eager-write side effect, `field.transform` application, the `oninput` wrapper converting a string back to a `Date`, and both readonly formatting paths (defined vs. undefined value). This directly demonstrates the locality win named in the acceptance criteria — testing one field type no longer requires driving the whole `FormFieldFactory` component through Mithril.
- Did not add tests for the other ~23 types — out of scope per the acceptance criteria's "at least one field type" PoC requirement; the shape now makes adding one per type a small, uniform follow-up if wanted.
- Verified no other package (`packages/example`, `packages/mithril-ui-form-leaflet-plugin`, `packages/mithril-ui-form-rating-plugin`) imports from `form-field.ts` internals directly (only the public `FormFieldFactory` re-export from the package root), so this restructuring has no consumer-visible surface change.
- `tsc --noEmit -p . --rootDir .` clean; full vitest suite 153/153 (147 prior + 6 new for `field-types/date.test.ts`).
