import * as React from 'react';
import { AiOutlineCheckCircle, AiOutlineRedo } from 'react-icons/ai';
import { Item } from '../types';
import { formatTime } from '../utils/file';
import { useData } from '../store/DataContext';

interface VideoItemProps {
  item: Item;
}

interface VideoListProps {
  items: Item[];
}

const VideoItem = ({ item }: VideoItemProps) => {
  const { setCurrentFile, currentFile, isInProgress } = useData();

  const onClick = () => {
    if (!isInProgress) {
      setCurrentFile(item.filePath);
    }
  };
  return (
    <div
      className={`rounded-md ${currentFile === item.filePath ? 'bg-custome-gray-focus' : '' && 'bg-custome-gray-focus'} p-1 hover:cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex flex-row items-center space-x-3">
        {item.transcripts.length === 0 ? (
          <AiOutlineRedo className="text-gray-500" />
        ) : (
          <AiOutlineCheckCircle className="text-green-500" />
        )}
        <p className="text-gray-200">
          {item.fileName.length > 15
            ? item.fileName.substring(0, 15) + '...'
            : item.fileName}
        </p>
      </div>
      <div className="flex flex-row justify-between text-sm text-gray-400">
        <p>.{item.fileFormat}</p>
        <p>{formatTime(item.timeLength)}</p>
      </div>
    </div>
  );
};

const VidoItems = ({ items }: VideoListProps) => {
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
      {items.map((item, index) => (
        <VideoItem key={index} item={item} />
      ))}
    </div>
  );
};

export default VidoItems;
