// The plan generation tests' profiles and checks, shared by the eval (run.mjs) and the plan lab
// (scripts/plan-lab): 20 sets of onboarding answers, and the rules of thumb each plan is checked
// against.
import { fits } from '../../supabase/functions/_shared/plan-events.ts';
import {
  DEFAULT_REST,
  exerciseSeconds,
  repTarget,
  restAfterSet,
} from '../../supabase/functions/_shared/rest.ts';

/** What the home profiles ticked: a small corner, a home gym, a kettlebell and a bar. */
const HOME_EQUIPMENT = {
  '05': ['dumbbell', 'bench'],
  '06': ['barbell', 'rack', 'bench', 'dumbbell', 'pull-up-bar', 'cable'],
  14: ['kettlebell', 'pull-up-bar'],
};

/**
 * Answers as the app sends them, across goals, equipment, workouts a week, splits (one the app
 * offers for that many, or none: no preference), lengths and experience.
 */
export const PROFILES = [
  ['01', 'de', 'hypertrophy', 'gym', 3, 'full_body', 60, 'beginner', []],
  ['02', 'de', 'strength', 'gym', 4, 'upper_lower', 75, 'intermediate', []],
  [
    '03',
    'de',
    'strength_hypertrophy',
    'gym',
    5,
    'ppl_upper_lower',
    60,
    'advanced',
    ['chest', 'side_delts'],
  ],
  ['04', 'en', 'hypertrophy', 'gym', 6, 'ppl', 45, 'advanced', ['glutes', 'hamstrings']],
  ['05', 'en', 'hypertrophy', 'home', 3, 'full_body', 45, 'beginner', []],
  ['06', 'de', 'strength', 'home', 2, 'upper_lower', 90, 'intermediate', []],
  ['07', 'de', 'hypertrophy', 'bodyweight', 3, 'full_body', 30, 'none', []],
  ['08', 'pt-PT', 'strength_hypertrophy', 'bodyweight', 4, 'full_body', 40, 'beginner', []],
  ['09', 'pt-BR', 'hypertrophy', 'gym', 3, 'upper_lower_full', 90, 'intermediate', []],
  ['10', 'de', 'hypertrophy', 'gym', 2, 'full_body', 30, 'none', ['biceps', 'triceps']],
  ['11', 'en', 'strength', 'gym', 3, 'ppl', 60, 'advanced', []],
  ['12', 'de', 'hypertrophy', 'gym', 6, 'full_body', 30, 'advanced', []],
  ['13', 'de', 'hypertrophy', 'gym', 4, 'upper_lower', 120, 'intermediate', ['lats', 'upper_back']],
  ['14', 'pt-BR', 'strength_hypertrophy', 'home', 5, 'bro', 30, 'intermediate', ['abs']],
  ['15', 'de', 'hypertrophy', 'gym', 3, null, 60, null, ['quads']],
  ['16', 'de', 'hypertrophy', 'gym', 4, 'upper_lower', 60, 'intermediate', []],
  ['17', 'en', 'hypertrophy', 'gym', 6, 'arnold', 60, 'intermediate', []],
  ['18', 'de', 'hypertrophy', 'gym', 4, 'ppl_arms', 60, 'intermediate', ['biceps']],
  ['19', 'es', 'hypertrophy', 'gym', 3, 'full_body', 60, 'beginner', []],
  ['20', 'fr', 'strength', 'gym', 4, 'upper_lower', 75, 'intermediate', []],
].map(
  ([id, language, goal, equipment, sessionsPerWeek, split, sessionMinutes, experience, focus]) => ({
    id,
    language,
    answers: {
      goal,
      focus,
      equipment,
      homeEquipment: HOME_EQUIPMENT[id] ?? [],
      sessionsPerWeek,
      split,
      sessionMinutes,
      experience,
    },
  }),
);

// ---------- the rules ----------

/**
 * The user's equipment: a full gym's, the ticked items at home, none on the floor. `equipment` is
 * the active rows of public.equipment by id.
 */
const equipmentOf = ({ equipment: access, homeEquipment }, equipment) =>
  new Set(
    access === 'gym'
      ? [...equipment.values()].filter((e) => e.in_gym).map((e) => e.id)
      : homeEquipment.filter((id) => equipment.has(id)),
  );

