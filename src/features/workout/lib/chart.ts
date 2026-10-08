export interface ChartInput {
  time: number;
  value: number;
}

export interface ChartPoint extends ChartInput {
  x: number;
  y: number;
}

/** Maps time/value pairs (oldest first) onto a width × height box. */
export function buildLineChart(data: ChartInput[], width: number, height: number, pad = 10) {
  if (!data.length || width <= 0) return { points: [] as ChartPoint[], line: '', area: '' };
  const t0 = data[0].time;
  const t1 = data[data.length - 1].time;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = data.map((d) => ({
    ...d,
    x: t1 === t0 ? width : ((d.time - t0) / (t1 - t0)) * width,
    y:
      max === min
        ? height / 2
        : height - pad - ((d.value - min) / (max - min)) * (height - 2 * pad),
  }));
  const coords = points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  // A single session is drawn as a flat line across the chart.
  const line =
    points.length === 1 ? `M0 ${coords[0].split(' ')[1]} L${coords[0]}` : `M${coords.join(' L')}`;
  return { points, line, area: `${line} L${width} ${height} L0 ${height} Z` };
}

/** Closest point to an x position. */
export function nearestPoint(points: ChartPoint[], x: number) {
  let best = 0;
  for (let i = 1; i < points.length; i++) {
    if (Math.abs(points[i].x - x) < Math.abs(points[best].x - x)) best = i;
  }
  return best;
}
