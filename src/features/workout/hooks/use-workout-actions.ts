import { router } from 'expo-router';
import { useState } from 'react';

import { haptics } from '@/shared/lib/haptics';

import { discardWorkout, finishWorkout } from '../data/workout-mutations';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

/** Finish (→ summary) or discard the running workout. */
export function useWorkoutActions(workoutId: string) {
  const [finishing, setFinishing] = useState(false);

  async function finish() {
    setFinishing(true);
    try {
      await finishWorkout(workoutId);
      haptics.success();
      useWorkoutSessionStore.getState().reset();
      router.replace({
        pathname: '/workout/summary/[id]',
        params: { id: workoutId, finished: '1' },
      });
    } catch (error) {
      // The workout stays open; the user can try again.
      console.error(error);
      haptics.error();
    }
    setFinishing(false);
  }

  /** Deletes the workout and leaves (the menu's "Discard" is its confirmation). */
  async function abandon() {
    useWorkoutSessionStore.getState().reset();
    if (router.canGoBack()) router.back();
    else router.replace('/');
    await discardWorkout(workoutId);
  }

  return { finish, abandon, finishing };
}
