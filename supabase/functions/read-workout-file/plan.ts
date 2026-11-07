// What the model is asked about a training plan and how its answer becomes the plan the app
// reviews; each exercise is read as read-exercises reads one (_shared/exercise-reading.ts).
// Plain TypeScript without Deno APIs, so it can be tested outside the Edge runtime.

import {
  EXERCISE_RULES,
  exerciseReader,
  exerciseSchema,
  type ModelExercise,
} from '../_shared/exercise-reading.ts';
import { ROUTINE_NAME_MAX } from '../_shared/limits.ts';
import { cut, type ImportedRoutine } from '../_shared/plan-events.ts';
import type { CatalogRow } from '../_shared/plans.ts';

export const INSTRUCTIONS = `You read training plans for a strength and bodybuilding app from a file the user brought: the rows of a spreadsheet or a CSV export (cells separated by commas or |), in any language or a mix, with gym abbreviations.

Return the plan's training days as routines in the order the plan lists them, and every exercise of a routine in order (supersets and circuits one after another). Leave out warm-up notes, cardio blocks and comments that are not exercises, and rows that log workouts done (dates with the weights lifted). If the file holds several plans (versions, blocks or phases one after another), return only the newest: the one with the latest date, else the last one.

${EXERCISE_RULES}

Each routine:
- heading: its heading as written ("Tag 1 – Push", "Montag", "Upper A").
- name: a short name for what it trains (at most 24 characters) in the plan's language, e.g. "Push", "Oberkörper A", "Beine"; not a weekday.

name: the plan's title if it has one, else a short name for the split ("Push Pull Legs", "Ganzkörper"), at most 30 characters.

If the input is not a training plan or cannot be read at all, set is_plan to false and return no routines.`;

/** The answer's shape: whether it is a plan, its name, and its routines with their exercises. */
export function buildSchema(ids: string[]) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['is_plan', 'name', 'routines'],
    properties: {
      is_plan: { type: 'boolean' },
      name: { type: 'string' },
      routines: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['heading', 'name', 'exercises'],
          properties: {
            heading: { type: 'string' },
            name: { type: 'string' },
            exercises: { type: 'array', items: exerciseSchema(ids) },
          },
        },
      },
    },
  };
}

/** A routine of the model's answer, forced by `buildSchema`. */
export interface ModelRoutine {
  heading: string;
  name: string;
  exercises: ModelExercise[];
}

/**
 * Turns the model's answer into the shapes the app stores, part by part as it streams in: the
 * routines' names, and the exercises as `exerciseReader` makes them.
 */
export function planReader(catalog: CatalogRow[], newId: () => string) {
  return {
    routine: (routine: Omit<ModelRoutine, 'exercises'>): ImportedRoutine => ({
      name: cut(routine.name, ROUTINE_NAME_MAX) || cut(routine.heading, ROUTINE_NAME_MAX),
    }),
    /**
     * The exercise, with the new exercise it introduces the first time one is used; null for a
     * line with neither a catalog exercise nor a usable new one.
     */
    exercise: exerciseReader(catalog, newId),
  };
}
