import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';
import { appDataDir } from '@tauri-apps/api/path';

interface CacheData {}

export const getAppDataDir = async (): Promise<string> => {
  const appDataDirPath = await appDataDir();
  const filePath = `${appDataDirPath}cache_data.json`;
  return filePath;
};

export function getFileTypeFromExtension(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'mp4':
    case 'webm':
    case 'ogg':
    case 'wav':
    case 'mp3':
      return extension;
    default:
      return 'unknown';
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  if (hours === 0) {
    return `${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
}

export async function saveCacheData(data: CacheData): Promise<void> {
  try {
    const filePath = 'cache_data.json';

    const jsonData = JSON.stringify(data);

    await writeTextFile(filePath, jsonData);

    console.log('Cache data saved successfully');
  } catch (error) {
    console.error('Error saving cache data:', error);
  }
}

export async function readCacheData(): Promise<CacheData | null> {
  try {
    const filePath = 'cache_data.json';
    const jsonData = await readTextFile(filePath);
    const data = JSON.parse(jsonData);
    console.log('Cache data loaded:', data);
    return data;
  } catch (error) {
    console.error('Error reading cache data:', error);
    return null;
  }
}
