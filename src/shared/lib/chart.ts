/** A chart's y for a value from `min` to `max`, `pad` clear of its edges; flat values in the middle. */
export const yScale = (min: number, max: number, height: number, pad: number) => (value: number) =>
  max === min ? height / 2 : height - pad - ((value - min) / (max - min)) * (height - 2 * pad);

/** An SVG line through `items`, placed by `x` and `y`. */
export function linePath<T>(
  items: readonly T[],
  x: (item: T, i: number) => number,
  y: (item: T, i: number) => number,
) {
  return items
    .map((item, i) => `${i ? 'L' : 'M'}${x(item, i).toFixed(1)} ${y(item, i).toFixed(1)}`)
    .join(' ');
}

/** The index of the x nearest to `x` (the first of equals): the point under a finger. */
export function nearestIndex(xs: readonly number[], x: number) {
  let best = 0;
  for (let i = 1; i < xs.length; i++) {
    if (Math.abs(xs[i] - x) < Math.abs(xs[best] - x)) best = i;
  }
  return best;
}

/** Weight labels sit on whole numbers, at least this many steps apart, and at most this many. */
const MIN_STEPS = 3;
const MAX_LABELS = 6;

/**
 * The weight charts' value labels: whole numbers around `values` (79, 81, 83 …), with the y of a
 * value in a chart `height` tall and `pad` clear of its top and bottom.
 */
export function wholeNumberScale(values: readonly number[], height: number, pad: number) {
  let lo = Math.floor(Math.min(...values));
  let hi = Math.ceil(Math.max(...values));
  while (hi - lo < MIN_STEPS) {
    if ((hi - lo) % 2) lo--;
    else hi++;
  }
  const step = Math.ceil((hi - lo) / (MAX_LABELS - 1));
  hi = lo + Math.ceil((hi - lo) / step) * step;
  const labels = Array.from({ length: (hi - lo) / step + 1 }, (_, i) => hi - i * step);
  const y = (value: number) => pad + ((hi - value) / (hi - lo)) * (height - 2 * pad);
  return { labels, y };
}
