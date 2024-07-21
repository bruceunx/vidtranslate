export function transformString(input: string): {
  time_start: number;
  time_end: number;
  text_str: string;
} | null {
  const match = input.match(/\[(.*?)\]\s*(.*)/);

  if (match) {
    const [time1, time2] = match[1].split(' --> ');
    return {
      time_start: getMillisFromTimeString(time1),
      time_end: getMillisFromTimeString(time2),
      text_str: match[2],
    };
  } else {
    return null;
  }
}

export function getMillisFromTimeString(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(':');
  const [secs, millis] = seconds.split('.');
  return (
    parseInt(hours, 10) * 3600000 +
    parseInt(minutes, 10) * 60000 +
    parseInt(secs, 10) * 1000 +
    parseInt(millis, 10)
  );
}
