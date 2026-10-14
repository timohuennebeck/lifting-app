// Tests the plan generation (the generate-plan Edge Function) with 15 sets of onboarding answers
// and checks each plan it makes: a day per training day, sessions that fit the chosen length,
// only exercises the equipment allows, no exercise twice a day, every major muscle group trained,
// pushing and pulling about even, focus muscles trained more, sets and reps that suit the goal and
// the experience. The checks are rules of thumb; read the plans in the report as well.
//
// Needs the function with an OpenAI key at EXPO_PUBLIC_SUPABASE_URL from .env: locally
// `npm run supabase:start`, which serves it with supabase/functions/.env (one run is 15 plans, so
// set PLAN_GENERATE_IP_LIMIT=1000 there first, then restart Supabase), or the deployed project.
// Usage: npm run plan:generate-eval            all profiles
//        npm run plan:generate-eval -- 03 11   only these
// Reports and the raw answers go to scripts/plan-generate-eval/out/.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loadCatalog, pool, streamPlan } from '../plan-functions.mjs';

const HERE = import.meta.dirname;
const PARALLEL = 3;
/** Why no further plans are asked for: the limit was reached, or the function doesn't answer. */
let stopped = null;
const { EXPO_PUBLIC_SUPABASE_URL: SUPABASE_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: KEY } =
  process.env;
if (!SUPABASE_URL || !KEY) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.');
  process.exit(1);
}

const MON = 0;
const TUE = 1;
const WED = 2;
const THU = 3;
const FRI = 4;
const SAT = 5;
const SUN = 6;

/** Answers as the app sends them, across goals, equipment, days, lengths and experience. */
const PROFILES = [
  ['01', 'de', 'hypertrophy', 'gym', [MON, WED, FRI], 60, 'beginner', []],
  ['02', 'de', 'strength', 'gym', [MON, TUE, THU, FRI], 75, 'intermediate', []],
  [
    '03',
    'de',
    'strength_hypertrophy',
    'gym',
    [MON, TUE, WED, THU, FRI],
    60,
    'advanced',
    ['chest', 'side_delts'],
  ],
  [
    '04',
    'en',
    'hypertrophy',
    'gym',
    [MON, TUE, WED, THU, FRI, SAT],
    45,
    'advanced',
    ['glutes', 'hamstrings'],
  ],
  ['05', 'en', 'hypertrophy', 'home', [TUE, THU, SAT], 45, 'beginner', []],
  ['06', 'de', 'strength', 'home', [SAT, SUN], 90, 'intermediate', []],
  ['07', 'de', 'hypertrophy', 'bodyweight', [MON, WED, FRI], 30, 'none', []],
  ['08', 'pt-PT', 'strength_hypertrophy', 'bodyweight', [MON, TUE, THU, FRI], 40, 'beginner', []],
  ['09', 'pt-BR', 'hypertrophy', 'gym', [WED], 90, 'intermediate', []],
  ['10', 'de', 'hypertrophy', 'gym', [TUE, FRI], 30, 'none', ['biceps', 'triceps']],
  ['11', 'en', 'strength', 'gym', [MON, TUE, WED], 60, 'advanced', []],
  ['12', 'de', 'hypertrophy', 'gym', [MON, TUE, WED, THU, FRI, SAT, SUN], 30, 'advanced', []],
  [
    '13',
    'de',
    'hypertrophy',
    'gym',
    [MON, TUE, THU, FRI],
    120,
    'intermediate',
    ['lats', 'upper_back'],
  ],
  [
    '14',
    'pt-BR',
    'strength_hypertrophy',
    'home',
    [MON, TUE, WED, THU, FRI],
    20,
    'intermediate',
    ['abs'],
  ],
  ['15', 'de', 'hypertrophy', 'gym', [MON, WED, FRI], 60, null, ['quads']],
].map(([id, language, goal, equipment, trainingDays, sessionMinutes, experience, focus]) => ({
  id,
  language,
  answers: { goal, focus, equipment, trainingDays, sessionMinutes, experience },
}));

