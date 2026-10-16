import type { Measure } from '@/shared/data/exercises';
import type { Sex } from '@/shared/data/profile';
import type { MuscleId } from '@/shared/ui/muscle-map';

// Muscle levels 1–100 from the best lifts. Every catalog exercise has an intermediate standard
// (`strength_standard`): the estimated one-rep max ÷ body weight for a man of REFERENCE_KG, or
// reps / seconds for exercises without weight. A lift's share of its standard places it on a
// fixed scale (ANCHORS); a muscle's level is a weighted average of its best exercises.

/** Levels and the share of the intermediate standard they take: level 50 is the standard. */
const ANCHORS: readonly (readonly [level: number, share: number])[] = [
  [1, 0.3],
  [10, 0.5],
  [30, 0.75],
  [50, 1],
  [70, 1.4],
  [90, 1.8],
  [100, 2],
];

export type Tier = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite';

/** Five tiers of 20 levels, each centred on a strength standard. */
const TIER_STARTS: readonly (readonly [level: number, tier: Tier])[] = [
  [80, 'elite'],
  [60, 'advanced'],
  [40, 'intermediate'],
  [20, 'novice'],
  [1, 'beginner'],
];

export const tierOf = (level: number): Tier =>
  TIER_STARTS.find(([from]) => level >= from)?.[1] ?? 'beginner';

/** The level (1–100, with fractions) a share of the standard reaches. */
export function levelOf(share: number) {
  if (share <= ANCHORS[0][1]) return 1;
  for (let i = 1; i < ANCHORS.length; i++) {
    const [l0, s0] = ANCHORS[i - 1];
    const [l1, s1] = ANCHORS[i];
    if (share <= s1) return l0 + ((share - s0) / (s1 - s0)) * (l1 - l0);
  }
  return 100;
}

/** Standards are set for this body weight; others scale by weight^⅔, as strength does. */
const REFERENCE_KG = 80;

/** What women and unspecified reach of the men's standard, by body region. */
const SEX_FACTOR: Record<Sex, Record<'upper' | 'lower', number>> = {
  male: { upper: 1, lower: 1 },
  female: { upper: 0.6, lower: 0.7 },
  unspecified: { upper: 0.8, lower: 0.85 },
};
const LOWER_BODY: ReadonlySet<MuscleId> = new Set([
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'adductors',
  'tibialis',
]);

const CORE: ReadonlySet<MuscleId> = new Set(['abs', 'obliques', 'lower_back']);

export type LevelRegion = 'upper' | 'core' | 'lower';

/** A muscle's filter on the Level tab. */
export const regionOfMuscle = (muscle: MuscleId): LevelRegion =>
  CORE.has(muscle) ? 'core' : LOWER_BODY.has(muscle) ? 'lower' : 'upper';

/** Shown only once they have a level: hardly anyone trains them on purpose. */
export const RARE_MUSCLES: ReadonlySet<MuscleId> = new Set(['neck', 'tibialis']);

/** Epley gets unreliable past this many reps; more count as this many. */
const MAX_REPS = 12;
/** A share this far past elite is taken as a typo (1000 kg) and left out. */
const MAX_SHARE = 2.6;
/**
 * Lifts count fully for 12 weeks, then fade to 75 % over 12 more, as strength does without
 * training, and stay there: a long break lowers a level but never takes it away.
 */
const FULL_DAYS = 84;
const FADE_DAYS = 168;
const FADED = 0.75;
/** A muscle is "on pause" after this many days without a set for it. */
export const PAUSE_DAYS = 21;
/** Exercises count for a muscle that does at least this share of their work. */
const MIN_MUSCLE_SHARE = 0.25;
/** How much of a muscle's level an exercise can make (0 when it can't), e.g. to suggest some. */
export const levelShare = (
  exercise: { strength_standard?: number | null; muscles: Record<string, number> },
  muscle: MuscleId,
) => {
  const share = exercise.muscles[muscle] ?? 0;
  return exercise.strength_standard && share >= MIN_MUSCLE_SHARE ? share : 0;
};
/** The best this many exercises of a muscle make its level. */
const BEST_EXERCISES = 3;
/** Machine and cable stacks differ between gyms, so they count less than free weights. */
const STACK_WEIGHT = 0.8;

/** The 13 main muscles make the overall level, weighted by size; a missing one counts as 0. */
export const MAIN_MUSCLES: Readonly<Partial<Record<MuscleId, number>>> = {
  chest: 3,
  lats: 3,
  upper_back: 2,
  front_delts: 1,
  side_delts: 1,
  rear_delts: 1,
  biceps: 1,
  triceps: 1.5,
  abs: 1.5,
  quads: 3,
  hamstrings: 2,
  glutes: 3,
  calves: 1,
};

export interface LevelExercise {
  /** Intermediate standard; null when the exercise doesn't count for levels. */
  standard: number | null;
  measures: Measure[];
  equipment: string | null;
  assisted: boolean;
  muscles: Partial<Record<MuscleId, number>>;
}

export interface LevelSet {
  exerciseId: string;
  startedAt: string;
  weightKg: number | null;
  reps: number | null;
  seconds: number | null;
}

export interface MuscleLevel {
  /** 1–100 with fractions: the whole part is the level, the rest the way to the next. */
  value: number;
  /** When a set for this muscle was last done. */
  lastAt: string;
}

export interface LevelInput {
  sets: LevelSet[];
  exercises: (id: string) => LevelExercise | undefined;
  /** The body-weight trend on a day (YYYY-MM-DD). */
  bodyWeightOn: (date: string) => number;
  sex: Sex | null;
  /** Levels as of this moment; sets after it are left out. */
  now: Date;
}

