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
