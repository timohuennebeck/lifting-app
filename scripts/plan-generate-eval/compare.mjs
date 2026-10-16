// Compares two runs of the plan generation test (run.mjs): how often each check passed before and
// after, overall and per profile, so a prompt change shows whether it helped. The model varies
// from run to run, so compare runs made with --repeat 3 or more; a change of a few percent is noise.
// Usage: npm run plan:generate-compare                  the last two runs
//        npm run plan:generate-compare -- <dir> <dir>   these two (older first), e.g. out/2026-…
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(import.meta.dirname, 'out');

const runs = (
  process.argv.slice(2).length
    ? process.argv.slice(2)
    : readdirSync(OUT)
        .filter((d) => existsSync(join(OUT, d, 'summary.json')))
        .sort()
        .slice(-2)
).map((dir) => {
  const path = existsSync(join(dir, 'summary.json')) ? dir : join(OUT, dir);
  return { dir: path, ...JSON.parse(readFileSync(join(path, 'summary.json'), 'utf8')) };
});
if (runs.length !== 2) {
  console.error('Needs two runs with a summary.json: run npm run plan:generate-eval twice first.');
  process.exit(1);
}
const [before, after] = runs;

const rate = (t) => (t?.applied ? t.passed / t.applied : null);
const show = (t) =>
  t?.applied ? `${t.passed}/${t.applied} (${Math.round(rate(t) * 100)} %)` : '–';
function change(a, b) {
  if (rate(a) == null || rate(b) == null) return '';
  const points = Math.round((rate(b) - rate(a)) * 100);
  if (!points) return '=';
  return `${points > 0 ? '+' : ''}${points} ${points > 0 ? '▲' : '▼'}`;
}
const version = (r) =>
  `${r.at.slice(0, 16)} · ${r.commit ?? '?'}${r.changed ? ' + changes' : ''} · ×${r.repeat}`;

console.log(`before: ${version(before)}\nafter:  ${version(after)}\n`);
const names = [...new Set([...Object.keys(before.checks), ...Object.keys(after.checks)])];
const plans = (r) => ({ passed: r.plans.passed, applied: r.plans.total });
console.log('| check | before | after | change |\n| --- | --- | --- | --- |');
for (const n of names) {
  console.log(
    `| ${n} | ${show(before.checks[n])} | ${show(after.checks[n])} | ${change(before.checks[n], after.checks[n])} |`,
  );
}
console.log(
  `| **plans passed** | ${show(plans(before))} | ${show(plans(after))} | ${change(plans(before), plans(after))} |`,
);
console.log(
  `| first exercise | ${before.firstSeconds.toFixed(1)} s | ${after.firstSeconds.toFixed(1)} s | |`,
);

// Per profile, only the checks whose pass rate moved.
const moved = Object.keys({ ...before.profiles, ...after.profiles })
  .sort()
  .flatMap((id) =>
    names
      .filter((n) => {
        const [a, b] = [rate(before.profiles[id]?.[n]), rate(after.profiles[id]?.[n])];
        return a != null && b != null && a !== b;
      })
      .map((n) => `  ${id} ${n}: ${show(before.profiles[id][n])} → ${show(after.profiles[id][n])}`),
  );
console.log(moved.length ? `\nChanged per profile:\n${moved.join('\n')}` : '\nNo profile changed.');
if (before.repeat < 3 || after.repeat < 3) {
  console.log('\nWith fewer than 3 runs per profile this is mostly noise: run with -- --repeat 3.');
}
