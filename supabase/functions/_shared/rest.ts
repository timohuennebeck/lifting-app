// The app's rest rule and time estimate (restSecondsFor and estimateMinutes in
// src/shared/data/routines.ts), so plans and workouts are fitted to their length as the app will
// run them. Plans and workouts store no rest of their own: the app takes the exercise's.
// Plain TypeScript without Deno APIs.

/** Set-up, warm-up and transition time per exercise. */
const EXERCISE_SECONDS = 150;
/** Seconds a single working set takes, excluding rest. */
const SET_SECONDS = 45;
/** The rest of an exercise whose own isn't known (the app's DEFAULT_REST). */
export const DEFAULT_REST = 90;

/** The reps a set aims for: the middle of its range, or the bound it has; null without one. */
export function repTarget(min: number | null, max: number | null) {
  if (min == null) return max;
  if (max == null) return min;
  return (min + max) / 2;
}

/**
 * Rest after a set: the exercise's own, which is meant for 8 reps or more. Heavier sets get a
 * quarter more for 6–7 reps and half for 5 or fewer, in 15 s steps. Timed exercises (their
 * targets are seconds) and sets without a target keep the exercise's rest.
 */
export function restAfterSet(rest: number, measures: string[], reps: number | null) {
  if (reps == null || measures.includes('seconds')) return rest;
  const factor = reps <= 5 ? 1.5 : reps < 8 ? 1.25 : 1;
  return Math.round((rest * factor) / 15) * 15;
}

/** Seconds an exercise takes: set-up, and per set its work and rest. */
export const exerciseSeconds = (sets: number, rest: number) =>
  EXERCISE_SECONDS + sets * (SET_SECONDS + rest);
