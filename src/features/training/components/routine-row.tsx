import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import type Animated from 'react-native-reanimated';
import type { AnimatedRef } from 'react-native-reanimated';
import Sortable from 'react-native-sortables';

import { MuscleCardHeader } from '@/shared/components/muscle-card-header';
import { muscleShares } from '@/shared/data/muscles';
import type { ExerciseItem, RoutineSummary } from '@/shared/data/routines';
import { useSortableDrag } from '@/shared/hooks/use-sortable-drag';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';

/**
 * Routines outside a plan listed as done most recently: Training shows this many ("Alle
 * anzeigen" has the rest), the Einzeltrainings page this many above all of them.
 */
export const RECENT_ROUTINES = 3;

/** Muscles below this share are side work: the line names only the main ones. */
const MAIN_MUSCLE_MIN_PERCENT = 8;

/**
 * A routine's line under its name: its time and the two muscles it works most, e.g. "48 Min ·
 * Rücken · Bizeps" (the time first, so a long muscle name can't cut it off); for one without
 * exercises, that it has none.
 */
export function useRoutineMeta() {
  const { t } = useTranslation(['training', 'muscles']);
  return (routine: Pick<RoutineSummary, 'items' | 'exerciseCount' | 'estimatedMinutes'>) => {
    if (!routine.exerciseCount) return t('training:overview.noExercises');
    const muscles = muscleShares(routine.items)
      .filter((s) => s.percent >= MAIN_MUSCLE_MIN_PERCENT)
      .slice(0, 2)
      .map((s) => t(`muscles:names.${s.muscle}`));
    return [t('training:list.minutes', { count: routine.estimatedMinutes }), ...muscles].join(
      ' · ',
    );
  };
}

export interface RoutineRowProps {
  name: string;
  /** Exercise ids with their set counts, for the muscles. */
  items: ExerciseItem[];
  /** The line under the name (see `useRoutineMeta`). */
  meta: string;
  onPress: () => void;
  onStart: () => void;
  starting?: boolean;
  /** Neon line under the name, e.g. the muscle it works most: "Brust 40 %". */
  focus?: string;
  /** Done this plan week: dimmed, with a neon check for the play button (which still starts it). */
  done?: boolean;
  /** The plan's next routine: neon muscles, a bigger name and a full-width start button. */
  next?: boolean;
}

/**
 * Routine card: its top muscles as circles, the name and a line under it, and a play button; done
 * this plan week, dimmed with a check; the plan's next, with a start button across the card.
 */
function RoutineRow({
  name,
  items,
  meta,
  onPress,
  onStart,
  starting,
  focus,
  done,
  next,
}: RoutineRowProps) {
  const { t } = useTranslation('training');

  return (
    <PressableScale
      activeScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={[name, focus, meta].filter(Boolean).join(', ')}
      // The card hides its play button from screen readers; this stands in for it.
      accessibilityActions={[{ name: 'start', label: t('list.start', { name }) }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'start') onStart();
      }}
      onPress={onPress}
      className={cn(
        'gap-3.5 rounded-[18px] bg-surface py-3.5 pl-2.5',
        next ? 'pr-3.5' : 'flex-row items-center pr-3',
      )}
    >
      <MuscleCardHeader
        shares={muscleShares(items)}
        highlight={next}
        title={name}
        focus={focus}
        meta={meta}
        large={next}
        className={cn('min-w-0', !next && 'flex-1', done && 'opacity-45')}
      />
      {next ? (
        <Button
          label={t('overview.start')}
          icon="play"
          size="md"
          loading={starting}
          accessibilityLabel={t('list.start', { name })}
          onPress={onStart}
          className="ml-1"
        />
      ) : (
        <PressableScale
          haptic="press"
          hitSlop={4}
          accessibilityLabel={t('list.start', { name })}
          onPress={onStart}
          disabled={starting}
          className="size-10 items-center justify-center rounded-full bg-elevated"
        >
          {starting ? (
            <ActivityIndicator size="small" color={colors.fg} />
          ) : done ? (
            <Icon name="check" size={15} color={colors.accent} />
          ) : (
            <Icon name="play" size={12} />
          )}
        </PressableScale>
      )}
    </PressableScale>
  );
}

interface RoutineRowsProps {
  routines: RoutineSummary[];
  /** The line under the name, e.g. when it was done last. */
  meta: (routine: RoutineSummary) => string;
  /** A neon line above it, e.g. the muscle it works most. */
  focus?: (routine: RoutineSummary) => string | undefined;
  /** Done this plan week (a plan's routines). */
  done?: (routine: RoutineSummary) => boolean;
  /** The plan's next routine, shown bigger with a start button. */
  nextId?: string;
  startingId: string | null;
  onStart: (routine: RoutineSummary) => void;
  /** A card held and dragged to another place; without it the cards stay put. */
  onMove?: (routineId: string, toIndex: number) => void;
  /** The scroll view the cards are in: dragging near its edges scrolls it. */
  scrollRef?: AnimatedRef<Animated.ScrollView>;
}

/**
 * Routine cards with quick start; an empty routine opens instead, to add exercises. With `onMove`,
 * hold a card to drag it to another place.
 */
export function RoutineRows({
  routines,
  meta,
  focus,
  done,
  nextId,
  startingId,
  onStart,
  onMove,
  scrollRef,
}: RoutineRowsProps) {
  const drag = useSortableDrag<RoutineSummary>(({ key, toIndex }) => onMove?.(key, toIndex));
  const row = (routine: RoutineSummary) => (
    <RoutineRow
      key={routine.id}
      name={routine.name}
      items={routine.items}
      focus={focus?.(routine)}
      done={done?.(routine)}
      next={routine.id === nextId}
      meta={meta(routine)}
      starting={startingId === routine.id}
      onPress={drag.unlessDragging(() => router.push(`/routine/${routine.id}`))}
      onStart={drag.unlessDragging(() =>
        routine.exerciseCount ? onStart(routine) : router.push(`/routine/${routine.id}`),
      )}
    />
  );

  if (!onMove) return <View className="gap-2 px-4">{routines.map(row)}</View>;
  return (
    <View className="px-4">
      <Sortable.Grid
        data={routines}
        keyExtractor={(routine) => routine.id}
        columns={1}
        rowGap={8}
        scrollableRef={scrollRef}
        {...drag.gridProps}
        renderItem={({ item }) => row(item)}
      />
    </View>
  );
}
