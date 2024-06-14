
import * as vscode from 'vscode';

// Función para aplicar ediciones al documento
export const applyEdits = (document: vscode.TextDocument, edits: vscode.TextEdit[]) => {
  if (edits.length > 0) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    edits.forEach(edit => workspaceEdit.replace(document.uri, edit.range, edit.newText));
    vscode.workspace.applyEdit(workspaceEdit);
  }
}

//(\/\/.*$|\/\*(.|\n)*?\*\/)
const formaBaseLine = (textLine: string):string =>{
  let nuwTextLine = textLine;
  //agrega espacios en logica
  nuwTextLine = nuwTextLine.replace(/(if|else|elseif|try|catch|while|for|switch)\s*\(\s*([^{]*)\s*\)\s*/gi, '$1 ( $2 ) ');
  nuwTextLine = nuwTextLine.replace(/\}\s*(catch|else|elseif)\s*/gi, '} $1 ');
  nuwTextLine = nuwTextLine.replace(/\s*(try)\s*\{/gi, '$1 {');
  //agrega espacio en operadores
  nuwTextLine = nuwTextLine.replace(/\s*(>=|<=|'=|>|<|=)\s*/ig, ' $1 ');
  //separacionde (a,b,    b   )=>(a, b, b)
  nuwTextLine = nuwTextLine.replace(/(?<=\()([^)]+)(?=\))/g, (match) => {
    return match.replace(/\s*,\s*/g, ", ");
  });

  // Eliminar espacios dobles y al final del renglón
  nuwTextLine = nuwTextLine.replace(/\s{2,}/g, ' ').replace(/\s+$/g, '');
  // Eliminar líneas que contienen solo espacios o tabs
  nuwTextLine = nuwTextLine.replace(/^[ \t]+$/gm, '');
  return nuwTextLine;
}

const addIdentado = (textLine: string,indentationLevel :number = 0):string =>{
  if (!textLine){
    return ""
  }
  return '\t'.repeat(indentationLevel) + textLine;
}

// Función para limpiar y formatear las líneas del documento
const cleanAndFormatLines = (document: vscode.TextDocument): string[] => {
  const formattedLines: string[] = [];

  let indentationLevel = 0;

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const trimmedLine = line.text.trim();

    const formattedLine = formaBaseLine(trimmedLine);

    // Ajustar el nivel de indentación según las llaves de cierre
    if (/\}/.test(trimmedLine)) {
      indentationLevel = Math.max(0, indentationLevel - 1);
    }

    // Ajustar la indentación adecuada
    const indentedLine = addIdentado(formattedLine,indentationLevel);

    // Ajustar el nivel de indentación según las llaves de apertura
    if (/\{$/.test(trimmedLine)) {
      indentationLevel++;
    }

    formattedLines.push(indentedLine);
  }
  
  return formattedLines;
}

const  clearCode =  (text: string):string =>{
  let nuwText = text;

  //([ \t]*)(.*)}}+
  //corregir }}
  //^([ \t])*([^\}\n]*)\s*(}}+)
  nuwText = nuwText.replace(/^([ \t]*)([^\}\n]*?)(}}+)/gm,(match, p1, p2, p3) => {
    let text = p1 + p2;
    let space = p1;
    text = p3.split('').reduce( (prev,dat,index)=>{
      if (index == 0){
        return  prev + dat;
      }
      space = space.slice(0, -1);
      return prev +"\n"+space+dat;
    },text)
    return text;
  });

  // Quitar saltos de liena después de {
  nuwText = nuwText.replace(/(\{)\n{2,}/g, '$1\n');

  // Quitar renglones vacíos antes de }
  nuwText = nuwText.replace(/\n{2,}(\s*\})/g, '\n$1');

  // Eliminar saltos de línea consecutivos si hay más de uno
  nuwText = nuwText.replace(/\n{3,}/g, '\n\n');

  // Eliminar saltos de línea dobles al final del documento, dejar solo uno
  nuwText = nuwText.replace(/\n{2,}$/g, '\n');

  return nuwText;
}

// Función para formatear un documento
export const formatDocument = (document: vscode.TextDocument): vscode.TextEdit[] => {
  const edits: vscode.TextEdit[] = [];

  let formattedText = cleanAndFormatLines(document).join('\n');

  //\{|\(|\[
  // Agregar saltos de línea a los corchetes
  formattedText = formattedText.replace(/(\{)/g, '$1\n')//.replace(/(\s*\})/g, '\n$1\n');

  formattedText = clearCode(formattedText);

  // Reemplazar todo el contenido del documento con el texto formateado
  const lastLine = document.lineAt(document.lineCount - 1);
  const range = new vscode.Range(0, 0, lastLine.range.end.line, lastLine.range.end.character);
  edits.push(vscode.TextEdit.replace(range, formattedText));

  return edits;
};
