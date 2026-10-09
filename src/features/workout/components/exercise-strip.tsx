import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { scrollTo, useAnimatedRef } from 'react-native-reanimated';
import Sortable from 'react-native-sortables';
import { scheduleOnUI } from 'react-native-worklets';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { exerciseName } from '@/shared/data/exercises';
import type { WorkoutExercise } from '@/shared/data/workouts';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';

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

/** Thumbnail rail of the workout's exercises with progress bars and a "+" tile; hold to reorder. */
export function ExerciseStrip({
  exercises,
  currentIndex,
  onSelect,
  onAdd,
  onReorder,
}: ExerciseStripProps) {
  const { t, i18n } = useTranslation('workout');
  const scroll = useAnimatedRef<Animated.ScrollView>();
  // Letting go of a dragged tile also ends a press on it; that one isn't a tap.
  const dragging = useRef(false);

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
        dragActivationDelay={250}
        activeItemScale={1.06}
        inactiveItemOpacity={0.7}
        hapticsEnabled={false}
        onDragStart={() => {
          dragging.current = true;
          haptics.press();
        }}
        onDragEnd={({ key, fromIndex, toIndex }) => {
          setTimeout(() => (dragging.current = false), 150);
          if (toIndex !== fromIndex) onReorder(key, toIndex);
        }}
        renderItem={({ item: exercise, index: i }) => {
          const current = i === currentIndex;
          const done = exercise.sets.length > 0 && exercise.sets.every((s) => s.completedAt);
          const name = exerciseName(exercise.exerciseId, i18n.language);
          return (
            <PressableScale
              haptic="select"
              accessibilityLabel={name}
              accessibilityState={{ selected: current }}
              onPress={() => {
                if (!dragging.current) onSelect(i);
              }}
              className="w-16 gap-1.5"
            >
              <View>
                <ExerciseThumb
                  exerciseId={exercise.exerciseId}
                  name={name}
                  className={cn('h-21.5 w-16', !current && (done ? 'opacity-35' : 'opacity-40'))}
                />
                {done ? (
                  <CheckBadge size={22} glyph={11} className="absolute top-8 left-5.25" />
                ) : null}
              </View>
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
