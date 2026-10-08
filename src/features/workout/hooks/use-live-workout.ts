import { getExercise } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { restSecondsFor } from '@/shared/data/templates';
import { logSet, useExerciseHistory, type WorkoutDetail } from '@/shared/data/workouts';
import { haptics } from '@/shared/lib/haptics';

import { unlogSet } from '../data/workout-mutations';
import { parseInput, toInput } from '../lib/keypad';
import { firstOpenSet, suggestSet } from '../lib/suggest';
import { fromDisplayWeight, toDisplayWeight } from '../lib/weight';
import { type SetField, useWorkoutSessionStore } from '../stores/workout-session-store';

export interface RecordHit {
  kg: number;
  reps: number;
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
  const bodyweight = getExercise(exercise?.exerciseId ?? '')?.equipment === 'bodyweight';
  const nextOpenExercise = [...exercises.keys()]
    .map((k) => (exerciseIndex + 1 + k) % exercises.length)
    .find((k) => k !== exerciseIndex && firstOpenSet(exercises[k]) >= 0);

  const inputFor = (index: number) => {
    const v = suggestSet(exercise, index, last);
    return {
      kg: v.kg == null ? '' : toInput(toDisplayWeight(v.kg, units)),
      reps: toInput(v.reps),
    };
  };

  const selectSet = (index: number, field: SetField = 'kg') => {
    const set = exercise?.sets[index];
    if (set) useWorkoutSessionStore.getState().select(set.id, inputFor(index), field);
  };

  async function commit(index: number, kgDisplay: number, reps: number) {
    const set = exercise.sets[index];
    const store = useWorkoutSessionStore.getState();
    const editing = !!set.completedAt;
    const next = exercise.sets.findIndex((s, j) => j !== index && !s.completedAt);
    if (!editing && next >= 0) {
      const nextSet = exercise.sets[next];
      const nextInput = inputFor(next);
      store.select(nextSet.id, {
        kg: nextSet.weightKg != null ? nextInput.kg : toInput(kgDisplay),
        reps: nextInput.reps,
      });
    } else {
      store.closeKeypad();
    }
    const workoutDone = allSets.every((s) => s.completedAt || s.id === set.id);
    if (!editing && !workoutDone) {
      store.startRest(restSecondsFor(exercise.exerciseId, exercise.restSeconds));
    }
    const kg = fromDisplayWeight(kgDisplay, units);
    const isPr = await logSet(set.id, exercise.exerciseId, kg, reps);
    if (isPr && !set.isPr) {
      haptics.success();
      onRecord({ kg, reps, at: Date.now() });
    }
  }

  /** Logs the open set from the keypad buffer, or focuses the missing field. */
  function confirmInput() {
    const { input, focusField } = useWorkoutSessionStore.getState();
    if (selectedIndex < 0) return;
    const kg = parseInput(input.kg) ?? (bodyweight ? 0 : null);
    const reps = parseInput(input.reps);
    if (kg == null || !reps) {
      haptics.error();
      focusField(kg == null ? 'kg' : 'reps');
      return;
    }
    void commit(selectedIndex, kg, reps);
  }

  /** The round check at the end of a row: logs with the prefill, or re-opens a set. */
  function toggleDone(index: number) {
    const set = exercise.sets[index];
    if (set.completedAt) {
      void unlogSet(set.id);
      return;
    }
    if (index === selectedIndex) return confirmInput();
    const v = inputFor(index);
    const kg = parseInput(v.kg) ?? (bodyweight ? 0 : null);
    const reps = parseInput(v.reps);
    if (kg == null || !reps) {
      selectSet(index, kg == null ? 'kg' : 'reps');
      return;
    }
    void commit(index, kg, reps);
  }

  return {
    units,
    exercise,
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
