// The names the model wasn't sure about (15a: one screen each) and what the user decided. A name
// is one item whether it is in the history, the plan or both: each decision holds everywhere.

import type { ImportedPlan } from '@/features/plan-import/lib/plan-import-service';
import { settle } from '@/features/plan-import/lib/edit-plan';

import type { MappedName } from './import-service';

/** A name of the file to check. */
export interface ReviewItem {
  /** The name as the file writes it (the first spelling seen). */
  name: string;
  /** Workouts of the history it is in; 0 when only the plan has it. */
  workouts: number;
  /** The plan has it (its line read as `name`). */
  inPlan: boolean;
  /** The likeliest exercise first, then the alternatives; empty when none fits. */
  options: string[];
}

export type Decision =
  | { kind: 'exercise'; exerciseId: string }
  /** A new exercise of the user's under the file's name. */
  | { kind: 'custom' }
  /** Left out of the history and the plan. */
  | { kind: 'skip' };

/** Names are matched without case and surrounding spaces. */
export const nameKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

const unique = (ids: (string | null | undefined)[]) => [
  ...new Set(ids.filter((id): id is string => !!id)),
];

/** The items to check: unsure names of the history (`workouts` per name) and lines of the plan. */
export function reviewItems(
  names: MappedName[],
  workouts: Record<string, number>,
  plan: ImportedPlan | null,
): ReviewItem[] {
  const items = new Map<string, ReviewItem>();
  for (const n of names) {
    if (n.certain) continue;
    items.set(nameKey(n.name), {
      name: n.name,
      workouts: workouts[nameKey(n.name)] ?? 0,
      inPlan: false,
      options: unique([n.exerciseId, ...n.alternatives]),
    });
  }
  for (const routine of plan?.routines ?? []) {
    for (const e of routine.exercises) {
      if (!e.raw) continue;
      const key = nameKey(e.raw);
      const known = items.get(key);
      items.set(key, {
        name: known?.name ?? e.raw,
        workouts: known?.workouts ?? 0,
        inPlan: true,
        options: unique([...(known?.options ?? []), e.exerciseId, ...(e.alternatives ?? [])]),
      });
    }
  }
  return [...items.values()].sort((a, b) => b.workouts - a.workouts);
}

/** What a decision makes of a name: an exercise id (`customId` for a new one), or null to leave out. */
export function decidedId(
  item: ReviewItem,
  decision: Decision | undefined,
  customId: (item: ReviewItem) => string,
) {
  if (!decision) return item.options[0] ?? null;
  if (decision.kind === 'skip') return null;
  if (decision.kind === 'custom') return customId(item);
  return decision.exerciseId;
}

/**
 * The plan with the decisions made: a line read as a checked name becomes the exercise picked
 * (and no longer asks), or leaves the plan. For a plan found in the history (lines without `raw`),
 * `replaced` turns the likeliest exercise into the one picked.
 */
export function decidePlan(
  plan: ImportedPlan,
  idOf: (raw: string) => string | null | undefined,
  replaced: Map<string, string | null>,
): ImportedPlan {
  return {
    ...plan,
    routines: plan.routines.map((routine) => ({
      ...routine,
      exercises: routine.exercises.flatMap((e) => {
        const picked = e.raw ? idOf(e.raw) : replaced.get(e.exerciseId);
        if (picked === undefined) return [e];
        if (picked === null) return [];
        return [settle({ ...e, exerciseId: picked })];
      }),
    })),
  };
}