// ---------- the rules ----------

/** Equipment each answer allows, and exercises that work without theirs (as generate.ts). */
const EQUIPMENT = {
  gym: ['barbell', 'dumbbell', 'kettlebell', 'machine', 'cable', 'bodyweight'],
  home: ['barbell', 'dumbbell', 'kettlebell', 'bodyweight'],
  bodyweight: ['bodyweight'],
};
const ALSO_AT = { home: ['calf-raise'], bodyweight: ['lunge', 'calf-raise'] };

/** The app's session estimate (estimateMinutes): set-up per exercise, per set its work and rest. */
const minutesOf = (day) =>
  day.exercises.reduce((s, e) => s + 150 + e.sets.length * (45 + (e.restSeconds ?? 90)), 0) / 60;

/** Each is trained at least once a week, on two days with three or more. */
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

const isTimed = (row) => row?.measures?.includes('seconds');

/** Weekly sets per muscle, each set counted by the muscle's share in it. */
function weeklySets(plan, catalog) {
  const sets = {};
  for (const day of plan.days) {
    for (const e of day.exercises) {
      for (const [muscle, share] of Object.entries(catalog.get(e.exerciseId)?.muscles ?? {})) {
        sets[muscle] = (sets[muscle] ?? 0) + e.sets.length * share;
      }
    }
  }
  return sets;
}

const sum = (sets, muscles) => muscles.reduce((n, m) => n + (sets[m] ?? 0), 0);
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
};

