import { clamp } from '@/shared/lib/math';

/**
 * The coach's suggestions in the live workout (the Vorschlag column) for weighted exercises:
 * one strength estimate per exercise and rep range, from the working sets of the last workouts,
 * gives every set's weight and reps at its target RIR, minus fatigue across sets. Weights are in
 * the user's unit. Measured on simulated lifters with scripts/suggestions-eval.
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

export interface Suggested {
  weight: number | null;
  reps: number;
}

/** A logged set as the rules read it. */
export interface RuleSet {
  /** Null for exercises without a weight. */
  weight: number | null;
  /** Reps, or seconds for timed exercises. */
  reps: number;
  /** Reps in reserve as entered (0–5, 5 meaning 5+); null when not entered. */
  rir: number | null;
  /** The targets the set had. */
  target: Target;
  /** What the set was suggested when it was logged; null without a suggestion. */
  suggested?: Suggested | null;
}

export interface RuleExercise {
  kind: LoadKind;
  /** The weight step, in the user's unit. */
  step: number;
  /** Lightest weight there is (an empty bar). */
  floor: number;
}

/** Strength lost per earlier hard set in a workout, until learned from the user's sets. */
const FATIGUE = 0.02;
/** Reps a workout is expected to add: effort not known, effort entered. */
const GAIN = 1;
const GAIN_KNOWN = 0.25;
/** Workouts in a row that showed nothing but "done" before the progress probe speeds up. */
const PROBE_AFTER = 2;
/** Largest step up per workout (effort not known / entered) and down. */
const MAX_UP = 0.1;
const MAX_UP_KNOWN = 0.25;
const MAX_DOWN = 0.2;
/** A workout this much weaker than the one before is a bad day. */
const BAD_DAY = 0.93;
/** Reps off a set has to be before the open sets of the workout change. */
const SURPRISE = 1;
/** An entered RIR counts as this much more: people report fewer reps left than they had. */
const RIR_SHADE = 0.5;
/** What an entered "5+" counts as (and only as "at least"). */
const PLUS_RIR = 6;
/** In a workout, a "5+" takes the open sets at least this much heavier. */
const PLUS_JUMP = 0.1;
/** Reps past the top when the next weight is too big a jump (light dumbbells). */
const EXTEND = 5;
/** Workouts averaged, the progress assumed per workout back, and how far off one may be. */
const SMOOTH = 3;
const TREND = 0.01;
const SMOOTH_OFF = 0.08;
/** Days off, and what strength is multiplied by after them. */
const BREAKS: [number, number][] = [
  [21, 1],
  [42, 0.95],
  [Infinity, 0.9],
];

export const round2 = (x: number) => Math.round(x * 100) / 100;
export const floorStep = (w: number, step: number) => round2(Math.floor(w / step + 1e-9) * step);
export const ceilStep = (w: number, step: number) => round2(Math.ceil(w / step - 1e-9) * step);
/** Estimated one-rep max (Epley) of `reps` with `rir` left. */
export const e1rm = (w: number, reps: number, rir: number) => w * (1 + (reps + rir) / 30);
/** Reps doable at weight `w` leaving `rir`, for an estimated max `e`. */
export const repsAt = (e: number, w: number, rir: number) => 30 * (e / w - 1) - rir;

const sameRange = (a: Target, b: Target) => a.min === b.min && a.max === b.max;
const minWeight = (ex: RuleExercise, w: number) => Math.max(w, ex.floor, ex.step);
const middle = (t: Target) => Math.ceil((t.min + t.max) / 2);

/** Fewer reps than suggested, at that weight or heavier. */
const shortOf = (s: RuleSet, suggested = s.suggested) =>
  !!suggested &&
  suggested.weight != null &&
  s.weight != null &&
  s.weight >= suggested.weight &&
  s.reps < suggested.reps;

/**
 * A miss: short of the suggestion or below the range, without 2+ reps in reserve entered (then it
 * was stopped early).
 */
const missed = (s: RuleSet, suggested = s.suggested) =>
  (shortOf(s, suggested) || s.reps < s.target.min) && (s.rir == null || s.rir <= 1);

interface Effort {
  rir: number;
  /** RIR entered, or a miss. */
  known: boolean;
  missed: boolean;
  /** More reps than suggested without RIR entered. */
  beyond: boolean;
}

