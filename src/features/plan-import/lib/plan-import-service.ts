import type { PlanDayDraft, PlanDraft, PlanExerciseDraft } from '@/shared/data/templates';
import { wait } from '@/shared/lib/async';

import { MOCK_IMPORT_DAYS } from './mock-import-data';

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
}

export interface AnalyzePlanInput {
  source: ImportSource;
  /** UI language, so exercise names and day headings can be matched in context. */
  language: string;
}

const MOCK_LATENCY_MS = 2400;

/**
 * Reads a training plan from photos or a document.
 * MOCK: returns a fixed sample plan. Replace the body with
 * `supabase.functions.invoke('analyze-plan', …)` once the Edge Function exists.
 */
export async function analyzePlan({ source }: AnalyzePlanInput): Promise<ImportedPlan> {
  await wait(MOCK_LATENCY_MS);
  return {
    name: source.kind === 'file' ? titleFromFileName(source.file.name) : 'Push Pull Legs',
    days: JSON.parse(JSON.stringify(MOCK_IMPORT_DAYS)) as ImportedDay[],
  };
}

/** "Trainingsplan_Herbst.pdf" → "Trainingsplan Herbst" (max 30 chars). */
function titleFromFileName(name: string) {
  const base = name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  return (base || 'Plan').slice(0, 30);
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
