import { useQuery } from '@tanstack/react-query';

import {
  type EquipmentRow,
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

/** The equipment rows that differ from the ones the app has (equipment is never deleted). */
function changedEquipment(rows: EquipmentRow[]) {
  const known = useCatalogStore.getState().equipment;
  return rows.filter((e) => JSON.stringify(known[e.id]) !== JSON.stringify(e));
}

/**
 * Fetches the equipment, a few rows, and the exercises changed since the newest one the app
 * knows (all of them on first launch), side by side, and saves what changed in one write. Works
 * logged out.
 */
async function fetchCatalogChanges() {
  const since = latestUpdate(useCatalogStore.getState().rows);
  const page = (from: number) => {
    let query = supabase.from('exercises').select('*', { count: from ? undefined : 'exact' });
    if (since) query = query.gt('updated_at', since);
    return query.order('id').range(from, from + PAGE_SIZE - 1);
  };
  const [equipment, first] = await Promise.all([supabase.from('equipment').select('*'), page(0)]);
  if (equipment.error) throw equipment.error;
  if (first.error) throw first.error;
  const rows = [...(first.data as ExerciseRow[])];
  // More pages only when the server caps a page lower than asked (Supabase's `max_rows`).
  while (first.count !== null && rows.length < first.count) {
    const { data, error } = await page(rows.length);
    if (error) throw error;
    if (!data.length) break;
    rows.push(...(data as ExerciseRow[]));
  }
  const gear = changedEquipment(equipment.data as EquipmentRow[]);
  // The store is saved whole on every change: written only when something did.
  if (rows.length || gear.length) {
    useCatalogStore.setState((s) => ({
      rows: rows.length ? mergeRows(s.rows, rows) : s.rows,
      equipment: gear.length
        ? { ...s.equipment, ...Object.fromEntries(gear.map((e) => [e.id, e])) }
        : s.equipment,
    }));
  }
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
