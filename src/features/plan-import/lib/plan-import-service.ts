import { fetch } from 'expo/fetch';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { PlanAnswers } from '@/features/plan-create/lib/plan-answers';
import { env } from '@/shared/config/env';
import type { CustomExercise } from '@/shared/data/exercises';
import { clampSessions, type PlanDraft, type RoutineDraft } from '@/shared/data/plans';
import type { ExerciseDraft } from '@/shared/data/routines';

export interface ImportPhoto {
  uri: string;
  width: number;
  height: number;
  /** Taken with the import camera: framed as its full-screen preview showed it. */
  fromCamera?: boolean;
}

export interface ImportFile {
  uri: string;
  name: string;
  size: number | null;
  mimeType: string | null;
}

export type ImportSource =
  | { kind: 'photos'; photos: ImportPhoto[] }
  /** `sheets`: of a workbook, the ones to read (picked by the user); all when left out. */
  | { kind: 'file'; file: ImportFile; sheets?: string[] }
  /** The plan as the user said it (speech recognition's text, maybe corrected by hand). */
  | { kind: 'voice'; text: string }
  /** Not read but made: the AI plan from the onboarding answers (generate-plan). */
  | { kind: 'answers'; answers: PlanAnswers };

/** What the plan functions read the plan from. */
type ReadSource = Exclude<ImportSource, { kind: 'answers' }>;

export interface ImportedExercise extends ExerciseDraft {
  /** Stays with the exercise while it is edited or dragged to another place. */
  key: string;
  /** Text as read from the source when the match is uncertain; cleared once confirmed. */
  raw?: string;
  /** Other plausible catalog exercise ids for an uncertain line. */
  alternatives?: string[];
}

export interface ImportedRoutine extends RoutineDraft {
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
  constructor(readonly reason: ImportFailure) {
    super(`Plan import failed: ${reason}`);
  }
}

const SERVER_ERRORS: Record<string, ImportFailure> = {
  limit: 'limit',
  not_a_plan: 'notAPlan',
  too_large: 'tooLarge',
};

/** Photos per import; the read-plan function accepts no more. */
export const MAX_PHOTOS = 10;

/** Characters of a spoken plan; the read-plan function accepts no more. */
export const MAX_SPOKEN = 4000;

/** Steps in the "Import plan" branch, for the step counter. */
export const IMPORT_STEPS = 3;

/** Longest side photos are shrunk to: plenty for handwriting, small enough to send quickly. */
const MAX_SIDE = 2000;

/** The image as a JPEG in base64, shrunk to MAX_SIDE (also turns HEIC into something readable). */
async function jpegBase64(uri: string) {
  const context = ImageManipulator.manipulate(uri);
  const original = await context.renderAsync();
  const { width, height } = original;
  original.release();
  if (Math.max(width, height) > MAX_SIDE) {
    context.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }
  const image = await context.renderAsync();
  try {
    const saved = await image.saveAsync({ compress: 0.75, format: SaveFormat.JPEG, base64: true });
    return saved.base64 ?? '';
  } finally {
    image.release();
    context.release();
  }
}

async function requestBody(source: ReadSource) {
  if (source.kind === 'voice') return { text: source.text };
  if (source.kind === 'photos') {
    // One at a time: a full-size camera photo takes tens of MB while it is decoded.
    const photos: string[] = [];
    for (const p of source.photos) photos.push(await jpegBase64(p.uri));
    return { photos };
  }
  const { file, sheets } = source;
  // Some file providers leave the type out; the name still tells an image.
  if (file.mimeType?.startsWith('image/') || /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name)) {
    return { file: { name: file.name, mimeType: 'image/jpeg', data: await jpegBase64(file.uri) } };
  }
  const data = await new File(file.uri).base64();
  return { file: { name: file.name, mimeType: file.mimeType ?? '', data, sheets } };
}

/** The reason in the function's `{ error }` answer, or 'failed'. */
function serverFailure(text: string): ImportFailure {
  try {
    return SERVER_ERRORS[JSON.parse(text)?.error] ?? 'failed';
  } catch {
    return 'failed';
  }
}

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
  | { type: 'routine'; routine: Omit<ImportedRoutine, 'exercises'> }
  | {
      type: 'exercise';
      exercise: Omit<ImportedExercise, 'key'>;
      /** Set the first time the plan uses an exercise the catalog doesn't have. */
      newExercise?: Omit<CustomExercise, 'archived'>;
    };

/**
 * Gets a training plan from the Edge Functions, which stream it: reads it from photos, a file or
 * what the user said (read-plan) or makes it from the onboarding answers (generate-plan).
 * `onEvent` gets the plan's name, then each routine and exercise as soon as it is there (an
 * exercise belongs to the routine before it). Resolves once the plan is complete. Throws an
 * ImportError with the reason when there is no plan to show, also when the stream breaks off;
 * once `signal` stops it, the error doesn't matter.
 */
export async function streamPlan(
  { source, language }: StreamPlanInput,
  onEvent: (event: PlanEvent) => void,
  signal: AbortSignal,
) {
  const fn = source.kind === 'answers' ? 'generate-plan' : 'read-plan';
  const request =
    source.kind === 'answers' ? { answers: source.answers } : await requestBody(source);
  const body = JSON.stringify({ ...request, language });
  stopIfAborted(signal);
  // expo/fetch, unlike React Native's own fetch, hands over the answer while it arrives.
  const response = await fetch(`${env.supabaseUrl}/functions/v1/${fn}`, {
    method: 'POST',
    headers: { apikey: env.supabasePublishableKey, 'Content-Type': 'application/json' },
    body,
    signal,
  }).catch((error: unknown) => {
    stopIfAborted(signal);
    console.warn(`${fn} could not be called`, error);
    throw new ImportError('offline');
  });
  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '');
    console.warn(`${fn} answered ${response.status}: ${text.slice(0, 300)}`);
    throw new ImportError(serverFailure(text));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read().catch((error: unknown) => {
      stopIfAborted(signal);
      console.warn(`${fn} broke off`, error);
      throw new ImportError('offline');
    });
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Server-sent events: one `data:` line each, separated by a blank line.
    let end: number;
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      if (!line.startsWith('data:')) continue;
      const event = JSON.parse(line.slice(5)) as
        PlanEvent | { type: 'done' } | { type: 'error'; error: string };
      if (event.type === 'done') return;
      if (event.type === 'error') {
        console.warn(`${fn} stopped: ${event.error}`);
        throw new ImportError(SERVER_ERRORS[event.error] ?? 'failed');
      }
      onEvent(event);
    }
  }
  // Ended without "done": the function stopped halfway.
  throw new ImportError('failed');
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
