// ─── Types ────────────────────────────────────────────────────────────────────

export interface PnpmWorkspaceConfigEntry {
  key: string;
  default: string;
  type: string;
  description: string;
  /** Whether this key is deprecated */
  deprecated?: boolean;
  /** The pnpm major version this key first appeared */
  since?: number;
  /** Allowed enum values */
  validValues?: string[];
  /** Category used for documentation/grouping */
  category:
    | 'workspace'
    | 'dependency'
    | 'store'
    | 'modules'
    | 'lockfile'
    | 'network'
    | 'ssl'
    | 'proxy'
    | 'peers'
    | 'scripts'
    | 'node'
    | 'cli'
    | 'misc';
}

// ─── Workspace-specific top-level fields ─────────────────────────────────────
// These keys are only valid in `pnpm-workspace.yaml` (not in `.npmrc`).
// Reference: https://pnpm.io/pnpm-workspace_yaml

const workspaceOnlyFields: PnpmWorkspaceConfigEntry[] = [
  {
    key: 'packages',
    default: '[]',
    type: 'String[]',
    category: 'workspace',
    description:
      'Glob patterns describing the directories that contain workspace packages.\n\nExample:\n```yaml\npackages:\n  - "apps/*"\n  - "packages/*"\n  - "!**/test/**"\n```',
  },
  {
    key: 'catalog',
    default: '{}',
    type: 'Record<String, String>',
    category: 'dependency',
    description:
      'The default catalog of dependency versions. Workspace packages can reference these via `catalog:` protocol in `package.json`.\n\nExample:\n```yaml\ncatalog:\n  react: ^18.3.1\n  react-dom: ^18.3.1\n```',
  },
  {
    key: 'catalogs',
    default: '{}',
    type: 'Record<String, Record<String, String>>',
    category: 'dependency',
    description:
      'Named catalogs of dependency versions. Reference via `catalog:<name>` protocol.\n\nExample:\n```yaml\ncatalogs:\n  react17:\n    react: ^17.0.2\n    react-dom: ^17.0.2\n  react18:\n    react: ^18.3.1\n```',
  },
  {
    key: 'overrides',
    default: '{}',
    type: 'Record<String, String>',
    category: 'dependency',
    description:
      'Override resolved versions of any dependency (transitive included).\n\nExample:\n```yaml\noverrides:\n  foo: ^1.0.0\n  "bar@^1.0.0": 1.5.0\n  "baz>quux": "2.0.0"\n```',
  },
  {
    key: 'patchedDependencies',
    default: '{}',
    type: 'Record<String, String>',
    category: 'dependency',
    description:
      'Map of `name@version` to a path containing a patch file (managed by `pnpm patch` / `pnpm patch-commit`).\n\nExample:\n```yaml\npatchedDependencies:\n  "lodash@4.17.21": patches/lodash@4.17.21.patch\n```',
  },
  {
    key: 'packageExtensions',
    default: '{}',
    type: 'Record<String, Object>',
    category: 'dependency',
    description:
      'Extend the manifests of dependencies (add missing peer dependencies, dependencies, etc.).\n\nExample:\n```yaml\npackageExtensions:\n  react-redux:\n    peerDependencies:\n      react-dom: "*"\n```',
  },
  {
    key: 'peerDependencyRules',
    default: '{}',
    type: 'Object',
    category: 'peers',
    description:
      'Rules for handling peer dependency warnings.\n\nFields:\n- `ignoreMissing`: Suppress missing peer warnings.\n- `allowedVersions`: Allow versions outside the declared range.\n- `allowAny`: Wildcard allow list.\n\nExample:\n```yaml\npeerDependencyRules:\n  ignoreMissing:\n    - "@babel/*"\n  allowedVersions:\n    react: "17"\n```',
  },
  {
    key: 'allowedDeprecatedVersions',
    default: '{}',
    type: 'Record<String, String>',
    category: 'dependency',
    description:
      'Suppress deprecation warnings for matching package versions.\n\nExample:\n```yaml\nallowedDeprecatedVersions:\n  request: "*"\n  fsevents: "1"\n```',
  },
  {
    key: 'updateConfig',
    default: '{}',
    type: 'Object',
    category: 'dependency',
    description:
      'Configuration for `pnpm update` / `pnpm outdated`.\n\nFields:\n- `ignoreDependencies`: Packages (or patterns) to skip when updating.\n\nExample:\n```yaml\nupdateConfig:\n  ignoreDependencies:\n    - load-json-file\n    - "@babel/*"\n```',
  },
  {
    key: 'supportedArchitectures',
    default: '{}',
    type: 'Object',
    category: 'modules',
    description:
      'Specify architectures for which optional dependencies should be installed (besides the current host).\n\nExample:\n```yaml\nsupportedArchitectures:\n  os: ["current", "linux"]\n  cpu: ["x64", "arm64"]\n  libc: ["glibc"]\n```',
  },
  {
    key: 'ignoredOptionalDependencies',
    default: '[]',
    type: 'String[]',
    category: 'dependency',
    description:
      'Optional dependencies in this list will not be installed. Supports glob patterns.\n\nExample:\n```yaml\nignoredOptionalDependencies:\n  - "@esbuild/*"\n```',
  },
  {
    key: 'minimumReleaseAge',
    default: '1440',
    type: 'Number',
    since: 11,
    category: 'dependency',
    description:
      'Minimum number of minutes that must pass after a version is published before pnpm will install it. Helps mitigate compromised package releases. Applies to **all dependencies**, including transitive ones. Default is `1440` (1 day) since v11; was `0` before v11. (pnpm v10.16.0+)',
  },
  {
    key: 'minimumReleaseAgeExclude',
    default: 'undefined',
    type: 'String[]',
    since: 10,
    category: 'dependency',
    description:
      'Packages excluded from the `minimumReleaseAge` check. Supports patterns and version selectors.\n\nExample:\n```yaml\nminimumReleaseAge: 1440\nminimumReleaseAgeExclude:\n  - webpack\n  - "@myorg/*"\n  - nx@21.6.5\n```',
  },
  {
    key: 'minimumReleaseAgeIgnoreMissingTime',
    default: 'true',
    type: 'Boolean',
    since: 11,
    category: 'dependency',
    description:
      'When `true`, pnpm skips the `minimumReleaseAge` check for packages whose registry metadata lacks a `time` field (some private registries omit it). Set to `false` to fail resolution instead. (pnpm v11+)',
  },
  {
    key: 'minimumReleaseAgeStrict',
    default: 'true if minimumReleaseAge is set, else false',
    type: 'Boolean',
    since: 11,
    category: 'dependency',
    description:
      'Controls behavior when no version satisfies the `minimumReleaseAge` constraint. When `true`, fails resolution; when `false`, falls back to a non-compliant version. (pnpm v11+)',
  },
  {
    key: 'trustPolicy',
    default: 'off',
    type: 'String',
    since: 10,
    validValues: ['off', 'no-downgrade'],
    category: 'dependency',
    description:
      'Supply-chain protection against trust downgrades.\n\n- `off` *(default)*: No trust check.\n- `no-downgrade`: Fail if a package\'s trust level decreased compared to previous releases (e.g. previously published by a trusted publisher but the new release lacks trust evidence).\n\nTrust checks are based on publish date, not semver. Since v10.24.0 prerelease versions are ignored when evaluating trust evidence for stable installs. (pnpm v10.21.0+)',
  },
  {
    key: 'trustPolicyExclude',
    default: '[]',
    type: 'String[]',
    since: 10,
    category: 'dependency',
    description:
      'Package selectors excluded from `trustPolicy` checks.\n\nExample:\n```yaml\ntrustPolicy: no-downgrade\ntrustPolicyExclude:\n  - "chokidar@4.0.3"\n  - "@babel/core@7.28.5"\n```\n(pnpm v10.22.0+)',
  },
  {
    key: 'trustPolicyIgnoreAfter',
    default: 'undefined',
    type: 'Number',
    since: 10,
    category: 'dependency',
    description:
      'Ignore the trust policy check for packages published more than this many minutes ago. Useful for grandfathering older packages that were published before signature/provenance was the norm. (pnpm v10.27.0+)',
  },
  {
    key: 'trustLockfile',
    default: 'false',
    type: 'Boolean',
    since: 11,
    category: 'dependency',
    description:
      'When `true`, `pnpm install` skips re-applying `minimumReleaseAge` and `trustPolicy` to entries already in the lockfile. Useful for closed-source projects with a fully-trusted lockfile to reduce memory usage. ⚠️ Leave `false` whenever outside collaborators can edit the lockfile. (pnpm v11.3.0+)',
  },
  {
    key: 'blockExoticSubdeps',
    default: 'true',
    type: 'Boolean',
    since: 10,
    category: 'dependency',
    description:
      'When `true`, only direct dependencies (those in your root `package.json`) may use exotic sources (git URLs, tarball URLs). All transitive dependencies must come from a trusted source. Helps secure the dependency supply chain. (pnpm v10.26.0+; default became `true` in v11)',
  },
  {
    key: 'registries',
    default: 'undefined',
    type: 'Record<String, String>',
    since: 11,
    category: 'dependency',
    description:
      'Configure registries for scoped packages. The `default` key sets the main registry (equivalent to `.npmrc`\'s `registry`). Scoped keys configure registries for specific package scopes.\n\nExample:\n```yaml\nregistries:\n  default: https://registry.npmjs.org/\n  "@my-org": https://private.example.com/\n  "@internal": https://nexus.corp.com/\n```\n(pnpm v11+)',
  },
  {
    key: 'namedRegistries',
    default: 'undefined',
    type: 'Record<String, String>',
    since: 11,
    category: 'dependency',
    description:
      'Named registry aliases usable as install prefixes (e.g. `pnpm add work:@corp/lib`). The `gh:` alias is built-in and points at GitHub Packages.\n\nExample:\n```yaml\nnamedRegistries:\n  gh: https://npm.pkg.github.example.com/\n  work: https://npm.work.example.com/\n```\n(pnpm v11.1.0+)',
  },
  {
    key: 'allowBuilds',
    default: '{}',
    type: 'Record<String, Boolean>',
    since: 11,
    category: 'scripts',
    description:
      'Unified allowlist/blocklist for packages permitted to execute install scripts. **Replaces** `onlyBuiltDependencies`, `neverBuiltDependencies`, `ignoredBuiltDependencies`, and `onlyBuiltDependenciesFile` (all consolidated in pnpm v11).\n\n- `true`  → package is allowed to run install scripts.\n- `false` → package scripts are silently skipped.\n\nExample:\n```yaml\nallowBuilds:\n  esbuild: true\n  "@swc/core": true\n  canvas: false\n  puppeteer: false\n```',
  },
  {
    key: 'requiredScripts',
    default: '[]',
    type: 'String[]',
    category: 'scripts',
    description:
      'List of script names that must be present in every workspace package.\n\nExample:\n```yaml\nrequiredScripts:\n  - build\n  - test\n```',
  },
  {
    key: 'configDependencies',
    default: '{}',
    type: 'Record<String, String>',
    since: 10,
    category: 'dependency',
    description:
      'Dependencies installed before any other dependencies (e.g. shared configs, hooks). They are installed without running their lifecycle scripts. (pnpm v10+)',
  },
  {
    key: 'auditConfig',
    default: '{}',
    type: 'Object',
    category: 'misc',
    description:
      'Configure `pnpm audit` behaviour.\n\nFields:\n- `ignoreCves`: List of CVE ids to ignore.\n- `ignoreGhsas`: List of GitHub Advisory ids to ignore.\n\nExample:\n```yaml\nauditConfig:\n  ignoreCves:\n    - CVE-2019-10742\n```',
  },
  {
    key: 'packageConfigs',
    default: '{}',
    type: 'Record<String, Object>',
    since: 11,
    category: 'workspace',
    description:
      'Per-subproject overrides. Replaces per-package `.npmrc` files. The key is a workspace package name; the value is any pnpm setting that applies only to that subproject.\n\nExample:\n```yaml\npackageConfigs:\n  "@my-org/web":\n    nodeLinker: hoisted\n    publicHoistPattern:\n      - "*types*"\n  "@my-org/native":\n    supportedArchitectures:\n      os: ["darwin", "ios"]\n```',
  },
];

