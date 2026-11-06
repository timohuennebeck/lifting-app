import type { ReadFile } from './read-file';

/** A workbook with more than one sheet to read asks which ones (13s). */
export const asksSheets = (read: ReadFile | null) =>
  (read?.summaries?.filter((s) => s.kind !== 'empty').length ?? 0) > 1;

/** The import's steps up to 13p, for its counter: the file, maybe its sheets, what was found. */
export const importSteps = (read: ReadFile | null) => (asksSheets(read) ? 3 : 2);

/** The file's type as its card shows it: "CSV", "XLSX". */
export const fileLabel = (name: string) =>
  (/\.([a-z0-9]{2,4})$/i.exec(name)?.[1] ?? 'csv').toUpperCase();

/** The file's name without its type: "past_workouts". */
export const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || name;
