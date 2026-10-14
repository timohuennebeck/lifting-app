// Tests the plan import (the read-plan Edge Function) with the plans in fixtures/ and scores
// what it read against cases.json: days, weekdays, exercises (catalog match or new), sets, reps,
// RIR and rest. With --dir it reads your own photos and files and prints what it found instead.
// The fixtures are made up: typed and spreadsheet plans, and handwriting, whiteboard and screenshot
// photos drawn with handwriting fonts, then tilted, shaded and blurred like phone photos.
//
// Needs the function with an OpenAI key at EXPO_PUBLIC_SUPABASE_URL from .env: locally
// `npm run supabase:start`, which serves it with supabase/functions/.env (one run is 15 imports, so
// set PLAN_IMPORT_IP_LIMIT=1000 there first, then restart Supabase), or the deployed project.
// Usage: npm run plan:eval                          all fixtures
//        npm run plan:eval -- 05 09                 only these cases
//        npm run plan:eval -- --dir ~/Desktop/plans [--lang de]
//          each image or file in the folder is one import; a subfolder of photos is one
//          multi-photo import. On macOS, photos are shrunk to JPEGs like the app does (sips).
// Reports and the raw answers go to scripts/plan-import-eval/out/.
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';

import { loadCatalog, pool, streamPlan } from '../plan-functions.mjs';

const HERE = import.meta.dirname;
const FIXTURES = join(HERE, 'fixtures');
const PARALLEL = 3;
/** Why no further imports are sent: the limit was reached, or the function doesn't answer. */
let stopped = null;
const { EXPO_PUBLIC_SUPABASE_URL: SUPABASE_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: KEY } =
  process.env;
if (!SUPABASE_URL || !KEY) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.');
  process.exit(1);
}

const MIME = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
};
const isImage = (path) => MIME[extname(path).toLowerCase()]?.startsWith('image/');

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};
const dir = option('--dir')?.replace(/^~(?=\/)/, homedir());
const dirLanguage = option('--lang') ?? 'de';

// ---------- requests ----------

const scratch = mkdtempSync(join(tmpdir(), 'plan-eval-'));

/**
 * A photo as the app sends it: a JPEG at most 2000 px on its longest side, as base64. Shrinking
 * uses macOS's sips (into a temporary copy); elsewhere photos must already be JPEGs.
 */
function photoBase64(path, shrink) {
  if (shrink && process.platform === 'darwin') {
    const info = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path], {
      encoding: 'utf8',
    });
    const side = Math.max(...[...info.matchAll(/pixel(?:Width|Height): (\d+)/g)].map((m) => +m[1]));
    const out = join(scratch, `${basename(path)}.jpg`);
    execFileSync(
      'sips',
      [
        '-s',
        'format',
        'jpeg',
        '-s',
        'formatOptions',
        '75',
        ...(side > 2000 ? ['-Z', '2000'] : []),
        path,
        '--out',
        out,
      ],
      { stdio: 'ignore' },
    );
    return readFileSync(out).toString('base64');
  }
  if (!/\.jpe?g$/i.test(path)) throw new Error(`${basename(path)}: convert it to JPEG first`);
  return readFileSync(path).toString('base64');
}

function requestBody({ files, as, language }, shrink) {
  if (as === 'photos') return { photos: files.map((f) => photoBase64(f, shrink)), language };
  const [path] = files;
  const mimeType = MIME[extname(path).toLowerCase()] ?? 'text/plain';
  if (mimeType.startsWith('image/')) {
    return {
      file: { name: basename(path), mimeType: 'image/jpeg', data: photoBase64(path, shrink) },
      language,
    };
  }
  return {
    file: { name: basename(path), mimeType, data: readFileSync(path).toString('base64') },
    language,
  };
}

/** One import, put together from the streamed events (see streamPlan). */
const read = (body) => streamPlan(`${SUPABASE_URL}/functions/v1/read-plan`, KEY, body);

// ---------- reading a plan ----------

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function nameOf(id, plan, names, language) {
  const created = plan?.newExercises?.find((e) => e.id === id);
  if (created) return `${created.name} (new)`;
  const name = names.get(id)?.name;
  return name?.[language] ?? name?.en ?? id;
}

const isTimed = (id, plan, names) =>
  (plan.newExercises.find((e) => e.id === id) ?? names.get(id))?.measures?.includes('seconds');

function target(set, timed) {
  if (!set) return '';
  const { targetMin: min, targetMax: max } = set;
  if (min == null && max == null) return 'max';
  return (min === max ? `${min}` : `${min}–${max}`) + (timed ? ' s' : '');
}

