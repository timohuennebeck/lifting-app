import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { useUserId } from '@/shared/stores/session-store';
import { formatSetParts, isTimed, type Measure } from '@/shared/data/exercises';
import type { ExerciseHistoryEntry } from '@/shared/data/workouts';
import {
  formatNumber,
  formatTargetLabel,
  formatWeightValue,
  type SetValues,
  type UnitSystem,
  weightUnit,
} from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { decimalSeparator, displayInput } from '@/shared/lib/keypad';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { WorkoutExercise } from '../data/workout-detail';
import { addWorkoutSet } from '../data/workout-mutations';
import { rowValues } from '../lib/row-values';
import { typedValues, valueOf } from '../lib/set-input';
import type { SetSuggestion } from '../lib/set-suggestions';
import {
  MIDDLE_COLUMNS,
  type MiddleColumn,
  type SetField,
  useWorkoutSessionStore,
} from '../stores/workout-session-store';
import { cellWidth, SetRow, type SetRowMiddle } from './set-row';

export interface SetTableProps {
  exercise: WorkoutExercise;
  /** Boxes per set, from the exercise's measures. */
  measures: Measure[];
  last: ExerciseHistoryEntry | undefined;
  /** Per set; none the first time the exercise is done: the targets show instead. */
  suggestions: SetSuggestion[] | null;
  units: UnitSystem;
  /** Sets that are the workout's record for their exercise: the number turns accent. */
  recordSetIds: string[];
  /** A box of row `index` tapped, or null for the row outside its boxes. */
  onSelect: (index: number, field: SetField | null) => void;
  onToggleDone: (index: number) => void;
  /** The check over the table: every set done, or all re-opened. */
  onToggleAll: () => void;
  /** Reports each row's y offset inside the table (for scrolling it into view). */
  onRowLayout: (index: number, y: number) => void;
}

const HEADER = 'font-inter-semibold text-[11px] leading-3.5 tracking-[0.9px] text-dim';
/** The arrow by the middle column's header turns once per tap. */
const TURN = { duration: 450 };

