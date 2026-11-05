import { router } from 'expo-router';
import { useRef, useState } from 'react';

import { getActiveWorkoutId } from '@/shared/data/workouts';
import { haptics } from '@/shared/lib/haptics';

import { trackWorkoutStart } from '../lib/workout-analytics';

/**
 * Starts a workout with `create` (which returns its id) and opens live logging, pushed or in
 * place of the current screen; resumes a running one instead. `startingKey` is the `key` given
 * to `start` while it runs.
 */
export function useStartWorkout(open: 'push' | 'replace') {
  const [startingKey, setStartingKey] = useState<string | null>(null);
  // State isn't updated yet on a double tap, which would start two workouts.
  const starting = useRef(false);

  const start = async (key: string, create: () => Promise<string>) => {
    if (starting.current) return;
    starting.current = true;
    setStartingKey(key);
    try {
      // Only one workout runs at a time; a second one would be orphaned unfinished.
      let workoutId = await getActiveWorkoutId();
      // Not `??`, which the React Compiler can't compile inside a try.
      if (workoutId === null) {
        workoutId = await create();
        void trackWorkoutStart(workoutId);
      }
      haptics.success();
      if (open === 'replace') router.replace(`/workout/${workoutId}`);
      else router.push(`/workout/${workoutId}`);
    } catch (error) {
      haptics.error();
      console.error(error);
    }
    starting.current = false;
    setStartingKey(null);
  };

  return { start, startingKey };
}
