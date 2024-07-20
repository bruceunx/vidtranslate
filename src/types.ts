export type TextLine = {
  time_start: number;
  time_end: number;
  text_str: string;
};

export interface Item {
  filePath: string;
  fileName: string;
  fileFormat: string;
  timeLength: number;
  transcripts: TextLine[];
}
