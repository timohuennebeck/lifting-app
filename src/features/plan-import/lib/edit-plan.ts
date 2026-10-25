import { newExerciseDraft, swapExerciseDraft } from '@/shared/data/exercises';
import { newId } from '@/shared/data/json';

import type { ImportedExercise, ImportedPlan, ImportedRoutine } from './plan-import-service';

/** Drops the import's doubts about an exercise once the user has settled it. */
export const settle = ({
  raw: _raw,
  alternatives: _alts,
  heard: _heard,
  ...e
}: ImportedExercise): ImportedExercise => e;

/** The plan with routine `index` changed by `edit`. */
export const editRoutineAt = (
  plan: ImportedPlan,
  index: number,
  edit: (routine: ImportedRoutine) => ImportedRoutine,
): ImportedPlan => ({
  ...plan,
  routines: plan.routines.map((r, i) => (i === index ? edit(r) : r)),
});

/** The routine with exercise `at` changed by `edit`. */
export const editExerciseAt = (
  routine: ImportedRoutine,
  at: number,
  edit: (e: ImportedExercise) => ImportedExercise,
): ImportedRoutine => ({
  ...routine,
  exercises: routine.exercises.map((e, i) => (i === at ? edit(e) : e)),
});

/** Appends exercises with default target sets. */
export const addExercises = (routine: ImportedRoutine, exerciseIds: string[]): ImportedRoutine => ({
  ...routine,
  exercises: [
    ...routine.exercises,
    ...exerciseIds.map((id) => ({ ...newExerciseDraft(id), key: newId() })),
  ],
});

/** Replaces exercise `at`; its sets get new defaults when the measures differ. */
export const swapExercise = (
  routine: ImportedRoutine,
  at: number,
  exerciseId: string,
): ImportedRoutine => editExerciseAt(routine, at, (e) => settle(swapExerciseDraft(e, exerciseId)));
