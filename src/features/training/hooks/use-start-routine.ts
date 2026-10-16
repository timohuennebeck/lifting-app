import { router } from 'expo-router';
import { useRef, useState } from 'react';

import { startWorkout } from '@/features/workout/data/workout-mutations';
import type { RoutineSummary } from '@/shared/data/routines';
import { getActiveWorkoutId } from '@/shared/data/workouts';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';

/**
 * Starts a workout from a routine and opens live logging; resumes a running one instead.
 * (An empty workout is put together in the builder first.)
 */
export function useStartRoutine() {
  const [startingId, setStartingId] = useState<string | null>(null);
  // State isn't updated yet on a double tap, which would start two workouts.
  const starting = useRef(false);

  const start = async (routine: Pick<RoutineSummary, 'id' | 'name'>) => {
    if (starting.current) return;
    starting.current = true;
    setStartingId(routine.id);
    try {
      // Only one workout runs at a time; a second one would be orphaned unfinished.
      let workoutId = await getActiveWorkoutId();
      // Not `??`, which the React Compiler can't compile inside a try.
      if (workoutId === null) {
        workoutId = await startWorkout(requireUserId(), routine.name, routine.id);
      }
      haptics.success();
      router.push(`/workout/${workoutId}`);
    } catch (error) {
      haptics.error();
      console.error(error);
    }
    starting.current = false;
    setStartingId(null);
  };

  return { start, startingId };
}
