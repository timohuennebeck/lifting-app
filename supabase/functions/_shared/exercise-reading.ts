// How the model reads one exercise and how its answer becomes the app's, shared by read-plan (a
// plan from a file), read-exercises (exercises said out loud) and read-history (the exercise names
// of a workout file): the rules for an exercise, the catalog the model picks from, the exercise's
// answer shape, and the clean-up into sets the database accepts. Plain TypeScript without Deno APIs, so it can be tested outside the
// Edge runtime.

import { clampInt } from './numbers.ts';
import {
  catalogNames,
  cut,
  type ImportedExercise,
  MUSCLES,
  type NewExercise,
  type PlanExercise,
  type SetTarget,
} from './plan-events.ts';
import type { CatalogRow } from './plans.ts';
import { DEFAULT_REST } from './rest.ts';

type Muscle = (typeof MUSCLES)[number];

const MAX_SETS = 10;
const DEFAULT_SETS = 3;

/** How the model picks the exercise a name means: the catalog one, or a new one. */
export const NAME_RULES = `- raw: the line as written, abbreviations included.
- catalog_id: the catalog exercise that is the same movement with the same equipment. Read abbreviations and slang: KH = Kurzhantel = dumbbell, LH = Langhantel = barbell, SZ = EZ bar, BD = Bankdrücken, KB = kettlebell, "Lat ziehen" = lat pulldown, "Beinstrecker" = leg extension, "Multipresse" / Smith = Smith machine. A variation that has its own catalog entry (incline, close grip, single arm, seated) is that entry.
- certain: false when the text is hard to read or could be more than one catalog exercise; then give up to 2 alternatives from the catalog, most likely first.
- new_exercise: only when no catalog exercise is the same movement. Give it a clean name in the plan's language (as a lifter would call it, no sets or reps), its primary and secondary muscles, whether it is timed (holds, carries) and whether a weight is logged. Never create one for something the catalog has under another name. The same new exercise in several routines gets exactly the same name each time.`;

/** What the model writes for each exercise, as part of the plan functions' instructions. */
export const EXERCISE_RULES = `For each exercise:
${NAME_RULES}
- sets, reps_min, reps_max: "3x10" = 3 sets of 10 to 10; "4x8-12" = 8 to 12; "3x12/10/8" = 3 sets of 8 to 12; "AMRAP" or "to failure" = no reps. Missing values are null.
- seconds: for holds and timed sets ("3x30s", "60 Sek."), else null.
- rir: reps in reserve if written, from RPE as 10 minus RPE; else null.
- rest_seconds: rest if written ("90s", "2 min"), else null. Ignore weights in kg or lb.`;

/** The catalog as the model reads it: one line per exercise with its names in a few languages. */
function catalogText(catalog: CatalogRow[], language: string) {
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
 * The answer shape for which exercise a name is (see NAME_RULES). Catalog ids and muscles are
 * listed, so the model can only pick existing ones (OpenAI allows 1,000 listed values per schema:
 * enough for twice the catalog).
 */
export function nameSchema(ids: string[]) {
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
  return {
    type: 'object',
    additionalProperties: false,
    required: ['raw', 'catalog_id', 'certain', 'alternatives', 'new_exercise'],
    properties: {
      raw: { type: 'string' },
      catalog_id: nullable(id),
      certain: { type: 'boolean' },
      alternatives: { type: 'array', items: id },
      new_exercise: nullable(newExercise),
    },
  };
}

/** One exercise's answer shape: which exercise it is (nameSchema), and its sets as written. */
export function exerciseSchema(ids: string[]) {
  const name = nameSchema(ids);
  return {
    type: 'object',
    additionalProperties: false,
    required: [
      ...name.required,
      'sets',
      'reps_min',
      'reps_max',
      'seconds',
      'rir',
      'rest_seconds',
    ],
    properties: {
      ...name.properties,
      sets: integer,
      reps_min: integer,
      reps_max: integer,
      seconds: integer,
      rir: integer,
      rest_seconds: integer,
    },
  };
}

/** An exercise of the model's answer, forced by `exerciseSchema`. */
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

/** A whole number within min…max (see clampInt); null when there is none. */
const clampOrNull = (value: number | null, min: number, max: number) =>
  value == null || !Number.isFinite(value) ? null : clampInt(value, min, max);

/** The app's target editor (and the database) take up to 60 reps or 600 seconds. */
const MAX_REPS = 60;
const MAX_SECONDS = 600;

/** Targets of one set: seconds for timed exercises, else the rep range; RIR is about reps. */
function setTarget(line: ModelExercise, timed: boolean): SetTarget {
  if (timed) {
    // "3x30" on a plank means seconds.
    const seconds = clampOrNull(line.seconds ?? line.reps_max ?? line.reps_min, 1, MAX_SECONDS);
    return { targetMin: seconds, targetMax: seconds, rir: null };
  }
  let min = clampOrNull(line.reps_min ?? line.reps_max, 1, MAX_REPS);
  let max = clampOrNull(line.reps_max ?? line.reps_min, 1, MAX_REPS);
  if (min != null && max != null && min > max) [min, max] = [max, min];
  return { targetMin: min, targetMax: max, rir: clampOrNull(line.rir, 0, 5) };
}

/**
 * Makes the exercises the catalog lacks, each once with an id (`newId()`): the same new exercise
 * twice (e.g. in two routines) is one exercise. `fresh` is the exercise, `first` whether this call
 * made it; neither when the model's one is unusable (no name, no primary muscle).
 */
export function newExerciseMaker(newId: () => string) {
  const created = new Map<string, NewExercise>();
  return (
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
      restSeconds: DEFAULT_REST,
    };
    created.set(key, fresh);
    return { fresh, first: true };
  };
}

/**
 * Turns the model's exercises into the shapes the app stores, one at a time as they come: each
 * set as a row, and every new exercise once with an id (`newId()`) the exercises reference.
 * Numbers are kept in the ranges the database accepts. Returns null for a line with neither a
 * catalog exercise nor a usable new one, else the exercise with the new exercise it introduces
 * the first time one is used.
 */
export function exerciseReader(catalog: CatalogRow[], newId: () => string) {
  const timedIds = new Set(catalog.filter((e) => e.measures.includes('seconds')).map((e) => e.id));
  const newExercise = newExerciseMaker(newId);

  return (line: ModelExercise): PlanExercise | null => {
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
      sets: Array.from({ length: clampOrNull(line.sets, 1, MAX_SETS) ?? DEFAULT_SETS }, () => ({
        ...target,
      })),
      restSeconds: clampOrNull(line.rest_seconds, 0, 600),
      ...(line.certain
        ? {}
        : {
            raw: cut(line.raw, 80),
            alternatives: line.alternatives.filter((a) => a !== id).slice(0, 2),
          }),
    };
    return { exercise, newExercise: first ? fresh : undefined };
  };
}
