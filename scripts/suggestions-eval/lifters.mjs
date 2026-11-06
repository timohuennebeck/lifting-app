// Simulated lifters for the suggestions eval. Each has a true strength the rules never see, on a
// rep curve unlike the rules' formula; loses strength from set to set; has good and bad days;
// misjudges RIR and enters it never, sometimes or always; gets stronger only from hard enough
// sets; takes breaks and changes gyms; and follows suggestions in its own way (stops at the
// suggested reps or goes by feel, sometimes picks another weight). The first time it guesses.

/** Seeded random numbers, so a run is repeatable. */
export function random(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const normal = () =>
    Math.sqrt(-2 * Math.log(Math.max(next(), 1e-12))) * Math.cos(2 * Math.PI * next());
  const between = (lo, hi) => lo + (hi - lo) * next();
  const pick = (xs) => xs[Math.floor(next() * xs.length)];
  const weighted = (xs) => {
    let left = next() * xs.reduce((sum, [, p]) => sum + p, 0);
    for (const [x, p] of xs) if ((left -= p) <= 0) return x;
    return xs[xs.length - 1][0];
  };
  return { next, normal, between, pick, weighted };
}

const T = (min, max, rir) => ({ min, max, rir });
const times = (n, t) => Array.from({ length: n }, () => t);

/** Plans: rep ranges, fixed reps, a top set with back-offs, blocks with a deload, a switch. */
const SCHEMES = [
  [{ name: '3×8–12 @2', targets: () => times(3, T(8, 12, 2)) }, 30],
  [{ name: '3×6–10 @2', targets: () => times(3, T(6, 10, 2)) }, 10],
  [{ name: '4×5–8 @1', targets: () => times(4, T(5, 8, 1)) }, 8],
  [{ name: '3×10–15 @2', targets: () => times(3, T(10, 15, 2)) }, 10],
  [{ name: '3×12–20 @3', targets: () => times(3, T(12, 20, 3)) }, 6],
  [{ name: '5×5 @2', targets: () => times(5, T(5, 5, 2)) }, 5],
  [{ name: 'top set + back-offs', targets: () => [T(4, 6, 1), ...times(3, T(8, 10, 2))] }, 6],
  [{ name: '2×8–12 @1', targets: () => times(2, T(8, 12, 1)) }, 6],
  [{ name: '1×6–10 @0', targets: () => times(1, T(6, 10, 0)) }, 3],
  [
    {
      // Two workouts a week: weeks 1–4 at RIR 3, 2, 1, 0, then a deload.
      name: 'blocks 3×8–12',
      targets: (k) => {
        const week = Math.floor(k / 2) % 5;
        return week === 4 ? times(2, T(8, 12, 4)) : times(3, T(8, 12, 3 - week));
      },
    },
    8,
  ],
  [
    {
      name: 'switch 8–12 → 4–6',
      targets: (k) => (k < 14 ? times(3, T(8, 12, 2)) : times(4, T(4, 6, 1))),
    },
    4,
  ],
  [{ name: '4×8 @2', targets: () => times(4, T(8, 8, 2)) }, 4],
];

/** Assumptions about lifters; the rules should do well under every one. */
export const WORLDS = {
  base: 'Mixed lifters',
  unbiased: 'RIR judged accurately',
  pessimistic: 'RIR judged too low',
  optimistic: 'RIR judged too high',
  hifat: 'A lot of fatigue between sets',
  lofat: 'Little fatigue',
  wideK: 'Unusual rep curves',
  norir: 'Never enter RIR',
  allrir: 'Always enter RIR',
  stoppers: 'Always stop at the suggested reps',
};

const STEPS = {
  kg: {
    barbell: [
      [2.5, 80],
      [1.25, 10],
      [5, 10],
    ],
    dumbbell: [
      [2, 50],
      [2.5, 35],
      [1, 15],
    ],
    machine: [
      [5, 55],
      [2.5, 35],
      [10, 10],
    ],
    cable: [
      [2.5, 50],
      [5, 35],
      [1.25, 15],
    ],
  },
  lb: {
    barbell: [
      [5, 85],
      [2.5, 15],
    ],
    dumbbell: [
      [5, 85],
      [2.5, 15],
    ],
    machine: [
      [10, 60],
      [5, 40],
    ],
    cable: [
      [5, 70],
      [2.5, 20],
      [10, 10],
    ],
  },
};
/** True one-rep max range in kg per equipment. */
const STRENGTH = { barbell: [35, 220], dumbbell: [8, 70], machine: [30, 280], cable: [12, 110] };

