import {
  type ImportedExercise,
  ImportError,
  streamPlan,
} from '@/features/plan-import/lib/plan-import-service';
import type { CustomExercise } from '@/shared/data/exercises';
import { i18n } from '@/shared/i18n';
import { showError } from '@/shared/stores/error-sheet-store';

/** An exercise as heard: its sets, and for an unsure match what was heard and likely others. */
export type SpokenExercise = Omit<ImportedExercise, 'key' | 'heard'>;

export interface SpokenExercises {
  exercises: SpokenExercise[];
  /** Exercises the catalog doesn't have that `exercises` use; they are created for the user. */
  newExercises: CustomExercise[];
}

/**
 * The exercises the user named, with their sets and reps, from the read-plan function (which
 * reads the text like a plan of one workout). Throws an ImportError with the reason when it
 * found none or couldn't be reached.
 */
export async function readSpokenExercises(
  text: string,
  language: string,
  signal: AbortSignal,
): Promise<SpokenExercises> {
  const spoken: SpokenExercises = { exercises: [], newExercises: [] };
  await streamPlan(
    { source: { kind: 'voice', text }, language },
    (event) => {
      if (event.type !== 'exercise') return;
      spoken.exercises.push(event.exercise);
      if (event.newExercise) spoken.newExercises.push({ ...event.newExercise, archived: false });
    },
    signal,
  );
  if (!spoken.exercises.length) throw new ImportError('notAPlan');
  return spoken;
}

/** Why no exercises were added; "Add exercises" stays on screen to try again. */
export function showSpokenFailure(error: unknown) {
  const reason = error instanceof ImportError ? error.reason : 'failed';
  const key =
    reason === 'notAPlan'
      ? 'noExercises'
      : reason === 'offline' || reason === 'limit'
        ? reason
        : 'failed';
  showError({
    title: i18n.t(`voice:errors.${key}.title`),
    message: i18n.t(`voice:errors.${key}.message`),
  });
}
