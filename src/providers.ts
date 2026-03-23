import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
  NpmrcConfigEntry,
  PackageManager,
  lookupConfig,
  getConfigsForPM,
} from './npmrcData';

// ─── Package manager detection ────────────────────────────────────────────────

/**
 * Determine which package manager "owns" a .npmrc file by looking at the
 * nearest workspace root for a pnpm-lock.yaml / pnpm-workspace.yaml,
 * otherwise assume npm.
 */
function detectPackageManager(document: vscode.TextDocument): PackageManager {
  const dir = path.dirname(document.uri.fsPath);
  const pnpmIndicators = ['pnpm-lock.yaml', 'pnpm-workspace.yaml', '.pnpmfile.cjs'];

  let current = dir;
  for (let depth = 0; depth < 5; depth++) {
    for (const indicator of pnpmIndicators) {
      if (fs.existsSync(path.join(current, indicator))) {
        return 'pnpm';
      }
    }
    const parent = path.dirname(current);
    if (parent === current) { break; }
    current = parent;
  }
  return 'npm';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Badge labels for the package manager pill in hover */
const PM_BADGE: Record<PackageManager, string> = {
  npm: '$(package) npm',
  pnpm: '$(package) pnpm',
};

/**
 * Build a rich Markdown string for a config entry, shown in Hover and
 * CompletionItem documentation.
 */
function buildMarkdown(entry: NpmrcConfigEntry, activePm: PackageManager): vscode.MarkdownString {
  const md = new vscode.MarkdownString('', true);
  md.isTrusted = true;
  md.supportThemeIcons = true;

  // Title
  md.appendMarkdown(`### \`${entry.key}\`\n\n`);

  // Deprecation / removed notice
  if (entry.removedIn) {
    md.appendMarkdown(`> 🚫 **Removed in npm v${entry.removedIn}**\n\n`);
  } else if (entry.deprecated) {
    md.appendMarkdown(`> ⚠️ **Deprecated**\n\n`);
  }

  // Package manager badge(s)
  const pmBadges = entry.packageManager.map((pm) => {
    const badge = pm === activePm ? `**${PM_BADGE[pm]}**` : PM_BADGE[pm];
    return badge;
  });
  md.appendMarkdown(`${pmBadges.join(' · ')}\n\n`);

  // Meta table
  md.appendMarkdown(`| | |\n|---|---|\n`);
  md.appendMarkdown(`| **Type** | \`${entry.type}\` |\n`);
  md.appendMarkdown(`| **Default** | \`${entry.default}\` |\n`);

  if (entry.since) {
    const pmLabel = entry.packageManager.includes('npm') ? `npm v${entry.since}+` : `pnpm v${entry.since}+`;
    md.appendMarkdown(`| **Since** | ${pmLabel} |\n`);
  }

  if (entry.validValues && entry.validValues.length > 0) {
    const vals = entry.validValues.map((v) => `\`${v}\``).join(', ');
    md.appendMarkdown(`| **Allowed values** | ${vals} |\n`);
  }
  md.appendMarkdown('\n');

  // Description
  md.appendMarkdown(entry.description);

  // Docs link
  const docsUrl = activePm === 'pnpm'
    ? `https://pnpm.io/npmrc#${entry.key}`
    : `https://docs.npmjs.com/cli/v11/using-npm/config#${entry.key.replace(/\./g, '-')}`;

  md.appendMarkdown(`\n\n---\n[📖 Official docs](${docsUrl})`);

  return md;
}

// ─── Hover Provider ───────────────────────────────────────────────────────────

export class NpmrcHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    const line = document.lineAt(position).text;

    // Skip comments and blank lines
    if (/^\s*#/.test(line) || /^\s*$/.test(line)) { return null; }

    // Parse key (everything before the first `=`, trimmed)
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) { return null; }

    // Cursor must be within the key region
    if (position.character > eqIndex) { return null; }

    const rawKey = line.substring(0, eqIndex).trim();
    const pm = detectPackageManager(document);
    const entry = lookupConfig(rawKey, pm) ?? lookupConfig(rawKey);
    if (!entry) { return null; }

    const keyStart = line.search(/\S/);
    const keyRange = new vscode.Range(position.line, keyStart, position.line, eqIndex);

    return new vscode.Hover(buildMarkdown(entry, pm), keyRange);
  }
}

// ─── Completion Provider ──────────────────────────────────────────────────────

