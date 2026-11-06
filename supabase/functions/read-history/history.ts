// What the model is asked about a workout file the user brought from another app or a
// spreadsheet, and how its answers become the app's. Step 1: what each sheet holds and which
// column is which (the app then reads every row itself). Step 2: which catalog exercise each name
// in the file is. And names for the routines the app found in a history whose workouts have none.
// Plain TypeScript without Deno APIs, so it can be tested outside the Edge runtime.

import {
  type ModelExercise,
  NAME_RULES,
  nameSchema,
  newExerciseMaker,
} from '../_shared/exercise-reading.ts';
import { cut, type NewExercise } from '../_shared/plan-events.ts';
import type { CatalogRow } from '../_shared/plans.ts';

/** The columns the app reads a workout log by. */
export const COLUMNS = [
  'date',
  'end_time',
  'duration',
  'workout',
  'exercise',
  'set_order',
  'set_type',
  'sets',
  'weight',
  'weight_unit',
  'reps',
  'seconds',
  'rpe',
  'rir',
] as const;
type ColumnKey = (typeof COLUMNS)[number];

/** One sheet as the app describes it; a CSV file is one sheet. */
export interface SheetSample {
  name: string;
  /** Data rows, the header not counted. */
  rows: number;
  header: string[];
  /** Per column over all rows: how many are filled and differ, common, first and last values. */
  columns: unknown[];
  /** A spread of rows as written, each with its line number. */
  sample: string[];
}

const isText = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length <= max;

/** The sheets of a categorize request, or null when they aren't what the app sends. */
export function sheetSamples(value: unknown): SheetSample[] | null {
  if (!Array.isArray(value) || !value.length || value.length > 20) return null;
  const valid = value.every(
    (s) =>
      isText(s?.name, 100) &&
      Number.isInteger(s.rows) &&
      Array.isArray(s.header) &&
      s.header.length <= 80 &&
      s.header.every((h: unknown) => isText(h, 200)) &&
      Array.isArray(s.columns) &&
      s.columns.length <= 80 &&
      Array.isArray(s.sample) &&
      s.sample.length <= 150 &&
      s.sample.every((line: unknown) => isText(line, 1000)),
  );
  return valid ? (value as SheetSample[]) : null;
}

export const CATEGORIZE_INSTRUCTIONS = `You look at the sheets of a file a lifter exported from a workout tracking app (Hevy, Strong, …) or kept themselves, for a strength training app that imports it. For each sheet say what it holds:
- history: workouts that were done: rows with dates (or rows of dated workouts) and the weights and reps actually lifted, usually one row per set or per exercise.
- plan: a training plan to follow: training days or routines (Push, Day A, Montag) with exercises and target sets and reps; no dates of workouts done, few or no logged weights.
- both: a plan and a log of workouts in the same sheet; say in split how their rows differ.
- none: no training data (nutrition, notes, body measurements, an empty or unrelated sheet).

You see each sheet's header, statistics per column over ALL its rows (they are exact, the sample is not) and sample rows with their line numbers. Name columns by their exact header text, null when the sheet has none:
- date: when the workout was (a date, or date and time). end_time: when it ended. duration: how long it took.
- workout: the workout's or routine's name. exercise: the exercise's name.
- set_order: the set's number within the exercise. set_type: warm-up, normal, drop set or failure, when a column says so. sets: how many sets a row stands for, when one row is one exercise ("3" sets of the reps and weight in that row).
- weight, weight_unit (a column saying kg or lb per row), reps, seconds (a set's time), rpe, rir.
Then:
- day_order: "day_first" when dates are written day before month (31.12.2025, 31/12/2025), "month_first" (12/31/2025), "year_first" (2025-12-31), null when there are no dates or it can't be told. Dates with a month name ("1 Nov 2025") are day_first or month_first as written.
- weight_unit: from the header or the values ("weight_kg" = kg, "lbs" = lb); unknown when nothing says.
- split (only for both, else "none"): "undated_rows_are_plan" when the plan's rows have no date, "column_value" when a column's values mark the plan's rows (give split_column and plan_values), "unclear" otherwise.`;

const nullable = (schema: object) => ({ anyOf: [schema, { type: 'null' }] });

