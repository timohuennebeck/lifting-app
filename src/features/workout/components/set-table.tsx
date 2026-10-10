import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useUserId } from '@/shared/stores/session-store';
import type { Measure } from '@/shared/data/exercises';
import type { ExerciseHistoryEntry, WorkoutExercise } from '@/shared/data/workouts';
import {
  formatNumber,
  formatSet,
  formatWeightValue,
  type UnitSystem,
  weightUnit,
} from '@/shared/lib/format';
import { decimalSeparator, displayInput } from '@/shared/lib/keypad';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { addWorkoutSet } from '../data/workout-mutations';
import { typedValues, valueOf } from '../lib/set-input';
import { rowValues, targetLabel } from '../lib/suggest';
import { type SetField, useWorkoutSessionStore } from '../stores/workout-session-store';
import { cellWidth, SetRow } from './set-row';

export interface SetTableProps {
  exercise: WorkoutExercise;
  /** Boxes per set, from the exercise's measures. */
  measures: Measure[];
  last: ExerciseHistoryEntry | undefined;
  units: UnitSystem;
  onSelect: (index: number, field: SetField) => void;
  onToggleDone: (index: number) => void;
  /** Reports each row's y offset inside the table (for scrolling it into view). */
  onRowLayout?: (index: number, y: number) => void;
}

const HEADER = 'font-inter-semibold text-[11px] leading-3.5 tracking-[0.9px] text-dim';

/** Logging table (design 03·C) with a TARGETS ⇄ LAST toggle in the header. */
export function SetTable({
  exercise,
  measures,
  last,
  units,
  onSelect,
  onToggleDone,
  onRowLayout,
}: SetTableProps) {
  const { t } = useTranslation(['workout', 'common']);
  const userId = useUserId();
  const selectedSetId = useWorkoutSessionStore((s) => s.selectedSetId);
  const field = useWorkoutSessionStore((s) => s.field);
  const input = useWorkoutSessionStore((s) => s.input);
  const pristine = useWorkoutSessionStore((s) => s.pristine);
  const column = useWorkoutSessionStore((s) => s.column);
  const toggleColumn = useWorkoutSessionStore((s) => s.toggleColumn);
  const logged = useWorkoutSessionStore((s) => s.logged);
  const separator = decimalSeparator();
  const headers: Record<Measure, string> = {
    weight: t(`common:units.${weightUnit(units)}`).toUpperCase(),
    reps: t('table.reps'),
    seconds: t('table.seconds'),
  };

  const selectedIndex = exercise.sets.findIndex((s) => s.id === selectedSetId);
  // Rows below the one being typed in follow it as it is typed.
  const typed =
    selectedIndex >= 0 ? { index: selectedIndex, values: typedValues(input, units) } : null;

  /** A box's text: the keypad buffer while editing, else what the row holds (see rowValues). */
  const cellValue = (field: Measure, editing: boolean, index: number) => {
    if (editing) return field === 'weight' ? displayInput(input.weight, separator) : input[field];
    const value = valueOf(rowValues(exercise, index, logged, typed), field);
    if (value == null) return '';
    return field === 'weight' ? formatWeightValue(value, units) : formatNumber(value, 0);
  };

  return (
    <View>
      <View className="flex-row items-center gap-2.5 px-5 pt-6 pb-2">
        <Text className={`${HEADER} w-10 text-center`}>{t('table.set')}</Text>
        <View className="flex-1 items-center">
          <PressableScale
            haptic="select"
            onPress={toggleColumn}
            accessibilityLabel={t('table.toggleColumn')}
            className="-my-1.5 flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5"
          >
            <Text className={`${HEADER} text-fg`}>
              {column === 'targets' ? t('table.targets') : t('table.last')}
            </Text>
            <Icon name="swap" size={12} color={colors.fg} />
          </PressableScale>
        </View>
        {measures.map((m) => (
          <Text key={m} className={`${HEADER} ${cellWidth(measures.length)} text-center`}>
            {headers[m]}
          </Text>
        ))}
        <View className="w-7 items-end">
          <View className="size-6 rounded-full border-2 border-track" />
        </View>
      </View>
      <View className="gap-2.5 px-5">
        {exercise.sets.map((set, i) => {
          const selected = set.id === selectedSetId;
          const done = !!set.completedAt || !!logged[set.id];
          const previous = last?.sets[i];
          const middle =
            column === 'targets'
              ? targetLabel(set, exercise.exerciseId)
              : previous
                ? formatSet(previous, units)
                : null;
          return (
            <View key={set.id} onLayout={(e) => onRowLayout?.(i, e.nativeEvent.layout.y)}>
              <SetRow
                number={i + 1}
                middle={middle}
                cells={measures.map((field) => ({
                  field,
                  value: cellValue(field, selected, i),
                }))}
                rir={set.targetRir}
                done={done}
                record={done && set.isPr}
                selected={selected}
                field={field}
                pristine={pristine}
                onSelect={(f) => onSelect(i, f)}
                onToggleDone={() => onToggleDone(i)}
              />
            </View>
          );
        })}
        <IconButton
          icon="plus"
          size={40}
          iconSize={14}
          haptic="press"
          accessibilityLabel={t('table.addSet')}
          className="mt-1.5"
          onPress={() => userId && addWorkoutSet(userId, exercise.id)}
        />
      </View>
    </View>
  );
}
