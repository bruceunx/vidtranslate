import * as React from 'react';
import { HiMiniLanguage } from 'react-icons/hi2';
import LangChose from './LangChose';
import { TextLine } from '../types';
import { invoke } from '@tauri-apps/api';
import { UnlistenFn, listen } from '@tauri-apps/api/event';

interface TranslateProps {
  lines: TextLine[];
}

const Translate = ({ lines }: TranslateProps) => {
  const handleTranslate = async () => {
    const data = lines.map((line) => `<2en>${line.text_str}`);
    try {
      await invoke('run_llama', {
        lines: data,
        use_model_str: '/Volumes/space/Download/madlad400-3b-mt-q4_0.gguf',
      });
    } catch (error) {
      console.error('Error starting sidecar:', error);
    }
  };

  React.useEffect(() => {
    let unlisten: UnlistenFn;
    const initListen = async () => {
      unlisten = await listen('data_stream', (event) => {
        console.log('Received data:', event.payload);
      });
    };
    initListen();
    return () => {
      if (unlisten) {
        unlisten();
        console.log('Stopped listening for events');
      }
    };
  }, []);

  return (
    <div className="flex space-x-3">
      <LangChose />
      <button
        className="border border-gray-700 p-2 rounded-md hover:bg-gray-700 active:text-gray-400"
        onClick={handleTranslate}
        disabled={lines.length === 0}
      >
        <HiMiniLanguage className="h-5 w-5" />
      </button>
      <button>save</button>
    </div>
  );
};

export default Translate;
