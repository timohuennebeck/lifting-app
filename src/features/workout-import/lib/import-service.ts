import { postFunction, refusalOf } from '@/shared/data/edge-functions';
import type { CustomExercise } from '@/shared/data/exercises';

import type { SheetReading } from './history';
import type { sheetSample } from './samples';

/** Why the import stopped: shown on the reading screen's error sheet. */
export type ImportFailure = 'offline' | 'limit' | 'tooLarge' | 'failed';

export class WorkoutImportError extends Error {
  /** Where it broke, for analytics: e.g. "categorize_http_429_limit", "map_offline". */
  readonly detail: string;

  constructor(
    readonly reason: ImportFailure,
    detail: string,
  ) {
    super(`Workout import failed: ${reason}`);
    this.detail = detail;
  }
}

const SERVER_ERRORS: Record<string, ImportFailure> = { limit: 'limit', too_large: 'tooLarge' };

/** Which exercise a name of the file is (read-history's MappedName). */
export interface MappedName {
  name: string;
  /** A catalog id or a new exercise's; null when the model found neither. */
  exerciseId: string | null;
  /** False when it could be more than one exercise: the user picks. */
  certain: boolean;
  alternatives: string[];
  newExercise?: Omit<CustomExercise, 'archived'>;
}

type Step =
  | { step: 'categorize'; file: string; sheets: ReturnType<typeof sheetSample>[] }
  | { step: 'map'; names: { name: string; sets: number; hint: string }[] }
  | { step: 'name'; routines: { exercises: string[]; workouts: number }[] };

/** One step of read-history; throws a WorkoutImportError when it doesn't answer. */
async function ask<T>(request: Step, language: string, signal: AbortSignal): Promise<T> {
  const response = await postFunction(
    'read-history',
    { ...request, language },
    {
      signal,
      offline: () => new WorkoutImportError('offline', `${request.step}_offline`),
    },
  );
  if (!response.ok) {
    const { error } = await refusalOf('read-history', response);
    throw new WorkoutImportError(
      SERVER_ERRORS[error ?? ''] ?? 'failed',
      `${request.step}_http_${response.status}${error && /^[a-z_]{1,40}$/.test(error) ? `_${error}` : ''}`,
    );
  }
  return (await response.json()) as T;
}

/** Step 1: what each sheet holds and which column is which. */
export const categorize = (
  file: string,
  sheets: ReturnType<typeof sheetSample>[],
  language: string,
  signal: AbortSignal,
) =>
  ask<{ sheets: SheetReading[] }>({ step: 'categorize', file, sheets }, language, signal).then(
    (r) => r.sheets,
  );

/** Names per request; read-history takes up to 80. */
const BATCH = 60;

/** Step 2: which exercise each name is, in batches side by side. */
export async function mapNames(
  names: { name: string; sets: number; hint: string }[],
  language: string,
  signal: AbortSignal,
): Promise<MappedName[]> {
  const batches: (typeof names)[] = [];
  for (let i = 0; i < names.length; i += BATCH) batches.push(names.slice(i, i + BATCH));
  const answers = await Promise.all(
    batches.map((batch) =>
      ask<{ names: MappedName[] }>({ step: 'map', names: batch }, language, signal),
    ),
  );
  return answers.flatMap((a) => a.names);
}

/** Names for routines found in a history whose workouts have none. */
export const nameRoutines = (
  routines: { exercises: string[]; workouts: number }[],
  language: string,
  signal: AbortSignal,
) => ask<{ names: string[] }>({ step: 'name', routines }, language, signal).then((r) => r.names);
