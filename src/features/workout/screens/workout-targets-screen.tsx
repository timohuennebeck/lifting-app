import { useLocalSearchParams } from 'expo-router';

import { SetTargetsScreen } from '@/features/training/components/set-targets-screen';
import { requireUserId } from '@/shared/stores/session-store';

import { useWorkout } from '../data/workout-detail';
import { saveWorkoutTargets } from '../data/workout-mutations';

/** "Targets" of the running workout: the same editor as a plan's sets (00·P2 C·S). */
export function WorkoutTargetsScreen() {
  const { workoutId, exerciseId } = useLocalSearchParams<{
    workoutId: string;
    exerciseId: string;
  }>();
  const { data: workout } = useWorkout(workoutId);
  const exercise = workout?.exercises.find((e) => e.id === exerciseId);

  return (
    <SetTargetsScreen
      exercise={
        exercise && {
          key: exercise.id,
          exerciseId: exercise.exerciseId,
          sets: exercise.sets.map((s) => ({
            key: s.id,
            targetMin: s.targetMin,
            targetMax: s.targetMax,
            rir: s.targetRir,
          })),
          restSeconds: exercise.restSeconds,
        }
      }
      onSave={async (sets, rest) => {
        if (exercise) await saveWorkoutTargets(requireUserId(), exercise.id, sets, rest);
      }}
    />
  );
}
