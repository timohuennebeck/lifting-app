// The body weight trend as the app's weight history draws it (withTrend in
// src/features/weight/lib/trend.ts), for the coach's charts and the progress check's context.
// Plain TypeScript without Deno APIs.

const DAY_MS = 86_400_000;

/** Whole days from one YYYY-MM-DD to another. */
const daysApart = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);

/**
 * The trend after each weigh-in, oldest first: each one moves it 10 % toward the scale, a gap of
 * n days counting n times.
 */
export function weightTrend(entries: { date: string; kg: number }[]) {
  let value = entries[0]?.kg ?? 0;
  let previous = entries[0]?.date ?? '';
  return entries.map(({ date, kg }) => {
    value += (1 - 0.9 ** Math.max(1, daysApart(previous, date))) * (kg - value);
    previous = date;
    return { date, value };
  });
}
