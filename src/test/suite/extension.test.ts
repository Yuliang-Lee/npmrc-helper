import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  suiteSetup(async () => {
    // Wait for the extension to activate
    const ext = vscode.extensions.getExtension('xlaoyu.npmrc-helper');
    if (ext && !ext.isActive) {
      await ext.activate();
    }
  });

  test('Extension should be present', () => {
    const ext = vscode.extensions.getExtension('xlaoyu.npmrc-helper');
    assert.ok(ext, 'Extension should be registered');
  });

  test('Extension should activate successfully', async () => {
    const ext = vscode.extensions.getExtension('xlaoyu.npmrc-helper');
    assert.ok(ext, 'Extension should be registered');
    await ext!.activate();
    assert.strictEqual(ext!.isActive, true, 'Extension should be active');
  });

  test('pnpm workspace grammar should not override the YAML grammar', async () => {
    const ext = vscode.extensions.getExtension('xlaoyu.npmrc-helper');
    assert.ok(ext, 'Extension should be registered');

    const grammars = ext!.packageJSON.contributes.grammars as Array<{
      language: string;
      scopeName: string;
      path: string;
    }>;

    assert.ok(
      grammars.every((grammar) => grammar.scopeName !== 'source.yaml'),
      'Extension grammars must not claim the shared source.yaml scope'
    );

    const pnpmGrammar = grammars.find(
      (grammar) => grammar.language === 'pnpm-workspace'
    );
    assert.ok(pnpmGrammar, 'pnpm-workspace grammar should be registered');
    assert.strictEqual(pnpmGrammar.scopeName, 'source.pnpm-workspace');

    const grammarUri = vscode.Uri.joinPath(
      ext!.extensionUri,
      pnpmGrammar.path
    );
    const grammarContents = await vscode.workspace.fs.readFile(grammarUri);
    const grammar = JSON.parse(Buffer.from(grammarContents).toString('utf8'));
    assert.strictEqual(grammar.scopeName, pnpmGrammar.scopeName);
  });
});
