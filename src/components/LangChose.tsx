import { HiOutlineChevronUpDown } from 'react-icons/hi2';
import * as Select from '@radix-ui/react-select';
import { languages } from '../data';

interface LangChoseProps {
  setLanguage: (lang: string) => void;
}

const LangChose = ({ setLanguage }: LangChoseProps) => {
  return (
    <Select.Root onValueChange={(lang) => setLanguage(lang)}>
      <Select.Trigger
        className="flex flex-row w-40 justify-between items-center rounded-md p-2 hover:text-gray-300 focus:outline-none hover:outline-none"
        aria-label="lang"
      >
        <Select.Value placeholder="English" />
        <Select.Icon>
          <HiOutlineChevronUpDown />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="text-gray-300 z-10 bg-custome-gray-dark py-2 rounded-md">
          <Select.Viewport>
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

export default LangChose;
