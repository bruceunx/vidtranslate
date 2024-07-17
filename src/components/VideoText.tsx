const VideoText = ({ subtitles }: { subtitles: string }) => {
  return (
    <div className="flex justify-center mt-4">
      {subtitles && (
        <div className="h-fit text-gray-300">
          <p className="text-xl">{subtitles}</p>
        </div>
      )}
    </div>
  );
};

export default VideoText;
