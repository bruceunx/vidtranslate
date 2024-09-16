import * as React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import ProgressBar from './ProgressBar';
import TextCards from './TextCards';
import { TextLine } from '../types';
import Spinner from './Spinner';
import Translate from './Translate';
import { useData } from '../store/DataContext';
import { AiOutlinePause } from 'react-icons/ai';

interface TranscriptProps {
  lines: TextLine[];
  progress: number;
  duration: number;
  stopWhisper: () => void;
}

const Transcript = ({
  lines,
  progress,
  duration,
  stopWhisper,
}: TranscriptProps) => {
  const [transformProgress, setTransformProgress] = React.useState(0);
  const [value, setValue] = React.useState<string>('Transcript');

  const [translatedLines, setTranslatedLines] = React.useState<TextLine[]>([]);
  const { isInProgress, currentFile } = useData();

  React.useEffect(() => {
    if (duration === 0 || lines.length === 0) {
      setTransformProgress(0);
      return;
    }
    const line = lines[lines.length - 1];
    setTransformProgress((line['time_start'] / duration) * 100);
  }, [lines]);

  React.useEffect(() => {
    setValue('transcript');
  }, [currentFile]);

  return (
    <Tabs.Root
      className="flex flex-col w-full h-full"
      defaultValue="transcript"
      value={value}
      onValueChange={(value) => setValue(value)}
    >
      <Tabs.List className="flex shrink-0 text-gray-400 space-x-5 p-3">
        <Tabs.Trigger
          disabled={isInProgress}
          value="transcript"
          className="data-[state=active]:text-white data-[state=active]:font-bold"
        >
          Transcript
        </Tabs.Trigger>
        <Tabs.Trigger
          disabled={isInProgress || lines.length === 0}
          value="translate"
          className="data-[state=active]:text-white data-[state=active]:font-bold"
        >
          Translate
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content
        value="transcript"
        className="h-full p-3 bg-custome-gray-sider rounded-tl-xl"
      >
        <div className="flex flex-row space-x-2 items-center align-bottom p-1 mb-2">
          {isInProgress && (
            <>
              <Spinner size="24px" color="#007bff" thickness="4px" />
              <ProgressBar progress={transformProgress} />
              <button className="hover:text-gray-400" onClick={stopWhisper}>
                <AiOutlinePause className="h-7 w-7" />
              </button>
            </>
          )}
        </div>
        <div>
          <TextCards lines={lines} progress={progress} margin={150} />
        </div>
      </Tabs.Content>
      <Tabs.Content
        value="translate"
        className="h-full p-3 bg-custome-gray-sider rounded-tl-xl"
      >
        <Translate
          lines={lines}
          progress={progress}
          translatedLines={translatedLines}
          setTranslatedLines={setTranslatedLines}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default Transcript;
