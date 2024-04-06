// import { useEffect } from 'react';
// import { invoke } from '@tauri-apps/api/tauri';
// import { listen } from '@tauri-apps/api/event';
// import { open } from '@tauri-apps/api/dialog';
// import { platform } from '@tauri-apps/api/os';

import { AiOutlinePlus, AiOutlineSetting } from 'react-icons/ai';
import {
  HiEllipsisHorizontal,
  HiMiniArrowLeftOnRectangle,
} from 'react-icons/hi2';

import './styles.css';
import LangDetect from './components/LangDetect';

// type Message = {
//   event: string;
//   payload: {
//     message: string;
//   };
// };

function App() {
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

  return (
    <>
      <div className="flex w-full h-screen">
        <div className="flex flex-col w-64 h-full bg-gray-950/90 text-white justify-stretch">
          <div className="w-full bg-black/95 text-gray-300 h-8">
            <div
              data-tauri-drag-region
              className="flex flex-row justify-end items-center py-2 pr-1 space-x-2"
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
            <p>list</p>
          </div>
          <div className="flex w-full p-2 border-t border-gray-700 justify-between text-sm px-2">
            <LangDetect />
            <button>
              <HiEllipsisHorizontal />
            </button>
          </div>
        </div>
        <div className="w-full h-full border-l border-gray-500">
          <div
            data-tauri-drag-region
            className="flex flex-row bg-black/95 h-8 text-white justify-between items-center px-3 border-b border-gray-500"
          >
            <p className="">title</p>
            <div className="space-x-2">
              <button>
                <HiMiniArrowLeftOnRectangle />
              </button>
              <button>
                <HiEllipsisHorizontal />
              </button>
            </div>
          </div>
          <p>main window</p>
          <p>direction window</p>
        </div>
      </div>
    </>
  );
}

export default App;
