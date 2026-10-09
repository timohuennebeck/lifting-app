import type { Experience, Goal } from '@/shared/data/profile';

export const GOALS = ['hypertrophy', 'strength', 'strength_hypertrophy'] as const satisfies Goal[];

export interface RepRange {
  min: number;
  max: number;
}

/** Prescribed ranges: heavy compound lifts sit low, isolation work high in the goal range. */
export const PRESCRIBED_REPS: Record<Goal, { compound: RepRange; isolation: RepRange }> = {
  hypertrophy: { compound: { min: 8, max: 10 }, isolation: { min: 10, max: 12 } },
  strength: { compound: { min: 3, max: 5 }, isolation: { min: 6, max: 8 } },
  strength_hypertrophy: { compound: { min: 4, max: 6 }, isolation: { min: 8, max: 10 } },
};

/** Base reps in reserve; an exercise's sets ramp from one above it to one below it. */
export const BASE_RIR: Record<Experience, number> = {
  none: 3,
  beginner: 2,
  intermediate: 2,
  advanced: 1,
};
