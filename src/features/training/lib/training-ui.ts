import { getExercise } from '@/shared/data/exercises';
import { DANGER_SOLID } from '@/shared/ui/choice-sheet';
import type { MuscleId } from '@/shared/ui/muscle-map';

/** Amber used for comfortable RIR targets on the overview (oklch 0.8 0.16 75). */
const AMBER = '#F9AC26';

export const RIR_VALUES = [0, 1, 2, 3, 4, 5] as const;
export const formatRir = (rir: number) => (rir >= 5 ? '5+' : String(rir));

/** Overview badge: close to failure is red, everything else amber. */
export const overviewRirColor = (rir: number) => (rir <= 1 ? DANGER_SOLID : AMBER);

/** Set editor and picker: hard sets accent, RIR 2 light, easy sets dark. */
export function editorRirStyle(rir: number | null, accent: string) {
  if (rir === null || rir >= 3) return { bg: '#2E2E2C', dark: false };
  if (rir === 2) return { bg: '#D6D6D1', dark: true };
  return { bg: accent, dark: true };
}

export const formatReps = (min: number, max: number) => (min === max ? `${min}` : `${min}–${max}`);

/** Splits an exercise's muscles into primary (≥ 30 % or the top one) and secondary. */
export function exerciseMuscles(exerciseId: string) {
  const entries = Object.entries(getExercise(exerciseId)?.muscles ?? {}).sort(
    (a, b) => b[1] - a[1],
  ) as [MuscleId, number][];
  return {
    primary: entries.filter(([, w], i) => i === 0 || w >= 0.3).map(([m]) => m),
    secondary: entries.filter(([, w], i) => i > 0 && w < 0.3).map(([m]) => m),
  };
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const padIndex = (n: number) => String(n).padStart(2, '0');

/** Runs `fn` once a closing sheet's exit animation is done, so modals never overlap. */
export const afterSheetClose = (fn: () => void) => setTimeout(fn, 260);