// ─── Settings (formerly in .npmrc, now camelCase in pnpm-workspace.yaml) ──
// Reference: https://pnpm.io/settings
//
// pnpm v11+ uses camelCase for these keys when read from `pnpm-workspace.yaml`.
// (The legacy kebab-case in `.npmrc` only remains for auth/registry.)

const settingsFields: PnpmWorkspaceConfigEntry[] = [

  // ── Store & Cache ────────────────────────────────────────────────────────────
  {
    key: 'storeDir',
    default: 'Platform-dependent (~/.pnpm-store)',
    type: 'path',
    category: 'store',
    description:
      "The location where all packages are saved on disk. All projects share the same store.\n\nDefault locations:\n- Linux: `~/.local/share/pnpm/store`\n- macOS: `~/Library/pnpm/store`\n- Windows: `%LOCALAPPDATA%/pnpm/store`",
  },
  {
    key: 'cacheDir',
    default: 'Platform-dependent',
    type: 'path',
    category: 'store',
    description:
      "pnpm's cache directory (metadata, dlx cache).\n\nDefault locations:\n- Linux: `~/.cache/pnpm`\n- macOS: `~/Library/Caches/pnpm`\n- Windows: `%LOCALAPPDATA%/pnpm/cache`",
  },
  {
    key: 'stateDir',
    default: 'Platform-dependent',
    type: 'path',
    category: 'store',
    description: 'Directory for `pnpm-state.json` (used by the update checker).',
  },
  {
    key: 'globalDir',
    default: 'Platform-dependent',
    type: 'path',
    category: 'store',
    description: 'Directory to store global packages.',
  },
  {
    key: 'globalBinDir',
    default: 'Platform-dependent',
    type: 'path',
    category: 'store',
    description: 'Target directory for global package executables.',
  },
  {
    key: 'verifyStoreIntegrity',
    default: 'true',
    type: 'Boolean',
    category: 'store',
    description: 'Verify file integrity in the store before linking to `node_modules`.',
  },
  {
    key: 'useRunningStoreServer',
    default: 'false',
    type: 'Boolean',
    deprecated: true,
    category: 'store',
    description: '**Deprecated**: Only allow installation with a store server. If no store server is running, installation fails.',
  },
  {
    key: 'strictStorePkgContentCheck',
    default: 'true',
    type: 'Boolean',
    category: 'store',
    description:
      'When `true`, verify package name/version against store content. Set to `false` if your registry allows the same content under different names/versions.',
  },

  // ── Modules ─────────────────────────────────────────────────────────────────
  {
    key: 'hoist',
    default: 'true',
    type: 'Boolean',
    category: 'modules',
    description:
      'When `true`, all dependencies are hoisted to `node_modules/.pnpm/node_modules`. Makes unlisted dependencies accessible to all packages inside `node_modules`.',
  },
  {
    key: 'hoistWorkspacePackages',
    default: 'true',
    type: 'Boolean',
    category: 'modules',
    description: 'Symlink workspace packages into the virtual store.',
  },
  {
    key: 'hoistPattern',
    default: '["*"]',
    type: 'String[]',
    category: 'modules',
    description:
      'Glob patterns controlling which packages are hoisted to `.pnpm/node_modules`.\n\nExample:\n```yaml\nhoistPattern:\n  - "*types*"\n  - "*eslint*"\n```',
  },
  {
    key: 'publicHoistPattern',
    default: '[]',
    type: 'String[]',
    category: 'modules',
    description:
      'Glob patterns controlling which packages are hoisted to the **root** `node_modules`.\n\nExample:\n```yaml\npublicHoistPattern:\n  - "*eslint*"\n```',
  },
  {
    key: 'shamefullyHoist',
    default: 'false',
    type: 'Boolean',
    category: 'modules',
    description:
      'Hoist all packages to the root `node_modules`. Equivalent to `publicHoistPattern: ["*"]`.\n\n> ⚠️ Only use if you need compatibility with tools that expect a flat `node_modules`.',
  },
  {
    key: 'modulesDir',
    default: 'node_modules',
    type: 'path',
    category: 'modules',
    description: 'The directory where dependencies are installed.',
  },
  {
    key: 'nodeLinker',
    default: 'isolated',
    type: 'String',
    validValues: ['isolated', 'hoisted', 'pnp'],
    category: 'modules',
    description:
      'Defines the linker pnpm uses for installing Node.js packages.\n\n- `isolated` *(default)*: Dependencies are symlinked from a virtual store at `node_modules/.pnpm`.\n- `hoisted`: Flat `node_modules` similar to npm/yarn classic.\n- `pnp`: No `node_modules`; uses Plug\'n\'Play (Yarn Berry compatible).',
  },
  {
    key: 'symlink',
    default: 'true',
    type: 'Boolean',
    category: 'modules',
    description: 'When `false`, pnpm creates a virtual store without any symlinks.',
  },
  {
    key: 'virtualStoreDir',
    default: 'node_modules/.pnpm',
    type: 'path',
    category: 'modules',
    description: 'The directory with links to the store. All direct and indirect dependencies are linked here.',
  },
  {
    key: 'virtualStoreDirMaxLength',
    default: '120',
    type: 'Number',
    category: 'modules',
    description:
      'Maximum allowed length of the file paths inside the virtual store directory. Reduce this if you hit Windows long-path issues.',
  },
  {
    key: 'packageImportMethod',
    default: 'auto',
    type: 'String',
    validValues: ['auto', 'hardlink', 'copy', 'clone', 'clone-or-copy'],
    category: 'modules',
    description:
      'Controls how packages are imported from the store.\n\n- `auto` *(default)*: Try cloning, fall back to hardlinking, then copying.\n- `hardlink`: Use hard links.\n- `copy`: Copy files.\n- `clone`: Use CoW clones (reflinks).',
  },
  {
    key: 'modulesCacheMaxAge',
    default: '10080',
    type: 'Number',
    category: 'modules',
    description: 'Time (in minutes) to keep orphan packages in the `node_modules` cache. Default is 7 days.',
  },
  {
    key: 'enableModulesDir',
    default: 'true',
    type: 'Boolean',
    category: 'modules',
    description:
      'When `false`, pnpm will not write any files to the modules directory (`node_modules`). Useful when the modules directory is mounted with FUSE.',
  },
  {
    key: 'virtualStoreOnly',
    default: 'false',
    type: 'Boolean',
    since: 11,
    category: 'modules',
    description:
      'When `true`, populate the virtual store without creating importer symlinks, hoisting, bin links, or running lifecycle scripts. Useful for pre-populating a store (e.g. in Nix builds). `pnpm fetch` uses this internally. (pnpm v11+)',
  },
  {
    key: 'enableGlobalVirtualStore',
    default: 'false',
    type: 'Boolean',
    since: 10,
    category: 'modules',
    description:
      'When enabled, `node_modules` contains symlinks to a central virtual store at `<store-path>/links` rather than to `node_modules/.pnpm`. Speeds up installs with a warm cache. Auto-disabled in CI. ⚠️ Has caveats with ESM modules that import undeclared deps. In pnpm v11, global installs and `pnpm dlx` use this by default. (pnpm v10.12.1+)',
  },

  // ── Lockfile
  // ── Lockfile ─────────────────────────────────────────────────────────────────
  {
    key: 'lockfile',
    default: 'true',
    type: 'Boolean',
    category: 'lockfile',
    description: 'When `false`, pnpm will not read or write `pnpm-lock.yaml`.',
  },
  {
    key: 'preferFrozenLockfile',
    default: 'true',
    type: 'Boolean',
    category: 'lockfile',
    description:
      'When `true`, if `pnpm-lock.yaml` satisfies `package.json`, a headless installation is performed — skipping dependency resolution.',
  },
  {
    key: 'lockfileIncludeTarballUrl',
    default: 'false',
    type: 'Boolean',
    category: 'lockfile',
    description: 'Add the full tarball URL to every entry in `pnpm-lock.yaml`.',
  },
  {
    key: 'useLockfileV6',
    default: 'false',
    type: 'Boolean',
    category: 'lockfile',
    deprecated: true,
    description:
      '**Deprecated**: Use the older lockfile v6 format. Modern pnpm uses v9 by default.',
  },
  {
    key: 'frozenLockfile',
    default: 'false (CI: true)',
    type: 'Boolean',
    category: 'lockfile',
    description:
      'When `true`, pnpm will not generate a lockfile and will fail if an update is needed. Implicitly `true` in CI environments.',
  },
  {
    key: 'gitBranchLockfile',
    default: 'false',
    type: 'Boolean',
    category: 'lockfile',
    description:
      'When `true`, the generated lockfile name is suffixed with the current git branch (e.g. `pnpm-lock.feature-foo.yaml`) to avoid merge conflicts.',
  },
  {
    key: 'mergeGitBranchLockfilesBranchPattern',
    default: 'null',
    type: 'String[] | null',
    category: 'lockfile',
    description:
      'Branch patterns for which all per-branch lockfiles are merged automatically (no need to pass `--merge-git-branch-lockfiles`).\n\nExample:\n```yaml\nmergeGitBranchLockfilesBranchPattern:\n  - main\n  - release*\n```',
  },
  {
    key: 'peersSuffixMaxLength',
    default: '1000',
    type: 'Number',
    category: 'lockfile',
    description: 'Max length of the peer-id suffix added to dependency keys in the lockfile. Longer suffixes are replaced with a hash.',
  },

  // ── Network ──────────────────────────────────────────────────────────────────
  {
    key: 'networkConcurrency',
    default: 'auto (16–64)',
    type: 'Number',
    category: 'network',
    description: 'Maximum number of concurrent HTTP(S) requests.',
  },
  {
    key: 'fetchRetries',
    default: '2',
    type: 'Number',
    category: 'network',
    description: 'Number of retries for failed registry fetches.',
  },
  {
    key: 'fetchRetryFactor',
    default: '10',
    type: 'Number',
    category: 'network',
    description: 'Exponential factor for retry backoff.',
  },
  {
    key: 'fetchRetryMintimeout',
    default: '10000',
    type: 'Number',
    category: 'network',
    description: 'Minimum base timeout (in milliseconds) for retrying requests.',
  },
  {
    key: 'fetchRetryMaxtimeout',
    default: '60000',
    type: 'Number',
    category: 'network',
    description: 'Maximum fallback timeout (in milliseconds) for retries.',
  },
  {
    key: 'fetchTimeout',
    default: '60000',
    type: 'Number',
    category: 'network',
    description: 'Maximum time (in milliseconds) to wait for HTTP requests.',
  },
  {
    key: 'fetchWarnTimeoutMs',
    default: '10000',
    type: 'Number',
    since: 10,
    category: 'network',
    description:
      'A warning is displayed when a metadata request to the registry takes longer than this threshold (in ms). (pnpm v10.18.0+)',
  },
  {
    key: 'fetchMinSpeedKiBps',
    default: '50',
    type: 'Number',
    since: 10,
    category: 'network',
    description:
      'A warning is displayed if the tarball download speed falls below this threshold (in KiB/s). (pnpm v10.18.0+)',
  },
  {
    key: 'gitShallowHosts',
    default: "['github.com', 'gist.github.com', 'gitlab.com', 'bitbucket.com', 'bitbucket.org']",
    type: 'String[]',
    category: 'network',
    description:
      'When fetching git dependencies, hosts in this list will be cloned shallowly (only the needed commit instead of full history).',
  },
  {
    key: 'localAddress',
    default: '""',
    type: 'String',
    category: 'network',
    description: 'IP address of the local interface to use when making outgoing connections.',
  },
  {
    key: 'maxSockets',
    default: 'networkConcurrency × 3',
    type: 'Number',
    category: 'network',
    description: 'Maximum number of connections to use per origin (protocol/host/port combination).',
  },

  // ── SSL / TLS ────────────────────────────────────────────────────────────────
  {
    key: 'strictSsl',
    default: 'true',
    type: 'Boolean',
    category: 'ssl',
    description: 'When `true`, pnpm validates the registry server\'s SSL certificate.',
  },
  {
    key: 'ca',
    default: 'null',
    type: 'String | String[]',
    category: 'ssl',
    description:
      'PEM-encoded Certificate Authority signing certificate(s) trusted for SSL connections to the registry.\n\nExample:\n```yaml\nca: |\n  -----BEGIN CERTIFICATE-----\n  XXXX\n  -----END CERTIFICATE-----\n```',
  },
  {
    key: 'cafile',
    default: '""',
    type: 'path',
    category: 'ssl',
    description: 'A path to a file containing one or more CA certificates (concatenated PEM format).',
  },
  {
    key: 'cert',
    default: '""',
    type: 'String',
    category: 'ssl',
    description: 'A client certificate (PEM-encoded) used to authenticate to the registry.',
  },
  {
    key: 'key',
    default: '""',
    type: 'String',
    category: 'ssl',
    description: 'A client key (PEM-encoded) used to authenticate to the registry.',
  },

  // ── Proxy ───────────────────────────────────────────────────────────────────
  {
    key: 'httpProxy',
    default: '""',
    type: 'URL',
    category: 'proxy',
    description: 'A proxy to use for outgoing HTTP requests. Honored via `HTTP_PROXY` / `http_proxy` env vars.',
  },
  {
    key: 'httpsProxy',
    default: '""',
    type: 'URL',
    category: 'proxy',
    description: 'A proxy to use for outgoing HTTPS requests. Honored via `HTTPS_PROXY` / `https_proxy` env vars.',
  },
  {
    key: 'proxy',
    default: '""',
    type: 'URL',
    category: 'proxy',
    description: 'A proxy to use for outgoing requests of any protocol. Falls back to `httpProxy` / `httpsProxy`.',
  },
  {
    key: 'noProxy',
    default: '""',
    type: 'String',
    category: 'proxy',
    description: 'Comma-separated string of domain extensions that should bypass the proxy.',
  },

  // ── Peers ────────────────────────────────────────────────────────────────────
  {
    key: 'autoInstallPeers',
    default: 'true',
    type: 'Boolean',
    category: 'peers',
    description: 'Automatically install missing non-optional peer dependencies.',
  },
  {
    key: 'dedupePeerDependents',
    default: 'true',
    type: 'Boolean',
    category: 'peers',
    description: 'Deduplicate packages with peer dependencies where possible.',
  },
  {
    key: 'strictPeerDependencies',
    default: 'false',
    type: 'Boolean',
    category: 'peers',
    description: 'Fail if there are missing or invalid peer dependencies.',
  },
  {
    key: 'resolvePeersFromWorkspaceRoot',
    default: 'true',
    type: 'Boolean',
    category: 'peers',
    description: 'Use root workspace dependencies to resolve peer dependencies of other workspaces.',
  },
  {
    key: 'dedupePeers',
    default: 'false',
    type: 'Boolean',
    since: 10,
    category: 'peers',
    description:
      'When enabled, peer dependency suffixes use version-only identifiers (`name@version`) instead of full dep paths, eliminating nested suffixes like `(foo@1.0.0(bar@2.0.0))`. Significantly reduces package instance count in projects with many recursive peer deps. Different from `dedupePeerDependents`. (pnpm v10.33.0+)',
  },

  // ── Scripts & Build ──────────────────────────────────────────────────────────
  {
    key: 'ignoreScripts',
    default: 'false',
    type: 'Boolean',
    category: 'scripts',
    description: 'Do not execute any scripts defined in the project `package.json` and its dependencies. (Does not affect `.pnpmfile.cjs/.mjs`.)',
  },
  {
    key: 'ignoreDepScripts',
    default: 'false',
    type: 'Boolean',
    deprecated: true,
    category: 'scripts',
    description: "**Deprecated** in favour of `allowBuilds`. Do not execute scripts defined in dependencies, but do run scripts of the project's own packages.",
  },
  {
    key: 'childConcurrency',
    default: '5',
    type: 'Number',
    category: 'scripts',
    description: 'Maximum number of child processes to build `node_modules` in parallel.',
  },
  {
    key: 'sideEffectsCache',
    default: 'true',
    type: 'Boolean',
    category: 'scripts',
    description: 'Cache the results of `(pre/post)install` hooks and reuse them next time.',
  },
  {
    key: 'sideEffectsCacheReadonly',
    default: 'false',
    type: 'Boolean',
    category: 'scripts',
    description: 'Only use the side effects cache if present; do not create new cache entries.',
  },
  {
    key: 'unsafePerm',
    default: 'false (root) / true (non-root)',
    type: 'Boolean',
    category: 'scripts',
    description: 'Enable UID/GID switching when running package scripts.',
  },
  {
    key: 'enablePrePostScripts',
    default: 'true',
    type: 'Boolean',
    category: 'scripts',
    description: 'Automatically run `pre<script>` and `post<script>` hooks.',
  },
  {
    key: 'nodeOptions',
    default: 'null',
    type: 'String',
    category: 'scripts',
    description:
      'Options passed to Node.js via `NODE_OPTIONS` for lifecycle scripts (does not affect pnpm itself).\n\nExample:\n```yaml\nnodeOptions: "${NODE_OPTIONS:- } --experimental-vm-modules"\n```',
  },
  {
    key: 'strictDepBuilds',
    default: 'true',
    type: 'Boolean',
    since: 10,
    category: 'scripts',
    description:
      'When `true`, installation exits with non-zero exit code if any dependency has unreviewed build scripts. Pairs with `allowBuilds`. (pnpm v10.3.0+)',
  },
  {
    key: 'dangerouslyAllowAllBuilds',
    default: 'false',
    type: 'Boolean',
    since: 10,
    category: 'scripts',
    description:
      'Allow all packages to run build scripts without approval. ⚠️ Disables supply-chain security controls. (pnpm v10.9.0+)',
  },
  {
    key: 'scriptShell',
    default: 'null',
    type: 'path',
    category: 'scripts',
    description:
      'Shell used by `pnpm run` to execute scripts.\n\nExample:\n```yaml\nscriptShell: "C:\\\\Program Files\\\\git\\\\bin\\\\bash.exe"\n```',
  },
  {
    key: 'verifyDepsBeforeRun',
    default: 'false',
    type: 'String | Boolean',
    validValues: ['install', 'warn', 'error', 'prompt', 'true', 'false'],
    category: 'scripts',
    description:
      'Check that `node_modules` is up to date before running scripts.\n\n- `install`: Auto-install if out of date.\n- `warn`: Print a warning.\n- `error`: Exit with an error.\n- `prompt`: Ask the user.',
  },
  {
    key: 'preferSymlinkedExecutables',
    default: 'true',
    type: 'Boolean',
    category: 'scripts',
    description: 'Create symlinks to executables in `node_modules/.bin` instead of command shims.',
  },

  // ── Node.js version management ───────────────────────────────────────────────
  {
    key: 'nodeVersion',
    default: 'value of `node -v`',
    type: 'String',
    category: 'node',
    description:
      'The Node.js version used when checking a package\'s `engines` setting. Use together with `engineStrict` to prevent contributors from adding incompatible dependencies.',
  },
  {
    key: 'useNodeVersion',
    default: '""',
    type: 'semver',
    category: 'node',
    description:
      'The exact Node.js version to use for the project runtime. pnpm will automatically download and use this version.',
  },
  {
    key: 'runtimeOnFail',
    default: 'undefined',
    type: 'String',
    since: 11,
    validValues: ['download', 'error', 'warn', 'ignore'],
    category: 'node',
    description:
      'Overrides the `onFail` behavior of `devEngines.runtime` / `engines.runtime` in the root `package.json`. Useful for forcing pnpm to download/error/warn/ignore when the runtime mismatch occurs locally. (pnpm v11+)',
  },
  {
    key: 'nodeDownloadMirrors',
    default: 'undefined',
    type: 'Record<String, String>',
    since: 11,
    category: 'node',
    description:
      'Configure custom Node.js download mirrors. Keys are release channels (`release`, `rc`, `nightly`, `v8-canary`).\n\nExample:\n```yaml\nnodeDownloadMirrors:\n  release: https://npmmirror.com/mirrors/node/\n  rc: https://npmmirror.com/mirrors/node-rc/\n  nightly: https://npmmirror.com/mirrors/node-nightly/\n```\n(pnpm v11+)',
  },
  {
    key: 'pmOnFail',
    default: 'download',
    type: 'String',
    since: 11,
    validValues: ['download', 'error', 'warn', 'ignore'],
    category: 'node',
    description:
      'Overrides the `onFail` behavior of `packageManager` and `devEngines.packageManager` when the running pnpm version does not match the declared one.\n\n- `download` *(default)*: Download and use the declared pnpm version (was `managePackageManagerVersions: true`).\n- `error`: Fail the command (was `packageManagerStrictVersion: true`).\n- `warn`: Print a warning but continue (was `packageManagerStrict: false` / `COREPACK_ENABLE_STRICT=0`).\n- `ignore`: Skip the check entirely (was `managePackageManagerVersions: false`).\n\n**Replaces** `managePackageManagerVersions`, `packageManagerStrict`, `packageManagerStrictVersion`, and the `COREPACK_ENABLE_STRICT` env var. (pnpm v11+)',
  },
  {
    key: 'managePackageManagerVersions',
    default: 'true',
    type: 'Boolean',
    deprecated: true,
    category: 'node',
    description:
      '**Removed in v11**: Use `pmOnFail: download` (default) or `pmOnFail: ignore` instead.',
  },
  {
    key: 'packageManagerStrict',
    default: 'true',
    type: 'Boolean',
    deprecated: true,
    category: 'node',
    description:
      '**Removed in v11**: Use `pmOnFail: warn` instead.',
  },
  {
    key: 'packageManagerStrictVersion',
    default: 'false',
    type: 'Boolean',
    deprecated: true,
    category: 'node',
    description:
      '**Removed in v11**: Use `pmOnFail: error` instead.',
  },
  {
    key: 'engineStrict',
    default: 'false',
    type: 'Boolean',
    category: 'node',
    description: 'If `true`, pnpm will refuse to install packages incompatible with the current Node.js version.',
  },
  {
    key: 'extendNodePath',
    default: 'true',
    type: 'Boolean',
    category: 'node',
    description: 'Set `NODE_PATH` in command shims.',
  },

  // ── CLI & Output ─────────────────────────────────────────────────────────────
  {
    key: 'color',
    default: 'auto',
    type: 'String',
    validValues: ['auto', 'always', 'never'],
    category: 'cli',
    description:
      'Controls colors in the output.\n\n- `auto` *(default)*: Output uses colors when stdout is a TTY.\n- `always`: Always emit color codes.\n- `never`: Disable colors.',
  },
  {
    key: 'loglevel',
    default: 'info',
    type: 'String',
    validValues: ['debug', 'info', 'warn', 'error'],
    category: 'cli',
    description: 'Logs at or higher than the given level will be shown. Use `--silent` to turn off all output logs.',
  },
  {
    key: 'useBetaCli',
    default: 'false',
    type: 'Boolean',
    category: 'cli',
    description: 'Experimental: enables beta features of the CLI. May contain breaking changes or bugs.',
  },
  {
    key: 'useStderr',
    default: 'false',
    type: 'Boolean',
    category: 'cli',
    description: 'Write all output to stderr.',
  },
  {
    key: 'updateNotifier',
    default: 'true',
    type: 'Boolean',
    category: 'cli',
    description: 'Set to `false` to suppress update notifications when using an older pnpm version.',
  },
  {
    key: 'shellEmulator',
    default: 'false',
    type: 'Boolean',
    category: 'cli',
    description:
      'When `true`, use a JavaScript bash-like shell emulator for running scripts. Useful for Windows cross-platform compatibility.',
  },
  {
    key: 'npmPath',
    default: 'auto-detected',
    type: 'path',
    category: 'cli',
    description: 'Path to the npm binary that pnpm should use for certain sub-commands.',
  },
  {
    key: 'ignoreWorkspaceRootCheck',
    default: 'false',
    type: 'Boolean',
    category: 'cli',
    description:
      'When `true`, `pnpm install` / `pnpm add` from the workspace root no longer errors when `-w` / `--ignore-workspace-root-check` is omitted.',
  },
  {
    key: 'ci',
    default: 'auto-detected',
    type: 'Boolean',
    since: 10,
    category: 'cli',
    description: 'Explicitly tells pnpm whether the current environment is a CI environment. (pnpm v10.12.1+)',
  },

  // ── Workspace ────────────────────────────────────────────────────────────────
  {
    key: 'recursiveInstall',
    default: 'true',
    type: 'Boolean',
    category: 'workspace',
    description: 'When `true`, `pnpm install` behaves as if `pnpm install -r` was called.',
  },
  {
    key: 'linkWorkspacePackages',
    default: 'deep',
    type: 'Boolean | "deep"',
    validValues: ['true', 'false', 'deep'],
    category: 'workspace',
    description:
      'Link workspace packages instead of downloading from the registry.\n\n- `true`: Link directly-used workspace packages.\n- `deep`: Link all transitive workspace packages.\n- `false`: Never link workspace packages.',
  },
  {
    key: 'preferWorkspacePackages',
    default: 'false',
    type: 'Boolean',
    category: 'workspace',
    description:
      'When `true`, local packages from the workspace are always preferred over packages from the registry.',
  },
  {
    key: 'sharedWorkspaceLockfile',
    default: 'true',
    type: 'Boolean',
    category: 'workspace',
    description:
      'When `true`, a single `pnpm-lock.yaml` is created at the root of the workspace.',
  },
  {
    key: 'saveWorkspaceProtocol',
    default: 'rolling',
    type: 'Boolean | "rolling"',
    validValues: ['true', 'false', 'rolling'],
    category: 'workspace',
    description:
      'When adding a workspace dependency, controls whether the `workspace:` protocol prefix is used.\n\n- `true`: Always use `workspace:`.\n- `rolling`: Use `workspace:^` for the highest matching range.\n- `false`: Use the regular semver range.',
  },
  {
    key: 'includeWorkspaceRoot',
    default: 'false',
    type: 'Boolean',
    category: 'workspace',
    description:
      'When executing recursive commands, include the workspace root package in the loop.',
  },

  // ── Resolution ───────────────────────────────────────────────────────────────
  {
    key: 'resolutionMode',
    default: 'highest',
    type: 'String',
    validValues: ['highest', 'time-based', 'lowest-direct'],
    category: 'misc',
    description:
      'Controls version resolution strategy.\n\n- `highest` *(default)*: The highest compatible version.\n- `time-based`: The latest version published before the direct dependency\'s publish time.\n- `lowest-direct`: The lowest version matching the range (for direct deps only).',
  },
  {
    key: 'registrySupportsTimeField',
    default: 'false',
    type: 'Boolean',
    category: 'misc',
    description:
      'Set to `true` if your registry returns a `time` field in abbreviated metadata (e.g. Verdaccio v5.15.1+). Speeds up `time-based` resolution.',
  },
  {
    key: 'catalogMode',
    default: 'manual',
    type: 'String',
    since: 10,
    validValues: ['manual', 'strict', 'prefer'],
    category: 'misc',
    description:
      'Controls how `pnpm add` interacts with the default catalog.\n\n- `manual` *(default)*: Do not auto-add to the catalog.\n- `prefer`: Prefer catalog versions, fall back to direct deps.\n- `strict`: Only allow catalog versions; error on out-of-range adds.\n\n(pnpm v10.12.1+)',
  },
  {
    key: 'cleanupUnusedCatalogs',
    default: 'false',
    type: 'Boolean',
    since: 10,
    category: 'misc',
    description: 'When `true`, pnpm removes unused catalog entries during installation. (pnpm v10.15.0+)',
  },
  {
    key: 'savePrefix',
    default: '^',
    type: 'String',
    validValues: ['^', '~', ''],
    category: 'misc',
    description:
      'Configure how versions of installed packages are saved in `package.json`.\n\n- `^`: Caret range (default).\n- `~`: Tilde range.\n- `""`: Pin to exact version.',
  },
  {
    key: 'saveExact',
    default: 'false',
    type: 'Boolean',
    category: 'misc',
    description:
      'When `true`, saved dependencies are configured with an exact version rather than using a range prefix.',
  },
  {
    key: 'tag',
    default: 'latest',
    type: 'String',
    category: 'misc',
    description:
      'When `pnpm install` is run without specifying a version, install this dist-tag.',
  },
  {
    key: 'globalPnpmfile',
    default: '""',
    type: 'path',
    category: 'misc',
    description: 'Path to a global pnpm hooks file. Use with care; affects all projects.',
  },
  {
    key: 'npmrcAuthFile',
    default: '~/.npmrc',
    type: 'path',
    since: 11,
    category: 'misc',
    description:
      'Path to a file containing registry authentication tokens. Defaults to `~/.npmrc`. Use this to point at a different file for auth fallback. (pnpm v11+)',
  },

  // ── Misc ────────────────────────────────────────────────────────────────────
  {
    key: 'dlxCacheMaxAge',
    default: '1440',
    type: 'Number',
    category: 'misc',
    description: 'Time (in minutes) until the `pnpm dlx` cache expires. Default is 1 day.',
  },
  {
    key: 'deployAllFiles',
    default: 'false',
    type: 'Boolean',
    category: 'misc',
    description: "Copy all package files when deploying (not just the files listed in the package's `files` field).",
  },
  {
    key: 'dedupeDirectDeps',
    default: 'false',
    type: 'Boolean',
    category: 'misc',
    description:
      'When `true`, dependencies already symlinked to the root workspace `node_modules` are not symlinked again to subproject `node_modules`.',
  },
  {
    key: 'optimisticRepeatInstall',
    default: 'true',
    type: 'Boolean',
    since: 10,
    category: 'misc',
    description:
      'When enabled, a fast pre-check is performed before installation. Repeat installs / installs on up-to-date projects become much faster. (pnpm v10.1.0+)',
  },
  {
    key: 'ignoreCompatibilityDb',
    default: 'false',
    type: 'Boolean',
    category: 'misc',
    description:
      'During installation pnpm auto-patches some dependencies using `@yarnpkg/extensions`. Set to `true` to disable these auto-patches.',
  },
];

