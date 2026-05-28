import * as vscode from 'vscode';
import {
  PnpmWorkspaceConfigEntry,
  pnpmWorkspaceConfigMap,
  pnpmWorkspaceConfigs,
  workspaceOnlyFieldKeys,
  deprecatedPnpmKeys,
} from './pnpmWorkspaceData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a rich Markdown popup for a `pnpm-workspace.yaml` config entry.
 */
function buildPnpmWorkspaceMarkdown(entry: PnpmWorkspaceConfigEntry): vscode.MarkdownString {
  const md = new vscode.MarkdownString('', true);
  md.isTrusted = true;
  md.supportThemeIcons = true;

  md.appendMarkdown(`### \`${entry.key}\`\n\n`);

  if (entry.deprecated) {
    md.appendMarkdown(`> ⚠️ **Deprecated**\n\n`);
  }

  md.appendMarkdown(`$(package) **pnpm** (pnpm-workspace.yaml)\n\n`);

  md.appendMarkdown(`| | |\n|---|---|\n`);
  md.appendMarkdown(`| **Type** | \`${entry.type}\` |\n`);
  md.appendMarkdown(`| **Default** | \`${entry.default}\` |\n`);
  md.appendMarkdown(`| **Category** | \`${entry.category}\` |\n`);
  if (entry.since) {
    md.appendMarkdown(`| **Since** | pnpm v${entry.since}+ |\n`);
  }
  if (entry.validValues?.length) {
    const vals = entry.validValues.map((v) => `\`${v}\``).join(', ');
    md.appendMarkdown(`| **Allowed values** | ${vals} |\n`);
  }
  md.appendMarkdown('\n');

  md.appendMarkdown(entry.description);

  // Pick the appropriate docs URL.
  const docsUrl = workspaceOnlyFieldKeys.has(entry.key)
    ? `https://pnpm.io/pnpm-workspace_yaml#${entry.key.toLowerCase()}`
    : `https://pnpm.io/settings#${entry.key.toLowerCase()}`;

  md.appendMarkdown(`\n\n---\n[📖 Official docs](${docsUrl})`);

  return md;
}

/** Build the diagnostic message for an unknown / deprecated key. */
function buildUnknownKeyMessage(rawKey: string): string {
  const hint = deprecatedPnpmKeys[rawKey];
  if (hint) {
    const extra = hint.note ? ` ${hint.note}` : '';
    return `"${rawKey}" is no longer a valid pnpm-workspace.yaml key. Use "${hint.replacement}" instead.${extra}`;
  }
  return `Unknown pnpm-workspace.yaml key: "${rawKey}". See https://pnpm.io/pnpm-workspace_yaml or https://pnpm.io/settings`;
}

/**
 * Determine whether a YAML line starts a top-level key (no indent, key before `:`).
 */
function parseTopLevelKey(line: string): { key: string; colonIndex: number } | null {
  // Top-level keys must start at column 0
  if (/^\s/.test(line)) { return null; }

  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) { return null; }

  const key = line.substring(0, colonIndex).trim();
  // YAML list indicators or empty keys are not config keys
  if (!key || key.startsWith('-') || key.startsWith('#')) { return null; }

  return { key, colonIndex };
}

// ─── Hover Provider ───────────────────────────────────────────────────────────

export class PnpmWorkspaceHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    const line = document.lineAt(position).text;

    if (/^\s*#/.test(line) || /^\s*$/.test(line)) { return null; }

    const parsed = parseTopLevelKey(line);
    if (!parsed) { return null; }

    if (position.character > parsed.colonIndex) { return null; }

    const entry = pnpmWorkspaceConfigMap.get(parsed.key);
    if (!entry) { return null; }

    const keyRange = new vscode.Range(position.line, 0, position.line, parsed.colonIndex);
    return new vscode.Hover(buildPnpmWorkspaceMarkdown(entry), keyRange);
  }
}

// ─── Completion Provider ──────────────────────────────────────────────────────

