import { clamp } from '@/shared/lib/math';

import {
  ceilStep,
  floorStep,
  round2,
  type RuleExercise,
  type RuleSet,
  type Suggested,
  type Target,
} from './suggestion-rules';

/**
 * Suggestions for exercises without a plain load: bodyweight ones (added weight), assisted
 * machines (less assistance is more) and timed holds (seconds count as reps). Double
 * progression: reps up to the top of the range, then more added weight or less assistance.
 */

/** Timed sets get this much longer per workout. */
const SECONDS_STEP = 5;
/** Days off, and what the weight is multiplied by after them. */
const BREAKS: [number, number][] = [
  [21, 1],
  [42, 0.925],
  [Infinity, 0.85],
];

const roundStep = (w: number, step: number) => round2(Math.floor(w / step + 0.5) * step);
const nth = <T>(items: T[], i: number) => items[Math.min(i, items.length - 1)];
const minWeight = (w: number) => Math.max(w, 0);

const lighter = (ex: RuleExercise, a: number, b: number) =>
  ex.kind === 'assisted' ? a > b : a < b;

/** Fewer reps than suggested at that weight or a harder one, without 2+ in reserve entered. */
function missedSuggestion(ex: RuleExercise, s: RuleSet) {
  const suggested = s.suggested;
  if (!suggested || s.reps >= suggested.reps || (s.rir != null && s.rir > 1)) return false;
  if (s.weight == null || suggested.weight == null) return true;
  return !lighter(ex, s.weight, suggested.weight);
}

/** Reps in reserve a set had: as entered, 0 for a missed suggestion, else the target. */
const rirOf = (ex: RuleExercise, s: RuleSet) =>
  s.rir ?? (missedSuggestion(ex, s) ? 0 : s.target.rir);

/** Reps as if done at `target`'s reps in reserve: 12 at RIR 4 count as 14 for RIR 2. */
const effective = (ex: RuleExercise, s: RuleSet, target: Target) =>
  s.reps + rirOf(ex, s) - target.rir;

/** A workout whose weight was lowered after a set fell well short (a bad day). */
function isBadDay(ex: RuleExercise, sets: RuleSet[]) {
  if (ex.kind === 'timed') return false;
  return sets.some(
    (s, i) =>
      s.weight != null &&
      effective(ex, s, s.target) < s.target.min - 1 &&
      sets
        .slice(i + 1)
        .some((later) => later.weight != null && lighter(ex, later.weight, s.weight!)),
  );
}

/** The same reps again plus one (two when it was far too easy, none after an all-out set). */
function moreReps(ex: RuleExercise, s: RuleSet, target: Target) {
  let add = 1;
  if (s.rir === 0 || missedSuggestion(ex, s)) add = 0;
  else if (s.rir != null && s.rir - target.rir >= 2) add = 2;
  let reps = s.reps + add;
  // A target with more in reserve than last time (a deload, a new block) asks for fewer.
  if (target.rir > s.target.rir) reps = Math.min(reps, Math.floor(effective(ex, s, target)) + 1);
  return clamp(reps, target.min, target.max);
}

/** At the top of the range: more added weight or less assistance, or null without any. */
function heavier(ex: RuleExercise, sets: RuleSet[], targets: Target[]): Suggested[] | null {
  const w = sets[0].weight ?? 0;
  // Added weight only for those who already train with it.
  if (w <= 0) return null;
  const next = ex.kind === 'assisted' ? Math.max(0, round2(w - ex.step)) : round2(w + ex.step);
  return targets.map((t) => ({ weight: next, reps: t.min }));
}

/** Lighter (more assistance) after falling below the range twice in a row. */
function lowered(ex: RuleExercise, sets: RuleSet[], targets: Target[]): Suggested[] {
  const w = sets[0].weight ?? 0;
  const next = ex.kind === 'assisted' ? round2(w + ex.step) : Math.max(0, round2(w - ex.step));
  return targets.map((t) => ({ weight: minWeight(next), reps: t.min }));
}

/** Sets of one weight, deciding together (all sets move to the new weight at once). */
function together(
  ex: RuleExercise,
  sets: RuleSet[],
  targets: Target[],
  before: RuleSet[] | null,
): Suggested[] {
  const effs = sets.map((s, i) => effective(ex, s, targets[i]));
  if (effs.every((e, i) => e >= targets[i].max)) {
    return (
      heavier(ex, sets, targets) ??
      sets.map((s) => ({ weight: s.weight, reps: s.reps + (s.rir === 0 ? 0 : 1) }))
    );
  }
  const below = effs.map((e, i) => e < targets[i].min);
  if (below.some(Boolean)) {
    const twice = below.some(
      (b, i) => b && before != null && effective(ex, nth(before, i), targets[i]) < targets[i].min,
    );
    // Without added weight a bodyweight exercise can't get lighter: the reps start lower.
    if (twice && sets[0].weight != null && (ex.kind !== 'bodyweight' || sets[0].weight > 0)) {
      return lowered(ex, sets, targets);
    }
    return sets.map((s, i) => ({ weight: s.weight, reps: below[i] ? targets[i].min : s.reps }));
  }
  return sets.map((s, i) => ({ weight: s.weight, reps: moreReps(ex, s, targets[i]) }));
}

function timed(s: RuleSet, target: Target): Suggested {
  let seconds = s.reps + SECONDS_STEP;
  if (s.reps >= target.max) seconds = target.max;
  else if (s.reps < target.min) seconds = target.min;
  return { weight: s.weight, reps: Math.min(seconds, target.max) };
}

/** After a break: less added weight (more assistance, shorter) and from the bottom of the range. */
function afterBreak(ex: RuleExercise, out: Suggested[], targets: Target[], days: number) {
  const factor = BREAKS.find(([limit]) => days <= limit)?.[1] ?? 1;
  if (factor === 1) return out;
  return out.map((s, i) => {
    const reps = targets[i].min;
    if (s.weight == null || ex.kind === 'timed') return { weight: s.weight, reps };
    if (ex.kind === 'assisted') return { weight: ceilStep(s.weight / factor, ex.step), reps };
    return { weight: minWeight(floorStep(s.weight * factor, ex.step)), reps };
  });
}

/**
 * Suggestions for today's sets (`targets`, one per set) from the exercise's last workouts,
 * newest first, the newest `days` ago. Null the first time.
 */
export function planRepSets(
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
    const w = minWeight(roundStep((planned + adapted) / 2, ex.step));
    out = targets.map((t) => ({ weight: w, reps: t.min }));
  } else if (ex.kind === 'timed') {
    out = sets.map((s, i) => timed(s, targets[i]));
  } else {
    const sameWeight = new Set(sets.map((s) => s.weight)).size === 1;
    const sameRange = new Set(targets.map((t) => `${t.min}-${t.max}`)).size === 1;
    if (sameWeight && sameRange) out = together(ex, sets, targets, before);
    else out = sets.map((s, i) => together(ex, [s], [targets[i]], before && [nth(before, i)])[0]);
  }
  return afterBreak(ex, out, targets, days);
}

/**
 * What each set suggests with the sets logged so far (`done`, null for open ones), from the
 * plan: after a set falls well short on an assisted machine the open sets get more assistance;
 * after a too-easy set they go back to the plan; a weight the user picked that works stays. A
 * logged set keeps what it suggested when it was logged.
 */
export function adaptRepSets(
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
        if (ex.kind !== 'assisted') continue;
        const w = round2(s.weight + ex.step);
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