// ─── Exports ──────────────────────────────────────────────────────────────────

export const pnpmWorkspaceConfigs: PnpmWorkspaceConfigEntry[] = [
  ...workspaceOnlyFields,
  ...settingsFields,
];

/** Set of keys that are workspace-only (used to pick the right docs URL) */
export const workspaceOnlyFieldKeys: ReadonlySet<string> = new Set(
  workspaceOnlyFields.map((c) => c.key)
);

/** Fast lookup map: key → config entry */
export const pnpmWorkspaceConfigMap: Map<string, PnpmWorkspaceConfigEntry> = new Map(
  pnpmWorkspaceConfigs.map((c) => [c.key, c])
);

/** Lookup a config entry by key */
export function lookupPnpmWorkspaceConfig(key: string): PnpmWorkspaceConfigEntry | undefined {
  return pnpmWorkspaceConfigMap.get(key);
}

// ─── Migration / deprecation hints ───────────────────────────────────────────
// Old kebab-case keys that previously lived in `.npmrc` are now deprecated in
// favour of camelCase keys in `pnpm-workspace.yaml`. Build-related keys are
// folded into the new `allowBuilds` map.

export interface DeprecatedKeyHint {
  /** New replacement key in pnpm-workspace.yaml */
  replacement: string;
  /** Optional human-readable extra hint (e.g. for merged keys) */
  note?: string;
}

