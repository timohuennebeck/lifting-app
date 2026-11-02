import { useLocalSearchParams } from 'expo-router';

import { useRoutineDetail } from '@/shared/data/routines';
import { requireUserId } from '@/shared/stores/session-store';

import { SetTargetsScreen } from '../components/set-targets-screen';
import { saveRoutineSets } from '../data/routine-mutations';

/** Edit target sets of one routine exercise: reps range, RIR, rest override (00·P2 C·S). */
export function EditSetsScreen() {
  const { id, exerciseId } = useLocalSearchParams<{ id: string; exerciseId: string }>();
  const { data: routine } = useRoutineDetail(id);
  const exercise = routine?.exercises.find((e) => e.id === exerciseId);

  return (
    <SetTargetsScreen
      exercise={
        exercise && {
          key: exercise.id,
          exerciseId: exercise.exerciseId,
          sets: exercise.sets.map(({ id, ...set }) => ({ ...set, key: id })),
          restSeconds: exercise.restSeconds,
        }
      }
      onSave={async (sets, rest) => {
        if (exercise) await saveRoutineSets(requireUserId(), exercise.id, sets, rest);
      }}
    />
  );
}
