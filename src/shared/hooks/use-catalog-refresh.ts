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

/** Fetches exercises changed since the newest one the app knows. Works logged out. */
async function fetchCatalogChanges() {
  const since = latestUpdate(useCatalogStore.getState().rows);
  const query = supabase.from('exercises').select('*');
  const { data, error } = await (since ? query.gt('updated_at', since) : query);
  if (error) throw error;
  const rows = data as ExerciseRow[];
  if (rows.length) useCatalogStore.setState((s) => ({ rows: mergeRows(s.rows, rows) }));
  return rows.length;
}

/**
 * Keeps the exercise catalog current: on launch and every hour while the app runs. Takes the
 * client directly because the root layout calls it above its QueryClientProvider.
 */
export function useCatalogRefresh() {
  useQuery(
    {
      queryKey: queryKeys.exerciseCatalog.changes.queryKey,
      queryFn: fetchCatalogChanges,
      staleTime: HOUR_MS,
      refetchInterval: HOUR_MS,
    },
    queryClient,
  );
}
