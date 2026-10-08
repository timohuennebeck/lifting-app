import { mondayIndex } from '@/shared/lib/format';

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

/** Whole minutes between two ISO timestamps. */
export const minutesBetween = (fromIso: string, toIso: string) =>
  Math.max(1, Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 60000));