/** Reps in reserve a set had: entered, 0 for a miss, else the target (assumed). */
function effortOf(s: RuleSet, suggested = s.suggested): Effort {
  const miss = missed(s, suggested);
  const beyond = !!suggested && s.weight === suggested.weight && s.reps > suggested.reps;
  if (s.rir != null) {
    const rir = s.rir >= 5 ? PLUS_RIR : s.rir + (miss ? 0 : RIR_SHADE);
    return { rir, known: true, missed: miss, beyond: false };
  }
  if (miss) return { rir: 0, known: true, missed: true, beyond: false };
  return { rir: s.target.rir, known: false, missed: false, beyond };
}

interface Estimate {
  /** Strength (estimated one-rep max) fresh, before any set. */
  e: number;
  known: boolean;
  missed: boolean;
  /** RIR was entered on a working set. */
  rirEntered: boolean;
  /** Nothing learned: every set as suggested, or stopped at the top, without RIR. */
  blind: boolean;
}

/**
 * What a workout's sets show about fresh strength. Working sets are within 10 % of the heaviest;
 * lighter ones (warm-ups, a ramp) only bound it from below. Known efforts beat assumed ones, and
 * each counts as if done fresh. The average, not the best set: the best of noisy ones runs high.
 */
function estimate(sets: RuleSet[], fatigue: number): Estimate | null {
  const known: number[] = [];
  const assumed: number[] = [];
  let lower = 0;
  let miss = false;
  let rirEntered = false;
  let blind = true;
  const top = Math.max(0, ...sets.map((s) => s.weight ?? 0));
  sets.forEach((s, j) => {
    if (s.weight == null || s.weight <= 0) return;
    const f = effortOf(s);
    miss ||= f.missed;
    const plus = s.rir != null && s.rir >= 5;
    const atTop = s.rir == null && !f.missed && s.reps >= s.target.max;
    if (f.known && !plus && !atTop) blind = false;
    const hard = sets
      .slice(0, j)
      .filter((x) => x.weight != null && x.weight >= 0.85 * s.weight! && x.reps >= 3).length;
    const fresh = 1 / (1 - fatigue * hard);
    lower = Math.max(lower, e1rm(s.weight, s.reps, plus ? PLUS_RIR : 0));
    if (plus || (s.weight < 0.9 * top && !f.missed)) return;
    if (s.rir != null) rirEntered = true;
    (f.known ? known : assumed).push(e1rm(s.weight, s.reps, f.rir) * fresh);
  });
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const base = { missed: miss, rirEntered, blind };
  if (known.length) return { ...base, e: Math.max(mean(known), lower), known: true };
  if (assumed.length) return { ...base, e: Math.max(mean(assumed), lower), known: false };
  return lower > 0 ? { ...base, e: lower, known: true } : null;
}

/**
 * Strength lost per hard set, learned from workouts where two or more sets at one weight had a
 * known effort, shrunk toward the default while there are few; the default until then.
 */
function fatigueOf(history: RuleSet[][]) {
  const seen: number[] = [];
  for (const sets of history) {
    const known = sets
      .map((s, j) => ({ s, j, f: effortOf(s) }))
      .filter((x) => x.s.weight != null && x.s.weight > 0 && x.f.known && x.f.rir < 5);
    known.forEach((a, i) => {
      for (const b of known.slice(i + 1)) {
        if (a.s.weight !== b.s.weight) continue;
        const ea = e1rm(a.s.weight!, a.s.reps, a.f.rir);
        const eb = e1rm(b.s.weight!, b.s.reps, b.f.rir);
        seen.push((1 - eb / ea) / (b.j - a.j));
      }
    });
  }
  if (seen.length < 2) return FATIGUE;
  const median = [...seen].sort((a, b) => a - b)[Math.floor(seen.length / 2)];
  const share = Math.min(1, seen.length / 6);
  return clamp(share * median + (1 - share) * FATIGUE, 0.005, 0.07);
}

/** Straight sets: consecutive sets with the same range and RIR, from set `start`. */
interface Group {
  start: number;
  targets: Target[];
}

function groupsOf(targets: Target[]) {
  const out: Group[] = [];
  targets.forEach((t, i) => {
    const g = out[out.length - 1];
    if (g && sameRange(g.targets[0], t) && g.targets[0].rir === t.rir) g.targets.push(t);
    else out.push({ start: i, targets: [t] });
  });
  return out;
}

interface Prescription {
  /** Strength fresh, and the share lost per earlier hard set. */
  e: number;
  fatigue: number;
  /** The weight to stay at while it fits; null: none (a new range). */
  anchor: number | null;
  /** Reps the workout is expected to add. */
  gain: number;
  /** Largest step up and down, as shares; 0 up: not heavier. */
  up: number;
  down: number;
  /** Last time's sets of the group, by set; null after a break or a bad day. */
  last: RuleSet[] | null;
  /** Right after a miss: no rep short of the range is let pass. */
  afterMiss: boolean;
}

