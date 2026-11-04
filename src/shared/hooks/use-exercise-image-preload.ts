import { Image } from 'expo-image';
import { useEffect } from 'react';

import { catalogThumbUrls, exerciseImageUrls, useCatalogStore } from '@/shared/data/exercises';
import { useRoutineExerciseIds } from '@/shared/data/routines';

/** Downloads the images the device doesn't have; the system may clear its cache at any time. */
async function downloadMissing(urls: string[]) {
  const saved = await Promise.all(urls.map((url) => Image.getCachePathAsync(url)));
  const missing = urls.filter((_, i) => !saved[i]);
  if (missing.length) await Image.prefetch(missing, 'disk');
}

/**
 * Downloads exercise images ahead of time, so a gym without signal still shows them: every
 * thumbnail, and the photos of the exercises in the user's routines. Runs on launch and when the
 * catalog or the routines change; what failed is tried again then.
 */
export function useExerciseImagePreload() {
  const rows = useCatalogStore((s) => s.rows);
  const { data: routineExerciseIds } = useRoutineExerciseIds();
  useEffect(() => {
    void downloadMissing(catalogThumbUrls(rows));
  }, [rows]);
  useEffect(() => {
    if (routineExerciseIds) void downloadMissing(exerciseImageUrls(rows, routineExerciseIds));
  }, [rows, routineExerciseIds]);
}
