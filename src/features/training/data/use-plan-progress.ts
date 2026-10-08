import { createQueryKeys } from '@lukemorales/query-key-factory';

import { useSqlQuery } from '@/shared/data/use-sql-query';

export const trainingKeys = createQueryKeys('training', {
  planProgress: (collectionId: string | null) => [collectionId ?? 'none'],
});

export type PlanItemState = 'done' | 'next' | 'upcoming';

export interface PlanItem {
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
 */
function toPlan(rows: Row[]): PlanItem[] {
  let lastIndex = -1;
  rows.forEach((r, i) => {
    if (r.last_done && (lastIndex < 0 || r.last_done > rows[lastIndex].last_done!)) lastIndex = i;
  });
  const next = (lastIndex + 1) % Math.max(rows.length, 1);
  return rows.map((r, i) => ({
    id: r.id,
    name: r.name,
    number: i + 1,
    state: i < next ? 'done' : i === next ? 'next' : 'upcoming',
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
