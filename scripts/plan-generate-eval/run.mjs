// Tests the plan generation (the generate-plan Edge Function) with 16 sets of onboarding answers
// and checks each plan it makes: a routine per workout a week, sessions that fit the chosen length,
// only exercises the equipment allows, no exercise twice a routine, every major muscle group trained,
// pushing and pulling about even, focus muscles trained more, sets and reps that suit the goal and
// the experience, core work only where the goal or focus asks for it and no timed holds. The checks are rules of thumb; read the plans in the report as well.
//
// Needs the function with an OpenAI key at EXPO_PUBLIC_SUPABASE_URL from .env: locally
// `npm run supabase:start`, which serves it with supabase/functions/.env (one run is 16 plans, so
// set PLAN_GENERATE_IP_LIMIT=1000 there first, then restart Supabase), or the deployed project.
// Usage: npm run plan:generate-eval                    all profiles
//        npm run plan:generate-eval -- 03 11           only these
//        npm run plan:generate-eval -- --repeat 3      each profile 3 times (the model varies)
// Reports, the raw answers and a summary go to scripts/plan-generate-eval/out/; compare two runs
// with npm run plan:generate-compare.
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  loadCatalog,
  pool,
  streamPlan,
  supabaseEnv,
  timing,
  untilStopped,
} from '../plan-functions.mjs';

const HERE = import.meta.dirname;
const PARALLEL = 3;
const { url: SUPABASE_URL, key: KEY } = supabaseEnv();
/** One plan; null once the limit is reached or the function doesn't answer. */
const requests = untilStopped((body) =>
  streamPlan(`${SUPABASE_URL}/functions/v1/generate-plan`, KEY, body),
);

/** What the home profiles ticked: a small corner, a home gym, a kettlebell and a bar. */
const HOME_EQUIPMENT = {
  '05': ['dumbbell', 'bench'],
  '06': ['barbell', 'rack', 'bench', 'dumbbell', 'pull-up-bar', 'cable'],
  14: ['kettlebell', 'pull-up-bar'],
};

/** Answers as the app sends them, across goals, equipment, workouts a week, lengths and experience. */
const PROFILES = [
  ['01', 'de', 'hypertrophy', 'gym', 3, 60, 'beginner', []],
  ['02', 'de', 'strength', 'gym', 4, 75, 'intermediate', []],
  ['03', 'de', 'strength_hypertrophy', 'gym', 5, 60, 'advanced', ['chest', 'side_delts']],
  ['04', 'en', 'hypertrophy', 'gym', 6, 45, 'advanced', ['glutes', 'hamstrings']],
  ['05', 'en', 'hypertrophy', 'home', 3, 45, 'beginner', []],
  ['06', 'de', 'strength', 'home', 2, 90, 'intermediate', []],
  ['07', 'de', 'hypertrophy', 'bodyweight', 3, 30, 'none', []],
  ['08', 'pt-PT', 'strength_hypertrophy', 'bodyweight', 4, 40, 'beginner', []],
  ['09', 'pt-BR', 'hypertrophy', 'gym', 1, 90, 'intermediate', []],
  ['10', 'de', 'hypertrophy', 'gym', 2, 30, 'none', ['biceps', 'triceps']],
  ['11', 'en', 'strength', 'gym', 3, 60, 'advanced', []],
  ['12', 'de', 'hypertrophy', 'gym', 7, 30, 'advanced', []],
  ['13', 'de', 'hypertrophy', 'gym', 4, 120, 'intermediate', ['lats', 'upper_back']],
  ['14', 'pt-BR', 'strength_hypertrophy', 'home', 5, 20, 'intermediate', ['abs']],
  ['15', 'de', 'hypertrophy', 'gym', 3, 60, null, ['quads']],
  ['16', 'de', 'hypertrophy', 'gym', 4, 60, 'intermediate', []],
].map(([id, language, goal, equipment, sessionsPerWeek, sessionMinutes, experience, focus]) => ({
  id,
  language,
  answers: {
    goal,
    focus,
    equipment,
    homeEquipment: HOME_EQUIPMENT[id] ?? [],
    sessionsPerWeek,
    sessionMinutes,
    experience,
  },
}));

// ---------- the rules ----------

/** The user's equipment: a full gym's, the ticked items at home, none on the floor. */
const equipmentOf = ({ equipment, homeEquipment }) =>
  new Set(
    equipment === 'gym'
      ? [...EQUIPMENT.values()].filter((e) => e.in_gym).map((e) => e.id)
      : homeEquipment.filter((id) => EQUIPMENT.has(id)),
  );

