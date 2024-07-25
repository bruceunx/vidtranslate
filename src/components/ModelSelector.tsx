import { HiOutlineChevronUpDown } from 'react-icons/hi2';
import * as Select from '@radix-ui/react-select';
import { ModelDetail } from '../types';

interface ModelSelectorProps {
  currentModel: string;
  models: ModelDetail[];
  setCurrentModel: (modelName: string) => void;
}

const ModelSelector = ({
  currentModel,
  models,
  setCurrentModel,
}: ModelSelectorProps) => {
  const onChange = (value: string) => {
    setCurrentModel(value);
  };

  return (
    <Select.Root onValueChange={onChange}>
      <Select.Trigger className="flex flex-row w-52 border border-gray-700 justify-between items-center rounded-md p-2 hover:text-gray-300 focus:outline-none hover:outline-none">
        <Select.Value placeholder={currentModel} />
        <Select.Icon>
          <HiOutlineChevronUpDown />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="text-gray-300 z-10 bg-custome-gray-dark py-1 rounded-md">
          <Select.Viewport>
            {models.map((model, index) => (
              <Select.Item
                key={index}
                value={model.name}
                className="hover:bg-blue-focus px-2 hover:outline-none focus:outline-none"
              >
                <Select.ItemText>{model.name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default ModelSelector;
