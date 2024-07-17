import * as React from 'react';
import { TextLine } from '../types';
import { formatTime } from '../utils/file';

interface TextCardProps {
  activate: boolean;
  time_start: number;
  time_end: number;
  text_str: string;
}

const TextCard: React.FC<TextCardProps> = ({
  activate,
  time_start,
  time_end,
  text_str,
}: {
  activate: boolean;
  time_start: number;
  time_end: number;
  text_str: string;
}) => {
  return (
    <p className={`${activate ? 'bg-[#155c9a]' : ''} p-1 text-gray-200`}>
      <small className="text-sm text-gray-400 p-1 bg-gray-900 rounded-md mr-2 w-20">
        {formatTime(time_start)}-{formatTime(time_end)}
      </small>
      {text_str}
    </p>
  );
};

const TextCards = ({
  lines,
  progress,
  percent,
}: {
  lines: TextLine[];
  progress: number;
  percent: number;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState(
    window.innerHeight - 150
  );

  React.useEffect(() => {
    const handleResize = () => {
      setContentHeight(window.innerHeight - 150);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (ref.current) {
      const container = ref.current;
      const height = (container.clientHeight * 70) / 100;
      const targetScrollTop =
        Math.floor((container.scrollHeight * percent) / 100 / height) * height;
      container.scrollTop = targetScrollTop;
    }
  }, [percent]);

  return (
    <>
      <div
        ref={ref}
        className="flex flex-col space-y-2  overflow-y-scroll hide-scrollbar"
        style={{ height: contentHeight }}
      >
        {lines.map((line, index) => (
          <TextCard
            key={index}
            activate={line.time_start <= progress && line.time_end > progress}
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