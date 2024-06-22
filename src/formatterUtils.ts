//formatterUtils.ts
"use strict";

import * as vscode from "vscode";

let charIndent = " ";
let numberCharIndent = 2;

// Función para aplicar ediciones al documento
export const applyEdits = async (
  document: vscode.TextDocument,
  edits: vscode.TextEdit[]
) => {
  if (edits.length > 0) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    edits.forEach((edit) =>
      workspaceEdit.replace(document.uri, edit.range, edit.newText)
    );
    await vscode.workspace.applyEdit(workspaceEdit);
  }
};

// Actualizar configuraciones base
const updateConfigBase = () =>{
  const config = vscode.workspace.getConfiguration("FormatterObjectScript");
  numberCharIndent = config.get<number>("indentationSize", 0);
  const useSpaces = config.get<boolean>("useSpacesForIndentation", true);
  charIndent = useSpaces ? " " : "\t";
}
// Formatear una línea de código
const formatCodeInLine = (textLine: string): string => {
  if (!textLine) return textLine;

  let newTextLine  = textLine;
  //agrega espacios en logica
  newTextLine  = newTextLine .replace(
    /(elseif|if|else|try|for|switch)\s*\(\s*([^{]*)\s*\)/gi,
    "$1 ( $2 ) "
  );
  newTextLine  = newTextLine .replace(
    /(catch|while)\s*\(\s*([^{]*)\s*\)/gi, (match, p1, p2)=>{
      return `${p1} (${p2.trim()})`;
    }
  );
  newTextLine  = newTextLine .replace(/\}\s*(catch|elseif|else)\s*/gi, "} $1 ");
  newTextLine  = newTextLine .replace(/\s*(try)\s*\{/gi, "$1 {");
  //validar if quit:condition
  const pointCondition = textLine.match(/^[ \t]*(quit):(\s*([^\n]*)\s*)$/);
  const expectSpaceOperator = pointCondition ? "$1" : " $1 ";

  //modificar espacio en operadores
  newTextLine  = newTextLine .replace(
    /\s*(>=|<=|'=|>|<|=)\s*/gi,
    expectSpaceOperator
  );
  //separacion (a,b,    b   )=>(a, b, b)
  newTextLine  = newTextLine .replace(/(?<=\()([^)]+)(?=\))/g, (match) => {
    return match.replace(/\s*,\s*/g, ", ");
  });

  // Elimnar ;
  newTextLine  = newTextLine .replace(
    /^\s*((set|quit|write|do)[^\n;]*)[;\s]*$/gi,
    "$1"
  );
  // Eliminar espacios dobles y al final del renglón
  newTextLine  = newTextLine .replace(/\s{2,}/g, " ").replace(/\s+$/g, "");
  // Eliminar líneas que contienen solo espacios o tabs
  newTextLine  = newTextLine .replace(/^[ \t]+$/gm, "");
  return newTextLine ;
};

// Formatear base de una línea
const formatBaseLine = (textLine: string): string => {
  return textLine.replace(/^([^\n]*?)(?=\/\/|$)(\/\/.*)?$/, (match, code = "", comment1 = "") => {
    return formatCodeInLine(code) + comment1;
  });
};

// Formatear base de una línea
const getIndentationLevel = (textLine: string): number => {
  const textIdent = textLine.match(/^([ \t]*)/);
  if (!textIdent) {
    return 0;
  }
  const arrayIdent = textIdent[1].match(/([ \t])/g);
  if (!arrayIdent) {
    return 0;
  }
  return arrayIdent.length / numberCharIndent;
};

// Obtener texto indentado
const getTextIndent = (indentationLevel: number): string => {
  if (indentationLevel <= 0) {
    return "";
  }
  return charIndent.repeat(indentationLevel * numberCharIndent);
};

// Añadir indentación
const addIndentation = (
  textLine: string,
  indentationLevel: number = 0
): string => {
  if (!textLine) {
    return "";
  }

  return getTextIndent(indentationLevel) + textLine;
};

// Detectar XML
const detectXml = (text: string): [number, number] => {
  const OpenXmle = text.match(/(?!<!)<[^>\/]+>/g)?.length || 0;
  const CloseXmle = text.match(/<\/[^>]+>/g)?.length || 0;
  return [OpenXmle, CloseXmle];
}

// Detectar llaves
const detectBrace = (text: string): [number, number] => {
  const OpenBrace = text.match(/\{/g)?.length || 0;
  const CloseBrace = text.match(/\}/g)?.length || 0;
  return [OpenBrace, CloseBrace];
}

// Limpiar y formatear líneas del documento
const cleanAndFormatLines = (document: vscode.TextDocument): string[] => {
  const formattedLines: string[] = [];
  let insideXData = false;
  let insidetOff = false;
  let indentationLevel = -1;
  let oldTextCode = "";
  let commitOpen = false;

  const outTestCode = (text: string): string => {
    let textOut = "";
    if (!commitOpen) {
      const textWithoutComment1 = text.match(/^([^\n]*?)(?=\/\/|$)/)[0] ?? "";
      const textWithoutComment2 = textWithoutComment1.replace(/\/\*.*?\*\//gm, "");
      const textWithoutComment3 = textWithoutComment2.replace(/^(.*?)(?=\/\*)\/\*.*?$/, "$1");
      if (textWithoutComment3 != textWithoutComment2) {
        commitOpen = true;
      }
      textOut = textWithoutComment3;
    } else {
      const textWithoutComment1 = text.replace(/^.*?(?=\*\/)\*\/(.*?)$/gm, "$1");
      if (textWithoutComment1 != text) {
        commitOpen = false;
      }
      if (commitOpen) {
        textOut = "";
      } else {
        const textWithoutComment2 = textWithoutComment1.match(/^([^\n]*?)(?=\/\/|$)/)[0] ?? "";
        const textWithoutComment3 = textWithoutComment2.replace(/\/\*.*?\*\//gm, "");
        const textWithoutComment4 = textWithoutComment3.replace(/^(.*?)(?=\/\*)\/\*.*?$/, "$1");
        if (textWithoutComment3 != textWithoutComment4) {
          commitOpen = true;
        }
        textOut = textWithoutComment4;
      }
    }
    return textOut;
  }

  const calculateIndentation = (trimmedLine: string): void => {

    const [oldOpenXml, oldCloseXml] = insideXData ? detectXml(oldTextCode) : [0, 0];
    const [oldOpenBrace, oldCloseBrace] = detectBrace(oldTextCode);
    const oldNumberOpen = oldOpenBrace + oldOpenXml;
    const oldNumberClosed = oldCloseBrace + oldCloseXml;

    // Ajustar el nivel de indentación según las llaves de cierre
    if (oldNumberClosed && oldOpenXml && oldCloseXml) {
      indentationLevel = indentationLevel - 1;
    }

    if (oldNumberClosed > 1) {
      indentationLevel = indentationLevel - oldNumberClosed + 1;
    }

    // Ajustar el nivel de indentación según las llaves de apertura
    if (oldNumberOpen) {
      indentationLevel++;
    }

    if ((insideXData || insidetOff) && oldTextCode.match(/^}/)) {
      insideXData = false;
      insidetOff = false;
    }

    const textCode = outTestCode(trimmedLine);
    if (textCode.match(/^s*(XData)\s*MessageMap/)) {
      insideXData = true;
    } else if (textCode.match(/^s*(XData|Storage)\s+\w+/)) {
      insidetOff = true;
    }

    const [openXml, closeXml] = insideXData ? detectXml(textCode) : [0, 0];
    const [openBrace, closeBrace] = detectBrace(textCode);

    //const numberOpen = OpenBreak + OpenXdata;
    const numberClosed = closeBrace + closeXml;

    // Ajustar el nivel de indentación según las llaves de cierre
    if (numberClosed && !(openXml && closeXml)) {
      indentationLevel = indentationLevel - 1;
    }
    oldTextCode = textCode;
    //oldTextLine = trimmedLine;
  }

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const trimmedLine = line.text.trim();
    calculateIndentation(trimmedLine);
    const formattedLine = insideXData || insidetOff
      ? trimmedLine
      : formatBaseLine(trimmedLine);
    const indentedLine = addIndentation(formattedLine, insidetOff ? 0 :indentationLevel);

    formattedLines.push(indentedLine);
  }

  return formattedLines;
};

// Limpiar el código
const clearCode = (text: string): string => {
  let newText = text;

  //agregar saltos de liena cuando seencuentran }}
  newText = newText.replace(
    /^([ \t]*)([^\}\n]*?)(}}+)/gm,
    (match, p1, p2, p3) => {
      let text = p1 + p2;
      let indentationLevel = getIndentationLevel(p1);
      text = p3.split("").reduce((prev, dat, index) => {
        if (index == 0) {
          return prev + dat;
        }
        indentationLevel--;
        return prev + "\n" + getTextIndent(indentationLevel) + dat;
      }, text);
      return text;
    }
  );

  // Quitar saltos de liena después de {
  newText = newText.replace(/(\{)\n{2,}/g, "$1\n");

  // Quitar renglones vacíos antes de }
  newText = newText.replace(/\n{2,}(\s*\})/g, "\n$1");

  // Eliminar saltos de línea consecutivos si hay más de uno
  newText = newText.replace(/\n{3,}/g, "\n\n");

  // Eliminar saltos de línea dobles al final del documento, dejar solo uno
  newText = newText.replace(/\n{2,}$/g, "\n");

  return newText;
};

// Función para formatear un documento
export const formatDocument = (
  document: vscode.TextDocument
): vscode.TextEdit[] => {
  updateConfigBase();
  const edits: vscode.TextEdit[] = [];
  const lines = cleanAndFormatLines(document);
  let formattedText = lines.join("\n");

  // Agregar saltos de línea a los corchetes
  formattedText = formattedText.replace(/^([^\n\/\/]*\{)/gm, "$1\n");

  formattedText = clearCode(formattedText);

  // Reemplazar todo el contenido del documento con el texto formateado
  const lastLine = document.lineAt(document.lineCount - 1);
  const range = new vscode.Range(
    0,
    0,
    lastLine.range.end.line,
    lastLine.range.end.character
  );
  edits.push(vscode.TextEdit.replace(range, formattedText));

  return edits;
};
