import type { ImageSourcePropType } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { env } from '@/shared/config/env';
import { i18n } from '@/shared/i18n';
import { mmkvStorage } from '@/shared/lib/storage';
import { MUSCLE_IDS, type MuscleId } from '@/shared/ui/muscle-map/body-paths';

import type { PlanExerciseDraft, PlanSetDraft } from './templates';

// The catalog lives in Supabase (`public.exercises`). The app downloads all of it on first launch
// and keeps it on the device for offline use; `useCatalogRefresh` then fetches what changed.
// The user's own exercises (`custom_exercises`, synced by PowerSync) are mirrored next to it, so
// every lookup below finds both.

export type Equipment = 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'cable' | 'bodyweight';

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
  /** Left out of the muscle stats. */
  cardio: boolean;
  /** The weight is assistance: less is harder. */
  assisted: boolean;
  is_active: boolean;
  updated_at: string;
}

export interface Exercise {
  id: string;
  /** Null for the user's own exercises. */
  equipment: Equipment | null;
  /** {weight, reps}, {reps}, {seconds} or {weight, seconds}, in display order. */
  measures: Measure[];
  image: ImageSourcePropType | null;
  /** Default rest between sets, in seconds. */
  restSeconds: number;
  /** Share of the training stimulus per muscle; values sum to 1. */
  muscles: Partial<Record<MuscleId, number>>;
  /** Inactive exercises stay for history but aren't offered anymore. */
  isActive: boolean;
  /** The user's own exercise: its muscles as picked in the form. */
  custom: { primary: MuscleId[]; secondary: MuscleId[] } | null;
}

/** An exercise the user added (`custom_exercises`). */
export interface CustomExercise {
  id: string;
  name: string;
  primary: MuscleId[];
  secondary: MuscleId[];
  measures: Measure[];
  restSeconds: number;
  /** Deleted by the user: hidden from the picker, kept for history and plans. */
  archived: boolean;
}

/** Exercise media live in the public `exercise-media` bucket. */
const mediaSource = (path: string): ImageSourcePropType => ({
  uri: `${env.supabaseUrl}/storage/v1/object/public/exercise-media/${encodeURI(path)}`,
});

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

export const useCatalogStore = create<CatalogState>()(
  persist(() => ({ rows: {} }), {
    name: 'exercise-catalog',
    storage: createJSONStorage(() => mmkvStorage),
  }),
);

interface CustomExerciseState {
  exercises: Record<string, CustomExercise>;
  /** Set once the local database was read, so ids of custom exercises resolve from the start. */
  loaded: boolean;
  /**
   * Exercises an onboarding plan import found that aren't in the catalog: shown by name in the
   * plan before the account exists, created with it (see the onboarding store).
   */
  drafts: Record<string, CustomExercise>;
}

/** The user's own exercises, mirrored from the local database by `useCustomExerciseSync`. */
export const useCustomExerciseStore = create<CustomExerciseState>(() => ({
  exercises: {},
  loaded: false,
  drafts: {},
}));

const customExercises = () => useCustomExerciseStore.getState().exercises;
const draftExercise = (id: string) => useCustomExerciseStore.getState().drafts[id];

const derived = new WeakMap<ExerciseRow | CustomExercise, Exercise>();

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
      custom: null,
    };
    derived.set(row, exercise);
  }
  return exercise;
}

/** In a custom exercise's shares a primary muscle counts this many times a secondary one. */
const PRIMARY_WEIGHT = 2;

function fromCustom(custom: CustomExercise): Exercise {
  let exercise = derived.get(custom);
  if (!exercise) {
    const { primary, secondary } = custom;
    const total = PRIMARY_WEIGHT * primary.length + secondary.length;
    exercise = {
      id: custom.id,
      equipment: null,
      measures: custom.measures,
      image: null,
      restSeconds: custom.restSeconds,
      muscles: Object.fromEntries([
        ...primary.map((m) => [m, PRIMARY_WEIGHT / total]),
        ...secondary.map((m) => [m, 1 / total]),
      ]),
      isActive: !custom.archived,
      custom: { primary, secondary },
    };
    derived.set(custom, exercise);
  }
  return exercise;
}

const exerciseOf = (row: ExerciseRow | undefined, custom: CustomExercise | undefined) =>
  row ? toExercise(row) : custom ? fromCustom(custom) : undefined;

export const getExercise = (id: string): Exercise | undefined =>
  exerciseOf(useCatalogStore.getState().rows[id], customExercises()[id] ?? draftExercise(id));

// Render code reads exercises through these hooks: the React Compiler keeps what a plain lookup
// returned for the same id, so a catalog update or an edit of the user's own exercise wouldn't show.

/** `getExercise`, re-rendering when the exercise changes. */
export function useExercise(id: string) {
  const row = useCatalogStore((s) => s.rows[id]);
  const custom = useCustomExerciseStore((s) => s.exercises[id] ?? s.drafts[id]);
  return exerciseOf(row, custom);
}

/** `exerciseName`, re-rendering when the exercise changes. */
export function useExerciseName(id: string, language: string) {
  const row = useCatalogStore((s) => s.rows[id]);
  const custom = useCustomExerciseStore((s) => s.exercises[id] ?? s.drafts[id]);
  return nameOf(row, custom, language) ?? id;
}

