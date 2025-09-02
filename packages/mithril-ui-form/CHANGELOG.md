## [2.0.4](https://github.com/erikvullings/mithril-ui-form/compare/v2.0.3...v2.0.4) (2025-09-02)


### Bug Fixes

* Typedoc documentation, improved typings ([b638caf](https://github.com/erikvullings/mithril-ui-form/commit/b638caf8910d136eefd79af4168b72d7616b5517))

## [2.0.3](https://github.com/erikvullings/mithril-ui-form/compare/v2.0.2...v2.0.3) (2025-09-02)


### Bug Fixes

* more robust handling of id ([8763b20](https://github.com/erikvullings/mithril-ui-form/commit/8763b20061acd6d6330a4567a6b0e912f3f043d3))

## [2.0.2](https://github.com/erikvullings/mithril-ui-form/compare/v2.0.1...v2.0.2) (2025-08-26)


### Bug Fixes

* separate semantic-release from npm publishing to properly resolve workspace dependencies ([c63bb96](https://github.com/erikvullings/mithril-ui-form/commit/c63bb9652bdf1a4a439d4e8ac2ca1b09daeff0e0))

## [2.0.1](https://github.com/erikvullings/mithril-ui-form/compare/v2.0.0...v2.0.1) (2025-08-26)


### Bug Fixes

* configure semantic-release to use pnpm for publishing workspace dependencies ([551b70a](https://github.com/erikvullings/mithril-ui-form/commit/551b70a3b69c5713547cd5e9855aa51f02eb4ec6))
* replace workspace dependency with actual version for mithril-ui-form-plugin ([4641414](https://github.com/erikvullings/mithril-ui-form/commit/4641414673253314d332fc0163f2414c326d4a13))

# [2.0.0](https://github.com/erikvullings/mithril-ui-form/compare/v1.0.1...v2.0.0) (2025-08-26)


* feat!: finalize mithril-materialized v2.0.0 upgrade ([6ea3d60](https://github.com/erikvullings/mithril-ui-form/commit/6ea3d60dfe5c7d1d4283dbf71bb21bdb51c3a01f))


### BREAKING CHANGES

* This version completes the migration to mithril-materialized v2.0.0, introducing breaking changes in component APIs and styling. Applications using this library must update their mithril-materialized dependency to v2.0.0.

## [1.0.1](https://github.com/erikvullings/mithril-ui-form/compare/v1.0.0...v1.0.1) (2025-08-26)


### Bug Fixes

* correct package version to match npm registry ([a2643a4](https://github.com/erikvullings/mithril-ui-form/commit/a2643a44634514dcb263cfb6a7c2862d1cfe0f7a))

# 1.0.0 (2025-08-26)


* feat!: upgrade to mithril-materialized v2.0.0 ([77425ff](https://github.com/erikvullings/mithril-ui-form/commit/77425ff26f2c16ad12f3e225d1217f016591bd77))


### Bug Fixes

* add missing rollup dependency and update config for ES modules ([f840f9c](https://github.com/erikvullings/mithril-ui-form/commit/f840f9c7628f912d5ca42c5a5d64131488db8b58))
* complete tsup migration for plugin packages ([8a1ac20](https://github.com/erikvullings/mithril-ui-form/commit/8a1ac20397232d4033df5b58dd72039da4602c09))
* Form in form className should apply to all. ([fd9a882](https://github.com/erikvullings/mithril-ui-form/commit/fd9a8821d8a64c36b8f603211fe97aad64e3a629))
* remove pkgRoot from semantic-release npm configuration ([2b91e1e](https://github.com/erikvullings/mithril-ui-form/commit/2b91e1e7140a5a880449692af5caa5a85ce9eb4b))
* rename rollup.config.js to .mjs for ES module support ([e17b74d](https://github.com/erikvullings/mithril-ui-form/commit/e17b74d6c0e89960ad73695cdba24320b5689cca))
* replace deprecated microbundle with tsup to resolve dependency warnings ([1e39c19](https://github.com/erikvullings/mithril-ui-form/commit/1e39c19019f2075eb417eddfcdf9db3be9a11203))
* resolve rollup v4 peer dependency warnings and materialize-css imports ([d32aebf](https://github.com/erikvullings/mithril-ui-form/commit/d32aebf449feb8617431ae8f22bdd154b3636d24))
* resolve TypeScript compilation errors for mithril-materialized v2 ([acedbb1](https://github.com/erikvullings/mithril-ui-form/commit/acedbb169b2916f67ee32f540810867788ef063b))
* simplify semantic-release workflow to release main package only ([a42db48](https://github.com/erikvullings/mithril-ui-form/commit/a42db480606bd3dc991ee8b5e968c9a65b655528))
* update GitHub Actions to use Node.js 20 for semantic-release compatibility ([60b2214](https://github.com/erikvullings/mithril-ui-form/commit/60b2214d867dd20a9a23a47b585bcba2772ca231))


### Features

* prepare beta release with dependency updates and bug fixes ([6c7834d](https://github.com/erikvullings/mithril-ui-form/commit/6c7834d1c3c9a3db79e3924bb3611cc37199e107))
* upgrade to mithril-materialized v2.0.0-beta.3 ([83eff8a](https://github.com/erikvullings/mithril-ui-form/commit/83eff8a2b62426f35b524e16f9798282c82476c8))


### BREAKING CHANGES

* Updated to mithril-materialized v2.0.0 which introduces breaking changes in component APIs and styling. Applications using this library will need to update their mithril-materialized dependency to v2.0.0 and may need to adjust component usage patterns.
* Upgraded to mithril-materialized v2.x which removes external dependencies (materialize-css, material-icons) and includes self-contained CSS/icons

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>

# [1.0.0-beta.3](https://github.com/erikvullings/mithril-ui-form/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2025-08-26)


### Bug Fixes

* complete tsup migration for plugin packages ([8a1ac20](https://github.com/erikvullings/mithril-ui-form/commit/8a1ac20397232d4033df5b58dd72039da4602c09))
* replace deprecated microbundle with tsup to resolve dependency warnings ([1e39c19](https://github.com/erikvullings/mithril-ui-form/commit/1e39c19019f2075eb417eddfcdf9db3be9a11203))

# [1.0.0-beta.2](https://github.com/erikvullings/mithril-ui-form/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2025-08-16)


### Bug Fixes

* resolve rollup v4 peer dependency warnings and materialize-css imports ([d32aebf](https://github.com/erikvullings/mithril-ui-form/commit/d32aebf449feb8617431ae8f22bdd154b3636d24))


### Features

* prepare beta release with dependency updates and bug fixes ([6c7834d](https://github.com/erikvullings/mithril-ui-form/commit/6c7834d1c3c9a3db79e3924bb3611cc37199e107))

# 1.0.0-beta.1 (2025-08-15)


### Bug Fixes

* add missing rollup dependency and update config for ES modules ([f840f9c](https://github.com/erikvullings/mithril-ui-form/commit/f840f9c7628f912d5ca42c5a5d64131488db8b58))
* Form in form className should apply to all. ([fd9a882](https://github.com/erikvullings/mithril-ui-form/commit/fd9a8821d8a64c36b8f603211fe97aad64e3a629))
* remove pkgRoot from semantic-release npm configuration ([2b91e1e](https://github.com/erikvullings/mithril-ui-form/commit/2b91e1e7140a5a880449692af5caa5a85ce9eb4b))
* rename rollup.config.js to .mjs for ES module support ([e17b74d](https://github.com/erikvullings/mithril-ui-form/commit/e17b74d6c0e89960ad73695cdba24320b5689cca))
* resolve TypeScript compilation errors for mithril-materialized v2 ([acedbb1](https://github.com/erikvullings/mithril-ui-form/commit/acedbb169b2916f67ee32f540810867788ef063b))
* simplify semantic-release workflow to release main package only ([a42db48](https://github.com/erikvullings/mithril-ui-form/commit/a42db480606bd3dc991ee8b5e968c9a65b655528))
* update GitHub Actions to use Node.js 20 for semantic-release compatibility ([60b2214](https://github.com/erikvullings/mithril-ui-form/commit/60b2214d867dd20a9a23a47b585bcba2772ca231))


### Features

* upgrade to mithril-materialized v2.0.0-beta.3 ([83eff8a](https://github.com/erikvullings/mithril-ui-form/commit/83eff8a2b62426f35b524e16f9798282c82476c8))


### BREAKING CHANGES

* Upgraded to mithril-materialized v2.x which removes external dependencies (materialize-css, material-icons) and includes self-contained CSS/icons

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
