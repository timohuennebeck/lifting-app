import { router } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { attempt } from '@/shared/lib/async';
import { MuscleCardHeader } from '@/shared/components/muscle-card-header';
import { useExerciseName } from '@/shared/data/exercises';
import { muscleShares } from '@/shared/data/muscles';
import { estimateMinutes, repTarget } from '@/shared/data/routines';
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
    const saved = await attempt('Saving the coach workout failed', () =>
      saveCoachWorkout(requireUserId(), routineId, workout),
    );
    if (saved) router.push(`/routine/${routineId}`);
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
      <MuscleCardHeader
        shares={shares}
        highlight
        title={workout.name}
        focus={top ? `${t(`muscles:names.${top.muscle}`)} ${top.percent} %` : undefined}
        meta={`${t('training:list.minutes', { count: minutes })} · ${t('training:overview.exercises', { count: workout.exercises.length })}`}
      />
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
