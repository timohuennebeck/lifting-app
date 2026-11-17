import { asc, eq } from 'drizzle-orm';

import { setRoutineSuperset } from '@/features/training/data/routine-mutations';
import { drizzle } from '@/shared/data/powersync/database';
import { routineExercises, workoutEntries } from '@/shared/data/powersync/schema';
import { supersetSlots } from '@/shared/data/supersets';

/** Supersets made during a workout that its routine doesn't have yet. */
export interface SupersetsToKeep {
  routineId: string;
  routineName: string;
  /** Each superset's exercises (catalog ids), in order. */
  groups: string[][];
}

interface Row {
  id: string;
  exercise_id: string;
  superset_id: string | null;
}

/** The supersets of `rows` (in order), each as its exercises' catalog ids. */
function groupsOf(rows: Row[]) {
  const slots = supersetSlots(rows.map((r) => ({ id: r.id, supersetId: r.superset_id })));
  return slots.flatMap((slot, i) =>
    slot && slot.start === i
      ? [rows.slice(slot.start, slot.end + 1).map((r) => r.exercise_id)]
      : [],
  );
}

const keyOf = (group: string[]) => [...group].sort().join();

/**
 * The supersets of a workout started from a routine that the routine lacks, made of exercises the
 * routine has: the ones worth offering to keep. Null when there are none.
 */
export async function supersetsToKeep(workoutId: string): Promise<SupersetsToKeep | null> {
  const workout = await drizzle.query.workoutEntries.findFirst({
    columns: { routine_id: true, name: true },
    where: eq(workoutEntries.id, workoutId),
    with: {
      exercises: {
        columns: { id: true, exercise_id: true, superset_id: true },
        orderBy: (e) => asc(e.position),
      },
    },
  });
  if (!workout?.routine_id) return null;
  const routine = await drizzle
    .select({
      id: routineExercises.id,
      exercise_id: routineExercises.exercise_id,
      superset_id: routineExercises.superset_id,
    })
    .from(routineExercises)
    .where(eq(routineExercises.routine_id, workout.routine_id))
    .orderBy(asc(routineExercises.position));
  const known = new Set(groupsOf(routine).map(keyOf));
  const inRoutine = new Set(routine.map((r) => r.exercise_id));
  const groups = groupsOf(workout.exercises).filter(
    (g) => !known.has(keyOf(g)) && g.every((id) => inRoutine.has(id)),
  );
  if (!groups.length) return null;
  return { routineId: workout.routine_id, routineName: workout.name, groups };
}

/** Makes the supersets `groups` (catalog ids) in the routine, from its first such exercises. */
export async function keepSupersets({ routineId, groups }: SupersetsToKeep) {
  for (const group of groups) {
    const rows = await drizzle
      .select({ id: routineExercises.id, exercise_id: routineExercises.exercise_id })
      .from(routineExercises)
      .where(eq(routineExercises.routine_id, routineId))
      .orderBy(asc(routineExercises.position));
    const ids = group.map((exerciseId) => rows.find((r) => r.exercise_id === exerciseId)?.id);
    const [first, ...others] = ids;
    if (!first || others.some((id) => !id)) continue;
    for (const other of others) if (other) await setRoutineSuperset(first, other);
  }
}
