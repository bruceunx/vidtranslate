import * as React from 'react';
import { writeFile, readTextFile } from '@tauri-apps/api/fs';
import { appCacheDir } from '@tauri-apps/api/path';

import { Item } from '../types';

interface DataContextType {
  items: Item[];
  insertItem: (item: Item) => void;
  deleteItem: (filaName: string) => void;
}

const DataContext = React.createContext<DataContextType | undefined>(undefined);

const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = React.useState<Item[]>([]);
  const fileName = 'tempData.json';

  const insertItem = async (item: Item) => {
    try {
      const dir = await appCacheDir();
      const filePath = `${dir}${fileName}`;
      const newItems = [...items, item];
      await writeFile({ path: filePath, contents: JSON.stringify(newItems) });
      setItems(newItems);
      console.log('filePath', filePath);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const deleteItem = async (filaName: string) => {
    try {
      const dir = await appCacheDir();
      const filePath = `${dir}${fileName}`;
      const newItems = items.filter((item) => item.filaName !== filaName);
      await writeFile({ path: filePath, contents: JSON.stringify(newItems) });
      setItems(newItems);
    } catch (error) {
      console.log('Error deleting data:', error);
    }
  };

  const loadItems = async () => {
    try {
      const dir = await appCacheDir();
      const filePath = `${dir}${fileName}`;
      const fileData = await readTextFile(filePath);
      const parsedData = JSON.parse(fileData);
      setItems(parsedData);
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      await loadItems();
    };
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ items, insertItem, deleteItem }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => React.useContext(DataContext);

export default DataProvider;
