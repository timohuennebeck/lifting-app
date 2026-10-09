import { defaultSetDrafts, swapTargets } from '@/shared/data/exercises';

import type { ImportedDay, ImportedExercise, ImportedPlan } from './plan-import-service';

/** Sets an exercise added during the check starts with. */
const NEW_SETS = 3;

/** Drops the import's doubts about an exercise once the user has settled it. */
export const settle = ({
  raw: _raw,
  alternatives: _alts,
  ...e
}: ImportedExercise): ImportedExercise => e;

/** The plan with day `index` changed by `edit`. */
export const editDayAt = (
  plan: ImportedPlan,
  index: number,
  edit: (day: ImportedDay) => ImportedDay,
): ImportedPlan => ({ ...plan, days: plan.days.map((d, i) => (i === index ? edit(d) : d)) });

/** The day with exercise `at` changed by `edit`. */
export const editExerciseAt = (
  day: ImportedDay,
  at: number,
  edit: (e: ImportedExercise) => ImportedExercise,
): ImportedDay => ({ ...day, exercises: day.exercises.map((e, i) => (i === at ? edit(e) : e)) });

/** Appends exercises with default target sets. */
export const addExercises = (day: ImportedDay, exerciseIds: string[]): ImportedDay => ({
  ...day,
  exercises: [
    ...day.exercises,
    ...exerciseIds.map((exerciseId) => ({
      exerciseId,
      sets: defaultSetDrafts(exerciseId, NEW_SETS),
      restSeconds: null,
    })),
  ],
});

/** Replaces exercise `at`; its sets get new defaults when the measures differ. */
export const swapExercise = (day: ImportedDay, at: number, exerciseId: string): ImportedDay =>
  editExerciseAt(day, at, (e) =>
    settle({
      ...e,
      exerciseId,
      sets: swapTargets(e.exerciseId, exerciseId)
        ? defaultSetDrafts(exerciseId, e.sets.length)
        : e.sets,
    }),
  );
