import * as React from 'react';
import { invoke } from '@tauri-apps/api';

export function useMediaMetadata() {
  const [videoDuration, setVideoDuration] = React.useState<number>(0);

  const loadMediaMetadata = async (file: string): Promise<number> => {
    const info: string = await invoke('run_ffprobe', { file_path: file });
    const timeInfo = parseInt(info) * 1000;
    setVideoDuration(timeInfo);
    return timeInfo;
  };

  return {
    videoDuration,
    loadMediaMetadata,
    setVideoDuration,
  };
}
