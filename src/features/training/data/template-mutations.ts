import { newId, nowIso } from '@/shared/data/json';
import { db } from '@/shared/data/powersync/database';
import { insertTemplateExercise, type PlanSetDraft } from '@/shared/data/templates';

type Tx = Parameters<Parameters<typeof db.writeTransaction>[0]>[0];

/** Default prescription for a freshly added exercise. */
const NEW_EXERCISE_SETS: PlanSetDraft[] = Array.from({ length: 3 }, () => ({
  repsMin: 8,
  repsMax: 12,
  rir: 2,
}));

const touchTemplate = (tx: Tx, templateId: string) =>
  tx.execute('UPDATE templates SET updated_at = ? WHERE id = ?', [nowIso(), templateId]);

async function templateOf(tx: Tx, templateExerciseId: string) {
  const row = await tx.get<{ template_id: string }>(
    'SELECT template_id FROM template_exercises WHERE id = ?',
    [templateExerciseId],
  );
  return row.template_id;
}

/** Local SQLite views have no FK cascades, so children are removed explicitly. */
async function deleteTemplateTx(tx: Tx, templateId: string) {
  await tx.execute(
    `DELETE FROM template_sets WHERE template_exercise_id IN
       (SELECT id FROM template_exercises WHERE template_id = ?)`,
    [templateId],
  );
  await tx.execute('DELETE FROM template_exercises WHERE template_id = ?', [templateId]);
  await tx.execute('UPDATE workouts SET template_id = NULL WHERE template_id = ?', [templateId]);
  await tx.execute('DELETE FROM templates WHERE id = ?', [templateId]);
}

async function renumberExercises(tx: Tx, templateId: string) {
  const rows = await tx.getAll<{ id: string }>(
    'SELECT id FROM template_exercises WHERE template_id = ? ORDER BY position',
    [templateId],
  );
  for (const [position, row] of rows.entries()) {
    await tx.execute('UPDATE template_exercises SET position = ? WHERE id = ?', [position, row.id]);
  }
}

export async function createCollection(userId: string, name: string) {
  const id = newId();
  await db.execute(
    `INSERT INTO collections (id, user_id, name, position, created_at)
     VALUES (?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM collections), ?)`,
    [id, userId, name.trim(), nowIso()],
  );
  return id;
}

export async function renameCollection(collectionId: string, name: string) {
  await db.execute('UPDATE collections SET name = ? WHERE id = ?', [name.trim(), collectionId]);
}

/** `keepTemplates` moves them to "No collection"; logged workouts always remain. */
export type DeleteCollectionMode = 'keepTemplates' | 'withTemplates';

export async function deleteCollection(collectionId: string, mode: DeleteCollectionMode) {
  await db.writeTransaction(async (tx) => {
    if (mode === 'withTemplates') {
      const templates = await tx.getAll<{ id: string }>(
        'SELECT id FROM templates WHERE collection_id = ?',
        [collectionId],
      );
      for (const t of templates) await deleteTemplateTx(tx, t.id);
    } else {
      await tx.execute(
        'UPDATE templates SET collection_id = NULL, updated_at = ? WHERE collection_id = ?',
        [nowIso(), collectionId],
      );
    }
    await tx.execute(
      'UPDATE profiles SET active_collection_id = NULL WHERE active_collection_id = ?',
      [collectionId],
    );
    await tx.execute('DELETE FROM collections WHERE id = ?', [collectionId]);
  });
}

export async function createTemplate(userId: string, name: string, collectionId: string | null) {
  const id = newId();
  await db.execute(
    `INSERT INTO templates (id, user_id, collection_id, name, weekday, position, created_at, updated_at)
     VALUES (?, ?, ?, ?, NULL,
       (SELECT COALESCE(MAX(position), -1) + 1 FROM templates WHERE collection_id IS ?), ?, ?)`,
    [id, userId, collectionId, name.trim(), collectionId, nowIso(), nowIso()],
  );
  return id;
}

export async function renameTemplate(templateId: string, name: string) {
  await db.execute('UPDATE templates SET name = ?, updated_at = ? WHERE id = ?', [
    name.trim(),
    nowIso(),
    templateId,
  ]);
}

export async function deleteTemplate(templateId: string) {
  await db.writeTransaction((tx) => deleteTemplateTx(tx, templateId));
}

export async function addTemplateExercise(userId: string, templateId: string, exerciseId: string) {
  await db.writeTransaction(async (tx) => {
    const { next } = await tx.get<{ next: number }>(
      'SELECT COALESCE(MAX(position), -1) + 1 AS next FROM template_exercises WHERE template_id = ?',
      [templateId],
    );
    await insertTemplateExercise(tx, userId, templateId, next, {
      exerciseId,
      sets: NEW_EXERCISE_SETS,
    });
    await touchTemplate(tx, templateId);
  });
}

/** Replaces the exercise but keeps its sets and rest time. */
export async function swapTemplateExercise(templateExerciseId: string, exerciseId: string) {
  await db.writeTransaction(async (tx) => {
    await tx.execute('UPDATE template_exercises SET exercise_id = ? WHERE id = ?', [
      exerciseId,
      templateExerciseId,
    ]);
    await touchTemplate(tx, await templateOf(tx, templateExerciseId));
  });
}

export async function removeTemplateExercise(templateExerciseId: string) {
  await db.writeTransaction(async (tx) => {
    const templateId = await templateOf(tx, templateExerciseId);
    await tx.execute('DELETE FROM template_sets WHERE template_exercise_id = ?', [
      templateExerciseId,
    ]);
    await tx.execute('DELETE FROM template_exercises WHERE id = ?', [templateExerciseId]);
    await renumberExercises(tx, templateId);
    await touchTemplate(tx, templateId);
  });
}

/** Moves an exercise one slot up (-1) or down (+1) by swapping with its neighbour. */
export async function moveTemplateExercise(templateExerciseId: string, direction: -1 | 1) {
  await db.writeTransaction(async (tx) => {
    const templateId = await templateOf(tx, templateExerciseId);
    await renumberExercises(tx, templateId);
    const rows = await tx.getAll<{ id: string }>(
      'SELECT id FROM template_exercises WHERE template_id = ? ORDER BY position',
      [templateId],
    );
    const from = rows.findIndex((r) => r.id === templateExerciseId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= rows.length) return;
    await tx.execute('UPDATE template_exercises SET position = ? WHERE id = ?', [
      to,
      rows[from].id,
    ]);
    await tx.execute('UPDATE template_exercises SET position = ? WHERE id = ?', [
      from,
      rows[to].id,
    ]);
    await touchTemplate(tx, templateId);
  });
}

/** Replaces all target sets of one template exercise and its rest override. */
export async function saveTemplateSets(
  userId: string,
  templateExerciseId: string,
  sets: PlanSetDraft[],
  restSeconds: number | null,
) {
  await db.writeTransaction(async (tx) => {
    await tx.execute('DELETE FROM template_sets WHERE template_exercise_id = ?', [
      templateExerciseId,
    ]);
    for (const [position, set] of sets.entries()) {
      await tx.execute(
        `INSERT INTO template_sets (id, user_id, template_exercise_id, position, reps_min, reps_max, rir)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newId(), userId, templateExerciseId, position, set.repsMin, set.repsMax, set.rir],
      );
    }
    await tx.execute('UPDATE template_exercises SET rest_seconds = ? WHERE id = ?', [
      restSeconds,
      templateExerciseId,
    ]);
    await touchTemplate(tx, await templateOf(tx, templateExerciseId));
  });
}
