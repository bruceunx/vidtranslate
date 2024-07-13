import { HiOutlineChevronUpDown } from 'react-icons/hi2';
import * as Select from '@radix-ui/react-select';

const LangDetect = () => {
  return (
    <Select.Root>
      <Select.Trigger
        className="flex flex-row w-40 justify-between items-center rounded-md p-2 hover:text-gray-300 focus:outline-none hover:outline-none"
        aria-label="lang"
      >
        <Select.Value placeholder="Auto" />
        <Select.Icon>
          <HiOutlineChevronUpDown />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="text-gray-300 z-10 bg-custome-gray-dark py-2 rounded-md">
          <Select.Viewport>
            <Select.Item
              value="auto"
              className="px-2 hover:bg-blue-focus hover:outline-none focus:outline-none"
            >
              <Select.ItemText>Auto</Select.ItemText>
            </Select.Item>
            <Select.Item
              value="english"
              className="px-2 hover:bg-blue-focus hover:outline-none focus:outline-none"
            >
              <Select.ItemText>English</Select.ItemText>
            </Select.Item>
            <Select.Item
              value="chinese"
              className="px-2 hover:bg-blue-focus hover:outline-none focus:outline-none"
            >
              <Select.ItemText>简体中文</Select.ItemText>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default LangDetect;
