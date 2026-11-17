import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { measuresOf, useExerciseName } from '@/shared/data/exercises';
import type { SupersetSlot } from '@/shared/data/supersets';
import type { UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import type { RecentSession } from '../data/recent-sessions';
import type { WorkoutExercise } from '../data/workout-detail';
import { firstOpenSet } from '../lib/row-values';
import type { SetSuggestion } from '../lib/set-suggestions';
import type { SetField } from '../stores/workout-session-store';
import { ExerciseActions } from './exercise-actions';
import { SetTable } from './set-table';

export interface ExercisePageProps {
  exercise: WorkoutExercise;
  workoutId: string;
  suggestions: (SetSuggestion | null)[] | null;
  /** Its sets last time (the newest of its recent workouts), shown instead of suggestions. */
  last: RecentSession | undefined;
  units: UnitSystem;
  /** Its place in a superset, with the superset's round count; null when it stands alone. */
  superset: (SupersetSlot & { rounds: number }) | null;
  /** The row being typed in, or -1 (always on the pages beside the shown one). */
  selectedIndex: number;
  onSelect: (index: number, field: SetField | null) => void;
  onToggleDone: (index: number) => void;
  onToggleAll: () => void;
  onSuperset: () => void;
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
  suggestions,
  last,
  units,
  superset,
  selectedIndex,
  onSelect,
  onToggleDone,
  onToggleAll,
  onSuperset,
  onSwap,
  onMore,
  onTableLayout,
  onRowLayout,
}: ExercisePageProps) {
  const { t, i18n } = useTranslation('workout');
  const name = useExerciseName(exercise.exerciseId, i18n.language);
  const openIndex = firstOpenSet(exercise);

  // "Set n of m": the set being typed in, else the first open one, else the last.
  let shownSet = exercise.sets.length - 1;
  if (selectedIndex >= 0) shownSet = selectedIndex;
  else if (openIndex >= 0) shownSet = openIndex;

  return (
    <View>
      <View className="px-5 pt-5">
        {superset ? (
          <View className="mb-3 flex-row items-center gap-2">
            <View className="h-7 flex-row items-center gap-1.5 rounded-full bg-elevated pr-2.75 pl-2.25">
              <Icon name="link" size={13} color={colors.fg} />
              <Text variant="caption">{t('superset.name', { letter: superset.letter })}</Text>
            </View>
            <Text variant="caption" tone="subtle" className="font-inter-medium">
              {t('superset.round', {
                label: superset.label,
                current: Math.min(shownSet + 1, superset.rounds),
                total: superset.rounds,
              })}
            </Text>
          </View>
        ) : null}
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
        onSuperset={onSuperset}
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
          suggestions={suggestions}
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
