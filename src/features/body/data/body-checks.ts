import { parseJson } from '@/shared/data/json';
import type { BodyCheckRecord } from '@/shared/data/powersync/schema';
import { queryKeys } from '@/shared/data/query-keys';
import { useSqlQuery } from '@/shared/data/use-sql-query';

export interface BodyCheck {
  id: string;
  score: number;
  groupScores: Record<string, number>;
  createdAt: string;
}

const toChecks = (rows: (BodyCheckRecord & { id: string })[]): BodyCheck[] =>
  rows.map((r) => ({
    id: r.id,
    score: r.score ?? 0,
    groupScores: parseJson(r.group_scores, {}),
    createdAt: r.created_at ?? '',
  }));

/** All body checks, oldest first (check numbers follow this order). */
export function useBodyChecks() {
  return useSqlQuery({
    queryKey: queryKeys.bodyChecks.list.queryKey,
    sql: 'SELECT * FROM body_checks ORDER BY created_at',
    map: toChecks,
  });
}
