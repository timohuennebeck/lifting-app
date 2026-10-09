import type { Sex } from '@/shared/data/profile';
import { clamp } from '@/shared/lib/math';

import type { GroupScores } from './body-check-service';
import { GROUPS, type BodyGroup } from './poses';

export type ScoreTier = 'veryGood' | 'good' | 'average' | 'low';
export type BodyFatTier = 'athletic' | 'fit' | 'average' | 'high';
export type GroupBand = 'top' | 'mid' | 'focus';

export const scoreTier = (value: number): ScoreTier =>
  value >= 85 ? 'veryGood' : value >= 70 ? 'good' : value >= 50 ? 'average' : 'low';

/** Scale shown under the body-fat estimate, in percent. */
export const bodyFatRange = (sex: Sex | null | undefined) =>
  sex === 'female' ? { min: 15, max: 38 } : { min: 8, max: 30 };

/** Position (0–1) of a body-fat value on its scale. */
export function bodyFatShare(value: number, sex: Sex | null | undefined) {
  const { min, max } = bodyFatRange(sex);
  return clamp((value - min) / (max - min), 0, 1);
}

export function bodyFatTier(share: number): BodyFatTier {
  if (share < 0.25) return 'athletic';
  if (share < 0.5) return 'fit';
  return share < 0.75 ? 'average' : 'high';
}

export interface BandEntry {
  group: BodyGroup;
  value: number;
}

/** Highest two groups are "top", lowest two "focus", the rest "mid" (design 08d-A). */
export function groupBands(scores: Partial<GroupScores>): Record<GroupBand, BandEntry[]> {
  const sorted = GROUPS.filter((g) => scores[g] !== undefined)
    .map((group) => ({ group, value: scores[group] ?? 0 }))
    .sort((a, b) => b.value - a.value);
  const focusFrom = Math.max(2, sorted.length - 2);
  return {
    top: sorted.slice(0, 2),
    mid: sorted.slice(2, focusFrom),
    focus: sorted.slice(focusFrom),
  };
}
