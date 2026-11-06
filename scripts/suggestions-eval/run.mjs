// Measures the set suggestions (src/features/workout/lib/suggestion-rules.ts, weighted
// exercises) on simulated lifters: each set suggested is scored against the lifter's true
// strength, and every suggestion is checked against the hard rules in checks.mjs. Runs the app's
// own rules and weight steps, as set-suggestions.ts calls them; nothing is mocked.
//
// Usage: npm run suggestions:eval                       every world, 1,000 lifters each
//        npm run suggestions:eval -- --lifters 5000     more lifters (slower, steadier numbers)
//        npm run suggestions:eval -- --worlds base,norir
// On target: the suggested reps leave the target RIR ±1. Best possible: knowing the lifter's
// true strength, but not the day's form. Exits with 1 when a hard rule breaks.
import { register } from 'node:module';
import { parseArgs } from 'node:util';

import { breaks, RULES } from './checks.mjs';
import { makeLifter, random, simulate, WORLDS } from './lifters.mjs';

register('./loader.mjs', import.meta.url);
const { adaptSets, planSets } = await import('../../src/features/workout/lib/suggestion-rules.ts');
const { lightestWeight, roundedStep, weightStep } =
  await import('../../src/features/workout/lib/weight-step.ts');

const { values } = parseArgs({
  options: { lifters: { type: 'string', default: '1000' }, worlds: { type: 'string' } },
});
const LIFTERS = Number(values.lifters);
const worlds = values.worlds ? values.worlds.split(',') : Object.keys(WORLDS);
const unknown = worlds.filter((w) => !WORLDS[w]);
if (unknown.length) throw new Error(`Unknown worlds ${unknown}; known: ${Object.keys(WORLDS)}`);

const broken = Object.fromEntries(RULES.map((rule) => [rule, 0]));
const examples = [];
let calls = 0;

/** The app's suggestions for a lifter's workout so far, checked against the hard rules. */
function suggest({ lifter, targets, history, days, done }) {
  const logged = [...history.flat(), ...done.filter(Boolean)];
  const step = weightStep(
    lifter.equipment,
    logged.map((s) => s.weight),
    logged[0]?.weight ?? null,
    lifter.units,
  );
  // Today's sets count as weights the gym has; the app stores their suggestion only once logged.
  const rounding = [
    ...history.flat().map((s) => ({ weight: s.weight, suggested: s.suggested?.weight ?? null })),
    ...done.filter(Boolean).map((s) => ({ weight: s.weight, suggested: null })),
  ];
  const ex = {
    kind: 'load',
    step: roundedStep(step, rounding, lifter.units),
    floor: lightestWeight(lifter.equipment, lifter.units),
  };
  const planned = planSets(ex, targets, history, days);
  const out = adaptSets(ex, targets, planned, done, history);
  const i = done.findIndex((d) => d == null) - 1;
  const earlier = done.map((d, j) => (j < i ? d : null));
  const before = i >= 0 ? adaptSets(ex, targets, planned, earlier, history) : null;
  calls += 1;
  for (const rule of breaks({ ex, targets, history, done, out, planned, before })) {
    broken[rule] += 1;
    // Copied now: the simulator fills `done` in as the workout goes on.
    const example = { targets, history: history.slice(0, 2), done, planned, out };
    if (examples.length < 10) examples.push(`${rule}\n${JSON.stringify(example)}`);
  }
  return out;
}

const pct = (a, b) => `${((100 * a) / b).toFixed(1)} %`;
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const rows = [];
for (const world of worlds) {
  const totals = { app: [], best: [] };
  for (let i = 0; i < LIFTERS; i++) {
    const lifter = makeLifter(random(1000 + i), world);
    totals.app.push(simulate(lifter, 77 + i, suggest, lightestWeight));
    totals.best.push(simulate(lifter, 77 + i, null, lightestWeight));
  }
  const sum = (scores, key) => scores.reduce((a, s) => a + s[key], 0);
  const of = (scores) => {
    const settled = scores.map((s) => (s.settledAt < 0 ? Infinity : s.settledAt));
    return {
      on: pct(sum(scores, 'on'), sum(scores, 'n')),
      fail: pct(sum(scores, 'fail'), sum(scores, 'n')),
      wayEasy: pct(sum(scores, 'wayEasy'), sum(scores, 'n')),
      never: pct(settled.filter((s) => s === Infinity).length, scores.length),
      settles: median(settled),
    };
  };
  rows.push({ world, app: of(totals.app), best: of(totals.best) });
}

const header =
  '| World | On target (best possible) | Can’t do the reps | Far too easy | Never settles | Workouts to settle |';
console.log(
  `\n${LIFTERS} lifters per world, 30 workouts each\n\n${header}\n|---|---|---|---|---|---|`,
);
for (const { world, app, best } of rows) {
  const settles = Number.isFinite(app.settles) ? app.settles : '—';
  console.log(
    `| ${WORLDS[world]} | ${app.on} (${best.on}) | ${app.fail} | ${app.wayEasy} | ${app.never} | ${settles} |`,
  );
}
console.log(`\nHard rules, ${calls} suggestions checked:`);
for (const rule of RULES) console.log(`${String(broken[rule]).padStart(6)}  ${rule}`);
for (const example of examples) console.log(`\n${example}`);
if (Object.values(broken).some(Boolean)) process.exit(1);
