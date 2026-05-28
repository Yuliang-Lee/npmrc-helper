import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {
  PnpmWorkspaceHoverProvider,
  PnpmWorkspaceCompletionProvider,
  PnpmWorkspaceDiagnosticsProvider,
} from '../../pnpmWorkspaceProviders';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createPnpmWorkspaceDocument(content: string): Promise<vscode.TextDocument> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pnpm-ws-test-'));
  const filePath = path.join(tmpDir, 'pnpm-workspace.yaml');
  fs.writeFileSync(filePath, content, 'utf8');
  const uri = vscode.Uri.file(filePath);
  return vscode.workspace.openTextDocument(uri);
}

// ─── Hover Provider ───────────────────────────────────────────────────────────

suite('PnpmWorkspaceHoverProvider', () => {
  const provider = new PnpmWorkspaceHoverProvider();

  test('returns Hover for "packages" workspace field', async () => {
    const doc = await createPnpmWorkspaceDocument('packages:\n  - "apps/*"\n');
    const position = new vscode.Position(0, 3);
    const result = provider.provideHover(doc, position);
    assert.ok(result instanceof vscode.Hover, 'Should return a Hover instance');
  });

  test('returns Hover for camelCase setting "nodeLinker"', async () => {
    const doc = await createPnpmWorkspaceDocument('nodeLinker: hoisted\n');
    const position = new vscode.Position(0, 3);
    const result = provider.provideHover(doc, position) as vscode.Hover;
    assert.ok(result, 'Hover should not be null');
    const content = result.contents[0];
    const text = content instanceof vscode.MarkdownString ? content.value : String(content);
    assert.ok(text.includes('nodeLinker'), 'Hover content should mention the key name');
  });

  test('returns Hover for "allowBuilds" (consolidated build deps)', async () => {
    const doc = await createPnpmWorkspaceDocument('allowBuilds:\n  esbuild: true\n');
    const position = new vscode.Position(0, 3);
    const result = provider.provideHover(doc, position) as vscode.Hover;
    assert.ok(result, 'Hover should not be null');
    const content = result.contents[0];
    const text = content instanceof vscode.MarkdownString ? content.value : String(content);
    assert.ok(text.includes('allowBuilds'), 'Hover content should mention "allowBuilds"');
  });

  test('returns Hover for "packageConfigs" (per-subproject overrides)', async () => {
    const doc = await createPnpmWorkspaceDocument('packageConfigs:\n  "@my/web":\n    nodeLinker: hoisted\n');
    const position = new vscode.Position(0, 3);
    const result = provider.provideHover(doc, position) as vscode.Hover;
    assert.ok(result, 'Hover should not be null');
    const content = result.contents[0];
    const text = content instanceof vscode.MarkdownString ? content.value : String(content);
    assert.ok(text.includes('packageConfigs'), 'Hover content should mention "packageConfigs"');
  });

  test('returns null for unknown key', async () => {
    const doc = await createPnpmWorkspaceDocument('totally-unknown-key: value\n');
    const position = new vscode.Position(0, 5);
    const result = provider.provideHover(doc, position);
    assert.strictEqual(result, null, 'Should return null for unknown keys');
  });

  test('returns null for indented (nested) keys', async () => {
    const doc = await createPnpmWorkspaceDocument('catalog:\n  react: ^18.3.1\n');
    const position = new vscode.Position(1, 4);
    const result = provider.provideHover(doc, position);
    assert.strictEqual(result, null, 'Should return null for nested keys');
  });

  test('returns null for comment lines', async () => {
    const doc = await createPnpmWorkspaceDocument('# this is a comment\n');
    const position = new vscode.Position(0, 5);
    const result = provider.provideHover(doc, position);
    assert.strictEqual(result, null, 'Should return null for comment lines');
  });
});

// ─── Completion Provider ──────────────────────────────────────────────────────

