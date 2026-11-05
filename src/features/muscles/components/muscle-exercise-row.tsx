import { router } from 'expo-router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { useExerciseName } from '@/shared/data/exercises';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { MuscleExercise } from '../lib/muscle-sets';

/** An exercise on a muscle's page: its picture, name, workouts and sets; a tap opens it. */
export const MuscleExerciseRow = memo(function MuscleExerciseRow({
  exerciseId,
  workouts,
  sets,
}: MuscleExercise) {
  const { t, i18n } = useTranslation('muscles');
  const name = useExerciseName(exerciseId, i18n.language);
  return (
    <PressableScale
      haptic="tap"
      activeScale={0.98}
      onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exerciseId } })}
      className="flex-row items-center gap-3.5 py-2"
    >
      <ExerciseThumb exerciseId={exerciseId} name={name} />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="label" numberOfLines={2}>
          {name}
        </Text>
        <Text variant="caption" tone="subtle">
          {t('sets.workouts', { count: workouts })}
        </Text>
      </View>
      <Text variant="label" className="tabular-nums">
        {t('sets.count', { count: sets })}
      </Text>
    </PressableScale>
  );
});
