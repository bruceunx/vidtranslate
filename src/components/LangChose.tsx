import { HiOutlineChevronUpDown } from 'react-icons/hi2';
import * as Select from '@radix-ui/react-select';

const LangChose = () => {
  return (
    <Select.Root>
      <Select.Trigger
        className="flex flex-row w-40 justify-between items-center border border-gray-600 rounded-md py-1 px-2 hover:text-gray-300 focus:outline-none hover:outline-none"
        aria-label="lang"
      >
        <Select.Value placeholder="English" />
        <Select.Icon>
          <HiOutlineChevronUpDown />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="text-gray-300 z-10 bg-gray-700 p-1 rounded-md">
          <Select.Viewport>
            <Select.Item
              value="english"
              className="hover:bg-gray-900 hover:outline-none focus:outline-none"
            >
              <Select.ItemText>English</Select.ItemText>
            </Select.Item>
            <Select.Item
              value="tradition chinese"
              className="hover:bg-gray-900 hover:outline-none focus:outline-none"
            >
              <Select.ItemText>繁体中文</Select.ItemText>
            </Select.Item>
            <Select.Item
              value="simplified chinese"
              className="hover:bg-gray-900 hover:outline-none focus:outline-none"
            >
              <Select.ItemText>简体中文</Select.ItemText>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default LangChose;
