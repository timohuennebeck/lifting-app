import type { ImageSourcePropType } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { env } from '@/shared/config/env';
import { i18n } from '@/shared/i18n';
import { zustandStorage } from '@/shared/lib/storage';
import { MUSCLE_IDS, type MuscleId } from '@/shared/ui/muscle-map/body-paths';

import snapshot from './exercise-catalog.json';

// The catalog lives in Supabase (`public.exercises`). The app ships a snapshot of it for the
// first launch and offline use, and `useCatalogRefresh` adds newer rows from the API.

export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';

/** What one set records; the workout screen shows one box per measure. */
export type Measure = 'weight' | 'reps' | 'seconds';

export interface TechniqueStep {
  title: string;
  text: string;
}

/** A row of `public.exercises` as the API returns it. */
export interface ExerciseRow {
  id: string;
  name: Record<string, string>;
  instructions: Record<string, TechniqueStep[]>;
  equipment: Equipment;
  measures: Measure[];
  muscles: Record<string, number>;
  rest_seconds: number;
  image_path: string | null;
  video_path: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface Exercise {
  id: string;
  equipment: Equipment;
  /** {weight, reps}, {reps}, {seconds} or {weight, seconds}, in display order. */
  measures: Measure[];
  image: ImageSourcePropType | null;
  /** Default rest between sets, in seconds. */
  restSeconds: number;
  /** Share of the training stimulus per muscle; values sum to 1. */
  muscles: Partial<Record<MuscleId, number>>;
  /** Inactive exercises stay for history but aren't offered anymore. */
  isActive: boolean;
}

// Photos bundled with the app; other paths load from the public bucket.
const BUNDLED_MEDIA: Record<string, ImageSourcePropType> = {
  'arnold-press.png': require('@/assets/images/exercises/arnold-press.png'),
  'cable-crossover.png': require('@/assets/images/exercises/cable-crossover.png'),
  'chin-up.png': require('@/assets/images/exercises/chin-up.png'),
  'close-grip-bench-press.png': require('@/assets/images/exercises/close-grip-bench-press.png'),
  'dip.png': require('@/assets/images/exercises/dip.png'),
  'incline-dumbbell-press.png': require('@/assets/images/exercises/incline-dumbbell-press.png'),
  'lateral-raise.png': require('@/assets/images/exercises/lateral-raise.png'),
  'overhead-press.png': require('@/assets/images/exercises/overhead-press.png'),
  'plank.png': require('@/assets/images/exercises/plank.png'),
  'pull-up.png': require('@/assets/images/exercises/pull-up.png'),
  'push-up.png': require('@/assets/images/exercises/push-up.png'),
};

const mediaSource = (path: string): ImageSourcePropType =>
  BUNDLED_MEDIA[path] ?? {
    uri: `${env.supabaseUrl}/storage/v1/object/public/exercise-media/${encodeURI(path)}`,
  };

/** Every measure this app version knows, in display order. */
const MEASURES: Measure[] = ['weight', 'reps', 'seconds'];
const MUSCLES: readonly string[] = MUSCLE_IDS;

/** Rows this app version can show: known measures with exactly one of reps or seconds. */
function isUsable(row: ExerciseRow) {
  const { measures } = row;
  return (
    measures.every((m) => MEASURES.includes(m)) &&
    measures.includes('reps') !== measures.includes('seconds')
  );
}

const toMs = (iso: string) => Date.parse(iso) || 0;

/** Merges rows into the catalog, keeping the newer version of each exercise. */
export function mergeRows(rows: Record<string, ExerciseRow>, incoming: ExerciseRow[]) {
  const next = { ...rows };
  for (const row of incoming) {
    const current = next[row.id];
    if (isUsable(row) && (!current || toMs(row.updated_at) >= toMs(current.updated_at))) {
      next[row.id] = row;
    }
  }
  return next;
}

/** Newest `updated_at` in the catalog; the API is asked for rows changed after it. */
export const latestUpdate = (rows: Record<string, ExerciseRow>) =>
  Object.values(rows).reduce((max, r) => (toMs(r.updated_at) > toMs(max) ? r.updated_at : max), '');

interface CatalogState {
  rows: Record<string, ExerciseRow>;
}

const bundled = mergeRows({}, snapshot as unknown as ExerciseRow[]);

export const useCatalogStore = create<CatalogState>()(
  persist(() => ({ rows: bundled }), {
    name: 'exercise-catalog',
    storage: createJSONStorage(() => zustandStorage),
    // An app update may bundle newer rows than the cache holds.
    merge: (persisted, current) => ({
      ...current,
      rows: mergeRows(current.rows, Object.values((persisted as CatalogState | null)?.rows ?? {})),
    }),
  }),
);

const derived = new WeakMap<ExerciseRow, Exercise>();

function toExercise(row: ExerciseRow): Exercise {
  let exercise = derived.get(row);
  if (!exercise) {
    exercise = {
      id: row.id,
      equipment: row.equipment,
      measures: MEASURES.filter((m) => row.measures.includes(m)),
      image: row.image_path ? mediaSource(row.image_path) : null,
      restSeconds: row.rest_seconds,
      // Muscles a newer catalog added have no place on this app's body map yet.
      muscles: Object.fromEntries(Object.entries(row.muscles).filter(([m]) => MUSCLES.includes(m))),
      isActive: row.is_active,
    };
    derived.set(row, exercise);
  }
  return exercise;
}

export function getExercise(id: string): Exercise | undefined {
  const row = useCatalogStore.getState().rows[id];
  return row ? toExercise(row) : undefined;
}

/** Ids of the exercises users can pick (the catalog without retired ones). */
export function activeExerciseIds(rows = useCatalogStore.getState().rows) {
  return Object.values(rows)
    .filter((r) => r.is_active)
    .map((r) => r.id);
}

/** Text in the app language, falling back to English. */
function localized<T>(texts: Record<string, T> | undefined, language: string) {
  return texts?.[language] ?? texts?.en;
}

/** Localized exercise name; the id when the exercise isn't in the catalog. */
export function exerciseName(id: string, language = i18n.language) {
  return localized(useCatalogStore.getState().rows[id]?.name, language) ?? id;
}

export function exerciseInstructions(id: string, language = i18n.language): TechniqueStep[] {
  return localized(useCatalogStore.getState().rows[id]?.instructions, language) ?? [];
}

const DEFAULT_MEASURES: Measure[] = ['weight', 'reps'];

/** Boxes of a set in display order; exercises missing from the catalog log weight and reps. */
export const measuresOf = (exerciseId: string): Measure[] =>
  getExercise(exerciseId)?.measures ?? DEFAULT_MEASURES;

export const hasMeasure = (exerciseId: string, measure: Measure) =>
  measuresOf(exerciseId).includes(measure);

/** Catalog exercises that don't log `measure`, e.g. the ones without weight. */
export const exerciseIdsWithout = (measure: Measure) =>
  Object.values(useCatalogStore.getState().rows)
    .filter((r) => !r.measures.includes(measure))
    .map((r) => r.id);

/** Whether sets of the exercise are counted in seconds instead of reps. */
export const isTimed = (exerciseId: string) => hasMeasure(exerciseId, 'seconds');

export interface SetTargets {
  /** Reps, or seconds for timed exercises. */
  min: number;
  max: number;
  rir: number | null;
}

/** Targets of a new set: 8–12 reps at 2 RIR, or a 30–45 s hold (RIR is about reps). */
export const defaultTargets = (exerciseId: string): SetTargets =>
  isTimed(exerciseId) ? { min: 30, max: 45, rir: null } : { min: 8, max: 12, rir: 2 };
