// Turns a workout log's rows into workouts, by the columns read-workout-file named (step 1): rows of
// the same date and workout name are one workout, rows of the same exercise in it one exercise,
// and each row a set (or several, when the file writes one row per exercise). Rows without a date
// form workouts by their order, as tracker exports write them. Warm-up sets are left out; weights
// in pounds become kilograms and RPE becomes reps in reserve. Plain TypeScript.

import { type DayOrder, parseDate, parseMinutes, parseNumber } from './values';

/** A sheet of the file (a CSV file is one): its rows as text, the header first. */
export interface ImportTable {
  name: string;
  rows: string[][];
}

/** The columns read-workout-file names, by their header text; null when the sheet has none. */
export type ColumnKey =
  | 'date'
  | 'end_time'
  | 'duration'
  | 'workout'
  | 'exercise'
  | 'set_order'
  | 'set_type'
  | 'sets'
  | 'weight'
  | 'weight_unit'
  | 'reps'
  | 'seconds'
  | 'rpe'
  | 'rir';

/** What read-workout-file says about a sheet (its step 1). */
export interface SheetReading {
  name: string;
  kind: 'history' | 'plan' | 'both' | 'none';
  columns: Record<ColumnKey, string | null>;
  day_order: DayOrder | null;
  weight_unit: 'kg' | 'lb' | 'unknown';
  split: 'none' | 'undated_rows_are_plan' | 'column_value' | 'unclear';
  split_column: string | null;
  plan_values: string[];
}

export interface LoggedSet {
  weightKg: number | null;
  reps: number | null;
  seconds: number | null;
  rir: number | null;
}

export interface LoggedExercise {
  /** As the file names it. */
  name: string;
  sets: LoggedSet[];
}

export interface LoggedWorkout {
  /** As the file names it; null when it doesn't. */
  name: string | null;
  /** Null when the file has no date for it. */
  start: Date | null;
  end: Date | null;
  exercises: LoggedExercise[];
  /** Its first row's line in the file, for the order of workouts without a date. */
  line: number;
  /** The date is a guess (see spreadUndated). */
  estimated?: boolean;
}

const LB_TO_KG = 0.45359237;
/** Sets a row may stand for. */
const MAX_ROW_SETS = 20;

/** Seconds as written: "45", "45 s", "1:30" (minutes and seconds). */
function parseSeconds(raw: string) {
  const clock = raw.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (clock) return +clock[1] * 60 + +clock[2];
  return parseNumber(raw);
}

/** Characters of an exercise name kept: a cell can hold a note. */
const MAX_NAME = 120;

const positive = (value: number | null) => (value != null && value > 0 ? value : null);

/** Lower case, spaces collapsed: how a header the model names is matched. */
const headerKey = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * The column the model named: the header with that text, regardless of case and spacing (the
 * model may not copy it exactly; a long one it saw cut to 200 characters with "…"); -1 for none.
 */
function columnAt(header: string[], name: string | null) {
  if (!name) return -1;
  const key = headerKey(name.replace(/…$/, ''));
  const exact = header.findIndex((h) => headerKey(h) === key);
  return exact >= 0 || !name.endsWith('…')
    ? exact
    : header.findIndex((h) => headerKey(h).startsWith(key));
}

/**
 * The rows of a sheet split into workouts (as `LoggedWorkout`s, in file order) and, for a sheet
 * with a plan and a log, the plan's rows (header first) for read-workout-file.
 */
