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

/** The import's titles as its design sets them: lines 30pt apart, the subtitle 12pt below. */
export const TITLE_STYLE = {
  titleTextClassName: 'leading-[30px]',
  subtitleClassName: 'mt-3 leading-[22.5px]',
} as const;

/** The import's main button as its design sizes it: 56pt high, a 16pt label. */
export const CTA_STYLE = { className: 'h-14', textClassName: 'text-base' } as const;

/** The text button under it: 44pt high, 16pt medium. */
export const LINK_STYLE = {
  tone: 'muted',
  className: 'min-h-11',
  textClassName: 'font-inter-medium text-base',
} as const;
