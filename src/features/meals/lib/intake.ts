import { addDays, daysBetween, fromIsoDate, toIsoDate } from '@/shared/lib/date';

import type { DayTotals, Meal, MealEntry } from '../data/meal-entries';

/** Days the average line reaches back, the day itself included. */
export const AVERAGE_DAYS = 7;

export const MACROS = ['protein', 'carbs', 'fat'] as const;
export type Macro = (typeof MACROS)[number];

/** kcal per gram: protein and carbs 4, fat 9. */
const KCAL_PER_GRAM: Record<Macro, number> = { protein: 4, carbs: 4, fat: 9 };

/** The grams of a macro in an entry or a day; null when not given. */
export const gramsOf = (totals: Pick<DayTotals, 'proteinG' | 'carbsG' | 'fatG'>, macro: Macro) =>
  macro === 'protein' ? totals.proteinG : macro === 'carbs' ? totals.carbsG : totals.fatG;

/** The ISO date `days` after `iso` (before it when negative). */
export const shiftDay = (iso: string, days: number) => toIsoDate(addDays(fromIsoDate(iso), days));

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

/** The sum of the values given; null when none is. */
function sumGiven(values: (number | null)[]) {
  const given = values.filter((v): v is number => v !== null);
  return given.length ? given.reduce((sum, v) => sum + v, 0) : null;
}

/** A day's meals added up. */
export function totalsOf(date: string, meals: MealEntry[]): DayTotals {
  return {
    date,
    kcal: meals.reduce((sum, m) => sum + m.kcal, 0),
    proteinG: sumGiven(meals.map((m) => m.proteinG)),
    carbsG: sumGiven(meals.map((m) => m.carbsG)),
    fatG: sumGiven(meals.map((m) => m.fatG)),
  };
}

/** Each macro's share (0–1) of the calories the macros give; null without any. */
export function macroShares(totals: DayTotals): Record<Macro, number> | null {
  const kcal = MACROS.map((m) => (gramsOf(totals, m) ?? 0) * KCAL_PER_GRAM[m]);
  const sum = kcal[0] + kcal[1] + kcal[2];
  if (!sum) return null;
  return { protein: kcal[0] / sum, carbs: kcal[1] / sum, fat: kcal[2] / sum };
}

export interface IntakePoint extends DayTotals {
  /** Average kcal of the days logged in the week up to this one (today: the week before it). */
  averageKcal: number;
}

/**
 * Logged days (oldest first) with their 7-day average. A day without meals is left out rather
 * than counted as 0 kcal: it most likely just wasn't logged. Today is still being logged, so it
 * only counts once it's over: its own average is the 7 days before it (its kcal, without any).
 */
export function withAverage(days: DayTotals[], today: string): IntakePoint[] {
  return days.map((day, i) => {
    const open = day.date === today;
    // Dates are unique and sorted: the window's days are among the AVERAGE_DAYS before this one.
    const counted = days.slice(Math.max(0, i - AVERAGE_DAYS), i + 1).filter((d) => {
      const back = daysBetween(d.date, day.date);
      return open ? back >= 1 && back <= AVERAGE_DAYS : back < AVERAGE_DAYS;
    });
    const averageKcal = counted.length ? mean(counted.map((d) => d.kcal)) : day.kcal;
    return { ...day, averageKcal };
  });
}

/** The average line on a day: that of the last logged day on or before it. */
function averageOn(points: IntakePoint[], date: string) {
  let average: number | undefined;
  for (const p of points) {
    if (p.date > date) break;
    average = p.averageKcal;
  }
  return average;
}

export interface PeriodAverage {
  days: number;
  kcal: number;
  /** Of the days that give it; null when none does. */
  proteinG: number | null;
  /** The average line on each day of the period, oldest first, for the sparkline. */
  series: number[];
}

/**
 * The average logged day among the `days` days before today (finished days only, see
 * withAverage); null while the log doesn't reach back that far, or none of them was logged.
 */
export function averageOver(
  points: IntakePoint[],
  today: string,
  days: number,
): PeriodAverage | null {
  const from = shiftDay(today, -days);
  if (!points.length || points[0].date > from) return null;
  const logged = points.filter((p) => p.date >= from && p.date < today);
  if (!logged.length) return null;
  const kcal = mean(logged.map((p) => p.kcal));
  const protein = logged.flatMap((p) => (p.proteinG === null ? [] : [p.proteinG]));
  const series = Array.from(
    { length: days },
    (_, i) => averageOn(points, shiftDay(from, i)) ?? kcal,
  );
  return { days, kcal, proteinG: protein.length ? mean(protein) : null, series };
}

/** The meal it's most likely time for, for a meal added without picking one. */
export function mealAt(time: Date): Meal {
  const hour = time.getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 17 && hour < 22) return 'dinner';
  return 'snack';
}

/** A day's meals by meal, each in the order they were added. */
export function byMeal(meals: MealEntry[]): Record<Meal, MealEntry[]> {
  const groups: Record<Meal, MealEntry[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
  for (const entry of meals) groups[entry.meal].push(entry);
  return groups;
}
