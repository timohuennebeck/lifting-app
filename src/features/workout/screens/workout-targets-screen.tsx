import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SetTargetsForm } from '@/features/training/components/set-targets-form';
import { defaultTargets } from '@/shared/data/exercises';
import { useWorkout } from '@/shared/data/workouts';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import { saveWorkoutTargets } from '../data/workout-mutations';

/** "Targets" of the running workout: the same editor as a plan's sets (00·P2 C·S). */
export function WorkoutTargetsScreen() {
  const { workoutId, exerciseId } = useLocalSearchParams<{
    workoutId: string;
    exerciseId: string;
  }>();
  const { t } = useTranslation('training');
  const { data: workout } = useWorkout(workoutId);
  const exercise = workout?.exercises.find((e) => e.id === exerciseId);

  return (
    <Screen header={<ScreenHeader title={t('sets.title')} />}>
      {exercise ? (
        <SetTargetsForm
          key={exercise.id}
          exerciseId={exercise.exerciseId}
          initialSets={exercise.sets.map((s) => {
            const fallback = defaultTargets(exercise.exerciseId);
            const min = s.targetMin ?? fallback.min;
            return {
              key: s.id,
              targetMin: min,
              targetMax: s.targetMax ?? Math.max(min, fallback.max),
              rir: s.targetRir,
            };
          })}
          initialRest={exercise.restSeconds}
          onSave={async (sets, rest) => {
            await saveWorkoutTargets(requireUserId(), exercise.id, sets, rest);
            haptics.success();
            router.back();
          }}
        />
      ) : null}
    </Screen>
  );
}
