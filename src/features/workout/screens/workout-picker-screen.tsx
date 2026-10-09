import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import {
  ExerciseLibrary,
  ExerciseSearchBar,
} from '@/features/exercises/components/exercise-library';
import { addWorkoutExercise, useWorkout } from '@/shared/data/workouts';
import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { haptics } from '@/shared/lib/haptics';
import { useUserId } from '@/shared/stores/session-store';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { swapWorkoutExercise } from '../data/workout-mutations';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

/** Sets an added exercise starts with. */
const NEW_SETS = 3;

/**
 * Add exercises to the running workout, or swap one (design 06c as a page). Picks collect under
 * "Selected" and are applied with "Done"; back discards them.
 */
export function WorkoutPickerScreen() {
  const { workoutId, mode, workoutExerciseId } = useLocalSearchParams<{
    workoutId: string;
    mode?: 'add' | 'swap';
    workoutExerciseId?: string;
  }>();
  const swap = mode === 'swap';
  const { t } = useTranslation(['workout', 'common']);
  const userId = useUserId();
  const footerInset = useFooterInset();
  const { data: workout } = useWorkout(workoutId);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const exercises = workout?.exercises ?? [];
  const target = exercises.find((e) => e.id === workoutExerciseId);
  const usedIds = exercises.map((e) => e.exerciseId);

  // What the training works once the picks are applied.
  const muscleItems = [
    ...exercises
      .filter((e) => !(swap && picked.length && e.id === target?.id))
      .map((e) => ({ exerciseId: e.exerciseId, sets: e.sets.length })),
    ...picked.map((exerciseId) => ({
      exerciseId,
      sets: swap ? (target?.sets.length ?? NEW_SETS) : NEW_SETS,
    })),
  ];

  const pick = (exerciseId: string) => {
    // A swap takes one exercise: a new pick replaces the last one.
    setPicked((current) => (swap ? [exerciseId] : [...current, exerciseId]));
    setQuery('');
  };

  async function applySwap() {
    if (!target || !picked[0]) return;
    useWorkoutSessionStore.getState().closeKeypad();
    await swapWorkoutExercise(target.id, picked[0]);
    haptics.success();
    router.back();
  }

  async function done() {
    if (!picked.length) return router.back();
    if (swap) {
      if (!target?.sets.some((s) => s.completedAt)) return applySwap();
      Alert.alert(t('swap.confirmTitle'), t('swap.confirmMessage'), [
        { text: t('common:actions.cancel'), style: 'cancel' },
        { text: t('swap.confirm'), style: 'destructive', onPress: () => void applySwap() },
      ]);
      return;
    }
    if (!userId || saving) return;
    setSaving(true);
    try {
      for (const exerciseId of picked) await addWorkoutExercise(userId, workoutId, exerciseId);
      haptics.success();
      // Show the first of the added exercises.
      useWorkoutSessionStore.getState().goTo(exercises.length);
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title={swap ? t('swap.title') : t('addExercise')} />}>
      <View className="flex-1 px-4 pt-2">
        <ExerciseLibrary
          query={query}
          selectedIds={[...usedIds, ...picked]}
          removableIds={picked}
          mode={swap ? 'swap' : 'add'}
          muscleItems={muscleItems}
          onPick={pick}
          onUnpick={(id) => setPicked((current) => current.filter((p) => p !== id))}
        />
      </View>
      <KeyboardStickyView offset={{ closed: 0, opened: footerInset - 8 }}>
        <View className="px-4 pt-2" style={{ paddingBottom: footerInset }}>
          <ExerciseSearchBar
            query={query}
            onChangeQuery={setQuery}
            onDone={done}
            doneDisabled={saving}
          />
        </View>
      </KeyboardStickyView>
    </Screen>
  );
}
