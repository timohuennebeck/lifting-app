import { newId, nowIso } from './json';
import { db } from './powersync/database';
import { queryKeys } from './query-keys';
import { useSqlQuery } from './use-sql-query';

/** Epley estimated one-rep max, used for PR detection. */
export const estimateOneRepMax = (kg: number, reps: number) => kg * (1 + reps / 30);

/** Copies a template (or nothing, for an empty workout) into a new running workout. */
export async function startWorkout(userId: string, name: string, templateId: string | null) {
  const workoutId = newId();
  await db.writeTransaction(async (tx) => {
    await tx.execute(
      `INSERT INTO workouts (id, user_id, template_id, name, started_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workoutId, userId, templateId, name, nowIso(), nowIso()],
    );
    if (!templateId) return;
    const exercises = await tx.getAll<{
      id: string;
      exercise_id: string;
      position: number;
      rest_seconds: number | null;
    }>(
      'SELECT id, exercise_id, position, rest_seconds FROM template_exercises WHERE template_id = ? ORDER BY position',
      [templateId],
    );
    for (const te of exercises) {
      const workoutExerciseId = newId();
      await tx.execute(
        `INSERT INTO workout_exercises (id, user_id, workout_id, exercise_id, position, rest_seconds)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [workoutExerciseId, userId, workoutId, te.exercise_id, te.position, te.rest_seconds],
      );
      await tx.execute(
        `INSERT INTO workout_sets (id, user_id, workout_exercise_id, position, target_min, target_max, target_rir, is_pr)
         SELECT uuid(), ?, ?, position, reps_min, reps_max, rir, 0
         FROM template_sets WHERE template_exercise_id = ? ORDER BY position`,
        [userId, workoutExerciseId, te.id],
      );
    }
  });
  return workoutId;
}

