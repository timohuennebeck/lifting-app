import { formatNumber } from '@/shared/lib/format';

/** The units' labels, the same in every app language (like "kg"). */
export const KCAL = 'kcal';
export const GRAMS = 'g';

/** Whole kcal without the unit: "1,840" or "1.840". */
export const formatKcal = (kcal: number) => formatNumber(Math.round(kcal), 0);

/** Grams with at most one decimal, without the unit: "142" or "12,5". */
export const formatGrams = (grams: number) => formatNumber(grams, 1);