const DAY_MS = 86_400_000;

function fade(ageDays: number) {
  if (ageDays <= FULL_DAYS) return 1;
  if (ageDays >= FADE_DAYS) return FADED;
  return 1 - ((1 - FADED) * (ageDays - FULL_DAYS)) / (FADE_DAYS - FULL_DAYS);
}

/** A set's share of its exercise's standard, or null when it can't be scored. */
function shareOf(set: LevelSet, exercise: LevelExercise, bodyWeight: number, factor: number) {
  const { standard, measures } = exercise;
  if (!standard) return null;
  if (measures.includes('weight') && measures.includes('reps')) {
    if (!set.reps) return null;
    let load = set.weightKg;
    if (exercise.assisted) load = Math.max(bodyWeight - (set.weightKg ?? 0), 0);
    else if (exercise.equipment === 'bodyweight') load = bodyWeight + (set.weightKg ?? 0);
    if (!load) return null;
    const oneRepMax = load * (1 + Math.min(set.reps, MAX_REPS) / 30);
    const expected = standard * factor * REFERENCE_KG * (bodyWeight / REFERENCE_KG) ** (2 / 3);
    return oneRepMax / expected;
  }
  if (measures.length === 1 && measures[0] === 'reps') {
    return set.reps ? set.reps / (standard * factor) : null;
  }
  if (measures.length === 1 && measures[0] === 'seconds') {
    return set.seconds ? set.seconds / standard : null;
  }
  return null;
}

/** The region an exercise's standard belongs to: that of the muscle it works most. */
function regionOf(exercise: LevelExercise) {
  const top = (Object.entries(exercise.muscles) as [MuscleId, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];
  return top && LOWER_BODY.has(top) ? 'lower' : 'upper';
}

/** Each muscle's level from the sets up to `now`; muscles without a scored lift are left out. */
export function muscleLevels({ sets, exercises, bodyWeightOn, sex, now }: LevelInput) {
  const factors = SEX_FACTOR[sex ?? 'unspecified'];
  const best = new Map<string, number>();
  const lastAt = new Map<MuscleId, string>();

  for (const set of sets) {
    const time = Date.parse(set.startedAt);
    const ageDays = (now.getTime() - time) / DAY_MS;
    if (ageDays < 0) continue;
    const exercise = exercises(set.exerciseId);
    if (!exercise) continue;
    for (const [muscle, weight] of Object.entries(exercise.muscles) as [MuscleId, number][]) {
      if (weight >= MIN_MUSCLE_SHARE && set.startedAt > (lastAt.get(muscle) ?? '')) {
        lastAt.set(muscle, set.startedAt);
      }
    }
    const bodyWeight = bodyWeightOn(set.startedAt.slice(0, 10));
    const share = shareOf(set, exercise, bodyWeight, factors[regionOf(exercise)]);
    if (share === null || share > MAX_SHARE) continue;
    const faded = share * fade(ageDays);
    if (faded > (best.get(set.exerciseId) ?? 0)) best.set(set.exerciseId, faded);
  }

  // Per muscle: its best exercises, weighted by how much of their work it does.
  const candidates = new Map<MuscleId, { share: number; weight: number }[]>();
  for (const [id, share] of best) {
    const exercise = exercises(id);
    if (!exercise) continue;
    const stack = exercise.equipment === 'machine' || exercise.equipment === 'cable';
    for (const [muscle, weight] of Object.entries(exercise.muscles) as [MuscleId, number][]) {
      if (weight < MIN_MUSCLE_SHARE) continue;
      const list = candidates.get(muscle) ?? [];
      list.push({ share, weight: weight * (stack ? STACK_WEIGHT : 1) });
      candidates.set(muscle, list);
    }
  }

  const levels = new Map<MuscleId, MuscleLevel>();
  for (const [muscle, list] of candidates) {
    const top = list.sort((a, b) => b.share - a.share).slice(0, BEST_EXERCISES);
    const weight = top.reduce((sum, c) => sum + c.weight, 0);
    const share = top.reduce((sum, c) => sum + c.share * c.weight, 0) / weight;
    levels.set(muscle, { value: levelOf(share), lastAt: lastAt.get(muscle) ?? '' });
  }
  return levels;
}

/** The overall level: the main muscles' levels by size, a missing one as 0. */
export function overallLevel(levels: ReadonlyMap<MuscleId, MuscleLevel>) {
  let sum = 0;
  let total = 0;
  for (const [muscle, weight] of Object.entries(MAIN_MUSCLES) as [MuscleId, number][]) {
    sum += weight * (levels.get(muscle)?.value ?? 0);
    total += weight;
  }
  return sum / total;
}

/**
 * Main muscles without a level, and how much the overall level would gain if they reached the
 * average of the others.
 */
export function missingMain(levels: ReadonlyMap<MuscleId, MuscleLevel>) {
  const entries = Object.entries(MAIN_MUSCLES) as [MuscleId, number][];
  const missing = entries.filter(([m]) => !levels.has(m)).map(([m]) => m);
  const leveled = entries.filter(([m]) => levels.has(m));
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  const leveledWeight = leveled.reduce((sum, [, w]) => sum + w, 0);
  const average = leveledWeight
    ? leveled.reduce((sum, [m, w]) => sum + w * (levels.get(m)?.value ?? 0), 0) / leveledWeight
    : 0;
  const missingWeight = total - leveledWeight;
  return { missing, gain: Math.round((missingWeight * average) / total) };
}
