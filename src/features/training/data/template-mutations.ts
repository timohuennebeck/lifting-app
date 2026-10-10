import { and, eq, inArray } from 'drizzle-orm';

import { defaultSetDrafts, swapTargets } from '@/shared/data/exercises';
import { newId, nowIso } from '@/shared/data/json';
import { nextPosition } from '@/shared/data/positions';
import { drizzle, type Tx } from '@/shared/data/powersync/database';
import {
  collections,
  profiles,
  templateExercises,
  templates,
  templateSets,
  workouts,
} from '@/shared/data/powersync/schema';
import {
  inCollection,
  insertCollection,
  insertTemplateExercise,
  insertTemplateSets,
  type PlanSetDraft,
} from '@/shared/data/templates';

/** Sets of a freshly added exercise. */
const NEW_EXERCISE_SETS = 3;

async function touchTemplate(tx: Tx, templateId: string) {
  await tx.update(templates).set({ updated_at: nowIso() }).where(eq(templates.id, templateId));
}

async function templateOf(tx: Tx, templateExerciseId: string) {
  const row = await tx
    .select({ template_id: templateExercises.template_id })
    .from(templateExercises)
    .where(eq(templateExercises.id, templateExerciseId))
    .get();
  if (!row) throw new Error(`Template exercise ${templateExerciseId} not found`);
  return row.template_id;
}

/** Local SQLite views have no FK cascades, so children are removed explicitly. */
async function deleteTemplateTx(tx: Tx, templateId: string) {
  const exerciseIds = tx
    .select({ id: templateExercises.id })
    .from(templateExercises)
    .where(eq(templateExercises.template_id, templateId));
  await tx.delete(templateSets).where(inArray(templateSets.template_exercise_id, exerciseIds));
  await tx.delete(templateExercises).where(eq(templateExercises.template_id, templateId));
  await tx.update(workouts).set({ template_id: null }).where(eq(workouts.template_id, templateId));
  await tx.delete(templates).where(eq(templates.id, templateId));
}

async function setExercisePosition(tx: Tx, templateExerciseId: string, position: number) {
  await tx
    .update(templateExercises)
    .set({ position })
    .where(eq(templateExercises.id, templateExerciseId));
}

/** Closes gaps in the exercise positions. Returns the ids in order (index = position). */
async function renumberExercises(tx: Tx, templateId: string) {
  const rows = await tx
    .select({ id: templateExercises.id, position: templateExercises.position })
    .from(templateExercises)
    .where(eq(templateExercises.template_id, templateId))
    .orderBy(templateExercises.position);
  for (const [position, row] of rows.entries()) {
    // Only rows that are off: every write is queued for upload.
    if (row.position !== position) await setExercisePosition(tx, row.id, position);
  }
  return rows.map((r) => r.id);
}

export function createCollection(userId: string, name: string) {
  return insertCollection(drizzle, userId, name.trim());
}

export async function renameCollection(collectionId: string, name: string) {
  await drizzle
    .update(collections)
    .set({ name: name.trim() })
    .where(eq(collections.id, collectionId));
}

/** `keepTemplates` moves them to "No collection"; logged workouts always remain. */
export type DeleteCollectionMode = 'keepTemplates' | 'withTemplates';

export async function deleteCollection(collectionId: string, mode: DeleteCollectionMode) {
  await drizzle.transaction(async (tx) => {
    if (mode === 'withTemplates') {
      const inside = await tx
        .select({ id: templates.id })
        .from(templates)
        .where(eq(templates.collection_id, collectionId));
      for (const t of inside) await deleteTemplateTx(tx, t.id);
    } else {
      await tx
        .update(templates)
        .set({ collection_id: null, updated_at: nowIso() })
        .where(eq(templates.collection_id, collectionId));
    }
    await tx
      .update(profiles)
      .set({ active_collection_id: null })
      .where(eq(profiles.active_collection_id, collectionId));
    await tx.delete(collections).where(eq(collections.id, collectionId));
  });
}

export async function createTemplate(userId: string, name: string, collectionId: string | null) {
  const id = newId();
  await drizzle.insert(templates).values({
    id,
    user_id: userId,
    collection_id: collectionId,
    name: name.trim(),
    weekday: null,
    position: nextPosition(
      templates.position,
      and(eq(templates.user_id, userId), inCollection(collectionId)),
    ),
    created_at: nowIso(),
    updated_at: nowIso(),
  });
  return id;
}

export async function renameTemplate(templateId: string, name: string) {
  await drizzle
    .update(templates)
    .set({ name: name.trim(), updated_at: nowIso() })
    .where(eq(templates.id, templateId));
}

