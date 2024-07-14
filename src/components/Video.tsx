import * as React from 'react';

interface Props {
  videopath: string;
}

const Child: React.ForwardRefRenderFunction<HTMLVideoElement, Props> = (
  { videopath },
  ref
) => {
  const [contentHeight, setContentHeight] = React.useState(
    window.innerHeight - 200
  );

  React.useEffect(() => {
    const handleResize = () => setContentHeight(window.innerHeight - 200);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <video
        className="m-auto rounded-xl"
        style={{ height: contentHeight }}
        ref={ref}
      >
        <source src={videopath} type="video/mp4" />
      </video>
    </>
  );
};

export default React.forwardRef(Child);
