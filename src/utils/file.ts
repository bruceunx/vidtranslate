import { writeTextFile, readTextFile, exists } from '@tauri-apps/api/fs';
import { appDataDir, resourceDir, appCacheDir } from '@tauri-apps/api/path';
import { TextLine } from '../types';

interface CacheData {}

export const getAppDataDir = async (): Promise<string> => {
  const appDataDirPath = await appDataDir();
  const filePath = `${appDataDirPath}cache_data.json`;
  return filePath;
};

export function getFileTypeFromExtension(filePath: string): string {
  const index = filePath.lastIndexOf('.');
  const extension = filePath.slice(index + 1);
  switch (extension) {
    case 'mp4':
    case 'webm':
    case 'ogg':
    case 'wav':
    case 'mp3':
    case 'm4b':
    case 'm4a':
      return extension;
    default:
      return 'unknown';
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatTime(millis: number): string {
  const hours = Math.floor(millis / 3600000);
  millis %= 3600000;
  const minutes = Math.floor(millis / 60000);
  millis %= 60000;
  const seconds = Math.floor(millis / 1000);
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

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

export async function getResourceDir(): Promise<string> {
  const dir = await resourceDir();
  return dir;
}

export function getFileName(filePath: string): string {
  const lastSlashIndex = filePath.lastIndexOf('/');
  return filePath.substring(lastSlashIndex + 1);
}

export function getFileTitle(filePath: string): string {
  if (filePath === '') return '';
  const fileName = getFileName(filePath);
  const index = fileName.lastIndexOf('.');
  return fileName.slice(0, index);
}

export function isAudioFile(filePath: string): boolean {
  const fileType = getFileTypeFromExtension(filePath);
  return ['mp3', 'm4b', 'wav', 'ogg', 'm4a'].includes(fileType);
}

export async function readTranscript(fileName: string): Promise<TextLine[]> {
  try {
    const dir = await appCacheDir();
    const filePath = `${dir}${fileName}`;
    const fileExists = await exists(filePath);
    if (!fileExists) return [];
    const fileData = await readTextFile(filePath);
    const parsedData = JSON.parse(fileData);
    return parsedData as TextLine[];
  } catch (error) {
    console.log('err', error);
    return [];
  }
}

function millisToTimestamp(millis: number): string {
  const hours = Math.floor(millis / 3600000);
  millis %= 3600000;
  const minutes = Math.floor(millis / 60000);
  millis %= 60000;
  const seconds = Math.floor(millis / 1000);
  millis %= 1000;

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedMillis = String(millis).padStart(3, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMillis}`;
}

function formatSubtitlesAsSRT(subtitles: TextLine[]): string {
  return subtitles
    .map((subtitle, index) => {
      return `${index + 1}\n${millisToTimestamp(subtitle.time_start)} --> ${millisToTimestamp(subtitle.time_end)}\n${subtitle.text_str}\n`;
    })
    .join('\n');
}

function formatSubtitlesAsVTT(subtitles: TextLine[]): string {
  const vttContent = 'WEBVTT\n\n';
  return (
    vttContent +
    subtitles
      .map((subtitle) => {
        return `${millisToTimestamp(subtitle.time_start)} --> ${millisToTimestamp(subtitle.time_end)}\n${subtitle.text_str}\n`;
      })
      .join('\n')
  );
}

export async function saveToFile(
  filePath: string,
  subtitles: TextLine[]
): Promise<void> {
  const index = filePath.lastIndexOf('.');
  let content = '';
  if (filePath.slice(index + 1) === 'srt') {
    content = formatSubtitlesAsSRT(subtitles);
  } else if (filePath.slice(index + 1) === 'vtt') {
    content = formatSubtitlesAsVTT(subtitles);
  }
  try {
    await writeTextFile(filePath, content);
  } catch (e) {
    console.error(e);
  }
}
