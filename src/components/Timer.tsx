import { useEffect, useState } from 'react';

interface TimerProps {
  startTime: number;
  stopped?: boolean;
}

export default function Timer({ startTime, stopped }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (stopped) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime, stopped]);

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  return (
    <span className="font-display text-orange text-lg tracking-widest">
      ⏱ {mins}:{secs}
    </span>
  );
}