export function readLog(table: ImportTable, reading: SheetReading) {
  const [header = [], ...rows] = table.rows;
  const planRows: string[][] = [header];
  if (reading.kind === 'plan' || reading.kind === 'none') {
    return { workouts: [], planRows: reading.kind === 'plan' ? table.rows : [] };
  }
  const index = (key: ColumnKey) => columnAt(header, reading.columns[key]);
  const col = Object.fromEntries(
    (Object.keys(reading.columns) as ColumnKey[]).map((key) => [key, index(key)]),
  ) as Record<ColumnKey, number>;
  const splitAt = columnAt(header, reading.split_column);
  const planValues = new Set(reading.plan_values.map((v) => v.trim().toLowerCase()));
  const poundsHeader = /\b(lb|lbs|pounds?)\b/i.test(reading.columns.weight ?? '');

  const workouts: LoggedWorkout[] = [];
  const byKey = new Map<string, LoggedWorkout>();
  let last: LoggedWorkout | null = null;

  rows.forEach((row, i) => {
    const line = i + 2;
    const get = (key: ColumnKey) => (col[key] >= 0 ? (row[col[key]] ?? '').trim() : '');
    const dateText = get('date');
    if (reading.kind === 'both') {
      const isPlan =
        (reading.split === 'undated_rows_are_plan' && !dateText) ||
        (reading.split === 'column_value' &&
          splitAt >= 0 &&
          planValues.has((row[splitAt] ?? '').trim().toLowerCase()));
      if (isPlan) {
        planRows.push(row);
        return;
      }
    }
    // Capped: a cell can hold a note, and read-workout-file takes names of up to 200 characters.
    const exerciseName = get('exercise').slice(0, MAX_NAME);
    if (!exerciseName) return;
    if (/warm|aufw[aä]rm|echauff|calenta|aquec/i.test(get('set_type'))) return;

    const workoutName = get('workout') || null;
    let workout: LoggedWorkout | undefined;
    if (dateText) {
      const key = `${dateText}|${workoutName ?? ''}`;
      workout = byKey.get(key);
      if (!workout) {
        workout = {
          name: workoutName,
          start: parseDate(dateText, reading.day_order),
          end: parseDate(get('end_time'), reading.day_order),
          exercises: [],
          line,
        };
        const minutes = parseMinutes(get('duration'));
        if (!workout.end && workout.start && minutes) {
          workout.end = new Date(workout.start.getTime() + minutes * 60_000);
        }
        byKey.set(key, workout);
        workouts.push(workout);
      }
    } else {
      // Without a date: a new workout when the name changes, or when set 1 of an exercise the
      // workout already has comes again.
      const order = parseNumber(get('set_order'));
      const repeats =
        last?.start === null &&
        (order === 1 || order === 0) &&
        last.exercises.some((e) => e.name === exerciseName);
      if (last && last.start === null && last.name === workoutName && !repeats) workout = last;
      else {
        workout = { name: workoutName, start: null, end: null, exercises: [], line };
        workouts.push(workout);
      }
    }
    last = workout;

    let exercise = workout.exercises.find((e) => e.name === exerciseName);
    if (!exercise) {
      exercise = { name: exerciseName, sets: [] };
      workout.exercises.push(exercise);
    }
    const unit = get('weight_unit').toLowerCase();
    const pounds = unit
      ? unit.startsWith('lb') || unit.startsWith('pound')
      : poundsHeader || reading.weight_unit === 'lb';
    const weight = parseNumber(get('weight'));
    const rpe = parseNumber(get('rpe'));
    const rir = parseNumber(get('rir'));
    const set: LoggedSet = {
      weightKg: weight == null ? null : Math.max(0, pounds ? weight * LB_TO_KG : weight),
      reps: positive(parseNumber(get('reps'))),
      seconds: positive(parseSeconds(get('seconds'))),
      rir:
        rir != null
          ? Math.min(5, Math.max(0, Math.round(rir)))
          : rpe != null && rpe >= 5 && rpe <= 10
            ? Math.min(5, Math.max(0, Math.round(10 - rpe)))
            : null,
    };
    if (set.reps == null && set.seconds == null) return;
    const count = Math.min(MAX_ROW_SETS, Math.max(1, Math.round(parseNumber(get('sets')) ?? 1)));
    for (let k = 0; k < count; k++) exercise.sets.push({ ...set });
  });

  const now = Date.now();
  return {
    // Workouts with nothing logged, or dated after today, are left out.
    workouts: workouts.filter(
      (w) => w.exercises.some((e) => e.sets.length) && (!w.start || w.start.getTime() <= now),
    ),
    planRows: planRows.length > 1 ? planRows : [],
  };
}

/** Workouts oldest first; those without a date keep their place between their neighbours. */
export function chronological(workouts: LoggedWorkout[]) {
  return [...workouts].sort(
    (a, b) =>
      (a.start?.getTime() ?? Infinity) - (b.start?.getTime() ?? Infinity) || a.line - b.line,
  );
}

