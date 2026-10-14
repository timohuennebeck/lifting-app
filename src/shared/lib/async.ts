import { haptics } from './haptics';

/**
 * Runs `task`, e.g. a change the user tapped; a failure is logged with `failure` and felt as the
 * error haptic instead of thrown. Resolves to whether it worked.
 */
export async function attempt(failure: string, task: () => Promise<unknown>) {
  try {
    await task();
    return true;
  } catch (error) {
    console.warn(failure, error);
    haptics.error();
    return false;
  }
}

/** Resolves after `ms` milliseconds, e.g. to simulate a mocked service's latency. */
export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const inflight = new Map<string, Promise<unknown>>();

/** Runs `task` once per key at a time; callers during a run share its promise. */
export function singleFlight<T>(key: string, task: () => Promise<T>): Promise<T> {
  let run = inflight.get(key) as Promise<T> | undefined;
  if (!run) {
    run = task().finally(() => inflight.delete(key));
    inflight.set(key, run);
  }
  return run;
}
