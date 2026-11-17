import { newId } from './json';

/** An exercise of a routine or workout in order, with the superset it belongs to (or null). */
export interface SupersetMember {
  id: string;
  supersetId: string | null;
  /** The superset's rest after a round, on each of its exercises; null when none was saved. */
  supersetRest?: number | null;
}

/** Where an exercise sits in its superset. */
export interface SupersetSlot {
  /** "A" for the first superset of the list, "B" for the second… */
  letter: string;
  /** 1 for the first exercise of the superset. */
  number: number;
  /** "A1", "A2"… */
  label: string;
  /** Index of the superset's first and last exercise in the list. */
  start: number;
  end: number;
}

/**
 * The superset of each exercise of `items` (in list order), or null. A superset is a run of
 * neighbours with the same superset id; one left alone (moved away from its partners) is none.
 */
export function supersetSlots(items: readonly SupersetMember[]): (SupersetSlot | null)[] {
  const slots: (SupersetSlot | null)[] = items.map(() => null);
  let groups = 0;
  let start = 0;
  while (start < items.length) {
    const id = items[start].supersetId;
    let end = start;
    while (id && end + 1 < items.length && items[end + 1].supersetId === id) end += 1;
    if (end > start) {
      const letter = String.fromCharCode(65 + (groups % 26));
      groups += 1;
      for (let i = start; i <= end; i += 1) {
        const number = i - start + 1;
        slots[i] = { letter, number, label: `${letter}${number}`, start, end };
      }
    }
    start = end + 1;
  }
  return slots;
}

/** A new order, superset ids and superset rests after pairing or splitting exercises. */
export interface SupersetPlan {
  order: string[];
  supersetIds: Record<string, string | null>;
  supersetRests: Record<string, number | null>;
}

const idsOf = (items: readonly SupersetMember[]) =>
  Object.fromEntries(items.map((i) => [i.id, i.supersetId]));

const restsOf = (items: readonly SupersetMember[]) =>
  Object.fromEntries(items.map((i) => [i.id, i.supersetRest ?? null]));

/** The rest saved for superset `supersetId` (on any of its exercises), or null. */
export function savedSupersetRest(items: readonly SupersetMember[], supersetId: string | null) {
  if (!supersetId) return null;
  return (
    items.find((i) => i.supersetId === supersetId && i.supersetRest != null)?.supersetRest ?? null
  );
}

/**
 * Pairs exercise `currentId` with `partnerId`. A partner already in a superset takes the current
 * one in (it moves after that superset); a current one in a superset takes the partner in; two
 * single ones form a new superset, the partner moving right after the current one. A superset
 * keeps its rest; a new one gets `newRest` (see `defaultSupersetRest`).
 */
export function pairPlan(
  items: readonly SupersetMember[],
  currentId: string,
  partnerId: string,
  newRest: number,
): SupersetPlan {
  const slots = supersetSlots(items);
  const index = (id: string) => items.findIndex((i) => i.id === id);
  const current = index(currentId);
  const partner = index(partnerId);
  const supersetIds = idsOf(items);
  // Who moves, and the exercise it goes after.
  let moving = partnerId;
  let anchor = slots[current] ? items[slots[current].end].id : currentId;
  let id = slots[current] ? items[current].supersetId : null;
  if (!slots[current] && slots[partner]) {
    moving = currentId;
    anchor = items[slots[partner].end].id;
    id = items[partner].supersetId;
  }
  const rest = savedSupersetRest(items, id) ?? newRest;
  id ??= newId();
  for (const i of [currentId, partnerId]) supersetIds[i] = id;
  const supersetRests = restsOf(items);
  for (const item of items) if (supersetIds[item.id] === id) supersetRests[item.id] = rest;
  const order = items.map((i) => i.id).filter((i) => i !== moving);
  order.splice(order.indexOf(anchor) + 1, 0, moving);
  return { order, supersetIds, supersetRests };
}

/**
 * Takes exercise `currentId` out of its superset; it goes after the others. A partner left alone
 * stands alone again.
 */
export function unpairPlan(items: readonly SupersetMember[], currentId: string): SupersetPlan {
  const slots = supersetSlots(items);
  const current = items.findIndex((i) => i.id === currentId);
  const slot = slots[current];
  const supersetIds = idsOf(items);
  const supersetRests = restsOf(items);
  supersetIds[currentId] = null;
  supersetRests[currentId] = null;
  const order = items.map((i) => i.id);
  if (!slot) return { order, supersetIds, supersetRests };
  const others = items.slice(slot.start, slot.end + 1).filter((i) => i.id !== currentId);
  if (others.length === 1) {
    supersetIds[others[0].id] = null;
    supersetRests[others[0].id] = null;
  }
  const after = order.filter((i) => i !== currentId);
  after.splice(after.indexOf(others[others.length - 1].id) + 1, 0, currentId);
  return { order: after, supersetIds, supersetRests };
}

/**
 * The superset id an exercise moved to `toIndex` keeps: its own when it still sits next to a
 * partner, else none (dragged out of its superset).
 */
export function keptSupersetId(order: readonly SupersetMember[], toIndex: number): string | null {
  const id = order[toIndex]?.supersetId;
  if (!id) return null;
  const near = [order[toIndex - 1], order[toIndex + 1]];
  return near.some((n) => n?.supersetId === id) ? id : null;
}
