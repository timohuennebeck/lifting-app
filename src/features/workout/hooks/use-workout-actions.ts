import { router } from 'expo-router';
import { useState } from 'react';

import { haptics } from '@/shared/lib/haptics';

import { keepSupersets, supersetsToKeep, type SupersetsToKeep } from '../data/keep-supersets';
import { discardWorkout, finishWorkout, workoutStats } from '../data/workout-mutations';
import { trackWorkoutDiscard, trackWorkoutFinish } from '../lib/workout-analytics';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

/**
 * Finish (→ summary) or discard the running workout. A workout of a routine with a superset made
 * during it asks first whether to keep the superset in the routine (`keepPrompt`).
 */
export function useWorkoutActions(workoutId: string) {
  const [finishing, setFinishing] = useState(false);
  const [keepPrompt, setKeepPrompt] = useState<SupersetsToKeep | null>(null);

  async function finish() {
    setFinishing(true);
    const keep = await supersetsToKeep(workoutId).catch(() => null);
    if (keep) {
      setKeepPrompt(keep);
      setFinishing(false);
      return;
    }
    await complete();
  }

  /** The answer to `keepPrompt`; then the workout finishes. */
  async function answerKeep(keep: boolean) {
    const prompt = keepPrompt;
    setKeepPrompt(null);
    setFinishing(true);
    if (keep && prompt) await keepSupersets(prompt).catch((error) => console.error(error));
    await complete();
  }

  async function complete() {
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

  return {
    finish,
    abandon,
    finishing,
    keepPrompt,
    answerKeep,
    dismissKeep: () => setKeepPrompt(null),
  };
}
