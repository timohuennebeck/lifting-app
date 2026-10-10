import { useEffect } from 'react';

import { isBodyweight, measuresOf } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { restSecondsFor } from '@/shared/data/templates';
import { logSet, useExerciseHistory, type WorkoutDetail } from '@/shared/data/workouts';
import type { SetValues } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';

import { saveOpenSetValues, unlogSet } from '../data/workout-mutations';
import { parseSetInput, toSetInput, typedValues } from '../lib/set-input';
import { firstOpenSet, rowValues } from '../lib/suggest';
import { type SetField, useWorkoutSessionStore } from '../stores/workout-session-store';

/** Current exercise, progress and set logging for the live workout screen. */
export function useLiveWorkout(workout: WorkoutDetail) {
  const units = useUnits();
  const storedIndex = useWorkoutSessionStore((s) => s.exerciseIndex);
  const selectedSetId = useWorkoutSessionStore((s) => s.selectedSetId);
  const logged = useWorkoutSessionStore((s) => s.logged);
  const drafts = useWorkoutSessionStore((s) => s.drafts);
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
  const bodyweight = isBodyweight(exerciseId);

  // Logged and kept values show at once; their entries go when the database has them.
  useEffect(() => {
    const { clearLogged, clearDraft } = useWorkoutSessionStore.getState();
    for (const set of exercises.flatMap((e) => e.sets)) {
      const values = logged[set.id];
      if (
        values &&
        set.completedAt &&
        set.weightKg === values.weightKg &&
        set.reps === values.reps &&
        set.seconds === values.seconds
      ) {
        clearLogged(set.id);
      }
      const draft = drafts[set.id];
      if (draft && (Object.keys(draft) as (keyof SetValues)[]).every((k) => set[k] === draft[k])) {
        clearDraft(set.id);
      }
    }
  }, [exercises, logged, drafts]);

  /** A row's keypad prefill: what it shows, following a row above that is being typed in. */
  const inputFor = (index: number) => {
    const { input } = useWorkoutSessionStore.getState();
    const typed =
      selectedIndex >= 0 ? { index: selectedIndex, values: typedValues(input, units) } : null;
    return toSetInput(rowValues(exercise, index, logged, typed, drafts), units);
  };

  /**
   * The keypad is closing or moving to another row without the check: what was typed stays.
   * An open set keeps the boxes typed into as its own values (still not logged); a logged set
   * takes the edit when every box still has a value.
   */
  function keepTyped() {
    const store = useWorkoutSessionStore.getState();
    const set = exercise?.sets[selectedIndex];
    if (!set || !store.edited.length) return;
    if (set.completedAt || logged[set.id]) {
      const { values, missing } = parseSetInput(store.input, measures, bodyweight, units);
      if (missing) return;
      store.markLogged(set.id, values);
      logSet(set.id, exercise.exerciseId, values).catch((error) => {
        console.error(error);
        haptics.error();
        store.clearLogged(set.id);
      });
      return;
    }
    const typed = typedValues(store.input, units);
    const values: Partial<SetValues> = {};
    for (const field of store.edited) {
      if (field === 'weight') values.weightKg = typed.weightKg;
      else values[field] = typed[field];
    }
    store.markDraft(set.id, values);
    saveOpenSetValues(set.id, values).catch((error) => {
      console.error(error);
      haptics.error();
      store.clearDraft(set.id);
    });
  }

  const closeInput = () => {
    keepTyped();
    useWorkoutSessionStore.getState().closeKeypad();
  };

  /** Shows another exercise; values typed into the open row stay. */
  const goToExercise = (index: number) => {
    keepTyped();
    useWorkoutSessionStore.getState().goTo(index);
  };

  const selectSet = (index: number, field: SetField = measures[0]) => {
    const set = exercise?.sets[index];
    if (!set) return;
    if (index !== selectedIndex) keepTyped();
    useWorkoutSessionStore.getState().select(set.id, inputFor(index), field);
  };

  /** Logs set `index` with values in kg. */
  async function commit(index: number, values: SetValues) {
    const set = exercise.sets[index];
    const store = useWorkoutSessionStore.getState();
    const editing = !!set.completedAt;
    // Shown at once; the rest timer starts, so the keypad closes instead of moving on.
    store.markLogged(set.id, values);
    store.clearDraft(set.id);
    store.closeKeypad();
    const workoutDone = allSets.every((s) => s.completedAt || s.id === set.id);
    if (!editing && !workoutDone) {
      store.startRest(restSecondsFor(exercise.exerciseId, exercise.restSeconds));
    }
    let isPr: boolean;
    try {
      isPr = await logSet(set.id, exercise.exerciseId, values);
    } catch (error) {
      // The keypad already closed; reopen this set so the failed log isn't mistaken for saved.
      console.error(error);
      haptics.error();
      store.skipRest();
      store.clearLogged(set.id);
      store.select(set.id, toSetInput(values, units), measures[0]);
      return;
    }
    // A new record gets a success tick; the set's number turns accent in the table.
    if (isPr && !set.isPr) haptics.success();
  }

  /**
   * The keypad's check: moves on to the next box of the row (its value selected, ready to be
   * typed over); on the last box it logs the set, or focuses a box that is still empty.
   */
  function confirmInput() {
    const { input, field, focusField } = useWorkoutSessionStore.getState();
    if (selectedIndex < 0) return;
    const nextField = measures[measures.indexOf(field) + 1];
    if (nextField) {
      focusField(nextField);
      return;
    }
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
    // Also while it is still being saved.
    if (set.completedAt || logged[set.id]) {
      useWorkoutSessionStore.getState().clearLogged(set.id);
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
    selectSet,
    closeInput,
    goToExercise,
    confirmInput,
    toggleDone,
  };
}
