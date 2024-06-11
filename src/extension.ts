'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

  
    // Función para formatear un documento
    const formatDocument = (document: vscode.TextDocument): vscode.TextEdit[] => {
      const edits: vscode.TextEdit[] = [];

      for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);
          const trimmedLine = line.text.trim();

          // Detectar y formatear 'if' statements
          if (trimmedLine.startsWith('if(') && trimmedLine.endsWith('){')) {
              const formattedText = line.text.replace(/if\s*\(\s*(.*)\s*\)\s*{/, 'if ( $1 ) {');
              edits.push(vscode.TextEdit.replace(line.range, formattedText));
          }
      }

      return edits;
    };

    // Función para aplicar ediciones al documento
    const applyEdits = (document: vscode.TextDocument, edits: vscode.TextEdit[]) => {
      if (edits.length > 0) {
          const workspaceEdit = new vscode.WorkspaceEdit();
          edits.forEach(edit => workspaceEdit.replace(document.uri, edit.range, edit.newText));
          vscode.workspace.applyEdit(workspaceEdit);
      }
    };
    // 👎 formatter implemented as separate command
    vscode.commands.registerCommand('extension.format-any', () => {
        const {activeTextEditor} = vscode.window;

        if (activeTextEditor) {
            const { document } = activeTextEditor;
            const edits = formatDocument(document);
            applyEdits(document, edits);
        }
    });

    // 👍 formatter implemented using API
    vscode.languages.registerDocumentFormattingEditProvider('any-lang', {
      provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
        return formatDocument(document);
      }
  });



    // Escuchar el evento de guardado de documentos
    vscode.workspace.onDidSaveTextDocument(document => {

      vscode.window.showInformationMessage("0 commando");

      if (document.languageId !== 'any-lang' &&  document.fileName.endsWith('.foo')) {
        vscode.window.showInformationMessage("2 commando");
        vscode.commands.executeCommand('extension.format-any');
      }
  });
  
}



export function deactivate() {}

