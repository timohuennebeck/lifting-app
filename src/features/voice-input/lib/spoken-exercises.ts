import { env } from '@/shared/config/env';
import type { CustomExercise } from '@/shared/data/exercises';
import type { ExerciseDraft } from '@/shared/data/routines';
import { i18n } from '@/shared/i18n';
import { showError } from '@/shared/stores/error-sheet-store';

/** Characters of spoken text; the read-exercises function accepts no more. */
export const MAX_SPOKEN = 4000;

/** An exercise as heard, with its sets; an unsure match has what was heard and likely others. */
export interface SpokenExercise extends ExerciseDraft {
  raw?: string;
  alternatives?: string[];
}

export interface SpokenExercises {
  exercises: SpokenExercise[];
  /** Exercises the catalog doesn't have that `exercises` use; they are created for the user. */
  newExercises: CustomExercise[];
}

type SpokenFailure = 'offline' | 'limit' | 'noExercises' | 'failed';

export class SpokenError extends Error {
  constructor(readonly reason: SpokenFailure) {
    super(`Reading spoken exercises failed: ${reason}`);
  }
}

/**
 * The exercises the user named, with their sets and reps, from the read-exercises function.
 * Throws a SpokenError with the reason when it found none or couldn't be reached.
 */
export async function readSpokenExercises(
  text: string,
  language: string,
  signal: AbortSignal,
): Promise<SpokenExercises> {
  const response = await fetch(`${env.supabaseUrl}/functions/v1/read-exercises`, {
    method: 'POST',
    headers: { apikey: env.supabasePublishableKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
    signal,
  }).catch((error: unknown) => {
    if (signal.aborted) throw error;
    console.warn('read-exercises could not be called', error);
    throw new SpokenError('offline');
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.warn(`read-exercises answered ${response.status}: ${text.slice(0, 300)}`);
    throw new SpokenError(response.status === 429 ? 'limit' : 'failed');
  }
  const answer = (await response.json()) as {
    exercises: SpokenExercise[];
    newExercises: Omit<CustomExercise, 'archived'>[];
  };
  if (!answer.exercises.length) throw new SpokenError('noExercises');
  return {
    exercises: answer.exercises,
    newExercises: answer.newExercises.map((e) => ({ ...e, archived: false })),
  };
}

/** Why no exercises were added; "Add exercises" stays on screen to try again. */
export function showSpokenFailure(error: unknown) {
  const key = error instanceof SpokenError ? error.reason : 'failed';
  showError({
    title: i18n.t(`voice:errors.${key}.title`),
    message: i18n.t(`voice:errors.${key}.message`),
  });
}
