import { addDays, DAY_MS, startOfDay } from '@/shared/lib/date';
import { getOrInsert } from '@/shared/lib/map';
import type { MuscleId } from '@/shared/ui/muscle-map';

export const SET_RANGES = [7, 14, 30, 90] as const;
export type SetRange = (typeof SET_RANGES)[number];

/** Days of sets loaded: the longest range and the same span before it, for the comparison. */
const SET_HISTORY_DAYS = 2 * SET_RANGES[SET_RANGES.length - 1];

/** Shown only once they have a set: hardly anyone trains them on purpose. */
export const RARE_MUSCLES: ReadonlySet<MuscleId> = new Set(['neck', 'tibialis']);

/** Completed sets of one exercise in one workout. */
export interface ExerciseSets {
  workoutId: string;
  startedAt: string;
  exerciseId: string;
  sets: number;
}

export interface MuscleCount {
  /** Sets of exercises it is a primary muscle of. */
  primary: number;
  /** Sets of exercises it only helps with. */
  secondary: number;
  total: number;
}

/** A muscle's role in an exercise; null when it doesn't work it. */
type Role = 'primary' | 'secondary' | null;

/** An exercise's muscles by role (`splitMuscles`); none for cardio. */
export type SplitOf = (exerciseId: string) => { primary: MuscleId[]; secondary: MuscleId[] };

/** `splitOf`, worked out once per exercise and call. */
function cached(splitOf: SplitOf): SplitOf {
  const cache = new Map<string, ReturnType<SplitOf>>();
  return (exerciseId) => getOrInsert(cache, exerciseId, () => splitOf(exerciseId));
}

/** Calendar days between a workout's start and `today` (local midnight): 0 for today. */
const daysAgo = (startedAt: string, today: number) =>
  Math.round((today - startOfDay(new Date(startedAt)).getTime()) / DAY_MS);

/** The first moment counted: midnight `days - 1` days before today, as an ISO string. */
export const historyStart = (today: number) =>
  addDays(new Date(today), -(SET_HISTORY_DAYS - 1)).toISOString();

/**
 * Each muscle's sets in the last `range` days, today included: a set counts in full for every
 * muscle of its exercise, as primary or secondary (`splitOf`).
 */
export function muscleCounts(
  rows: readonly ExerciseSets[],
  range: SetRange,
  today: number,
  splitOf: SplitOf,
) {
  const roles = cached(splitOf);
  const counts = new Map<MuscleId, MuscleCount>();
  const add = (muscle: MuscleId, role: 'primary' | 'secondary', sets: number) => {
    let entry = counts.get(muscle);
    if (!entry) {
      entry = { primary: 0, secondary: 0, total: 0 };
      counts.set(muscle, entry);
    }
    entry[role] += sets;
    entry.total += sets;
  };
  for (const row of rows) {
    const d = daysAgo(row.startedAt, today);
    if (d < 0 || d >= range) continue;
    const { primary, secondary } = roles(row.exerciseId);
    for (const m of primary) add(m, 'primary', row.sets);
    for (const m of secondary) add(m, 'secondary', row.sets);
  }
  return counts;
}

/** A bar of the chart: one day (7 and 14 days) or week (30 and 90), oldest first. */
export interface SetBucket {
  /** Local midnight of its first and its last day. */
  from: number;
  to: number;
  sets: number;
}

export interface MuscleExercise {
  exerciseId: string;
  workouts: number;
  sets: number;
}

interface MuscleDetail {
  total: number;
  /** Sets in the same number of days before. */
  previous: number;
  buckets: SetBucket[];
  primary: MuscleExercise[];
  secondary: MuscleExercise[];
}

/**
 * One muscle's sets in the last `range` days: the total and the one before, per day or week
 * counted back from today (the oldest week can be shorter), and the exercises that worked it,
 * most sets first. The bars add up to the total.
 */
export function muscleDetail(
  rows: readonly ExerciseSets[],
  muscle: MuscleId,
  range: SetRange,
  today: number,
  splitOf: SplitOf,
): MuscleDetail {
  const roles = cached(splitOf);
  const size = range <= 14 ? 1 : 7;
  const count = Math.ceil(range / size);
  const buckets = Array.from({ length: count }, (_, i): SetBucket => {
    const newest = (count - 1 - i) * size;
    const oldest = Math.min(range - 1, newest + size - 1);
    return {
      from: addDays(new Date(today), -oldest).getTime(),
      to: addDays(new Date(today), -newest).getTime(),
      sets: 0,
    };
  });
  const exercises = new Map<string, { role: Role; workouts: Set<string>; sets: number }>();
  let total = 0;
  let previous = 0;
  for (const row of rows) {
    const { primary, secondary } = roles(row.exerciseId);
    const role: Role = primary.includes(muscle)
      ? 'primary'
      : secondary.includes(muscle)
        ? 'secondary'
        : null;
    if (!role) continue;
    const d = daysAgo(row.startedAt, today);
    if (d >= range && d < 2 * range) previous += row.sets;
    if (d < 0 || d >= range) continue;
    total += row.sets;
    buckets[count - 1 - Math.floor(d / size)].sets += row.sets;
    let entry = exercises.get(row.exerciseId);
    if (!entry) {
      entry = { role, workouts: new Set(), sets: 0 };
      exercises.set(row.exerciseId, entry);
    }
    entry.workouts.add(row.workoutId);
    entry.sets += row.sets;
  }
  const listed = [...exercises]
    .map(([exerciseId, e]) => ({
      exerciseId,
      role: e.role,
      workouts: e.workouts.size,
      sets: e.sets,
    }))
    .sort((a, b) => b.sets - a.sets || b.workouts - a.workouts);
  const strip = ({ exerciseId, workouts, sets }: MuscleExercise) => ({
    exerciseId,
    workouts,
    sets,
  });
  return {
    total,
    previous,
    buckets,
    primary: listed.filter((e) => e.role === 'primary').map(strip),
    secondary: listed.filter((e) => e.role === 'secondary').map(strip),
  };
}
