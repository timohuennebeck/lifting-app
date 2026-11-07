// Tests the plan generation (the generate-plan Edge Function) with 20 sets of onboarding answers
// and checks each plan it makes: a routine per workout a week, sessions that fit the chosen length,
// only exercises the equipment allows, no exercise twice a routine, every major muscle group trained,
// pushing and pulling about even, focus muscles trained more, sets and reps that suit the goal and
// the experience, core work only where the goal or focus asks for it and no timed holds. The checks are rules of thumb; read the plans in the report as well.
//
// Needs the function with an OpenAI key at EXPO_PUBLIC_SUPABASE_URL from .env.local: locally
// `npm run supabase:start`, which serves it with supabase/functions/.env (one run is 20 plans, so
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
  failure,
  loadCatalog,
  pool,
  reportStop,
  streamPlan,
  supabaseEnv,
  timing,
  untilStopped,
} from '../plan-functions.mjs';
import { CHECKS, isTimed, median, minutesOf, PROFILES, restOf } from './checks.mjs';

const HERE = import.meta.dirname;
const PARALLEL = 3;
const { url: SUPABASE_URL, key: KEY } = supabaseEnv();
/** One plan; null once the limit is reached or the function doesn't answer. */
const requests = untilStopped((body) =>
  streamPlan(`${SUPABASE_URL}/functions/v1/generate-plan`, KEY, body),
);

// ---------- runs ----------

function describePlan(plan, catalog, language) {
  const lines = [plan.name];
  for (const routine of plan.routines) {
    lines.push(`  ${routine.name} · ~${Math.round(minutesOf(routine, catalog))} min`);
    for (const e of routine.exercises) {
      const row = catalog.get(e.exerciseId);
      const { targetMin: min, targetMax: max, rir } = e.sets[0];
      const target = (min === max ? `${min}` : `${min}–${max}`) + (isTimed(row) ? ' s' : '');
      const name = row?.name?.[language] ?? row?.name?.en ?? e.exerciseId;
      lines.push(
        `    ${name}  ${e.sets.length} × ${target}${rir != null ? `  RIR ${rir}` : ''}  rest ${e.restSeconds ?? restOf(row, e.sets[0])} s`,
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
  split,
  sessionMinutes,
  experience,
  focus,
}) =>
  `${goal}, ${equipment}${homeEquipment.length ? ` (${homeEquipment.join(', ')})` : ''}, ${sessionsPerWeek}× a week ${split}, ${sessionMinutes} min, ` +
  `${experience ?? 'experience unknown'}${focus.length ? `, focus ${focus.join(' + ')}` : ''}`;

const catalog = await loadCatalog(
  SUPABASE_URL,
  KEY,
  'exercises',
  'id,name,measures,needs,muscles,cardio,rest_seconds',
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
      ? Object.fromEntries(
          names.map((n) => [n, CHECKS[n](profile, result.plan, catalog, EQUIPMENT)]),
        )
      : null;
    const passed = !!checks && Object.values(checks).every((c) => !c?.length);
    console.log(`${passed ? 'PASS' : 'FAIL'}  ${label(job)}  ${timing(result)}${failure(result)}`);
    return { ...job, result, checks, passed };
  },
  PARALLEL,
  () => !!requests.stopped(),
);
const stopNote = reportStop(
  requests.stopped(),
  profiles.filter((p) => !results.some((r) => r.profile === p)).map((p) => p.id),
  { fn: 'generate-plan', what: 'plan', kind: 'generate', limit: 'PLAN_GENERATE_IP_LIMIT' },
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
