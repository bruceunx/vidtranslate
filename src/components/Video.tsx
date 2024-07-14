import * as React from 'react';

interface Props {
  videopath: string;
}

const Child: React.ForwardRefRenderFunction<HTMLVideoElement, Props> = (
  { videopath },
  ref
) => {
  return (
    <>
      <video className="w-full max-h-1/2 mx-auto rounded-xl" ref={ref}>
        <source src={videopath} type="video/mp4" />
      </video>
    </>
  );
};

export default React.forwardRef(Child);
