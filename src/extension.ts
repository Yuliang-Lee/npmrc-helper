import * as vscode from 'vscode';
import {
  NpmrcHoverProvider,
  NpmrcCompletionProvider,
  NpmrcDiagnosticsProvider,
} from './providers';
import {
  YarnrcHoverProvider,
  YarnrcCompletionProvider,
  YarnrcDiagnosticsProvider,
} from './yarnProviders';

export function activate(context: vscode.ExtensionContext): void {
  console.log('[npmrc-helper] Extension activated');

  // ── .npmrc (npm & pnpm) ───────────────────────────────────────────────────

  const npmrcDiagnostics = new NpmrcDiagnosticsProvider();

  const npmrcHover = vscode.languages.registerHoverProvider(
    { language: 'npmrc' },
    new NpmrcHoverProvider()
  );

  const npmrcCompletion = vscode.languages.registerCompletionItemProvider(
    { language: 'npmrc' },
    new NpmrcCompletionProvider(),
    '=' // trigger on `=` for value completions
  );

  // ── .yarnrc.yml (Yarn Berry) ──────────────────────────────────────────────

  const yarnrcDiagnostics = new YarnrcDiagnosticsProvider();

  const yarnrcHover = vscode.languages.registerHoverProvider(
    { language: 'yarnrc' },
    new YarnrcHoverProvider()
  );

  const yarnrcCompletion = vscode.languages.registerCompletionItemProvider(
    { language: 'yarnrc' },
    new YarnrcCompletionProvider(),
    ':' // trigger on `:` for value completions
  );

  // ── Diagnostics: run on open / change / close ─────────────────────────────

  if (vscode.window.activeTextEditor) {
    const doc = vscode.window.activeTextEditor.document;
    npmrcDiagnostics.updateDiagnostics(doc);
    yarnrcDiagnostics.updateDiagnostics(doc);
  }

  const onDidOpen = vscode.workspace.onDidOpenTextDocument((doc) => {
    npmrcDiagnostics.updateDiagnostics(doc);
    yarnrcDiagnostics.updateDiagnostics(doc);
  });

  const onDidChange = vscode.workspace.onDidChangeTextDocument((event) => {
    npmrcDiagnostics.updateDiagnostics(event.document);
    yarnrcDiagnostics.updateDiagnostics(event.document);
  });

  const onDidClose = vscode.workspace.onDidCloseTextDocument((doc) => {
    npmrcDiagnostics.clearDiagnostics(doc);
    yarnrcDiagnostics.clearDiagnostics(doc);
  });

  // ── Register all disposables ──────────────────────────────────────────────

  context.subscriptions.push(
    // .npmrc
    npmrcHover,
    npmrcCompletion,
    npmrcDiagnostics,
    // .yarnrc.yml
    yarnrcHover,
    yarnrcCompletion,
    yarnrcDiagnostics,
    // document events
    onDidOpen,
    onDidChange,
    onDidClose,
  );
}

export function deactivate(): void {
  console.log('[npmrc-helper] Extension deactivated');
}