export class NpmrcCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const line = document.lineAt(position).text;

    // Skip comments
    if (/^\s*#/.test(line)) { return null; }

    const eqIndex = line.indexOf('=');
    const pm = detectPackageManager(document);
    const configs = getConfigsForPM(pm);

    // ── Value completion ──────────────────────────────────────────────────────
    if (eqIndex !== -1 && position.character > eqIndex) {
      const rawKey = line.substring(0, eqIndex).trim();
      const entry = lookupConfig(rawKey, pm) ?? lookupConfig(rawKey);
      if (!entry?.validValues?.length) { return null; }

      return entry.validValues.map((val) => {
        const item = new vscode.CompletionItem(val, vscode.CompletionItemKind.EnumMember);
        item.detail = `${rawKey} value`;
        item.insertText = val;
        item.documentation = buildMarkdown(entry, pm);
        return item;
      });
    }

    // ── Key completion ────────────────────────────────────────────────────────
    const typedPrefix = line.substring(0, position.character).trimStart();

    return configs
      .filter((entry) => entry.key.startsWith(typedPrefix))
      .map((entry) => {
        const item = new vscode.CompletionItem(entry.key, vscode.CompletionItemKind.Property);

        // Build detail: type + default + optional version badges
        const badges: string[] = [];
        if (entry.removedIn) { badges.push(`removed in npm v${entry.removedIn}`); }
        else if (entry.deprecated) { badges.push('deprecated'); }
        else if (entry.since) { badges.push(`since v${entry.since}`); }

        item.detail = [
          `[${pm}]`,
          `Type: ${entry.type}`,
          `Default: ${entry.default}`,
          ...badges,
        ].join('  |  ');

        item.documentation = buildMarkdown(entry, pm);
        item.insertText = new vscode.SnippetString(`${entry.key}=\${1}`);

        // Sort: removed keys last, deprecated keys second-to-last, normal keys by name
        if (entry.removedIn) {
          item.sortText = `zzz_${entry.key}`;
        } else if (entry.deprecated) {
          item.sortText = `zz_${entry.key}`;
        } else {
          item.sortText = entry.key;
        }

        if (entry.deprecated || entry.removedIn) {
          item.tags = [vscode.CompletionItemTag.Deprecated];
        }

        return item;
      });
  }
}

// ─── Diagnostics Provider ─────────────────────────────────────────────────────

export class NpmrcDiagnosticsProvider {
  private readonly collection: vscode.DiagnosticCollection;

  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection('npmrc');
  }

  dispose(): void {
    this.collection.clear();
    this.collection.dispose();
  }

  updateDiagnostics(document: vscode.TextDocument): void {
    if (!this.isNpmrcDocument(document)) { return; }

    const pm = detectPackageManager(document);
    const diagnostics: vscode.Diagnostic[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const text = line.text;

      // Skip blank lines and comments
      if (/^\s*$/.test(text) || /^\s*#/.test(text)) { continue; }

      const eqIndex = text.indexOf('=');
      if (eqIndex === -1) {
        const trimmed = text.trim();
        if (trimmed.length > 0) {
          const range = new vscode.Range(i, 0, i, text.length);
          diagnostics.push(
            new vscode.Diagnostic(
              range,
              'Missing "=" in .npmrc entry. Expected format: key=value',
              vscode.DiagnosticSeverity.Warning
            )
          );
        }
        continue;
      }

      const rawKey = text.substring(0, eqIndex).trim();

      // Skip scoped registry / auth entries like @scope:registry or //host/:_authToken
      if (rawKey.startsWith('@') || rawKey.startsWith('//') || rawKey.startsWith('_')) {
        continue;
      }

      // Look up: prefer pm-specific, fall back to the other pm
      const entry = lookupConfig(rawKey, pm) ?? lookupConfig(rawKey);

      if (!entry) {
        const keyStart = text.search(/\S/);
        const range = new vscode.Range(i, keyStart, i, eqIndex);
        const docsUrl = pm === 'pnpm'
          ? 'https://pnpm.io/npmrc'
          : 'https://docs.npmjs.com/cli/v11/using-npm/config';
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            `Unknown ${pm} config key: "${rawKey}". See ${docsUrl}`,
            vscode.DiagnosticSeverity.Warning
          )
        );
        continue;
      }

      // Removed key (harder error)
      if (entry.removedIn) {
        const keyStart = text.search(/\S/);
        const range = new vscode.Range(i, keyStart, i, eqIndex);
        const diag = new vscode.Diagnostic(
          range,
          `"${rawKey}" was removed in npm v${entry.removedIn} and has no effect.`,
          vscode.DiagnosticSeverity.Warning
        );
        diag.tags = [vscode.DiagnosticTag.Deprecated];
        diagnostics.push(diag);
        continue;
      }

      // Deprecated key (hint)
      if (entry.deprecated) {
        const keyStart = text.search(/\S/);
        const range = new vscode.Range(i, keyStart, i, eqIndex);
        const firstLine = entry.description.split('\n')[0].replace(/\*\*/g, '');
        const diag = new vscode.Diagnostic(
          range,
          `"${rawKey}" is deprecated. ${firstLine}`,
          vscode.DiagnosticSeverity.Hint
        );
        diag.tags = [vscode.DiagnosticTag.Deprecated];
        diagnostics.push(diag);
      }

      // Valid value check
      const value = text.substring(eqIndex + 1).trim();
      if (entry.validValues && entry.validValues.length > 0 && value.length > 0) {
        if (!entry.validValues.includes(value)) {
          const valStart = eqIndex + 1 + (text.substring(eqIndex + 1).search(/\S/));
          const range = new vscode.Range(i, Math.max(valStart, eqIndex + 1), i, text.length);
          diagnostics.push(
            new vscode.Diagnostic(
              range,
              `Invalid value "${value}" for "${rawKey}". Allowed: ${entry.validValues.join(', ')}`,
              vscode.DiagnosticSeverity.Warning
            )
          );
        }
      }
    }

    this.collection.set(document.uri, diagnostics);
  }

  clearDiagnostics(document: vscode.TextDocument): void {
    this.collection.delete(document.uri);
  }

  getDiagnostics(document: vscode.TextDocument): readonly vscode.Diagnostic[] {
    return this.collection.get(document.uri) ?? [];
  }

  private isNpmrcDocument(document: vscode.TextDocument): boolean {
    return (
      document.languageId === 'npmrc' ||
      document.fileName.endsWith('.npmrc')
    );
  }
}
