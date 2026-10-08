import { router } from 'expo-router';
import { useState } from 'react';

import { getActiveWorkoutId, startWorkout } from '@/shared/data/workouts';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';

/** Starts a workout from a template and opens live logging; resumes a running one instead. */
export function useStartTemplate() {
  const [startingId, setStartingId] = useState<string | null>(null);

  const start = async (template: { id: string; name: string }) => {
    if (startingId) return;
    setStartingId(template.id);
    try {
      // Only one workout runs at a time; a second one would be orphaned unfinished.
      const activeId = await getActiveWorkoutId();
      const workoutId =
        activeId ?? (await startWorkout(requireUserId(), template.name, template.id));
      haptics.success();
      router.push(`/workout/${workoutId}`);
    } catch (error) {
      haptics.error();
      console.error(error);
    } finally {
      setStartingId(null);
    }
  };

  return { start, startingId };
}
