// What the plan lab's page runs (bundled into it by build.mjs as window.PlanLab): making a plan
// (run-plan.mjs), the eval's profiles, and reading the catalog and OpenAI's models. Everything
// runs in the browser: the catalog comes from Supabase with the publishable key, the plans from
// OpenAI with the key typed into the page.
export { MUSCLES } from '../../supabase/functions/_shared/plan-events.ts';
export { PROFILES } from '../plan-generate-eval/checks.mjs';
export { PRODUCTION, runPlan } from './run-plan.mjs';

/** A catalog table's active rows by id, in the order generate-plan reads them (plans.ts). */
async function activeRows(url, key, table, columns) {
  const response = await fetch(
    `${url}/rest/v1/${table}?select=${columns}&is_active=eq.true&order=id`,
    { headers: { apikey: key } },
  );
  if (!response.ok) throw new Error(`The ${table} could not be read (${response.status}).`);
  return new Map((await response.json()).map((row) => [row.id, row]));
}

/** The exercises and the equipment, as generate-plan loads them. */
export async function loadCatalog(url, key) {
  const [exercises, equipment] = await Promise.all([
    activeRows(
      url,
      key,
      'exercises',
      'id,name,equipment,needs,measures,muscles,rest_seconds,cardio',
    ),
    activeRows(url, key, 'equipment', 'id,name,in_gym,at_home,position'),
  ]);
  return { catalog: [...exercises.values()], equipment };
}

/** OpenAI's chat models for the key, without dated snapshots and special-purpose ones. */
export async function listModels(openAiKey) {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${openAiKey}` },
  });
  if (!response.ok) throw new Error(`OpenAI answered ${response.status}: ${await response.text()}`);
  const { data } = await response.json();
  return data
    .map((m) => m.id)
    .filter(
      (id) =>
        /^gpt-\d/.test(id) &&
        !/audio|realtime|search|transcribe|tts|image|codex|chat|instruct|\d{4}-\d{2}-\d{2}/.test(
          id,
        ),
    )
    .sort();
}
