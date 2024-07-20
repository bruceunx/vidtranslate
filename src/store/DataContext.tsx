import * as React from 'react';
import { writeFile, readTextFile, exists, createDir } from '@tauri-apps/api/fs';
import { appCacheDir } from '@tauri-apps/api/path';

import { Item, TextLine } from '../types';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Action {
  type:
    | 'SET_CURRENT_FILE'
    | 'SET_ITEMS'
    | 'ADD_ITEM'
    | 'DELETE_ITEM'
    | 'UPDATE_ITEM';
  payload?: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface State {
  currentFile: string | null;
  items: Item[];
}

const initialState: State = {
  currentFile: null,
  items: [],
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.fileName !== action.payload),
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
  currentFile: string | null;
  setCurrentFile: (file: string | null) => void;
  insertItem: (item: Item | null) => void;
  deleteItem: (filaName: string | null) => void;
  updateItem: (textlines: TextLine[] | null) => void;
}

const DataContext = React.createContext<DataContextType>({
  items: [],
  currentFile: null,
  setCurrentFile: () => {},
  insertItem: () => {},
  updateItem: () => {},
  deleteItem: () => {},
});

const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const fileName = 'tempData.json';

  const updateFile = async () => {
    const dir = await appCacheDir();
    const filePath = `${dir}${fileName}`;
    await writeFile({ path: filePath, contents: JSON.stringify(state.items) });
  };

  const insertItem = async (item: Item | null) => {
    if (item === null) return;
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const deleteItem = async (fileName: string | null) => {
    if (fileName === null) return;
    dispatch({ type: 'DELETE_ITEM', payload: fileName });
  };

  const updateItem = async (textlines: TextLine[] | null) => {
    if (textlines === null) return;
    dispatch({ type: 'UPDATE_ITEM', payload: textlines });
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
    if (state.items.length > 0) {
      updateFile();
    }
  }, [state.items]);

  return (
    <DataContext.Provider
      value={{
        items: state.items,
        insertItem,
        deleteItem,
        updateItem,
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
