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
  let indentationLevel = 0;

  // Recorrer todas las líneas del documento
  for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const trimmedLine = line.text.trim();

      // Formatear la línea eliminando espacios dobles y espacios al final del renglón
      const formattedLine = trimmedLine.replace(/\s{2,}/g, ' ').replace(/\s+$/g, '');

      // Agregar la indentación adecuada
      formattedText += '\t'.repeat(indentationLevel) + formattedLine;

      // Determinar si la línea abre o cierra un bloque
      const openingBrace = /\{$/.test(trimmedLine);
      const closingBrace = /^\}$/.test(trimmedLine);

      // Ajustar el nivel de indentación según las llaves de apertura y cierre
      if (openingBrace) {
          indentationLevel++;
      } else if (closingBrace) {
          indentationLevel = Math.max(0, indentationLevel - 1);
      }

      // Agregar un salto de línea después de cada línea, excepto la última
      formattedText += '\n';
  }
  //\{|\(|\[
  //agregar saltos de linea a los corchetes
  formattedText = formattedText.replace(/(\{)/g, '$1\n');
  formattedText = formattedText.replace(/(\})/g, '\n$1\n');
  // las de solo espacios o tabs son limpiadas 
  formattedText = formattedText.replace(/^[ \t]+$/gm, '');
  //se quitan espacios vacios despues de las {
  formattedText = formattedText.replace(/(\{)\n{2,}/g, '$1\n');
  //se quitan renglones vaciona antes de }
  formattedText = formattedText.replace(/\n{2,}(\})/g, '\n\$1');
  // Eliminar saltos de línea consecutivos si hay más de uno
  formattedText = formattedText.replace(/\n{3,}/g, '\n\n');
  // elimina si hay mas de 2 saltos de linea al final
  formattedText = formattedText.replace(/\n{2,}$/g, '\n');

  // Reemplazar todo el contenido del documento con el texto formateado
  const lastLine = document.lineAt(document.lineCount - 1);
  const range = new vscode.Range(0, 0, lastLine.range.end.line, lastLine.range.end.character);
  edits.push(vscode.TextEdit.replace(range, formattedText));

  return edits;
};
