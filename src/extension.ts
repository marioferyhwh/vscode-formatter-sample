'use strict';

import * as vscode from 'vscode';
import { formatDocument, applyEdits } from './formatterUtils';

export function activate(context: vscode.ExtensionContext) {
  const LANGUAGE_ID = "objectscript";
  const COMMAND_FORMAT = "extension.formatObjectScript";

    
  // 👎 Formatter implemented as separate command
  vscode.commands.registerCommand(COMMAND_FORMAT, async() => {
    vscode.window.showInformationMessage("Evento " + COMMAND_FORMAT);
    const { activeTextEditor } = vscode.window;

    if (activeTextEditor) {
      const { document } = activeTextEditor;
      const edits = formatDocument(document);
      await applyEdits(document, edits);
      //await document.save();
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
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    vscode.window.showInformationMessage("Se detecta guardado");
    if (document.languageId !== LANGUAGE_ID && document.fileName.endsWith('.foo')) {
      //const edits = formatDocument(document);
      //await applyEdits(document, edits);
      //await document.save();
    }
  });
}

export function deactivate() {}
