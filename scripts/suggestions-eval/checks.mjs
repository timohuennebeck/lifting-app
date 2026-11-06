// Hard rules every suggestion keeps, checked on each one the simulated lifters see. A miss is a
// set short of its suggestion at that weight or heavier, without 2+ reps in reserve entered.

const onStep = (w, step) => Math.abs(w / step - Math.round(w / step)) < 1e-6;
/** Estimated one-rep max of a set with `rir` left. */
const strength = (s, rir) => s.weight * (1 + (s.reps + rir) / 30);
const missed = (s) =>
  !!s.suggested &&
  s.weight >= s.suggested.weight &&
  s.reps < s.suggested.reps &&
  (s.rir == null || s.rir <= 1);

export const RULES = [
  'a number',
  'not below the lightest weight',
  'on the weight step',
  'reps not below the range (except at the lightest weight)',
  'reps at most 5 past the range',
  'no more reps than a miss managed, at that weight or heavier',
  'at most +25 % in one workout',
  'at most −20 % in one workout',
  'never heavier right after a miss',
  'a set done as suggested changes nothing',
  'after a miss, the next set asks no more',
];

/**
 * Breaks of the rules for one call: `out` the suggestions, `planned` what the workout started
 * with, `before` the suggestions before the last logged set was logged. One bad day is ignored:
 * asking for what the workout before it showed the strength for (5 % leeway for fatigue and
 * averaging) doesn't count as asking more than a miss.
 */
export function breaks({ ex, targets, history, done, out, planned, before }) {
  const found = [];
  const lightest = Math.max(ex.floor, ex.step);
  out.forEach((s, i) => {
    if (!s) return;
    const t = targets[i];
    if (!Number.isFinite(s.weight) || !Number.isFinite(s.reps)) found.push(RULES[0]);
    if (s.weight < ex.floor - 1e-9 || s.weight <= 0) found.push(RULES[1]);
    if (!onStep(s.weight, ex.step) && s.weight !== ex.floor) found.push(RULES[2]);
    if (s.reps < t.min && s.weight > lightest) found.push(RULES[3]);
    if (s.reps > t.max + 5) found.push(RULES[4]);
  });
  const last = history[0];
  if (planned && last && done.every((d) => d == null)) {
    const sameRange = (s, t) => s.target.min === t.min && s.target.max === t.max;
    // What the workout before the newest did or showed the strength for: the bad-day rule may
    // repeat it.
    const did = (s, t) =>
      (history[1] ?? []).some(
        (x) =>
          (x.weight >= s.weight && x.reps >= s.reps) ||
          strength(x, x.rir ?? x.target.rir) >= 0.95 * strength(s, t.rir),
      );
    // Last time's working weight: the heaviest that reached the range, else the lightest used.
    const ofRange = last.filter((s) => sameRange(s, targets[0]));
    const inRange = ofRange.filter((s) => s.reps >= s.target.min);
    const weights = (inRange.length ? inRange : ofRange).map((s) => s.weight);
    const top = !weights.length ? 0 : inRange.length ? Math.max(...weights) : Math.min(...weights);
    planned.forEach((s, i) => {
      const prev = last[Math.min(i, last.length - 1)];
      if (!prev || !sameRange(prev, targets[i])) return;
      if (missed(prev) && prev.reps >= targets[i].min && s.weight >= prev.weight) {
        if (s.reps > prev.reps && !did(s, targets[i])) found.push(RULES[5]);
      }
      if (i > 0 || !top) return;
      if (s.weight > top * 1.25 + ex.step + 1e-9 && !did(s, targets[0])) found.push(RULES[6]);
      if (s.weight < top * 0.8 - ex.step - 1e-9) found.push(RULES[7]);
    });
    const misses = last.filter(
      (s) => sameRange(s, targets[0]) && missed(s) && s.suggested.reps <= s.target.max,
    );
    const missedAt = Math.min(Infinity, ...misses.map((s) => s.weight));
    const first = planned[0];
    if (first && first.weight > missedAt && first.weight > top + 1e-9 && !did(first, targets[0])) {
      found.push(RULES[8]);
    }
  }
  const i = done.findIndex((d) => d == null) - 1;
  const set = i >= 0 ? done[i] : null;
  const sug = before?.[i];
  const next = out[i + 1];
  if (set && sug && next) {
    const was = before[i + 1];
    const asSuggested = set.weight === sug.weight && set.reps === sug.reps && set.rir == null;
    if (asSuggested && was && (was.weight !== next.weight || was.reps !== next.reps)) {
      found.push(RULES[9]);
    }
    const t = targets[i];
    const u = targets[i + 1];
    const sameGroup = t.min === u.min && t.max === u.max && t.rir === u.rir;
    const short =
      set.weight >= sug.weight && set.reps < sug.reps && (set.rir == null || set.rir <= 1);
    if (sameGroup && short && next.weight >= set.weight && next.reps > set.reps) {
      found.push(RULES[10]);
    }
  }
  return found;
}
