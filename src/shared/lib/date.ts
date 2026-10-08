export const MINUTE_MS = 60_000;
export const DAY_MS = 86_400_000;

/** Monday-based weekday index (0 = Monday … 6 = Sunday). */
export const mondayIndex = (date: Date) => (date.getDay() + 6) % 7;

export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** Monday 00:00 of the week containing `date`. */
export const startOfWeek = (date: Date) => addDays(startOfDay(date), -mondayIndex(date));

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Whole minutes between two ISO timestamps (at least 1), or 0 while unfinished. */
export function minutesBetween(fromIso: string, toIso: string | null) {
  if (!toIso) return 0;
  return Math.max(1, Math.round((Date.parse(toIso) - Date.parse(fromIso)) / MINUTE_MS));
}
