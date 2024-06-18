
import * as vscode from 'vscode';


let charIdent=" "
let numberCharIdent=2

// Función para aplicar ediciones al documento
export const applyEdits = (document: vscode.TextDocument, edits: vscode.TextEdit[]) => {
  if (edits.length > 0) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    edits.forEach(edit => workspaceEdit.replace(document.uri, edit.range, edit.newText));
    vscode.workspace.applyEdit(workspaceEdit);
  }
}

function UpdateConfigBase(){
  
  // Obtener configuraciones de usuario
  const config = vscode.workspace.getConfiguration('formatterSample');
  numberCharIdent = config.get<number>('indentationSize', 2);
  const indentationType = config.get<string>('indentationType', 'space');
  if (indentationType == "space"){
    charIdent = " ";
  }else{
    charIdent = "\t";
  }
  //vscode.window.showInformationMessage("size:" + numberCharIdent +" indentationType:"+indentationType);
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



const getIdentationLevel = (textLine: string):number => {
  const textIdent = textLine.match(/^([ \t]*)/);
  if (!textIdent) {
    return 0;
  }
  const arrayIdent = textIdent[1].match(/([ \t])/g);
  if (!arrayIdent){
    return 0;
  }
  return arrayIdent.length/numberCharIdent;
}

const getTextIdent = (indentationLevel:number):string =>{
  if (indentationLevel <= 0){
    return "";
  }
  return charIdent.repeat(indentationLevel*numberCharIdent);
}

const addIdentado = (textLine: string,indentationLevel :number = 0):string =>{
  if (!textLine){
    return "";
  }

  return getTextIdent(indentationLevel) + textLine;
}

// Función para limpiar y formatear las líneas del documento
const cleanAndFormatLines = (document: vscode.TextDocument): string[] => {
  const formattedLines: string[] = [];
  let insideXData = false;
  let indentationLevel = -1;

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const trimmedLine = line.text.trim();

    if (trimmedLine.match(/^XData\s+\w+/)) {
      insideXData = true;
      //open <[^>\/]+>
      //close <\/[^>]+>
    }
    
    let OpenXdata = 0;
    let CloseXdata = 0;
    if (insideXData){
      OpenXdata = trimmedLine.match(/<[^>\/]+>/g)?.length || 0;
      CloseXdata = trimmedLine.match(/<\/[^>]+>/g)?.length || 0;
    }
    let OpenBreak = trimmedLine.match(/\{/g)?.length || 0;
    let CloseBreak = trimmedLine.match(/\}/g)?.length || 0;
    
    const numberOpen = OpenBreak + OpenXdata;
    const numberClosed = CloseBreak + CloseXdata;

    const formattedLine = insideXData ? trimmedLine : formaBaseLine(trimmedLine);

    // Ajustar el nivel de indentación según las llaves de cierre
    if (numberClosed && !(OpenXdata && CloseXdata)) {
      indentationLevel = indentationLevel - 1;
    }

    // Ajustar la indentación adecuada
    const indentedLine = addIdentado(formattedLine,indentationLevel);

    
    // Ajustar el nivel de indentación según las llaves de cierre
    if (numberClosed && (OpenXdata && CloseXdata)) {
      indentationLevel = indentationLevel - 1;
    }

    if (numberClosed > 1) {
      indentationLevel = indentationLevel - numberClosed + 1;
    }

    // Ajustar el nivel de indentación según las llaves de apertura
    if (numberOpen) {
      indentationLevel++;
    }
    
    if (insideXData && trimmedLine.match(/^}/)) {
      insideXData = false;
    }

    formattedLines.push(indentedLine);
  }
  
  return formattedLines;
}

const  clearCode =  (text: string):string =>{
  let nuwText = text;

  //([ \t]*)(.*)}}+
  //agregar saltos de liena cuando seencuentran }}
  //^([ \t])*([^\}\n]*)\s*(}}+)
  nuwText = nuwText.replace(/^([ \t]*)([^\}\n]*?)(}}+)/gm,(match, p1, p2, p3) => {
    let text = p1 + p2;
    let identationLevel = getIdentationLevel(p1)
    text = p3.split('').reduce( (prev,dat,index)=>{
      if (index == 0){
        return  prev + dat;
      }
      identationLevel--;
      return prev +"\n"+getTextIdent(identationLevel)+dat;
    },text);
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
  UpdateConfigBase();
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
