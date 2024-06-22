//extension.ts
"use strict";

import * as vscode from "vscode";
import { formatDocument, applyEdits } from "./formatterUtils";

export function activate(context: vscode.ExtensionContext) {
  const LANGUAGE_ID = "objectscript-class";
  const COMMAND_FORMAT = "extension.formatObjectScript";

  const executeFormatter = async (document: vscode.TextDocument) => {
    vscode.window.showInformationMessage("executeFormatter");
    const edits = formatDocument(document);
    await applyEdits(document, edits);
    await document.save();
  }
  // 👎 Formatter implemented as separate command
  vscode.commands.registerCommand(COMMAND_FORMAT, async () => {
    vscode.window.showInformationMessage("Evento " + COMMAND_FORMAT);
    const { activeTextEditor } = vscode.window;

    if (activeTextEditor) {
      const { document } = activeTextEditor;
      await executeFormatter(document);
    }
  });

  // 👍 Formatter implemented using API
  vscode.languages.registerDocumentFormattingEditProvider(LANGUAGE_ID, {
    provideDocumentFormattingEdits(
      document: vscode.TextDocument
    ): vscode.TextEdit[] {
      vscode.window.showInformationMessage("Formateador de " + LANGUAGE_ID);
      return formatDocument(document);
    },
  });

  // Escuchar el evento de guardado de documentos
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    const config = vscode.workspace.getConfiguration("FormatterObjectScript");
    const formattingOnSave = config.get<boolean>("enableFormattingOnSave", true);
    const supportedExtensions = config.get<string[]>("supportedExtensionsOnSave", []);
    const fileExtension = document.fileName.split('.').pop();
    const validExtension = fileExtension && supportedExtensions.includes(`.${fileExtension}`)
    
    vscode.window.showInformationMessage("Se detecta guardado");
    if (formattingOnSave && (document.languageId == LANGUAGE_ID || validExtension)) {
      await executeFormatter(document);
    }
  });
}

export function deactivate() { }
