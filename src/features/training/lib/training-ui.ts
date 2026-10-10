import { muscleWeights } from '@/features/exercises/lib/muscle-groups';
import { rirColor } from '@/shared/lib/rir';

/** Set editor and picker: the RIR badge colours (red near failure, else amber); grey without. */
export function editorRirStyle(rir: number | null) {
  if (rir === null) return { bg: '#2E2E2C', dark: false };
  return { bg: rirColor(rir), dark: true };
}

/** Splits an exercise's muscles into primary (≥ 30 % or the top one) and secondary. */
export function splitMuscles(exerciseId: string) {
  const entries = muscleWeights(exerciseId);
  return {
    primary: entries.filter(([, w], i) => i === 0 || w >= 0.3).map(([m]) => m),
    secondary: entries.filter(([, w], i) => i > 0 && w < 0.3).map(([m]) => m),
  };
}

export const padIndex = (n: number) => String(n).padStart(2, '0');
