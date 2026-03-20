# npmrc Helper

A VSCode extension that provides **IntelliSense** for package manager configuration files — hover documentation, auto-completion, and diagnostics — supporting:

- **`.npmrc`** — npm (v8 / v9 / v10 / v11) and pnpm (v10 / v11)
- **`.yarnrc.yml`** — Yarn Berry (v2 / v3 / v4)

---

## Features

### 🔍 Hover Documentation

Hover over any config key to see a rich popup with:

- **Type** and **default value**
- **Allowed values** (for enum-type keys)
- **Package manager badge** — `npm` or `pnpm` for `.npmrc`, `yarn berry` for `.yarnrc.yml`
- **Version badge** — `since vX` for keys added in newer versions, `removed in vX` for removed keys
- Full description
- Direct link to the official docs

### ✅ Auto-completion

**`.npmrc`**
- **Key completion**: Start typing to get suggestions filtered to the active package manager (npm or pnpm, auto-detected)
- **Value completion**: After `key=`, suggestions for keys with a fixed set of valid values (e.g. `loglevel`, `access`, `audit-level`, `node-linker`)
- Deprecated and removed keys appear at the bottom with a strikethrough

**`.yarnrc.yml`**
- **Key completion**: All Yarn Berry configuration keys with docs
- **Value completion**: After `key: `, suggestions for enum-type keys (e.g. `nodeLinker`, `pnpMode`, `cacheMigrationMode`)

### ⚠️ Diagnostics

**`.npmrc`**
- Unknown config keys → warning squiggle
- Keys removed in newer npm versions (e.g. `node-version`, `ci-name`) → warning + strikethrough
- Deprecated keys (e.g. `production`, `shrinkwrap`) → hint + strikethrough
- Values that don't match the allowed set → warning
- Lines missing `=` → warning
- Scoped entries (`@scope:registry=…`, `//host/:_authToken=…`) are correctly skipped

**`.yarnrc.yml`**
- Unknown config keys → warning squiggle
- Deprecated keys → hint + strikethrough
- Invalid enum values → warning

### 🤖 Auto-detection: npm vs pnpm

For `.npmrc` files, the extension automatically determines whether the project uses **npm** or **pnpm** by looking for `pnpm-lock.yaml` or `pnpm-workspace.yaml` in the directory tree. Completions and diagnostics are scoped accordingly.

---

## Supported Configurations

### npm (v8 – v11)

All keys from the [npm config documentation](https://docs.npmjs.com/cli/v11/using-npm/config) across versions v8, v9, v10, and v11, including:

| Key | Type | Default | Notes |
|-----|------|---------|-------|
| `registry` | URL | `https://registry.npmjs.org/` | |
| `loglevel` | String | `notice` | |
| `audit-level` | String | `null` | |
| `install-strategy` | String | `hoisted` | Added in v10 |
| `sbom-format` | String | `null` | Added in v10 |
| `omit` | String | — | Added in v9 |
| `node-version` | semver | — | ⚠️ Removed in v9 |
| `ci-name` | String | — | ⚠️ Removed in v10 |
| `production` | Boolean | — | ⚠️ Deprecated → use `--omit=dev` |
| `shrinkwrap` | Boolean | — | ⚠️ Deprecated → use `--package-lock` |
| … | … | … | |

### pnpm (v10 / v11)

All `.npmrc` keys from the [pnpm configuration docs](https://pnpm.io/npmrc), including:

| Key | Type | Default | Notes |
|-----|------|---------|-------|
| `store-dir` | path | `~/.local/share/pnpm/store` | |
| `shamefully-hoist` | Boolean | `false` | |
| `node-linker` | String | `isolated` | `isolated` / `hoisted` / `pnp` |
| `prefer-frozen-lockfile` | Boolean | `true` | |
| `auto-install-peers` | Boolean | `true` | |
| `block-exotic-subdeps` | Boolean | `false` (v10) / `true` (v11) | |
| `side-effects-cache` | Boolean | `true` | |
| `use-node-version` | semver | — | |
| … | … | … | |

> pnpm-specific keys (e.g. `store-dir`, `hoist-pattern`) are only suggested when the project is detected as a pnpm workspace.

### Yarn Berry (v2 / v3 / v4)

All keys from the [Yarn Berry yarnrc.yml docs](https://yarnpkg.com/configuration/yarnrc), including:

| Key | Type | Default | npm equivalent |
|-----|------|---------|---------------|
| `npmRegistryServer` | String | `https://registry.yarnpkg.com` | `registry` |
| `npmAuthToken` | String | — | `_authToken` |
| `nodeLinker` | String | `pnp` | — |
| `enableStrictSsl` | Boolean | `true` | `strict-ssl` |
| `httpsProxy` | String | — | `https-proxy` |
| `httpsCaFilePath` | path | — | `cafile` |
| `enableScripts` | Boolean | `true` | `ignore-scripts` |
| `enableGlobalCache` | Boolean | `true` | — |
| `enableImmutableInstalls` | Boolean | `false` | — |
| `defaultSemverRangePrefix` | String | `^` | `save-prefix` |
| … | … | … | |

---

## Getting Started

### Development

```bash
git clone <repo>
cd npmrc-helper
npm install
# Open in VSCode and press F5 to launch the Extension Development Host
```

### Build & Package

```bash
npm run compile        # compile TypeScript
npm run lint           # run ESLint
npm run package        # produce npmrc-helper-x.x.x.vsix
```

### Install from VSIX

```
Extensions panel → ··· → Install from VSIX…
```

---

## Requirements

- VSCode `^1.85.0`
- Node.js `^20`

## Extension Settings

This extension has no configurable settings at this time.

## License

MIT
