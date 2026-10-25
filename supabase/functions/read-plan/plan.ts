// What the model is asked about a training plan and how its answer becomes the plan the app
// reviews. Plain TypeScript without Deno APIs, so it can be tested outside the Edge runtime.

import {
  catalogNames,
  cut,
  type ImportedExercise,
  type ImportedRoutine,
  MUSCLES,
  type NewExercise,
  type PlanExercise,
  type SetTarget,
} from '../_shared/plan-events.ts';
import type { CatalogRow } from '../_shared/plans.ts';

type Muscle = (typeof MUSCLES)[number];

const MAX_SETS = 10;
const DEFAULT_SETS = 3;
const DEFAULT_REST_SECONDS = 90;

export const INSTRUCTIONS = `You read training plans for a strength and bodybuilding app from photos, scans, documents or spreadsheets: printed, typed, handwritten or on a whiteboard, in German, English, Portuguese or a mix, with gym abbreviations.

Return the plan's training days as routines in the order the plan lists them, and every exercise of a routine in order (supersets and circuits one after another). Leave out warm-up notes, cardio blocks and comments that are not exercises.

For each exercise:
- raw: the line as written, abbreviations included.
- catalog_id: the catalog exercise that is the same movement with the same equipment. Read abbreviations and slang: KH = Kurzhantel = dumbbell, LH = Langhantel = barbell, SZ = EZ bar, BD = Bankdrücken, KB = kettlebell, "Lat ziehen" = lat pulldown, "Beinstrecker" = leg extension, "Multipresse" / Smith = Smith machine. A variation that has its own catalog entry (incline, close grip, single arm, seated) is that entry.
- certain: false when the text is hard to read or could be more than one catalog exercise; then give up to 2 alternatives from the catalog, most likely first.
- new_exercise: only when no catalog exercise is the same movement. Give it a clean name in the plan's language (as a lifter would call it, no sets or reps), its primary and secondary muscles, whether it is timed (holds, carries) and whether a weight is logged. Never create one for something the catalog has under another name. The same new exercise in several routines gets exactly the same name each time.
- sets, reps_min, reps_max: "3x10" = 3 sets of 10 to 10; "4x8-12" = 8 to 12; "3x12/10/8" = 3 sets of 8 to 12; "AMRAP" or "to failure" = no reps. Missing values are null.
- seconds: for holds and timed sets ("3x30s", "60 Sek."), else null.
- rir: reps in reserve if written, from RPE as 10 minus RPE; else null.
- rest_seconds: rest if written ("90s", "2 min"), else null. Ignore weights in kg or lb.

Each routine:
- heading: its heading as written ("Tag 1 – Push", "Montag", "Upper A").
- name: a short name for what it trains (at most 24 characters) in the plan's language, e.g. "Push", "Oberkörper A", "Beine"; not a weekday.

name: the plan's title if it has one, else a short name for the split ("Push Pull Legs", "Ganzkörper"), at most 30 characters.

If the input is not a training plan or cannot be read at all, set is_plan to false and return no routines.`;

/** Added to INSTRUCTIONS when the plan was said out loud instead of written. */
export const SPOKEN_INSTRUCTIONS = `This plan was said out loud: the input is what speech recognition made of it, in the user's own words, with little or no punctuation. Read it like a written plan, and also:
- Numbers come as words: "drei mal zwölf" or "three by twelve" = 3 sets of 12; "vier Sätze acht bis zwölf Wiederholungen" = 4 sets of 8 to 12; "três séries de dez" = 3 sets of 10.
- Speech recognition gets exercise names wrong, above all English gym terms said in another language ("Bänsch Press" = bench press, "Lett Pull Down" = lat pulldown). Match what sounds alike and fits a training plan; such a line is certain unless it could be more than one catalog exercise.
- raw: the exercise's words as recognized, without the sets and reps.
- A day or a name said before exercises starts a routine ("Montag Push", "Tag zwei Beine", "pull day"); its heading is that as said. Without any, all exercises are one routine.
- When the user corrects themselves ("drei, nein, vier Sätze"), take the correction. Leave out filler words and anything that is not an exercise.
- is_plan is false only when no exercise is named at all.`;

/** The catalog as the model reads it: one line per exercise with its names in a few languages. */
export function catalogText(catalog: CatalogRow[], language: string) {
  return catalog
    .map((e) => {
      const names = catalogNames(e.name, language);
      const logs = e.measures.includes('seconds') ? 'timed' : 'reps';
      return `${e.id} | ${names} | ${e.equipment} | ${logs}`;
    })
    .join('\n');
}

export function contextText(catalog: CatalogRow[], language: string) {
  return `App language: ${language}.\n\nCatalog (id | names | equipment | logs):\n${catalogText(catalog, language)}`;
}

const nullable = (schema: object) => ({ anyOf: [schema, { type: 'null' }] });
const integer = nullable({ type: 'integer' });

/**
 * The answer's shape. Catalog ids and muscles are listed, so the model can only pick existing
 * ones (OpenAI allows 1,000 listed values per schema: enough for twice the catalog for now).
 */
