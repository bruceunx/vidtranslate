import { HiOutlineChevronUpDown } from 'react-icons/hi2';
import * as Select from '@radix-ui/react-select';
import { languages } from '../data';

const LangDetect = ({ setLang }: { setLang: (lang: string) => void }) => {
  const onChange = (value: string) => {
    setLang(value);
  };

  return (
    <Select.Root onValueChange={onChange}>
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

            {languages.map((lang, index) => (
              <Select.Item
                key={index}
                value={lang.code}
                className="hover:bg-blue-focus px-2 hover:outline-none focus:outline-none"
              >
                <Select.ItemText>{lang.language}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default LangDetect;
