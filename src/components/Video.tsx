import * as React from 'react';
import { useData } from '../store/DataContext';
import { isAudioFile } from '../utils/file';

interface Props {
  videopath: string;
}

const Child: React.ForwardRefRenderFunction<HTMLVideoElement, Props> = (
  { videopath },
  ref
) => {
  const { currentFile } = useData();

  const [contentHeight, setContentHeight] = React.useState(
    window.innerHeight - 200
  );

  React.useEffect(() => {
    const handleResize = () => {
      if (currentFile !== null && isAudioFile(currentFile)) {
        setContentHeight(10);
      } else {
        setContentHeight(window.innerHeight - 200);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentFile]);

  return (
    <>
      <video
        className="m-auto rounded-xl"
        style={{ height: contentHeight }}
        ref={ref}
      >
        <source src={videopath} type="video/mp4" />
        <source src={videopath} type="video/ogg" />
        <source src={videopath} type="video/mov" />
        <source src={videopath} type="audio/mpeg" />
        <source src={videopath} type="audio/x-m4b" />
        <source src={videopath} type="audio/wav" />
        <source src={videopath} type="audio/mp4" />
      </video>
    </>
  );
};

export default React.forwardRef(Child);
