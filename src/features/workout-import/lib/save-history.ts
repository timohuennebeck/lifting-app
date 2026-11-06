import { File, Paths } from 'expo-file-system';

import type { CustomExercise, Measure } from '@/shared/data/exercises';
import { insertCustomExercises } from '@/shared/data/custom-exercises';
import { newId } from '@/shared/data/json';
import { singleFlight } from '@/shared/lib/async';
import { MINUTE_MS } from '@/shared/lib/date';
import { ROUTINE_NAME_MAX } from '@/shared/lib/limits';
import { drizzle } from '@/shared/data/powersync/database';
import { supabase } from '@/shared/data/supabase';
import { track } from '@/shared/lib/posthog';
import { clamp } from '@/shared/lib/math';

import type { LoggedSet } from './history';

/** A workout of the import with its exercises as the app's, ready to save. */
export interface WorkoutToSave {
  name: string;
  start: Date;
  /** When the file says; else an estimate from its sets. */
  end: Date | null;
  exercises: { exerciseId: string; measures: Measure[]; bodyweight: boolean; sets: LoggedSet[] }[];
}

/** A workout as public.import_workouts takes it (see its migration). */
export interface WorkoutRow {
  id: string;
  name: string;
  started_at: string;
  finished_at: string;
  exercises: {
    id: string;
    exercise_id: string;
    position: number;
    sets: {
      id: string;
      position: number;
      weight_kg: number | null;
      reps: number | null;
      seconds: number | null;
      rir: number | null;
    }[];
  }[];
}

/** The database's limits (workout_entries_sets): weight numeric(6,2), reps 0–999. */
const MAX_WEIGHT = 9999.99;
const MAX_REPS = 999;

/**
 * A set as the exercise logs it: a weight only for exercises with one (0 for bodyweight ones the
 * file left empty), seconds for timed ones, reps otherwise. Null when the file lacks what it needs.
 */
function setRow(set: LoggedSet, measures: Measure[], bodyweight: boolean) {
  const timed = measures.includes('seconds');
  const value = timed ? set.seconds : set.reps;
  if (!value) return null;
  const weight = measures.includes('weight')
    ? set.weightKg != null
      ? Math.min(MAX_WEIGHT, Math.round(set.weightKg * 100) / 100)
      : bodyweight
        ? 0
        : null
    : null;
  return {
    weight_kg: weight,
    reps: timed ? null : Math.min(MAX_REPS, Math.round(value)),
    seconds: timed ? Math.round(value) : null,
    rir: timed ? null : set.rir,
  };
}

/**
 * The workouts as rows, oldest first: each start at most once (the database leaves out a workout
 * that starts with one it has), and an end after the start: the file's, else about three minutes
 * a set.
 */
export function toRows(workouts: WorkoutToSave[]): WorkoutRow[] {
  const taken = new Set<number>();
  return [...workouts]
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .flatMap((w) => {
      const exercises = w.exercises.flatMap((e, position) => {
        const sets = e.sets.flatMap((s, i) => {
          const row = setRow(s, e.measures, e.bodyweight);
          return row ? [{ id: newId(), position: i, ...row }] : [];
        });
        return sets.length ? [{ id: newId(), exercise_id: e.exerciseId, position, sets }] : [];
      });
      if (!exercises.length) return [];
      let start = Math.floor(w.start.getTime() / MINUTE_MS) * MINUTE_MS;
      while (taken.has(start)) start += MINUTE_MS;
      taken.add(start);
      const setCount = exercises.reduce((n, e) => n + e.sets.length, 0);
      const fileEnd = w.end?.getTime();
      const end =
        fileEnd && fileEnd > start && fileEnd - start < 6 * 60 * MINUTE_MS
          ? fileEnd
          : start + clamp(setCount * 3, 20, 120) * MINUTE_MS;
      return [
        {
          id: newId(),
          name: w.name.trim().slice(0, ROUTINE_NAME_MAX) || 'Training',
          started_at: new Date(start).toISOString(),
          finished_at: new Date(end).toISOString(),
          exercises: exercises.map((e, position) => ({ ...e, position })),
        },
      ];
    });
}

/** Workouts per call; public.import_workouts takes up to 200. */
const BATCH = 100;

/**
 * Saves the workouts to the user's account: their own exercises first (on the device, uploaded by
 * PowerSync), then the workouts in a few calls (PowerSync syncs them down). Workouts the account
 * has already are left out. Throws when a call fails.
 */
export async function sendHistory(userId: string, rows: WorkoutRow[], custom: CustomExercise[]) {
  await insertCustomExercises(drizzle, userId, custom);
  let added = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { data, error } = await supabase.rpc('import_workouts', {
      p_workouts: rows.slice(i, i + BATCH),
    });
    if (error) throw error;
    added += (data as number | null) ?? 0;
  }
  track('workout_import:save_complete', { workout_count: rows.length, added_count: added });
}

/** A history imported before there is an account, saved with it (see sendPendingHistory). */
const pendingFile = () => new File(Paths.document, 'workout-import.json');

interface Pending {
  rows: WorkoutRow[];
  custom: CustomExercise[];
}

/** Keeps the history on the device until the account is made (onboarding). */
export function keepForSignUp(rows: WorkoutRow[], custom: CustomExercise[]) {
  pendingFile().write(JSON.stringify({ rows, custom } satisfies Pending));
}

/**
 * Saves a history kept from onboarding to the account, once. A failure keeps it for the next try
 * (the app's start, see useSendPendingHistory).
 */
export function sendPendingHistory(userId: string) {
  // The app's start may run twice (a remount, the account changing): one send at a time.
  return singleFlight('pending-history', async () => {
    const file = pendingFile();
    if (!file.exists) return;
    const pending = JSON.parse(await file.text()) as Pending;
    await sendHistory(userId, pending.rows, pending.custom);
    file.delete();
  });
}

/** Forgets a history kept for sign-up (onboarding started over). */
export function dropPendingHistory() {
  const file = pendingFile();
  if (file.exists) file.delete();
}
