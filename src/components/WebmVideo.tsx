import * as React from 'react';

interface Props {}

const Child: React.ForwardRefRenderFunction<HTMLVideoElement, Props> = (
  props,
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
        {...props}
      ></video>
    </>
  );
};

export default React.forwardRef(Child);