/** A lifter (one exercise) under `world`. */
export function makeLifter(r, world) {
  const equipment = r.weighted([
    ['barbell', 35],
    ['dumbbell', 30],
    ['machine', 20],
    ['cable', 15],
  ]);
  const units = r.next() < 0.2 ? 'imperial' : 'metric';
  const unit = units === 'imperial' ? 'lb' : 'kg';
  const [lo, hi] = STRENGTH[equipment];
  const e = Math.exp(r.between(Math.log(lo), Math.log(hi))) * (unit === 'lb' ? 2.2046 : 1);
  let gymStep = r.weighted(STEPS[unit][equipment]);
  if (equipment === 'dumbbell' && e < (unit === 'lb' ? 40 : 18)) gymStep = unit === 'lb' ? 2.5 : 1;
  const [level, gain] = r.weighted([
    [['novice', 0.012], 35],
    [['intermediate', 0.004], 45],
    [['advanced', 0.0012], 20],
  ]);
  const scheme = r.weighted(SCHEMES);
  const workouts = 30;
  const rir = {
    unbiased: [1, 1, 0, 0],
    optimistic: [1, 1.3, 0, 1],
    pessimistic: [0.5, 0.8, -1.5, -0.5],
  }[world] ?? [0.6, 1.1, -1, 0.5];
  const gymChangeAt = r.next() < 0.08 ? 5 + Math.floor(r.next() * (workouts - 10)) : -1;
  return {
    equipment,
    units,
    gymStep,
    gymStep2: gymChangeAt >= 0 ? r.pick(STEPS[unit][equipment].map(([s]) => s)) : gymStep,
    gymChangeAt,
    e,
    e0: e,
    /** Reps to failure against the rules' formula (1 = the same). */
    k: world === 'wideK' ? r.between(0.65, 1.45) : r.between(0.8, 1.25),
    gain,
    level,
    daySd: r.between(0.015, 0.045),
    fatigue:
      world === 'hifat'
        ? r.between(0.035, 0.07)
        : world === 'lofat'
          ? r.between(0.005, 0.015)
          : r.between(0.012, 0.04),
    rirEntry:
      world === 'norir'
        ? 0
        : world === 'allrir'
          ? 1
          : r.weighted([
              [0, 40],
              [0.3, 20],
              [0.8, 20],
              [1, 20],
            ]),
    rirScale: r.between(rir[0], rir[1]),
    rirBias: r.between(rir[2], rir[3]),
    rirSd: r.between(0.4, 1.2),
    mode: world === 'stoppers' || r.next() < 0.5 ? 'stopper' : 'feel',
    overshoot: r.next() < 0.3,
    deviate: r.weighted([
      [0, 50],
      [0.1, 35],
      [0.3, 15],
    ]),
    selfAdjust: r.next() < 0.5,
    guess: Math.exp(r.normal() * 0.22 + Math.log(0.85)),
    scheme,
    workouts,
    breakAt: r.next() < 0.15 ? 3 + Math.floor(r.next() * (workouts - 6)) : -1,
    breakDays: Math.round(r.between(21, 75)),
  };
}

const repsToFailure = (l, strength, w) => Math.max(0, l.k * 30 * (strength / w - 1));

/** What the lifter does for set `i` given the suggestion (or none). */
function act(l, r, sug, strength, t, done, i, grid, step, floor) {
  const cap = (w) => repsToFailure(l, strength, w);
  const perceive = (rir) => (rir < 1 ? 0 : Math.min(5, Math.max(0, rir * l.rirScale + l.rirBias)));
  const prev = i > 0 ? done[i - 1] : null;
  const felt = prev ? perceive(Math.max(0, cap(prev.weight) - prev.reps)) : null;
  let w;
  if (sug) {
    w = grid(sug.weight);
    if (r.next() < l.deviate) w = grid(w + r.pick([-2, -1, 1, 1, 2]) * step);
    if (l.selfAdjust && l.mode === 'feel' && prev) {
      // Experienced lifters overrule a suggestion that ignores what they just felt.
      if (felt >= t.rir + 3 && w <= prev.weight)
        w = grid(prev.weight * (1 + 0.03 * (felt - t.rir)));
      else if (prev.reps < t.min && w >= prev.weight) w = grid(prev.weight * 0.88);
    }
  } else if (!prev) {
    // Nothing to go by: a guess around the right weight for the middle of the range.
    w = grid((strength / (1 + ((t.min + t.max) / 2 + t.rir) / (30 * l.k))) * l.guess);
  } else {
    // Finding the weight by feel: heavier after an easy set, lighter after falling short.
    w = prev.weight;
    if (prev.reps < t.min) w = grid(prev.weight * 0.88);
    else if (felt >= t.rir + 3) {
      w = grid(prev.weight * (1 + 0.04 * (felt - t.rir)));
      if (w === prev.weight) w = prev.weight + step;
    }
  }
  for (let guard = 0; cap(w) < 1 && w > floor && guard < 20; guard++) {
    w = grid(w * 0.88) === w ? Math.max(floor, w - step) : grid(w * 0.88);
  }
  const most = Math.floor(cap(w) + 1e-9);
  const byFeel = Math.round(cap(w) - (t.rir + 0.5) + r.normal() * 0.7);
  let reps;
  if (sug && grid(sug.weight) === w) {
    const upTo = l.overshoot ? t.max + 5 : Math.max(t.max, sug.reps);
    reps =
      l.mode === 'stopper'
        ? Math.min(sug.reps, most)
        : Math.min(most, Math.max(sug.reps, Math.min(byFeel, upTo)));
  } else if (sug) {
    reps = Math.min(
      most,
      l.mode === 'feel' ? Math.max(sug.reps, Math.min(byFeel, t.max)) : sug.reps,
    );
  } else {
    reps = Math.min(
      most,
      Math.max(Math.min(t.min, most), Math.min(byFeel, l.overshoot ? t.max + 5 : t.max)),
    );
  }
  return { weight: w, reps: Math.max(1, reps) };
}