export const deprecatedPnpmKeys: Record<string, DeprecatedKeyHint> = {
  // Build-dependency consolidation (pnpm v11)
  onlyBuiltDependencies: {
    replacement: 'allowBuilds',
    note: 'Use `allowBuilds: { <pkg>: true }` to allow a package to run install scripts.',
  },
  neverBuiltDependencies: {
    replacement: 'allowBuilds',
    note: 'Use `allowBuilds: { <pkg>: false }` to block a package\'s install scripts.',
  },
  ignoredBuiltDependencies: {
    replacement: 'allowBuilds',
    note: 'Use `allowBuilds: { <pkg>: false }` to silently skip a package\'s install scripts.',
  },
  onlyBuiltDependenciesFile: {
    replacement: 'allowBuilds',
    note: 'Inline the file contents into the `allowBuilds` map.',
  },

  // kebab-case → camelCase migration (a representative subset; mostly to help
  // users who paste old `.npmrc` snippets into `pnpm-workspace.yaml`).
  'store-dir': { replacement: 'storeDir' },
  'cache-dir': { replacement: 'cacheDir' },
  'state-dir': { replacement: 'stateDir' },
  'global-dir': { replacement: 'globalDir' },
  'global-bin-dir': { replacement: 'globalBinDir' },
  'verify-store-integrity': { replacement: 'verifyStoreIntegrity' },
  'use-running-store-server': { replacement: 'useRunningStoreServer' },
  'strict-store-pkg-content-check': { replacement: 'strictStorePkgContentCheck' },
  'hoist-workspace-packages': { replacement: 'hoistWorkspacePackages' },
  'hoist-pattern': { replacement: 'hoistPattern' },
  'public-hoist-pattern': { replacement: 'publicHoistPattern' },
  'shamefully-hoist': { replacement: 'shamefullyHoist' },
  'modules-dir': { replacement: 'modulesDir' },
  'node-linker': { replacement: 'nodeLinker' },
  'virtual-store-dir': { replacement: 'virtualStoreDir' },
  'virtual-store-dir-max-length': { replacement: 'virtualStoreDirMaxLength' },
  'package-import-method': { replacement: 'packageImportMethod' },
  'modules-cache-max-age': { replacement: 'modulesCacheMaxAge' },
  'enable-modules-dir': { replacement: 'enableModulesDir' },
  'virtual-store-only': { replacement: 'virtualStoreOnly' },
  'enable-global-virtual-store': { replacement: 'enableGlobalVirtualStore' },
  'prefer-frozen-lockfile': { replacement: 'preferFrozenLockfile' },
  'lockfile-include-tarball-url': { replacement: 'lockfileIncludeTarballUrl' },
  'use-lockfile-v6': { replacement: 'useLockfileV6' },
  'frozen-lockfile': { replacement: 'frozenLockfile' },
  'git-branch-lockfile': { replacement: 'gitBranchLockfile' },
  'merge-git-branch-lockfiles-branch-pattern': { replacement: 'mergeGitBranchLockfilesBranchPattern' },
  'peers-suffix-max-length': { replacement: 'peersSuffixMaxLength' },
  'network-concurrency': { replacement: 'networkConcurrency' },
  'fetch-retries': { replacement: 'fetchRetries' },
  'fetch-retry-factor': { replacement: 'fetchRetryFactor' },
  'fetch-retry-mintimeout': { replacement: 'fetchRetryMintimeout' },
  'fetch-retry-maxtimeout': { replacement: 'fetchRetryMaxtimeout' },
  'fetch-timeout': { replacement: 'fetchTimeout' },
  'fetch-warn-timeout-ms': { replacement: 'fetchWarnTimeoutMs' },
  'fetch-min-speed-ki-bps': { replacement: 'fetchMinSpeedKiBps' },
  'git-shallow-hosts': { replacement: 'gitShallowHosts' },
  'local-address': { replacement: 'localAddress' },
  'max-sockets': { replacement: 'maxSockets' },
  'strict-ssl': { replacement: 'strictSsl' },
  'http-proxy': { replacement: 'httpProxy' },
  'https-proxy': { replacement: 'httpsProxy' },
  'no-proxy': { replacement: 'noProxy' },
  noproxy: { replacement: 'noProxy' },
  'auto-install-peers': { replacement: 'autoInstallPeers' },
  'dedupe-peer-dependents': { replacement: 'dedupePeerDependents' },
  'dedupe-peers': { replacement: 'dedupePeers' },
  'strict-peer-dependencies': { replacement: 'strictPeerDependencies' },
  'resolve-peers-from-workspace-root': { replacement: 'resolvePeersFromWorkspaceRoot' },
  'ignore-dep-scripts': { replacement: 'ignoreDepScripts' },
  'child-concurrency': { replacement: 'childConcurrency' },
  'side-effects-cache': { replacement: 'sideEffectsCache' },
  'side-effects-cache-readonly': { replacement: 'sideEffectsCacheReadonly' },
  'unsafe-perm': { replacement: 'unsafePerm' },
  'enable-pre-post-scripts': { replacement: 'enablePrePostScripts' },
  'block-exotic-subdeps': { replacement: 'blockExoticSubdeps' },
  'dangerously-allow-all-builds': { replacement: 'dangerouslyAllowAllBuilds' },
  'trust-policy': { replacement: 'trustPolicy' },
  'trust-policy-exclude': { replacement: 'trustPolicyExclude' },
  'trust-policy-ignore-after': { replacement: 'trustPolicyIgnoreAfter' },
  'trust-lockfile': { replacement: 'trustLockfile' },
  'minimum-release-age': { replacement: 'minimumReleaseAge' },
  'minimum-release-age-exclude': { replacement: 'minimumReleaseAgeExclude' },
  'minimum-release-age-ignore-missing-time': { replacement: 'minimumReleaseAgeIgnoreMissingTime' },
  'minimum-release-age-strict': { replacement: 'minimumReleaseAgeStrict' },
  'verify-deps-before-run': { replacement: 'verifyDepsBeforeRun' },
  'strict-dep-builds': { replacement: 'strictDepBuilds' },
  'ignore-scripts': { replacement: 'ignoreScripts' },
  'script-shell': { replacement: 'scriptShell' },
  'node-options': { replacement: 'nodeOptions' },
  'prefer-symlinked-executables': { replacement: 'preferSymlinkedExecutables' },
  'use-node-version': { replacement: 'useNodeVersion' },
  'node-version': { replacement: 'nodeVersion' },
  'runtime-on-fail': { replacement: 'runtimeOnFail' },
  'node-download-mirrors': { replacement: 'nodeDownloadMirrors' },
  'pm-on-fail': { replacement: 'pmOnFail' },
  'manage-package-manager-versions': { replacement: 'managePackageManagerVersions' },
  'package-manager-strict': { replacement: 'packageManagerStrict' },
  'package-manager-strict-version': { replacement: 'packageManagerStrictVersion' },
  'engine-strict': { replacement: 'engineStrict' },
  'extend-node-path': { replacement: 'extendNodePath' },
  'use-stderr': { replacement: 'useStderr' },
  'update-notifier': { replacement: 'updateNotifier' },
  'use-beta-cli': { replacement: 'useBetaCli' },
  'ignore-workspace-root-check': { replacement: 'ignoreWorkspaceRootCheck' },
  'shell-emulator': { replacement: 'shellEmulator' },
  'npm-path': { replacement: 'npmPath' },
  'recursive-install': { replacement: 'recursiveInstall' },
  'link-workspace-packages': { replacement: 'linkWorkspacePackages' },
  'prefer-workspace-packages': { replacement: 'preferWorkspacePackages' },
  'shared-workspace-lockfile': { replacement: 'sharedWorkspaceLockfile' },
  'save-workspace-protocol': { replacement: 'saveWorkspaceProtocol' },
  'include-workspace-root': { replacement: 'includeWorkspaceRoot' },
  'resolution-mode': { replacement: 'resolutionMode' },
  'registry-supports-time-field': { replacement: 'registrySupportsTimeField' },
  'catalog-mode': { replacement: 'catalogMode' },
  'cleanup-unused-catalogs': { replacement: 'cleanupUnusedCatalogs' },
  'save-prefix': { replacement: 'savePrefix' },
  'save-exact': { replacement: 'saveExact' },
  'global-pnpmfile': { replacement: 'globalPnpmfile' },
  'dlx-cache-max-age': { replacement: 'dlxCacheMaxAge' },
  'deploy-all-files': { replacement: 'deployAllFiles' },
  'dedupe-direct-deps': { replacement: 'dedupeDirectDeps' },
  'optimistic-repeat-install': { replacement: 'optimisticRepeatInstall' },
  'ignore-compatibility-db': { replacement: 'ignoreCompatibilityDb' },
  'npmrc-auth-file': { replacement: 'npmrcAuthFile' },
};