/** An exercise fits when each of its needs is met by one of the user's items. */
const fits = (needs, have) => needs.every((items) => items.some((id) => have.has(id)));

/** The app's session estimate (estimateMinutes): set-up per exercise, per set its work and rest. */
const minutesOf = (routine) =>
  routine.exercises.reduce((s, e) => s + 150 + e.sets.length * (45 + (e.restSeconds ?? 90)), 0) /
  60;

/** Each is trained at least once a week, in two routines with three or more. */
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
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
};

/** Each check: null when it doesn't apply, else the problems found (none: passed). */
const CHECKS = {
  routines: ({ answers }, plan) =>
    plan.routines.length === answers.sessionsPerWeek
      ? []
      : [`${plan.routines.length} routines for ${answers.sessionsPerWeek} workouts a week`],
  time: ({ answers }, plan) =>
    plan.routines.flatMap((r) => {
      const minutes = minutesOf(r);
      if (minutes > answers.sessionMinutes * 1.1)
        return [`${r.name}: ${Math.round(minutes)} min, more than ${answers.sessionMinutes}`];
      // A routine that leaves a third of the time unused, unless it is already full.
      if (minutes < answers.sessionMinutes * 0.67 && r.exercises.length < 10)
        return [`${r.name}: only ${Math.round(minutes)} of ${answers.sessionMinutes} min`];
      return [];
    }),
  equipment: ({ answers }, plan, catalog) => {
    const have = equipmentOf(answers);
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
    const want = answers.sessionsPerWeek >= 3 ? 2 : 1;
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

// ---------- runs ----------

function describePlan(plan, catalog, language) {
  const lines = [plan.name];
  for (const routine of plan.routines) {
    lines.push(`  ${routine.name} · ~${Math.round(minutesOf(routine))} min`);
    for (const e of routine.exercises) {
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

const describeAnswers = ({
  goal,
  equipment,
  homeEquipment,
  sessionsPerWeek,
  sessionMinutes,
  experience,
  focus,
}) =>
  `${goal}, ${equipment}${homeEquipment.length ? ` (${homeEquipment.join(', ')})` : ''}, ${sessionsPerWeek}× a week, ${sessionMinutes} min, ` +
  `${experience ?? 'experience unknown'}${focus.length ? `, focus ${focus.join(' + ')}` : ''}`;

/** After a run: what wasn't sent and why, and what to do about it. */
function reportStop(skipped) {
  const stopped = requests.stopped();
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

const catalog = await loadCatalog(
  SUPABASE_URL,
  KEY,
  'exercises',
  'id,name,measures,needs,muscles,cardio',
);
const EQUIPMENT = await loadCatalog(SUPABASE_URL, KEY, 'equipment', 'id,in_gym,is_active');
for (const [id, e] of EQUIPMENT) if (!e.is_active) EQUIPMENT.delete(id);
if (!catalog.size || !EQUIPMENT.size) process.exit(1);
const args = process.argv.slice(2);
const repeatAt = args.findIndex((a) => a.startsWith('--repeat'));
const REPEAT =
  repeatAt < 0
    ? 1
    : Math.max(1, Number(args[repeatAt].split('=')[1] ?? args.splice(repeatAt + 1, 1)[0]) || 1);
const ids = args.filter((a) => !a.startsWith('--'));
const profiles = ids.length ? PROFILES.filter((p) => ids.includes(p.id)) : PROFILES;
const jobs = profiles.flatMap((profile) =>
  Array.from({ length: REPEAT }, (_, i) => ({ profile, run: i + 1 })),
);
const names = Object.keys(CHECKS);
/** "01" or, with repeats, "01 #2". */
const label = ({ profile, run }) => (REPEAT > 1 ? `${profile.id} #${run}` : profile.id);
console.log(
  `${jobs.length} plans (${profiles.length} profiles × ${REPEAT}) from ${SUPABASE_URL}, ${PARALLEL} at a time …\n`,
);

const results = await pool(
  jobs,
  async (job) => {
    const { profile } = job;
    const result = await requests.send({ answers: profile.answers, language: profile.language });
    if (!result) return null;
    const checks = result.plan
      ? Object.fromEntries(names.map((n) => [n, CHECKS[n](profile, result.plan, catalog)]))
      : null;
    const passed = !!checks && Object.values(checks).every((c) => !c?.length);
    console.log(`${passed ? 'PASS' : 'FAIL'}  ${label(job)}  ${timing(result)}`);
    return { ...job, result, checks, passed };
  },
  PARALLEL,
  () => !!requests.stopped(),
);
const stopNote = reportStop(
  profiles.filter((p) => !results.some((r) => r.profile === p)).map((p) => p.id),
);
if (!results.length) process.exit(1);

/** How often a check passed in these results, of the runs it applied to (a run without a plan fails). */
function tally(list, name) {
  const applied = list.filter((r) => !r.checks || r.checks[name] != null);
  return {
    passed: applied.filter((r) => r.checks && !r.checks[name].length).length,
    applied: applied.length,
  };
}
const fraction = ({ passed, applied }) => `${passed}/${applied}`;
const runsOf = (profile) => results.filter((r) => r.profile === profile);
/** One run: ✓ or the number of issues; several: ✓ when every run passed, else how many did. */
function cell(runs, name) {
  const t = tally(runs, name);
  if (!t.applied) return '–';
  if (runs.length === 1) return t.passed ? '✓' : `✗ ${runs[0].checks?.[name]?.length ?? 1}`;
  return t.passed === t.applied ? '✓' : `✗ ${fraction(t)}`;
}
const firstOf = (runs) => median(runs.map((r) => r.result.first).filter((f) => f != null));
const ran = profiles.filter((p) => runsOf(p).length);
const header = `| profile | first exercise (median) | ${names.join(' | ')} | passed |`;
const rows = ran.map((p) => {
  const runs = runsOf(p);
  const passed = runs.filter((r) => r.passed).length;
  const verdict = runs.length === 1 ? (passed ? 'PASS' : 'FAIL') : `${passed}/${runs.length}`;
  return `| ${p.id} | ${firstOf(runs).toFixed(1)} s | ${names.map((n) => cell(runs, n)).join(' | ')} | ${verdict} |`;
});
const totals = `| **all** | ${firstOf(results).toFixed(1)} s | ${names.map((n) => fraction(tally(results, n))).join(' | ')} | ${results.filter((r) => r.passed).length}/${results.length} |`;
const table = [header, `|${' --- |'.repeat(names.length + 3)}`, ...rows, totals].join('\n');
const details = results
  .map((r) => {
    const { profile, result, checks } = r;
    const plan = result.plan
      ? describePlan(result.plan, catalog, profile.language)
      : `(${result.status} ${result.error ?? ''})`;
    const issues = checks
      ? Object.entries(checks).flatMap(([n, c]) => (c ?? []).map((i) => `- ${n}: ${i}`))
      : ['- no plan'];
    return `## ${label(r)}\n\n${describeAnswers(profile.answers)}; app language ${profile.language}; ${timing(result)}.\n\nIssues:\n${issues.join('\n') || '- none'}\n\n\`\`\`\n${plan}\n\`\`\``;
  })
  .join('\n\n');

console.log(`\n${table}`);
for (const r of results) {
  const issues = Object.entries(r.checks ?? {}).flatMap(([n, c]) =>
    (c ?? []).map((i) => `${n}: ${i}`),
  );
  if (issues.length) console.log(`\n${label(r)}\n${issues.map((i) => `  - ${i}`).join('\n')}`);
}

/** The commit the function code is at, and whether it has changes on top. */
function codeVersion() {
  try {
    const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const changed = execSync('git status --porcelain -- supabase/functions', { encoding: 'utf8' });
    return { commit, changed: !!changed.trim() };
  } catch {
    return { commit: null, changed: null };
  }
}
const summary = {
  at: new Date().toISOString(),
  ...codeVersion(),
  repeat: REPEAT,
  plans: { passed: results.filter((r) => r.passed).length, total: results.length },
  firstSeconds: firstOf(results),
  checks: Object.fromEntries(names.map((n) => [n, tally(results, n)])),
  profiles: Object.fromEntries(
    ran.map((p) => [p.id, Object.fromEntries(names.map((n) => [n, tally(runsOf(p), n)]))]),
  ),
};
const out = join(HERE, 'out', summary.at.replace(/[:.]/g, '-').slice(0, 19));
mkdirSync(out, { recursive: true });
writeFileSync(
  join(out, 'report.md'),
  `# Plan generation test\n\n${stopNote && `${stopNote}\n\n`}${table}\n\n${details}\n`,
);
writeFileSync(join(out, 'results.json'), JSON.stringify(results, null, 2));
writeFileSync(join(out, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(`\nReport: ${join(out, 'report.md')}`);
