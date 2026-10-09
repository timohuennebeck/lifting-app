import { useStatus } from '@powersync/react-native';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { singleFlight } from '@/shared/lib/async';

/** Waits before the next attempt after consecutive failures. */
const RETRY_DELAYS_MS = [15_000, 60_000, 5 * 60_000, 15 * 60_000];

/**
 * Background work queue (e.g. file uploads): runs `drain` while `pending` > 0, again when
 * the sync connection returns or the app comes to the foreground, and backs off after
 * failures. One run per `queue` key at a time (include the user id); null pauses it.
 * `drain` resolves false when something is left to retry.
 */
export function useBackgroundDrain(
  queue: string | null,
  pending: number,
  drain: () => Promise<boolean>,
) {
  const { connected } = useStatus();
  const [attempt, setAttempt] = useState(0);
  const failures = useRef(0);
  const run = useEffectEvent(drain);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setAttempt((n) => n + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!queue || !pending) return;
    let active = true;
    let retry: ReturnType<typeof setTimeout> | undefined;
    singleFlight(queue, run)
      .then((ok) => {
        if (!active) return;
        if (ok) {
          failures.current = 0;
          return;
        }
        const delay = RETRY_DELAYS_MS[Math.min(failures.current, RETRY_DELAYS_MS.length - 1)];
        failures.current += 1;
        retry = setTimeout(() => setAttempt((n) => n + 1), delay);
      })
      .catch((error) => console.warn(`Queue ${queue} failed`, error));
    return () => {
      active = false;
      clearTimeout(retry);
    };
  }, [queue, pending, connected, attempt]);
}
