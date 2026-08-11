# 0003 Single plugin-invocation helper instead of three duplicated call sites

Status: open
Priority: medium
Subsystem: mithril-ui-form
Depends on: none

## Context
`packages/mithril-ui-form/src/components/form-field.ts` invokes registered plugins at three separate call sites, each hand-constructing the props object passed to `m(plugins[fieldType], {...})`:

- `form-field.ts:376-384` — readonlyPlugins branch (omits `onchange`)
- `form-field.ts:385-395` — plugins branch, readonly mode
- `form-field.ts:565-575` — plugins branch, editable mode

There is no single "invoke a plugin" function, so the actual `PluginType` contract (`packages/mithril-ui-form-plugin/src/plugin.ts:101-170`, which documents `iv`, `field`, `props`, `label`, `onchange?`, `obj`, `context`) can only be learned by cross-referencing all three sites — and they already differ subtly (the onchange omission). Found during an architecture review (`/improve-codebase-architecture`).

## Acceptance Criteria
- One function builds the props object for invoking a plugin, parameterized by mode (readonly vs. editable).
- All three call sites in `form-field.ts` use it instead of inline object construction.
- Behavior is unchanged: readonly-mode plugin invocation still omits `onchange`; editable-mode still includes it.
- The plugin contract (what props a plugin receives in which mode) is documented in one place a plugin author can read — ideally alongside or referencing `mithril-ui-form-plugin/src/plugin.ts`.

## Implementation Notes
- Check `packages/mithril-ui-form-leaflet-plugin` and `packages/mithril-ui-form-rating-plugin` after the change to confirm they still receive the props they expect — these are the two existing "real" adapters proving the seam.

## Agent Notes
- (none yet)
