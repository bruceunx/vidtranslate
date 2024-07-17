export function transformString(input: string): {
  time_start: number;
  time_end: number;
  text_str: string;
} | null {
  const match = input.match(/\[(.*?)\]\s*(.*)/);

  if (match) {
    const [time1, time2] = match[1].split(' --> ');
    return {
      time_start: getSecondsFromTimeString(time1),
      time_end: getSecondsFromTimeString(time2),
      text_str: match[2],
    };
  } else {
    return null;
  }
}

export function getSecondsFromTimeString(timeString: string): number {
  const timeStart = timeString.split(' ')[0];
  const [hours, minutes, seconds] = timeStart.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}
