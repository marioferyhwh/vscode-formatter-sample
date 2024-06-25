//FormatterState.ts

export interface FormatterState {
  insideXData: boolean;
  insideOff: boolean;
  indentationLevel: number;
  oldTextCode: string;
  commitOpen: boolean;
}