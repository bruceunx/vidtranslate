import * as React from 'react';
import { HiMiniLanguage } from 'react-icons/hi2';
import LangChose from './LangChose';
import { TextLine } from '../types';
import { invoke } from '@tauri-apps/api';
import { UnlistenFn, listen } from '@tauri-apps/api/event';
import { useData } from '../store/DataContext';
import { Item } from '../types';
import { readTranscript } from '../utils/file';
import TextCards from './TextCards';

interface TranslateProps {
  lines: TextLine[];
  translatedLines: TextLine[];
  setTranslatedLines: (lines: TextLine[]) => void;
}

interface DataStream {
  index: number;
  output: string;
}

const Translate = ({
  lines,
  translatedLines,
  setTranslatedLines,
}: TranslateProps) => {
  const { items, currentFile } = useData();
  const [language, setLanguage] = React.useState<string>('en');

  const handleTranslate = async () => {
    setTranslatedLines([]);
    const data = lines.map((line) => `<2${language}>${line.text_str}`);
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
        const data = event.payload as DataStream;
        const idx = data.index;
        setTranslatedLines([
          ...translatedLines,
          {
            text_str: data.output,
            time_start: lines[idx].time_start,
            time_end: lines[idx].time_end,
          },
        ]);
      });
    };
    if (lines) {
      initListen();
    }
    return () => {
      if (unlisten) {
        unlisten();
        console.log('Stopped listening for events');
      }
    };
  }, [lines]);

  React.useEffect(() => {
    const stop_llama = async () => {
      await invoke('stop_llama', {});
    };
    stop_llama();
  }, []);

  React.useEffect(() => {
    const handleCurrentFile = async (item: Item) => {
      if (item.translate === '') return;
      const _lines = await readTranscript(item.translate);
      if (_lines.length > 0) {
        setTranslatedLines(_lines);
      }
    };
    if (currentFile === '') return;
    const item = items.find((obj) => obj.filePath === currentFile);
    if (item) {
      handleCurrentFile(item);
      console.log(item);
    }
  }, [currentFile]);

  return (
    <>
      <div className="flex space-x-3">
        <LangChose setLanguage={setLanguage} />
        <button
          className="border border-gray-700 p-2 rounded-md hover:bg-gray-700 active:text-gray-400"
          onClick={handleTranslate}
          disabled={lines.length === 0}
        >
          <HiMiniLanguage className="h-5 w-5" />
        </button>
        <button>save</button>
      </div>

      <div>
        <TextCards lines={translatedLines} progress={0} />
      </div>
    </>
  );
};

export default Translate;
