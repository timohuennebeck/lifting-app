import { useEffect, useEffectEvent } from 'react';
import { cancelAnimation, Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/**
 * The shown story page's progress, 0 to 1 over `durationMs`, then `onEnd`. A new `page` starts
 * from 0; while `running` is false it holds where it is and goes on from there.
 */
export function useStoryTimer(
  page: string,
  durationMs: number,
  running: boolean,
  onEnd: () => void,
) {
  const progress = useSharedValue(0);
  const end = useEffectEvent(onEnd);

  useEffect(() => {
    progress.set(0);
  }, [page, progress]);

  useEffect(() => {
    if (!running) return;
    const finish = () => end();
    const from = progress.get();
    progress.set(
      withTiming(1, { duration: (1 - from) * durationMs, easing: Easing.linear }, (finished) => {
        if (finished) scheduleOnRN(finish);
      }),
    );
    return () => cancelAnimation(progress);
  }, [page, running, durationMs, progress]);

  return progress;
}
