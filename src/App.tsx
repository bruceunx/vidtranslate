import * as React from 'react';
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { appWindow } from '@tauri-apps/api/window';

import { AiOutlinePlus, AiOutlineSetting } from 'react-icons/ai';
import {
  HiEllipsisHorizontal,
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
import { formatTime, getFileTypeFromExtension } from './utils/file';

function App() {
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const [isPlay, setIsPlay] = React.useState<boolean>(false);
  const [showRightSider, setShowRightSider] = React.useState<boolean>(true);
  const [videoDuration, setVideoDuration] = React.useState<number>(0);
  const [currentLocation, setCurrentLocation] = React.useState<number>(0);
  const [progress, setProgress] = React.useState<number>(0);

  const [videoPath, setVideoPath] = React.useState<string>('');
  const [rawPath, setRawPath] = React.useState<string>('');

  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleFileChange = async () => {
    const file = await open({
      filters: [
        {
          name: 'Media Files',
          extensions: ['mp4', 'webm', 'ogg', 'mp3', 'wav'],
        },
      ],
    });
    if (typeof file === 'string') {
      if (getFileTypeFromExtension(file) === 'webm') {
        setVideoPath('');
        setRawPath(file);
      } else {
        setRawPath('');
        setVideoPath(convertFileSrc(file));
      }
    }
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
            setVideoDuration(Math.floor(videoRef.current?.duration || 0));
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
    const handleMetadataLoaded = () => {
      setVideoDuration(Math.floor(videoRef.current?.duration || 0));
      setProgress(0);
      setIsPlay(false);
    };
    if (videoRef.current && videoPath !== '') {
      videoRef.current.addEventListener('loadedmetadata', handleMetadataLoaded);
      videoRef.current.src = videoPath;
      videoRef.current.load();
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener(
          'loadedmetadata',
          handleMetadataLoaded
        );
      }
    };
  }, [videoPath]);

  React.useEffect(() => {
    const handleTimeUpdate = () => {
      setProgress(Math.floor(videoRef.current?.currentTime || 0));
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
          setVideoPath(convertFileSrc(filePath));
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

  function handleVideoProgress(value: number): void {
    if (videoDuration == 0) {
      setCurrentLocation(0);
    } else {
      setCurrentLocation(value);
    }
  }

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.floor(
        (videoDuration * currentLocation) / 100
      );
      setProgress(Math.floor(videoRef.current?.currentTime || 0));
    }
  }, [currentLocation]);

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
              <button onClick={handleFileChange} className="hover:text-white">
                <AiOutlinePlus />
              </button>
              <button className="hover:text-white">
                <AiOutlineSetting />
              </button>
            </div>
          </div>
          <div className="flex flex-col px-2 py-1 h-full">
            {/* Scroll Area Radix-UI */}
            <p>list</p>
          </div>
          <div className="flex w-full p-3 justify-between text-sm px-2">
            <LangDetect />
            <button>
              <HiEllipsisHorizontal />
            </button>
          </div>
        </div>
        {/* content area */}
        <div className="flex flex-col justify-stretch w-full h-full">
          <div
            data-tauri-drag-region
            className="flex flex-row bg-custome-gray-dark h-10 text-white justify-end items-center px-3"
          >
            <div className="space-x-2">
              <button onClick={toggleRightSider}>
                {showRightSider ? (
                  <HiMiniArrowRightOnRectangle />
                ) : (
                  <HiMiniArrowLeftOnRectangle />
                )}
              </button>
              <button>
                <HiEllipsisHorizontal />
              </button>
            </div>
          </div>
          <div
            className={`flex flex-row justify-stretch ${isDragging ? 'bg-blue-700/70' : 'bg-custome-gray-dark'} text-white pl-3 h-full`}
          >
            <div className="flex flex-col w-full justify-between h-full pr-3">
              <div className="h-full">
                <Video ref={videoRef} videopath={videoPath} />
                <p className="text-2xl font-bold py-3">title</p>
                <p>direction window</p>
              </div>
              <div className="flex flex-col items-center justify-center h-20">
                <NSlider
                  value={
                    videoDuration === 0
                      ? 0
                      : Math.floor((progress / videoDuration) * 100)
                  }
                  onChange={handleVideoProgress}
                />
                <div className="flex justify-between w-full h-fit">
                  <button
                    className="hover:text-gray-400"
                    onClick={togglePlay}
                    disabled={videoPath === '' && rawPath === ''}
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
                <Transcript />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