/**
 * 30 workouts of lifter `l` with `suggest` ({ lifter, targets, history, days, done } → a
 * suggestion per set, or null), or with the best possible suggestions (`suggest` null: knows
 * the true strength, not the day's form). Every suggested set is scored against the truth.
 */
export function simulate(l0, seed, suggest, floorOf) {
  const l = { ...l0 };
  const r = random(seed);
  const score = { n: 0, on: 0, fail: 0, wayEasy: 0, settledAt: -1 };
  const history = [];
  let day = 0;
  let lastDay = 0;
  let streak = 0;
  for (let k = 0; k < l.workouts; k++) {
    const gap = k === 0 ? 0 : k === l.breakAt ? l.breakDays : Math.round(r.between(2, 5));
    day += gap;
    if (gap > 14) l.e *= Math.max(0.85, 1 - 0.008 * ((gap - 14) / 7));
    const step = l.gymChangeAt >= 0 && k >= l.gymChangeAt ? l.gymStep2 : l.gymStep;
    const floor = floorOf(l.equipment, l.units);
    const grid = (w) => Math.max(floor, Math.round(w / step) * step);
    const today = l.e * Math.exp(r.normal() * l.daySd) * (r.next() < 0.05 ? 0.9 : 1);
    const targets = l.scheme.targets(k);
    const done = targets.map(() => null);
    let fresh = 1;
    let stimulus = 0;
    let good = true;
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const strength = today * fresh;
      const best = (cap) => bestFor(cap, t, grid, step, floor);
      const sug = suggest
        ? (suggest({
            lifter: l,
            targets,
            history: history.slice(0, 3),
            days: day - lastDay,
            done,
          })?.[i] ?? null)
        : best((w) => repsToFailure(l, l.e * fresh, w));
      if (sug?.weight != null) {
        const off =
          Math.floor(repsToFailure(l, strength, grid(sug.weight)) + 1e-9) - sug.reps - t.rir;
        score.n += 1;
        if (off + t.rir < 0) score.fail += 1;
        else if (Math.abs(off) <= 1) score.on += 1;
        else if (off > 3) score.wayEasy += 1;
        if (Math.abs(off) > 1.5) good = false;
      } else good = false;
      const { weight, reps } = act(l, r, sug, strength, t, done, i, grid, step, floor);
      const left = Math.max(0, repsToFailure(l, strength, weight) - reps);
      let rir = null;
      if (r.next() < l.rirEntry) {
        const felt = left < 1 ? 0 : left * l.rirScale + l.rirBias + r.normal() * l.rirSd;
        rir = Math.min(5, Math.max(0, Math.round(felt)));
      }
      done[i] = { weight, reps, rir, target: t, suggested: sug };
      const share = Math.min(1, reps / Math.max(repsToFailure(l, strength, weight), 0.5));
      fresh *= 1 - l.fatigue * share * share;
      stimulus += left <= 3 ? 1 : left <= 5 ? 0.6 : 0.25;
    }
    l.e *= 1 + l.gain * Math.exp(-4 * (l.e / l.e0 - 1)) * (stimulus / targets.length);
    history.unshift(done);
    lastDay = day;
    if (k > 0) {
      streak = good ? streak + 1 : 0;
      if (score.settledAt < 0 && streak >= 2) score.settledAt = k - 1;
    }
  }
  return score;
}

/** The heaviest weight that leaves the target RIR within the range, with its reps. */
function bestFor(cap, t, grid, step, floor) {
  let best = null;
  for (let w = grid(floor); w < 5000; w = grid(w + step)) {
    const reps = Math.floor(cap(w) + 1e-9) - t.rir;
    if (reps < t.min) break;
    best = { weight: w, reps: Math.min(reps, t.max) };
  }
  return best ?? { weight: grid(floor), reps: Math.max(1, Math.floor(cap(grid(floor))) - t.rir) };
}