suite('PnpmWorkspaceCompletionProvider', () => {
  const provider = new PnpmWorkspaceCompletionProvider();

  test('returns key completions on empty line', async () => {
    const doc = await createPnpmWorkspaceDocument('\n');
    const position = new vscode.Position(0, 0);
    const result = await provider.provideCompletionItems(doc, position);
    assert.ok(Array.isArray(result) && result.length > 0, 'Should return key completion items');
  });

  test('key completions include "packages"', async () => {
    const doc = await createPnpmWorkspaceDocument('pack\n');
    const position = new vscode.Position(0, 4);
    const result = (await provider.provideCompletionItems(doc, position)) as vscode.CompletionItem[];
    const labels = result.map((item) =>
      typeof item.label === 'string' ? item.label : item.label.label
    );
    assert.ok(labels.includes('packages'), 'Completions should include "packages"');
  });

  test('key completions include camelCase "nodeLinker"', async () => {
    const doc = await createPnpmWorkspaceDocument('node\n');
    const position = new vscode.Position(0, 4);
    const result = (await provider.provideCompletionItems(doc, position)) as vscode.CompletionItem[];
    const labels = result.map((item) =>
      typeof item.label === 'string' ? item.label : item.label.label
    );
    assert.ok(labels.includes('nodeLinker'), 'Completions should include "nodeLinker"');
  });

  test('key completions include "allowBuilds"', async () => {
    const doc = await createPnpmWorkspaceDocument('allow\n');
    const position = new vscode.Position(0, 5);
    const result = (await provider.provideCompletionItems(doc, position)) as vscode.CompletionItem[];
    const labels = result.map((item) =>
      typeof item.label === 'string' ? item.label : item.label.label
    );
    assert.ok(labels.includes('allowBuilds'), 'Completions should include "allowBuilds"');
  });

  test('returns value completions after "nodeLinker:"', async () => {
    const doc = await createPnpmWorkspaceDocument('nodeLinker:\n');
    const position = new vscode.Position(0, 11);
    const result = await provider.provideCompletionItems(doc, position);
    assert.ok(Array.isArray(result) && result.length > 0, 'Should return value completions');
  });

  test('returns null for indented (nested) lines', async () => {
    const doc = await createPnpmWorkspaceDocument('catalog:\n  rea\n');
    const position = new vscode.Position(1, 5);
    const result = await provider.provideCompletionItems(doc, position);
    assert.strictEqual(result, null, 'Should return null for indented (nested) lines');
  });
});

// ─── Diagnostics Provider ─────────────────────────────────────────────────────

suite('PnpmWorkspaceDiagnosticsProvider', () => {
  let provider: PnpmWorkspaceDiagnosticsProvider;

  setup(() => {
    provider = new PnpmWorkspaceDiagnosticsProvider();
  });

  teardown(() => {
    provider.dispose();
  });

  test('no diagnostics for valid top-level keys', async () => {
    const doc = await createPnpmWorkspaceDocument(
      'packages:\n  - "apps/*"\nnodeLinker: isolated\nallowBuilds:\n  esbuild: true\n'
    );
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.strictEqual(diags.length, 0, 'Should produce no diagnostics for valid entries');
  });

  test('warning + migration hint for kebab-case "node-linker"', async () => {
    const doc = await createPnpmWorkspaceDocument('node-linker: isolated\n');
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.ok(diags.length > 0, 'Should produce a diagnostic for old kebab-case key');
    assert.ok(
      diags[0].message.includes('nodeLinker'),
      'Diagnostic should suggest the camelCase replacement "nodeLinker"'
    );
  });

  test('warning + allowBuilds hint for "onlyBuiltDependencies"', async () => {
    const doc = await createPnpmWorkspaceDocument('onlyBuiltDependencies:\n  - esbuild\n');
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.ok(diags.length > 0, 'Should produce a diagnostic for consolidated key');
    assert.ok(
      diags[0].message.includes('allowBuilds'),
      'Diagnostic should suggest the new "allowBuilds" key'
    );
  });

  test('warning for truly unknown key', async () => {
    const doc = await createPnpmWorkspaceDocument('totally-unknown-key: value\n');
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.ok(diags.length > 0, 'Should produce a diagnostic for unknown key');
    assert.ok(diags[0].message.includes('Unknown'), 'Diagnostic should mention "Unknown"');
  });

  test('warning for invalid enum value', async () => {
    const doc = await createPnpmWorkspaceDocument('nodeLinker: invalid-value\n');
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.ok(diags.length > 0, 'Should produce a diagnostic for invalid value');
    assert.ok(
      diags[0].message.includes('Invalid value'),
      'Diagnostic should mention "Invalid value"'
    );
  });

  test('no diagnostics for nested keys (e.g. catalog entries)', async () => {
    const doc = await createPnpmWorkspaceDocument(
      'catalog:\n  react: ^18.3.1\n  react-dom: ^18.3.1\n'
    );
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.strictEqual(diags.length, 0, 'Should skip nested (indented) lines');
  });

  test('clearDiagnostics removes all diagnostics', async () => {
    const doc = await createPnpmWorkspaceDocument('totally-unknown-key: value\n');
    provider.updateDiagnostics(doc);
    assert.ok(provider.getDiagnostics(doc).length > 0, 'Should have diagnostics before clear');
    provider.clearDiagnostics(doc);
    assert.strictEqual(provider.getDiagnostics(doc).length, 0, 'Should have no diagnostics after clear');
  });
});