/** Logging table (design 03·C) whose middle column goes round SUGGESTED → TARGETS → LAST. */
export function SetTable({
  exercise,
  measures,
  last,
  suggestions,
  units,
  recordSetIds,
  onSelect,
  onToggleDone,
  onToggleAll,
  onRowLayout,
}: SetTableProps) {
  const { t } = useTranslation('workout');
  const userId = useUserId();
  const selectedSetId = useWorkoutSessionStore((s) => s.selectedSetId);
  const field = useWorkoutSessionStore((s) => s.field);
  const input = useWorkoutSessionStore((s) => s.input);
  const pristine = useWorkoutSessionStore((s) => s.pristine);
  const column = useWorkoutSessionStore((s) => s.column);
  const showColumn = useWorkoutSessionStore((s) => s.showColumn);
  const turn = useSharedValue(0);
  const turnStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get()}deg` }] }));
  const logged = useWorkoutSessionStore((s) => s.logged);
  const drafts = useWorkoutSessionStore((s) => s.drafts);
  const pickedRir = useWorkoutSessionStore((s) => s.rir);
  const separator = decimalSeparator();
  const headers: Record<Measure, string> = {
    weight: weightUnit(units).toUpperCase(),
    reps: t('table.reps'),
    seconds: t('table.seconds'),
  };

  // Without suggestions (the first time) the targets stand in for them.
  const shown: MiddleColumn = column === 'suggested' && !suggestions ? 'targets' : column;
  const suggestedShown = shown === 'suggested';
  const toggleColumn = () => {
    showColumn(MIDDLE_COLUMNS[(MIDDLE_COLUMNS.indexOf(shown) + 1) % MIDDLE_COLUMNS.length]);
    // To the next full turn, so a tap during the last one doesn't leave the arrow askew.
    turn.set(withTiming((Math.floor(turn.get() / 360) + 1) * 360, TURN));
  };
  const selectedIndex = exercise.sets.findIndex((s) => s.id === selectedSetId);
  const allDone =
    exercise.sets.length > 0 && exercise.sets.every((s) => !!s.completedAt || !!logged[s.id]);
  // Rows below the one being typed in follow it as it is typed.
  const typed =
    selectedIndex >= 0 ? { index: selectedIndex, values: typedValues(input, units) } : null;

  /** A box's text: the keypad buffer while editing, else what the row holds (see rowValues). */
  const cellValue = (measure: Measure, editing: boolean, index: number) => {
    if (editing) {
      return measure === 'weight' ? displayInput(input.weight, separator) : input[measure];
    }
    const suggested = suggestions?.map((x) => x.values);
    const value = valueOf(rowValues(exercise, index, logged, typed, drafts, suggested), measure);
    if (value == null) return '';
    return measure === 'weight' ? formatWeightValue(value, units) : formatNumber(value, 0);
  };

  /** A set as the column shows it: the weight over the reps ("60 kg" over "× 9"), or the reps. */
  const setLabel = (values: SetValues): SetRowMiddle => {
    const { weight, amount } = formatSetParts(exercise.exerciseId, values, units);
    return weight
      ? { main: weight, detail: `×\u00a0${amount}`, strong: true }
      : { main: amount, strong: true };
  };

  /** The middle column of row `index`: its suggestion, its targets, or the same set last time. */
  const middleLabel = (index: number): SetRowMiddle | null => {
    if (shown === 'targets') {
      const { targetMin, targetMax } = exercise.sets[index];
      const targets = formatTargetLabel(targetMin, targetMax, isTimed(exercise.exerciseId));
      return targets ? { main: targets } : null;
    }
    if (shown === 'last') {
      const previous = last?.sets[index];
      return previous ? setLabel(previous) : null;
    }
    const suggestion = suggestions?.[index];
    if (!suggestion) return null;
    const label = setLabel(suggestion.values);
    // The marker goes before what changed: the weight, else the reps.
    if (label.detail) {
      return {
        ...label,
        mainTrend: suggestion.weight ?? undefined,
        detailTrend: suggestion.reps ?? undefined,
      };
    }
    return { ...label, mainTrend: suggestion.weight ?? suggestion.reps ?? undefined };
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
            <Text className={cn(HEADER, suggestedShown ? 'text-accent' : 'text-fg')}>
              {t(`table.${shown}`)}
            </Text>
            <Animated.View style={turnStyle}>
              <Icon name="refresh" size={12} color={suggestedShown ? colors.accent : colors.fg} />
            </Animated.View>
          </PressableScale>
        </View>
        {measures.map((m) => (
          <Text key={m} className={`${HEADER} ${cellWidth(measures.length)} text-center`}>
            {headers[m]}
          </Text>
        ))}
        <PressableScale
          haptic={allDone ? 'tap' : 'press'}
          hitSlop={10}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: allDone }}
          accessibilityLabel={t('table.doneAll')}
          onPress={onToggleAll}
          className="w-7 items-end"
        >
          <View
            className={cn(
              'size-6 items-center justify-center rounded-full',
              allDone ? 'bg-accent' : 'border-2 border-track',
            )}
          >
            {allDone ? <Icon name="check" size={11} color={colors.onAccent} /> : null}
          </View>
        </PressableScale>
      </View>
      <View className="gap-2.5 px-5">
        {exercise.sets.map((set, i) => {
          const selected = set.id === selectedSetId;
          const done = !!set.completedAt || !!logged[set.id];
          // The reps in reserve the set had once entered, else its target.
          const entered = logged[set.id]?.rir ?? set.rir;
          const rir = selected ? (pickedRir ?? entered) : entered;
          return (
            <View key={set.id} onLayout={(e) => onRowLayout(i, e.nativeEvent.layout.y)}>
              <SetRow
                number={i + 1}
                middle={middleLabel(i)}
                cells={measures.map((measure) => ({
                  field: measure,
                  value: cellValue(measure, selected, i),
                }))}
                rir={rir ?? set.targetRir}
                done={done}
                record={done && recordSetIds.includes(set.id)}
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
