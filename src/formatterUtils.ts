
import * as vscode from 'vscode';
// Función para formatear un documento
export  const formatDocument = (document: vscode.TextDocument): vscode.TextEdit[] => {
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
export  const applyEdits = (document: vscode.TextDocument, edits: vscode.TextEdit[]) => {
  if (edits.length > 0) {
      const workspaceEdit = new vscode.WorkspaceEdit();
      edits.forEach(edit => workspaceEdit.replace(document.uri, edit.range, edit.newText));
      vscode.workspace.applyEdit(workspaceEdit);
  }
};