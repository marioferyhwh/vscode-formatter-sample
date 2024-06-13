'use strict';

import * as vscode from 'vscode';
import { formatDocument, applyEdits } from './formatterUtils';

export function activate(context: vscode.ExtensionContext) {
  const LANGUAGE_ID = "any-lang";
  const COMMAND_FORMAT = "extension.format-any";
    
  // 👎 Formatter implemented as separate command
  vscode.commands.registerCommand(COMMAND_FORMAT, () => {
    vscode.window.showInformationMessage("Evento " + COMMAND_FORMAT);
    const { activeTextEditor } = vscode.window;

    if (activeTextEditor) {
      const { document } = activeTextEditor;
      const edits = formatDocument(document);
      applyEdits(document, edits);
    }
  });

  // 👍 Formatter implemented using API
  vscode.languages.registerDocumentFormattingEditProvider(LANGUAGE_ID, {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
      vscode.window.showInformationMessage("Formateador de " + LANGUAGE_ID);
      return formatDocument(document);
    }
  });

  // Escuchar el evento de guardado de documentos
  vscode.workspace.onDidSaveTextDocument(document => {
    vscode.window.showInformationMessage("Se detecta guardado");
    if (document.languageId !== LANGUAGE_ID && document.fileName.endsWith('.foo')) {
      //const edits = formatDocument(document);
      //applyEdits(document, edits);
    }
  });
}

export function deactivate() {}
