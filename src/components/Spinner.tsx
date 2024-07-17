const Spinner = ({
  size = '24px',
  color = '#007bff',
  thickness = '4px',
}: {
  size: string;
  color: string;
  thickness: string;
}) => {
  const style = {
    width: size,
    height: size,
    borderWidth: thickness,
    borderColor: `${color} transparent ${color} transparent`, // For the spinning effect
    borderRadius: '50%',
    borderStyle: 'solid',
    animation: 'spin 1.2s linear infinite', // Adjust duration for speed
  };

  return (
    <div className="spin">
      <div style={style}></div>
    </div>
  );
};

export default Spinner;