export class PnpmWorkspaceCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const line = document.lineAt(position).text;

    if (/^\s*#/.test(line)) { return null; }

    const colonIndex = line.indexOf(':');
    const textBeforeCursor = line.substring(0, position.character);

    // ── Value completion: `key: ` (top-level scalar values only) ──────────────
    if (colonIndex !== -1 && position.character > colonIndex && !/^\s/.test(line)) {
      const rawKey = line.substring(0, colonIndex).trim();
      const entry = pnpmWorkspaceConfigMap.get(rawKey);
      if (!entry?.validValues?.length) { return null; }

      return entry.validValues.map((val) => {
        const item = new vscode.CompletionItem(val, vscode.CompletionItemKind.EnumMember);
        item.detail = `${rawKey} value`;
        item.insertText = ` ${val}`;
        item.documentation = buildPnpmWorkspaceMarkdown(entry);
        return item;
      });
    }

    // ── Key completion: only at top-level (column 0) ──────────────────────────
    if (/^\s+/.test(textBeforeCursor)) { return null; }

    const typedPrefix = textBeforeCursor.trimStart();

    return pnpmWorkspaceConfigs
      .filter((entry) => entry.key.startsWith(typedPrefix))
      .map((entry) => {
        const item = new vscode.CompletionItem(entry.key, vscode.CompletionItemKind.Property);

        const badges: string[] = [];
        if (entry.deprecated) { badges.push('deprecated'); }
        if (entry.since) { badges.push(`since v${entry.since}`); }

        item.detail = [
          `[pnpm]`,
          `Type: ${entry.type}`,
          `Default: ${entry.default}`,
          ...badges,
        ].join('  |  ');

        item.documentation = buildPnpmWorkspaceMarkdown(entry);
        item.insertText = new vscode.SnippetString(`${entry.key}: \${1}`);
        item.sortText = entry.deprecated ? `zz_${entry.key}` : entry.key;

        if (entry.deprecated) {
          item.tags = [vscode.CompletionItemTag.Deprecated];
        }

        return item;
      });
  }
}

// ─── Diagnostics Provider ────────────────────────────────────────────────────

export class PnpmWorkspaceDiagnosticsProvider {
  private readonly collection: vscode.DiagnosticCollection;

  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection('pnpm-workspace');
  }

  dispose(): void {
    this.collection.clear();
    this.collection.dispose();
  }

  updateDiagnostics(document: vscode.TextDocument): void {
    if (!this.isPnpmWorkspaceDocument(document)) { return; }

    const diagnostics: vscode.Diagnostic[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const text = line.text;

      // Skip blank/comment/indented lines (we only validate top-level keys)
      if (/^\s*$/.test(text) || /^\s*#/.test(text) || /^\s+/.test(text)) { continue; }

      const colonIndex = text.indexOf(':');
      if (colonIndex === -1) { continue; }

      const rawKey = text.substring(0, colonIndex).trim();
      if (!rawKey || rawKey.startsWith('-')) { continue; }

      const entry = pnpmWorkspaceConfigMap.get(rawKey);
      if (!entry) {
        const range = new vscode.Range(i, 0, i, colonIndex);
        const severity = deprecatedPnpmKeys[rawKey]
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Warning;

        const diag = new vscode.Diagnostic(range, buildUnknownKeyMessage(rawKey), severity);
        if (deprecatedPnpmKeys[rawKey]) {
          diag.tags = [vscode.DiagnosticTag.Deprecated];
        }
        diagnostics.push(diag);
        continue;
      }

      if (entry.deprecated) {
        const range = new vscode.Range(i, 0, i, colonIndex);
        const firstLine = entry.description.split('\n')[0].replace(/\*\*/g, '');
        const diag = new vscode.Diagnostic(
          range,
          `"${rawKey}" is deprecated. ${firstLine}`,
          vscode.DiagnosticSeverity.Hint
        );
        diag.tags = [vscode.DiagnosticTag.Deprecated];
        diagnostics.push(diag);
      }

      // Validate enum values for top-level scalar assignments only
      const value = text.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (entry.validValues?.length && value.length > 0 && !value.startsWith('[') && !value.startsWith('{')) {
        if (!entry.validValues.includes(value)) {
          const valStart = colonIndex + 1 + text.substring(colonIndex + 1).search(/\S/);
          const range = new vscode.Range(i, Math.max(valStart, colonIndex + 1), i, text.length);
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

  private isPnpmWorkspaceDocument(document: vscode.TextDocument): boolean {
    return (
      document.languageId === 'pnpm-workspace' ||
      /pnpm-workspace\.ya?ml$/.test(document.fileName)
    );
  }
}
