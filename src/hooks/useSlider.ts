import { useState, useEffect, useRef } from 'react';

export function useSlider(total: number, duration: number) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, duration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, duration]);

  return current;
}
