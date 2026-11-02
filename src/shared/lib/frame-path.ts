/**
 * A rounded-rect outline as an SVG path, `inset` in from the edges (half the stroke), starting
 * top-left after the corner and running clockwise; with its length for dash patterns.
 */
export function framePath(width: number, height: number, radius: number, inset: number) {
  const [l, t, rt, b] = [inset, inset, width - inset, height - inset];
  const r = radius;
  const d = [
    `M${l + r} ${t}H${rt - r}A${r} ${r} 0 0 1 ${rt} ${t + r}`,
    `V${b - r}A${r} ${r} 0 0 1 ${rt - r} ${b}`,
    `H${l + r}A${r} ${r} 0 0 1 ${l} ${b - r}`,
    `V${t + r}A${r} ${r} 0 0 1 ${l + r} ${t}Z`,
  ].join('');
  const length = 2 * (rt - l + (b - t)) - 8 * r + 2 * Math.PI * r;
  return { d, length };
}
