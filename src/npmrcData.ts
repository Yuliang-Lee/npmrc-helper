// ─── Types ────────────────────────────────────────────────────────────────────

/** Which package manager(s) support this config key */
export type PackageManager = 'npm' | 'pnpm';

export interface NpmrcConfigEntry {
  key: string;
  default: string;
  type: string;
  description: string;
  /** Which package managers recognise this key in .npmrc */
  packageManager: PackageManager[];
  /** Whether this key is deprecated in its package manager */
  deprecated?: boolean;
  /** For npm keys: the npm major version this key was removed (no longer supported) */
  removedIn?: number;
  /** For npm keys: the npm major version this key first appeared */
  since?: number;
  /** Allowed enum values */
  validValues?: string[];
}

// ─── npm configs ──────────────────────────────────────────────────────────────
// Coverage: npm v8 / v9 / v10 / v11
// Keys that were removed or deprecated in newer versions are marked accordingly.

const npmConfigs: NpmrcConfigEntry[] = [

  // ── A ───────────────────────────────────────────────────────────────────────
  {
    key: '_auth',
    default: 'null',
    type: 'null | String',
    packageManager: ['npm', 'pnpm'],
    description:
      'A base-64 encoded string representing the username and password combination (e.g. `dXNlcm5hbWU6cGFzc3dvcmQ=`). This is only used for basic authentication.\n\n> ⚠️ Prefer `_authToken` or registry-scoped credentials instead.\n\n> 🔒 Sensitive credential — keep in `.npmrc`, not in `pnpm-workspace.yaml`.',
  },
  {
    key: 'access',
    default: 'restricted',
    type: 'Access',
    packageManager: ['npm'],
    validValues: ['public', 'restricted'],
    description:
      'Controls the access level for scoped packages when publishing.\n\n- `restricted` *(default)*: The package is private.\n- `public`: Publicly visible and installable.\n\nUnscoped packages are always `public`.',
  },
  {
    key: 'all',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description:
      'When running `npm outdated` and `npm ls`, show all outdated or installed packages, rather than only those directly depended upon by the current project.',
  },
  {
    key: 'allow-same-version',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'Prevent npm from throwing an error when `npm version` is used to set the new version to the same value as the current version.',
  },
  {
    key: 'also',
    default: 'null',
    type: 'null | "dev" | "development"',
    packageManager: ['npm'],
    deprecated: true,
    description:
      '**Deprecated**: Use `--include=dev` instead.\n\nWhen set to `dev` or `development`, include devDependencies in certain commands.',
  },
  {
    key: 'always-auth',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm', 'pnpm'],
    description:
      'Force npm/pnpm to always require authentication when accessing the registry, even for `GET` requests.',
  },
  {
    key: 'audit',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'When `true`, submit audit reports alongside `npm install` runs to the default registry and all registries configured for scopes.',
  },
  {
    key: 'audit-level',
    default: 'null',
    type: 'null | "info" | "low" | "moderate" | "high" | "critical" | "none"',
    packageManager: ['npm'],
    validValues: ['info', 'low', 'moderate', 'high', 'critical', 'none'],
    description:
      'The minimum level of vulnerability for `npm audit` to exit with a non-zero exit code.\n\nAllowed values: `info`, `low`, `moderate`, `high`, `critical`, `none`.',
  },
  {
    key: 'auth-type',
    default: 'web',
    type: 'String',
    packageManager: ['npm'],
    validValues: ['legacy', 'web'],
    description:
      'Defines the authentication strategy to use with `npm login`.\n\n- `web` *(default, npm v10+)*: Use the browser-based login flow.\n- `legacy`: Use the classic username/password prompt.\n\n> In **npm v8** the following values were also supported (now removed): `sso`, `saml`, `oauth`, `webauthn`.',
  },

  // ── B ───────────────────────────────────────────────────────────────────────
  {
    key: 'before',
    default: 'null',
    type: 'null | Date',
    packageManager: ['npm'],
    description:
      'If passed to `npm install`, rebuild the npm tree so only package versions available **on or before** the given date are installed.',
  },
  {
    key: 'bin-links',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'When `true`, npm creates symlinks (or `.cmd` shims on Windows) for package executables.\n\nSet to `false` to disable — useful on file systems that do not support symlinks.',
  },
  {
    key: 'browser',
    default: 'OS X: "open", Windows: "start", Others: "xdg-open"',
    type: 'null | Boolean | String',
    packageManager: ['npm'],
    description:
      'The browser called by the `npm docs` command to open websites.',
  },

  // ── C ───────────────────────────────────────────────────────────────────────
  {
    key: 'ca',
    default: 'null',
    type: 'null | String | String[]',
    packageManager: ['npm'],
    description:
      'The Certificate Authority signing certificate trusted for SSL connections to the registry. Values must be in PEM format with newlines replaced by `\\n`.\n\nExample:\n```\nca="-----BEGIN CERTIFICATE-----\\nXXXX\\nXXXX\\n-----END CERTIFICATE-----"\n```\n\nUse `ca[]=` for multiple CAs.',
  },
  {
    key: 'cache',
    default: 'Windows: %AppData%\\npm-cache, Posix: ~/.npm',
    type: 'path',
    packageManager: ['npm'],
    description: "The location of npm's cache directory.",
  },
  {
    key: 'cache-max',
    default: 'Infinity',
    type: 'Number',
    packageManager: ['npm'],
    deprecated: true,
    description:
      '**Deprecated**: Use `--prefer-online` instead. `--cache-max=0` is an alias for `--prefer-online`.',
  },
  {
    key: 'cache-min',
    default: '0',
    type: 'Number',
    packageManager: ['npm'],
    deprecated: true,
    description:
      '**Deprecated**: Use `--prefer-offline` instead. `--cache-min=9999` (or bigger) is an alias for `--prefer-offline`.',
  },
  {
    key: 'cafile',
    default: 'null',
    type: 'path',
    packageManager: ['npm'],
    description:
      'A path to a file containing one or multiple Certificate Authority signing certificates.',
  },
  {
    key: 'call',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    since: 9,
    description:
      'Optional companion option for `npm exec`, `npx` — specifies a custom command to run.',
  },
  {
    key: 'cert',
    default: 'null',
    type: 'null | String',
    packageManager: ['npm'],
    deprecated: true,
    description:
      '**Deprecated (npm v10+)**: Use registry-scoped `certfile` config instead.\n\nA client certificate in PEM format (newlines replaced with `\\n`) to pass when accessing the registry.',
  },
  {
    key: 'ci-name',
    default: 'null',
    type: 'null | String',
    packageManager: ['npm'],
    deprecated: true,
    removedIn: 10,
    description:
      '**Removed in npm v10** (deprecated in v9).\n\nThe name of the CI system in use. If set, npm will skip the `update-notifier` check. Automatically detected from common CI environment variables.',
  },
  {
    key: 'cidr',
    default: 'null',
    type: 'null | String | String[]',
    packageManager: ['npm'],
    description:
      'A list of CIDR addresses to use when configuring limited access tokens with `npm token create`.',
  },
  {
    key: 'color',
    default: 'true',
    type: 'Boolean | "always"',
    packageManager: ['npm'],
    description:
      'Controls colour output:\n- `false`: Never show colours.\n- `"always"`: Always show colours.\n- `true` *(default)*: Only print colour codes for TTY file descriptors.\n\nAlso controlled by the `NO_COLOR` environment variable.',
  },
  {
    key: 'commit-hooks',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Run git commit hooks when using the `npm version` command.',
  },
  {
    key: 'cpu',
    default: 'null',
    type: 'null | String',
    packageManager: ['npm'],
    since: 9,
    description:
      'Override the detected CPU architecture for installing native modules. Useful in cross-compilation or Docker scenarios.',
  },

  // ── D ───────────────────────────────────────────────────────────────────────
  {
    key: 'depth',
    default: 'Infinity (ls) | 1 (outdated)',
    type: 'null | Number',
    packageManager: ['npm'],
    description:
      'The depth to go when recursing directories for `npm ls` and `npm outdated`.',
  },
  {
    key: 'description',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Show the description in `npm search`.',
  },
  {
    key: 'dev',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    deprecated: true,
    description: '**Deprecated**: Use `--include=dev` instead.',
  },
  {
    key: 'diff',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    since: 9,
    description: 'Define arguments to compare in `npm diff`.',
  },
  {
    key: 'diff-dst-prefix',
    default: '"b/"',
    type: 'String',
    packageManager: ['npm'],
    since: 9,
    description: 'Destination prefix to be used in `npm diff` output.',
  },
  {
    key: 'diff-ignore-all-space',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description: 'Ignore whitespace when comparing lines in `npm diff`.',
  },
  {
    key: 'diff-name-only',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description: 'Print only file names in `npm diff`.',
  },
  {
    key: 'diff-no-prefix',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description: 'Do not show any source or destination prefix in `npm diff`.',
  },
  {
    key: 'diff-src-prefix',
    default: '"a/"',
    type: 'String',
    packageManager: ['npm'],
    since: 9,
    description: 'Source prefix to be used in `npm diff` output.',
  },
  {
    key: 'diff-text',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description: 'Treat all files as text in `npm diff`.',
  },
  {
    key: 'diff-unified',
    default: '3',
    type: 'Number',
    packageManager: ['npm'],
    since: 9,
    description: 'The number of lines of context to print in `npm diff`.',
  },
  {
    key: 'dry-run',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      "Indicates that npm should not make any changes; only report what it would have done. Can be passed to `install`, `update`, `dedupe`, `uninstall`, etc.",
  },

  // ── E ───────────────────────────────────────────────────────────────────────
  {
    key: 'editor',
    default: '$EDITOR env var, or "vi" on Posix, or "notepad" on Windows',
    type: 'path',
    packageManager: ['npm'],
    description: 'The command to run for `npm config edit` or `npm edit`.',
  },
  {
    key: 'engine-strict',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'If set to `true`, npm will refuse to install any package claiming to be incompatible with the current Node.js version.',
  },
  {
    key: 'expect-result-count',
    default: 'null',
    type: 'null | Number',
    packageManager: ['npm'],
    since: 10,
    description:
      'Tells npm to expect a specific number of results from a command (e.g. `npm list`). Exits with an error if the count does not match.',
  },
  {
    key: 'expect-results',
    default: 'null',
    type: 'null | Boolean',
    packageManager: ['npm'],
    since: 10,
    description:
      'Tells npm whether or not to expect any results from a command. `true` = expect results, `false` = expect no results.',
  },

  // ── F ───────────────────────────────────────────────────────────────────────
  {
    key: 'fetch-retries',
    default: '2',
    type: 'Number',
    packageManager: ['npm'],
    description:
      'The `retries` config for the retry module used when fetching packages from the registry.',
  },
  {
    key: 'fetch-retry-factor',
    default: '10',
    type: 'Number',
    packageManager: ['npm'],
    description: 'The `factor` config for the retry module used when fetching packages.',
  },
  {
    key: 'fetch-retry-maxtimeout',
    default: '60000',
    type: 'Number',
    packageManager: ['npm'],
    description:
      'The `maxTimeout` config (in milliseconds) for the retry module used when fetching packages.',
  },
  {
    key: 'fetch-retry-mintimeout',
    default: '10000',
    type: 'Number',
    packageManager: ['npm'],
    description:
      'The `minTimeout` config (in milliseconds) for the retry module used when fetching packages.',
  },
  {
    key: 'fetch-timeout',
    default: '300000',
    type: 'Number',
    packageManager: ['npm'],
    description: 'The maximum amount of time (in milliseconds) to wait for HTTP requests to complete.',
  },
  {
    key: 'force',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'Makes various commands more forceful:\n- Lifecycle script failures do not block progress.\n- Publishing clobbers previously published versions.\n- Requests skip the cache.',
  },
  {
    key: 'foreground-scripts',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description:
      'Run all build scripts (`preinstall`, `install`, `postinstall`) for installed packages in the foreground process, sharing stdin/stdout/stderr with the main npm process.',
  },
  {
    key: 'format-package-lock',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description: 'Format `package-lock.json` or `npm-shrinkwrap.json` as a human-readable file.',
  },
  {
    key: 'fund',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'When `true`, display the message at the end of each `npm install` acknowledging the number of dependencies looking for funding.',
  },

  // ── G ───────────────────────────────────────────────────────────────────────
  {
    key: 'git',
    default: '"git"',
    type: 'String',
    packageManager: ['npm'],
    description:
      'The command used to perform git operations. If git is installed but not in `PATH`, set this to the full path to the git binary.',
  },
  {
    key: 'git-tag-version',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Tag the commit when using the `npm version` command.',
  },
  {
    key: 'global',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'Operates in "global" mode: packages are installed into the `prefix` folder instead of the current working directory.',
  },
  {
    key: 'global-style',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    deprecated: true,
    description:
      '**Deprecated**: Use `--install-strategy=shallow` instead.\n\nInstall the package into your local `node_modules` using the same layout used for global `node_modules`.',
  },
  {
    key: 'globalconfig',
    default: '{prefix}/etc/npmrc',
    type: 'path',
    packageManager: ['npm'],
    description: 'The config file from which to read global config options.',
  },
  {
    key: 'group',
    default: 'GID of the current process',
    type: 'String | Number',
    packageManager: ['npm'],
    description: 'The group to use when running package scripts in global mode as the root user.',
  },

  // ── H ───────────────────────────────────────────────────────────────────────
  {
    key: 'heading',
    default: '"npm"',
    type: 'String',
    packageManager: ['npm'],
    description: 'The string that starts all the debugging log output.',
  },
  {
    key: 'https-proxy',
    default: 'null',
    type: 'null | URL',
    packageManager: ['npm'],
    description:
      'A proxy to use for outgoing HTTPS requests. Also honored via `HTTPS_PROXY` or `https_proxy` environment variables.',
  },

  // ── I ───────────────────────────────────────────────────────────────────────
  {
    key: 'if-present',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'When `true`, npm will not exit with an error if `run-script` is invoked for a script not defined in `package.json`. Useful in generic CI setups.',
  },
  {
    key: 'ignore-prepublish',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    deprecated: true,
    description: '**Deprecated**: When `true`, npm will not run `prepublish` scripts.',
  },
  {
    key: 'ignore-scripts',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'When `true`, scripts specified in `package.json` will not be run by npm.',
  },
  {
    key: 'include',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    since: 9,
    validValues: ['prod', 'dev', 'optional', 'peer'],
    description:
      'Option that allows for defining which types of dependencies to install. Can be set multiple times.\n\nAllowed values: `prod`, `dev`, `optional`, `peer`.',
  },
  {
    key: 'include-staged',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Allow installing "staged" published packages (RFC #92).',
  },
  {
    key: 'include-workspace-root',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description:
      'Include the workspace root package when workspaces are enabled.',
  },
  {
    key: 'init-author-email',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    description: "The default author's email for `npm init`.",
  },
  {
    key: 'init-author-name',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    description: "The default author's name for `npm init`.",
  },
  {
    key: 'init-author-url',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    description: "The default author's homepage URL for `npm init`.",
  },
  {
    key: 'init-license',
    default: '"ISC"',
    type: 'String',
    packageManager: ['npm'],
    description: 'The default license for `npm init`.',
  },
  {
    key: 'init-module',
    default: '~/.npm-init.js',
    type: 'path',
    packageManager: ['npm'],
    description: 'A module loaded by the `npm init` command.',
  },
  {
    key: 'init-version',
    default: '"1.0.0"',
    type: 'semver',
    packageManager: ['npm'],
    description: "The default package version for `npm init`.",
  },
  {
    key: 'init.author.email',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    deprecated: true,
    description: '**Deprecated**: Use `init-author-email` instead.',
  },
  {
    key: 'init.author.name',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    deprecated: true,
    description: '**Deprecated**: Use `init-author-name` instead.',
  },
  {
    key: 'init.author.url',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    deprecated: true,
    description: '**Deprecated**: Use `init-author-url` instead.',
  },
  {
    key: 'init.license',
    default: '"ISC"',
    type: 'String',
    packageManager: ['npm'],
    deprecated: true,
    description: '**Deprecated**: Use `init-license` instead.',
  },
  {
    key: 'init.module',
    default: '~/.npm-init.js',
    type: 'path',
    packageManager: ['npm'],
    deprecated: true,
    description: '**Deprecated**: Use `init-module` instead.',
  },
  {
    key: 'init.version',
    default: '"1.0.0"',
    type: 'semver',
    packageManager: ['npm'],
    deprecated: true,
    description: '**Deprecated**: Use `init-version` instead.',
  },
  {
    key: 'install-links',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description:
      'When set, `file:` protocol dependencies are packed and installed as regular dependencies instead of creating a symlink. Has no effect on workspaces.',
  },
  {
    key: 'install-strategy',
    default: 'hoisted',
    type: 'String',
    packageManager: ['npm'],
    since: 10,
    validValues: ['hoisted', 'nested', 'shallow', 'linked'],
    description:
      'Controls the strategy for installing packages in `node_modules`.\n\n- `hoisted` *(default)*: Non-duplicated packages are hoisted to the top.\n- `nested`: Packages are installed in-place (similar to npm v1–2).\n- `shallow`: Only install direct deps at the top-level.\n- `linked`: Uses symbolic links when possible.',
  },

  // ── J ───────────────────────────────────────────────────────────────────────
  {
    key: 'json',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Output JSON data instead of normal output.',
  },

  // ── K ───────────────────────────────────────────────────────────────────────
  {
    key: 'key',
    default: 'null',
    type: 'null | String',
    packageManager: ['npm'],
    deprecated: true,
    description:
      '**Deprecated (npm v10+)**: Use registry-scoped `keyfile` config instead.\n\nA client key in PEM format to pass when accessing the registry.',
  },

  // ── L ───────────────────────────────────────────────────────────────────────
  {
    key: 'legacy-bundling',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    deprecated: true,
    description:
      '**Deprecated**: Use `--install-strategy=nested` instead.\n\nInstall the package such that npm versions prior to 1.4 can install the package. This eliminates all automatic deduplication.',
  },
  {
    key: 'legacy-peer-deps',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'When `true`, disregard `peerDependencies` when building the packages tree, behaving like npm v4–6.',
  },
  {
    key: 'libc',
    default: 'null',
    type: 'null | String',
    packageManager: ['npm'],
    since: 10,
    description:
      'Override the detected libc value for installing native modules. Useful for cross-compilation.',
  },
  {
    key: 'link',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'When `true`, local installs will link if there is a suitable globally installed package.',
  },
  {
    key: 'local-address',
    default: 'undefined',
    type: 'IP Address',
    packageManager: ['npm'],
    description:
      'The IP address of the local interface to use when making connections to the npm registry.',
  },
  {
    key: 'location',
    default: 'user',
    type: 'String',
    packageManager: ['npm'],
    since: 9,
    validValues: ['global', 'user', 'project'],
    description:
      'When passed to `npm config`, refers to which config file to use.\n\nAllowed values: `global`, `user`, `project`.',
  },
  {
    key: 'lockfile-version',
    default: '3',
    type: 'null | 1 | 2 | 3',
    packageManager: ['npm'],
    since: 9,
    validValues: ['1', '2', '3'],
    description:
      'Set the lockfile format version for `package-lock.json`.\n\n- `1`: Legacy format (npm v5–6).\n- `2`: New format with backward compatibility to v1.\n- `3` *(default since npm v10)*: New format without backward compatibility.',
  },
  {
    key: 'loglevel',
    default: '"notice"',
    type: 'String',
    packageManager: ['npm'],
    validValues: ['silent', 'error', 'warn', 'notice', 'http', 'timing', 'info', 'verbose', 'silly'],
    description:
      'The level of logs to report.\n\nLevels (from quietest to most verbose): `silent`, `error`, `warn`, `notice` *(default)*, `http`, `timing`, `info`, `verbose`, `silly`.',
  },
  {
    key: 'logs-dir',
    default: '~/.npm/_logs',
    type: 'null | path',
    packageManager: ['npm'],
    since: 9,
    description: "The location of npm's log directory. Pass `false` to disable log file creation.",
  },
  {
    key: 'logs-max',
    default: '10',
    type: 'Number',
    packageManager: ['npm'],
    description: 'The maximum number of log files to store.',
  },
  {
    key: 'long',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Show extended information in `npm ls` and `npm search`.',
  },

  // ── M ───────────────────────────────────────────────────────────────────────
  {
    key: 'maxsockets',
    default: '15',
    type: 'Number',
    packageManager: ['npm'],
    description:
      'The maximum number of connections to use per origin (protocol/host/port combination).',
  },
  {
    key: 'message',
    default: '"%s"',
    type: 'String',
    packageManager: ['npm'],
    description:
      'Commit message used by `npm version`. All `%s` occurrences are replaced with the version number.',
  },

  // ── N ───────────────────────────────────────────────────────────────────────
  {
    key: 'node-options',
    default: 'null',
    type: 'null | String',
    packageManager: ['npm'],
    description:
      'Options to pass through to Node.js via the `NODE_OPTIONS` environment variable. Does not impact npm itself, but does impact lifecycle scripts.',
  },
  {
    key: 'node-version',
    default: 'process.version',
    type: 'semver | false',
    packageManager: ['npm'],
    removedIn: 9,
    description:
      '**Removed in npm v9** (existed in npm v8 and earlier).\n\nThe node version to use when checking a package\'s `engines` map.',
  },
  {
    key: 'noproxy',
    default: '$NO_PROXY',
    type: 'String',
    packageManager: ['npm'],
    description: 'A comma-separated list of domain extensions for which a proxy should not be used.',
  },

  // ── O ───────────────────────────────────────────────────────────────────────
  {
    key: 'offline',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'Force offline mode: no network requests are made during install.',
  },
  {
    key: 'omit',
    default: '"dev" (if NODE_ENV=production)',
    type: 'String',
    packageManager: ['npm'],
    since: 9,
    validValues: ['dev', 'optional', 'peer'],
    description:
      'Dependency types to omit from the installation tree. Can be set multiple times.\n\nAllowed values: `dev`, `optional`, `peer`.\n\n`dev` is omitted by default when `NODE_ENV=production`.',
  },
  {
    key: 'omit-lockfile-registry-resolved',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 10,
    description:
      'If set, the `resolved` key in `package-lock.json` will not include the registry URL for packages from the default registry.',
  },
  {
    key: 'only',
    default: 'null',
    type: 'null | "prod" | "production"',
    packageManager: ['npm'],
    deprecated: true,
    description:
      '**Deprecated**: Use `--omit=dev` or `--omit=optional` instead.',
  },
  {
    key: 'optional',
    default: 'null',
    type: 'null | Boolean',
    packageManager: ['npm'],
    deprecated: true,
    description:
      '**Deprecated**: Use `--omit=optional` or `--include=optional` instead.',
  },
  {
    key: 'os',
    default: 'null',
    type: 'null | String',
    packageManager: ['npm'],
    since: 9,
    description: 'Override the detected OS for installing native modules.',
  },
  {
    key: 'otp',
    default: 'null',
    type: 'null | String',
    packageManager: ['npm'],
    description:
      'A one-time password from a two-factor authenticator. Required when publishing or changing package permissions with `npm access`.',
  },

  // ── P ───────────────────────────────────────────────────────────────────────
  {
    key: 'pack-destination',
    default: '"."',
    type: 'String',
    packageManager: ['npm'],
    since: 9,
    description: 'Directory in which `npm pack` will save tar files.',
  },
  {
    key: 'package',
    default: '""',
    type: 'String | String[]',
    packageManager: ['npm'],
    since: 9,
    description: 'The package(s) to install for `npm exec`.',
  },
  {
    key: 'package-lock',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'When `false`, ignore `package-lock.json` files when installing. Also prevents writing `package-lock.json` if `save` is `true`.',
  },
  {
    key: 'package-lock-only',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'When `true`, only update the `package-lock.json` without checking `node_modules` or downloading dependencies.',
  },
  {
    key: 'parseable',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Output parseable results from commands that write to standard output.',
  },
  {
    key: 'prefer-dedupe',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description: 'Prefer to deduplicate packages if possible, rather than choosing a newer version.',
  },
  {
    key: 'prefer-offline',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'When `true`, staleness checks for cached data are bypassed, but missing data is still requested from the server.',
  },
  {
    key: 'prefer-online',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'When `true`, staleness checks for cached data are forced.',
  },
  {
    key: 'prefix',
    default: 'See npm-folders documentation',
    type: 'path',
    packageManager: ['npm'],
    description: 'Location to install global items.',
  },
  {
    key: 'preid',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    description: 'The "prerelease identifier" prefix for the semver prerelease part. E.g. `rc` in `1.2.0-rc.8`.',
  },
  {
    key: 'production',
    default: 'null',
    type: 'null | Boolean',
    packageManager: ['npm'],
    deprecated: true,
    description: '**Deprecated**: Use `--omit=dev` instead.',
  },
  {
    key: 'progress',
    default: 'true (unless in CI)',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'When `true`, display a progress bar during time-intensive operations if stderr/stdout is a TTY.',
  },
  {
    key: 'provenance',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 10,
    description:
      'When publishing from a supported cloud CI/CD system, the package will be publicly linked to where it was built and published from.',
  },
  {
    key: 'provenance-file',
    default: 'null',
    type: 'null | path',
    packageManager: ['npm'],
    since: 10,
    description: 'Path to a provenance bundle file to use when publishing.',
  },
  {
    key: 'proxy',
    default: 'null',
    type: 'null | false | URL',
    packageManager: ['npm'],
    description:
      'A proxy to use for outgoing HTTP requests. Also honored via `HTTP_PROXY` or `http_proxy` environment variables.',
  },

  // ── R ───────────────────────────────────────────────────────────────────────
  {
    key: 'read-only',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Mark a token as unable to publish when configuring limited access tokens with `npm token create`.',
  },
  {
    key: 'rebuild-bundle',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Rebuild bundled dependencies after installation.',
  },
  {
    key: 'registry',
    default: 'https://registry.npmjs.org/',
    type: 'URL',
    packageManager: ['npm', 'pnpm'],
    description:
      'The base URL of the npm package registry.\n\nExample:\n```\nregistry=https://my-private-registry.example.com/\n```',
  },
  {
    key: 'replace-registry-host',
    default: '"npmjs"',
    type: 'String',
    packageManager: ['npm'],
    since: 9,
    validValues: ['npmjs', 'never', 'always'],
    description:
      'Defines behaviour when replacing the registry host in `package-lock.json`.\n\n- `npmjs` *(default)*: Replace only for the default npmjs registry.\n- `never`: Never replace.\n- `always`: Always replace.',
  },

  // ── S ───────────────────────────────────────────────────────────────────────
  {
    key: 'save',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Save installed packages to `package.json` as dependencies.',
  },
  {
    key: 'save-bundle',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'Also put saved packages into `bundleDependencies` when using `--save`, `--save-dev`, or `--save-optional`.',
  },
  {
    key: 'save-dev',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Save installed packages to `package.json` as `devDependencies`.',
  },
  {
    key: 'save-exact',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'Dependencies saved via `--save`, `--save-dev`, or `--save-optional` will use an exact version instead of the default semver range operator.',
  },
  {
    key: 'save-optional',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Save installed packages to `package.json` as `optionalDependencies`.',
  },
  {
    key: 'save-peer',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description: 'Save installed packages into `peerDependencies`.',
  },
  {
    key: 'save-prefix',
    default: '"^"',
    type: 'String',
    packageManager: ['npm'],
    description:
      'Configures the version prefix for packages saved to `package.json`.\n\n- `^` *(default)*: Allows minor upgrades.\n- `~`: Allows patch upgrades only.',
  },
  {
    key: 'save-prod',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description:
      'Ensure a package is saved into `dependencies` specifically. Useful to move a package from `devDependencies` or `optionalDependencies`.',
  },
  {
    key: 'sbom-format',
    default: 'null',
    type: 'null | "cyclonedx" | "spdx"',
    packageManager: ['npm'],
    since: 10,
    validValues: ['cyclonedx', 'spdx'],
    description: 'SBOM format type to generate with `npm sbom`.',
  },
  {
    key: 'sbom-type',
    default: '"library"',
    type: 'String',
    packageManager: ['npm'],
    since: 10,
    validValues: ['library', 'application', 'framework'],
    description: 'The SBOM package type to use when generating `npm sbom`.',
  },
  {
    key: 'scope',
    default: 'Scope of the current project',
    type: 'String',
    packageManager: ['npm'],
    description:
      'Associates an operation with a scope for a scoped registry.\n\nExample:\n```\nnpm login --scope=@organization --registry=registry.organization.com\n```',
  },
  {
    key: 'script-shell',
    default: '"/bin/sh" on POSIX, "cmd.exe" on Windows',
    type: 'null | path',
    packageManager: ['npm'],
    description: 'The shell to use for scripts run with the `npm run` command.',
  },
  {
    key: 'searchexclude',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    description: 'Space-separated options that limit the results from `npm search`.',
  },
  {
    key: 'searchlimit',
    default: '20',
    type: 'Number',
    packageManager: ['npm'],
    description: 'Number of items to limit `npm search` results to.',
  },
  {
    key: 'searchopts',
    default: '""',
    type: 'String',
    packageManager: ['npm'],
    description: 'Space-separated options that are always passed to `npm search`.',
  },
  {
    key: 'searchstaleness',
    default: '900',
    type: 'Number',
    packageManager: ['npm'],
    description: 'The age of the cache in seconds before making another registry request when using the legacy search endpoint.',
  },
  {
    key: 'shell',
    default: '$SHELL, or "bash" on Posix, or "cmd" on Windows',
    type: 'path',
    packageManager: ['npm'],
    description: 'The shell to run for the `npm explore` command.',
  },
  {
    key: 'shrinkwrap',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    deprecated: true,
    description: '**Deprecated**: Alias for `--package-lock`.',
  },
  {
    key: 'sign-git-commit',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'When `true`, `npm version` commits using `-S` to add a GPG signature.',
  },
  {
    key: 'sign-git-tag',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'When `true`, `npm version` tags using `-s` to add a GPG signature.',
  },
  {
    key: 'strict-peer-deps',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description:
      'When `true`, any conflicting `peerDependencies` will be treated as an install failure.',
  },
  {
    key: 'strict-ssl',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Whether to perform SSL key validation when making requests to the registry via HTTPS.',
  },

  // ── T ───────────────────────────────────────────────────────────────────────
  {
    key: 'tag',
    default: '"latest"',
    type: 'String',
    packageManager: ['npm'],
    description: 'The default dist-tag when installing a package without specifying a version.',
  },
  {
    key: 'tag-version-prefix',
    default: '"v"',
    type: 'String',
    packageManager: ['npm'],
    description:
      'Alters the prefix used when tagging a new version during `npm version`.\n\nTo remove the prefix entirely: `tag-version-prefix=""`',
  },
  {
    key: 'timing',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'When `true`, writes timing information to `_timing.json` in your cache.',
  },

  // ── U ───────────────────────────────────────────────────────────────────────
  {
    key: 'umask',
    default: '0o22',
    type: 'Octal numeric string',
    packageManager: ['npm'],
    description: 'The "umask" value used when setting file creation mode on files and folders.',
  },
  {
    key: 'unicode',
    default: 'true on most systems, false on Windows',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'When `true`, output unicode characters in the tree output.',
  },
  {
    key: 'update-notifier',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Set to `false` to suppress the update notification when using an outdated npm version.',
  },
  {
    key: 'usage',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'When `true`, show short usage output instead of the full help text.',
  },
  {
    key: 'user-agent',
    default: 'npm/{version} node/{version} {os} {cpu} workspaces/{workspaces} ...',
    type: 'String',
    packageManager: ['npm'],
    since: 9,
    description: 'Sets the User-Agent request header.',
  },
  {
    key: 'userconfig',
    default: '~/.npmrc',
    type: 'path',
    packageManager: ['npm'],
    description: 'Location of the per-user configuration file.',
  },

  // ── V ───────────────────────────────────────────────────────────────────────
  {
    key: 'version',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: 'Print the npm version and exit.',
  },
  {
    key: 'versions',
    default: 'false',
    type: 'Boolean',
    packageManager: ['npm'],
    description: "Output the npm version as well as node's `process.versions` map.",
  },
  {
    key: 'viewer',
    default: '"man" on Posix, "browser" on Windows',
    type: 'String',
    packageManager: ['npm'],
    description: 'The program to use to view help content.',
  },

  // ── W ───────────────────────────────────────────────────────────────────────
  {
    key: 'which',
    default: 'null',
    type: 'null | Number',
    packageManager: ['npm'],
    description: 'If there are multiple funding sources, which 1-indexed source URL to open.',
  },
  {
    key: 'workspace',
    default: '""',
    type: 'String | String[]',
    packageManager: ['npm'],
    since: 9,
    description:
      'Enable running a command in the context of the configured workspaces. Can be set multiple times.',
  },
  {
    key: 'workspaces',
    default: 'null',
    type: 'null | Boolean',
    packageManager: ['npm'],
    since: 9,
    description: 'Set to `true` to run the command in the context of **all** configured workspaces.',
  },
  {
    key: 'workspaces-update',
    default: 'true',
    type: 'Boolean',
    packageManager: ['npm'],
    since: 9,
    description: 'When `true`, `npm update` will also update workspace packages.',
  },

  // ── Y ───────────────────────────────────────────────────────────────────────
  {
    key: 'yes',
    default: 'null',
    type: 'null | Boolean',
    packageManager: ['npm'],
    description: 'Automatically answer "yes" to any prompts that npm might print.',
  },
];

// ─── Exports ──────────────────────────────────────────────────────────────────

// Note: pnpm v11+ reads non-sensitive settings from `pnpm-workspace.yaml`
// (handled in `pnpmWorkspaceData.ts`). The keys retained here are the
// authentication / registry / proxy / SSL settings that pnpm still reads
// from `.npmrc` (https://pnpm.io/npmrc).
export const npmrcConfigs: NpmrcConfigEntry[] = [...npmConfigs];

/**
 * Fast lookup map: `${packageManager}:${key}` → config entry
 *
 * For keys shared between npm and pnpm (e.g. `registry`, `ca`, `strict-ssl`),
 * both `npm:registry` and `pnpm:registry` entries exist.
 */
export const npmrcConfigMap: Map<string, NpmrcConfigEntry> = new Map(
  npmrcConfigs.flatMap((c) =>
    c.packageManager.map((pm) => [`${pm}:${c.key}`, c] as [string, NpmrcConfigEntry])
  )
);

/** Lookup a config entry by key, optionally scoped to a package manager */
export function lookupConfig(
  key: string,
  pm?: PackageManager
): NpmrcConfigEntry | undefined {
  if (pm) {
    return npmrcConfigMap.get(`${pm}:${key}`);
  }
  // Fallback: try npm first, then pnpm
  return npmrcConfigMap.get(`npm:${key}`) ?? npmrcConfigMap.get(`pnpm:${key}`);
}

/** Get all config entries for a specific package manager */
export function getConfigsForPM(pm: PackageManager): NpmrcConfigEntry[] {
  return npmrcConfigs.filter((c) => c.packageManager.includes(pm));
}
