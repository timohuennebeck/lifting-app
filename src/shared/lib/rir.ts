import { colors } from './theme';

export const RIR_VALUES = [0, 1, 2, 3, 4, 5] as const;

export const formatRir = (rir: number) => (rir >= 5 ? '5+' : String(rir));

/** Close to failure (0–1 reps in reserve) is red, everything else amber. */
export const rirColor = (rir: number) => (rir <= 1 ? colors.red : colors.amber);
