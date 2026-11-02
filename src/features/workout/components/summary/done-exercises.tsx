import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { workoutMuscleSplit } from '@/shared/data/muscle-groups';
import type { UnitSystem } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

import type { WorkoutExercise } from '../../data/workout-detail';
import type { WorkoutRecord } from '../../data/workout-records';
import { DoneExerciseCard } from '../done-exercise-card';

/** A workout's exercises with only the sets that were done; those without any are left out. */
export const doneExercises = (exercises: WorkoutExercise[]) =>
  exercises
    .map((e) => ({ ...e, sets: e.sets.filter((s) => s.completedAt) }))
    .filter((e) => e.sets.length);

/** The muscles the done sets worked. */
export const doneMuscleSplit = (done: WorkoutExercise[]) =>
  workoutMuscleSplit(done.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets.length })));

export interface DoneExercisesProps {
  done: WorkoutExercise[];
  records: WorkoutRecord[];
  units: UnitSystem;
}

/** "4 Übungen" and each done exercise with its sets, a record starred. */
export function DoneExercises({ done, records, units }: DoneExercisesProps) {
  const { t } = useTranslation('training');
  if (!done.length) return null;
  return (
    <View className="px-5 pt-9">
      <Text variant="headline">{t('overview.exercises', { count: done.length })}</Text>
      <View className="pt-1">
        {done.map((e) => (
          <DoneExerciseCard
            key={e.id}
            exerciseId={e.exerciseId}
            sets={e.sets}
            units={units}
            recordSetId={records.find((r) => e.sets.some((s) => s.id === r.setId))?.setId}
          />
        ))}
      </View>
    </View>
  );
}
