import * as React from 'react';
import { HiMiniLanguage, HiOutlinePauseCircle } from 'react-icons/hi2';
import LangChose from './LangChose';
import { TextLine } from '../types';
import { invoke } from '@tauri-apps/api';
import { useData } from '../store/DataContext';
import { Item } from '../types';
import { readTranscript, saveToFile } from '../utils/file';
import TextCards from './TextCards';
import Spinner from './Spinner';
import ProgressBar from './ProgressBar';
import { AiOutlineSave } from 'react-icons/ai';
import { save } from '@tauri-apps/api/dialog';

interface TranslateProps {
  lines: TextLine[];
  progress: number;
  translatedLines: TextLine[];
  setTranslatedLines: React.Dispatch<React.SetStateAction<TextLine[]>>;
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

  const [transformProgress, setTransformProgress] = React.useState(0);

  const handleSave = async () => {
    const filePath = await save({
      filters: [
        {
          name: 'sample',
          extensions: ['srt', 'vtt'],
        },
      ],
    });
    if (filePath) {
      await saveToFile(filePath, translatedLines);
    }
  };

  const handleStop = async () => {
    await invoke('stop_llama', {});
    updateProgress(false);
  };

  const handleTranslate = async () => {
    updateProgress(true);
    try {
      await invoke('run_llama_stream', {
        lines: lines,
        use_model_str: '/Volumes/space/Download/madlad400-3b-mt-q4_0.gguf',
        target_lang: language,
      });
    } catch (error) {
      console.error('Error starting sidecar:', error);
      return;
    }

    let line: TextLine;
    const newLines = [];
    do {
      line = await invoke('get_llama_txt');
      console.log(line);
      if (line.text_str === 'end') break;
      if (line.text_str === 'start') {
        setTranslatedLines([]);
        continue;
      }
      setTranslatedLines((prev) => [...prev, line]);
      newLines.push(line);
    } while (line);

    updateTranslateFile(newLines);
    updateProgress(false);
  };

  React.useEffect(() => {
    const handleCurrentFile = async (item: Item) => {
      if (item.translate === '') {
        setTranslatedLines([]);
        return;
      }
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
      <div className="flex space-x-2 mb-1 text-gray-300">
        <LangChose setLanguage={setLanguage} />
        {isInProgress ? (
          <button
            className="px-1 rounded-md hover:text-gray-200"
            onClick={handleStop}
            disabled={lines.length === 0}
          >
            <HiOutlinePauseCircle className="h-5 w-5" />
          </button>
        ) : (
          <button
            className="px-1 rounded-md hover:text-gray-200"
            onClick={handleTranslate}
            disabled={lines.length === 0}
          >
            <HiMiniLanguage className="h-5 w-5" />
          </button>
        )}
        {!isInProgress && translatedLines.length > 0 && (
          <button
            className="px-1 rounded-md hover:text-gray-200"
            onClick={handleSave}
            disabled={lines.length === 0}
          >
            <AiOutlineSave className="h-5 w-5" />
          </button>
        )}

        {isInProgress && (
          <div className="flex items-center w-full space-x-1">
            <Spinner size="20px" color="#007bff" thickness="3px" />
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
