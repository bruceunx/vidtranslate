import * as Progress from '@radix-ui/react-progress';

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <Progress.Root
      className="w-full bg-gray-400 h-2 overflow-hidden rounded-full"
      value={progress}
    >
      <Progress.Indicator
        className="bg-purple-500 w-full h-2"
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
      <p>progress</p>
    </Progress.Root>
  );
};

export default ProgressBar;
