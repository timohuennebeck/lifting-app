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

export interface ChartInput {
  time: number;
  value: number;
}

/** A point placed in a chart's box. */
interface PlacedPoint extends ChartInput {
  x: number;
  y: number;
}

/** Room above the highest and below the lowest value. */
const PAD = 10;
/** Room left and right of the first and last point, so their ring (6.25pt) shows whole. */
const X_PAD = 7;

/** The times and values a chart spans; several lines on one chart share them. */
interface ChartBounds {
  t0: number;
  t1: number;
  min: number;
  max: number;
}

/** What `series` (each oldest first) span together. */
export function chartBounds(...series: ChartInput[][]): ChartBounds | undefined {
  const all = series.flat();
  if (!all.length) return undefined;
  const times = all.map((d) => d.time);
  const values = all.map((d) => d.value);
  return {
    t0: Math.min(...times),
    t1: Math.max(...times),
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

/**
 * Maps time/value pairs (oldest first) onto a width × height box spanning `bounds`: the points,
 * the line through them and the area under it.
 */
export function buildLineChart(
  data: ChartInput[],
  width: number,
  height: number,
  bounds: ChartBounds | undefined,
) {
  if (!data.length || width <= 0 || !bounds) {
    return { points: [] as PlacedPoint[], line: '', area: '' };
  }
  const { t0, t1, min, max } = bounds;
  const y = yScale(min, max, height, PAD);
  const points = data.map((d) => ({
    ...d,
    x: t1 === t0 ? width - X_PAD : X_PAD + ((d.time - t0) / (t1 - t0)) * (width - 2 * X_PAD),
    y: y(d.value),
  }));
  // A single point is drawn as a flat line across the chart.
  const through = points.length === 1 ? [{ x: X_PAD, y: points[0].y }, points[0]] : points;
  const line = linePath(
    through,
    (p) => p.x,
    (p) => p.y,
  );
  const first = points.length === 1 ? X_PAD : points[0].x;
  const last = points[points.length - 1].x;
  return { points, line, area: `${line} L${last} ${height} L${first} ${height} Z` };
}
