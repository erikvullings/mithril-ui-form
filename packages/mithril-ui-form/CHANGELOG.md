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
