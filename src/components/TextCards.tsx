import * as React from 'react';
import { TextLine } from '../types';
import { formatTime } from '../utils/file';

interface TextCardProps {
  id: string;
  activate: boolean;
  time_start: number;
  time_end: number;
  text_str: string;
}

const TextCard: React.FC<TextCardProps> = ({
  id,
  activate,
  time_start,
  time_end,
  text_str,
}: TextCardProps) => {
  return (
    <p
      id={id}
      className={`${activate ? 'bg-[#155c9a]' : ''} p-1 text-gray-200`}
    >
      <small className="text-sm text-gray-400 p-1 bg-gray-900 rounded-md mr-2 w-20">
        {formatTime(time_start)}-{formatTime(time_end)}
      </small>
      {text_str}
    </p>
  );
};

interface TextCardsProps {
  lines: TextLine[];
  progress: number;
  margin: number;
}

const TextCards = ({ lines, progress, margin }: TextCardsProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState(
    window.innerHeight - margin
  );

  React.useEffect(() => {
    const handleResize = () => {
      setContentHeight(window.innerHeight - margin);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (ref.current && lines.length > 0) {
      const container = ref.current;
      const targetIndex = lines.findIndex(
        (obj) => obj.time_start <= progress && obj.time_end >= progress
      );
      if (targetIndex === -1) return;
      const lyricElement = document.getElementById(`text-${targetIndex}`);
      if (lyricElement && container) {
        const lyricTop = lyricElement.offsetTop;
        const lyricBottom = lyricElement.offsetTop + lyricElement.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = container.scrollTop + container.clientHeight;
        if (lyricTop < containerTop || lyricBottom > containerBottom) {
          container.scrollTo({
            top: lyricElement.offsetTop - container.offsetTop,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [progress]);

  return (
    <>
      <div
        ref={ref}
        className="flex flex-col space-y-1  overflow-y-scroll hide-scrollbar"
        style={{ height: contentHeight }}
      >
        {lines.map((line, index) => (
          <TextCard
            id={`text-${index}`}
            key={index}
            activate={line.time_start <= progress && line.time_end >= progress}
            time_start={line.time_start}
            time_end={line.time_end}
            text_str={line.text_str}
          />
        ))}
      </div>
    </>
  );
};

export default TextCards;
