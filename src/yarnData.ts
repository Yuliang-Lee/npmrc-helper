export interface YarnConfigEntry {
  key: string;
  type: string;
  default: string;
  description: string;
  deprecated?: boolean;
  validValues?: string[];
  /** npm .npmrc equivalent key, if any */
  npmEquivalent?: string;
}

export const yarnConfigs: YarnConfigEntry[] = [

  // ─── Registry & Auth ──────────────────────────────────────────────────────
  {
    key: 'npmRegistryServer',
    type: 'String',
    default: 'https://registry.yarnpkg.com',
    npmEquivalent: 'registry',
    description:
      'Default npm registry. Equivalent to `registry` in `.npmrc`.\n\nExample:\n```yaml\nnpmRegistryServer: "https://registry.npmjs.org"\n```',
  },
  {
    key: 'npmPublishRegistry',
    type: 'String',
    default: 'Same as npmRegistryServer',
    npmEquivalent: 'registry',
    description: 'Registry to use when publishing packages (`yarn npm publish`).',
  },
  {
    key: 'npmAuditRegistry',
    type: 'String',
    default: 'https://registry.npmjs.org',
    description: 'Registry to use when running `yarn npm audit`.',
  },
  {
    key: 'npmAuthToken',
    type: 'String',
    default: '""',
    npmEquivalent: '_authToken',
    description:
      'Bearer authentication token for the npm registry.\n\n> Tip: use an environment variable to avoid committing secrets:\n> ```yaml\n> npmAuthToken: "${NPM_TOKEN}"\n> ```',
  },
  {
    key: 'npmAuthIdent',
    type: 'String',
    default: '""',
    npmEquivalent: '_auth',
    description:
      'Base64-encoded `username:password` for basic auth (legacy). Equivalent to `_auth` in `.npmrc`.',
  },
  {
    key: 'npmAlwaysAuth',
    type: 'Boolean',
    default: 'false',
    npmEquivalent: 'always-auth',
    description: 'Always send authentication credentials to the registry, even for `GET` requests.',
  },
  {
    key: 'npmScopes',
    type: 'Object',
    default: '{}',
    description:
      'Registry configuration per scope. Overrides `npmRegistryServer` for matching scopes.\n\nExample:\n```yaml\nnpmScopes:\n  "@mycompany":\n    npmRegistryServer: "https://registry.mycompany.com"\n    npmAuthToken: "${COMPANY_TOKEN}"\n```',
  },
  {
    key: 'npmRegistries',
    type: 'Object',
    default: '{}',
    description:
      'Authentication per registry host. Useful for configuring credentials for multiple registries.\n\nExample:\n```yaml\nnpmRegistries:\n  "//npm.pkg.github.com":\n    npmAuthToken: "${GITHUB_TOKEN}"\n    npmAlwaysAuth: true\n```',
  },
  {
    key: 'npmPublishAccess',
    type: '"public" | "restricted"',
    default: 'public',
    npmEquivalent: 'access',
    validValues: ['public', 'restricted'],
    description: 'Access level for published packages (`public` or `restricted`).',
  },
  {
    key: 'npmPublishProvenance',
    type: 'Boolean',
    default: 'false',
    description: 'Whether to publish the package with provenance attestation.',
  },

  // ─── Network & Proxy ──────────────────────────────────────────────────────
  {
    key: 'httpProxy',
    type: 'String',
    default: '""',
    npmEquivalent: 'http-proxy',
    description: 'HTTP proxy URL for outgoing requests.',
  },
  {
    key: 'httpsProxy',
    type: 'String',
    default: '""',
    npmEquivalent: 'https-proxy',
    description: 'HTTPS proxy URL for outgoing requests.',
  },
  {
    key: 'httpTimeout',
    type: 'String',
    default: '1m',
    npmEquivalent: 'fetch-timeout',
    description: 'HTTP request timeout. Accepts duration strings like `1m`, `30s`, `5000` (ms).',
  },
  {
    key: 'httpRetry',
    type: 'Number',
    default: '3',
    description: 'Number of retry attempts for failed HTTP requests.',
  },
  {
    key: 'networkConcurrency',
    type: 'Number',
    default: '50',
    npmEquivalent: 'maxsockets',
    description: 'Maximum number of concurrent HTTP requests.',
  },
  {
    key: 'enableNetwork',
    type: 'Boolean',
    default: 'true',
    description: 'When `false`, no network requests are allowed. Equivalent to offline mode.',
  },
  {
    key: 'enableOfflineMode',
    type: 'Boolean',
    default: 'false',
    description: 'When `true`, Yarn will only use local cache — no network requests.',
  },
  {
    key: 'unsafeHttpWhitelist',
    type: 'String[]',
    default: '[]',
    description:
      'List of hostnames allowed to use plain HTTP (instead of HTTPS).\n\nExample:\n```yaml\nunsafeHttpWhitelist:\n  - "*.internal.company.com"\n```',
  },

  // ─── SSL & Certificates ───────────────────────────────────────────────────
  {
    key: 'enableStrictSsl',
    type: 'Boolean',
    default: 'true',
    npmEquivalent: 'strict-ssl',
    description: 'Whether to verify SSL certificates. Disable only in trusted private network environments.',
  },
  {
    key: 'httpsCaFilePath',
    type: 'path',
    default: '""',
    npmEquivalent: 'cafile',
    description: 'Path to a PEM CA certificate file for verifying SSL connections.',
  },
  {
    key: 'httpsCertFilePath',
    type: 'path',
    default: '""',
    npmEquivalent: 'cert',
    description: 'Path to a PEM client certificate file.',
  },
  {
    key: 'httpsKeyFilePath',
    type: 'path',
    default: '""',
    npmEquivalent: 'key',
    description: 'Path to a PEM client key file.',
  },

  // ─── Cache ────────────────────────────────────────────────────────────────
  {
    key: 'cacheFolder',
    type: 'path',
    default: './.yarn/cache',
    description: 'Local cache directory for downloaded packages.',
  },
  {
    key: 'globalFolder',
    type: 'path',
    default: '${HOME}/.yarn/berry',
    description: 'Directory for Yarn\'s global files (cache, data, etc.).',
  },
  {
    key: 'enableGlobalCache',
    type: 'Boolean',
    default: 'true',
    description:
      'When `true`, packages are cached in a global shared cache instead of the per-project cache.',
  },
  {
    key: 'enableImmutableCache',
    type: 'Boolean',
    default: 'false',
    description: 'When `true`, the cache cannot be modified. Useful in CI environments.',
  },
  {
    key: 'compressionLevel',
    type: 'Number | "mixed"',
    default: '0',
    description:
      'Compression level for cached packages.\n\n- `0`: No compression (faster install).\n- `1`–`9`: Higher values = smaller files but slower.\n- `"mixed"`: Compress text files only.',
  },
  {
    key: 'cacheMigrationMode',
    type: '"required-only" | "match-spec" | "always"',
    default: 'required-only',
    validValues: ['required-only', 'match-spec', 'always'],
    description:
      'Controls when the cache is refreshed.\n\n- `required-only` *(default)*: Only migrate entries that are required.\n- `match-spec`: Migrate entries matching current install spec.\n- `always`: Always refresh the cache.',
  },

  // ─── Dependency resolution ────────────────────────────────────────────────
  {
    key: 'nodeLinker',
    type: '"pnp" | "pnpm" | "node-modules"',
    default: 'pnp',
    validValues: ['pnp', 'pnpm', 'node-modules'],
    description:
      'The linker used for Node.js packages.\n\n- `pnp` *(default)*: Plug\'n\'Play — no `node_modules`, uses loader.\n- `pnpm`: Virtual store similar to pnpm.\n- `node-modules`: Classic flat `node_modules`.',
  },
  {
    key: 'pnpMode',
    type: '"strict" | "loose"',
    default: 'strict',
    validValues: ['strict', 'loose'],
    description:
      'PnP strictness mode.\n\n- `strict` *(default)*: Only explicitly declared dependencies are accessible.\n- `loose`: Undeclared dependencies can be accessed (hoisted fallback).',
  },
  {
    key: 'pnpFallbackMode',
    type: '"none" | "dependencies-only" | "all"',
    default: 'dependencies-only',
    validValues: ['none', 'dependencies-only', 'all'],
    description: 'Controls PnP fallback behaviour for unlisted packages.',
  },
  {
    key: 'pnpIgnorePatterns',
    type: 'String[]',
    default: '[]',
    description:
      'Glob patterns for files that should not be subjected to PnP access restrictions.',
  },
  {
    key: 'pnpEnableEsmLoader',
    type: 'Boolean',
    default: 'false',
    description: 'Generate an ESM-compatible PnP loader.',
  },
  {
    key: 'pnpEnableInlining',
    type: 'Boolean',
    default: 'true',
    description: 'When `true`, PnP data is inlined into `.pnp.cjs` instead of a separate JSON file.',
  },
  {
    key: 'pnpUnpluggedFolder',
    type: 'path',
    default: './.yarn/unplugged',
    description: 'Directory for unplugged packages (packages that cannot run from zip archives).',
  },
  {
    key: 'pnpStoreFolder',
    type: 'path',
    default: 'node_modules/.store',
    description: 'pnpm store folder when `nodeLinker=pnpm`.',
  },
  {
    key: 'packageExtensions',
    type: 'Object',
    default: '{}',
    description:
      'Extend third-party package definitions with additional dependencies or peer dependencies.\n\nExample:\n```yaml\npackageExtensions:\n  webpack@*:\n    peerDependencies:\n      webpack-cli: "*"\n```',
  },
  {
    key: 'defaultSemverRangePrefix',
    type: '"^" | "~" | ""',
    default: '^',
    validValues: ['^', '~', ''],
    npmEquivalent: 'save-prefix',
    description: 'Default semver range prefix when adding dependencies.',
  },

  // ─── Node Modules linker ─────────────────────────────────────────────────
  {
    key: 'nmHoistingLimits',
    type: '"none" | "workspaces" | "dependencies"',
    default: 'none',
    validValues: ['none', 'workspaces', 'dependencies'],
    description:
      'Controls how deep packages are hoisted in `node_modules` mode.\n\n- `none` *(default)*: All packages are hoisted as deep as possible.\n- `workspaces`: Only workspace packages are hoisted.\n- `dependencies`: Limits hoisting to direct dependencies.',
  },
  {
    key: 'nmSelfReferences',
    type: 'Boolean',
    default: 'true',
    description: 'Allow workspace packages to reference themselves via their own name.',
  },
  {
    key: 'nmMode',
    type: '"classic" | "hardlinks-local" | "hardlinks-global"',
    default: 'classic',
    validValues: ['classic', 'hardlinks-local', 'hardlinks-global'],
    description:
      'Controls how files are copied when using `node-modules` linker.\n\n- `classic`: Full file copies.\n- `hardlinks-local`: Hard links within the project.\n- `hardlinks-global`: Hard links from the global cache.',
  },

  // ─── Scripts & Build ─────────────────────────────────────────────────────
  {
    key: 'enableScripts',
    type: 'Boolean',
    default: 'true',
    npmEquivalent: 'ignore-scripts',
    description: 'When `false`, lifecycle scripts (`postinstall`, etc.) are not executed.',
  },
  {
    key: 'scriptShell',
    type: 'path',
    default: '""',
    npmEquivalent: 'script-shell',
    description: 'Shell executable used for running scripts with `yarn run`.',
  },
  {
    key: 'enableInlineBuilds',
    type: 'Boolean',
    default: 'false',
    description: 'When `true`, build output is shown inline in the terminal.',
  },

  // ─── Security ────────────────────────────────────────────────────────────
  {
    key: 'checksumBehavior',
    type: '"throw" | "update" | "ignore" | "reset"',
    default: 'throw',
    validValues: ['throw', 'update', 'ignore', 'reset'],
    description:
      'What to do when a checksum mismatch is detected.\n\n- `throw` *(default)*: Abort with an error.\n- `update`: Update the lockfile checksum.\n- `ignore`: Silently ignore mismatches.\n- `reset`: Regenerate the lockfile entry.',
  },
  {
    key: 'enableHardenedMode',
    type: 'Boolean',
    default: 'true',
    description: 'When `true`, Yarn checks that package contents have not been tampered with.',
  },
  {
    key: 'enableImmutableInstalls',
    type: 'Boolean',
    default: 'false',
    description:
      'When `true`, Yarn will refuse to update `yarn.lock`. Useful in CI to ensure reproducible installs.',
  },
  {
    key: 'npmMinimalAgeGate',
    type: 'String',
    default: '""',
    description:
      'Minimum age a package version must have before Yarn installs it. Accepts duration strings like `3d`, `12h`.',
  },
  {
    key: 'npmAuditExcludePackages',
    type: 'String[]',
    default: '[]',
    description: 'List of packages to exclude from `yarn npm audit`.',
  },
  {
    key: 'npmAuditIgnoreAdvisories',
    type: 'String[]',
    default: '[]',
    description: 'List of advisory IDs to ignore in `yarn npm audit`.',
  },
  {
    key: 'npmPreapprovedPackages',
    type: 'String[]',
    default: '[]',
    description: 'Packages exempt from all security checks.',
  },

  // ─── Install behaviour ───────────────────────────────────────────────────
  {
    key: 'immutablePatterns',
    type: 'String[]',
    default: '["**/.pnp.*"]',
    description: 'Glob patterns for files that must not change during `yarn install`.',
  },
  {
    key: 'defaultProtocol',
    type: 'String',
    default: 'npm:',
    description: 'Default protocol for resolving bare package identifiers.',
  },
  {
    key: 'preferReuse',
    type: 'Boolean',
    default: 'false',
    description: 'Prefer reusing the version range already present in `package.json` when adding a package.',
  },
  {
    key: 'preferInteractive',
    type: 'Boolean',
    default: 'false',
    description: 'When `true`, Yarn prefers interactive prompts over automatic actions.',
  },
  {
    key: 'enableTransparentWorkspaces',
    type: 'Boolean',
    default: 'true',
    description: 'Allow cross-workspace transitive dependency resolution.',
  },

  // ─── Output & Display ────────────────────────────────────────────────────
  {
    key: 'enableColors',
    type: 'Boolean',
    default: 'auto',
    description: 'Enable or disable coloured terminal output.',
  },
  {
    key: 'enableHyperlinks',
    type: 'Boolean',
    default: 'auto',
    description: 'Enable or disable clickable hyperlinks in terminal output.',
  },
  {
    key: 'enableMessageNames',
    type: 'Boolean',
    default: 'true',
    description: 'Show message name codes (e.g. `YN0000`) in log output.',
  },
  {
    key: 'enableProgressBars',
    type: 'Boolean',
    default: 'auto',
    description: 'Show progress bars during install.',
  },
  {
    key: 'enableTimers',
    type: 'Boolean',
    default: 'true',
    description: 'Show elapsed time at the end of each command.',
  },
  {
    key: 'progressBarStyle',
    type: '"default" | "gate" | "patrick" | "simba" | "star" | "shark"',
    default: 'default',
    validValues: ['default', 'gate', 'patrick', 'simba', 'star', 'shark'],
    description: 'Progress bar animation style.',
  },
  {
    key: 'preferTruncatedLines',
    type: 'Boolean',
    default: 'false',
    description: 'Truncate long lines to fit the terminal width.',
  },
  {
    key: 'logFilters',
    type: 'Object[]',
    default: '[]',
    description:
      'Fine-grained log level overrides per message code.\n\nExample:\n```yaml\nlogFilters:\n  - code: YN0000\n    level: discard\n```',
  },

  // ─── Paths ───────────────────────────────────────────────────────────────
  {
    key: 'installStatePath',
    type: 'path',
    default: './.yarn/install-state.gz',
    description: 'File that stores the install state for faster subsequent installs.',
  },
  {
    key: 'patchFolder',
    type: 'path',
    default: './.yarn/patches',
    description: 'Directory for patch files used with the `patch:` protocol.',
  },
  {
    key: 'virtualFolder',
    type: 'path',
    default: './.yarn/__virtual__',
    description: 'Directory for virtual packages (packages with peer dependencies).',
  },
  {
    key: 'deferredVersionFolder',
    type: 'path',
    default: './.yarn/versions',
    description: 'Directory for deferred version manifests (used by `yarn version`).',
  },

  // ─── Platform & Arch ─────────────────────────────────────────────────────
  {
    key: 'supportedArchitectures',
    type: 'Object',
    default: 'Current platform',
    description:
      'Specify which OS/CPU/libc combinations to fetch optional dependencies for.\n\nExample:\n```yaml\nsupportedArchitectures:\n  os: [linux, darwin]\n  cpu: [x64, arm64]\n  libc: [glibc]\n```',
  },
  {
    key: 'winLinkType',
    type: '"junctions" | "symlinks"',
    default: 'junctions',
    validValues: ['junctions', 'symlinks'],
    description: 'Type of filesystem links to create on Windows.',
  },

  // ─── Yarn binary ─────────────────────────────────────────────────────────
  {
    key: 'yarnPath',
    type: 'path',
    default: '""',
    description:
      'Path to the Yarn binary to use for this project. Usually set by `yarn set version`.\n\nExample:\n```yaml\nyarnPath: .yarn/releases/yarn-4.x.x.cjs\n```',
  },
  {
    key: 'ignorePath',
    type: 'Boolean',
    default: 'false',
    description: 'When `true`, ignore the `yarnPath` setting and use the globally installed Yarn.',
  },

  // ─── Workspaces & Monorepo ────────────────────────────────────────────────
  {
    key: 'changesetBaseRefs',
    type: 'String[]',
    default: '["master", "origin/master", "main", "origin/main"]',
    description: 'Git branches used as base when computing changesets.',
  },
  {
    key: 'changesetIgnorePatterns',
    type: 'String[]',
    default: '[]',
    description: 'Glob patterns for files to ignore when computing changesets.',
  },
  {
    key: 'enableConstraintsChecks',
    type: 'Boolean',
    default: 'true',
    description: 'Run workspace constraint checks during `yarn install`.',
  },
  {
    key: 'constraintsPath',
    type: 'path',
    default: './constraints.pro',
    description: 'Path to the Prolog constraints file.',
  },

  // ─── Init ────────────────────────────────────────────────────────────────
  {
    key: 'initScope',
    type: 'String',
    default: '""',
    description: 'Default npm scope to use when running `yarn init`.',
  },
  {
    key: 'initFields',
    type: 'Object',
    default: '{}',
    description: 'Default `package.json` fields to populate when running `yarn init`.',
  },

  // ─── Misc ────────────────────────────────────────────────────────────────
  {
    key: 'enableTelemetry',
    type: 'Boolean',
    default: 'true (non-CI)',
    description: 'Send anonymous usage telemetry to the Yarn team.',
  },
  {
    key: 'plugins',
    type: 'Object[]',
    default: '[]',
    description:
      'List of Yarn plugins to load.\n\nExample:\n```yaml\nplugins:\n  - path: .yarn/plugins/@yarnpkg/plugin-typescript.cjs\n    spec: "@yarnpkg/plugin-typescript"\n```',
  },
  {
    key: 'defaultLanguageName',
    type: 'String',
    default: 'node',
    description: 'Default language name for new packages.',
  },
  {
    key: 'taskPoolConcurrency',
    type: 'String | Number',
    default: 'os.availableParallelism()',
    description: 'Maximum number of tasks in the task pool.',
  },
  {
    key: 'networkSettings',
    type: 'Object',
    default: '{}',
    description:
      'Per-hostname network settings (proxy, SSL, auth, etc.).\n\nExample:\n```yaml\nnetworkSettings:\n  "*.internal.corp.com":\n    enableStrictSsl: false\n    httpProxy: "http://proxy.corp.com:8080"\n```',
  },
  {
    key: 'injectEnvironmentFiles',
    type: 'String[]',
    default: '[".env.yarn"]',
    description: 'List of `.env`-style files to inject into the environment before running scripts.',
  },
];

/** Fast lookup map: key → yarn config entry */
export const yarnConfigMap: Map<string, YarnConfigEntry> = new Map(
  yarnConfigs.map((c) => [c.key, c])
);
