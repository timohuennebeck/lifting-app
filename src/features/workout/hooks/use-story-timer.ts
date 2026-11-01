import { useEffect, useEffectEvent, useRef } from 'react';
import { cancelAnimation, Easing, type SharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/**
 * Runs `progress` for the shown story page, 0 to 1 over `durationMs`, then `onEnd`. Every new
 * `page`, also one shown before, starts from 0; while `running` is false it holds where it is
 * and goes on from there. The time run is kept here, so the bar is only drawn from it, never read.
 */
export function useStoryTimer(
  progress: SharedValue<number>,
  page: string,
  durationMs: number,
  running: boolean,
  onEnd: () => void,
) {
  const end = useEffectEvent(onEnd);
  const elapsed = useRef({ page, ms: 0 });

  useEffect(() => {
    if (elapsed.current.page !== page) elapsed.current = { page, ms: 0 };
    const done = elapsed.current.ms;
    progress.set(done / durationMs);
    if (!running) return;
    const startedAt = Date.now();
    const finish = () => end();
    progress.set(
      withTiming(
        1,
        { duration: Math.max(0, durationMs - done), easing: Easing.linear },
        (finished) => {
          if (finished) scheduleOnRN(finish);
        },
      ),
    );
    return () => {
      cancelAnimation(progress);
      elapsed.current.ms = Math.min(durationMs, done + Date.now() - startedAt);
    };
  }, [page, running, durationMs, progress]);
}
