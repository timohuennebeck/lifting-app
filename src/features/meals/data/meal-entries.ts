import { createQueryKeys } from '@lukemorales/query-key-factory';
import { asc, eq, sql } from 'drizzle-orm';

import { newId, nowIso } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import { type MealEntryRecord, mealEntries } from '@/shared/data/powersync/schema';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';

/** The meals of a day, in the order the log lists them. */
export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type Meal = (typeof MEALS)[number];

export const isMeal = (value: string | undefined): value is Meal =>
  (MEALS as readonly (string | undefined)[]).includes(value);

export interface MealEntry {
  id: string;
  /** The user's calendar day (YYYY-MM-DD). */
  date: string;
  meal: Meal;
  name: string;
  kcal: number;
  /** Grams; null when not given. */
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}

/** What the entry form edits. */
export type MealDraft = Omit<MealEntry, 'id'>;

/** A logged day added up. Each macro sums the meals that give it; null when none does. */
export interface DayTotals {
  date: string;
  kcal: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}

const mealKeys = createQueryKeys('meals', {
  day: (date: string) => [date],
  days: null,
  entry: (id: string) => [id],
});

const toEntry = (r: MealEntryRecord): MealEntry => ({
  id: r.id,
  date: r.date,
  meal: isMeal(r.meal) ? r.meal : 'snack',
  name: r.name,
  kcal: r.kcal,
  proteinG: r.protein_g,
  carbsG: r.carbs_g,
  fatG: r.fat_g,
});
const toEntries = (rows: MealEntryRecord[]) => rows.map(toEntry);
const firstEntry = (rows: MealEntryRecord[]) => (rows[0] ? toEntry(rows[0]) : null);

/** The meals logged on a day, in the order they were added. */
export function useMealsOn(date: string) {
  const { data, isLoading } = useDrizzleQuery({
    queryKey: mealKeys.day(date).queryKey,
    query: drizzle
      .select()
      .from(mealEntries)
      .where(eq(mealEntries.date, date))
      .orderBy(asc(mealEntries.created_at)),
    map: toEntries,
  });
  return { meals: data ?? [], isLoading };
}

// SQLite's sum() is null when every value is: a macro no meal of the day gives stays unknown.
const daysQuery = () =>
  drizzle
    .select({
      date: mealEntries.date,
      kcal: sql<number>`sum(${mealEntries.kcal})`,
      protein: sql<number | null>`sum(${mealEntries.protein_g})`,
      carbs: sql<number | null>`sum(${mealEntries.carbs_g})`,
      fat: sql<number | null>`sum(${mealEntries.fat_g})`,
    })
    .from(mealEntries)
    .groupBy(mealEntries.date)
    .orderBy(asc(mealEntries.date));

const toDays = (rows: RowOf<typeof daysQuery>[]): DayTotals[] =>
  rows.map((r) => ({
    date: r.date,
    kcal: r.kcal,
    proteinG: r.protein,
    carbsG: r.carbs,
    fatG: r.fat,
  }));

/** Every logged day added up, oldest first. */
export function useDayTotals() {
  const { data, isLoading } = useDrizzleQuery({
    queryKey: mealKeys.days.queryKey,
    query: daysQuery(),
    map: toDays,
  });
  return { days: data ?? [], isLoading };
}

/** One meal, for its edit form; null while loading, without an id, or once deleted. */
export function useMealEntry(id: string | undefined) {
  const { data, isLoading } = useDrizzleQuery({
    queryKey: mealKeys.entry(id ?? '').queryKey,
    enabled: !!id,
    query: drizzle
      .select()
      .from(mealEntries)
      .where(eq(mealEntries.id, id ?? '')),
    map: firstEntry,
  });
  return { entry: data ?? null, isLoading };
}

/** Grams kept to the one decimal the server column has. */
const toGrams = (grams: number | null) => (grams === null ? null : Math.round(grams * 10) / 10);

const columns = (draft: MealDraft) => ({
  date: draft.date,
  meal: draft.meal,
  name: draft.name.trim(),
  kcal: Math.round(draft.kcal),
  protein_g: toGrams(draft.proteinG),
  carbs_g: toGrams(draft.carbsG),
  fat_g: toGrams(draft.fatG),
});

/** Logs a meal; returns its id. */
export async function addMealEntry(userId: string, draft: MealDraft) {
  const id = newId();
  await drizzle
    .insert(mealEntries)
    .values({ id, user_id: userId, ...columns(draft), created_at: nowIso() });
  return id;
}

export async function updateMealEntry(id: string, draft: MealDraft) {
  await drizzle.update(mealEntries).set(columns(draft)).where(eq(mealEntries.id, id));
}

export async function deleteMealEntry(id: string) {
  await drizzle.delete(mealEntries).where(eq(mealEntries.id, id));
}
