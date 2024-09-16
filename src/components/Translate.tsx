import * as React from 'react';
import { HiMiniLanguage, HiOutlinePauseCircle } from 'react-icons/hi2';
import LangChose from './LangChose';
import { useData } from '../store/DataContext';
import TextCards from './TextCards';
import Spinner from './Spinner';
import ProgressBar from './ProgressBar';
import { AiOutlineSave } from 'react-icons/ai';
import { save } from '@tauri-apps/api/dialog';
import { saveToFile } from '../utils/file';

interface TranslateProps {
  progress: number;
}

const Translate = ({ progress }: TranslateProps) => {
  const { lines, translateLines, isInProgress, stopLlama, handleTranslate } =
    useData();

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
      await saveToFile(filePath, translateLines);
    }
  };

  React.useEffect(() => {
    setTransformProgress((translateLines.length / lines.length) * 100);
  }, [translateLines]);

  return (
    <>
      <div className="flex space-x-2 mb-1 text-gray-300">
        <LangChose setLanguage={setLanguage} />
        {isInProgress ? (
          <button
            className="px-1 rounded-md hover:text-gray-200"
            onClick={stopLlama}
            disabled={lines.length === 0}
          >
            <HiOutlinePauseCircle className="h-5 w-5" />
          </button>
        ) : (
          <button
            className="px-1 rounded-md hover:text-gray-200"
            onClick={() => handleTranslate(language)}
            disabled={lines.length === 0}
          >
            <HiMiniLanguage className="h-5 w-5" />
          </button>
        )}
        {!isInProgress && translateLines.length > 0 && (
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
        <TextCards lines={translateLines} progress={progress} margin={180} />
      </div>
    </>
  );
};

export default Translate;
