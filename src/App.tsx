import * as React from 'react';
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';
import { open, save } from '@tauri-apps/api/dialog';
import { appWindow } from '@tauri-apps/api/window';

import { AiOutlinePlus, AiOutlineMinus, AiOutlineSave } from 'react-icons/ai';
import {
  HiMiniArrowLeftOnRectangle,
  HiMiniArrowRightOnRectangle,
  HiMiniPlay,
  HiMiniPause,
} from 'react-icons/hi2';

import './styles.css';
import LangDetect from './components/LangDetect';
import NSlider from './components/Slider';
import Transcript from './components/Transcript';

import Video from './components/Video';
import {
  formatTime,
  getFileName,
  getFileTitle,
  getFileTypeFromExtension,
  isAudioFile,
  saveToFile,
} from './utils/file';
import VideoText from './components/VideoText';
import VidoItems from './components/VideoItems';
import { useData } from './store/DataContext';
import AudioLines from './components/AudioLines';
import Settings from './components/Setting';
import { useMediaMetadata } from './hooks/useMediaMetadata';

function App() {
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [isPlay, setIsPlay] = React.useState<boolean>(false);
  const [showRightSider, setShowRightSider] = React.useState<boolean>(true);

  const [currentLocation, setCurrentLocation] = React.useState<number>(0);
  const [progress, setProgress] = React.useState<number>(0);

  const [videoPath, setVideoPath] = React.useState<string>('');
  const [rawPath, setRawPath] = React.useState<string>('');

  const videoRef = React.useRef<HTMLVideoElement>(null);

  const { videoDuration, loadMediaMetadata, setVideoDuration } =
    useMediaMetadata();

  const {
    items,
    lines,
    currentLine,
    isInProgress,
    insertItem,
    setLang,
    handleWhisper,
    setCurrentLine,
    setCurrentFile,
    currentFile,
    deleteItem,
    textType,
    translateLines,
  } = useData();

  const onSaveTranscripts = async () => {
    const filePath = await save({
      filters: [
        {
          name: 'sample',
          extensions: ['srt', 'vtt'],
        },
      ],
    });
    if (filePath) {
      await saveToFile(filePath, lines);
    }
  };

  const handleInsertItem = async (
    file: string,
    fileName: string,
    duration: number
  ) => {
    const index = fileName.lastIndexOf('.');
    const fileTitle = fileName.slice(0, index);
    const fileFormat = fileName.slice(index + 1);
    const item = {
      filePath: file,
      fileName: fileTitle,
      fileFormat: fileFormat,
      timeLength: duration,
      transcripts: '',
      translate: '',
    };
    insertItem(item);
  };

  const transformVideo = async (file: string, fileName: string) => {
    const timeInfo = await loadMediaMetadata(file);
    handleInsertItem(file, fileName, timeInfo);
    handleWhisper(file);
  };

  const handleMediaLoad = async (file: string) => {
    if (getFileTypeFromExtension(file) === 'webm') {
      setVideoPath('');
      setRawPath(file);
    } else {
      setRawPath('');
      setVideoPath(convertFileSrc(file));
    }
  };

  const handleNewFile = async (file: string) => {
    const alreadyExist = items.some((item) => item.filePath === file);
    if (alreadyExist) {
      setCurrentFile(file);
      return;
    }
    const fileName = getFileName(file);
    setCurrentFile(file);
    setProgress(0);
    setIsPlay(false);

    handleMediaLoad(file);

    await transformVideo(file, fileName);
  };

  const handleDeleteItem = () => {
    deleteItem(currentFile);
    setCurrentFile('');
  };

  const handleFileChange = async () => {
    const file = await open({
      multiple: false,
      filters: [
        {
          name: 'Media Files',
          extensions: ['mp4', 'webm', 'ogg', 'mp3', 'wav', 'mov', 'm4b'],
        },
      ],
    });
    if (typeof file === 'string') handleNewFile(file);
  };

  const togglePlay = () => {
    setIsPlay((prev) => !prev);
  };

  React.useEffect(() => {
    if (isPlay) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, [isPlay]);

  const toggleRightSider = () => {
    setShowRightSider((prev) => !prev);
  };

  const fetchVideoChunk = async (): Promise<Uint8Array> => {
    const chunk: number[] = await invoke('get_video_chunk');
    return new Uint8Array(chunk);
  };

  function handleVideoProgress(value: number): void {
    if (videoDuration == 0) {
      setCurrentLocation(0);
    } else {
      setCurrentLocation(value);
    }
  }

  React.useEffect(() => {
    const loadVideo = async () => {
      const videoElement = videoRef.current;
      if (videoElement === null) return;
      await invoke('start_video_stream', {
        offset: 0,
        file_path: rawPath,
      });
      const mediaSource = new MediaSource();
      videoElement.src = URL.createObjectURL(mediaSource);
      mediaSource.addEventListener('sourceopen', async () => {
        const mimeCodec = 'video/webm';
        const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
        async function appendNextChunk() {
          try {
            const chunk = await fetchVideoChunk();
            if (chunk.length > 0) {
              sourceBuffer.appendBuffer(chunk);
            } else {
              mediaSource.endOfStream();
            }
          } catch (error) {
            return;
          }
        }
        sourceBuffer.addEventListener('updateend', appendNextChunk);
        appendNextChunk();
      });
    };

    if (rawPath !== '') loadVideo();
  }, [rawPath]);

  React.useEffect(() => {
    if (videoRef.current && videoPath !== '') {
      videoRef.current.src = videoPath;
      videoRef.current.load();
      setProgress(0);
      setIsPlay(false);
    }
  }, [videoPath]);

  React.useEffect(() => {
    const handleTimeUpdate = () => {
      setProgress(Math.floor(1000 * (videoRef.current?.currentTime || 0)));
    };
    if (isPlay) {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.addEventListener('timeupdate', handleTimeUpdate);
      }
      return () => {
        if (videoElement) {
          videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
    }
  }, [isPlay]);

  React.useEffect(() => {
    const unlisten = appWindow.onFileDropEvent((event) => {
      switch (event.payload.type) {
        case 'drop': {
          setIsDragging(false);
          const filePath = event.payload.paths[0];
          handleNewFile(filePath);
          break;
        }
        case 'hover':
          setIsDragging(true);
          break;
        case 'cancel':
          setIsDragging(false);
          break;
      }
    });
    return () => {
      unlisten.then((off) => off());
    };
  }, []);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.floor(
        (videoDuration * currentLocation) / 100000
      );
      setProgress(Math.floor(1000 * (videoRef.current?.currentTime || 0)));
    }
  }, [currentLocation]);

  React.useEffect(() => {
    const _lines = textType === 'transcript' ? lines : translateLines;
    if (_lines.length === 0) return;
    const targetIndex = _lines.findIndex(
      (obj) => obj.time_start <= progress && obj.time_end >= progress
    );
    if (targetIndex === -1) return;

    let current = _lines[targetIndex].text_str;
    if (
      targetIndex < _lines.length - 1 &&
      lines[targetIndex + 1].time_start === progress
    ) {
      current += _lines[targetIndex + 1].text_str;
    }
    setCurrentLine(current);
  }, [progress]);

  React.useEffect(() => {
    if (currentFile === '') {
      setVideoPath('');
      setRawPath('');
      setProgress(0);
      setVideoDuration(0);
      if (videoRef.current) {
        videoRef.current.src = '';
        videoRef.current?.load();
      }
    } else {
      const item = items.find((obj) => obj.filePath === currentFile);
      if (item) {
        loadMediaMetadata(item.filePath);
        handleMediaLoad(item.filePath);
        setProgress(0);
        setIsPlay(false);
      }
    }
  }, [currentFile]);

  return (
    <>
      <div className="flex w-full h-screen">
        {/* menu area */}
        <div className="flex flex-col w-64 h-full bg-custome-gray-light text-white justify-stretch">
          <div className="w-full text-gray-300 h-8">
            <div
              data-tauri-drag-region
              className="flex flex-row justify-end items-center py-2 pr-1 space-x-3 text-gray-400"
            >
              {!isInProgress && (
                <button onClick={handleFileChange} className="hover:text-white">
                  <AiOutlinePlus />
                </button>
              )}
              {currentFile && !isInProgress && (
                <button onClick={handleDeleteItem} className="hover:text-white">
                  <AiOutlineMinus />
                </button>
              )}
              <Settings />
            </div>
          </div>
          <div className="flex flex-col px-2 py-1 h-full">
            <VidoItems items={items} />
          </div>
          <div className="flex w-full justify-center border-t border-t-gray-700 text-sm p-2">
            <LangDetect setLang={setLang} />
          </div>
        </div>
        {/* content area */}
        <div className="flex flex-col justify-stretch w-full h-full">
          <div
            data-tauri-drag-region
            className="flex flex-row bg-custome-gray-dark h-10 text-white justify-between items-center px-3"
          >
            <p className="font-bold text-gray-300">
              {getFileTitle(currentFile)}
            </p>
            <div className="space-x-2">
              {lines.length > 0 && (
                <button onClick={onSaveTranscripts}>
                  <AiOutlineSave />
                </button>
              )}
              <button onClick={toggleRightSider}>
                {showRightSider ? (
                  <HiMiniArrowRightOnRectangle />
                ) : (
                  <HiMiniArrowLeftOnRectangle />
                )}
              </button>
            </div>
          </div>
          <div
            className={`flex flex-row justify-stretch ${isDragging ? 'bg-blue-700/70' : 'bg-custome-gray-dark'} text-white pl-3 h-full`}
          >
            <div className="flex flex-col w-full justify-between h-full pr-3">
              <div className="h-full">
                <Video ref={videoRef} videopath={videoPath} />
                {currentFile && isAudioFile(currentFile) ? (
                  <AudioLines
                    progress={progress}
                    lines={textType === 'transcript' ? lines : translateLines}
                  />
                ) : (
                  <VideoText subtitles={currentLine} />
                )}
              </div>
              <div className="flex flex-col items-center justify-center h-20">
                <NSlider
                  value={
                    videoDuration === 0
                      ? 0
                      : Math.floor((progress / videoDuration) * 100)
                  }
                  onChange={handleVideoProgress}
                  disabled={
                    (videoPath === '' && rawPath === '') || isInProgress
                  }
                />
                <div className="flex justify-between w-full h-fit">
                  <button
                    className="hover:text-gray-400"
                    onClick={togglePlay}
                    disabled={
                      (videoPath === '' && rawPath === '') || isInProgress
                    }
                  >
                    {isPlay ? (
                      <HiMiniPause className="h-7 w-7" />
                    ) : (
                      <HiMiniPlay className="h-7 w-7" />
                    )}
                  </button>
                  <p className="text-sm">
                    {formatTime(progress)}/{formatTime(videoDuration)}
                  </p>
                </div>
              </div>
            </div>
            {showRightSider && (
              <div className="flex flex-col w-full bg-custome-gray-dark">
                <Transcript progress={progress} duration={videoDuration} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
