import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { CustomExercise } from '@/shared/data/exercises';
import { supabase } from '@/shared/data/supabase';
import type { PlanDayDraft, PlanDraft, PlanExerciseDraft } from '@/shared/data/templates';

export interface ImportPhoto {
  uri: string;
  width: number;
  height: number;
}

export interface ImportFile {
  uri: string;
  name: string;
  size: number | null;
  mimeType: string | null;
}

export type ImportSource =
  { kind: 'photos'; photos: ImportPhoto[] } | { kind: 'file'; file: ImportFile };

export interface ImportedExercise extends PlanExerciseDraft {
  /** Text as read from the source when the match is uncertain; cleared once confirmed. */
  raw?: string;
  /** Other plausible catalog exercise ids for an uncertain line. */
  alternatives?: string[];
}

export interface ImportedDay extends PlanDayDraft {
  exercises: ImportedExercise[];
  /** Day heading as read when no weekday could be detected. */
  rawDay?: string;
}

/** A detected plan; still a valid `PlanDraft`, plus review hints for uncertain lines. */
export interface ImportedPlan extends PlanDraft {
  days: ImportedDay[];
  /** Exercises the plan uses that the catalog doesn't have; created with the account. */
  newExercises: CustomExercise[];
}

export interface AnalyzePlanInput {
  source: ImportSource;
  /** UI language, so exercise names and day headings can be matched in context. */
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

async function requestBody(source: ImportSource) {
  if (source.kind === 'photos') {
    return { photos: await Promise.all(source.photos.map((p) => jpegBase64(p.uri))) };
  }
  const { file } = source;
  if (file.mimeType?.startsWith('image/')) {
    return { file: { name: file.name, mimeType: 'image/jpeg', data: await jpegBase64(file.uri) } };
  }
  const data = await new File(file.uri).base64();
  return { file: { name: file.name, mimeType: file.mimeType ?? '', data } };
}

async function failureOf(error: unknown): Promise<ImportFailure> {
  if (error instanceof FunctionsFetchError) return 'offline';
  if (error instanceof FunctionsHttpError) {
    const response = error.context as Response;
    const text = await response.text().catch(() => '');
    console.warn(`analyze-plan answered ${response.status}: ${text.slice(0, 300)}`);
    try {
      return SERVER_ERRORS[JSON.parse(text)?.error] ?? 'failed';
    } catch {
      return 'failed';
    }
  }
  console.warn('analyze-plan could not be called', error);
  return 'failed';
}

/**
 * Reads a training plan from photos or a file with the analyze-plan Edge Function. Throws an
 * ImportError with the reason when there is no plan to show.
 */
export async function analyzePlan({ source, language }: AnalyzePlanInput): Promise<ImportedPlan> {
  const { data, error } = await supabase.functions.invoke<{
    plan: Omit<ImportedPlan, 'newExercises'> & {
      newExercises: Omit<CustomExercise, 'archived'>[];
    };
  }>('analyze-plan', { body: { ...(await requestBody(source)), language } });
  if (error || !data?.plan) throw new ImportError(error ? await failureOf(error) : 'failed');
  const { plan } = data;
  return { ...plan, newExercises: plan.newExercises.map((e) => ({ ...e, archived: false })) };
}

/** Drops review hints and empty days so the plan can be stored. */
export function toPlanDraft(plan: ImportedPlan): PlanDraft {
  return {
    name: plan.name.trim(),
    days: plan.days
      .filter((d) => d.exercises.length)
      .map((d) => ({
        name: d.name,
        weekday: d.weekday,
        exercises: d.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets,
          restSeconds: e.restSeconds ?? null,
        })),
      })),
  };
}

/** True while the day has an unknown weekday or an uncertain exercise. */
export const needsReview = (day: ImportedDay) => !!day.rawDay || day.exercises.some((e) => e.raw);

/** Number of uncertain exercises and unknown weekdays still to review. */
export function pendingReviews(plan: ImportedPlan) {
  return plan.days.reduce(
    (sum, d) => sum + (d.rawDay ? 1 : 0) + d.exercises.filter((e) => e.raw).length,
    0,
  );
}
