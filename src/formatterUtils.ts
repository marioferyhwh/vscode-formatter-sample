import * as vscode from 'vscode';

// Función para aplicar ediciones al documento
export const applyEdits = (document: vscode.TextDocument, edits: vscode.TextEdit[]) => {
  if (edits.length > 0) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    edits.forEach(edit => workspaceEdit.replace(document.uri, edit.range, edit.newText));
    vscode.workspace.applyEdit(workspaceEdit);
  }
};

// Función para formatear un documento
export const formatDocument = (document: vscode.TextDocument): vscode.TextEdit[] => {
  const edits: vscode.TextEdit[] = [];
  let formattedText = '';

  // Recorrer todas las líneas del documento
  for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const trimmedLine = line.text.trim();

      // Formatear la línea eliminando espacios dobles y espacios al final del renglón
      const formattedLine = trimmedLine.replace(/\s{2,}/g, ' ').replace(/\s+$/g, '');
      

      // Agregar espacios al final del documento
      formattedText += formattedLine + (i < document.lineCount - 1 ? '\n\n' : '\n');
  }

  formattedText = formattedText.replace(/\{/g, '{\n');
  // Eliminar saltos de línea consecutivos si hay más de uno
  formattedText = formattedText.replace(/\n{3,}/g, '\n\n');

  // Reemplazar todo el contenido del documento con el texto formateado
  const lastLine = document.lineAt(document.lineCount - 1);
  const range = new vscode.Range(0, 0, lastLine.range.end.line, lastLine.range.end.character);
  edits.push(vscode.TextEdit.replace(range, formattedText));

  return edits;
};
