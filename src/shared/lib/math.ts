/** Limits a value to [min, max]; a worklet, so it also runs on the UI thread. */
export function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(max, Math.max(min, value));
}

/** Rounds to one decimal, e.g. a body weight in kg as the profile stores it. */
export const roundTenth = (value: number) => Math.round(value * 10) / 10;
