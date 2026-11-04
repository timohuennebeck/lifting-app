import { router } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MuscleStack } from '@/shared/components/muscle-stack';
import { useExerciseName } from '@/shared/data/exercises';
import { muscleShares } from '@/shared/data/muscles';
import { estimateMinutes, repTarget } from '@/shared/data/routines';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { saveCoachWorkout } from '../data/coach-workout';
import type { WorkoutChart } from '../lib/charts';
import { setsLabel } from '../lib/sets-label';

function WorkoutLine({ exercise }: { exercise: WorkoutChart['exercises'][number] }) {
  const { t, i18n } = useTranslation('coach');
  const name = useExerciseName(exercise.exerciseId, i18n.language);
  return (
    <View className="flex-row items-baseline justify-between gap-3">
      <Text
        variant="body"
        numberOfLines={1}
        className="min-w-0 shrink text-sm leading-5 text-fg-soft"
      >
        {name}
      </Text>
      <Text variant="caption" tone="subtle" className="font-inter-medium text-sm leading-5">
        {setsLabel(exercise, t)}
      </Text>
    </View>
  );
}

export interface WorkoutCardProps {
  /** The answer it came with, whose id a workout Kai built takes once saved. */
  answerId: string;
  workout: WorkoutChart;
}

/**
 * A workout Kai built or the user saved, as the Training tab's card with its exercises: a tap opens
 * it to edit and start, saving one Kai built to the library first.
 */
export function WorkoutCard({ answerId, workout }: WorkoutCardProps) {
  const { t } = useTranslation(['coach', 'training', 'muscles']);
  const shares = muscleShares(workout.exercises);
  const top = shares.at(0);
  const minutes = estimateMinutes(workout.exercises.map((e) => ({ ...e, reps: repTarget(e) })));
  const routineId = workout.routineId ?? answerId;
  // State isn't updated yet on a double tap, which would open it twice.
  const opening = useRef(false);

  const open = async () => {
    if (opening.current) return;
    opening.current = true;
    try {
      await saveCoachWorkout(requireUserId(), routineId, workout);
      router.push(`/routine/${routineId}`);
    } catch (error) {
      haptics.error();
      console.error(error);
    }
    opening.current = false;
  };

  return (
    // Not one element for screen readers: the exercises are read and the button is reachable.
    <PressableScale
      accessible={false}
      activeScale={0.98}
      onPress={() => void open()}
      className="gap-3.5 rounded-[18px] bg-surface py-3.5 pr-3.5 pl-2.5"
    >
      <View className="flex-row items-center gap-3.5">
        <MuscleStack shares={shares} highlight />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text variant="bodyStrong" numberOfLines={1}>
            {workout.name}
          </Text>
          {top ? (
            <Text variant="caption" tone="accent" numberOfLines={1} className="font-inter-semibold">
              {`${t(`muscles:names.${top.muscle}`)} ${top.percent} %`}
            </Text>
          ) : null}
          <Text variant="caption" tone="subtle" numberOfLines={1} className="font-inter-medium">
            {`${t('training:list.minutes', { count: minutes })} · ${t('training:overview.exercises', { count: workout.exercises.length })}`}
          </Text>
        </View>
      </View>
      <View className="gap-2 pb-0.5 pl-1">
        {workout.exercises.map((exercise) => (
          <WorkoutLine key={exercise.exerciseId} exercise={exercise} />
        ))}
      </View>
      <Button
        label={t('coach:workout.open')}
        variant="secondary"
        size="md"
        onPress={() => void open()}
        className="ml-1"
      />
    </PressableScale>
  );
}
