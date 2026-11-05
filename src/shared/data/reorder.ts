/**
 * Saves a new order of rows (`order`, their ids) as positions from `start` on, writing only the
 * rows of `rows` whose stored position changes: every write is queued for upload.
 */
export async function writePositions(
  rows: readonly { id: string; position: number }[],
  order: readonly string[],
  write: (id: string, position: number) => PromiseLike<unknown>,
  start = 0,
) {
  const stored = new Map(rows.map((r) => [r.id, r.position]));
  for (const [i, id] of order.entries()) {
    if (stored.get(id) !== start + i) await write(id, start + i);
  }
}
