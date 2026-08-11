# 0003 Single plugin-invocation helper instead of three duplicated call sites

Status: done
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
- Added `invokePlugin` and its `PluginInvocationMode` type in [form-field.ts](packages/mithril-ui-form/src/components/form-field.ts), just above `FormFieldFactory`. All three call sites (readonlyPlugins branch, plugins-as-readonly-fallback branch, plugins editable branch) now call it.
- Important nuance documented inline: `mode` is **not** the same as "is the field rendered readonly." The `readonlyPlugins` registry branch is `'readonly'` (omits `onchange`); but the `plugins` registry, when used as a *fallback* because no dedicated readonly plugin was registered (still inside the outer `if (readonly...)` branch), is invoked as `'editable'` — matching the pre-existing behavior where that call site already included `onchange`. Naming it after DOM-readonly-context instead of registry-source would have been wrong; the JSDoc on `PluginInvocationMode` spells this out so a future reader doesn't "fix" it into a bug.
- Typing fight: typing `field`/`props` as `InputField<O>` inside `invokePlugin` broke `tsc` with a recursive-generic variance error when checking the built `attrs` object against `PluginType`'s declared attrs type (`InputField.type` can itself be a `UIForm<...>`, which self-references `InputField`, so TS's structural check on this generic function body — as opposed to each inlined call site, where `O` was concrete — doesn't collapse the same way `T & any` normally would). First pass widened `field`/`props`/`onchange` to `any` on the function signature; on review, tightened this back up: `field`/`props` are `InputField<O>` and `onchange` is `(value: V) => Promise<void> | void` (with `V` a second generic inferred per call site) on the *public signature*, so callers of `invokePlugin` are still fully type-checked. Only the single `m(plugin, attrs as unknown as Parameters<typeof plugin>[0]['attrs'])` line — where the recursive-generic mismatch actually lives — carries a cast, routed through `unknown` (not a bare `as`, which TS also rejected as "insufficient overlap") rather than widening any parameter. The real, checked contract for plugin authors remains `PluginType` in `mithril-ui-form-plugin/src/plugin.ts`, which `invokePlugin`'s JSDoc points to.
- Confirmed both real plugin adapters (`mithril-ui-form-leaflet-plugin`, `mithril-ui-form-rating-plugin`) destructure exactly `{ props, iv, field, onchange }` from `attrs` and are registered without a dedicated readonly variant (`grep registerPlugin` in `packages/example/src/app.ts` — only single-arg registration) — so they're only ever reached via the `'editable'` call sites, and receive an identical prop shape to before.
- `tsc --noEmit -p . --rootDir .` clean, full vitest suite 140/140 (unchanged from task 0002 — this task didn't need new tests since it's a pure refactor of existing, already-covered call paths; `IFormField`'s `onchange` type is exercised indirectly by every existing test that renders/exercises `FormFieldFactory` behavior, though as noted in task 0004 there's still no direct render test for this file).
