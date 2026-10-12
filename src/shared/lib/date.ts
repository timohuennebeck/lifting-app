export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

/** "Last N days" choices of the Muscles tab and the exercise history. */
export const DAY_RANGES = [7, 14, 30, 90] as const;
export type DayRange = (typeof DAY_RANGES)[number];

/** Monday-based weekday index (0 = Monday … 6 = Sunday). */
export const mondayIndex = (date: Date) => (date.getDay() + 6) % 7;

export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** Monday 00:00 of the week containing `date`. */
export const startOfWeek = (date: Date) => addDays(date, -mondayIndex(date));

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Days in a month (1–12) of a year, e.g. 29 for February 2028. */
export const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

/** An ISO date (YYYY-MM-DD) from a year, month (1–12) and day. */
export const isoDate = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/** The ISO date (YYYY-MM-DD) of `date`'s local calendar day. */
export const toIsoDate = (date: Date) =>
  isoDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

/** Local midnight of an ISO date (YYYY-MM-DD). */
export function fromIsoDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Calendar days from one ISO date to another (negative when `to` comes first). */
export const daysBetween = (from: string, to: string) =>
  Math.round((fromIsoDate(to).getTime() - fromIsoDate(from).getTime()) / DAY_MS);

/** Whether `date` falls on the calendar day before `now`. */
export const isYesterday = (date: Date, now: Date) => isSameDay(date, addDays(now, -1));

/** Whole minutes between two ISO timestamps (at least 1), or 0 while unfinished. */
export function minutesBetween(fromIso: string, toIso: string | null) {
  if (!toIso) return 0;
  return Math.max(1, Math.round((Date.parse(toIso) - Date.parse(fromIso)) / MINUTE_MS));
}
