// What the app receives from the plan functions (read-plan, generate-plan): the shapes of its
// ImportedRoutine, ImportedExercise and CustomExercise, the server-sent events that carry them, and
// how the names in them are tidied. Plain TypeScript without Deno APIs.

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
export const cut = (text: string, max: number) =>
  text.trim().replace(/\s+/g, ' ').slice(0, max).trim();

/** The plan's name as the app gets it: at most 30 characters, "Plan" when the model gave none. */
export const planName = (name: string) => cut(name, 30) || 'Plan';
