import { toCompilableQuery } from '@powersync/drizzle-driver';
import { useQuery } from '@powersync/tanstack-react-query';
import type { Query } from 'drizzle-orm';
import { useMemo } from 'react';

/** A Drizzle select or relational query that has not been awaited yet. */
export interface DrizzleQuery<TRow> {
  execute: () => Promise<TRow[]>;
  toSQL: () => Query;
}

/** Row type of a query factory, so a module-level `map` can be typed from its query. */
export type RowOf<TFactory extends (...args: never[]) => DrizzleQuery<unknown>> =
  ReturnType<TFactory> extends DrizzleQuery<infer TRow> ? TRow : never;

interface DrizzleQueryOptions<TRow, TResult> {
  queryKey: readonly unknown[];
  query: DrizzleQuery<TRow>;
  enabled?: boolean;
  /** Maps rows to the hook's result; keep it a stable module-level function. */
  map: (rows: TRow[]) => TResult;
}

/**
 * Watched Drizzle query via PowerSync's TanStack Query integration, with a typed row
 * mapper. Re-renders automatically when any table used by `query` changes.
 */
export function useDrizzleQuery<TRow, TResult>({
  queryKey,
  query,
  enabled,
  map,
}: DrizzleQueryOptions<TRow, TResult>) {
  const result = useQuery<TRow>({ queryKey, query: toCompilableQuery(query), enabled });
  const data = useMemo(() => (result.data ? map(result.data) : undefined), [result.data, map]);
  return { ...result, data };
}
