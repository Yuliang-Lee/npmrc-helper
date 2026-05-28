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
import {
  PnpmWorkspaceHoverProvider,
  PnpmWorkspaceCompletionProvider,
  PnpmWorkspaceDiagnosticsProvider,
} from './pnpmWorkspaceProviders';

export function activate(context: vscode.ExtensionContext): void {
  console.log('[npmrc-helper] Extension activated');

  // ── .npmrc (npm & pnpm sensitive auth/registry/proxy/SSL) ─────────────────

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

  // ── pnpm-workspace.yaml (pnpm v11+ non-sensitive settings & workspace) ────

  const pnpmWorkspaceDiagnostics = new PnpmWorkspaceDiagnosticsProvider();

  // Register against both our custom language id and the built-in `yaml`
  // language id (the file may be associated to either, depending on whether
  // the user has the YAML extension installed).
  const pnpmWorkspaceSelectors: vscode.DocumentSelector = [
    { language: 'pnpm-workspace' },
    { language: 'yaml', pattern: '**/pnpm-workspace.{yml,yaml}' },
  ];

  const pnpmWorkspaceHover = vscode.languages.registerHoverProvider(
    pnpmWorkspaceSelectors,
    new PnpmWorkspaceHoverProvider()
  );

  const pnpmWorkspaceCompletion = vscode.languages.registerCompletionItemProvider(
    pnpmWorkspaceSelectors,
    new PnpmWorkspaceCompletionProvider(),
    ':' // trigger on `:` for value completions
  );

  // ── Diagnostics: run on open / change / close ─────────────────────────────

  const refreshAll = (doc: vscode.TextDocument): void => {
    npmrcDiagnostics.updateDiagnostics(doc);
    yarnrcDiagnostics.updateDiagnostics(doc);
    pnpmWorkspaceDiagnostics.updateDiagnostics(doc);
  };

  if (vscode.window.activeTextEditor) {
    refreshAll(vscode.window.activeTextEditor.document);
  }

  const onDidOpen = vscode.workspace.onDidOpenTextDocument((doc) => {
    refreshAll(doc);
  });

  const onDidChange = vscode.workspace.onDidChangeTextDocument((event) => {
    refreshAll(event.document);
  });

  const onDidClose = vscode.workspace.onDidCloseTextDocument((doc) => {
    npmrcDiagnostics.clearDiagnostics(doc);
    yarnrcDiagnostics.clearDiagnostics(doc);
    pnpmWorkspaceDiagnostics.clearDiagnostics(doc);
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
    // pnpm-workspace.yaml
    pnpmWorkspaceHover,
    pnpmWorkspaceCompletion,
    pnpmWorkspaceDiagnostics,
    // document events
    onDidOpen,
    onDidChange,
    onDidClose,
  );
}

export function deactivate(): void {
  console.log('[npmrc-helper] Extension deactivated');
}
