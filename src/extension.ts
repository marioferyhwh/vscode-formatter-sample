'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const  LANGUAGE_ID="any-lang";
  const  COMMAND_FORMAT="extension.format-any";
    
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
    vscode.commands.registerCommand(COMMAND_FORMAT, () => {
        const {activeTextEditor} = vscode.window;

        if (activeTextEditor) {
            const { document } = activeTextEditor;
            const edits = formatDocument(document);
            applyEdits(document, edits);
        }
    });

    // 👍 formatter implemented using API
    vscode.languages.registerDocumentFormattingEditProvider(LANGUAGE_ID, {
      provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
        return formatDocument(document);
      }
  });



    // Escuchar el evento de guardado de documentos
    vscode.workspace.onDidSaveTextDocument(document => {

      vscode.window.showInformationMessage("0 commando");

      if (document.languageId !== LANGUAGE_ID &&  document.fileName.endsWith('.foo')) {
        vscode.window.showInformationMessage("2 commando");
        vscode.commands.executeCommand(COMMAND_FORMAT);
      }
  });
  
}



export function deactivate() {}

