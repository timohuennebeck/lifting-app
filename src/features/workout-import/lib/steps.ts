import type { ReadFile } from './read-file';

/** A workbook with more than one sheet to read asks which ones (13s). */
export const asksSheets = (read: ReadFile | null) =>
  (read?.summaries?.filter((s) => s.kind !== 'empty').length ?? 0) > 1;

/** The import's steps before reading: the file, and maybe its sheets. */
export const importSteps = (read: ReadFile | null) => (asksSheets(read) ? 2 : 1);

/**
 * The import's counter: in the app the start screen is its first step (in onboarding it ends the
 * questions about the user), then the file, maybe its sheets, the dates when workouts have none
 * (`withDates`), and "Importiert" last. `offset` is added to the file's and the sheets' numbers.
 */
export function flowSteps(read: ReadFile | null, inApp: boolean, withDates = false) {
  const offset = inApp ? 1 : 0;
  return { offset, total: offset + importSteps(read) + (withDates ? 1 : 0) + 1 };
}

/** The file's type as its card shows it: "CSV", "XLSX". */
export const fileLabel = (name: string) =>
  (/\.([a-z0-9]{2,4})$/i.exec(name)?.[1] ?? 'csv').toUpperCase();

/** The file's name without its type: "past_workouts". */
export const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || name;

/**
 * The import's subtitles as its design sets them: 12pt below the title. The title keeps the app's
 * line height: tighter, iOS cuts off the dots of Ü, Ä and Ö.
 */
export const TITLE_STYLE = { subtitleClassName: 'mt-3 leading-[22.5px]' } as const;

/** The import's main button as its design sizes it: 56pt high, a 16pt label. */
export const CTA_STYLE = { className: 'h-14', textClassName: 'text-base' } as const;

/** The text button under it: 44pt high, 16pt medium. */
export const LINK_STYLE = {
  tone: 'muted',
  className: 'min-h-11',
  textClassName: 'font-inter-medium text-base',
} as const;
