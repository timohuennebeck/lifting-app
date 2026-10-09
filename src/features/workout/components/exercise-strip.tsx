import { useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { exerciseName } from '@/shared/data/exercises';
import type { WorkoutExercise } from '@/shared/data/workouts';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';

const TILE = 64;
const GAP = 6;

export interface ExerciseStripProps {
  exercises: WorkoutExercise[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
}

/** Thumbnail rail of the workout's exercises with progress bars and a "+" tile. */
export function ExerciseStrip({ exercises, currentIndex, onSelect, onAdd }: ExerciseStripProps) {
  const { t, i18n } = useTranslation('workout');
  const scroll = useRef<ScrollView>(null);

  // Keep the current exercise in view when it changes.
  useEffect(() => {
    scroll.current?.scrollTo({ x: Math.max(0, (currentIndex - 1) * (TILE + GAP)), animated: true });
  }, [currentIndex]);

  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-1.5 px-5 pt-3.5"
    >
      {exercises.map((exercise, i) => {
        const current = i === currentIndex;
        const done = exercise.sets.length > 0 && exercise.sets.every((s) => s.completedAt);
        const name = exerciseName(exercise.exerciseId, i18n.language);
        return (
          <PressableScale
            key={exercise.id}
            haptic="select"
            accessibilityLabel={name}
            accessibilityState={{ selected: current }}
            onPress={() => onSelect(i)}
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
      })}
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
    </ScrollView>
  );
}
