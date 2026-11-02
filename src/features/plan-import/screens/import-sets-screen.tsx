import { useLocalSearchParams } from 'expo-router';

import { SetTargetsScreen } from '@/features/training/components/set-targets-screen';

import { editExerciseAt, editRoutineAt } from '../lib/edit-plan';
import { useImportStore } from '../stores/import-store';

/** Target sets of an exercise in the plan being imported, made or edited (as for routines). */
export function ImportSetsScreen() {
  const { index } = useLocalSearchParams<{ index: string }>();
  const at = Number(index);
  const routineIndex = useImportStore((s) => s.routineIndex);
  const exercise = useImportStore((s) => s.plan?.routines[routineIndex]?.exercises[at]);

  return (
    <SetTargetsScreen
      exercise={
        exercise && {
          key: exercise.key,
          exerciseId: exercise.exerciseId,
          sets: exercise.sets.map((set, k) => ({ ...set, key: String(k) })),
          restSeconds: exercise.restSeconds,
        }
      }
      onSave={(sets, rest) =>
        useImportStore.getState().editPlan((p) =>
          editRoutineAt(p, routineIndex, (r) =>
            editExerciseAt(r, at, (e) => ({
              ...e,
              sets: sets.map(({ key: _key, ...set }) => set),
              restSeconds: rest,
            })),
          ),
        )
      }
    />
  );
}
