import { startWorkout } from '@/features/workout/data/workout-mutations';
import { useStartWorkout } from '@/features/workout/hooks/use-start-workout';
import type { RoutineSummary } from '@/shared/data/routines';
import { requireUserId } from '@/shared/stores/session-store';

/**
 * Starts a workout from a routine and opens live logging; resumes a running one instead.
 * (An empty workout is put together in the builder first.)
 */
export function useStartRoutine() {
  const { start, startingKey } = useStartWorkout('push');

  const startRoutine = (routine: Pick<RoutineSummary, 'id' | 'name'>) =>
    start(routine.id, () => startWorkout(requireUserId(), routine.name, routine.id));

  return { start: startRoutine, startingId: startingKey };
}
