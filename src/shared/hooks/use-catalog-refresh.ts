import { useQuery } from '@tanstack/react-query';

import {
  type ExerciseRow,
  latestUpdate,
  mergeRows,
  useCatalogStore,
} from '@/shared/data/exercises';
import { queryClient } from '@/shared/data/query-client';
import { queryKeys } from '@/shared/data/query-keys';
import { supabase } from '@/shared/data/supabase';
import { HOUR_MS } from '@/shared/lib/date';

/** Rows asked for per request; the API may cap a page lower (Supabase's `max_rows`). */
const PAGE_SIZE = 1000;

/**
 * Fetches exercises changed since the newest one the app knows: all of them on first launch.
 * Works logged out.
 */
async function fetchCatalogChanges() {
  const since = latestUpdate(useCatalogStore.getState().rows);
  const rows: ExerciseRow[] = [];
  // Pages until one comes back empty, so a lower cap on the server only means more requests.
  for (;;) {
    let query = supabase.from('exercises').select('*');
    if (since) query = query.gt('updated_at', since);
    const { data, error } = await query.order('id').range(rows.length, rows.length + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data.length) break;
    rows.push(...(data as ExerciseRow[]));
  }
  if (rows.length) useCatalogStore.setState((s) => ({ rows: mergeRows(s.rows, rows) }));
  // Nothing usable on first launch counts as a failed download, so the retry screen shows.
  if (!Object.keys(useCatalogStore.getState().rows).length) {
    throw new Error('The exercise catalog is empty');
  }
  return rows.length;
}

/**
 * Keeps the exercise catalog current: on launch and every hour while the app runs. Takes the
 * client directly because the root layout calls it above its QueryClientProvider.
 *
 * Until the first download succeeds the app has no exercises: `ready` turns true with it, and
 * `failed` says it couldn't be loaded (no connection on first launch).
 */
export function useCatalogRefresh() {
  const ready = useCatalogStore((s) => Object.keys(s.rows).length > 0);
  const { isError, isFetching, refetch } = useQuery(
    {
      queryKey: queryKeys.exerciseCatalog.changes.queryKey,
      queryFn: fetchCatalogChanges,
      staleTime: HOUR_MS,
      refetchInterval: HOUR_MS,
    },
    queryClient,
  );
  return {
    ready,
    failed: !ready && isError,
    retrying: isFetching,
    retry: () => void refetch(),
  };
}
