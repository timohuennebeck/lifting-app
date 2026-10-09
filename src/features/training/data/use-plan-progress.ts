import { createQueryKeys } from '@lukemorales/query-key-factory';
import { eq, max, sql } from 'drizzle-orm';

import { drizzle } from '@/shared/data/powersync/database';
import { templates, workouts } from '@/shared/data/powersync/schema';
import { inCollection } from '@/shared/data/templates';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';

const trainingKeys = createQueryKeys('training', {
  planProgress: (collectionId: string | null) => [collectionId ?? 'none'],
});

export interface PlanItem {
  /** Unique per slot: a template shows twice when the last cycle is displayed too. */
  key: string;
  id: string;
  name: string;
  /** 1-based slot in the strip (runs to 2n while the finished cycle is shown). */
  number: number;
  /** Trained in the current cycle (or in the finished one shown in front of it). */
  done: boolean;
}

/** Templates of a collection in rotation order, each with its latest finished workout. */
const planQuery = (collectionId: string | null) =>
  drizzle
    .select({
      id: templates.id,
      name: templates.name,
      last_done: sql<string | null>`${drizzle
        .select({ at: max(workouts.finished_at) })
        .from(workouts)
        .where(eq(workouts.template_id, templates.id))}`,
    })
    .from(templates)
    .where(inCollection(collectionId))
    .orderBy(templates.position, templates.created_at);

type Row = RowOf<typeof planQuery>;

/**
 * Templates of a collection rotate in order: the one after the most recently finished
 * template is next, the ones before it in this cycle are done. Right after a finished
 * cycle it stays visible in front of the new one (03·0b).
 */
function toPlan(rows: Row[]): PlanItem[] {
  let lastIndex = -1;
  rows.forEach((r, i) => {
    if (r.last_done && (lastIndex < 0 || r.last_done > rows[lastIndex].last_done!)) lastIndex = i;
  });
  const next = (lastIndex + 1) % Math.max(rows.length, 1);
  const slots = rows.map((row, i) => ({ row, done: i < next }));
  const finishedCycle = next === 0 && lastIndex >= 0;
  const all = finishedCycle ? [...rows.map((row) => ({ row, done: true })), ...slots] : slots;
  return all.map(({ row, done }, i) => ({
    key: `${row.id}-${i}`,
    id: row.id,
    name: row.name,
    number: i + 1,
    done,
  }));
}

/** Rotation status of all templates sharing a collection (or all without one). */
export function usePlanProgress(collectionId: string | null, enabled = true) {
  return useDrizzleQuery({
    queryKey: trainingKeys.planProgress(collectionId).queryKey,
    enabled,
    query: planQuery(collectionId),
    map: toPlan,
  });
}
