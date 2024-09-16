import * as React from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import {
  writeFile,
  readTextFile,
  exists,
  createDir,
  removeFile,
} from '@tauri-apps/api/fs';
import { appCacheDir } from '@tauri-apps/api/path';

import { Item, TextLine } from '../types';
import { useSettingData } from './SettingContext';
import { transformString } from '../utils/transript';
import { readTranscript } from '../utils/file';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Action {
  type:
    | 'SET_CURRENT_FILE'
    | 'SET_ITEMS'
    | 'ADD_ITEM'
    | 'DELETE_ITEM'
    | 'SET_IN_PROGRESS'
    | 'UPDATE_TRANS_ITEM'
    | 'UPDATE_ITEM';
  payload?: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface State {
  currentFile: string;
  isInProgress: boolean;
  items: Item[];
}

const initialState: State = {
  currentFile: '',
  isInProgress: false,
  items: [],
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.payload };
    case 'SET_IN_PROGRESS':
      return { ...state, isInProgress: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.filePath !== action.payload),
      };
    case 'UPDATE_ITEM': {
      const updatedItems = [...state.items];
      const newItems = updatedItems.map((item) => {
        if (item.filePath === state.currentFile) {
          item.transcripts = action.payload;
        }
        return item;
      });
      return { ...state, items: newItems };
    }
    case 'UPDATE_TRANS_ITEM': {
      const updatedItems = [...state.items];
      const newItems = updatedItems.map((item) => {
        if (item.filePath === state.currentFile) {
          item.translate = action.payload;
        }
        return item;
      });
      return { ...state, items: newItems };
    }
    default:
      return state;
  }
};

interface DataContextType {
  items: Item[];
  lines: TextLine[];
  translateLines: TextLine[];
  currentLine: string;
  isInProgress: boolean;
  currentFile: string;
  setCurrentFile: (file: string | null) => void;
  insertItem: (item: Item | null) => void;
  deleteItem: (filaName: string | null) => void;
  updateItem: (textlines: TextLine[] | null) => void;
  updateTranslateFile: (textlines: TextLine[] | null) => void;
  updateProgress: (state: boolean | null) => void;
  setLang: (lang: string) => void;
  handleWhisper: (file: string) => void;
  handleTranslate: (lang: string) => void;
  setLines: React.Dispatch<React.SetStateAction<TextLine[]>>;
  setCurrentLine: React.Dispatch<React.SetStateAction<string>>;
  textType: string;
  setTextType: React.Dispatch<React.SetStateAction<string>>;
  stopWhisper: () => void;
  stopLlama: () => void;
  clearTranscripts: () => void;
}

const DataContext = React.createContext<DataContextType>({
  items: [],
  lines: [],
  translateLines: [],
  currentLine: '',
  textType: 'transcript',
  isInProgress: false,
  currentFile: '',
  setCurrentFile: () => {},
  insertItem: () => {},
  updateItem: () => {},
  updateTranslateFile: () => {},
  deleteItem: () => {},
  updateProgress: () => {},
  setLang: () => {},
  handleWhisper: () => {},
  handleTranslate: () => {},
  setLines: () => {},
  setCurrentLine: () => {},
  stopWhisper: () => {},
  stopLlama: () => {},
  clearTranscripts: () => {},
  setTextType: () => {},
});

