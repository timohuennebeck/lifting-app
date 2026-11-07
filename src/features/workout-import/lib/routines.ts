// Finds the routines in a workout history that has no plan, and the plan the user follows now:
// workouts are grouped by their exercises (a workout joins a routine when at least half its
// exercises were in it before); a group that starts as another stops and shares at least two
// exercises with it, or that fills a gap in another and shares one, continues that routine (a
// training block that swapped exercises). The plan is each routine's exercises of the last six
// weeks.

import type { LoggedSet } from './history';
import { TARGET_REPS_MAX, TARGET_SECONDS_MAX } from '@/shared/lib/limits';

/** A workout of the import with its exercises as the app's (catalog or custom ids). */
export interface ResolvedWorkout {
  name: string | null;
  start: Date;
  exercises: { exerciseId: string; sets: LoggedSet[] }[];
}

export interface FoundRoutine {
  workouts: ResolvedWorkout[];
  /** The name most of its workouts have in the file; null when they have none. */
  fileName: string | null;
}

interface Group {
  workouts: ResolvedWorkout[];
  keys: Set<string>;
}

const MATCH = 0.5;
const CONTINUE_DAYS = 42;
const RECENT = 5;
const DAY_MS = 86_400_000;

const keysOf = (workouts: ResolvedWorkout[]) =>
  new Set(workouts.flatMap((w) => w.exercises.map((e) => e.exerciseId)));
const shared = (a: Set<string>, b: Set<string>) => [...a].filter((k) => b.has(k)).length;
const from = (g: Group) => g.workouts[0].start.getTime();
const to = (g: Group) => g.workouts[g.workouts.length - 1].start.getTime();

function join(into: Group, other: Group) {
  into.workouts = [...into.workouts, ...other.workouts].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );
  for (const k of other.keys) into.keys.add(k);
}

/** The workouts' routines, the most done first. */
export function findRoutines(workouts: ResolvedWorkout[]): FoundRoutine[] {
  const sorted = [...workouts].sort((a, b) => a.start.getTime() - b.start.getTime());
  let groups: Group[] = [];
  for (const w of sorted) {
    const keys = [...new Set(w.exercises.map((e) => e.exerciseId))];
    if (!keys.length) continue;
    let best: Group | null = null;
    let score = 0;
    for (const g of groups) {
      const overlap = keys.filter((k) => g.keys.has(k)).length / keys.length;
      if (overlap > score) [best, score] = [g, overlap];
    }
    if (best && score >= MATCH) {
      best.workouts.push(w);
      for (const k of keys) best.keys.add(k);
    } else groups.push({ workouts: [w], keys: new Set(keys) });
  }

  // A group that continues another: starts at most six weeks after it stopped, sharing at least two
  // exercises with its last workouts; or lies in a gap of it (no workout of the other in its
  // span), sharing at least one with the workouts around the gap. Two routines done at the same
  // time never fill each other's gaps. Each round joins the pair that shares the most.
  for (;;) {
    let best: { prev: Group; next: Group; score: number } | null = null;
    for (const next of groups) {
      const head = keysOf(next.workouts.slice(0, RECENT));
      for (const prev of groups) {
        if (prev === next || from(prev) > from(next)) continue;
        const after = to(prev) <= from(next) && from(next) - to(prev) <= CONTINUE_DAYS * DAY_MS;
        const inGap =
          to(prev) > to(next) &&
          !prev.workouts.some(
            (w) => w.start.getTime() >= from(next) && w.start.getTime() <= to(next),
          );
        if (!after && !inGap) continue;
        const before = prev.workouts.filter((w) => w.start.getTime() < from(next)).slice(-RECENT);
        const around = inGap
          ? [
              ...before,
              ...prev.workouts.filter((w) => w.start.getTime() > to(next)).slice(0, RECENT),
            ]
          : before;
        const score = shared(head, keysOf(around));
        if (score >= (inGap ? 1 : 2) && score > (best?.score ?? 0)) best = { prev, next, score };
      }
    }
    if (!best) break;
    join(best.prev, best.next);
    groups = groups.filter((g) => g !== best.next);
  }

  return groups
    .map((g) => {
      const names = new Map<string, number>();
      for (const w of g.workouts) if (w.name) names.set(w.name, (names.get(w.name) ?? 0) + 1);
      const fileName = [...names.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      return { workouts: g.workouts, fileName };
    })
    .sort((a, b) => b.workouts.length - a.workouts.length);
}

const quantile = (values: number[], q: number) => {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  return sorted.length ? sorted[Math.round((sorted.length - 1) * q)] : null;
};

const clamp = (value: number | null, min: number, max: number) =>
  value == null ? null : Math.min(max, Math.max(min, Math.round(value)));

/** An exercise of the current plan: its set targets as the user did them lately. */
export interface PlanExercise {
  exerciseId: string;
  sets: number;
  /** Reps, or seconds for timed exercises. */
  targetMin: number | null;
  targetMax: number | null;
}

export interface CurrentRoutine {
  routine: FoundRoutine;
  exercises: PlanExercise[];
}

/**
 * What the user trains now: the routines with at least two workouts in the history's last six
 * weeks, each with the exercises done in at least half of those (in their usual order), the
 * usual number of sets and the middle half of the reps (or seconds) as targets.
 */
export function currentRoutines(
  routines: FoundRoutine[],
  isTimed: (exerciseId: string) => boolean,
): CurrentRoutine[] {
  const end = Math.max(...routines.flatMap((r) => r.workouts.map((w) => w.start.getTime())));
  const since = end - CONTINUE_DAYS * DAY_MS;
  return routines.flatMap((routine) => {
    const recent = routine.workouts.filter((w) => w.start.getTime() >= since);
    if (recent.length < 2) return [];
    const counts = new Map<string, number>();
    for (const w of recent) {
      for (const id of new Set(w.exercises.map((e) => e.exerciseId))) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    const exercises = [...counts.entries()]
      .filter(([, n]) => n >= recent.length / 2)
      .map(([exerciseId]) => {
        const done = recent.flatMap((w) =>
          w.exercises.flatMap((e, position) =>
            e.exerciseId === exerciseId ? [{ e, position }] : [],
          ),
        );
        const sets = done.flatMap(({ e }) => e.sets);
        const timed = isTimed(exerciseId);
        const values = sets.flatMap((s) => {
          const v = timed ? s.seconds : s.reps;
          return v ? [v] : [];
        });
        const max = timed ? TARGET_SECONDS_MAX : TARGET_REPS_MAX;
        return {
          exerciseId,
          position:
            quantile(
              done.map((d) => d.position),
              0.5,
            ) ?? 0,
          sets:
            clamp(
              quantile(
                done.map((d) => d.e.sets.length),
                0.5,
              ),
              1,
              10,
            ) ?? 3,
          targetMin: clamp(quantile(values, 0.25), 1, max),
          targetMax: clamp(quantile(values, 0.75), 1, max),
        };
      })
      .sort((a, b) => a.position - b.position)
      .map(({ position: _, ...e }) => e);
    return exercises.length ? [{ routine, exercises }] : [];
  });
}
