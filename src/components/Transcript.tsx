import * as Tabs from '@radix-ui/react-tabs';
import { HiMiniLanguage } from 'react-icons/hi2';
import LangChose from './LangChose';

const Transcript = () => {
  return (
    <Tabs.Root
      className="flex flex-col w-full h-full"
      defaultValue="transcript"
    >
      <Tabs.List className="flex shrink-0 text-gray-400 space-x-5 px-3 py-2 border-b border-gray-700">
        <Tabs.Trigger
          value="transcript"
          className="data-[state=active]:text-white"
        >
          Transcript
        </Tabs.Trigger>
        <Tabs.Trigger
          value="translate"
          className="data-[state=active]:text-white"
        >
          Translate
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="transcript" className="h-full">
        <p>transcript</p>
      </Tabs.Content>
      <Tabs.Content value="translate" className="h-full">
        <div className="flex p-3 space-x-3">
          <LangChose />
          <button className="border border-gray-700 p-2 rounded-md hover:bg-gray-700 active:text-gray-400">
            <HiMiniLanguage className="h-5 w-5" />
          </button>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default Transcript;
