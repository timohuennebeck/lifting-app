import type { PlanAnswers } from '@/features/plan-create/lib/plan-answers';
import { postFunction, refusalOf } from '@/shared/data/edge-functions';
import type { CustomExercise } from '@/shared/data/exercises';
import { clampSessions, type PlanDraft, type RoutineDraft } from '@/shared/data/plans';
import type { ExerciseDraft } from '@/shared/data/routines';
import { readServerEvents } from '@/shared/lib/server-events';

export type ImportSource =
  /** A plan in a workout file the import read: its rows as text (`name`: the file's). */
  | { kind: 'text'; name: string; text: string }
  /** Not read but made: the AI plan from the onboarding answers (generate-plan). */
  | { kind: 'answers'; answers: PlanAnswers };

export interface ImportedExercise extends ExerciseDraft {
  /** Stays with the exercise while it is edited or dragged to another place. */
  key: string;
  /** Text as read from the source when the match is uncertain; cleared once confirmed. */
  raw?: string;
  /** Other plausible catalog exercise ids for an uncertain line. */
  alternatives?: string[];
  /** Added by voice: `raw` is what was heard rather than read. */
  heard?: boolean;
}

export interface ImportedRoutine extends RoutineDraft {
  /** Stays with the routine while it is dragged to another place in the plan strip. */
  key: string;
  /** The saved routine it is, when the editor changes a saved plan ("Bearbeiten"). */
  routineId?: string;
  exercises: ImportedExercise[];
}

/** A detected plan: its routines in order, plus review hints for uncertain lines. */
export interface ImportedPlan {
  name: string;
  routines: ImportedRoutine[];
  /** Exercises the plan uses that the catalog doesn't have; created with the account. */
  newExercises: CustomExercise[];
}

interface StreamPlanInput {
  source: ImportSource;
  /** UI language, so exercise names and routine headings can be matched in context. */
  language: string;
}

export type ImportFailure = 'offline' | 'limit' | 'notAPlan' | 'tooLarge' | 'failed';

export class ImportError extends Error {
  /** Where it broke, for analytics: e.g. "http_429_limit", "stream_not_a_plan", "stream_incomplete". */
  readonly detail: string;

  constructor(
    readonly reason: ImportFailure,
    detail?: string,
  ) {
    super(`Plan import failed: ${reason}`);
    this.detail = detail ?? reason;
  }
}

/** A server error code as analytics detail; anything else (free text) is left out. */
const codeOf = (error: string | undefined) =>
  error && /^[a-z_]{1,40}$/.test(error) ? `_${error}` : '';

const SERVER_ERRORS: Record<string, ImportFailure> = {
  limit: 'limit',
  not_a_plan: 'notAPlan',
  too_large: 'tooLarge',
};

/**
 * Throws once the import was stopped. Not `signal.throwIfAborted()`: React Native's AbortSignal
 * (the abort-controller polyfill) doesn't have it.
 */
function stopIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new Error('The plan import was stopped');
}

/** What the plan functions send while they read or make it (their PlanEvent). */
export type PlanEvent =
  | { type: 'plan'; name: string }
  | { type: 'routine'; routine: Omit<RoutineDraft, 'exercises'> }
  | {
      type: 'exercise';
      exercise: Omit<ImportedExercise, 'key'>;
      /** Set the first time the plan uses an exercise the catalog doesn't have. */
      newExercise?: Omit<CustomExercise, 'archived'>;
    };

/**
 * Gets a training plan from the Edge Functions, which stream it: reads it from a workout file's
 * rows (read-plan) or makes it from the onboarding answers (generate-plan). `onEvent` gets the
 * plan's name, then each routine and exercise as soon as it is there (an exercise belongs to the
 * routine before it). Resolves once the plan is complete. Throws an ImportError with the reason when
 * there is no plan to show, also when the stream breaks off; once `signal` stops it, the error
 * doesn't matter.
 */
export async function streamPlan(
  { source, language }: StreamPlanInput,
  onEvent: (event: PlanEvent) => void,
  signal: AbortSignal,
) {
  const fn = source.kind === 'answers' ? 'generate-plan' : 'read-plan';
  const request =
    source.kind === 'answers'
      ? { answers: source.answers }
      : { name: source.name, text: source.text };
  const response = await postFunction(
    fn,
    { ...request, language },
    { signal, offline: () => new ImportError('offline', 'no_connection') },
  );
  if (!response.ok || !response.body) {
    const { error } = await refusalOf(fn, response);
    throw new ImportError(
      SERVER_ERRORS[error ?? ''] ?? 'failed',
      `http_${response.status}${codeOf(error)}`,
    );
  }

  const done = await readServerEvents<
    PlanEvent | { type: 'done' } | { type: 'error'; error: string }
  >(
    response.body,
    (event) => {
      if (event.type === 'done') return true;
      if (event.type === 'error') {
        // "Not a plan" is an answer, not a fault: the import goes on without the file's plan.
        if (event.error !== 'not_a_plan') console.warn(`${fn} stopped: ${event.error}`);
        throw new ImportError(
          SERVER_ERRORS[event.error] ?? 'failed',
          `stream${codeOf(event.error) || '_error'}`,
        );
      }
      onEvent(event);
    },
    (error) => {
      stopIfAborted(signal);
      console.warn(`${fn} broke off`, error);
      throw new ImportError('offline', 'stream_broken');
    },
  );
  // Ended without "done": the function stopped halfway.
  if (!done) throw new ImportError('failed', 'stream_incomplete');
}

/**
 * Drops review hints and empty routines so the plan can be stored. `settings` are the plan's
 * weekly goal and block; without them the goal is its number of routines and it has no blocks.
 */
export function toPlanDraft(
  plan: ImportedPlan,
  settings?: Pick<PlanDraft, 'sessionsPerWeek' | 'blockWeeks'>,
): PlanDraft {
  const routines = plan.routines
    .filter((r) => r.exercises.length)
    .map((r) => ({
      name: r.name,
      exercises: r.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets,
        restSeconds: e.restSeconds ?? null,
      })),
    }));
  return {
    name: plan.name.trim(),
    routines,
    sessionsPerWeek: settings?.sessionsPerWeek ?? clampSessions(routines.length),
    blockWeeks: settings ? settings.blockWeeks : null,
  };
}

/** True while the routine has an uncertain exercise. */
export const needsReview = (routine: ImportedRoutine) => routine.exercises.some((e) => e.raw);

/** Number of uncertain exercises still to review. */
export function pendingReviews(plan: ImportedPlan) {
  return plan.routines.reduce((sum, r) => sum + r.exercises.filter((e) => e.raw).length, 0);
}
