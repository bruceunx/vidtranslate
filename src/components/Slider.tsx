import * as Slider from '@radix-ui/react-slider';

const NSlider = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  return (
    <Slider.Root
      className="relative flex items-center h-5 w-full select-none touch-none hover:cursor-pointer"
      value={[value]}
      max={100}
      step={1}
      onValueChange={(value) => onChange(value[0])}
    >
      <Slider.Track className="relative grow h-1 bg-gray-700 rounded-full">
        <Slider.Range className="absolute bg-violet-600/70 h-full round-full" />
      </Slider.Track>
      <Slider.Thumb className="block w-3 h-3 bg-gray-400 rounded-full hover:bg-gray-300 hover:cursor-pointer focus:outline-none" />
    </Slider.Root>
  );
};

export default NSlider;
