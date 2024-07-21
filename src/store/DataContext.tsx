import * as React from 'react';
import {
  writeFile,
  readTextFile,
  exists,
  createDir,
  removeFile,
} from '@tauri-apps/api/fs';
import { appCacheDir } from '@tauri-apps/api/path';

import { Item, TextLine } from '../types';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Action {
  type:
    | 'SET_CURRENT_FILE'
    | 'SET_ITEMS'
    | 'ADD_ITEM'
    | 'DELETE_ITEM'
    | 'SET_IN_PROGRESS'
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
      updatedItems[updatedItems.length - 1].transcripts = action.payload;
      return { ...state, items: updatedItems };
    }
    default:
      return state;
  }
};

interface DataContextType {
  items: Item[];
  isInProgress: boolean;
  currentFile: string;
  setCurrentFile: (file: string | null) => void;
  insertItem: (item: Item | null) => void;
  deleteItem: (filaName: string | null) => void;
  updateItem: (textlines: TextLine[] | null) => void;
  updateProgress: (state: boolean | null) => void;
}

const DataContext = React.createContext<DataContextType>({
  items: [],
  isInProgress: false,
  currentFile: '',
  setCurrentFile: () => {},
  insertItem: () => {},
  updateItem: () => {},
  deleteItem: () => {},
  updateProgress: () => {},
});

const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [fileSignal, setFileSignal] = React.useState<boolean>(false);

  const [state, dispatch] = React.useReducer(reducer, initialState);
  const fileName = 'tempData.json';

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
    setFileSignal(true);
  };

  const deleteItem = async (fileName: string | null) => {
    if (fileName === null) return;

    const idx = state.items.findIndex((item) => item.filePath === fileName);
    if (idx !== -1) {
      const dir = await appCacheDir();
      const filePath = `${dir}${state.items[idx].transcripts}`;
      await removeFile(filePath);
    }
    dispatch({ type: 'DELETE_ITEM', payload: fileName });
    setFileSignal(true);
  };

  const updateProgress = (state: boolean | null) => {
    if (state === null) return;
    dispatch({ type: 'SET_IN_PROGRESS', payload: state });
  };

  const updateItem = async (textlines: TextLine[] | null) => {
    if (textlines === null) return;
    const filePath = await saveTranscriptsToJSON(textlines);
    dispatch({ type: 'UPDATE_ITEM', payload: filePath });
    setFileSignal(true);
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
    if (fileSignal) {
      updateFile();
      setFileSignal(false);
    }
  }, [fileSignal]);

  return (
    <DataContext.Provider
      value={{
        items: state.items,
        isInProgress: state.isInProgress,
        insertItem,
        deleteItem,
        updateItem,
        updateProgress,
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
