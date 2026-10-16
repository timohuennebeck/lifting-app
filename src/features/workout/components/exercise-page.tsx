import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { measuresOf, useExerciseName } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { useLastExerciseSession } from '@/shared/data/workouts';
import { Text } from '@/shared/ui/text';

import type { WorkoutExercise } from '../data/workout-detail';
import { firstOpenSet } from '../lib/row-values';
import type { SetField } from '../stores/workout-session-store';
import { ExerciseActions } from './exercise-actions';
import { SetTable } from './set-table';

export interface ExercisePageProps {
  exercise: WorkoutExercise;
  workoutId: string;
  /** The row being typed in, or -1 (always on the pages beside the shown one). */
  selectedIndex: number;
  onSelect: (index: number, field: SetField) => void;
  onToggleDone: (index: number) => void;
  onToggleAll: () => void;
  onSwap: () => void;
  onMore: () => void;
  /** The table's and each row's y offset, to keep the edited row above the keypad. */
  onTableLayout?: (y: number) => void;
  onRowLayout?: (index: number, y: number) => void;
}

/**
 * One exercise of the live workout: its name and set count, the action chips and the sets. The
 * pages beside the shown one are drawn too, so a swipe slides the next one in at once.
 */
export function ExercisePage({
  exercise,
  workoutId,
  selectedIndex,
  onSelect,
  onToggleDone,
  onToggleAll,
  onSwap,
  onMore,
  onTableLayout,
  onRowLayout,
}: ExercisePageProps) {
  const { t, i18n } = useTranslation('workout');
  const units = useUnits();
  const { data: last } = useLastExerciseSession(exercise.exerciseId);
  const name = useExerciseName(exercise.exerciseId, i18n.language);
  const openIndex = firstOpenSet(exercise);

  // "Set n of m": the set being typed in, else the first open one, else the last.
  let shownSet = exercise.sets.length - 1;
  if (selectedIndex >= 0) shownSet = selectedIndex;
  else if (openIndex >= 0) shownSet = openIndex;

  return (
    <View>
      <View className="px-5 pt-5">
        <Text className="font-inter-semibold text-[30px] leading-9">{name}</Text>
        <Text variant="label" tone="subtle" className="mt-2 font-inter">
          {exercise.sets.length
            ? t('setOf', { current: shownSet + 1, total: exercise.sets.length })
            : t('noSets')}
        </Text>
      </View>
      <ExerciseActions
        // How the exercise works and its history (design 06e).
        onInfo={() =>
          router.push({ pathname: '/exercise/[id]', params: { id: exercise.exerciseId } })
        }
        onTargets={() =>
          router.push({
            pathname: '/workout/targets/[exerciseId]',
            params: { exerciseId: exercise.id, workoutId },
          })
        }
        onSwap={onSwap}
        onMore={onMore}
      />
      <View onLayout={(e) => onTableLayout?.(e.nativeEvent.layout.y)}>
        <SetTable
          exercise={exercise}
          measures={measuresOf(exercise.exerciseId)}
          last={last}
          units={units}
          onSelect={onSelect}
          onToggleDone={onToggleDone}
          onToggleAll={onToggleAll}
          onRowLayout={(i, y) => onRowLayout?.(i, y)}
        />
      </View>
    </View>
  );
}
