import { asc, count, eq, isNull, type SQL } from 'drizzle-orm';

import { getOrInsert } from '@/shared/lib/map';

import { getExercise } from './exercises';
import { newId, nowIso } from './json';
import { nextPosition } from './positions';
import { drizzle, type Executor, type Tx } from './powersync/database';
import {
  collections,
  templateExercises,
  templates,
  templateSets,
  type TemplateSetRecord,
} from './powersync/schema';
import { queryKeys } from './query-keys';
import { type RowOf, useDrizzleQuery } from './use-drizzle-query';

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

/**
 * Writes a plan as one collection with one template per day inside `tx`.
 * Returns the collection id.
 */
export async function insertPlan(tx: Tx, userId: string, plan: PlanDraft): Promise<string> {
  const collectionId = await insertCollection(tx, userId, plan.name);
  for (const [dayIndex, day] of plan.days.entries()) {
    const templateId = newId();
    await tx.insert(templates).values({
      id: templateId,
      user_id: userId,
      collection_id: collectionId,
      name: day.name,
      weekday: day.weekday,
      position: dayIndex,
      created_at: nowIso(),
      updated_at: nowIso(),
    });
    for (const [position, exercise] of day.exercises.entries()) {
      await insertTemplateExercise(tx, userId, templateId, position, exercise);
    }
  }
  return collectionId;
}

/** Appends a collection after the user's last one (`drizzle` or a transaction). Returns its id. */
export async function insertCollection(executor: Executor, userId: string, name: string) {
  const id = newId();
  await executor.insert(collections).values({
    id,
    user_id: userId,
    name,
    position: nextPosition(collections.position, eq(collections.user_id, userId)),
    created_at: nowIso(),
  });
  return id;
}

export async function insertTemplateSets(
  tx: Tx,
  userId: string,
  templateExerciseId: string,
  sets: PlanSetDraft[],
) {
  if (!sets.length) return;
  await tx.insert(templateSets).values(
    sets.map((set, position) => ({
      id: newId(),
      user_id: userId,
      template_exercise_id: templateExerciseId,
      position,
      reps_min: set.repsMin,
      reps_max: set.repsMax,
      rir: set.rir,
    })),
  );
}

/** `position` may be a `nextPosition` subquery to append the exercise. */
export async function insertTemplateExercise(
  tx: Tx,
  userId: string,
  templateId: string,
  position: number | SQL<number>,
  exercise: PlanExerciseDraft,
) {
  const id = newId();
  await tx.insert(templateExercises).values({
    id,
    user_id: userId,
    template_id: templateId,
    exercise_id: exercise.exerciseId,
    position,
    rest_seconds: exercise.restSeconds ?? null,
  });
  await insertTemplateSets(tx, userId, id, exercise.sets);
  return id;
}

/** Templates in a collection, or the ones without a collection for `null` (SQL `IS`). */
export const inCollection = (collectionId: string | null) =>
  collectionId === null
    ? isNull(templates.collection_id)
    : eq(templates.collection_id, collectionId);

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

/** One row per template exercise (or per empty template) with its set count. */
const templateListQuery = () =>
  drizzle
    .select({
      id: templates.id,
      name: templates.name,
      collection_id: templates.collection_id,
      collection_name: collections.name,
      weekday: templates.weekday,
      position: templates.position,
      exercise_id: templateExercises.exercise_id,
      rest_seconds: templateExercises.rest_seconds,
      set_count: count(templateSets.id),
    })
    .from(templates)
    .leftJoin(collections, eq(collections.id, templates.collection_id))
    .leftJoin(templateExercises, eq(templateExercises.template_id, templates.id))
    .leftJoin(templateSets, eq(templateSets.template_exercise_id, templateExercises.id))
    .groupBy(templates.id, templateExercises.id)
    .orderBy(collections.position, templates.position, templateExercises.position);

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

function summarize(rows: RowOf<typeof templateListQuery>[]): TemplateSummary[] {
  const byId = new Map<string, TemplateSummary & { rest: (number | null)[] }>();
  for (const r of rows) {
    const t = getOrInsert(byId, r.id, () => ({
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
    }));
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
  return useDrizzleQuery({
    queryKey: queryKeys.templates.list.queryKey,
    query: templateListQuery(),
    map: summarize,
  });
}

export interface CollectionSummary {
  id: string;
  name: string;
  position: number;
  templateCount: number;
}

const collectionListQuery = () =>
  drizzle
    .select({
      id: collections.id,
      name: collections.name,
      position: collections.position,
      template_count: count(templates.id),
    })
    .from(collections)
    .leftJoin(templates, eq(templates.collection_id, collections.id))
    .groupBy(collections.id)
    .orderBy(collections.position);

const toCollections = (rows: RowOf<typeof collectionListQuery>[]) =>
  rows.map((r): CollectionSummary => ({
    id: r.id,
    name: r.name,
    position: r.position,
    templateCount: r.template_count,
  }));

export function useCollections() {
  return useDrizzleQuery({
    queryKey: queryKeys.templates.collections.queryKey,
    query: collectionListQuery(),
    map: toCollections,
  });
}

export type TemplateSetDetail = Pick<
  TemplateSetRecord,
  'id' | 'position' | 'reps_min' | 'reps_max' | 'rir'
>;

export interface TemplateExerciseDetail {
  id: string;
  exerciseId: string;
  position: number;
  restSeconds: number | null;
  sets: TemplateSetDetail[];
}

export interface TemplateDetail {
  id: string;
  name: string;
  collectionId: string | null;
  weekday: number | null;
  exercises: TemplateExerciseDetail[];
}

/** One template with its exercises and their sets, each ordered by position. */
const templateDetailQuery = (templateId: string) =>
  drizzle.query.templates.findMany({
    columns: { id: true, name: true, collection_id: true, weekday: true },
    where: eq(templates.id, templateId),
    with: {
      exercises: {
        columns: { id: true, exercise_id: true, position: true, rest_seconds: true },
        orderBy: asc(templateExercises.position),
        with: {
          sets: {
            columns: { id: true, position: true, reps_min: true, reps_max: true, rir: true },
            orderBy: asc(templateSets.position),
          },
        },
      },
    },
  });

function toTemplateDetail([t]: RowOf<typeof templateDetailQuery>[]): TemplateDetail | null {
  if (!t) return null;
  return {
    id: t.id,
    name: t.name,
    collectionId: t.collection_id,
    weekday: t.weekday,
    exercises: t.exercises.map((e) => ({
      id: e.id,
      exerciseId: e.exercise_id,
      position: e.position,
      restSeconds: e.rest_seconds,
      sets: e.sets,
    })),
  };
}

export function useTemplateDetail(templateId: string | undefined) {
  return useDrizzleQuery({
    queryKey: queryKeys.templates.detail(templateId ?? '').queryKey,
    enabled: !!templateId,
    query: templateDetailQuery(templateId ?? ''),
    map: toTemplateDetail,
  });
}
