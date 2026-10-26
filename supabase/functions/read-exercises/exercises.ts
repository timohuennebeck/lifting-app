// What the model is asked about exercises the user said, and how its answer becomes the list the
// app adds; each exercise is read as read-plan reads one (_shared/exercise-reading.ts). Plain
// TypeScript without Deno APIs, so it can be tested outside the Edge runtime.

import {
  EXERCISE_RULES,
  exerciseReader,
  exerciseSchema,
  type ModelExercise,
} from '../_shared/exercise-reading.ts';
import type { ImportedExercise, NewExercise } from '../_shared/plan-events.ts';
import type { CatalogRow } from '../_shared/plans.ts';

export { contextText } from '../_shared/exercise-reading.ts';

export const INSTRUCTIONS = `You turn what a user said into exercises for a strength and bodybuilding app. The input is what speech recognition made of the user naming exercises for one workout, in their own words and with little or no punctuation, in German, English, Portuguese, Korean or a mix, with gym slang.

Return every exercise in the order said. Leave out filler words and anything that is not an exercise. When the user corrects themselves ("drei, nein, vier Sätze"), take the correction.

${EXERCISE_RULES}

Speech:
- raw: the exercise's words as recognized, without the sets and reps.
- Numbers come as words: "drei mal zwölf" or "three by twelve" = 3 sets of 12; "vier Sätze acht bis zwölf Wiederholungen" = 4 sets of 8 to 12; "três séries de dez" = 3 sets of 10; Korean names the reps before the sets: "15회 3세트" or "열다섯 개씩 세 세트" = 3 sets of 15.
- Speech recognition gets exercise names wrong, above all English gym terms said in another language ("Bänsch Press" = bench press, "Lett Pull Down" = lat pulldown, "벤치 프레스" = bench press). Match what sounds alike and fits a workout; such an exercise is certain unless it could be more than one catalog exercise.

If no exercise is named at all, return no exercises.`;

/** The answer's shape: the exercises in the order said. */
export const buildSchema = (ids: string[]) => ({
  type: 'object',
  additionalProperties: false,
  required: ['exercises'],
  properties: { exercises: { type: 'array', items: exerciseSchema(ids) } },
});

/** The model's answer, forced by `buildSchema`. */
export interface ModelAnswer {
  exercises: ModelExercise[];
}

/** What the app gets: the exercises, and the ones the catalog lacks, which they reference. */
export interface SpokenExercises {
  exercises: ImportedExercise[];
  newExercises: NewExercise[];
}

/** The answer as the app adds it (see `exerciseReader`); lines without an exercise are left out. */
export function spokenExercises(
  answer: ModelAnswer,
  catalog: CatalogRow[],
  newId: () => string,
): SpokenExercises {
  const read = exerciseReader(catalog, newId);
  const result: SpokenExercises = { exercises: [], newExercises: [] };
  for (const line of answer.exercises) {
    const exercise = read(line);
    if (!exercise) continue;
    result.exercises.push(exercise.exercise);
    if (exercise.newExercise) result.newExercises.push(exercise.newExercise);
  }
  return result;
}
