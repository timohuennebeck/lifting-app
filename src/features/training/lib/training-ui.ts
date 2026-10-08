import { muscleWeights } from '@/features/exercises/lib/muscle-groups';

/** Set editor and picker: hard sets accent, RIR 2 light, easy sets dark. */
export function editorRirStyle(rir: number | null, accent: string) {
  if (rir === null || rir >= 3) return { bg: '#2E2E2C', dark: false };
  if (rir === 2) return { bg: '#D6D6D1', dark: true };
  return { bg: accent, dark: true };
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