/** Step 1's answer shape: one entry per sheet. */
export function categorizeSchema(sheetNames: string[]) {
  const column = nullable({ type: 'string' });
  return {
    type: 'object',
    additionalProperties: false,
    required: ['sheets'],
    properties: {
      sheets: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'name',
            'kind',
            'columns',
            'day_order',
            'weight_unit',
            'split',
            'split_column',
            'plan_values',
          ],
          properties: {
            name: { type: 'string', enum: sheetNames },
            kind: { type: 'string', enum: ['history', 'plan', 'both', 'none'] },
            columns: {
              type: 'object',
              additionalProperties: false,
              required: [...COLUMNS],
              properties: Object.fromEntries(COLUMNS.map((key) => [key, column])),
            },
            day_order: nullable({
              type: 'string',
              enum: ['day_first', 'month_first', 'year_first'],
            }),
            weight_unit: { type: 'string', enum: ['kg', 'lb', 'unknown'] },
            split: {
              type: 'string',
              enum: ['none', 'undated_rows_are_plan', 'column_value', 'unclear'],
            },
            split_column: column,
            plan_values: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  };
}

/** What step 1 says about a sheet, forced by `categorizeSchema`. */
export interface SheetKind {
  name: string;
  kind: 'history' | 'plan' | 'both' | 'none';
  columns: Record<ColumnKey, string | null>;
  day_order: 'day_first' | 'month_first' | 'year_first' | null;
  weight_unit: 'kg' | 'lb' | 'unknown';
  split: 'none' | 'undated_rows_are_plan' | 'column_value' | 'unclear';
  split_column: string | null;
  plan_values: string[];
}

/** What the model reads for step 1: the file's name, then each sheet. */
export function categorizeContent(file: string, sheets: SheetSample[]) {
  return [
    `File: ${file}`,
    ...sheets.map((s) =>
      [
        `Sheet "${s.name}": ${s.rows} data rows.`,
        `Header: ${s.header.join(' | ')}`,
        `Column statistics over all rows:\n${JSON.stringify(s.columns)}`,
        `Sample rows (line: values separated by |):\n${s.sample.join('\n')}`,
      ].join('\n'),
    ),
  ].join('\n\n');
}

/**
 * Step 1's answer for the app: each sheet once, in the request's order (one the model left out
 * holds nothing), with only columns the sheet has.
 */
export function sheetKinds(answer: { sheets: SheetKind[] }, sheets: SheetSample[]): SheetKind[] {
  return sheets.map((sheet) => {
    const said = answer.sheets.find((s) => s.name === sheet.name);
    const has = (name: string | null) => (name && sheet.header.includes(name) ? name : null);
    if (!said) {
      return {
        name: sheet.name,
        kind: 'none',
        columns: Object.fromEntries(COLUMNS.map((key) => [key, null])) as SheetKind['columns'],
        day_order: null,
        weight_unit: 'unknown',
        split: 'none',
        split_column: null,
        plan_values: [],
      };
    }
    return {
      ...said,
      columns: Object.fromEntries(
        COLUMNS.map((key) => [key, has(said.columns[key])]),
      ) as SheetKind['columns'],
      split_column: has(said.split_column),
      plan_values: said.plan_values.slice(0, 50).map((v) => cut(v, 100)),
    };
  });
}

/** An exercise name of the file, with what helps tell which exercise it is. */
export interface NameSample {
  name: string;
  /** Sets logged with it. */
  sets: number;
  /** E.g. "usually 80 kg × 8" or "in the plan": the load tells a barbell from a dumbbell lift. */
  hint: string;
}

/** Names per map request; the app sends more in several. */
export const MAX_NAMES = 80;

/** The names of a map request, or null when they aren't what the app sends. */
export function nameSamples(value: unknown): NameSample[] | null {
  if (!Array.isArray(value) || !value.length || value.length > MAX_NAMES) return null;
  const valid = value.every(
    (n) => isText(n?.name, 200) && n.name.trim() && Number.isInteger(n.sets) && isText(n.hint, 100),
  );
  return valid ? (value as NameSample[]) : null;
}

export const MAP_INSTRUCTIONS = `You match the exercise names of a lifter's workout file (exported from a tracking app such as Hevy or Strong, or a spreadsheet they kept) to the exercise catalog of a strength training app. The names come in any language, with tracker-app conventions ("Bench Press (Barbell)", "Lat Pulldown (Cable)": equipment in brackets), abbreviations, typos and gym slang.

Answer for every name, in the order given. For each:
${NAME_RULES}
Here raw is the name exactly as given. Each name comes with how many sets were logged with it and the usual load, which helps tell e.g. a barbell from a dumbbell lift when the name doesn't say.`;

/** Step 2's answer shape: one entry per name, in order. */
export const mapSchema = (ids: string[]) => ({
  type: 'object',
  additionalProperties: false,
  required: ['exercises'],
  properties: { exercises: { type: 'array', items: nameSchema(ids) } },
});

/** A name of step 2's answer, forced by `mapSchema`. */
export type ModelName = Pick<
  ModelExercise,
  'raw' | 'catalog_id' | 'certain' | 'alternatives' | 'new_exercise'
>;

/** What the model reads for step 2: one line per name. */
export const mapContent = (names: NameSample[]) =>
  `Exercise names (name — sets logged, usual load):\n${names
    .map((n) => `${n.name} — ${n.sets} sets${n.hint ? `, ${n.hint}` : ''}`)
    .join('\n')}`;

/** Which exercise a name of the file is. */
export interface MappedName {
  name: string;
  /** A catalog id or a new exercise's; null when the model found neither. */
  exerciseId: string | null;
  /** False when the name could be more than one exercise: the app asks the user. */
  certain: boolean;
  /** Other plausible catalog ids, most likely first. */
  alternatives: string[];
  /** The exercise the catalog lacks, which `exerciseId` names. */
  newExercise?: NewExercise;
}

/**
 * Step 2's answer for the app, one entry per name asked: matched by position when the model
 * answered for each, else by the name it repeated. A new exercise is made once per name (see
 * newExerciseMaker).
 */
export function mappedNames(
  answer: { exercises: ModelName[] },
  names: NameSample[],
  catalog: CatalogRow[],
  newId: () => string,
): MappedName[] {
  const ids = new Set(catalog.map((e) => e.id));
  const newExercise = newExerciseMaker(newId);
  const byPosition = answer.exercises.length === names.length;
  return names.map(({ name }, i) => {
    const line = byPosition
      ? answer.exercises[i]
      : answer.exercises.find((e) => e.raw.trim().toLowerCase() === name.trim().toLowerCase());
    if (!line) return { name, exerciseId: null, certain: false, alternatives: [] };
    const catalogId = line.catalog_id && ids.has(line.catalog_id) ? line.catalog_id : null;
    const { fresh } =
      !catalogId && line.new_exercise
        ? newExercise(line.new_exercise, name)
        : { fresh: undefined };
    const exerciseId = catalogId ?? fresh?.id ?? null;
    return {
      name,
      exerciseId,
      certain: !!exerciseId && line.certain,
      alternatives: line.alternatives.filter((a) => a !== exerciseId && ids.has(a)).slice(0, 2),
      ...(fresh ? { newExercise: fresh } : {}),
    };
  });
}

/** A routine the app found in a history: its usual exercises, and how often it was done. */
export interface RoutineSample {
  exercises: string[];
  workouts: number;
}

/** The routines of a name request, or null when they aren't what the app sends. */
export function routineSamples(value: unknown): RoutineSample[] | null {
  if (!Array.isArray(value) || !value.length || value.length > 12) return null;
  const valid = value.every(
    (r) =>
      Array.isArray(r?.exercises) &&
      r.exercises.length <= 20 &&
      r.exercises.every((e: unknown) => isText(e, 100)) &&
      Number.isInteger(r.workouts),
  );
  return valid ? (value as RoutineSample[]) : null;
}

export const NAME_INSTRUCTIONS = `You name the routines (training days) a lifter repeats, from their exercises, the way a lifter would: "Push", "Pull", "Legs", "Upper", "Lower", "Full Body A". Short (at most 24 characters), in the app language, one name per routine in the order given, no two the same.`;

/** The name request's answer shape. */
export const routineNamesSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['names'],
  properties: { names: { type: 'array', items: { type: 'string' } } },
};

/** What the model reads for naming: one line per routine. */
export const routinesContent = (language: string, routines: RoutineSample[]) =>
  `App language: ${language}.\n\nRoutines (workouts done: usual exercises):\n${routines
    .map((r, i) => `${i + 1}. ${r.workouts}: ${r.exercises.join(', ')}`)
    .join('\n')}`;

/** One name per routine asked, cut to the app's length; empty where the model gave none. */
export const routineNames = (answer: { names: string[] }, count: number) =>
  Array.from({ length: count }, (_, i) => cut(answer.names[i] ?? '', 24));
