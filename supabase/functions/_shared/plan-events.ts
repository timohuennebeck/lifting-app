// What the app receives from the plan functions (read-plan, generate-plan): the shapes of its
// ImportedDay, ImportedExercise and CustomExercise, and the server-sent events that carry them.
// Plain TypeScript without Deno APIs.

export interface SetTarget {
  targetMin: number | null;
  targetMax: number | null;
  rir: number | null;
}

export interface ImportedDay {
  name: string;
  weekday: number | null;
  /** The heading as read, when there is no weekday. */
  rawDay?: string;
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

/**
 * The plan as server-sent events: its name, then each day with its exercises as they are written,
 * and lastly `done`, or `error` when it broke off or there is no plan. A day comes with its first
 * exercise, so days without any never show; exercises belong to the day before them. A new
 * exercise comes with the first line using it.
 */
export type PlanEvent =
  | { type: 'plan'; name: string }
  | { type: 'day'; day: ImportedDay }
  | { type: 'exercise'; exercise: ImportedExercise; newExercise?: NewExercise }
  | { type: 'done' }
  | { type: 'error'; error: 'not_a_plan' | 'failed' };