/** The rest the app gives after a set (restSecondsFor); generated plans store none. */
export const restOf = (row, { targetMin, targetMax }) =>
  restAfterSet(
    row?.rest_seconds ?? DEFAULT_REST,
    row?.measures ?? [],
    repTarget(targetMin, targetMax),
  );

/**
 * The app's session estimate (estimateMinutes): set-up per exercise, per set its work and rest.
 * The sets of a generated exercise share their targets, so the first one's rest is every set's.
 */
export const minutesOf = (routine, catalog) =>
  routine.exercises.reduce((s, e) => {
    const rest = e.restSeconds ?? restOf(catalog.get(e.exerciseId), e.sets[0]);
    return s + exerciseSeconds(e.sets.length, rest);
  }, 0) / 60;

/** Each is trained at least once a week, and in as many routines as the split trains it (up to 2). */
const GROUPS = {
  chest: ['chest'],
  back: ['lats', 'upper_back'],
  shoulders: ['front_delts', 'side_delts', 'rear_delts'],
  arms: ['biceps', 'triceps'],
  quads: ['quads'],
  hamstrings: ['hamstrings'],
  glutes: ['glutes'],
};
const PUSH = ['chest', 'front_delts', 'triceps'];
const PULL = ['lats', 'upper_back', 'rear_delts', 'biceps'];
/** The muscles a focus muscle is compared with. */
const MAJOR = [...new Set(Object.values(GROUPS).flat())];
/** A muscle counts as trained by an exercise from this share of its stimulus on. */
const MAIN_SHARE = 0.2;

/** How many times a week the split trains each muscle with that many workouts. */
const timesPerMuscle = ({ split, sessionsPerWeek: n }) =>
  ({
    full_body: n,
    upper_lower: Math.floor(n / 2),
    upper_lower_full: 2,
    ppl: Math.floor(n / 3),
    ppl_arms: 1,
    ppl_upper_lower: 2,
    bro: 1,
    arnold: 2,
  })[split] ?? (n >= 3 ? 2 : 1);

export const isTimed = (row) => row?.measures?.includes('seconds');
/** Equipment a heavy first lift needs; with a kettlebell or the body alone higher reps are right. */
const HEAVY_EQUIPMENT = ['barbell', 'dumbbell', 'cable', 'machine', 'smith-machine'];
const canGoHeavy = ({ equipment, homeEquipment }) =>
  equipment === 'gym' ||
  (equipment === 'home' && homeEquipment.some((id) => HEAVY_EQUIPMENT.includes(id)));
/** Core work, as generate.ts's isCore: abs and obliques take at least half of the stimulus. */
const isCore = (row) => (row?.muscles?.abs ?? 0) + (row?.muscles?.obliques ?? 0) >= 0.5;

/** Weekly sets per muscle, each set counted by the muscle's share in it. */
function weeklySets(plan, catalog) {
  const sets = {};
  for (const routine of plan.routines) {
    for (const e of routine.exercises) {
      for (const [muscle, share] of Object.entries(catalog.get(e.exerciseId)?.muscles ?? {})) {
        sets[muscle] = (sets[muscle] ?? 0) + e.sets.length * share;
      }
    }
  }
  return sets;
}

const sum = (sets, muscles) => muscles.reduce((n, m) => n + (sets[m] ?? 0), 0);
export const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
};

/**
 * Each check: null when it doesn't apply, else the problems found (none: passed). Each takes the
 * profile ({ answers }), the plan, the catalog and the equipment (rows by id).
 */
