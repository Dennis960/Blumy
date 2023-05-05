export const durations = {
  '6 h': 3600 * 6 * 1000,
  '12 h': 3600 * 12 * 1000,
  '1 d': 3600 * 24 * 1000,
  '2 d': 3600 * 24 * 2 * 1000,
  '3 d': 3600 * 24 * 3 * 1000,
  '1 w': 3600 * 24 * 7 * 1000,
  '2 w': 3600 * 24 * 7 * 2 * 1000,
  '1 m': 3600 * 24 * 30 * 1000,
  '2 m': 3600 * 24 * 30 * 2 * 1000,
  '3 m': 3600 * 24 * 30 * 3 * 1000,
  '6 m': 3600 * 24 * 30 * 6 * 1000,
  '1 y': 3600 * 24 * 365 * 1000,
};

export function msToTime(ms: number) {
  const milliseconds = Math.floor(ms % 1000);
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 7);
  const weeks = Math.floor((ms / (1000 * 60 * 60 * 24 * 7)) % 4);
  const months = Math.floor((ms / (1000 * 60 * 60 * 24 * 7 * 4.34524)) % 12);
  const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 7 * 52.1429));

  const parts = [
    years > 0 ? `${years} a` : null,
    months > 0 ? `${months} m` : null,
    weeks > 0 ? `${weeks} w` : null,
    days > 0 ? `${days} d` : null,
    hours > 0 ? `${hours} h` : null,
    minutes > 0 ? `${minutes} min` : null,
    seconds > 0 ? `${seconds} s` : null,
    milliseconds > 0 ? `${milliseconds} ms` : null
  ];

  console.log(parts);


  return parts.filter(p => p !== null).slice(0, 3).join(' ');
}