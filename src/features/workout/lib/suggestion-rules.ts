/**
 * The coach's suggestions in the live workout (the Vorschlag column): each set's weight and reps
 * from the exercise's last workouts (double progression: reps up to the top of the range, then
 * more weight), and the open sets adapted as sets are logged. Weights are in the user's unit;
 * timed exercises count seconds as reps. Checked against simulated lifters before it was built.
 */

/** What "more" means: heavier, more added weight, less assistance, or longer. */
export type LoadKind = 'load' | 'bodyweight' | 'assisted' | 'timed';

/** A set's targets with the defaults filled in. */
export interface Target {
  min: number;
  max: number;
  /** Reps in reserve aimed for. */
  rir: number;
}

/** A logged set as the rules read it. */
export interface RuleSet {
  /** Null for exercises without a weight. */
  weight: number | null;
  /** Reps, or seconds for timed exercises. */
  reps: number;
  /** Reps in reserve as entered; null when not entered (the target is assumed then). */
  rir: number | null;
  /** The targets the set had. */
  target: Target;
}

export interface RuleExercise {
  kind: LoadKind;
  /** The weight step, in the user's unit. */
  step: number;
  /** Lightest weight there is (an empty bar). */
  floor: number;
}

export interface Suggested {
  weight: number | null;
  reps: number;
}

/** Reps past the top of the range while the next weight would be too big a jump. */
const EXTEND = 5;
/** A suggestion goes up by at most this share of the weight (one step is always allowed). */
const MAX_JUMP = 0.1;
/** Lowered by at most this share at a time. */
const MAX_DROP = 0.15;
/** Timed sets get this much longer per workout. */
const SECONDS_STEP = 5;
/** Days off, and what the weight is multiplied by after them. */
const BREAKS: [number, number][] = [
  [21, 1],
  [42, 0.925],
  [Infinity, 0.85],
];

const round2 = (x: number) => Math.round(x * 100) / 100;
const floorStep = (w: number, step: number) => round2(Math.floor(w / step + 1e-9) * step);
const ceilStep = (w: number, step: number) => round2(Math.ceil(w / step - 1e-9) * step);
const roundStep = (w: number, step: number) => round2(Math.floor(w / step + 0.5) * step);
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/** Estimated one-rep max (Epley) of `reps` with `rir` left. */
const e1rm = (w: number, reps: number, rir: number) => w * (1 + (reps + rir) / 30);
/** Reps doable at weight `w` leaving `rir`, for an estimated max `e`. */
const repsAt = (e: number, w: number, rir: number) => 30 * (e / w - 1) - rir;

/** Reps in reserve a set had: as entered, else what it aimed for. */
const rirOf = (s: RuleSet) => s.rir ?? s.target.rir;

/** Reps as if done at `target`'s reps in reserve: 12 at RIR 4 count as 14 for RIR 2. */
const effective = (s: RuleSet, target: Target) => s.reps + rirOf(s) - target.rir;

const nth = <T>(items: T[], i: number) => items[Math.min(i, items.length - 1)];

const lighter = (ex: RuleExercise, a: number, b: number) =>
  ex.kind === 'assisted' ? a > b : a < b;

/** A workout whose weight was lowered after a set fell well short (a bad day). */
function isBadDay(ex: RuleExercise, sets: RuleSet[]) {
  if (ex.kind === 'timed') return false;
  return sets.some(
    (s, i) =>
      s.weight != null &&
      s.reps + rirOf(s) - s.target.rir < s.target.min - 1 &&
      sets
        .slice(i + 1)
        .some((later) => later.weight != null && lighter(ex, later.weight, s.weight!)),
  );
}

function minWeight(ex: RuleExercise, w: number) {
  if (ex.kind === 'load') return Math.max(w, ex.floor, ex.step);
  return Math.max(w, 0);
}

/** The same reps again plus one (two when it was far too easy, none after an all-out set). */
function moreReps(s: RuleSet, target: Target) {
  let add = 1;
  if (s.rir === 0) add = 0;
  else if (s.rir != null && s.rir - target.rir >= 2) add = 2;
  let reps = s.reps + add;
  // A target with more in reserve than last time (a deload, a new block) asks for fewer.
  if (target.rir > s.target.rir) reps = Math.min(reps, Math.floor(effective(s, target)) + 1);
  return clamp(reps, target.min, target.max);
}

