import * as Slider from '@radix-ui/react-slider';

const NSlider = ({
  value,
  onChange,
  disabled,
}: {
  value: number;
  disabled: boolean;
  onChange: (v: number) => void;
}) => {
  return (
    <Slider.Root
      className="relative flex items-center h-5 w-full select-none touch-none hover:cursor-pointer"
      defaultValue={[0]}
      value={[value]}
      max={100}
      step={1}
      onValueChange={(values: number[]) => onChange(values[0])}
      disabled={disabled}
    >
      <Slider.Track className="relative grow h-1 bg-gray-700 rounded-full">
        <Slider.Range className="absolute bg-violet-600/70 h-full round-full" />
      </Slider.Track>
      <Slider.Thumb className="block w-3 h-3 bg-gray-400 rounded-full hover:bg-gray-300 hover:cursor-pointer focus:outline-none" />
    </Slider.Root>
  );
};

export default NSlider;
