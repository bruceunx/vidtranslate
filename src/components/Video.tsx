import * as React from 'react';

interface Props {}

const Child: React.ForwardRefRenderFunction<HTMLVideoElement, Props> = (
  props,
  ref
) => {
  return (
    <video className="w-full my-3 mx-auto rounded-xl" ref={ref} {...props}>
      <source
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        type="video/mp4"
      />
    </video>
  );
};

export default React.forwardRef(Child);
