import { type ExerciseRow, getExercise } from '@/shared/data/exercises';

import { type LevelExercise, targetKind } from './levels';

/** What the level math needs of an exercise, from the catalog; undefined for an unknown one. */
export function levelExerciseOf(
  id: string,
  rows: Record<string, ExerciseRow>,
): LevelExercise | undefined {
  const exercise = getExercise(id);
  if (!exercise) return undefined;
  const row = rows[id];
  return {
    standard: row?.strength_standard ?? null,
    measures: exercise.measures,
    equipment: exercise.equipment,
    assisted: row?.assisted ?? false,
    muscles: exercise.muscles,
  };
}

/** Whether ranks can be put in numbers for an exercise (a weight or reps target). */
export function canShowRanksFor(id: string, rows: Record<string, ExerciseRow>) {
  const exercise = levelExerciseOf(id, rows);
  return !!exercise && targetKind(exercise) !== null;
}
