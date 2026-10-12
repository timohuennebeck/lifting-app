import { and, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import { useEffect } from 'react';

import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';

import { type CustomExercise, type Measure, targetsFor, useCustomExerciseStore } from './exercises';
import { newId, nowIso, parseJson } from './json';
import { drizzle, type Executor } from './powersync/database';
import {
  type CustomExerciseRecord,
  customExercises,
  templateExercises,
  templateSets,
  workoutExercises,
  workoutSets,
} from './powersync/schema';
import { queryKeys } from './query-keys';
import { type RowOf, useDrizzleQuery } from './use-drizzle-query';

/** What the form edits. */
export type CustomExerciseDraft = Omit<CustomExercise, 'id' | 'archived'>;

const toCustomExercise = (r: CustomExerciseRecord): CustomExercise => ({
  id: r.id,
  name: r.name,
  primary: parseJson<MuscleId[]>(r.primary_muscles, []),
  secondary: parseJson<MuscleId[]>(r.secondary_muscles, []),
  measures: parseJson<Measure[]>(r.measures, ['weight', 'reps']),
  restSeconds: r.rest_seconds,
  archived: !!r.archived_at,
});

const byId = (rows: CustomExerciseRecord[]) =>
  Object.fromEntries(rows.map((r) => [r.id, toCustomExercise(r)]));

/**
 * Mirrors the user's custom exercises from the local database into the store the exercise
 * lookups read; true once they are there. Mounted once, by `CustomExerciseGate`.
 */
export function useCustomExerciseSync() {
  const { data } = useDrizzleQuery({
    queryKey: queryKeys.customExercises.list.queryKey,
    query: drizzle.select().from(customExercises),
    map: byId,
  });
  useEffect(() => {
    if (data) useCustomExerciseStore.setState({ exercises: data, loaded: true });
  }, [data]);
  return useCustomExerciseStore((s) => s.loaded);
}

const columns = (draft: CustomExerciseDraft) => ({
  name: draft.name.trim(),
  primary_muscles: JSON.stringify(draft.primary),
  secondary_muscles: JSON.stringify(draft.secondary),
  measures: JSON.stringify(draft.measures),
  rest_seconds: draft.restSeconds,
});

/** Adds custom exercises under the ids plans already reference (an imported plan's). */
export async function insertCustomExercises(
  db: Executor,
  userId: string,
  exercises: CustomExercise[],
) {
  if (!exercises.length) return;
  const createdAt = nowIso();
  await db
    .insert(customExercises)
    .values(
      exercises.map((e) => ({ id: e.id, user_id: userId, ...columns(e), created_at: createdAt })),
    );
}

/** Adds a custom exercise; returns its id, which plans and workouts reference. */
export async function createCustomExercise(userId: string, draft: CustomExerciseDraft) {
  const id = newId();
  await insertCustomExercises(drizzle, userId, [{ ...draft, id, archived: false }]);
  return id;
}

/**
 * Saves an edit. Switching between reps and seconds resets the targets the exercise has in plans
 * and in sets not logged yet, as a swap does: "8–12" means something else for a hold.
 */
export async function updateCustomExercise(
  id: string,
  draft: CustomExerciseDraft,
  previous: CustomExercise,
) {
  const timed = draft.measures.includes('seconds');
  await drizzle.transaction(async (tx) => {
    await tx.update(customExercises).set(columns(draft)).where(eq(customExercises.id, id));
    if (timed === previous.measures.includes('seconds')) return;
    const { min, max, rir } = targetsFor(timed);
    const planned = tx
      .select({ id: templateExercises.id })
      .from(templateExercises)
      .where(eq(templateExercises.exercise_id, id));
    await tx
      .update(templateSets)
      .set({ target_min: min, target_max: max, rir })
      .where(inArray(templateSets.template_exercise_id, planned));
    const inWorkouts = tx
      .select({ id: workoutExercises.id })
      .from(workoutExercises)
      .where(eq(workoutExercises.exercise_id, id));
    await tx
      .update(workoutSets)
      .set({ target_min: min, target_max: max, target_rir: rir })
      .where(
        and(inArray(workoutSets.workout_exercise_id, inWorkouts), isNull(workoutSets.completed_at)),
      );
  });
}

/** Deletes a custom exercise for the picker; plans and history keep it. */
export async function archiveCustomExercise(id: string) {
  await drizzle
    .update(customExercises)
    .set({ archived_at: nowIso() })
    .where(eq(customExercises.id, id));
}

const loggedSetQuery = (exerciseId: string) =>
  drizzle
    .select({ id: workoutSets.id })
    .from(workoutSets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, workoutSets.workout_exercise_id))
    .where(and(eq(workoutExercises.exercise_id, exerciseId), isNotNull(workoutSets.completed_at)))
    .limit(1);

const hasRows = (rows: RowOf<typeof loggedSetQuery>[]) => rows.length > 0;

/** Whether a set of the exercise was logged: then what it records stays as it is. */
export function useHasLoggedSets(exerciseId: string | undefined) {
  return useDrizzleQuery({
    queryKey: queryKeys.customExercises.logged(exerciseId ?? '').queryKey,
    enabled: !!exerciseId,
    query: loggedSetQuery(exerciseId ?? ''),
    map: hasRows,
  });
}
