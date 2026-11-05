// Keeping the numbers in a model's answer to what the app and the database take. Plain TypeScript
// without Deno APIs.

/** `Number(value)` rounded to a whole number within min…max; `min` when that isn't finite. */
export function clampInt(value: unknown, min: number, max: number) {
  const number = Math.round(Number(value));
  return Math.min(max, Math.max(min, Number.isFinite(number) ? number : min));
}
