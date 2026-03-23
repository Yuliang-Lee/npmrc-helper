import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { NpmrcHoverProvider, NpmrcCompletionProvider, NpmrcDiagnosticsProvider } from '../../providers';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Create a temporary .npmrc file with the given content and open it as a
 * VS Code TextDocument.
 */
async function createNpmrcDocument(content: string): Promise<vscode.TextDocument> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'npmrc-test-'));
  const filePath = path.join(tmpDir, '.npmrc');
  fs.writeFileSync(filePath, content, 'utf8');
  const uri = vscode.Uri.file(filePath);
  return vscode.workspace.openTextDocument(uri);
}

// ─── Hover Provider ───────────────────────────────────────────────────────────

suite('NpmrcHoverProvider', () => {
  const provider = new NpmrcHoverProvider();

  test('returns null for comment lines', async () => {
    const doc = await createNpmrcDocument('# this is a comment\n');
    const position = new vscode.Position(0, 5);
    const result = provider.provideHover(doc, position);
    assert.strictEqual(result, null, 'Should return null for comment lines');
  });

  test('returns null for blank lines', async () => {
    const doc = await createNpmrcDocument('\n');
    const position = new vscode.Position(0, 0);
    const result = provider.provideHover(doc, position);
    assert.strictEqual(result, null, 'Should return null for blank lines');
  });

  test('returns null when no "=" found', async () => {
    const doc = await createNpmrcDocument('registry\n');
    const position = new vscode.Position(0, 3);
    const result = provider.provideHover(doc, position);
    assert.strictEqual(result, null, 'Should return null when no "=" found');
  });

  test('returns null when cursor is after "="', async () => {
    const doc = await createNpmrcDocument('registry=https://registry.npmjs.org/\n');
    // Position after the `=`
    const position = new vscode.Position(0, 10);
    const result = provider.provideHover(doc, position);
    assert.strictEqual(result, null, 'Should return null when cursor is after "="');
  });

  test('returns Hover for a known npm key', async () => {
    const doc = await createNpmrcDocument('registry=https://registry.npmjs.org/\n');
    // Position on the key "registry"
    const position = new vscode.Position(0, 3);
    const result = provider.provideHover(doc, position);
    assert.ok(result instanceof vscode.Hover, 'Should return a Hover instance');
  });

  test('hover content contains the key name', async () => {
    const doc = await createNpmrcDocument('registry=https://registry.npmjs.org/\n');
    const position = new vscode.Position(0, 3);
    const result = provider.provideHover(doc, position) as vscode.Hover;
    assert.ok(result, 'Hover should not be null');
    const content = result.contents[0];
    const text = content instanceof vscode.MarkdownString ? content.value : String(content);
    assert.ok(text.includes('registry'), 'Hover content should mention the key name');
  });

  test('returns null for an unknown key', async () => {
    const doc = await createNpmrcDocument('totally-unknown-key=value\n');
    const position = new vscode.Position(0, 5);
    const result = provider.provideHover(doc, position);
    assert.strictEqual(result, null, 'Should return null for unknown keys');
  });
});

// ─── Completion Provider ──────────────────────────────────────────────────────

