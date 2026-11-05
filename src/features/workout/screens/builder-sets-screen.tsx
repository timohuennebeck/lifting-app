import { useLocalSearchParams } from 'expo-router';

import { SetTargetsScreen } from '@/features/training/components/set-targets-screen';

import { useWorkoutDraftStore } from '../stores/workout-draft-store';

/** Target sets of an exercise in the empty workout being put together (as for routines). */
export function BuilderSetsScreen() {
  const { index } = useLocalSearchParams<{ index: string }>();
  const at = Number(index);
  const exercise = useWorkoutDraftStore((s) => s.exercises[at]);

  return (
    <SetTargetsScreen
      exercise={
        exercise && {
          exerciseId: exercise.exerciseId,
          sets: exercise.sets.map((set, k) => ({ ...set, key: String(k) })),
          restSeconds: exercise.restSeconds,
        }
      }
      onSave={(sets, rest) =>
        useWorkoutDraftStore.getState().setSets(
          at,
          sets.map(({ key: _key, ...set }) => set),
          rest,
        )
      }
    />
  );
}
