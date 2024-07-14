import * as Tabs from '@radix-ui/react-tabs';
import { HiMiniLanguage } from 'react-icons/hi2';
import LangChose from './LangChose';

const Transcript = () => {
  return (
    <Tabs.Root
      className="flex flex-col w-full h-full"
      defaultValue="transcript"
    >
      <Tabs.List className="flex shrink-0 text-gray-400 space-x-5 p-3">
        <Tabs.Trigger
          value="transcript"
          className="data-[state=active]:text-white data-[state=active]:font-bold"
        >
          Transcript
        </Tabs.Trigger>
        <Tabs.Trigger
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
        <p>transcript</p>
      </Tabs.Content>
      <Tabs.Content
        value="translate"
        className="h-full p-3 bg-custome-gray-sider rounded-tl-xl"
      >
        <div className="flex space-x-3">
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
