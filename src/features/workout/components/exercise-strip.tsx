import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { scrollTo, useAnimatedRef } from 'react-native-reanimated';
import Sortable from 'react-native-sortables';
import { scheduleOnUI } from 'react-native-worklets';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { exerciseName, useCustomExerciseStore } from '@/shared/data/exercises';
import { supersetSlots } from '@/shared/data/supersets';
import { useSortableDrag } from '@/shared/hooks/use-sortable-drag';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { WorkoutExercise } from '../data/workout-detail';

const TILE = 64;
const GAP = 6;
/** Tile, gap and progress bar. */
const ROW_HEIGHT = 86 + 6 + 3;

export interface ExerciseStripProps {
  exercises: WorkoutExercise[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  /** An exercise was held and dragged to another place. */
  onReorder: (workoutExerciseId: string, toIndex: number) => void;
}

/**
 * Thumbnail rail of the workout's exercises with progress bars and a "+" tile; hold to reorder.
 * A superset's tiles sit on one box with A1/A2 tags and a link mark between them, neon while
 * one of them is shown.
 */
export function ExerciseStrip({
  exercises,
  currentIndex,
  onSelect,
  onAdd,
  onReorder,
}: ExerciseStripProps) {
  const { t, i18n } = useTranslation('workout');
  // Renamed custom exercises show their new name (see `useExercise`).
  const custom = useCustomExerciseStore((s) => s.exercises);
  const scroll = useAnimatedRef<Animated.ScrollView>();
  const drag = useSortableDrag(({ key, toIndex }) => onReorder(key, toIndex));
  const slots = supersetSlots(exercises);
  const currentLetter = slots[currentIndex]?.letter;

  // Keep the current exercise in view when it changes.
  useEffect(() => {
    const x = Math.max(0, (currentIndex - 1) * (TILE + GAP));
    scheduleOnUI(() => {
      'worklet';
      scrollTo(scroll, x, 0, true);
    });
  }, [currentIndex, scroll]);

  return (
    <Animated.ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      // Exactly as tall as the tiles: a ScrollView grows and shrinks by default, which left a
      // gap under the strip and squeezed it (sets drawn over the tiles) when the keypad opened.
      style={{ flexGrow: 0, flexShrink: 0 }}
      contentContainerClassName="gap-1.5 px-5 pt-3.5"
    >
      <Sortable.Grid
        data={exercises}
        keyExtractor={(exercise) => exercise.id}
        rows={1}
        rowHeight={ROW_HEIGHT}
        columnGap={GAP}
        scrollableRef={scroll}
        autoScrollDirection="horizontal"
        {...drag.gridProps}
        activeItemScale={1.06}
        inactiveItemOpacity={0.7}
        renderItem={({ item: exercise, index: i }) => {
          const current = i === currentIndex;
          const done = exercise.sets.length > 0 && exercise.sets.every((s) => s.completedAt);
          const name = exerciseName(exercise.exerciseId, i18n.language, custom);
          const slot = slots[i];
          const active = !!slot && slot.letter === currentLetter;
          return (
            <PressableScale
              haptic="select"
              accessibilityLabel={slot ? `${slot.label} · ${name}` : name}
              accessibilityState={{ selected: current }}
              onPress={drag.unlessDragging(() => onSelect(i))}
              className="w-16 gap-1.5"
            >
              {slot ? (
                // The superset's box: each tile covers itself and half the gap to its partner.
                <View
                  className={cn(
                    'absolute -top-1 -bottom-1 bg-pill',
                    i === slot.start ? '-left-1 rounded-l-md' : '-left-0.75',
                    i === slot.end ? '-right-1 rounded-r-md' : '-right-0.75',
                  )}
                />
              ) : null}
              <View>
                <ExerciseThumb
                  exerciseId={exercise.exerciseId}
                  name={name}
                  className={cn('h-21.5 w-16', !current && (done ? 'opacity-35' : 'opacity-40'))}
                />
                {slot ? (
                  <View className="absolute top-15.5 left-1 h-4.5 justify-center rounded-full bg-bg/85 px-1.5">
                    <Text className="font-inter-bold text-[11px] leading-3.5">{slot.label}</Text>
                  </View>
                ) : null}
                {done ? (
                  <CheckBadge size={22} glyph={11} className="absolute top-8 left-5.25" />
                ) : null}
              </View>
              {slot && i > slot.start ? (
                <View
                  className={cn(
                    'absolute top-8 -left-3.5 size-5.5 items-center justify-center rounded-full border-[3px] border-pill',
                    active ? 'bg-accent' : 'bg-bg',
                  )}
                >
                  <Icon name="link" size={10} color={active ? colors.onAccent : colors.muted} />
                </View>
              ) : null}
              <View
                className={cn('h-0.75 rounded-sm', current || done ? 'bg-accent' : 'bg-control')}
              />
            </PressableScale>
          );
        }}
      />
      <PressableScale
        haptic="press"
        accessibilityLabel={t('addExercise')}
        onPress={onAdd}
        className="w-16 gap-1.5"
      >
        <View className="h-21.5 w-16 items-center justify-center rounded-[5px] bg-raised">
          <Icon name="plus" size={18} color={colors.fg} />
        </View>
        <View className="h-0.75" />
      </PressableScale>
    </Animated.ScrollView>
  );
}