function describeExercise(e, plan, names, language) {
  const sets = e.sets;
  const rir = sets[0]?.rir != null ? `  RIR ${sets[0].rir}` : '';
  const rest = e.restSeconds != null ? `  rest ${e.restSeconds} s` : '';
  const review = e.raw
    ? `  ? read "${e.raw}"${e.alternatives?.length ? `, or: ${e.alternatives.map((a) => nameOf(a, plan, names, language)).join(', ')}` : ''}`
    : '';
  return `${nameOf(e.exerciseId, plan, names, language)}  ${sets.length} × ${target(sets[0], isTimed(e.exerciseId, plan, names))}${rir}${rest}${review}`;
}

function describePlan(plan, names, language) {
  const lines = [plan.name];
  for (const day of plan.days) {
    const when = day.weekday != null ? WEEKDAYS[day.weekday] : `no weekday ("${day.rawDay}")`;
    lines.push(`  ${day.name} · ${when}`);
    for (const e of day.exercises) lines.push(`    ${describeExercise(e, plan, names, language)}`);
  }
  return lines.join('\n');
}

// ---------- scoring ----------

const counter = () => ({ ok: 0, total: 0 });
const tally = (c, ok) => {
  c.total++;
  if (ok) c.ok++;
};

function sameTargets(expected, sets) {
  const first = sets[0] ?? {};
  if (expected.seconds != null) {
    return first.targetMin === expected.seconds && first.targetMax === expected.seconds;
  }
  if (expected.reps === 'none') return first.targetMin == null && first.targetMax == null;
  return first.targetMin === expected.reps[0] && first.targetMax === expected.reps[1];
}

const createdName = (plan, id) => plan.newExercises.find((e) => e.id === id)?.name ?? '';
const letters = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]/g, '');
const sameName = (a, b) => letters(a).slice(0, 5) === letters(b).slice(0, 5);

function score(expect, result, names, language) {
  const s = {
    days: counter(),
    weekdays: counter(),
    exercises: counter(),
    sets: counter(),
    reps: counter(),
    details: counter(),
    extra: 0,
    review: 0,
    issues: [],
  };
  const { plan } = result;
  if (expect.notAPlan) {
    tally(s.days, result.error === 'not_a_plan');
    if (!s.days.ok)
      s.issues.push(`expected "not a plan", got ${result.status} ${result.error ?? ''}`);
    return s;
  }
  if (!plan) {
    s.issues.push(`no plan: ${result.status} ${result.error ?? ''}`);
    for (const d of expect.days) {
      tally(s.days, false);
      d.exercises.forEach(() => tally(s.exercises, false));
    }
    return s;
  }
  const newIds = new Set(plan.newExercises.map((e) => e.id));
  const createdAs = new Map();
  const label = (e) => e.new ?? e.ex.join(' | ');
  if (plan.days.length !== expect.days.length) {
    s.issues.push(`${plan.days.length} days instead of ${expect.days.length}`);
  }
  plan.days.slice(expect.days.length).forEach((d) => (s.extra += d.exercises.length));

  expect.days.forEach((want, i) => {
    const got = plan.days[i];
    tally(s.days, !!got);
    if (!got) {
      want.exercises.forEach(() => tally(s.exercises, false));
      s.issues.push(`day ${i + 1} missing`);
      return;
    }
    tally(s.weekdays, (got.weekday ?? null) === want.weekday);
    if ((got.weekday ?? null) !== want.weekday) {
      s.issues.push(`day ${i + 1}: weekday ${got.weekday} instead of ${want.weekday}`);
    }
    const used = new Set();
    const missed = [];
    for (const [k, e] of want.exercises.entries()) {
      const free = got.exercises.map((a, j) => ({ a, j })).filter(({ j }) => !used.has(j));
      const isNew = ({ a }) => newIds.has(a.exerciseId);
      // A catalog exercise by id; a new one by its name, else the new one in the same place.
      const match =
        free.find(({ a }) => e.ex?.includes(a.exerciseId)) ??
        (e.new
          ? (free.find((f) => isNew(f) && sameName(createdName(plan, f.a.exerciseId), e.new)) ??
            free.find((f) => isNew(f) && f.j === k))
          : undefined);
      tally(s.exercises, !!match);
      if (!match) {
        missed.push(e);
        continue;
      }
      used.add(match.j);
      const { a } = match;
      if (e.new && newIds.has(a.exerciseId)) {
        // A new exercise the plan names twice is one exercise.
        const earlier = createdAs.get(e.new);
        if (earlier && earlier !== a.exerciseId) s.issues.push(`"${e.new}" was created twice`);
        createdAs.set(e.new, a.exerciseId);
      }
      const where = `day ${i + 1}, ${label(e)}`;
      tally(s.sets, a.sets.length === e.sets);
      if (a.sets.length !== e.sets)
        s.issues.push(`${where}: ${a.sets.length} sets instead of ${e.sets}`);
      const targetsOk = sameTargets(e, a.sets);
      tally(s.reps, targetsOk);
      if (!targetsOk) {
        const want =
          e.seconds != null ? `${e.seconds} s` : e.reps === 'none' ? 'max' : e.reps.join('–');
        s.issues.push(`${where}: ${target(a.sets[0], e.seconds != null)} instead of ${want}`);
      }
      if (e.rir != null) {
        tally(s.details, a.sets[0]?.rir === e.rir);
        if (a.sets[0]?.rir !== e.rir)
          s.issues.push(`${where}: RIR ${a.sets[0]?.rir} instead of ${e.rir}`);
      }
      if (e.rest != null) {
        tally(s.details, a.restSeconds === e.rest);
        if (a.restSeconds !== e.rest)
          s.issues.push(`${where}: rest ${a.restSeconds} instead of ${e.rest}`);
      }
    }
    const left = got.exercises.filter((_, j) => !used.has(j));
    s.extra += Math.max(0, left.length - missed.length);
    // Side by side in order, the misses usually line up with what was read instead.
    missed.forEach((e, k) => {
      const instead = left[k]
        ? `got ${describeExercise(left[k], plan, names, language)}`
        : 'not found';
      s.issues.push(`day ${i + 1}: expected ${label(e)}, ${instead}`);
    });
    left
      .slice(missed.length)
      .forEach((a) =>
        s.issues.push(`day ${i + 1}: extra ${describeExercise(a, plan, names, language)}`),
      );
  });
  s.review = plan.days.reduce((n, d) => n + d.exercises.filter((e) => e.raw).length, 0);
  return s;
}

