import { createQueryKeys } from '@lukemorales/query-key-factory';

import { useSqlQuery } from '@/shared/data/use-sql-query';

const trainingKeys = createQueryKeys('training', {
  planProgress: (collectionId: string | null) => [collectionId ?? 'none'],
});

export type PlanItemState = 'done' | 'next' | 'upcoming';

export interface PlanItem {
  /** Unique per slot: a template shows twice when the last cycle is displayed too. */
  key: string;
  id: string;
  name: string;
  /** 1-based slot in the rotation. */
  number: number;
  state: PlanItemState;
}

interface Row {
  id: string;
  name: string;
  last_done: string | null;
}

/**
 * Templates of a collection rotate in order: the one after the most recently
 * finished template is "next", the ones before it in this cycle are "done".
 * Right after a finished cycle it stays visible in front of the new one (03·0b).
 */
function toPlan(rows: Row[]): PlanItem[] {
  let lastIndex = -1;
  rows.forEach((r, i) => {
    if (r.last_done && (lastIndex < 0 || r.last_done > rows[lastIndex].last_done!)) lastIndex = i;
  });
  const next = (lastIndex + 1) % Math.max(rows.length, 1);
  const stateOf = (i: number): PlanItemState =>
    i < next ? 'done' : i === next ? 'next' : 'upcoming';
  const slots = rows.map((r, i) => ({ row: r, state: stateOf(i) }));
  const finishedCycle = next === 0 && lastIndex >= 0;
  const all = finishedCycle
    ? [...rows.map((row) => ({ row, state: 'done' as const })), ...slots]
    : slots;
  return all.map(({ row, state }, i) => ({
    key: `${row.id}-${i}`,
    id: row.id,
    name: row.name,
    number: i + 1,
    state,
  }));
}

/** Rotation status of all templates sharing a collection (or all without one). */
export function usePlanProgress(collectionId: string | null, enabled = true) {
  return useSqlQuery({
    queryKey: trainingKeys.planProgress(collectionId).queryKey,
    enabled,
    sql: `SELECT t.id, t.name,
              (SELECT MAX(w.finished_at) FROM workouts w
                WHERE w.template_id = t.id AND w.finished_at IS NOT NULL) AS last_done
            FROM templates t WHERE t.collection_id IS ?
            ORDER BY t.position, t.created_at`,
    parameters: [collectionId],
    map: toPlan,
  });
}
