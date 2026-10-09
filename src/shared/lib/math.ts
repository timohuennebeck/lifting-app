/** Limits a value to [min, max]; a worklet, so it also runs on the UI thread. */
export function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(max, Math.max(min, value));
}
