import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { exerciseName } from '@/shared/data/exercises';
import { wait } from '@/shared/lib/async';
import { toIsoDate } from '@/shared/lib/date';
import type { UnitSystem } from '@/shared/lib/format';

import { countExportSets, readExportSets } from '../data/workout-export';
import { workoutsCsvHeader, workoutsCsvWriter } from './workouts-csv';

const PAGE_SIZE = 500;
/** The preparing state stays this long, so a small export doesn't only flash by. */
const MIN_PREPARING_MS = 900;

export const exportFileName = (date: Date) => `loqqa-export-${toIsoDate(date)}.csv`;

interface WriteOptions {
  units: UnitSystem;
  language: string;
  onProgress: (progress: number) => void;
}

/** Writes the user's workouts to a CSV file in the cache, reporting progress from 0 to 1. */
export async function writeWorkoutsCsv({ units, language, onProgress }: WriteOptions) {
  const started = Date.now();
  const total = await countExportSets();
  const toLine = workoutsCsvWriter(units, (id) => exerciseName(id, language));

  const parts = [workoutsCsvHeader(units)];
  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    const sets = await readExportSets(PAGE_SIZE, offset);
    parts.push(...sets.map(toLine));
    onProgress(Math.min(1, (offset + PAGE_SIZE) / total));
  }

  const file = new File(Paths.cache, exportFileName(new Date()));
  file.create({ overwrite: true });
  file.write(parts.join(''));

  await wait(MIN_PREPARING_MS - (Date.now() - started));
  return file;
}

/** Opens the system's share sheet for the file, and removes it once that has closed. */
export async function shareAndRemove(file: File) {
  try {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
    });
  } finally {
    if (file.exists) file.delete();
  }
}
