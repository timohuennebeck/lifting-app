import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ExercisePickerPage } from '@/features/exercises/components/exercise-picker-page';
import { defaultSupersetRest } from '@/shared/data/routines';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';

import { useWorkout } from '../data/workout-detail';
import {
  addWorkoutExercise,
  setWorkoutSuperset,
  swapWorkoutExercise,
} from '../data/workout-mutations';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

/**
 * Add exercises to the running workout, swap one, or add one as the superset partner of
 * `workoutExerciseId`.
 */
export function WorkoutPickerScreen() {
  const { workoutId, mode, workoutExerciseId } = useLocalSearchParams<{
    workoutId: string;
    mode?: 'add' | 'swap' | 'superset';
    workoutExerciseId?: string;
  }>();
  const swap = mode === 'swap';
  const superset = mode === 'superset';
  const { t } = useTranslation(['workout', 'common', 'training']);
  const { data: workout } = useWorkout(workoutId);
  const exercises = workout?.exercises ?? [];
  const target = exercises.find((e) => e.id === workoutExerciseId);

  async function applySwap(exerciseId: string) {
    if (!target) return;
    const { closeKeypad, clearLogged } = useWorkoutSessionStore.getState();
    closeKeypad();
    await swapWorkoutExercise(target.id, exerciseId);
    // The swap clears the logged sets.
    for (const set of target.sets) clearLogged(set.id);
    haptics.success();
    router.back();
  }

  async function addPartner(exerciseId: string) {
    if (!target) return;
    const added = await addWorkoutExercise(requireUserId(), workoutId, exerciseId);
    const newRest = defaultSupersetRest([target, { exerciseId, restSeconds: null, sets: [] }]);
    await setWorkoutSuperset(workoutId, target.id, added, newRest);
    haptics.success();
    router.back();
  }

  async function done(picked: string[]) {
    if (superset) return addPartner(picked[0]);
    if (swap) {
      const [exerciseId] = picked;
      if (!target?.sets.some((s) => s.completedAt)) return applySwap(exerciseId);
      // Logged sets are cleared by a swap: ask first.
      Alert.alert(t('swap.confirmTitle'), t('swap.confirmMessage'), [
        { text: t('common:actions.cancel'), style: 'cancel' },
        {
          text: t('swap.confirm'),
          style: 'destructive',
          onPress: () => void applySwap(exerciseId),
        },
      ]);
      return;
    }
    const userId = requireUserId();
    for (const exerciseId of picked) await addWorkoutExercise(userId, workoutId, exerciseId);
    haptics.success();
    // Show the first of the added exercises.
    useWorkoutSessionStore.getState().goTo(exercises.length);
    router.back();
  }

  return (
    <ExercisePickerPage
      title={swap ? t('swap.title') : t(superset ? 'training:supersetSheet.title' : 'addExercise')}
      mode={swap || superset ? 'swap' : 'add'}
      exerciseIds={exercises.map((e) => e.exerciseId)}
      onDone={done}
    />
  );
}