/** Next weight once every set is at the top of the range, or null when that jump is too big. */
function heavier(ex: RuleExercise, sets: RuleSet[], targets: Target[]): Suggested[] | null {
  const w = sets[0].weight ?? 0;
  if (ex.kind === 'assisted') {
    if (w <= 0) return null;
    return targets.map((t) => ({ weight: Math.max(0, round2(w - ex.step)), reps: t.min }));
  }
  if (ex.kind === 'bodyweight') {
    // Added weight only for those who already train with it.
    if (w <= 0) return null;
    return targets.map((t) => ({ weight: round2(w + ex.step), reps: t.min }));
  }
  const farAbove = sets.every((s, i) => effective(s, targets[i]) >= targets[i].max + 3);
  const steps = farAbove && 2 * ex.step <= MAX_JUMP * w ? 2 : 1;
  const next = round2(w + steps * ex.step);
  const reps = sets.map((s, i) =>
    Math.floor(repsAt(e1rm(w, s.reps, rirOf(s)), next, targets[i].rir)),
  );
  if (reps.some((r, i) => r < targets[i].min - 1)) return null;
  return reps.map((r, i) => ({ weight: next, reps: clamp(r, targets[i].min, targets[i].max) }));
}

/** At the top, but the next weight is too big a jump (light dumbbells): reps past the top. */
function pastTheTop(ex: RuleExercise, sets: RuleSet[], targets: Target[]): Suggested[] {
  const w = sets[0].weight;
  const noWeight = w == null || (ex.kind !== 'load' && w <= 0);
  if (noWeight) {
    return sets.map((s) => ({ weight: w, reps: s.reps + (s.rir === 0 ? 0 : 1) }));
  }
  if (sets.every((s, i) => s.reps >= targets[i].max + EXTEND)) {
    // Far enough past the top: the next weight anyway, with the reps it allows.
    const next = round2(w + ex.step);
    return sets.map((s, i) => {
      const reps = Math.floor(repsAt(e1rm(w, s.reps, rirOf(s)), next, targets[i].rir));
      return { weight: next, reps: clamp(reps, Math.max(1, targets[i].min - 4), targets[i].max) };
    });
  }
  return sets.map((s, i) => ({ weight: w, reps: Math.min(s.reps + 1, targets[i].max + EXTEND) }));
}

/** Lighter (more assistance) after falling below the range twice in a row. */
function lowered(ex: RuleExercise, sets: RuleSet[], targets: Target[]): Suggested[] {
  const w = sets[0].weight ?? 0;
  let next: number;
  if (ex.kind === 'assisted') next = round2(w + ex.step);
  else if (ex.kind === 'bodyweight') next = Math.max(0, round2(w - ex.step));
  else {
    const e = Math.min(...sets.map((s) => e1rm(w, s.reps, rirOf(s))));
    next = floorStep(e / (1 + (targets[0].min + targets[0].rir) / 30), ex.step);
    next = Math.max(Math.min(next, round2(w - ex.step)), floorStep(w * (1 - MAX_DROP), ex.step));
  }
  return targets.map((t) => ({ weight: minWeight(ex, next), reps: t.min }));
}

/** Sets of one weight, deciding together (all sets move to the new weight at once). */
function together(
  ex: RuleExercise,
  sets: RuleSet[],
  targets: Target[],
  before: RuleSet[] | null,
): Suggested[] {
  const effs = sets.map((s, i) => effective(s, targets[i]));
  if (effs.every((e, i) => e >= targets[i].max)) {
    return heavier(ex, sets, targets) ?? pastTheTop(ex, sets, targets);
  }
  const below = effs.map((e, i) => e < targets[i].min);
  if (below.some(Boolean)) {
    const twice = below.some(
      (b, i) => b && before != null && effective(nth(before, i), targets[i]) < targets[i].min,
    );
    // Without added weight a bodyweight exercise can't get lighter: the reps start lower.
    if (twice && sets[0].weight != null && (ex.kind !== 'bodyweight' || sets[0].weight > 0)) {
      return lowered(ex, sets, targets);
    }
    return sets.map((s, i) => ({ weight: s.weight, reps: below[i] ? targets[i].min : s.reps }));
  }
  return sets.map((s, i) => ({ weight: s.weight, reps: moreReps(s, targets[i]) }));
}

function timed(s: RuleSet, target: Target): Suggested {
  let seconds = s.reps + SECONDS_STEP;
  if (s.reps >= target.max) seconds = target.max;
  else if (s.reps < target.min) seconds = target.min;
  return { weight: s.weight, reps: Math.min(seconds, target.max) };
}