suite('NpmrcCompletionProvider', () => {
  const provider = new NpmrcCompletionProvider();

  test('returns null for comment lines', async () => {
    const doc = await createNpmrcDocument('# comment\n');
    const position = new vscode.Position(0, 3);
    const result = await provider.provideCompletionItems(doc, position);
    assert.strictEqual(result, null, 'Should return null for comment lines');
  });

  test('returns key completions on an empty line', async () => {
    const doc = await createNpmrcDocument('\n');
    const position = new vscode.Position(0, 0);
    const result = await provider.provideCompletionItems(doc, position);
    assert.ok(Array.isArray(result) && result.length > 0, 'Should return key completion items');
  });

  test('key completions are CompletionItem instances', async () => {
    const doc = await createNpmrcDocument('reg\n');
    const position = new vscode.Position(0, 3);
    const result = await provider.provideCompletionItems(doc, position);
    assert.ok(Array.isArray(result) && result.length > 0, 'Should return completions for prefix "reg"');
    assert.ok(
      result!.every((item) => item instanceof vscode.CompletionItem),
      'All items should be CompletionItem instances'
    );
  });

  test('key completions include "registry"', async () => {
    const doc = await createNpmrcDocument('reg\n');
    const position = new vscode.Position(0, 3);
    const result = (await provider.provideCompletionItems(doc, position)) as vscode.CompletionItem[];
    const labels = result.map((item) =>
      typeof item.label === 'string' ? item.label : item.label.label
    );
    assert.ok(labels.includes('registry'), 'Completions should include "registry"');
  });

  test('returns value completions after "="', async () => {
    const doc = await createNpmrcDocument('loglevel=\n');
    // Position right after `=`
    const position = new vscode.Position(0, 9);
    const result = await provider.provideCompletionItems(doc, position);
    assert.ok(Array.isArray(result) && result.length > 0, 'Should return value completions for "loglevel"');
  });

  test('value completions are EnumMember kind', async () => {
    const doc = await createNpmrcDocument('loglevel=\n');
    const position = new vscode.Position(0, 9);
    const result = (await provider.provideCompletionItems(doc, position)) as vscode.CompletionItem[];
    assert.ok(
      result.every((item) => item.kind === vscode.CompletionItemKind.EnumMember),
      'Value completions should be EnumMember kind'
    );
  });

  test('returns null for value completions on a key with no valid values', async () => {
    const doc = await createNpmrcDocument('registry=\n');
    const position = new vscode.Position(0, 9);
    const result = await provider.provideCompletionItems(doc, position);
    assert.strictEqual(result, null, 'Should return null when key has no constrained valid values');
  });
});

// ─── Diagnostics Provider ─────────────────────────────────────────────────────

suite('NpmrcDiagnosticsProvider', () => {
  let provider: NpmrcDiagnosticsProvider;

  setup(() => {
    provider = new NpmrcDiagnosticsProvider();
  });

  teardown(() => {
    provider.dispose();
  });

  test('no diagnostics for a valid entry', async () => {
    const doc = await createNpmrcDocument('registry=https://registry.npmjs.org/\n');
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.strictEqual(diags.length, 0, 'Should produce no diagnostics for a valid entry');
  });

  test('warning for missing "=" sign', async () => {
    const doc = await createNpmrcDocument('registry\n');
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.ok(diags.length > 0, 'Should produce a diagnostic for missing "="');
    assert.ok(
      diags[0].message.includes('Missing'),
      'Diagnostic message should mention "Missing"'
    );
  });

  test('warning for unknown key', async () => {
    const doc = await createNpmrcDocument('totally-unknown-key=value\n');
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.ok(diags.length > 0, 'Should produce a diagnostic for unknown key');
    assert.ok(
      diags[0].message.includes('Unknown'),
      'Diagnostic message should mention "Unknown"'
    );
  });

  test('warning for invalid value', async () => {
    const doc = await createNpmrcDocument('loglevel=invalid-value\n');
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.ok(diags.length > 0, 'Should produce a diagnostic for invalid value');
    assert.ok(
      diags[0].message.includes('Invalid value'),
      'Diagnostic message should mention "Invalid value"'
    );
  });

  test('no diagnostics for comment lines', async () => {
    const doc = await createNpmrcDocument('# this is a comment\n');
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.strictEqual(diags.length, 0, 'Should produce no diagnostics for comment lines');
  });

  test('no diagnostics for scoped registry entries', async () => {
    const doc = await createNpmrcDocument('@scope:registry=https://registry.example.com/\n');
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.strictEqual(diags.length, 0, 'Should skip scoped registry entries');
  });

  test('no diagnostics for auth token entries', async () => {
    const doc = await createNpmrcDocument('//registry.example.com/:_authToken=abc123\n');
    provider.updateDiagnostics(doc);
    const diags = provider.getDiagnostics(doc);
    assert.strictEqual(diags.length, 0, 'Should skip auth token entries starting with "//"');
  });

  test('clearDiagnostics removes all diagnostics', async () => {
    const doc = await createNpmrcDocument('totally-unknown-key=value\n');
    provider.updateDiagnostics(doc);
    assert.ok(provider.getDiagnostics(doc).length > 0, 'Should have diagnostics before clear');
    provider.clearDiagnostics(doc);
    assert.strictEqual(provider.getDiagnostics(doc).length, 0, 'Should have no diagnostics after clear');
  });
});
