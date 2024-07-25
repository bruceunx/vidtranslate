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
  transcripts: string;
  translate: string;
}

export interface ModelDetail {
  name: string;
  description: string;
  downloadLink: string;
  localPath: string;
}

export interface ModelState {
  currentWhisperModel: string;
  currentLlamaModel: string;
  whisper_models: ModelDetail[];
  llama_models: ModelDetail[];
}

export interface UpdateModel {
  model_type: 'WHISPER' | 'LLAMA';
  name: string;
  downloadLink: string;
}

export type ModelAction =
  | { type: 'UPDATE_MODEL'; payload: UpdateModel }
  | { type: 'SET_STATE'; payload: ModelState }
  | { type: 'SET_LLAMA_MODEL'; payload: string }
  | { type: 'SET_WHISPER_MODEL'; payload: string };
