import * as React from 'react';
import { ModelAction, ModelState, UpdateModel } from '../types';
import { appDataDir } from '@tauri-apps/api/path';
import { createDir, exists, readTextFile, writeFile } from '@tauri-apps/api/fs';

const initialState: ModelState = {
  currentWhisperModel: 'Large Model',
  currentLlamaModel: 'Madlab Model 3B',
  whisper_models: [
    {
      name: 'Medium Model',
      description: 'Medium quality model supports multi-languages',
      downloadLink:
        'https://ggml.ggerganov.com/ggml-model-whisper-medium-q5_0.bin',
      localPath:
        '/Volumes/space/projects/rust/llama-rust-desktop/src-tauri/resources/models/large.bin',
    },
    {
      name: 'Large Model',
      description: 'Medium quality model supports multi-languages',
      downloadLink:
        'https://ggml.ggerganov.com/ggml-model-whisper-large-q5_0.bin',
      localPath:
        '/Volumes/space/projects/rust/llama-rust-desktop/src-tauri/resources/models/medium.bin',
    },
  ],
  llama_models: [
    {
      name: 'Madlab Model 3B',
      description: 'Medium quality translation model supports multi-languages',
      downloadLink:
        'https://huggingface.co/notjjustnumbers/madlad400-3b-mt-Q4_K_M-GGUF/resolve/main/madlad400-3b-mt-q4_k_m.gguf?download=true',
      localPath:
        '/Volumes/space/projects/rust/llama-rust-desktop/src-tauri/resources/models/llama-model.gguf',
    },
  ],
};

const reducer = (state: ModelState, action: ModelAction): ModelState => {
  switch (action.type) {
    case 'UPDATE_MODEL': {
      switch (action.payload.model_type) {
        case 'WHISPER': {
          const whisper_models = state.whisper_models.map((model) =>
            model.name === action.payload.name
              ? { ...model, downloadLink: action.payload.downloadLink }
              : model
          );
          return { ...state, whisper_models: whisper_models };
        }
        case 'LLAMA': {
          const llama_models = state.llama_models.map((model) =>
            model.name === action.payload.name
              ? { ...model, downloadLink: action.payload.downloadLink }
              : model
          );
          return { ...state, llama_models: llama_models };
        }
        default:
          return state;
      }
    }
    case 'SET_STATE':
      return action.payload;
    case 'SET_LLAMA_MODEL': {
      return { ...state, currentLlamaModel: action.payload };
    }
    case 'SET_WHISPER_MODEL':
      return { ...state, currentWhisperModel: action.payload };
    default:
      return state;
  }
};

interface SettingContextType {
  state: ModelState;
  updateModel: (model: UpdateModel) => void;
  setWhisperModel: (modelName: string) => void;
  setLlamaModel: (modelName: string) => void;
}
const SettingContext = React.createContext<SettingContextType>({
  state: initialState,
  updateModel: (model: UpdateModel) => {
    console.log(model);
  },
  setWhisperModel: (modelPath: string) => {
    console.log(modelPath);
  },
  setLlamaModel: (modelPath: string) => {
    console.log(modelPath);
  },
});

const SettingProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const fileName = 'setting.json';

  const updateFile = async () => {
    const dir = await appDataDir();
    const filePath = `${dir}${fileName}`;
    await writeFile({ path: filePath, contents: JSON.stringify(state) });
  };

  const updateModel = (model: UpdateModel) => {
    dispatch({ type: 'UPDATE_MODEL', payload: model });
    updateFile();
  };

  const setWhisperModel = (modelName: string) => {
    dispatch({ type: 'SET_WHISPER_MODEL', payload: modelName });
    updateFile();
  };

  const setLlamaModel = (modelName: string) => {
    dispatch({ type: 'SET_LLAMA_MODEL', payload: modelName });
    updateFile();
  };

  const loadItems = async () => {
    const dir = await appDataDir();
    const filePath = `${dir}${fileName}`;
    const fileExists = await exists(filePath);
    if (!fileExists) {
      await updateFile();
      return;
    }
    const fileData = await readTextFile(filePath);
    const parsedData = JSON.parse(fileData);
    dispatch({ type: 'SET_STATE', payload: parsedData });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const dir = await appDataDir();
      const isExists = await exists(dir);
      if (!isExists) await createDir(dir);
      await loadItems();
    };
    fetchData();
  }, []);

  return (
    <SettingContext.Provider
      value={{
        state,
        updateModel,
        setLlamaModel,
        setWhisperModel,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
};

export const useSettingData = () => React.useContext(SettingContext);

export default SettingProvider;