/** Adds an exercise with `setCount` empty sets to a running workout. */
export async function addWorkoutExercise(
  userId: string,
  workoutId: string,
  exerciseId: string,
  setCount = 3,
  target: { min: number; max: number; rir: number | null } = { min: 8, max: 12, rir: 2 },
) {
  await db.writeTransaction(async (tx) => {
    const id = newId();
    await tx.execute(
      `INSERT INTO workout_exercises (id, user_id, workout_id, exercise_id, position, rest_seconds)
       VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM workout_exercises WHERE workout_id = ?), NULL)`,
      [id, userId, workoutId, exerciseId, workoutId],
    );
    for (let i = 0; i < setCount; i++) {
      await tx.execute(
        `INSERT INTO workout_sets (id, user_id, workout_exercise_id, position, target_min, target_max, target_rir, is_pr)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [newId(), userId, id, i, target.min, target.max, target.rir],
      );
    }
  });
}

/** Best estimated 1RM for an exercise across all completed sets, excluding one set. */
async function bestOneRepMax(exerciseId: string, excludeSetId: string) {
  const rows = await db.getAll<{ weight_kg: number; reps: number }>(
    `SELECT s.weight_kg, s.reps FROM workout_sets s
     JOIN workout_exercises we ON we.id = s.workout_exercise_id
     WHERE we.exercise_id = ? AND s.completed_at IS NOT NULL AND s.id != ?`,
    [exerciseId, excludeSetId],
  );
  return rows.reduce((best, r) => Math.max(best, estimateOneRepMax(r.weight_kg, r.reps)), 0);
}

/** Completes (or re-edits) a set. Returns true when it is a new personal record. */
export async function logSet(setId: string, exerciseId: string, weightKg: number, reps: number) {
  const best = await bestOneRepMax(exerciseId, setId);
  const isPr = best > 0 && estimateOneRepMax(weightKg, reps) > best + 0.01;
  await db.execute(
    `UPDATE workout_sets SET weight_kg = ?, reps = ?, is_pr = ?,
       completed_at = COALESCE(completed_at, ?) WHERE id = ?`,
    [weightKg, reps, isPr ? 1 : 0, nowIso(), setId],
  );
  return isPr;
}

export async function finishWorkout(workoutId: string) {
  await db.writeTransaction(async (tx) => {
    // Unlogged sets are dropped so history only holds real work.
    await tx.execute(
      `DELETE FROM workout_sets WHERE completed_at IS NULL AND workout_exercise_id IN
         (SELECT id FROM workout_exercises WHERE workout_id = ?)`,
      [workoutId],
    );
    await tx.execute('UPDATE workouts SET finished_at = ? WHERE id = ?', [nowIso(), workoutId]);
  });
}

/** Local SQLite views have no FK cascades, so children are removed explicitly. */
export async function discardWorkout(workoutId: string) {
  await db.writeTransaction(async (tx) => {
    await tx.execute(
      `DELETE FROM workout_sets WHERE workout_exercise_id IN
         (SELECT id FROM workout_exercises WHERE workout_id = ?)`,
      [workoutId],
    );
    await tx.execute('DELETE FROM workout_exercises WHERE workout_id = ?', [workoutId]);
    await tx.execute('DELETE FROM workouts WHERE id = ?', [workoutId]);
  });
}

export interface WorkoutSet {
  id: string;
  position: number;
  targetMin: number | null;
  targetMax: number | null;
  targetRir: number | null;
  weightKg: number | null;
  reps: number | null;
  completedAt: string | null;
  isPr: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  position: number;
  restSeconds: number | null;
  sets: WorkoutSet[];
}

export interface WorkoutDetail {
  id: string;
  name: string;
  templateId: string | null;
  startedAt: string;
  finishedAt: string | null;
  exercises: WorkoutExercise[];
}

interface WorkoutDetailRow {
  id: string;
  name: string;
  template_id: string | null;
  started_at: string;
  finished_at: string | null;
  we_id: string | null;
  exercise_id: string | null;
  position: number | null;
  rest_seconds: number | null;
  set_json: string | null;
}

const WORKOUT_DETAIL_SQL = `
  SELECT w.id, w.name, w.template_id, w.started_at, w.finished_at,
    we.id AS we_id, we.exercise_id, we.position, we.rest_seconds,
    (SELECT json_group_array(json_object('id', s.id, 'position', s.position,
       'targetMin', s.target_min, 'targetMax', s.target_max, 'targetRir', s.target_rir,
       'weightKg', s.weight_kg, 'reps', s.reps, 'completedAt', s.completed_at, 'isPr', s.is_pr))
     FROM (SELECT * FROM workout_sets WHERE workout_exercise_id = we.id ORDER BY position) s) AS set_json
  FROM workouts w LEFT JOIN workout_exercises we ON we.workout_id = w.id`;

function toDetail(data: unknown[]): WorkoutDetail | null {
  const rows = data as WorkoutDetailRow[];
  if (!rows.length) return null;
  const [w] = rows;
  return {
    id: w.id,
    name: w.name,
    templateId: w.template_id,
    startedAt: w.started_at,
    finishedAt: w.finished_at,
    exercises: rows
      .filter((r) => r.we_id && r.exercise_id)
      .map((r) => ({
        id: r.we_id!,
        exerciseId: r.exercise_id!,
        position: r.position ?? 0,
        restSeconds: r.rest_seconds,
        sets: (
          JSON.parse(r.set_json ?? '[]') as (Omit<WorkoutSet, 'isPr'> & { isPr: number })[]
        ).map((s) => ({
          ...s,
          isPr: !!s.isPr,
        })),
      })),
  };
}

export function useWorkout(workoutId: string | undefined) {
  return useSqlQuery({
    queryKey: queryKeys.workouts.detail(workoutId ?? '').queryKey,
    enabled: !!workoutId,
    sql: `${WORKOUT_DETAIL_SQL} WHERE w.id = ? ORDER BY we.position`,
    parameters: [workoutId],
    map: toDetail,
  });
}

/** The running (unfinished) workout, if any. */
export function useActiveWorkout() {
  return useSqlQuery({
    queryKey: queryKeys.workouts.active.queryKey,
    sql: `SELECT id, name, started_at FROM workouts WHERE finished_at IS NULL
            ORDER BY started_at DESC LIMIT 1`,
    map: (rows) =>
      (rows[0] as { id: string; name: string; started_at: string } | undefined) ?? null,
  });
}

export interface WorkoutSummary {
  id: string;
  name: string;
  templateId: string | null;
  startedAt: string;
  finishedAt: string;
  volumeKg: number;
  setCount: number;
  prCount: number;
  /** Exercise ids with completed set counts, for muscle shares. */
  items: { exerciseId: string; sets: number }[];
}

interface SummaryRow {
  id: string;
  name: string;
  template_id: string | null;
  started_at: string;
  finished_at: string;
  exercise_id: string | null;
  sets: number;
  volume: number;
  prs: number;
}

function toSummaries(data: unknown[]): WorkoutSummary[] {
  const map = new Map<string, WorkoutSummary>();
  for (const r of data as SummaryRow[]) {
    const w =
      map.get(r.id) ??
      map
        .set(r.id, {
          id: r.id,
          name: r.name,
          templateId: r.template_id,
          startedAt: r.started_at,
          finishedAt: r.finished_at,
          volumeKg: 0,
          setCount: 0,
          prCount: 0,
          items: [],
        })
        .get(r.id)!;
    if (!r.exercise_id) continue;
    w.items.push({ exerciseId: r.exercise_id, sets: r.sets });
    w.volumeKg += r.volume;
    w.setCount += r.sets;
    w.prCount += r.prs;
  }
  return [...map.values()];
}

const SUMMARY_SQL = `
  SELECT w.id, w.name, w.template_id, w.started_at, w.finished_at, we.exercise_id,
    COUNT(s.id) AS sets, COALESCE(SUM(s.weight_kg * s.reps), 0) AS volume, COALESCE(SUM(s.is_pr), 0) AS prs
  FROM workouts w
  LEFT JOIN workout_exercises we ON we.workout_id = w.id
  LEFT JOIN workout_sets s ON s.workout_exercise_id = we.id AND s.completed_at IS NOT NULL
  WHERE w.finished_at IS NOT NULL`;

/** Finished workouts that started within [from, to). */
export function useWorkoutsInRange(fromIso: string, toIso: string) {
  return useSqlQuery({
    queryKey: queryKeys.workouts.range(fromIso, toIso).queryKey,
    sql: `${SUMMARY_SQL} AND w.started_at >= ? AND w.started_at < ?
            GROUP BY w.id, we.id ORDER BY w.started_at DESC, we.position`,
    parameters: [fromIso, toIso],
    map: toSummaries,
  });
}

export function useWorkoutHistory() {
  return useSqlQuery({
    queryKey: queryKeys.workouts.history.queryKey,
    sql: `${SUMMARY_SQL} GROUP BY w.id, we.id ORDER BY w.started_at DESC, we.position`,
    map: toSummaries,
  });
}

export interface ExerciseHistorySet {
  position: number;
  weightKg: number;
  reps: number;
  rir: number | null;
  isPr: boolean;
}

export interface ExerciseHistoryEntry {
  workoutId: string;
  /** Workout name. */
  name: string;
  startedAt: string;
  finishedAt: string | null;
  sets: ExerciseHistorySet[];
}

/** Completed sets of one exercise from finished workouts, newest first. */
export function useExerciseHistory(exerciseId: string | undefined) {
  return useSqlQuery({
    queryKey: queryKeys.workouts.exerciseHistory(exerciseId ?? '').queryKey,
    enabled: !!exerciseId,
    sql: `SELECT w.id AS workout_id, w.name, w.started_at, w.finished_at, s.position, s.weight_kg,
              s.reps, s.target_rir, s.is_pr
            FROM workout_sets s
            JOIN workout_exercises we ON we.id = s.workout_exercise_id
            JOIN workouts w ON w.id = we.workout_id
            WHERE we.exercise_id = ? AND s.completed_at IS NOT NULL AND w.finished_at IS NOT NULL
            ORDER BY w.started_at DESC, we.position, s.position`,
    parameters: [exerciseId],
    map: (data) => {
      const map = new Map<string, ExerciseHistoryEntry>();
      for (const r of data as {
        workout_id: string;
        name: string;
        started_at: string;
        finished_at: string | null;
        position: number;
        weight_kg: number;
        reps: number;
        target_rir: number | null;
        is_pr: number;
      }[]) {
        const e =
          map.get(r.workout_id) ??
          map
            .set(r.workout_id, {
              workoutId: r.workout_id,
              name: r.name,
              startedAt: r.started_at,
              finishedAt: r.finished_at,
              sets: [],
            })
            .get(r.workout_id)!;
        e.sets.push({
          position: r.position,
          weightKg: r.weight_kg,
          reps: r.reps,
          rir: r.target_rir,
          isPr: !!r.is_pr,
        });
      }
      return [...map.values()];
    },
  });
}

/** Completed set counts per exercise since a date (Muscles tab). */
export function useMuscleVolume(sinceIso: string) {
  return useSqlQuery({
    queryKey: queryKeys.workouts.muscleVolume(sinceIso).queryKey,
    sql: `SELECT we.exercise_id, COUNT(s.id) AS sets
            FROM workout_sets s
            JOIN workout_exercises we ON we.id = s.workout_exercise_id
            JOIN workouts w ON w.id = we.workout_id
            WHERE s.completed_at IS NOT NULL AND w.started_at >= ?
            GROUP BY we.exercise_id`,
    parameters: [sinceIso],
    map: (data) =>
      (data as { exercise_id: string; sets: number }[]).map((r) => ({
        exerciseId: r.exercise_id,
        sets: r.sets,
      })),
  });
}
