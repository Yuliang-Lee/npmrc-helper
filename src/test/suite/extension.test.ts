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
});