/** After a break: lighter (or shorter) and from the bottom of the range. */
function afterBreak(ex: RuleExercise, out: Suggested[], targets: Target[], days: number) {
  const factor = BREAKS.find(([limit]) => days <= limit)?.[1] ?? 1;
  if (factor === 1) return out;
  return out.map((s, i) => {
    const reps = targets[i].min;
    if (s.weight == null || ex.kind === 'timed') return { weight: s.weight, reps };
    if (ex.kind === 'assisted') return { weight: ceilStep(s.weight / factor, ex.step), reps };
    return { weight: minWeight(ex, floorStep(s.weight * factor, ex.step)), reps };
  });
}

/**
 * Suggestions for today's sets (`targets`, one per set) from the exercise's last workouts,
 * newest first, the newest `days` ago. Null the first time.
 */
export function planSets(
  ex: RuleExercise,
  targets: Target[],
  history: RuleSet[][],
  days: number,
): Suggested[] | null {
  const done = history.filter((sets) => sets.length);
  if (!done.length || !targets.length) return null;
  let base = 0;
  let halfway = false;
  if (isBadDay(ex, done[0])) {
    // One bad day doesn't count; a second in a row meets it halfway.
    if (done[1] && !isBadDay(ex, done[1])) base = 1;
    else halfway = true;
  }
  const sets = targets.map((_, i) => nth(done[base], i));
  const before = done[base + 1] ?? null;
  let out: Suggested[];
  if (halfway) {
    const weights = done[0].flatMap((s) => (s.weight == null ? [] : [s.weight]));
    const planned = weights[0];
    const adapted = ex.kind === 'assisted' ? Math.max(...weights) : Math.min(...weights);
    const w = minWeight(ex, roundStep((planned + adapted) / 2, ex.step));
    out = targets.map((t) => ({ weight: w, reps: t.min }));
  } else if (ex.kind === 'timed') {
    out = sets.map((s, i) => timed(s, targets[i]));
  } else {
    const sameWeight = new Set(sets.map((s) => s.weight)).size === 1;
    const sameRange = new Set(targets.map((t) => `${t.min}-${t.max}`)).size === 1;
    out =
      sameWeight && sameRange
        ? together(ex, sets, targets, before)
        : sets.map((s, i) => together(ex, [s], [targets[i]], before && [nth(before, i)])[0]);
  }
  return afterBreak(ex, out, targets, days);
}

/**
 * What each set suggests with the sets logged so far (`done`, null for open ones), from the
 * plan: after a set falls well short the open sets after it get lighter; after a too-light set
 * they go back to the plan; a weight the user picked that works stays. A logged set keeps what
 * it suggested when it was logged.
 */
export function adaptSets(
  ex: RuleExercise,
  targets: Target[],
  planned: Suggested[],
  done: (RuleSet | null)[],
) {
  const current = [...planned];
  const shown = [...planned];
  const straight = new Set(planned.map((p) => p.weight)).size === 1;
  for (let i = 0; i < planned.length; i++) {
    shown[i] = current[i];
    const s = done[i];
    if (!s || ex.kind === 'timed') continue;
    // Not entered: short of the suggestion counts as all-out.
    const rir = s.rir ?? (s.reps < current[i].reps ? 0 : targets[i].rir);
    const e = s.reps + rir - targets[i].rir;
    const suggestedWeight = shown[i].weight;
    for (let j = i + 1; j < planned.length; j++) {
      const target = targets[j];
      const next = current[j];
      if (s.weight == null || next.weight == null) continue;
      if (e < targets[i].min - 1) {
        if (ex.kind !== 'load' && ex.kind !== 'assisted') continue;
        let w: number;
        if (ex.kind === 'assisted') w = round2(s.weight + ex.step);
        else {
          const est = e1rm(s.weight, s.reps, rir);
          w = floorStep(est / (1 + (target.min + target.rir) / 30), ex.step);
          w = minWeight(ex, Math.max(w, floorStep(s.weight * (1 - MAX_DROP), ex.step)));
        }
        if (lighter(ex, w, next.weight)) current[j] = { weight: w, reps: target.min };
      } else if (e > targets[i].max && lighter(ex, s.weight, planned[j].weight ?? s.weight)) {
        current[j] = planned[j];
      } else if (suggestedWeight != null && s.weight !== suggestedWeight) {
        // Another weight than suggested, and it works: the same again. A pyramid keeps its shape,
        // above its plan only as far as the user went above it.
        const shift = s.weight - suggestedWeight;
        const above = Math.max(0, s.weight - (planned[i].weight ?? s.weight));
        const weight = Math.min(next.weight + shift, (planned[j].weight ?? Infinity) + above);
        current[j] = straight
          ? { weight: s.weight, reps: clamp(s.reps, target.min, target.max) }
          : {
              weight: round2(ex.kind === 'assisted' ? next.weight + shift : weight),
              reps: next.reps,
            };
      }
    }
  }
  return shown;
}
