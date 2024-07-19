import * as React from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';

interface VideoItemProps {
  active: boolean;
}

const VideoItem = ({ active }: VideoItemProps) => {
  return (
    <div className={`rounded-md ${active && 'bg-custome-gray-focus'} p-2`}>
      <div className="flex flex-row items-center space-x-3">
        <AiOutlineCheckCircle className="text-green-500" />
        <p className="text-gray-200">file name</p>
      </div>
      <div className="flex flex-row justify-between text-sm text-gray-400">
        <p>wav</p>
        <p>00:07</p>
      </div>
    </div>
  );
};

const VidoItems = () => {
  const [contentHeight, setContentHeight] = React.useState(
    window.innerHeight - 100
  );

  React.useEffect(() => {
    const handleResize = () => {
      setContentHeight(window.innerHeight - 100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <div
      className="flex flex-col gap-2 h-full overflow-y-scroll hide-scrollbar"
      style={{ height: contentHeight }}
    >
      <VideoItem active={true} />
      <VideoItem active={false} />
      <VideoItem active={false} />
      <VideoItem active={false} />
      <VideoItem active={false} />
      <VideoItem active={false} />
      <VideoItem active={false} />
      <VideoItem active={false} />
      <VideoItem active={false} />
      <VideoItem active={false} />
      <VideoItem active={false} />
      <VideoItem active={false} />
      <VideoItem active={false} />
      <VideoItem active={false} />
    </div>
  );
};

export default VidoItems;