/**
 * Weight and reps of a group of straight sets: stay at the anchor while set 1 is in the range (1
 * rep short allowed, not after a miss); past the top, the lightest heavier weight back in the
 * range (2+ over: the middle); below, the heaviest that reaches it. Reps follow fatigue.
 */
function prescribe(ex: RuleExercise, g: Group, p: Prescription): Suggested[] {
  const t = g.targets[0];
  const at = (w: number, i: number, rir: number, extra: number) =>
    Math.floor(repsAt(p.e * (1 - p.fatigue * (g.start + i)), w, rir) + extra + 1e-9);
  let w: number;
  let extendTop = false;
  if (p.anchor == null) {
    // No weight to go on: the heaviest whose first set reaches the middle of the range.
    w = minWeight(ex, floorStep(p.e / (1 + (middle(t) + t.rir) / 30), ex.step));
    while (w > ex.floor && at(w, 0, t.rir, 0) < middle(t)) w = round2(w - ex.step);
    while (at(round2(w + ex.step), 0, t.rir, 0) >= middle(t)) w = round2(w + ex.step);
  } else {
    w = p.anchor;
    const r0 = at(w, 0, t.rir, p.gain);
    if (r0 > t.max && p.up > 0) {
      const cap = Math.max(round2(w + ex.step), floorStep(w * (1 + p.up), ex.step));
      const aim = r0 >= t.max + 2 ? middle(t) : t.max;
      let next = round2(w + ex.step);
      while (next < cap && at(next, 0, t.rir, 0) > aim) next = round2(next + ex.step);
      // Whether it goes counts the progress expected by then; 5×5 needs the full reps.
      const enough = t.min === t.max ? t.min : t.min - 1;
      if (at(next, 0, t.rir, p.gain) >= enough) w = next;
      else extendTop = true;
    } else if (r0 < t.min - (p.afterMiss ? 0 : 1)) {
      const lowest = Math.min(round2(w - ex.step), ceilStep(w * (1 - p.down), ex.step));
      let next = round2(w - ex.step);
      while (next > lowest && at(next, 0, t.rir, 0) < t.min) next = round2(next - ex.step);
      w = minWeight(ex, next);
    }
  }
  // A heavier weight is the progress: no reps on top.
  const extra = p.anchor != null && w > p.anchor ? 0 : p.gain;
  return g.targets.map((ti, i) => {
    let reps = at(w, i, ti.rir, extra);
    const prev = p.last?.[Math.min(i, p.last.length - 1)];
    const prevMissed = !!prev && prev.weight != null && missed(prev);
    if (prev && prevMissed) {
      // After a miss: meet it halfway, but never more than it managed at that weight or more.
      if (prev.weight === w) reps = Math.max(reps, Math.min(prev.reps - 1, ti.max));
      if (w >= prev.weight! && reps > prev.reps && prev.reps >= ti.min) reps = prev.reps;
    } else if (prev && prev.weight === w && prev.target.rir >= ti.rir) {
      // Never fewer reps than last time at the same weight.
      reps = Math.max(reps, Math.min(prev.reps, ti.max));
    }
    if (extendTop) {
      // One more than last time, but never more than a miss managed.
      const lastReps = prev && prev.weight === w ? prev.reps : ti.max;
      const more = prev && prevMissed ? prev.reps : lastReps + 1;
      return { weight: w, reps: clamp(Math.max(reps, more), ti.min, ti.max + EXTEND) };
    }
    return { weight: w, reps: clamp(reps, ti.min, ti.max) };
  });
}

/** The heaviest weight a set reached the range with; else the lightest one used. */
function anchorOf(sets: RuleSet[]) {
  const inRange = sets.filter((s) => s.weight != null && s.reps >= s.target.min);
  if (inRange.length) return Math.max(...inRange.map((s) => s.weight!));
  const used = sets.flatMap((s) => (s.weight != null && s.weight > 0 ? [s.weight] : []));
  return used.length ? Math.min(...used) : null;
}

/**
 * Strength going into today from a group's workouts (newest first, their estimates `est`): the
 * known efforts of the last three averaged (newer ones count more, each brought forward by the
 * progress assumed since), skipping one far off the newest; else the newest.
 */
