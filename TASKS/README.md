# Tasks

Index of tasks in this directory. Update the checkbox here whenever a task's `Status` flips to
`done` or `cancelled`.

## Architecture review findings (2026-08-11)

Five independent findings from an `/improve-codebase-architecture` pass over `packages/mithril-ui-form`.
No dependencies between them, but 0004 is the largest/riskiest — consider doing 0001-0003 first to
build confidence with the vitest setup before tackling it.

- [x] 0001 Propagate nested-form validity instead of dropping it
- [x] 0002 Unify array-item mutation logic between ArrayLayoutForm and RepeatList
- [ ] 0003 Single plugin-invocation helper instead of three duplicated call sites
- [ ] 0004 Split FormFieldFactory's per-type rendering out of one 850-line dual switch *(design discussion needed first)*
- [ ] 0005 Document or remove getPath's undocumented fuzzy ID-matching heuristic
