import type { ReadFile } from './read-file';

/** A workbook with more than one sheet to read asks which ones (13s). */
export const asksSheets = (read: ReadFile | null) =>
  (read?.summaries?.filter((s) => s.kind !== 'empty').length ?? 0) > 1;

/** Where a picked file goes: its sheets (a workbook with several), else straight to reading. */
export const afterPick = (read: ReadFile) =>
  asksSheets(read) ? ('/import/sheets' as const) : ('/import/reading' as const);

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
