import { getExercise } from './exercises';
import { newId, nowIso } from './json';
import { db } from './powersync/database';
import type { TemplateSetRecord } from './powersync/schema';
import { queryKeys } from './query-keys';
import { useSqlQuery } from './use-sql-query';

/** Seconds a single working set takes, excluding rest. */
const SET_SECONDS = 45;
/** Setup, warm-up and transition time per exercise. */
const EXERCISE_SECONDS = 150;
const DEFAULT_REST = 90;

export interface PlanSetDraft {
  repsMin: number;
  repsMax: number;
  rir: number | null;
}

export interface PlanExerciseDraft {
  exerciseId: string;
  sets: PlanSetDraft[];
  restSeconds?: number | null;
}

export interface PlanDayDraft {
  name: string;
  /** Monday-based weekday, or null for "no fixed day". */
  weekday: number | null;
  exercises: PlanExerciseDraft[];
}

export interface PlanDraft {
  name: string;
  days: PlanDayDraft[];
}

/** Writes a plan as one collection with one template per day. Returns the collection id. */
export async function insertPlan(userId: string, plan: PlanDraft): Promise<string> {
  return db.writeTransaction(async (tx) => {
    const collectionId = newId();
    await tx.execute(
      `INSERT INTO collections (id, user_id, name, position, created_at)
       VALUES (?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM collections WHERE user_id = ?), ?)`,
      [collectionId, userId, plan.name, userId, nowIso()],
    );
    for (const [dayIndex, day] of plan.days.entries()) {
      const templateId = newId();
      await tx.execute(
        `INSERT INTO templates (id, user_id, collection_id, name, weekday, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [templateId, userId, collectionId, day.name, day.weekday, dayIndex, nowIso(), nowIso()],
      );
      for (const [position, exercise] of day.exercises.entries()) {
        await insertTemplateExercise(tx, userId, templateId, position, exercise);
      }
    }
    return collectionId;
  });
}

type Tx = Parameters<Parameters<typeof db.writeTransaction>[0]>[0];

export async function insertTemplateExercise(
  tx: Tx,
  userId: string,
  templateId: string,
  position: number,
  exercise: PlanExerciseDraft,
) {
  const id = newId();
  await tx.execute(
    `INSERT INTO template_exercises (id, user_id, template_id, exercise_id, position, rest_seconds)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, templateId, exercise.exerciseId, position, exercise.restSeconds ?? null],
  );
  for (const [setPos, set] of exercise.sets.entries()) {
    await tx.execute(
      `INSERT INTO template_sets (id, user_id, template_exercise_id, position, reps_min, reps_max, rir)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newId(), userId, id, setPos, set.repsMin, set.repsMax, set.rir],
    );
  }
  return id;
}

export function restSecondsFor(exerciseId: string, override: number | null | undefined) {
  return override ?? getExercise(exerciseId)?.restSeconds ?? DEFAULT_REST;
}

/** Rough session length in minutes from sets and rest times. */
export function estimateMinutes(
  items: { exerciseId: string; sets: number; restSeconds?: number | null }[],
) {
  const seconds = items.reduce(
    (sum, i) =>
      sum + EXERCISE_SECONDS + i.sets * (SET_SECONDS + restSecondsFor(i.exerciseId, i.restSeconds)),
    0,
  );
  return Math.round(seconds / 60);
}

interface TemplateRow {
  id: string;
  name: string;
  collection_id: string | null;
  collection_name: string | null;
  weekday: number | null;
  position: number;
  exercise_id: string | null;
  rest_seconds: number | null;
  set_count: number;
}

export interface TemplateSummary {
  id: string;
  name: string;
  collectionId: string | null;
  collectionName: string | null;
  weekday: number | null;
  position: number;
  exerciseCount: number;
  setCount: number;
  estimatedMinutes: number;
  /** Exercise ids with their set counts, for muscle shares. */
  items: { exerciseId: string; sets: number }[];
}

function summarize(rows: TemplateRow[]): TemplateSummary[] {
  const byId = new Map<string, TemplateSummary & { rest: (number | null)[] }>();
  for (const r of rows) {
    const t =
      byId.get(r.id) ??
      byId
        .set(r.id, {
          id: r.id,
          name: r.name,
          collectionId: r.collection_id,
          collectionName: r.collection_name,
          weekday: r.weekday,
          position: r.position,
          exerciseCount: 0,
          setCount: 0,
          estimatedMinutes: 0,
          items: [],
          rest: [],
        })
        .get(r.id)!;
    if (!r.exercise_id) continue;
    t.items.push({ exerciseId: r.exercise_id, sets: r.set_count });
    t.rest.push(r.rest_seconds);
    t.exerciseCount += 1;
    t.setCount += r.set_count;
  }
  return [...byId.values()].map(({ rest, ...t }) => ({
    ...t,
    estimatedMinutes: estimateMinutes(t.items.map((i, k) => ({ ...i, restSeconds: rest[k] }))),
  }));
}

/** All templates with collection info and size stats, ordered for display. */
export function useTemplates() {
  return useSqlQuery({
    queryKey: queryKeys.templates.list.queryKey,
    sql: `SELECT t.id, t.name, t.collection_id, c.name AS collection_name, t.weekday, t.position,
              te.exercise_id, te.rest_seconds, COUNT(ts.id) AS set_count
            FROM templates t
            LEFT JOIN collections c ON c.id = t.collection_id
            LEFT JOIN template_exercises te ON te.template_id = t.id
            LEFT JOIN template_sets ts ON ts.template_exercise_id = te.id
            GROUP BY t.id, te.id
            ORDER BY c.position, t.position, te.position`,
    map: (rows) => summarize(rows as TemplateRow[]),
  });
}

export interface CollectionSummary {
  id: string;
  name: string;
  position: number;
  templateCount: number;
}

export function useCollections() {
  return useSqlQuery({
    queryKey: queryKeys.templates.collections.queryKey,
    sql: `SELECT c.id, c.name, c.position, COUNT(t.id) AS template_count
            FROM collections c LEFT JOIN templates t ON t.collection_id = c.id
            GROUP BY c.id ORDER BY c.position`,
    map: (rows) =>
      (rows as { id: string; name: string; position: number; template_count: number }[]).map(
        (r): CollectionSummary => ({
          id: r.id,
          name: r.name,
          position: r.position,
          templateCount: r.template_count,
        }),
      ),
  });
}

export interface TemplateExerciseDetail {
  id: string;
  exerciseId: string;
  position: number;
  restSeconds: number | null;
  sets: (TemplateSetRecord & { id: string })[];
}

export interface TemplateDetail {
  id: string;
  name: string;
  collectionId: string | null;
  weekday: number | null;
  exercises: TemplateExerciseDetail[];
}

interface DetailRow {
  t_id: string;
  t_name: string;
  collection_id: string | null;
  weekday: number | null;
  te_id: string | null;
  exercise_id: string | null;
  te_position: number | null;
  rest_seconds: number | null;
  set_json: string | null;
}

export function useTemplateDetail(templateId: string | undefined) {
  return useSqlQuery({
    queryKey: queryKeys.templates.detail(templateId ?? '').queryKey,
    enabled: !!templateId,
    sql: `SELECT t.id AS t_id, t.name AS t_name, t.collection_id, t.weekday,
              te.id AS te_id, te.exercise_id, te.position AS te_position, te.rest_seconds,
              (SELECT json_group_array(json_object('id', s.id, 'position', s.position,
                 'reps_min', s.reps_min, 'reps_max', s.reps_max, 'rir', s.rir))
               FROM (SELECT * FROM template_sets WHERE template_exercise_id = te.id ORDER BY position) s
              ) AS set_json
            FROM templates t LEFT JOIN template_exercises te ON te.template_id = t.id
            WHERE t.id = ? ORDER BY te.position`,
    parameters: [templateId],
    map: (data): TemplateDetail | null => {
      const rows = data as DetailRow[];
      if (!rows.length) return null;
      const [first] = rows;
      return {
        id: first.t_id,
        name: first.t_name,
        collectionId: first.collection_id,
        weekday: first.weekday,
        exercises: rows
          .filter((r) => r.te_id && r.exercise_id)
          .map((r) => ({
            id: r.te_id!,
            exerciseId: r.exercise_id!,
            position: r.te_position ?? 0,
            restSeconds: r.rest_seconds,
            sets: JSON.parse(r.set_json ?? '[]'),
          })),
      };
    },
  });
}
