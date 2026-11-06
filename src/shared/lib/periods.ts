/** The time spans the history charts offer (1W, 1M, 3M, 6M, 1Y, All). */
export const PERIODS = ['1w', '1m', '3m', '6m', '1y', 'all'] as const;
export type Period = (typeof PERIODS)[number];

/** A period's days, today included; null for the whole history. */
export const PERIOD_DAYS: Record<Period, number | null> = {
  '1w': 7,
  '1m': 30,
  '3m': 90,
  '6m': 180,
  '1y': 365,
  all: null,
};
