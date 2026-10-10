import { router } from 'expo-router';
import { useState } from 'react';

import { discardWorkout, finishWorkout } from '@/shared/data/workouts';
import { haptics } from '@/shared/lib/haptics';

import { useWorkoutSessionStore } from '../stores/workout-session-store';

/** Finish (→ summary), discard or leave the running workout. */
export function useWorkoutActions(workoutId: string) {
  const [finishing, setFinishing] = useState(false);

  async function finish() {
    setFinishing(true);
    try {
      await finishWorkout(workoutId);
      haptics.success();
      useWorkoutSessionStore.getState().reset();
      router.replace(`/workout/summary/${workoutId}`);
    } catch (error) {
      // The workout stays open; the user can try again.
      console.error(error);
      haptics.error();
    } finally {
      setFinishing(false);
    }
  }

  /** Closes the screen; the workout keeps running and can be resumed. */
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

  /** Deletes the workout and leaves (the menu's "Discard" is its confirmation). */
  async function abandon() {
    useWorkoutSessionStore.getState().reset();
    leave();
    await discardWorkout(workoutId);
  }

  return { finish, abandon, leave, finishing };
}