export function buildSchema(ids: string[]) {
  const id = { type: 'string', enum: ids };
  const muscles = { type: 'array', items: { type: 'string', enum: [...MUSCLES] } };
  const newExercise = {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'primary', 'secondary', 'timed', 'weighted'],
    properties: {
      name: { type: 'string' },
      primary: muscles,
      secondary: muscles,
      timed: { type: 'boolean' },
      weighted: { type: 'boolean' },
    },
  };
  const exercise = {
    type: 'object',
    additionalProperties: false,
    required: [
      'raw',
      'catalog_id',
      'certain',
      'alternatives',
      'new_exercise',
      'sets',
      'reps_min',
      'reps_max',
      'seconds',
      'rir',
      'rest_seconds',
    ],
    properties: {
      raw: { type: 'string' },
      catalog_id: nullable(id),
      certain: { type: 'boolean' },
      alternatives: { type: 'array', items: id },
      new_exercise: nullable(newExercise),
      sets: integer,
      reps_min: integer,
      reps_max: integer,
      seconds: integer,
      rir: integer,
      rest_seconds: integer,
    },
  };
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
            exercises: { type: 'array', items: exercise },
          },
        },
      },
    },
  };
}

export interface ModelExercise {
  raw: string;
  catalog_id: string | null;
  certain: boolean;
  alternatives: string[];
  new_exercise: {
    name: string;
    primary: string[];
    secondary: string[];
    timed: boolean;
    weighted: boolean;
  } | null;
  sets: number | null;
  reps_min: number | null;
  reps_max: number | null;
  seconds: number | null;
  rir: number | null;
  rest_seconds: number | null;
}

/** A routine of the model's answer, forced by `buildSchema`. */
export interface ModelRoutine {
  heading: string;
  name: string;
  exercises: ModelExercise[];
}

const clampInt = (value: number | null, min: number, max: number) =>
  value == null || !Number.isFinite(value) ? null : Math.min(max, Math.max(min, Math.round(value)));

/** The app's target editor (and the database) take up to 60 reps or 600 seconds. */
const MAX_REPS = 60;
const MAX_SECONDS = 600;

/** Targets of one set: seconds for timed exercises, else the rep range; RIR is about reps. */
function setTarget(line: ModelExercise, timed: boolean): SetTarget {
  if (timed) {
    // "3x30" on a plank means seconds.
    const seconds = clampInt(line.seconds ?? line.reps_max ?? line.reps_min, 1, MAX_SECONDS);
    return { targetMin: seconds, targetMax: seconds, rir: null };
  }
  let min = clampInt(line.reps_min ?? line.reps_max, 1, MAX_REPS);
  let max = clampInt(line.reps_max ?? line.reps_min, 1, MAX_REPS);
  if (min != null && max != null && min > max) [min, max] = [max, min];
  return { targetMin: min, targetMax: max, rir: clampInt(line.rir, 0, 5) };
}

/**
 * Turns the model's answer into the shapes the app stores, part by part as it streams in: each
 * set as a row, and every new exercise once with an id (`newId()`) the plan references. Numbers
 * are kept in the ranges the database accepts.
 */
export function planReader(catalog: CatalogRow[], newId: () => string) {
  const timedIds = new Set(catalog.filter((e) => e.measures.includes('seconds')).map((e) => e.id));
  // The same new exercise in two routines is one exercise.
  const created = new Map<string, NewExercise>();

  const newExercise = (
    { name, primary, secondary, timed, weighted }: NonNullable<ModelExercise['new_exercise']>,
    raw: string,
  ) => {
    // A name the database accepts (1–60 characters): the line as written if the model gave none.
    const clean = cut(name, 60) || cut(raw, 60);
    const key = clean.toLocaleLowerCase();
    const known = created.get(key);
    if (known || !clean || !primary.length) return { fresh: known, first: false };
    const fresh: NewExercise = {
      id: newId(),
      name: clean,
      primary: [...new Set(primary)] as Muscle[],
      secondary: [...new Set(secondary)].filter((m) => !primary.includes(m)) as Muscle[],
      measures: [...(weighted ? ['weight'] : []), timed ? 'seconds' : 'reps'],
      restSeconds: DEFAULT_REST_SECONDS,
    };
    created.set(key, fresh);
    return { fresh, first: true };
  };

  return {
    routine: (routine: Omit<ModelRoutine, 'exercises'>): ImportedRoutine => ({
      name: cut(routine.name, 24) || cut(routine.heading, 24),
    }),

    /**
     * The exercise, with the new exercise it introduces the first time one is used; null for a
     * line with neither a catalog exercise nor a usable new one.
     */
    exercise: (line: ModelExercise): PlanExercise | null => {
      const { fresh, first } =
        !line.catalog_id && line.new_exercise
          ? newExercise(line.new_exercise, line.raw)
          : { fresh: undefined, first: false };
      const id = line.catalog_id ?? fresh?.id;
      if (!id) return null;
      const timed = fresh ? fresh.measures.includes('seconds') : timedIds.has(id);
      const target = setTarget(line, timed);
      const exercise: ImportedExercise = {
        exerciseId: id,
        sets: Array.from({ length: clampInt(line.sets, 1, MAX_SETS) ?? DEFAULT_SETS }, () => ({
          ...target,
        })),
        restSeconds: clampInt(line.rest_seconds, 0, 600),
        ...(line.certain
          ? {}
          : {
              raw: cut(line.raw, 80),
              alternatives: line.alternatives.filter((a) => a !== id).slice(0, 2),
            }),
      };
      return { exercise, newExercise: first ? fresh : undefined };
    },
  };
}