export const CHECKS = {
  routines: ({ answers }, plan) =>
    plan.routines.length === answers.sessionsPerWeek
      ? []
      : [`${plan.routines.length} routines for ${answers.sessionsPerWeek} workouts a week`],
  time: ({ answers }, plan, catalog) =>
    plan.routines.flatMap((r) => {
      const minutes = minutesOf(r, catalog);
      if (minutes > answers.sessionMinutes * 1.1)
        return [`${r.name}: ${Math.round(minutes)} min, more than ${answers.sessionMinutes}`];
      // A routine that leaves a third of the time unused, unless it is already full.
      if (minutes < answers.sessionMinutes * 0.67 && r.exercises.length < 10)
        return [`${r.name}: only ${Math.round(minutes)} of ${answers.sessionMinutes} min`];
      return [];
    }),
  equipment: ({ answers }, plan, catalog, equipment) => {
    const have = equipmentOf(answers, equipment);
    return plan.routines.flatMap((r) =>
      r.exercises
        .filter((e) => {
          const row = catalog.get(e.exerciseId);
          return !row || row.cardio || !fits(row.needs, have);
        })
        .map(
          (e) =>
            `${r.name}: ${e.exerciseId} (needs ${JSON.stringify(catalog.get(e.exerciseId)?.needs)})`,
        ),
    );
  },
  unique: (_, plan) =>
    plan.routines.flatMap((r) => {
      const ids = r.exercises.map((e) => e.exerciseId);
      return ids.filter((id, i) => ids.indexOf(id) !== i).map((id) => `${r.name}: ${id} twice`);
    }),
  muscles: ({ answers }, plan, catalog) => {
    const want = Math.max(1, Math.min(2, timesPerMuscle(answers)));
    return Object.entries(GROUPS).flatMap(([group, muscles]) => {
      const on = plan.routines.filter((r) =>
        r.exercises.some((e) =>
          muscles.some((m) => (catalog.get(e.exerciseId)?.muscles?.[m] ?? 0) >= MAIN_SHARE),
        ),
      ).length;
      return on >= want ? [] : [`${group} in ${on} routine(s), want ${want}`];
    });
  },
  balance: (_, plan, catalog) => {
    const sets = weeklySets(plan, catalog);
    const push = sum(sets, PUSH);
    const pull = sum(sets, PULL);
    const ratio = pull ? push / pull : Infinity;
    return ratio >= 0.67 && ratio <= 1.5
      ? []
      : [`push ${push.toFixed(1)} : pull ${pull.toFixed(1)} sets a week`];
  },
  focus: ({ answers }, plan, catalog) => {
    if (!answers.focus.length) return null;
    const sets = weeklySets(plan, catalog);
    const rest = median(MAJOR.filter((m) => !answers.focus.includes(m)).map((m) => sets[m] ?? 0));
    return answers.focus
      .filter((m) => (sets[m] ?? 0) < rest * 1.2)
      .map((m) => `${m}: ${(sets[m] ?? 0).toFixed(1)} sets a week, others ${rest.toFixed(1)}`);
  },
  reps: ({ answers }, plan, catalog) =>
    plan.routines.flatMap((r) => {
      const lifts = r.exercises.filter((e) => !isTimed(catalog.get(e.exerciseId)));
      const problems = [];
      const [first] = lifts;
      // The routine's first lift is the heavy one.
      const heavy = canGoHeavy(answers) && { strength: 6, strength_hypertrophy: 8 }[answers.goal];
      if (heavy && first && first.sets[0].targetMax > heavy)
        problems.push(`${r.name}: starts with ${first.sets[0].targetMax} reps`);
      for (const e of lifts) {
        const { targetMin: min, targetMax: max, rir } = e.sets[0];
        if (min < 3 || max > 20) problems.push(`${r.name}: ${e.exerciseId} ${min}–${max} reps`);
        if (rir == null) problems.push(`${r.name}: ${e.exerciseId} without RIR`);
      }
      return problems;
    }),
  core: ({ answers }, plan, catalog) => {
    const allowed =
      answers.goal === 'hypertrophy' || answers.focus.some((m) => ['abs', 'obliques'].includes(m));
    return plan.routines.flatMap((r) => {
      const rows = r.exercises.map((e) => catalog.get(e.exerciseId));
      const core = rows.filter(isCore);
      return [
        ...r.exercises
          .filter((e) => isTimed(catalog.get(e.exerciseId)))
          .map((e) => `${r.name}: ${e.exerciseId} is a timed hold`),
        ...(core.length && !allowed ? [`${r.name}: core work in a ${answers.goal} plan`] : []),
        ...(core.length > 1 ? [`${r.name}: ${core.length} core exercises`] : []),
        ...(core.length && !isCore(rows.at(-1)) ? [`${r.name}: core work not last`] : []),
      ];
    });
  },
  experience: ({ answers }, plan) => {
    if (answers.experience && !['none', 'beginner'].includes(answers.experience)) return null;
    return plan.routines.flatMap((r) => [
      ...(r.exercises.length > 6 ? [`${r.name}: ${r.exercises.length} exercises`] : []),
      ...r.exercises
        .filter((e) => e.sets.length > 3)
        .map((e) => `${r.name}: ${e.exerciseId} ${e.sets.length} sets`),
    ]);
  },
};
