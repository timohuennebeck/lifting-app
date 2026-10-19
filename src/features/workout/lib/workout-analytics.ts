import { track } from '@/shared/lib/posthog';

import { workoutStats } from '../data/workout-mutations';

type Stats = NonNullable<Awaited<ReturnType<typeof workoutStats>>>;

/** `workout:start` for a workout just started. */
export async function trackWorkoutStart(workoutId: string) {
  const stats = await workoutStats(workoutId).catch(() => null);
  if (!stats) return;
  const { source, is_first, block_week, is_deload, exercise_count } = stats;
  track('workout:start', { source, is_first, block_week, is_deload, exercise_count });
}

/** `workout:finish`, from the stats read before finishing (its unlogged sets go then). */
export function trackWorkoutFinish(stats: Stats | null) {
  if (stats) track('workout:finish', stats);
}

/** `workout:discard`, from the stats read before the workout was deleted. */
export function trackWorkoutDiscard(stats: Stats | null) {
  if (!stats) return;
  track('workout:discard', {
    duration_min: stats.duration_min,
    completed_set_count: stats.completed_set_count,
  });
}
