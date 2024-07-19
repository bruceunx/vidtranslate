export type TextLine = {
  time_start: number;
  time_end: number;
  text_str: string;
};

export interface Transcript {
  startTime: number;
  endTime: number;
  text: string;
}

export interface Item {
  filaName: string;
  timeLength: number;
  transcripts: Transcript[];
}
