import { useEffect } from 'react';

import { isBodyweight, measuresOf } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { restSecondsFor } from '@/shared/data/routines';
import { useLastExerciseSession } from '@/shared/data/workouts';
import type { SetValues } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';

import type { WorkoutDetail, WorkoutExercise } from '../data/workout-detail';
import { logSet, saveOpenSetValues, saveSetRir, unlogSet } from '../data/workout-mutations';
import { firstOpenSet, rowValues } from '../lib/row-values';
import { parseSetInput, toSetInput, typedValues } from '../lib/set-input';
import { type SetField, useWorkoutSessionStore } from '../stores/workout-session-store';
import { useSetSuggestions } from './use-set-suggestions';

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
  const { data: last } = useLastExerciseSession(exercise?.exerciseId);
  const suggestions = useSetSuggestions(workout, units);
  /** The suggested values of each set of `target`, the boxes' prefill (none the first time). */
  const suggestedValues = (target: WorkoutExercise) => suggestions[target.id]?.map((s) => s.values);

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
    return toSetInput(
      rowValues(exercise, index, logged, typed, drafts, suggestedValues(exercise)),
      units,
    );
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
      store.markLogged(set.id, { ...values, rir: store.rir });
      logSet(set.id, exercise.exerciseId, values, store.rir).catch((error) => {
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

  /**
   * A RIR picked in the number pad is saved at once, without logging or retyping the set; the
   * entered one picked again is removed.
   */
  function pickRir(picked: number) {
    const store = useWorkoutSessionStore.getState();
    const set = exercise?.sets[selectedIndex];
    if (!set) return;
    const rir = picked === store.rir ? null : picked;
    store.setRir(rir);
    const values = store.logged[set.id];
    if (values) store.markLogged(set.id, { ...values, rir });
    saveSetRir(set.id, rir).catch((error) => {
      console.error(error);
      haptics.error();
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

  /** Opens the keypad on row `index`, at `field` (by default its first box). */
  const selectSet = (index: number, field?: SetField) => {
    const set = exercise?.sets[index];
    if (!set) return;
    if (index !== selectedIndex) keepTyped();
    // Defaulted here: the React Compiler can't compile `field = measures[0]` as a parameter.
    // A RIR removed a moment ago is null in `logged` before the database has it.
    const loggedRir = logged[set.id]?.rir;
    const rir = loggedRir !== undefined ? loggedRir : set.rir;
    useWorkoutSessionStore.getState().select(set.id, inputFor(index), field ?? measures[0], rir);
  };

  /**
   * Logs set `index` of `target` (the shown exercise, unless logged from the Live Activity), with
   * the reps in reserve when they come from the number pad.
   */
  async function commit(
    target: WorkoutExercise,
    index: number,
    values: SetValues,
    rir?: number | null,
  ) {
    const set = target.sets[index];
    const store = useWorkoutSessionStore.getState();
    const editing = !!set.completedAt;
    // Shown at once; the rest timer starts, so the keypad closes instead of moving on.
    store.markLogged(set.id, rir === undefined ? values : { ...values, rir });
    store.clearDraft(set.id);
    store.closeKeypad();
    // Sets logged a moment ago may not be in the database yet: they count as done too.
    const { logged } = useWorkoutSessionStore.getState();
    const workoutDone = allSets.every((s) => s.completedAt || s.id in logged);
    if (!editing && !workoutDone) {
      store.startRest(restSecondsFor(target.exerciseId, target.restSeconds));
    }
    let isPr: boolean;
    try {
      isPr = await logSet(set.id, target.exerciseId, values, rir);
    } catch (error) {
      // The keypad already closed; reopen this set so the failed log isn't mistaken for saved.
      console.error(error);
      haptics.error();
      store.skipRest();
      store.clearLogged(set.id);
      store.select(
        set.id,
        toSetInput(values, units),
        measuresOf(target.exerciseId)[0],
        rir ?? set.rir,
      );
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
    const { input, field, focusField, rir } = useWorkoutSessionStore.getState();
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
    void commit(exercise, selectedIndex, values, measures.includes('reps') ? rir : undefined);
  }

  /**
   * The check over the table: logs every open set of the exercise with what its row shows, or
   * re-opens them all when all are done. With a box still empty, it opens the keypad there instead.
   */
  function toggleAll() {
    if (!exercise?.sets.length) return;
    const store = useWorkoutSessionStore.getState();
    const isDone = (index: number) => {
      const set = exercise.sets[index];
      return !!set.completedAt || !!logged[set.id];
    };
    const indexes = exercise.sets.map((_, i) => i);
    if (indexes.every(isDone)) {
      for (const set of exercise.sets) {
        store.clearLogged(set.id);
        void unlogSet(set.id);
      }
      return;
    }
    const open = indexes.filter((i) => !isDone(i));
    const rows = open.map((i) => ({
      index: i,
      ...parseSetInput(inputFor(i), measures, bodyweight, units),
    }));
    const missing = rows.find((r) => r.missing);
    if (missing?.missing) {
      selectSet(missing.index, missing.missing);
      return;
    }
    // All shown as done first, so the rest timer doesn't start when they finish the workout.
    for (const row of rows) store.markLogged(exercise.sets[row.index].id, row.values);
    for (const row of rows) void commit(exercise, row.index, row.values);
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
    void commit(exercise, index, values);
  }

  /**
   * The Live Activity's "Log set": logs set `setIndex` of exercise `atExercise` with what its row
   * shows and shows that exercise. What the open row was typed with is kept first.
   */
  function logSetAt(atExercise: number, setIndex: number) {
    const target = exercises[atExercise];
    const set = target?.sets[setIndex];
    if (!set || set.completedAt || set.id in useWorkoutSessionStore.getState().logged) return;
    closeInput();
    if (atExercise !== exerciseIndex) useWorkoutSessionStore.getState().goTo(atExercise);
    const store = useWorkoutSessionStore.getState();
    const { values, missing } = parseSetInput(
      toSetInput(
        rowValues(target, setIndex, store.logged, null, store.drafts, suggestedValues(target)),
        units,
      ),
      measuresOf(target.exerciseId),
      isBodyweight(target.exerciseId),
      units,
    );
    if (!missing) void commit(target, setIndex, values);
  }

  return {
    units,
    exercise,
    measures,
    exerciseIndex,
    last,
    suggestions,
    suggestedValues,
    doneSets,
    totalSets: allSets.length,
    selectedIndex,
    openIndex,
    selectSet,
    pickRir,
    closeInput,
    goToExercise,
    confirmInput,
    toggleDone,
    toggleAll,
    logSetAt,
  };
}