/** Saves the order of one collection's templates after a drag on the Training tab. */
export async function reorderTemplates(orderedIds: string[]) {
  await drizzle.transaction(async (tx) => {
    const rows = await tx
      .select({ id: templates.id, position: templates.position })
      .from(templates)
      .where(inArray(templates.id, orderedIds));
    // Only rows whose position changes: every write is queued for upload.
    const stored = new Map(rows.map((r) => [r.id, r.position]));
    for (const [position, id] of orderedIds.entries()) {
      if (stored.get(id) === position) continue;
      await tx.update(templates).set({ position }).where(eq(templates.id, id));
    }
  });
}

export async function deleteTemplate(templateId: string) {
  await drizzle.transaction((tx) => deleteTemplateTx(tx, templateId));
}

export async function addTemplateExercise(userId: string, templateId: string, exerciseId: string) {
  await drizzle.transaction(async (tx) => {
    const position = nextPosition(
      templateExercises.position,
      eq(templateExercises.template_id, templateId),
    );
    await insertTemplateExercise(tx, userId, templateId, position, {
      exerciseId,
      sets: defaultSetDrafts(exerciseId, NEW_EXERCISE_SETS),
    });
    await touchTemplate(tx, templateId);
  });
}

/** Replaces the exercise but keeps its sets and rest time; targets reset per `swapTargets`. */
export async function swapTemplateExercise(templateExerciseId: string, exerciseId: string) {
  await drizzle.transaction(async (tx) => {
    const previous = await tx
      .select({ exercise_id: templateExercises.exercise_id })
      .from(templateExercises)
      .where(eq(templateExercises.id, templateExerciseId))
      .get();
    await tx
      .update(templateExercises)
      .set({ exercise_id: exerciseId })
      .where(eq(templateExercises.id, templateExerciseId));
    const targets = swapTargets(previous?.exercise_id ?? '', exerciseId);
    if (targets) {
      await tx
        .update(templateSets)
        .set({ target_min: targets.min, target_max: targets.max, rir: targets.rir })
        .where(eq(templateSets.template_exercise_id, templateExerciseId));
    }
    await touchTemplate(tx, await templateOf(tx, templateExerciseId));
  });
}

export async function removeTemplateExercise(templateExerciseId: string) {
  await drizzle.transaction(async (tx) => {
    const templateId = await templateOf(tx, templateExerciseId);
    await tx.delete(templateSets).where(eq(templateSets.template_exercise_id, templateExerciseId));
    await tx.delete(templateExercises).where(eq(templateExercises.id, templateExerciseId));
    await renumberExercises(tx, templateId);
    await touchTemplate(tx, templateId);
  });
}

/** Puts an exercise at slot `to(from)` of its template; the others close up around it. */
async function placeExercise(templateExerciseId: string, to: (from: number) => number) {
  await drizzle.transaction(async (tx) => {
    const templateId = await templateOf(tx, templateExerciseId);
    const ids = await renumberExercises(tx, templateId);
    const from = ids.indexOf(templateExerciseId);
    const target = to(from);
    if (from < 0 || target === from || target < 0 || target >= ids.length) return;
    const order = ids.filter((id) => id !== templateExerciseId);
    order.splice(target, 0, templateExerciseId);
    for (const [position, id] of order.entries()) {
      if (ids[position] !== id) await setExercisePosition(tx, id, position);
    }
    await touchTemplate(tx, templateId);
  });
}

/** Moves an exercise one slot up (-1) or down (+1). */
export const moveTemplateExercise = (templateExerciseId: string, direction: -1 | 1) =>
  placeExercise(templateExerciseId, (from) => from + direction);

/** Drops an exercise at `toIndex` (drag and drop). */
export const reorderTemplateExercise = (templateExerciseId: string, toIndex: number) =>
  placeExercise(templateExerciseId, () => toIndex);

/** Replaces all target sets of one template exercise and its rest override. */
export async function saveTemplateSets(
  userId: string,
  templateExerciseId: string,
  sets: PlanSetDraft[],
  restSeconds: number | null,
) {
  await drizzle.transaction(async (tx) => {
    await tx.delete(templateSets).where(eq(templateSets.template_exercise_id, templateExerciseId));
    await insertTemplateSets(tx, userId, templateExerciseId, sets);
    await tx
      .update(templateExercises)
      .set({ rest_seconds: restSeconds })
      .where(eq(templateExercises.id, templateExerciseId));
    await touchTemplate(tx, await templateOf(tx, templateExerciseId));
  });
}
