import { toCompilableQuery } from '@powersync/drizzle-driver';
import { useQuery } from '@powersync/tanstack-react-query';
import { keepPreviousData } from '@tanstack/react-query';
import type { Query } from 'drizzle-orm';
import { useMemo } from 'react';

import { getOrInsert } from '@/shared/lib/map';

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
  /** Keeps the previous key's data while a new key loads, e.g. when a list grows. */
  keepPrevious?: boolean;
}

// PowerSync compiles the query to SQL on every render, only to find the tables to watch; the
// rows come from `execute`. The tables of a key never change, so its first compile is reused.
const compiled = new Map<string, { sql: string; parameters: unknown[] }>();

function compilable<TRow>(queryKey: readonly unknown[], query: DrizzleQuery<TRow>) {
  const { execute, compile } = toCompilableQuery(query);
  return { execute, compile: () => getOrInsert(compiled, JSON.stringify(queryKey), compile) };
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
  keepPrevious,
}: DrizzleQueryOptions<TRow, TResult>) {
  const result = useQuery<TRow>({
    queryKey,
    query: compilable(queryKey, query),
    enabled,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
  });
  const rows = result.data;
  const data = useMemo(() => (rows ? map(rows) : undefined), [rows, map]);
  // Only what callers read: spreading the result would subscribe to every field it has.
  return { data, isLoading: result.isLoading, error: result.error };
}
