import { useEffect, useState } from 'react';

/** Elapsed share (0–1) of a fixed-length animation, updated ~16×/s. */
export function useTimedProgress(durationMs: number) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const next = Math.min(1, (Date.now() - start) / durationMs);
      setProgress(next);
      if (next >= 1) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [durationMs]);
  return progress;
}