/** Ids of the catalog's exercises that `keep` accepts. */
const idsWhere = (keep: (row: ExerciseRow) => boolean, rows = useCatalogStore.getState().rows) =>
  Object.values(rows)
    .filter(keep)
    .map((r) => r.id);

/** Ids of the exercises users can pick: the catalog without retired ones, and their own. */
export const activeExerciseIds = (
  rows = useCatalogStore.getState().rows,
  custom = customExercises(),
) => [
  ...idsWhere((r) => r.is_active, rows),
  ...Object.values(custom)
    .filter((c) => !c.archived)
    .map((c) => c.id),
];

/** Text in the app language, falling back to English. */
function localized<T>(texts: Record<string, T> | undefined, language: string) {
  return texts?.[language] ?? texts?.en;
}

const nameOf = (
  row: ExerciseRow | undefined,
  custom: CustomExercise | undefined,
  language: string,
) => localized(row?.name, language) ?? custom?.name;

/**
 * Localized exercise name (a custom exercise's own); the id for an unknown exercise. A list
 * rendering names passes the user's exercises from `useCustomExerciseStore` (see `useExercise`).
 */
export const exerciseName = (id: string, language = i18n.language, custom = customExercises()) =>
  nameOf(useCatalogStore.getState().rows[id], custom[id] ?? draftExercise(id), language) ?? id;

export function exerciseInstructions(id: string, language = i18n.language): TechniqueStep[] {
  return localized(useCatalogStore.getState().rows[id]?.instructions, language) ?? [];
}

const DEFAULT_MEASURES: Measure[] = ['weight', 'reps'];

/** Boxes of a set in display order; exercises missing from the catalog log weight and reps. */
export const measuresOf = (exerciseId: string): Measure[] =>
  getExercise(exerciseId)?.measures ?? DEFAULT_MEASURES;

export const hasMeasure = (exerciseId: string, measure: Measure) =>
  measuresOf(exerciseId).includes(measure);

/** Exercises that don't log `measure`, e.g. the ones without weight. */
export const exerciseIdsWithout = (measure: Measure) => [
  ...idsWhere((r) => !r.measures.includes(measure)),
  ...Object.values(customExercises())
    .filter((c) => !c.measures.includes(measure))
    .map((c) => c.id),
];

/** Catalog exercises done with the body as the load (pull-ups, dips, …). */
export const bodyweightExerciseIds = () => idsWhere((r) => r.equipment === 'bodyweight');

export const isBodyweight = (exerciseId: string) =>
  getExercise(exerciseId)?.equipment === 'bodyweight';

/** Catalog exercises whose weight helps (assisted pull-up machine): less weight is harder. */
export const assistedExerciseIds = () => idsWhere((r) => r.assisted);

export const isAssisted = (exerciseId: string) =>
  !!useCatalogStore.getState().rows[exerciseId]?.assisted;

/** Cardio, which the muscle stats leave out. */
export const isCardio = (exerciseId: string) =>
  !!useCatalogStore.getState().rows[exerciseId]?.cardio;

/** Whether sets of the exercise are counted in seconds instead of reps. */
export const isTimed = (exerciseId: string) => hasMeasure(exerciseId, 'seconds');

export interface SetTargets {
  /** Reps, or seconds for timed exercises; either may be left out. */
  min: number | null;
  max: number | null;
  rir: number | null;
}

/** Targets of a new set: 8–12 reps at 2 RIR, or a 30–45 s hold (RIR is about reps). */
export const targetsFor = (timed: boolean): SetTargets =>
  timed ? { min: 30, max: 45, rir: null } : { min: 8, max: 12, rir: 2 };

export const defaultTargets = (exerciseId: string): SetTargets => targetsFor(isTimed(exerciseId));

/** `count` new plan sets at the exercise's default targets. */
export function defaultSetDrafts(exerciseId: string, count: number): PlanSetDraft[] {
  const { min, max, rir } = defaultTargets(exerciseId);
  return Array.from({ length: count }, () => ({ targetMin: min, targetMax: max, rir }));
}

/**
 * Targets for the sets of a swapped exercise: reset only between reps and seconds, since
 * "8–12" means something else for a plank. Null keeps the current targets.
 */
export const swapTargets = (fromId: string, toId: string): SetTargets | null =>
  isTimed(fromId) !== isTimed(toId) ? defaultTargets(toId) : null;

/** Sets of an exercise added to a plan, template or workout. */
const NEW_EXERCISE_SETS = 3;

/** An exercise as the library adds it: three sets at its default targets, its default rest. */
export const newExerciseDraft = (exerciseId: string): PlanExerciseDraft => ({
  exerciseId,
  sets: defaultSetDrafts(exerciseId, NEW_EXERCISE_SETS),
  restSeconds: null,
});

/** `draft` with another exercise; its sets get new defaults where `swapTargets` resets them. */
export const swapExerciseDraft = <T extends PlanExerciseDraft>(
  draft: T,
  exerciseId: string,
): T => ({
  ...draft,
  exerciseId,
  sets: swapTargets(draft.exerciseId, exerciseId)
    ? defaultSetDrafts(exerciseId, draft.sets.length)
    : draft.sets,
});