const passed = (s) =>
  [s.days, s.weekdays, s.exercises, s.sets, s.reps, s.details].every((c) => c.ok === c.total) &&
  s.extra === 0 &&
  s.issues.length === 0;

const ratio = (c) => (c.total ? `${c.ok}/${c.total}` : '–');
const percent = (c) => (c.total ? `${Math.round((c.ok / c.total) * 100)} %` : '–');

// ---------- runs ----------

/**
 * One import; null once the limit is reached or the function doesn't answer (503 or no
 * connection), so the rest is skipped instead of scored as failures.
 */
async function send(body) {
  if (stopped) return null;
  const result = await read(body);
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
    ? `The import limit was reached${notRun}. For a local run set PLAN_IMPORT_IP_LIMIT=1000 in ` +
      'supabase/functions/.env and restart Supabase (npx supabase stop, then npx supabase ' +
      'start). To reset the count right away, run `delete from public.plan_requests where kind = ' +
      "'import';` in Supabase Studio."
    : `read-plan didn't answer (${stopped.down})${notRun}. Locally, npx supabase start ` +
      'serves the functions; stopping `npx supabase functions serve` takes them down until you ' +
      'run npx supabase stop and npx supabase start again. A BOOT_ERROR means the function ' +
      "didn't start: keep `npx supabase functions serve` running in another terminal to see why.";
  console.error(`\n${text}`);
  return text;
}

/** When the first exercise arrived and when the plan was complete. */
const timing = ({ first, seconds }) =>
  `${first == null ? '–' : `${first.toFixed(1)} s`} / ${seconds.toFixed(1)} s`;

function writeReport(name, text, results) {
  const out = join(HERE, 'out', new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19));
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, `${name}.md`), text);
  writeFileSync(join(out, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`\nReport: ${join(out, `${name}.md`)}`);
}

