import * as React from 'react';
import { TextLine } from '../types';

const AudioLine = ({
  activate,
  text_str,
}: {
  activate: boolean;
  text_str: string;
}) => {
  return (
    <p
      className={`${activate ? 'text-xl' : 'opacity-30 text-md'} p-1 text-center`}
    >
      {text_str}
    </p>
  );
};

const AudioLines = ({
  lines,
  progress,
}: {
  lines: TextLine[];
  progress: number;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState(
    window.innerHeight - 120
  );

  React.useEffect(() => {
    const handleResize = () => {
      setContentHeight(window.innerHeight - 120);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (ref.current && lines.length > 0) {
      const container = ref.current;
      const targetIndex = lines.findIndex((obj) => obj.time_start === progress);
      if (targetIndex === -1) return;
      const percentIndex = targetIndex / lines.length;
      const height = (container.clientHeight * 70) / 100;
      const targetScrollTop =
        Math.floor((container.scrollHeight * percentIndex) / height) * height;
      container.scrollTop = targetScrollTop;
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
          <AudioLine
            key={index}
            activate={line.time_start <= progress && line.time_end > progress}
            text_str={line.text_str}
          />
        ))}
      </div>
    </>
  );
};

export default AudioLines;
