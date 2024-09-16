import * as React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import ProgressBar from './ProgressBar';
import TextCards from './TextCards';
import Spinner from './Spinner';
import Translate from './Translate';
import { useData } from '../store/DataContext';
import { AiOutlineSync } from 'react-icons/ai';
import { HiOutlinePauseCircle } from 'react-icons/hi2';

interface TranscriptProps {
  progress: number;
  duration: number;
}

const Transcript = ({ progress, duration }: TranscriptProps) => {
  const [transformProgress, setTransformProgress] = React.useState(0);

  const {
    lines,
    isInProgress,
    stopWhisper,
    clearTranscripts,
    textType,
    setTextType,
  } = useData();

  React.useEffect(() => {
    if (duration === 0 || lines.length === 0) {
      setTransformProgress(0);
      return;
    }
    const line = lines[lines.length - 1];
    setTransformProgress((line['time_start'] / duration) * 100);
  }, [lines]);

  return (
    <Tabs.Root
      className="flex flex-col w-full h-full"
      defaultValue="transcript"
      value={textType}
      onValueChange={(value) => setTextType(value)}
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
          {isInProgress ? (
            <>
              <Spinner size="24px" color="#007bff" thickness="4px" />
              <ProgressBar progress={transformProgress} />
              <button
                className="hover:text-gray-400 rounded-md"
                onClick={stopWhisper}
              >
                <HiOutlinePauseCircle className="h-7 w-7" />
              </button>
            </>
          ) : (
            <>
              <button
                className="hover:text-gray-400"
                onClick={clearTranscripts}
              >
                <AiOutlineSync className="h-7 w-7" />
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
        <Translate progress={progress} />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default Transcript;
