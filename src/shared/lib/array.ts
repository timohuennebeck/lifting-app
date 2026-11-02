/** `items` with the one at `from` moved to `to`, the others keeping their order. */
export function moved<T>(items: readonly T[], from: number, to: number): T[] {
  const rest = items.filter((_, i) => i !== from);
  rest.splice(to, 0, items[from]);
  return rest;
}
