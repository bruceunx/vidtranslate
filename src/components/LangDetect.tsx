import { HiOutlineChevronUpDown } from 'react-icons/hi2';
import * as Select from '@radix-ui/react-select';

const LangDetect = () => {
  return (
    <Select.Root>
      <Select.Trigger
        className="flex flex-row w-40 justify-between items-center border border-gray-600 rounded-md py-1 px-2 hover:text-gray-300"
        aria-label="lang"
      >
        <Select.Value placeholder="Auto detection" />
        <Select.Icon>
          <HiOutlineChevronUpDown />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="text-gray-300 z-10 bg-gray-700 p-1 rounded-md">
          <Select.Viewport>
            <Select.Item value="auto" className="hover:bg-gray-900">
              <Select.ItemText>Auto detection</Select.ItemText>
            </Select.Item>
            <Select.Item value="english" className="hover:bg-gray-900">
              <Select.ItemText>English</Select.ItemText>
            </Select.Item>
            <Select.Item value="chinese" className="hover:bg-gray-900">
              <Select.ItemText>中文</Select.ItemText>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default LangDetect;