function strengthFrom(est: (Estimate | null)[], ref: number) {
  const e = est[ref]!;
  if (!e.known) return e.e;
  const xs: [number, number][] = [];
  est.slice(ref, ref + SMOOTH).forEach((x, i) => {
    if (!x?.known) return;
    const brought = x.e * (1 + TREND * i);
    if (Math.abs(brought / e.e - 1) <= SMOOTH_OFF) xs.push([brought, 1 / (1 + 0.5 * i)]);
  });
  return xs.reduce((a, [v, w]) => a + v * w, 0) / xs.reduce((a, [, w]) => a + w, 0);
}

/**
 * Suggestions for today's sets (`targets`, one per set) of a weighted exercise from its last
 * workouts, newest first, the newest `days` ago. Null the first time.
 */
export function planSets(
  ex: RuleExercise,
  targets: Target[],
  history: RuleSet[][],
  days: number,
): Suggested[] | null {
  const done = history.filter((sets) => sets.some((s) => s.weight != null && s.weight > 0));
  if (!done.length || !targets.length) return null;
  const fatigue = fatigueOf(done);
  const factor = BREAKS.find(([limit]) => days <= limit)?.[1] ?? 1;
  const out: Suggested[] = [];
  for (const g of groupsOf(targets)) {
    // The workouts' sets with this rep range, else whole workouts (a new range).
    const byRange = done.map((sets) =>
      sets.filter((s) => s.weight != null && sameRange(s.target, g.targets[0])),
    );
    const matched = byRange[0].length > 0;
    const workouts = matched ? byRange.filter((sets) => sets.length) : done;
    const est = workouts.map((sets) => estimate(sets, fatigue));
    const [e0, e1, e2] = est;
    if (!e0) return null;
    let ref = 0;
    let gain = e0.known && e0.rirEntered ? GAIN_KNOWN : GAIN;
    if (e0.missed) gain = 0;
    if (e0.known && e1 && e0.e < BAD_DAY * e1.e && !(e2 && e1.e < BAD_DAY * e2.e)) {
      // One bad day doesn't count: the workout before it again, never heavier.
      ref = 1;
      gain = 0;
    } else if (!e0.missed) {
      // Workouts in a row that showed nothing but "done": probe faster while nothing fails.
      let streak = 0;
      while (est[streak]?.blind && !est[streak]?.missed) streak += 1;
      if (streak >= PROBE_AFTER) gain = Math.max(gain, GAIN + 1 + (streak > PROBE_AFTER ? 1 : 0));
    }
    const e = est[ref]!;
    const last = workouts[ref];
    let anchor = matched ? anchorOf(last) : null;
    if (factor < 1 && anchor != null) {
      anchor = minWeight(ex, floorStep(anchor * factor, ex.step));
      gain = 0;
    }
    let up = e.known ? MAX_UP_KNOWN : MAX_UP;
    if (gain > GAIN) up = Math.max(up, MAX_UP * gain);
    if (ref > 0) up = 0;
    const p: Prescription = {
      e: strengthFrom(est, ref) * factor,
      fatigue,
      anchor,
      gain,
      up,
      down: MAX_DOWN,
      last: factor < 1 || ref > 0 ? null : last,
      afterMiss: e.missed && ref === 0,
    };
    let sets = prescribe(ex, g, p);
    // Never heavier than a weight just missed at (a suggestion within the range).
    const missedAt = last.filter(
      (s) => shortOf(s) && s.suggested!.reps <= s.target.max && (s.rir == null || s.rir <= 1),
    );
    const limit = Math.min(Infinity, ...missedAt.map((s) => s.weight!));
    if (ref === 0 && sets.some((s) => s.weight != null && s.weight > limit)) {
      sets = prescribe(ex, g, {
        ...p,
        anchor: Math.min(anchor ?? limit, limit),
        up: 0,
        afterMiss: true,
      });
    }
    if (ref > 0) {
      // After a bad day the workout before it again: no more reps than it managed at that weight.
      const managed = (w: number) =>
        Math.max(0, ...last.filter((s) => (s.weight ?? 0) >= w).map((s) => s.reps));
      sets = sets.map((s, i) => {
        const most = Math.max(managed(s.weight ?? 0), g.targets[i].min);
        return { ...s, reps: Math.min(s.reps, most) };
      });
    }
    // After a break, at most the middle of the range.
    if (factor < 1)
      sets = sets.map((s, i) => ({ ...s, reps: Math.min(s.reps, middle(g.targets[i])) }));
    out.push(...sets);
  }
  return out;
}

/**
 * What each set suggests with the sets logged so far (`done`, null for open ones), from the plan
 * (null the first time). A set within a rep of its suggestion, without RIR, leaves the plan; one
 * further off (or at the user's own weight) re-plans the rest of its range from what it showed,
 * and later ranges move with it. A logged set keeps what it suggested when it was logged.
 */
