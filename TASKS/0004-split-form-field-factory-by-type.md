# 0004 Split FormFieldFactory's per-type rendering out of one 850-line dual switch

Status: open
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
- (none yet)
