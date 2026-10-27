import { useEffect } from 'react';
import { Vibration } from 'react-native';

import { useNow } from '@/shared/hooks/use-now';
import { clamp } from '@/shared/lib/math';
import { playSound, preloadSounds } from '@/shared/lib/sounds';
import { useSettingsStore } from '@/shared/stores/settings-store';

import { useWorkoutSessionStore } from '../stores/workout-session-store';

// A timer that ran out this long ago (e.g. app was closed) ends silently.
const STALE_MS = 5000;
/** The rest-end sound's chime comes this long after it starts, so it starts this early. */
const SOUND_LEAD_MS = 3000;

/**
 * Rest countdown from the session store. Vibrates when it reaches zero (a full vibration, felt in
 * a pocket; with the app closed `useRestAlert` does it), and plays the rest-end sound so its
 * chime lands on zero (unless it is turned off in Settings). Mount it once per screen.
 */
export function useRestTimer() {
  const restEndsAt = useWorkoutSessionStore((s) => s.restEndsAt);
  const restSeconds = useWorkoutSessionStore((s) => s.restSeconds);
  const restSound = useSettingsStore((s) => s.restSound);
  const now = useNow(250, restEndsAt != null);

  useEffect(() => {
    if (restEndsAt == null || !restSound) return;
    preloadSounds('restEnd');
    let stop: (() => void) | undefined;
    const start = () => {
      // A rest shorter than the lead starts the sound part-way, so the chime still lands on zero.
      const late = SOUND_LEAD_MS - (restEndsAt - Date.now());
      stop = playSound('restEnd', Math.max(0, late) / 1000);
    };
    const id = setTimeout(start, Math.max(0, restEndsAt - SOUND_LEAD_MS - Date.now()));
    return () => {
      clearTimeout(id);
      // Skipped or changed before the end: silence it. At the end the chime plays out.
      if (Date.now() < restEndsAt) stop?.();
    };
  }, [restEndsAt, restSound]);

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
        Vibration.vibrate();
        skipRest();
      },
      Math.max(0, ms),
    );
    return () => clearTimeout(id);
  }, [restEndsAt]);

  // Until the clock catches up with a timer that just started, it shows the full length
  // instead of a jump from a stale time.
  const remainingMs = restEndsAt != null ? clamp(restEndsAt - now, 0, restSeconds * 1000) : 0;
  return {
    resting: restEndsAt != null,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    /** 1 → 0 while counting down. */
    fraction: restSeconds > 0 ? Math.min(1, remainingMs / (restSeconds * 1000)) : 0,
  };
}
