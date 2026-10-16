// What the plan functions (read-plan, generate-plan) share in plain TypeScript, without Deno APIs:
// the app's languages and muscles, the catalog names the model reads, the shapes of the app's
// ImportedRoutine, ImportedExercise and CustomExercise, the server-sent events that carry them,
// and how the names in them are tidied.

/** The app languages (its AppLanguage). */
export const LANGUAGES = ['de', 'en', 'pt-PT', 'pt-BR', 'ko'];

/** The app's muscles (its MuscleId): focus muscles and the muscles of new exercises. */
export const MUSCLES = [
  'abs',
  'adductors',
  'biceps',
  'calves',
  'chest',
  'forearms',
  'front_delts',
  'glutes',
  'hamstrings',
  'lats',
  'lower_back',
  'neck',
  'obliques',
  'quads',
  'rear_delts',
  'side_delts',
  'tibialis',
  'traps',
  'triceps',
  'upper_back',
] as const;

/** A catalog exercise's names as the model reads them: app language, German, English, each once. */
export const catalogNames = (name: Record<string, string>, language: string) =>
  [...new Set([language, 'de', 'en'].map((l) => name[l]).filter(Boolean))].join(' / ');

export interface SetTarget {
  targetMin: number | null;
  targetMax: number | null;
  rir: number | null;
}

export interface ImportedRoutine {
  name: string;
}

export interface ImportedExercise {
  exerciseId: string;
  sets: SetTarget[];
  restSeconds: number | null;
  /** Set on lines to review: the text as read, and other likely catalog exercises. */
  raw?: string;
  alternatives?: string[];
}

/** An exercise the catalog doesn't have, created for the user with the plan. */
export interface NewExercise {
  id: string;
  name: string;
  primary: string[];
  secondary: string[];
  measures: string[];
  restSeconds: number;
}

/** An exercise of the plan, with the new exercise it introduces when it is the first to use one. */
export interface PlanExercise {
  exercise: ImportedExercise;
  newExercise?: NewExercise;
}

/**
 * The plan as server-sent events: its name, then each routine with its exercises as they are
 * written, and lastly `done`, or `error` when it broke off or there is no plan. A routine comes
 * with its first exercise, so routines without any never show; exercises belong to the routine
 * before them. A new exercise comes with the first line using it.
 */
export type PlanEvent =
  | { type: 'plan'; name: string }
  | { type: 'routine'; routine: ImportedRoutine }
  | ({ type: 'exercise' } & PlanExercise)
  | { type: 'done' }
  | { type: 'error'; error: 'not_a_plan' | 'failed' };

/** Text on one line, trimmed, at most `max` characters. */
/**
 * At most `max` characters, cut after a whole word where that keeps most of it, without a
 * dangling "+", "/" or "–".
 */
export function cut(text: string, max: number) {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length <= max) return clean;
  const part = clean.slice(0, max);
  const space = part.lastIndexOf(' ');
  return (space > max / 2 ? part.slice(0, space) : part).replace(/[\s+/&·,;:–-]+$/u, '');
}

/** The plan's name as the app gets it: at most 30 characters, "Plan" when the model gave none. */
export const planName = (name: string) => cut(name, 30) || 'Plan';
