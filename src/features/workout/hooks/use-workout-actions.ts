import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { discardWorkout, finishWorkout } from '@/shared/data/workouts';
import { haptics } from '@/shared/lib/haptics';

import { useWorkoutSessionStore } from '../stores/workout-session-store';

/** Finish (→ summary), discard (with confirm) or leave the running workout. */
export function useWorkoutActions(workoutId: string) {
  const { t } = useTranslation('workout');
  const [finishing, setFinishing] = useState(false);

  async function finish() {
    setFinishing(true);
    try {
      await finishWorkout(workoutId);
      haptics.success();
      useWorkoutSessionStore.getState().reset();
      router.replace(`/workout/summary/${workoutId}`);
    } finally {
      setFinishing(false);
    }
  }

  /** Closes the screen; the workout keeps running and can be resumed. */
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

  /** Deletes the workout without asking (nothing logged yet). */
  async function abandon() {
    useWorkoutSessionStore.getState().reset();
    leave();
    await discardWorkout(workoutId);
  }

  function discard() {
    haptics.warning();
    Alert.alert(t('discard.title'), t('discard.message'), [
      { text: t('discard.keep'), style: 'cancel' },
      { text: t('discard.confirm'), style: 'destructive', onPress: abandon },
    ]);
  }

  return { finish, discard, abandon, leave, finishing };
}
