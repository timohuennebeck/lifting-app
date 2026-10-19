import { router } from 'expo-router';
import { useState } from 'react';

import { haptics } from '@/shared/lib/haptics';

import { discardWorkout, finishWorkout, workoutStats } from '../data/workout-mutations';
import { trackWorkoutDiscard, trackWorkoutFinish } from '../lib/workout-analytics';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

/** Finish (→ summary) or discard the running workout. */
export function useWorkoutActions(workoutId: string) {
  const [finishing, setFinishing] = useState(false);

  async function finish() {
    setFinishing(true);
    // Read before finishing, which drops the sets that weren't logged.
    const stats = await workoutStats(workoutId).catch(() => null);
    try {
      await finishWorkout(workoutId);
      trackWorkoutFinish(stats);
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
    const stats = await workoutStats(workoutId).catch(() => null);
    await discardWorkout(workoutId);
    trackWorkoutDiscard(stats);
  }

  return { finish, abandon, finishing };
}