const DAY_MS = 86_400_000;

/**
 * Gives the workouts without a date one, spread evenly between the dated workouts around them in
 * the file (past the newest one every two days up to today, before the oldest every two days
 * back), marked `estimated`. In file order, so a tracker's undated workouts land between the
 * right dates, whether the file lists the newest or the oldest first.
 */
export function spreadUndated(workouts: LoggedWorkout[]): LoggedWorkout[] {
  const inOrder = [...workouts].sort((a, b) => a.line - b.line);
  const dated = inOrder.flatMap((w) => (w.start ? [w.start.getTime()] : []));
  const newestFirst = dated.length > 1 && dated[0] > dated[dated.length - 1];
  const result: LoggedWorkout[] = [];
  let i = 0;
  while (i < inOrder.length) {
    if (inOrder[i].start) {
      result.push(inOrder[i++]);
      continue;
    }
    let j = i;
    while (j < inOrder.length && !inOrder[j].start) j++;
    const run = inOrder.slice(i, j);
    const before = result.length ? result[result.length - 1].start : null;
    const after = j < inOrder.length ? inOrder[j].start : null;
    const older = (newestFirst ? after : before)?.getTime() ?? null;
    const newer = (newestFirst ? before : after)?.getTime() ?? null;
    run.forEach((w, k) => {
      // Its place counted from the oldest of the run.
      const rank = newestFirst ? run.length - 1 - k : k;
      let time: number;
      if (older !== null && newer !== null) {
        const [from, to] = older <= newer ? [older, newer] : [newer, older];
        time = from + ((to - from) * (rank + 1)) / (run.length + 1);
      } else if (older !== null) time = Math.min(Date.now(), older + (rank + 1) * 2 * DAY_MS);
      else time = (newer ?? Date.now()) - (run.length - rank) * 2 * DAY_MS;
      result.push({ ...w, start: new Date(time), end: null, estimated: true });
    });
    i = j;
  }
  return result;
}

/** Per exercise name of the file: sets logged, workouts it is in, and its usual top set. */
export interface NameUse {
  name: string;
  sets: number;
  workouts: number;
  /** Median heaviest set per workout, in kg; null without weights. */
  weightKg: number | null;
  reps: number | null;
  seconds: number | null;
}

const median = (values: number[]) => {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor((sorted.length - 1) / 2)] : null;
};

/** How each exercise name is used across the workouts, most sets first. */
export function nameUses(workouts: LoggedWorkout[]): NameUse[] {
  const uses = new Map<string, { sets: number; workouts: number; tops: LoggedSet[] }>();
  for (const w of workouts) {
    for (const e of w.exercises) {
      const use = uses.get(e.name) ?? { sets: 0, workouts: 0, tops: [] };
      use.sets += e.sets.length;
      use.workouts = use.workouts + 1;
      const top = [...e.sets].sort(
        (a, b) => (b.weightKg ?? 0) - (a.weightKg ?? 0) || (b.reps ?? 0) - (a.reps ?? 0),
      )[0];
      if (top) use.tops.push(top);
      uses.set(e.name, use);
    }
  }
  return [...uses.entries()]
    .map(([name, use]) => ({
      name,
      sets: use.sets,
      workouts: use.workouts,
      weightKg: median(use.tops.flatMap((t) => (t.weightKg ? [t.weightKg] : []))),
      reps: median(use.tops.flatMap((t) => (t.reps ? [t.reps] : []))),
      seconds: median(use.tops.flatMap((t) => (t.seconds ? [t.seconds] : []))),
    }))
    .sort((a, b) => b.sets - a.sets);
}

/** "usually 80 kg × 8", "usually 45 s", "no weight": what helps the model tell the exercise. */
export function usualLoad(use: NameUse) {
  if (use.seconds)
    return `usually ${use.seconds} s${use.weightKg ? ` with ${use.weightKg} kg` : ''}`;
  if (use.weightKg) return `usually ${Math.round(use.weightKg * 10) / 10} kg × ${use.reps ?? '?'}`;
  return use.reps ? `usually ${use.reps} reps without weight` : '';
}
