import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExercisePickerPage } from '@/features/exercises/components/exercise-picker-page';
import { useExerciseName } from '@/shared/data/exercises';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { requireUserId } from '@/shared/stores/session-store';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { Icon } from '@/shared/ui/icon';
import { afterSheetClose } from '@/shared/ui/sheet';

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
  const { t, i18n } = useTranslation(['workout', 'common']);
  const { data: workout } = useWorkout(workoutId);
  const exercises = workout?.exercises ?? [];
  const target = exercises.find((e) => e.id === workoutExerciseId);
  // The exercise picked to swap in while the sheet asks first; kept while the sheet closes.
  const [swapId, setSwapId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const swapName = useExerciseName(swapId, i18n.language);

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
      // Logged sets are cleared by a swap: ask first.
      setSwapId(exerciseId);
      setConfirmOpen(true);
      return;
    }
    const userId = requireUserId();
    for (const exerciseId of picked) await addWorkoutExercise(userId, workoutId, exerciseId);
    haptics.success();
    // Show the first of the added exercises.
    useWorkoutSessionStore.getState().goTo(exercises.length);
    router.back();
  }

  function confirmSwap() {
    setConfirmOpen(false);
    afterSheetClose(() => void applySwap(swapId));
  }

  return (
    <>
      <ExercisePickerPage
        title={swap ? t('swap.title') : t('addExercise')}
        mode={swap ? 'swap' : 'add'}
        exerciseIds={exercises.map((e) => e.exerciseId)}
        onDone={done}
      />
      <ChoiceSheet
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('swap.confirmTitle')}
        value="swap"
        onChange={() => {}}
        onConfirm={confirmSwap}
        options={[
          {
            value: 'swap',
            tone: 'danger',
            title: t('swap.option', { name: swapName }),
            description: t('swap.confirmMessage'),
            cta: t('swap.confirm'),
            renderIcon: (active) => (
              <Icon name="swap" size={16} color={active ? colors.bg : colors.fg} />
            ),
          },
        ]}
      />
    </>
  );
}
