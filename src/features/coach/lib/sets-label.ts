import type { TFunction } from 'i18next';

import { isTimed } from '@/shared/data/exercises';
import { formatTargetLabel } from '@/shared/lib/format';

/** An exercise's sets with the target they all share, as the coach's cards list them. */
export interface SetsLine {
  exerciseId: string;
  sets: number;
  /** Reps of every set, or seconds for a timed exercise; null without a target. */
  targetMin: number | null;
  targetMax: number | null;
}

/**
 * An exercise's sets with their target: "3 × 8–10", with the unit only for seconds: "3 × 30 s";
 * without a target just "3 Sätze".
 */
export function setsLabel(
  { exerciseId, sets, targetMin, targetMax }: SetsLine,
  t: TFunction<'coach'>,
) {
  if (targetMin === null || targetMax === null) return t('values.sets', { count: sets });
  if (isTimed(exerciseId)) return `${sets} × ${formatTargetLabel(targetMin, targetMax, true)}`;
  return `${sets} × ${targetMin === targetMax ? targetMin : `${targetMin}–${targetMax}`}`;
}