export function adaptSets(
  ex: RuleExercise,
  targets: Target[],
  planned: Suggested[] | null,
  done: (RuleSet | null)[],
  history: RuleSet[][],
): (Suggested | null)[] {
  const current: (Suggested | null)[] = planned ? [...planned] : targets.map(() => null);
  const shown = [...current];
  const groups = groupsOf(targets);
  const fatigue = fatigueOf(history);
  for (let i = 0; i < targets.length; i++) {
    shown[i] = current[i];
    const s = done[i];
    if (!s || s.weight == null || s.weight <= 0) continue;
    const t = targets[i];
    const sug = current[i];
    const f = effortOf(s, sug);
    // Strength at this set (with the fatigue so far).
    const eDone = e1rm(s.weight, s.reps, f.rir);
    const ownWeight = !!sug && sug.weight != null && s.weight !== sug.weight;
    let surprise = 0;
    if (sug && sug.weight != null) {
      const ePlan = e1rm(sug.weight, sug.reps, t.rir);
      const off =
        Math.round((repsAt(eDone, s.weight, 0) - repsAt(ePlan, s.weight, 0)) * 1000) / 1000;
      // Without a known effort a set as suggested shows nothing.
      surprise = f.known || f.beyond || ownWeight ? off : 0;
      if (Math.abs(surprise) < SURPRISE && !ownWeight) continue;
    } else if (s.rir == null && s.reps >= t.min && s.reps <= t.max) {
      // Nothing suggested (the first time): only RIR, or reps outside the range, show something.
      continue;
    }
    const own = groups.find((g) => i >= g.start && i < g.start + g.targets.length)!;
    for (const g of groups) {
      // Every later set: a logged one was done with what this re-plan showed it.
      const later = g.targets.map((_, k) => g.start + k).filter((j) => j > i);
      if (!later.length) continue;
      const rest: Group = { start: later[0], targets: later.map((j) => targets[j]) };
      const plan: Prescription = {
        e: eDone / (1 - fatigue * i),
        fatigue,
        anchor: null,
        gain: 0,
        up: MAX_UP,
        down: MAX_DOWN,
        last: null,
        afterMiss: false,
      };
      if (g === own) {
        const keep = ownWeight && !f.missed ? s.weight : (current[later[0]]?.weight ?? s.weight);
        const up = f.known || f.beyond || !sug ? MAX_UP : 0;
        let sets = prescribe(ex, rest, { ...plan, anchor: keep, up, afterMiss: f.missed });
        if (f.missed) sets = sets.map((x) => afterMissIn(ex, s, t, x));
        if (s.rir != null && s.rir >= 5) {
          // "5+" only says "at least": still finding the weight, so the next sets probe heavier.
          const probe = Math.max(
            round2(s.weight + ex.step),
            floorStep(s.weight * (1 + PLUS_JUMP), ex.step),
          );
          sets = sets.map((x, k) =>
            x.weight != null && x.weight < probe ? { weight: probe, reps: rest.targets[k].min } : x,
          );
        }
        later.forEach((j, k) => (current[j] = sets[k]));
      } else if (g.start > i) {
        const next = current[later[0]];
        if (!next) {
          // The first time: the next range from today's strength.
          const sets = prescribe(ex, rest, plan);
          later.forEach((j, k) => (current[j] = sets[k]));
        } else if (
          next.weight != null &&
          sug?.weight != null &&
          f.known &&
          Math.abs(surprise) >= SURPRISE
        ) {
          // A later range moves with how much stronger or weaker this set was than planned.
          const ratio = eDone / e1rm(sug.weight, sug.reps, t.rir);
          later.forEach((j) => {
            const c = current[j]!;
            current[j] = {
              weight: minWeight(ex, floorStep((c.weight ?? 0) * ratio, ex.step)),
              reps: c.reps,
            };
          });
        }
      }
    }
  }
  return shown;
}

/**
 * After a miss, a later set of the workout asks no more than it managed at that weight or
 * heavier; below the range one step lighter, or at the lightest weight there is, its reps.
 */
function afterMissIn(ex: RuleExercise, miss: RuleSet, t: Target, x: Suggested): Suggested {
  const w = miss.weight!;
  if (x.weight == null || x.weight < w || x.reps <= miss.reps) return x;
  if (miss.reps >= t.min) return { ...x, reps: miss.reps };
  const lighter = minWeight(ex, round2(w - ex.step));
  return lighter < w ? { weight: lighter, reps: t.min } : { weight: w, reps: miss.reps };
}
