import type { ProgressCheck } from '@/features/progress-check/data/progress-checks';

export interface SavedPair {
  beforeId: string | null;
  afterId: string | null;
  newestId: string | null;
}

export interface ComparedPair {
  before: ProgressCheck;
  after: ProgressCheck;
}

/** Orders two checks so the earlier one is "before". */
export const inOrder = (a: ProgressCheck, b: ProgressCheck): ComparedPair =>
  a.createdAt <= b.createdAt ? { before: a, after: b } : { before: b, after: a };

/**
 * The two checks the Körper tab compares (`checks` oldest first): the saved pair, else the first
 * and the newest. A check newer than the saved pair becomes "after", and a deleted check falls
 * back to its default. Null with fewer than two checks.
 */
export function comparedPair(checks: ProgressCheck[], saved: SavedPair): ComparedPair | null {
  if (checks.length < 2) return null;
  const first = checks[0];
  const newest = checks[checks.length - 1];
  const byId = (id: string | null) => (id ? checks.find((c) => c.id === id) : undefined);
  const before = byId(saved.beforeId) ?? first;
  const after = (saved.newestId === newest.id ? byId(saved.afterId) : undefined) ?? newest;
  if (before.id === after.id) return { before: first, after: newest };
  return inOrder(before, after);
}
