# Change Log

All notable changes to the "npmrc-helper" extension will be documented in this file.

## [0.2.1] - 2026-08-11

### Fixed
- Stop the `pnpm-workspace` grammar from overriding YAML syntax highlighting in unrelated `.yml` and `.yaml` files.

## [0.2.0] - 2026-05-28

### Added
- Hover, auto-completion, and diagnostics for `pnpm-workspace.yaml` (pnpm v11+)
- All workspace fields: `packages`, `catalog`, `catalogs`, `overrides`, `patchedDependencies`, `packageExtensions`, `peerDependencyRules`, `requiredScripts`, `auditConfig`
- **`allowBuilds`** consolidated build-dependency map (replaces `onlyBuiltDependencies` / `neverBuiltDependencies` / `ignoredBuiltDependencies` / `onlyBuiltDependenciesFile`)
- **`packageConfigs`** per-subproject overrides (replaces nested `.npmrc` files)
- All settings in **camelCase** (`nodeLinker`, `hoistPattern`, `autoInstallPeers`, `saveExact`, `httpsProxy`, `strictSsl`, `ca`, `cafile`, `cert`, `key`, …)
- Migration diagnostics: kebab-case keys flag with their camelCase replacement; old build-dependency keys flag with the new `allowBuilds` syntax

### Changed
- **Breaking**: `.npmrc` is now reserved for **auth + registry only**. pnpm settings, proxies, SSL, and all other configuration must be moved to `pnpm-workspace.yaml`.
- pnpm-related `.npmrc` keys retained: `registry`, `_auth`, `always-auth`, plus scoped `@scope:registry=…` and `//host/:_authToken=…` (skipped from validation).

## [0.1.0] - 2026-03-20

### Added
- Hover documentation for `.npmrc` (npm & pnpm) config keys
- Auto-completion for `.npmrc` config keys and values
- Diagnostics (error/warning) for invalid `.npmrc` config values
- Hover documentation for `.yarnrc.yml` (Yarn Berry) config keys
- Auto-completion for `.yarnrc.yml` config keys and values
- Syntax highlighting for `.npmrc` and `.yarnrc.yml` files
