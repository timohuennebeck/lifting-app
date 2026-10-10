import { useEffect } from 'react';
import { useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

import { useNow } from '@/shared/hooks/use-now';
import { haptics } from '@/shared/lib/haptics';

import { useWorkoutSessionStore } from '../stores/workout-session-store';

// A timer that ran out this long ago (e.g. app was closed) ends silently.
const STALE_MS = 5000;

/**
 * Rest countdown from the session store. Fires a haptic and a flash (0→1→0
 * shared value) when it reaches zero. Mount it once per screen.
 */
export function useRestTimer() {
  const restEndsAt = useWorkoutSessionStore((s) => s.restEndsAt);
  const restSeconds = useWorkoutSessionStore((s) => s.restSeconds);
  const now = useNow(250, restEndsAt != null);
  const flash = useSharedValue(0);

  useEffect(() => {
    if (restEndsAt == null) return;
    const { skipRest } = useWorkoutSessionStore.getState();
    const ms = restEndsAt - Date.now();
    if (ms < -STALE_MS) {
      skipRest();
      return;
    }
    const id = setTimeout(
      () => {
        haptics.success();
        flash.set(
          withSequence(
            withTiming(1, { duration: 150 }),
            withDelay(1600, withTiming(0, { duration: 400 })),
          ),
        );
        skipRest();
      },
      Math.max(0, ms),
    );
    return () => clearTimeout(id);
  }, [restEndsAt, flash]);

  // Until the clock catches up with a timer that just started, it shows the full length
  // instead of a jump from a stale time.
  const remainingMs =
    restEndsAt != null ? Math.min(restSeconds * 1000, Math.max(0, restEndsAt - now)) : 0;
  return {
    resting: restEndsAt != null,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    /** 1 → 0 while counting down. */
    fraction: restSeconds > 0 ? Math.min(1, remainingMs / (restSeconds * 1000)) : 0,
    flash,
  };
}
