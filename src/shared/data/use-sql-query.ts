import { useQuery } from '@powersync/tanstack-react-query';
import { useMemo } from 'react';

export interface SqlQueryOptions<TRow, TResult> {
  queryKey: readonly unknown[];
  sql: string;
  parameters?: unknown[];
  enabled?: boolean;
  /** Maps raw rows to the hook's result; keep it a stable module-level function. */
  map: (rows: TRow[]) => TResult;
}

/**
 * Watched PowerSync SQL query via TanStack Query, with a typed row mapper.
 * Re-renders automatically when any table used by `sql` changes.
 */
export function useSqlQuery<TRow, TResult>({
  queryKey,
  sql,
  parameters,
  enabled,
  map,
}: SqlQueryOptions<TRow, TResult>) {
  const query = useQuery<TRow>({ queryKey, query: sql, parameters, enabled });
  const data = useMemo(() => (query.data ? map(query.data) : undefined), [query.data, map]);
  return { ...query, data };
}
