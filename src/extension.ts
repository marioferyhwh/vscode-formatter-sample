'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    // 👎 formatter implemented as separate command
    vscode.commands.registerCommand('extension.format-foo', () => {
        const {activeTextEditor} = vscode.window;

        if (activeTextEditor && activeTextEditor.document.languageId === 'foo-lang') {
            const {document} = activeTextEditor;
            const firstLine = document.lineAt(0);
            if (firstLine.text !== '42') {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(document.uri, firstLine.range.start, '42\n');
                return vscode.workspace.applyEdit(edit)
            }
        }
    });

    // 👍 formatter implemented using API
    vscode.languages.registerDocumentFormattingEditProvider('foo-lang', {
      provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
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
      }
  });



    // Escuchar el evento de guardado de documentos
    vscode.workspace.onDidSaveTextDocument(document => {

      vscode.window.showInformationMessage("0 commando");
      if (document.languageId === 'foo-lang') {
        vscode.window.showInformationMessage("1 commando");
          vscode.commands.executeCommand('editor.action.formatDocument');
      } 
      if (document.fileName.endsWith('.foo')) {
        vscode.window.showInformationMessage("2 commando");
        vscode.commands.executeCommand('editor.action.formatDocument');
      }
  });
}



export function deactivate() {}