async function runFixtures() {
  const names = await loadCatalog(SUPABASE_URL, KEY, 'exercises', 'id,name,measures');
  const all = JSON.parse(readFileSync(join(FIXTURES, 'cases.json'), 'utf8'));
  const cases = args.length ? all.filter((c) => args.some((a) => c.id.startsWith(a))) : all;
  console.log(`${cases.length} cases against ${SUPABASE_URL}, ${PARALLEL} at a time …\n`);
  const results = await pool(
    cases,
    async (c) => {
      const files = c.files.map((f) => join(FIXTURES, f));
      const result = await send(requestBody({ ...c, files }, false));
      if (!result) return null;
      const s = score(c.expect, result, names, c.language);
      console.log(`${passed(s) ? 'PASS' : 'FAIL'}  ${c.id}  ${timing(result)}`);
      return { case: c, result, score: s };
    },
    PARALLEL,
    () => !!stopped,
  );
  const stopNote = reportStop(
    cases.filter((c) => !results.some((r) => r.case === c)).map((c) => c.id),
  );
  if (!results.length) process.exit(1);

  const header =
    '| case | first exercise / all | days | weekdays | exercises | sets | reps | RIR/rest | extra | to review | |';
  const rows = results.map(
    ({ case: c, result, score: s }) =>
      `| ${c.id} | ${timing(result)} | ${ratio(s.days)} | ${ratio(s.weekdays)} | ${ratio(s.exercises)} | ${ratio(s.sets)} | ${ratio(s.reps)} | ${ratio(s.details)} | ${s.extra} | ${s.review} | ${passed(s) ? 'PASS' : 'FAIL'} |`,
  );
  const sum = (key) =>
    results.reduce(
      (c, { score: s }) => ({ ok: c.ok + s[key].ok, total: c.total + s[key].total }),
      counter(),
    );
  const median = (values) => {
    const sorted = values.filter((v) => v != null).sort((a, b) => a - b);
    return sorted.length ? `${sorted[Math.floor(sorted.length / 2)].toFixed(1)} s` : '–';
  };
  const firsts = median(results.map((r) => r.result.first));
  const totals = `| **all** | median first ${firsts}, all ${median(results.map((r) => r.result.seconds))} | ${percent(sum('days'))} | ${percent(sum('weekdays'))} | ${percent(sum('exercises'))} | ${percent(sum('sets'))} | ${percent(sum('reps'))} | ${percent(sum('details'))} | ${results.reduce((n, r) => n + r.score.extra, 0)} | ${results.reduce((n, r) => n + r.score.review, 0)} | ${results.filter((r) => passed(r.score)).length}/${results.length} |`;
  const table = [header, `|${' --- |'.repeat(11)}`, ...rows, totals].join('\n');
  const details = results
    .map(({ case: c, result, score: s }) => {
      const read = result.plan
        ? describePlan(result.plan, names, c.language)
        : `(${result.status} ${result.error ?? ''})`;
      const issues = s.issues.length ? s.issues.map((i) => `- ${i}`).join('\n') : '- none';
      return `## ${c.id}\n\n${c.title}. Files: ${c.files.join(', ')}; app language ${c.language}.\n\nIssues:\n${issues}\n\nRead as:\n\n\`\`\`\n${read}\n\`\`\``;
    })
    .join('\n\n');
  console.log(`\n${table}`);
  for (const { case: c, score: s } of results) {
    if (s.issues.length) console.log(`\n${c.id}\n${s.issues.map((i) => `  - ${i}`).join('\n')}`);
  }
  writeReport(
    'report',
    `# Plan import test\n\n${stopNote && `${stopNote}\n\n`}${table}\n\n${details}\n`,
    results,
  );
}

async function runDir() {
  const names = await loadCatalog(SUPABASE_URL, KEY, 'exercises', 'id,name,measures');
  const entries = readdirSync(dir)
    .filter((f) => !f.startsWith('.'))
    .sort();
  const imports = entries.flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      const photos = readdirSync(path)
        .filter(isImage)
        .sort()
        .map((f) => join(path, f));
      return photos.length ? [{ id: entry, files: photos, as: 'photos' }] : [];
    }
    if (isImage(path)) return [{ id: entry, files: [path], as: 'photos' }];
    return MIME[extname(path).toLowerCase()] ? [{ id: entry, files: [path], as: 'file' }] : [];
  });
  if (!imports.length) {
    console.error(`No photos or plan files in ${dir}.`);
    process.exit(1);
  }
  console.log(`${imports.length} imports from ${dir} (app language ${dirLanguage}) …`);
  const results = await pool(
    imports,
    async (item) => {
      const result = await send(requestBody({ ...item, language: dirLanguage }, true));
      if (!result) return null;
      const text = result.plan
        ? describePlan(result.plan, names, dirLanguage)
        : `(${result.status} ${result.error ?? ''})`;
      console.log(`\n== ${item.id}  ${timing(result)}\n${text}`);
      return { import: item, result, text };
    },
    PARALLEL,
    () => !!stopped,
  );
  reportStop(imports.filter((i) => !results.some((r) => r.import === i)).map((i) => i.id));
  if (!results.length) process.exit(1);
  writeReport(
    'read',
    `# Plan import: ${dir}\n\n${results.map((r) => `## ${r.import.id} (${timing(r.result)})\n\n\`\`\`\n${r.text}\n\`\`\``).join('\n\n')}\n`,
    results,
  );
}

await (dir ? runDir() : runFixtures());
