// The plan lab: a local web page that makes plans from the plan flow's answers in several ways at
// once (models, reasoning efforts, Fast mode, prompt changes) and compares them by when the first
// exercise comes, how long the whole plan takes, the tokens and the eval's checks (run-plan.mjs).
// It calls OpenAI directly, so generate-plan's limits don't apply; each plan is a paid call.
// Needs OPENAI_API_KEY (the environment or supabase/functions/.env) and the Supabase project of
// .env.local for the catalog. Usage: npm run plan:lab, then open http://localhost:4300 (PORT and
// HOST change it). Every run is added to scripts/plan-lab/out/runs.jsonl.
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';

import { MUSCLES } from '../../supabase/functions/_shared/plan-events.ts';
import { loadCatalog, supabaseEnv } from '../plan-functions.mjs';
import { PROFILES } from '../plan-generate-eval/checks.mjs';
import { PRODUCTION, runPlan } from './run-plan.mjs';

const HERE = import.meta.dirname;
const OUT = join(HERE, 'out');
const PORT = Number(process.env.PORT) || 4300;
const HOST = process.env.HOST || '127.0.0.1';

try {
  process.loadEnvFile(join(HERE, '../../supabase/functions/.env'));
} catch {
  // The key can come from the environment instead.
}
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error('Set OPENAI_API_KEY in supabase/functions/.env (or the environment).');
  process.exit(1);
}

// The active rows in the order generate-plan reads them (plans.ts), so the prompt is the same.
const { url, key } = supabaseEnv();
const [exercises, equipment] = await Promise.all([
  loadCatalog(
    url,
    key,
    'exercises',
    'id,name,equipment,needs,measures,muscles,rest_seconds,cardio&is_active=eq.true&order=id',
  ),
  loadCatalog(url, key, 'equipment', 'id,name,in_gym,at_home,position&is_active=eq.true&order=id'),
]);
if (!exercises.size || !equipment.size) process.exit(1);
const catalog = [...exercises.values()];

/** OpenAI's chat models for the account, without dated snapshots and special-purpose ones. */
async function listModels() {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    });
    if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
    const { data } = await response.json();
    const ids = data
      .map((m) => m.id)
      .filter(
        (id) =>
          /^gpt-\d/.test(id) &&
          !/audio|realtime|search|transcribe|tts|image|codex|chat|instruct|\d{4}-\d{2}-\d{2}/.test(
            id,
          ),
      );
    return [...new Set([PRODUCTION.model, ...ids])].sort();
  } catch (error) {
    console.warn(`OpenAI's models could not be listed: ${error.message}`);
    return [PRODUCTION.model];
  }
}
const models = await listModels();

const setup = {
  profiles: PROFILES,
  models,
  production: PRODUCTION,
  muscles: MUSCLES,
  homeEquipment: [...equipment.values()]
    .filter((e) => e.at_home)
    .sort((a, b) => a.position - b.position)
    .map((e) => ({ id: e.id, name: e.name?.en ?? e.id })),
  exercises: catalog.length,
};

const bodyOf = async (req) => {
  let text = '';
  for await (const chunk of req) text += chunk;
  return JSON.parse(text);
};

/** Keeps a run in out/runs.jsonl, one JSON object a line. */
function save(entry) {
  mkdirSync(OUT, { recursive: true });
  appendFileSync(join(OUT, 'runs.jsonl'), `${JSON.stringify(entry)}\n`);
}

/** One plan, sent to the page as server-sent events while it is made. */
async function run(req, res) {
  const { answers, language, variant, profile } = await bodyOf(req);
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
  const stop = new AbortController();
  // The page went away (or stopped the run): stop the model too.
  res.on('close', () => stop.abort());
  const send = (event) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(event)}\n\n`);
  };
  const entry = { at: new Date().toISOString(), profile, language, answers, variant };
  try {
    const result = await runPlan(
      { answers, language, variant, catalog, equipment, key: OPENAI_KEY },
      send,
      stop.signal,
    );
    save({ ...entry, result });
  } catch (error) {
    if (!stop.signal.aborted) {
      console.error(error.message);
      send({ type: 'error', message: error.message });
      save({ ...entry, error: error.message });
    }
  }
  res.end();
}

const server = createServer(async (req, res) => {
  const path = new URL(req.url ?? '/', 'http://lab').pathname;
  try {
    if (req.method === 'GET' && path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(readFileSync(join(HERE, 'index.html')));
    } else if (req.method === 'GET' && path === '/api/setup') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(setup));
    } else if (req.method === 'POST' && path === '/api/run') {
      await run(req, res);
    } else {
      res.writeHead(404).end();
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(error.message ?? error));
  }
});

server.listen(PORT, HOST, () => {
  console.log(
    `Plan lab: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}  (${catalog.length} exercises, ${models.length} models)`,
  );
});
