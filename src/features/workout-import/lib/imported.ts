// What an import took over, as the "Importiert" page and an exercise's history show it, from the
// workouts as they were saved (or are kept until sign-up).

import { isAssisted, isBodyweight } from '@/shared/data/exercises';
import {
  volumeKg,
  type ExerciseHistoryEntry,
  type ExerciseHistorySet,
} from '@/shared/data/workouts';
import { getOrInsert } from '@/shared/lib/map';
import type { SetValues } from '@/shared/lib/format';

import type { WorkoutRow } from './save-history';

/** How good a set of an exercise is. */
export type SetScore = (exerciseId: string, set: SetValues) => number;

/**
 * Sets ranked as the app ranks top sets and records (setScoreSql): a bodyweight exercise's load
 * is the body weight plus what was added, an assisted machine's the body weight minus the help.
 */
export function setScorer(bodyWeightKg: number): SetScore {
  return (exerciseId, { weightKg, reps, seconds }) => {
    if (seconds != null) return (weightKg ?? 1) * seconds;
    if (reps == null) return 0;
    if (weightKg == null) return reps;
    let load = weightKg;
    if (isBodyweight(exerciseId)) load = bodyWeightKg + weightKg;
    else if (isAssisted(exerciseId)) load = Math.max(bodyWeightKg - weightKg, 0);
    return load * (1 + reps / 30);
  };
}

/** An exercise of the import: in how many workouts, and its best set. */
export interface ImportedExercise {
  exerciseId: string;
  workouts: number;
  best: SetValues;
  /** The import made it (new to the catalog). */
  created: boolean;
}

const valuesOf = (s: WorkoutRow['exercises'][number]['sets'][number]): SetValues => ({
  weightKg: s.weight_kg,
  reps: s.reps,
  seconds: s.seconds,
});

/** The imported exercises, the most trained first. */
export function importedExercises(
  workouts: WorkoutRow[],
  created: string[],
  score: SetScore,
): ImportedExercise[] {
  const byId = new Map<string, { workouts: Set<string>; best: SetValues; score: number }>();
  for (const w of workouts) {
    for (const e of w.exercises) {
      const entry = getOrInsert(byId, e.exercise_id, () => ({
        workouts: new Set<string>(),
        best: { weightKg: null, reps: null, seconds: null },
        score: -1,
      }));
      entry.workouts.add(w.id);
      for (const s of e.sets) {
        const values = valuesOf(s);
        const value = score(e.exercise_id, values);
        if (value > entry.score) {
          entry.best = values;
          entry.score = value;
        }
      }
    }
  }
  return [...byId]
    .map(([exerciseId, e]) => ({
      exerciseId,
      workouts: e.workouts.size,
      best: e.best,
      created: created.includes(exerciseId),
    }))
    .sort((a, b) => b.workouts - a.workouts);
}

/**
 * One exercise's sessions of the import, newest first, as useExerciseHistory gives them: a set
 * that beats every earlier one of the exercise, in the same workout too, is a record (as
 * import_workouts marks them).
 */
export function importedHistory(
  workouts: WorkoutRow[],
  exerciseId: string,
  score: SetScore,
): ExerciseHistoryEntry[] {
  const sessions = workouts
    .flatMap((w) => {
      const sets = w.exercises.filter((e) => e.exercise_id === exerciseId).flatMap((e) => e.sets);
      return sets.length ? [{ w, sets }] : [];
    })
    .sort((a, b) => a.w.started_at.localeCompare(b.w.started_at));
  // The best so far; 0 (none yet) makes no record, as when a set is logged.
  let best = 0;
  const entries = sessions.map(({ w, sets }): ExerciseHistoryEntry => {
    let top: ExerciseHistorySet | null = null;
    let topScore = -Infinity;
    const history = sets.map((s): ExerciseHistorySet => {
      const values = valuesOf(s);
      const value = score(exerciseId, values);
      const set = { ...values, rir: s.rir, isPr: best > 0 && value > best + 0.01 };
      best = Math.max(best, value);
      if (value > topScore) {
        top = set;
        topScore = value;
      }
      return set;
    });
    return {
      workoutId: w.id,
      name: w.name,
      startedAt: w.started_at,
      sets: history,
      topSet: top ?? history[0],
      volumeKg: volumeKg(exerciseId, history),
      hasPr: history.some((s) => s.isPr),
    };
  });
  return entries.reverse();
}
