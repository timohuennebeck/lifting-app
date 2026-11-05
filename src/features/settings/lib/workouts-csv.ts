import { toIsoDate } from '@/shared/lib/date';
import { toDisplayWeight, type UnitSystem, weightUnit } from '@/shared/lib/format';

/** One completed set with its exercise and workout, as read for the export. */
export interface ExportSet {
  workoutId: string;
  workoutExerciseId: string;
  startedAt: string;
  finishedAt: string;
  workout: string;
  plan: string | null;
  planWeek: number | null;
  exerciseId: string;
  weightKg: number | null;
  reps: number | null;
  seconds: number | null;
  rir: number | null;
  isPr: boolean;
  targetMin: number | null;
  targetMax: number | null;
  targetRir: number | null;
  restSeconds: number | null;
}

/** Marks the file as UTF-8, so Excel shows umlauts and Korean correctly. */
const BYTE_ORDER_MARK = '\uFEFF';
const LINE_END = '\r\n';

const pad = (value: number) => String(value).padStart(2, '0');

/** An instant in the device's time zone with its offset: "2026-11-03T18:12:00+01:00". */
export function toLocalIso(iso: string) {
  const date = new Date(iso);
  const offset = -date.getTimezoneOffset();
  const sign = offset < 0 ? '-' : '+';
  const zone = `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${toIsoDate(date)}T${time}${zone}`;
}

/** A typed name, kept from running as a formula when a spreadsheet opens the file. */
const textCell = (value: string) => (/^[=+\-@\t\r]/.test(value) ? `'${value}` : value);

/** Quoted when it holds a comma, a quote or a line break. */
const csvLine = (cells: (string | number | null)[]) =>
  cells
    .map((cell) => {
      const text = cell === null ? '' : String(cell);
      return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
    })
    .join(',') + LINE_END;

/** The start of the file; the weight column names the unit its values are in. */
export const workoutsCsvHeader = (units: UnitSystem) =>
  BYTE_ORDER_MARK +
  csvLine([
    'started_at',
    'finished_at',
    'workout',
    'plan',
    'plan_week',
    'exercise_order',
    'exercise',
    'exercise_id',
    'set',
    `weight_${weightUnit(units)}`,
    'reps',
    'duration_seconds',
    'rir',
    'is_pr',
    'target_min',
    'target_max',
    'target_rir',
    'rest_seconds',
  ]);

/**
 * Turns sets into lines, in the order they are given: each workout's sets together, each
 * exercise's sets together. Exercises and sets are numbered from 1 as they come, since stored
 * positions start at 0 and can have gaps. Weights are the numbers the app shows, with a decimal
 * point in every language.
 */
export function workoutsCsvWriter(units: UnitSystem, exerciseName: (exerciseId: string) => string) {
  let workoutId: string | null = null;
  let workoutExerciseId: string | null = null;
  let exerciseOrder = 0;
  let setNumber = 0;

  return (set: ExportSet) => {
    if (set.workoutId !== workoutId) {
      workoutId = set.workoutId;
      exerciseOrder = 0;
    }
    if (set.workoutExerciseId !== workoutExerciseId) {
      workoutExerciseId = set.workoutExerciseId;
      exerciseOrder += 1;
      setNumber = 0;
    }
    setNumber += 1;
    return csvLine([
      toLocalIso(set.startedAt),
      toLocalIso(set.finishedAt),
      textCell(set.workout),
      set.plan === null ? null : textCell(set.plan),
      set.planWeek,
      exerciseOrder,
      textCell(exerciseName(set.exerciseId)),
      set.exerciseId,
      setNumber,
      set.weightKg === null ? null : Number(toDisplayWeight(set.weightKg, units).toFixed(2)),
      set.reps,
      set.seconds,
      set.rir,
      set.isPr ? 'true' : 'false',
      set.targetMin,
      set.targetMax,
      set.targetRir,
      set.restSeconds,
    ]);
  };
}
