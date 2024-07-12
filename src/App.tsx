import * as React from 'react';
import { invoke } from '@tauri-apps/api/tauri';
// import { listen } from '@tauri-apps/api/event';
// import { open } from '@tauri-apps/api/dialog';
// import { platform } from '@tauri-apps/api/os';

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

// type Message = {
//   event: string;
//   payload: {
//     message: string;
//   };
// };

function App() {
  const [isPlay, setIsPlay] = React.useState<boolean>(false);
  const [showRightSider, setShowRightSider] = React.useState<boolean>(true);
  const [videoDuration, setVideoDuration] = React.useState<number>(0);
  const [currentLocation, setCurrentLocation] = React.useState<number>(0);
  const [progress, setProgress] = React.useState<number>(0);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    setIsPlay((prev) => !prev);
  };

  const toggleRightSider = () => {
    greet();
    setShowRightSider((prev) => !prev);
  };

  async function greet() {
    const value = await invoke('func2');
    console.log(value);
  }

  React.useEffect(() => {
    if (isPlay) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, [isPlay]);

  React.useEffect(() => {
    const handleMetadataLoaded = () => {
      setVideoDuration(videoRef.current?.duration || 0);
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', handleMetadataLoaded);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener(
          'loadedmetadata',
          handleMetadataLoaded
        );
      }
    };
  }, []);

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

  // async function greet() {
  //   await invoke('async_stream', { name_str: name });
  //   const selected = await open({
  //     multiple: true,
  //     filters: [
  //       {
  //         name: 'Image',
  //         extensions: ['png', 'jpeg'],
  //       },
  //     ],
  //   });
  //   console.log(selected);
  // }

  // useEffect(() => {
  //   (async () => {
  //     const platformInfo = await platform();
  //     console.log(platformInfo);
  //   })();
  //
  //   listen('greet', (e: Message) => {
  //     const message = e.payload.message;
  //     if (message === 'stop') {
  //       setEnable(true);
  //     } else {
  //       setEnable(false);
  //       setGreetMsg(message);
  //     }
  //   });
  // }, []);

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  function handleVideoProgress(value: number): void {
    if (videoDuration == 0) {
      setCurrentLocation(0);
    } else {
      setCurrentLocation(value);
    }
  }

  React.useEffect(() => {
    console.log(videoDuration, currentLocation);
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
        <div className="flex flex-col w-64 h-full bg-gray-950/90 text-white justify-stretch">
          <div className="w-full bg-black/95 text-gray-300 h-8">
            <div
              data-tauri-drag-region
              className="flex flex-row justify-end items-center py-2 pr-1 space-x-3 text-gray-400"
            >
              <button>
                <AiOutlinePlus />
              </button>
              <button>
                <AiOutlineSetting />
              </button>
            </div>
          </div>
          <div className="flex flex-col px-2 py-1 h-full">
            {/* Scroll Area Radix-UI */}
            <p>list</p>
          </div>
          <div className="flex w-full p-3 border-t border-gray-700 justify-between text-sm px-2">
            <LangDetect />
            <button>
              <HiEllipsisHorizontal />
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-stretch w-full h-full border-l border-gray-700">
          <div
            data-tauri-drag-region
            className="flex flex-row bg-black/95 h-8 text-white justify-between items-center px-3 border-b border-gray-700"
          >
            <p className="">title</p>
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
          <div className="flex flex-row justify-stretch bg-gray-950/95 text-white h-full pl-3">
            <div className="flex flex-col w-full justify-stretch h-full pr-3">
              <div className="h-full">
                <Video ref={videoRef} />
                <p>direction window</p>
              </div>
              <div className="flex flex-col items-center justify-center h-20">
                <NSlider
                  value={Math.floor((progress / videoDuration) * 100)}
                  onChange={handleVideoProgress}
                />
                <div className="flex justify-between w-full h-fit">
                  <button className="hover:text-gray-400" onClick={togglePlay}>
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
              <div className="flex flex-col w-full bg-gray-900 border-l border-gray-700">
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