/** Each check: null when it doesn't apply, else the problems found (none: passed). */
const CHECKS = {
  days: ({ answers }, plan) => {
    const got = plan.days.map((d) => d.weekday);
    return got.join() === answers.trainingDays.join()
      ? []
      : [`days on ${got.join(', ')} instead of ${answers.trainingDays.join(', ')}`];
  },
  time: ({ answers }, plan) =>
    plan.days.flatMap((d) => {
      const minutes = minutesOf(d);
      if (minutes > answers.sessionMinutes * 1.1)
        return [`${d.name}: ${Math.round(minutes)} min, more than ${answers.sessionMinutes}`];
      // A day that leaves a third of the time unused, unless it is already full.
      if (minutes < answers.sessionMinutes * 0.67 && d.exercises.length < 10)
        return [`${d.name}: only ${Math.round(minutes)} of ${answers.sessionMinutes} min`];
      return [];
    }),
  equipment: ({ answers }, plan, catalog) =>
    plan.days.flatMap((d) =>
      d.exercises
        .filter((e) => {
          const row = catalog.get(e.exerciseId);
          return (
            !row ||
            row.cardio ||
            !(
              EQUIPMENT[answers.equipment].includes(row.equipment) ||
              ALSO_AT[answers.equipment]?.includes(row.id)
            )
          );
        })
        .map((e) => `${d.name}: ${e.exerciseId} (${catalog.get(e.exerciseId)?.equipment})`),
    ),
  unique: (_, plan) =>
    plan.days.flatMap((d) => {
      const ids = d.exercises.map((e) => e.exerciseId);
      return ids.filter((id, i) => ids.indexOf(id) !== i).map((id) => `${d.name}: ${id} twice`);
    }),
  muscles: ({ answers }, plan, catalog) => {
    const days = answers.trainingDays.length;
    const want = days >= 3 ? 2 : 1;
    return Object.entries(GROUPS).flatMap(([group, muscles]) => {
      const on = plan.days.filter((d) =>
        d.exercises.some((e) =>
          muscles.some((m) => (catalog.get(e.exerciseId)?.muscles?.[m] ?? 0) >= MAIN_SHARE),
        ),
      ).length;
      return on >= want ? [] : [`${group} on ${on} day(s), want ${want}`];
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
    plan.days.flatMap((d) => {
      const lifts = d.exercises.filter((e) => !isTimed(catalog.get(e.exerciseId)));
      const problems = [];
      const [first] = lifts;
      // The day's first lift is the heavy one.
      const heavy = { strength: 6, strength_hypertrophy: 8 }[answers.goal];
      if (heavy && first && first.sets[0].targetMax > heavy)
        problems.push(`${d.name}: starts with ${first.sets[0].targetMax} reps`);
      for (const e of lifts) {
        const { targetMin: min, targetMax: max, rir } = e.sets[0];
        if (min < 3 || max > 20) problems.push(`${d.name}: ${e.exerciseId} ${min}–${max} reps`);
        if (rir == null) problems.push(`${d.name}: ${e.exerciseId} without RIR`);
      }
      return problems;
    }),
  experience: ({ answers }, plan) => {
    if (answers.experience && !['none', 'beginner'].includes(answers.experience)) return null;
    return plan.days.flatMap((d) => [
      ...(d.exercises.length > 6 ? [`${d.name}: ${d.exercises.length} exercises`] : []),
      ...d.exercises
        .filter((e) => e.sets.length > 3)
        .map((e) => `${d.name}: ${e.exerciseId} ${e.sets.length} sets`),
    ]);
  },
};

// ---------- runs ----------

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function describePlan(plan, catalog, language) {
  const lines = [plan.name];
  for (const day of plan.days) {
    lines.push(`  ${day.name} · ${WEEKDAYS[day.weekday]} · ~${Math.round(minutesOf(day))} min`);
    for (const e of day.exercises) {
      const row = catalog.get(e.exerciseId);
      const { targetMin: min, targetMax: max, rir } = e.sets[0];
      const target = (min === max ? `${min}` : `${min}–${max}`) + (isTimed(row) ? ' s' : '');
      const name = row?.name?.[language] ?? row?.name?.en ?? e.exerciseId;
      lines.push(
        `    ${name}  ${e.sets.length} × ${target}${rir != null ? `  RIR ${rir}` : ''}  rest ${e.restSeconds} s`,
      );
    }
  }
  return lines.join('\n');
}

const describeAnswers = ({ goal, equipment, trainingDays, sessionMinutes, experience, focus }) =>
  `${goal}, ${equipment}, ${trainingDays.map((d) => WEEKDAYS[d]).join('/')}, ${sessionMinutes} min, ` +
  `${experience ?? 'experience unknown'}${focus.length ? `, focus ${focus.join(' + ')}` : ''}`;

/** One plan; null once the limit is reached or the function doesn't answer. */
async function generate(profile) {
  if (stopped) return null;
  const result = await streamPlan(`${SUPABASE_URL}/functions/v1/generate-plan`, KEY, {
    answers: profile.answers,
    language: profile.language,
  });
  if (result.status === 429) stopped = { limit: true };
  else if (result.status === 503 || result.status === 0) {
    stopped = { down: `${result.status || 'no connection'} ${result.error}`.trim() };
  } else return result;
  return null;
}

/** After a run: what wasn't sent and why, and what to do about it. */
function reportStop(skipped) {
  if (!stopped) return '';
  const notRun = skipped.length ? `; not run: ${skipped.join(', ')}` : '';
  const text = stopped.limit
    ? `The plan limit was reached${notRun}. For a local run set PLAN_GENERATE_IP_LIMIT=1000 in ` +
      'supabase/functions/.env and restart Supabase (npx supabase stop, then npx supabase ' +
      'start). To reset the count right away, run `delete from public.plan_requests where kind = ' +
      "'generate';` in Supabase Studio."
    : `generate-plan didn't answer (${stopped.down})${notRun}. Locally, npx supabase start ` +
      'serves the functions. A BOOT_ERROR means the function did not start: keep ' +
      '`npx supabase functions serve` running in another terminal to see why.';
  console.error(`\n${text}`);
  return text;
}

const timing = ({ first, seconds }) =>
  `${first == null ? '–' : `${first.toFixed(1)} s`} / ${seconds.toFixed(1)} s`;

const catalog = await loadCatalog(SUPABASE_URL, KEY, 'id,name,measures,equipment,muscles,cardio');
if (!catalog.size) process.exit(1);
const args = process.argv.slice(2);
const profiles = args.length ? PROFILES.filter((p) => args.includes(p.id)) : PROFILES;
const names = Object.keys(CHECKS);
console.log(`${profiles.length} plans from ${SUPABASE_URL}, ${PARALLEL} at a time …\n`);

const results = await pool(
  profiles,
  async (profile) => {
    const result = await generate(profile);
    if (!result) return null;
    const checks = result.plan
      ? Object.fromEntries(names.map((n) => [n, CHECKS[n](profile, result.plan, catalog)]))
      : null;
    const passed = !!checks && Object.values(checks).every((c) => !c?.length);
    console.log(`${passed ? 'PASS' : 'FAIL'}  ${profile.id}  ${timing(result)}`);
    return { profile, result, checks, passed };
  },
  PARALLEL,
  () => !!stopped,
);
const stopNote = reportStop(
  profiles.filter((p) => !results.some((r) => r.profile === p)).map((p) => p.id),
);
if (!results.length) process.exit(1);

const cell = (check) => (check == null ? '–' : check.length ? `✗ ${check.length}` : '✓');
const header = `| profile | first exercise / all | ${names.join(' | ')} | |`;
const rows = results.map(
  ({ profile, result, checks, passed }) =>
    `| ${profile.id} | ${timing(result)} | ${names.map((n) => (checks ? cell(checks[n]) : '✗')).join(' | ')} | ${passed ? 'PASS' : 'FAIL'} |`,
);
const passes = (n) => {
  const applied = results.filter((r) => !r.checks || r.checks[n] != null);
  return `${applied.filter((r) => r.checks && !r.checks[n].length).length}/${applied.length}`;
};
const firsts = results.map((r) => r.result.first).filter((f) => f != null);
const totals = `| **all** | median first ${firsts.length ? `${median(firsts).toFixed(1)} s` : '–'} | ${names.map(passes).join(' | ')} | ${results.filter((r) => r.passed).length}/${results.length} |`;
const table = [header, `|${' --- |'.repeat(names.length + 3)}`, ...rows, totals].join('\n');
const details = results
  .map(({ profile, result, checks }) => {
    const plan = result.plan
      ? describePlan(result.plan, catalog, profile.language)
      : `(${result.status} ${result.error ?? ''})`;
    const issues = checks
      ? Object.entries(checks).flatMap(([n, c]) => (c ?? []).map((i) => `- ${n}: ${i}`))
      : ['- no plan'];
    return `## ${profile.id}\n\n${describeAnswers(profile.answers)}; app language ${profile.language}.\n\nIssues:\n${issues.join('\n') || '- none'}\n\n\`\`\`\n${plan}\n\`\`\``;
  })
  .join('\n\n');

console.log(`\n${table}`);
for (const { profile, checks } of results) {
  const issues = Object.entries(checks ?? {}).flatMap(([n, c]) =>
    (c ?? []).map((i) => `${n}: ${i}`),
  );
  if (issues.length) console.log(`\n${profile.id}\n${issues.map((i) => `  - ${i}`).join('\n')}`);
}
const out = join(HERE, 'out', new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19));
mkdirSync(out, { recursive: true });
writeFileSync(
  join(out, 'report.md'),
  `# Plan generation test\n\n${stopNote && `${stopNote}\n\n`}${table}\n\n${details}\n`,
);
writeFileSync(join(out, 'results.json'), JSON.stringify(results, null, 2));
console.log(`\nReport: ${join(out, 'report.md')}`);
