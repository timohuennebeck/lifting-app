import { getExercise, measuresOf } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { restSecondsFor } from '@/shared/data/templates';
import { logSet, useExerciseHistory, type WorkoutDetail } from '@/shared/data/workouts';
import type { SetValues } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';

import { unlogSet } from '../data/workout-mutations';
import { parseSetInput, toSetInput } from '../lib/set-input';
import { firstOpenSet, suggestSet } from '../lib/suggest';
import { type SetField, useWorkoutSessionStore } from '../stores/workout-session-store';

export interface RecordHit extends SetValues {
  at: number;
}

/** Current exercise, progress and set logging for the live workout screen. */
export function useLiveWorkout(workout: WorkoutDetail, onRecord: (hit: RecordHit) => void) {
  const units = useUnits();
  const storedIndex = useWorkoutSessionStore((s) => s.exerciseIndex);
  const selectedSetId = useWorkoutSessionStore((s) => s.selectedSetId);
  const { exercises } = workout;
  const exerciseIndex = Math.min(storedIndex, exercises.length - 1);
  const exercise = exercises[exerciseIndex];
  const { data: history } = useExerciseHistory(exercise?.exerciseId);
  const last = history?.[0];

  const allSets = exercises.flatMap((e) => e.sets);
  const doneSets = allSets.filter((s) => s.completedAt).length;
  const selectedIndex = exercise?.sets.findIndex((s) => s.id === selectedSetId) ?? -1;
  const openIndex = firstOpenSet(exercise);
  const exerciseId = exercise?.exerciseId ?? '';
  const measures = measuresOf(exerciseId);
  const bodyweight = getExercise(exerciseId)?.equipment === 'bodyweight';
  const nextOpenExercise = [...exercises.keys()]
    .map((k) => (exerciseIndex + 1 + k) % exercises.length)
    .find((k) => k !== exerciseIndex && firstOpenSet(exercises[k]) >= 0);

  const inputFor = (index: number) => toSetInput(suggestSet(exercise, index, last), units);

  const selectSet = (index: number, field: SetField = measures[0]) => {
    const set = exercise?.sets[index];
    if (set) useWorkoutSessionStore.getState().select(set.id, inputFor(index), field);
  };

  /** Logs set `index` with values in kg. */
  async function commit(index: number, values: SetValues) {
    const set = exercise.sets[index];
    const store = useWorkoutSessionStore.getState();
    const editing = !!set.completedAt;
    const next = exercise.sets.findIndex((s, j) => j !== index && !s.completedAt);
    if (!editing && next >= 0) {
      const nextSet = exercise.sets[next];
      const nextInput = inputFor(next);
      // An empty next set carries over the weight just logged.
      if (nextSet.weightKg == null) nextInput.weight = toSetInput(values, units).weight;
      store.select(nextSet.id, nextInput, measures[0]);
    } else {
      store.closeKeypad();
    }
    const workoutDone = allSets.every((s) => s.completedAt || s.id === set.id);
    if (!editing && !workoutDone) {
      store.startRest(restSecondsFor(exercise.exerciseId, exercise.restSeconds));
    }
    let isPr: boolean;
    try {
      isPr = await logSet(set.id, exercise.exerciseId, values);
    } catch (error) {
      // The keypad already moved on; reopen this set so the failed log isn't mistaken for saved.
      console.error(error);
      haptics.error();
      store.skipRest();
      store.select(set.id, toSetInput(values, units), measures[0]);
      return;
    }
    if (isPr && !set.isPr) {
      haptics.success();
      onRecord({ ...values, at: Date.now() });
    }
  }

  /** Logs the open set from the keypad buffer, or focuses the missing field. */
  function confirmInput() {
    const { input, focusField } = useWorkoutSessionStore.getState();
    if (selectedIndex < 0) return;
    const { values, missing } = parseSetInput(input, measures, bodyweight, units);
    if (missing) {
      haptics.error();
      focusField(missing);
      return;
    }
    void commit(selectedIndex, values);
  }

  /** The round check at the end of a row: logs with the prefill, or re-opens a set. */
  function toggleDone(index: number) {
    const set = exercise.sets[index];
    if (set.completedAt) {
      void unlogSet(set.id);
      return;
    }
    if (index === selectedIndex) return confirmInput();
    const { values, missing } = parseSetInput(inputFor(index), measures, bodyweight, units);
    if (missing) {
      selectSet(index, missing);
      return;
    }
    void commit(index, values);
  }

  return {
    units,
    exercise,
    measures,
    exerciseIndex,
    last,
    doneSets,
    totalSets: allSets.length,
    selectedIndex,
    openIndex,
    nextOpenExercise,
    selectSet,
    confirmInput,
    toggleDone,
  };
}