const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const fileName = 'tempData.json';
  const { state: settingState } = useSettingData();
  const [lang, setLang] = React.useState<string>('auto');
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const [textType, setTextType] = React.useState<string>('transcript');
  const [lines, setLines] = React.useState<TextLine[]>([]);
  const [translateLines, setTranslateLines] = React.useState<TextLine[]>([]);
  const [currentLine, setCurrentLine] = React.useState<string>('');
  const hasMounted = React.useRef(false);

  const stopWhisper = async () => {
    await invoke('stop_whisper');
    updateProgress(false);
  };

  const stopLlama = async () => {
    await invoke('stop_llama');
    updateProgress(false);
  };

  const clearTranscripts = async () => {
    dispatch({ type: 'UPDATE_ITEM', payload: '' });
    setLines([]);
    await handleWhisper(state.currentFile);
  };

  const handleTranslate = async (lang: string) => {
    updateProgress(true);
    if (settingState.currentLlamaModel === '') return;
    const models = settingState.llama_models.filter(
      (model) => model.name === settingState.currentLlamaModel
    );
    if (models.length == 0) return;
    const modelPath = models[0].localPath;
    try {
      await invoke('run_llama_stream', {
        lines: lines,
        model_path: modelPath,
        target_lang: lang,
      });
    } catch (error) {
      console.error('Error starting sidecar:', error);
      return;
    }

    let line: TextLine;
    const newLines = [];
    do {
      line = await invoke('get_llama_txt');
      if (line.text_str === 'end') break;
      if (line.text_str === 'start') {
        setTranslateLines([]);
        setCurrentLine(line?.text_str || '');
        continue;
      }
      setTranslateLines((prev) => [...prev, line]);
      newLines.push(line);
    } while (line);

    updateTranslateFile(newLines);
    updateProgress(false);
  };

  const handleWhisper = async (file: string) => {
    updateProgress(true);
    if (settingState.currentWhisperModel === '') return;
    const models = settingState.whisper_models.filter(
      (model) => model.name === settingState.currentWhisperModel
    );
    if (models.length === 0) return;
    const modelPath = models[0].localPath;

    const run_ffmpeg_info: string = await invoke('run_ffmpeg', {
      file_path: file,
    });
    const newLines = [];
    if (run_ffmpeg_info === 'ok') {
      await invoke('run_whisper', { model_path: modelPath, lang: lang });
      let line: string;
      let id = 0;
      do {
        line = await invoke('get_whisper_txt');
        if (line === 'end') break;
        if (id === 0 && line === 'start') {
          id += 1;
          continue;
        }
        const line_text = transformString(line);
        if (id === 0) setCurrentLine(line_text?.text_str || '');
        if (line_text !== null) {
          setLines((prev) => [...prev, line_text]);
          newLines.push(line_text);
        }
        id += 1;
      } while (line);
    }
    if (newLines.length > 0) updateItem(newLines);
    updateProgress(false);
  };

  const updateFile = async () => {
    const dir = await appCacheDir();
    const filePath = `${dir}${fileName}`;
    await writeFile({ path: filePath, contents: JSON.stringify(state.items) });
  };

  const saveTranscriptsToJSON = async (
    textlines: TextLine[]
  ): Promise<string> => {
    const now = new Date();
    const fileName = now.getTime().toString();
    const dir = await appCacheDir();
    const filePath = `${dir}${fileName}`;
    await writeFile({ path: filePath, contents: JSON.stringify(textlines) });

    return fileName;
  };

  const insertItem = (item: Item | null) => {
    if (item === null) return;
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const deleteItem = async (fileName: string | null) => {
    if (fileName === null) return;

    const idx = state.items.findIndex((item) => item.filePath === fileName);
    if (idx !== -1) {
      const dir = await appCacheDir();
      const filePath = `${dir}${state.items[idx].transcripts}`;
      const isFile = await exists(filePath);
      if (isFile) await removeFile(filePath);
      const translatePath = `${dir}${state.items[idx].translate}`;
      const _isFile = await exists(translatePath);
      if (_isFile) await removeFile(translatePath);
    }
    dispatch({ type: 'DELETE_ITEM', payload: fileName });
  };

  const updateProgress = (state: boolean | null) => {
    if (state === null) return;
    dispatch({ type: 'SET_IN_PROGRESS', payload: state });
  };

  const updateItem = async (textlines: TextLine[] | null) => {
    if (textlines === null) return;
    const filePath = await saveTranscriptsToJSON(textlines);
    dispatch({ type: 'UPDATE_ITEM', payload: filePath });
  };

  const updateTranslateFile = async (textlines: TextLine[] | null) => {
    if (textlines === null) return;
    const filePath = await saveTranscriptsToJSON(textlines);
    dispatch({ type: 'UPDATE_TRANS_ITEM', payload: filePath });
  };

  const loadItems = async () => {
    try {
      const dir = await appCacheDir();
      const filePath = `${dir}${fileName}`;
      const fileExists = await exists(filePath);
      if (!fileExists) return;
      const fileData = await readTextFile(filePath);
      const parsedData = JSON.parse(fileData);
      dispatch({ type: 'SET_ITEMS', payload: parsedData });
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const cacheDir = await appCacheDir();
      const isExists = await exists(cacheDir);
      if (!isExists) await createDir(cacheDir);
      await loadItems();
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    updateFile();
  }, [state]);

  React.useEffect(() => {
    const handleCurrentFile = async (item: Item) => {
      const _lines = await readTranscript(item.transcripts);
      if (_lines.length > 0) {
        setLines(_lines);
        const _translateLines = await readTranscript(item.translate);
        if (_translateLines.length > 0) {
          setTranslateLines(_translateLines);
        }
      } else {
        handleWhisper(item.filePath);
      }
    };
    setLines([]);
    setCurrentLine('');
    setTranslateLines([]);
    const item = state.items.find((obj) => obj.filePath === state.currentFile);
    if (item) {
      setTextType('transcript');
      handleCurrentFile(item);
    }
  }, [state.currentFile]);

  return (
    <DataContext.Provider
      value={{
        items: state.items,
        isInProgress: state.isInProgress,
        lines,
        translateLines,
        currentLine,
        textType,
        setTextType,
        insertItem,
        deleteItem,
        updateItem,
        updateProgress,
        updateTranslateFile,
        setLines,
        setCurrentLine,
        setLang,
        handleWhisper,
        handleTranslate,
        stopWhisper,
        stopLlama,
        clearTranscripts,
        currentFile: state.currentFile,
        setCurrentFile: (file: string | null) =>
          dispatch({ type: 'SET_CURRENT_FILE', payload: file }),
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => React.useContext(DataContext);

export default DataProvider;
