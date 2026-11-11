import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExercisePickerPage } from '@/features/exercises/components/exercise-picker-page';
import { haptics } from '@/shared/lib/haptics';
import { showError } from '@/shared/stores/error-sheet-store';
import { requireUserId } from '@/shared/stores/session-store';

import { useWorkout } from '../data/workout-detail';
import { addWorkoutExercise, swapWorkoutExercise } from '../data/workout-mutations';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

/** Add exercises to the running workout, or swap one. */
export function WorkoutPickerScreen() {
  const { workoutId, mode, workoutExerciseId } = useLocalSearchParams<{
    workoutId: string;
    mode?: 'add' | 'swap';
    workoutExerciseId?: string;
  }>();
  const swap = mode === 'swap';
  const { t } = useTranslation(['workout', 'common']);
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

  async function done(picked: string[]) {
    if (swap) {
      const [exerciseId] = picked;
      if (!target?.sets.some((s) => s.completedAt)) return applySwap(exerciseId);
      // Logged sets are cleared by a swap: ask first, in the warning sheet.
      showError({
        title: t('swap.confirmTitle'),
        message: t('swap.confirmMessage'),
        action: { label: t('swap.confirm'), onPress: () => void applySwap(exerciseId) },
        dismissLabel: t('common:actions.cancel'),
      });
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
      title={swap ? t('swap.title') : t('addExercise')}
      mode={swap ? 'swap' : 'add'}
      exerciseIds={exercises.map((e) => e.exerciseId)}
      onDone={done}
    />
  );
}
