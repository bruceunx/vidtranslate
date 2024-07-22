import * as React from 'react';
import { HiMiniLanguage, HiOutlinePauseCircle } from 'react-icons/hi2';
import LangChose from './LangChose';
import { TextLine } from '../types';
import { invoke } from '@tauri-apps/api';
import { useData } from '../store/DataContext';
import { Item } from '../types';
import { readTranscript } from '../utils/file';
import TextCards from './TextCards';
import Spinner from './Spinner';
import ProgressBar from './ProgressBar';

interface TranslateProps {
  lines: TextLine[];
  progress: number;
  translatedLines: TextLine[];
  setTranslatedLines: (lines: TextLine[]) => void;
}

const Translate = ({
  lines,
  progress,
  translatedLines,
  setTranslatedLines,
}: TranslateProps) => {
  const {
    isInProgress,
    updateProgress,
    items,
    currentFile,
    updateTranslateFile,
  } = useData();
  const [language, setLanguage] = React.useState<string>('en');
  // const [translatedLines, setTranslatedLines] = React.useState<TextLine[]>([]);

  const [transformProgress, setTransformProgress] = React.useState(0);

  const handleStop = async () => {
    await invoke('stop_llama', {});
    updateProgress(false);
  };

  const handleTranslate = async () => {
    updateProgress(true);
    const data = lines.map((line) => `<2${language}>${line.text_str}`);
    try {
      await invoke('run_llama', {
        lines: data,
        use_model_str: '/Volumes/space/Download/madlad400-3b-mt-q4_0.gguf',
      });
    } catch (error) {
      console.error('Error starting sidecar:', error);
      return;
    }

    let line = 'start';
    let id = 0;
    const newLines = [];
    while (line) {
      line = await invoke('get_llama_txt');
      if (line === 'end') break;
      if (id === 0 && line === 'start') {
        id === 0;
        setTranslatedLines([]);
        continue;
      }
      const newLine = {
        time_start: lines[id].time_start,
        time_end: lines[id].time_end,
        text_str: line,
      };
      setTranslatedLines((pre) => [...pre, newLine]);
      id += 1;
      newLines.push(newLine);
    }
    updateTranslateFile(newLines);
    updateProgress(false);
  };

  React.useEffect(() => {
    const handleCurrentFile = async (item: Item) => {
      if (item.translate === '') return;
      const _lines = await readTranscript(item.translate);
      if (_lines.length > 0) {
        setTranslatedLines(_lines);
      }
    };
    if (currentFile === '') {
      setTranslatedLines([]);
      return;
    }
    const item = items.find((obj) => obj.filePath === currentFile);
    if (item) {
      handleCurrentFile(item);
    }
  }, [currentFile]);

  React.useEffect(() => {
    setTransformProgress((translatedLines.length / lines.length) * 100);
  }, [translatedLines]);

  return (
    <>
      <div className="flex space-x-2 mb-1">
        <LangChose setLanguage={setLanguage} />
        {isInProgress ? (
          <button
            className="border border-gray-700 px-1 rounded-md hover:bg-gray-700 active:text-gray-400"
            onClick={handleStop}
            disabled={lines.length === 0}
          >
            <HiOutlinePauseCircle className="h-5 w-5" />
          </button>
        ) : (
          <button
            className="border border-gray-700 px-1 rounded-md hover:bg-gray-700 active:text-gray-400"
            onClick={handleTranslate}
            disabled={lines.length === 0}
          >
            <HiMiniLanguage className="h-5 w-5" />
          </button>
        )}

        {isInProgress && (
          <div className="flex items-center w-full space-x-1">
            <Spinner size="24px" color="#007bff" thickness="4px" />
            <ProgressBar progress={transformProgress} />
          </div>
        )}
      </div>

      <div>
        <TextCards lines={translatedLines} progress={progress} margin={180} />
      </div>
    </>
  );
};

export default Translate;
