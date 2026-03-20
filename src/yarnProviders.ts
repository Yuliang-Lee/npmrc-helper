import * as vscode from 'vscode';
import { YarnConfigEntry, yarnConfigMap, yarnConfigs } from './yarnData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildYarnMarkdown(entry: YarnConfigEntry): vscode.MarkdownString {
  const md = new vscode.MarkdownString('', true);
  md.isTrusted = true;
  md.supportThemeIcons = true;

  md.appendMarkdown(`### \`${entry.key}\`\n\n`);

  if (entry.deprecated) {
    md.appendMarkdown(`> ⚠️ **Deprecated**\n\n`);
  }

  // Badge
  md.appendMarkdown(`$(package) **yarn berry** (.yarnrc.yml)\n\n`);

  // Meta table
  md.appendMarkdown(`| | |\n|---|---|\n`);
  md.appendMarkdown(`| **Type** | \`${entry.type}\` |\n`);
  md.appendMarkdown(`| **Default** | \`${entry.default}\` |\n`);
  if (entry.npmEquivalent) {
    md.appendMarkdown(`| **npm equivalent** | \`${entry.npmEquivalent}\` |\n`);
  }
  if (entry.validValues?.length) {
    const vals = entry.validValues.map((v) => `\`${v}\``).join(', ');
    md.appendMarkdown(`| **Allowed values** | ${vals} |\n`);
  }
  md.appendMarkdown('\n');

  md.appendMarkdown(entry.description);

  md.appendMarkdown(
    `\n\n---\n[📖 Yarn docs](https://yarnpkg.com/configuration/yarnrc#${entry.key})`
  );

  return md;
}

// ─── Hover Provider ───────────────────────────────────────────────────────────

export class YarnrcHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    const line = document.lineAt(position).text;

    // Skip comments and blank lines
    if (/^\s*#/.test(line) || /^\s*$/.test(line)) { return null; }

    // Parse key (everything before `:` for YAML)
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) { return null; }
    if (position.character > colonIndex) { return null; }

    const rawKey = line.substring(0, colonIndex).trim();
    const entry = yarnConfigMap.get(rawKey);
    if (!entry) { return null; }

    const keyStart = line.search(/\S/);
    const keyRange = new vscode.Range(position.line, keyStart, position.line, colonIndex);

    return new vscode.Hover(buildYarnMarkdown(entry), keyRange);
  }
}

// ─── Completion Provider ──────────────────────────────────────────────────────

export class YarnrcCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const line = document.lineAt(position).text;

    if (/^\s*#/.test(line)) { return null; }

    const colonIndex = line.indexOf(':');
    const textBeforeCursor = line.substring(0, position.character);

    // Value completion: after `key: ` and we have valid values
    if (colonIndex !== -1 && position.character > colonIndex) {
      const rawKey = line.substring(0, colonIndex).trim();
      const entry = yarnConfigMap.get(rawKey);
      if (!entry?.validValues?.length) { return null; }

      return entry.validValues.map((val) => {
        const item = new vscode.CompletionItem(val, vscode.CompletionItemKind.EnumMember);
        item.detail = `${rawKey} value`;
        item.insertText = ` ${val}`;
        item.documentation = buildYarnMarkdown(entry);
        return item;
      });
    }

    // Key completion: beginning of line
    if (colonIndex !== -1 && position.character > colonIndex) { return null; }

    const typedPrefix = textBeforeCursor.trimStart();

    return yarnConfigs
      .filter((entry) => entry.key.startsWith(typedPrefix))
      .map((entry) => {
        const item = new vscode.CompletionItem(entry.key, vscode.CompletionItemKind.Property);
        item.detail = `Type: ${entry.type}  |  Default: ${entry.default}`;
        item.documentation = buildYarnMarkdown(entry);
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

export class YarnrcDiagnosticsProvider {
  private readonly collection: vscode.DiagnosticCollection;

  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection('yarnrc');
  }

  dispose(): void {
    this.collection.dispose();
  }

  updateDiagnostics(document: vscode.TextDocument): void {
    if (!this.isYarnrcDocument(document)) { return; }

    const diagnostics: vscode.Diagnostic[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const text = line.text;

      // Skip blank lines, comments, continuation lines (list items / nested keys)
      if (/^\s*$/.test(text) || /^\s*#/.test(text) || /^\s+/.test(text)) { continue; }

      const colonIndex = text.indexOf(':');
      if (colonIndex === -1) { continue; }

      const rawKey = text.substring(0, colonIndex).trim();

      // Skip YAML indicators
      if (!rawKey || rawKey.startsWith('-')) { continue; }

      const entry = yarnConfigMap.get(rawKey);
      if (!entry) {
        const keyStart = text.search(/\S/);
        const range = new vscode.Range(i, keyStart, i, colonIndex);
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            `Unknown Yarn Berry config key: "${rawKey}". See https://yarnpkg.com/configuration/yarnrc`,
            vscode.DiagnosticSeverity.Warning
          )
        );
        continue;
      }

      if (entry.deprecated) {
        const keyStart = text.search(/\S/);
        const range = new vscode.Range(i, keyStart, i, colonIndex);
        const diag = new vscode.Diagnostic(
          range,
          `"${rawKey}" is deprecated.`,
          vscode.DiagnosticSeverity.Hint
        );
        diag.tags = [vscode.DiagnosticTag.Deprecated];
        diagnostics.push(diag);
      }

      // Enum value check for single-line assignments (`key: value`)
      const value = text.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (entry.validValues?.length && value.length > 0 && !value.startsWith('[') && !value.startsWith('{')) {
        if (!entry.validValues.includes(value)) {
          const valStart = colonIndex + 1 + text.substring(colonIndex + 1).search(/\S/);
          const range = new vscode.Range(i, valStart, i, text.length);
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

  private isYarnrcDocument(document: vscode.TextDocument): boolean {
    return (
      document.languageId === 'yarnrc' ||
      document.fileName.endsWith('.yarnrc.yml') ||
      document.fileName.endsWith('.yarnrc.yaml')
    );
  }
}
