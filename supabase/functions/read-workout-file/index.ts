// Reads a workout file for the import (in onboarding and in the app): an export of another app
// (Hevy, Strong, …) or a spreadsheet with a workout history and/or a plan. The app reads the file
// itself and asks this function only what takes a model, one step per request:
// - "categorize": what each sheet holds and which column is which, from samples of it;
// - "map": which catalog exercise each exercise name of the file is;
// - "name": names for the routines the app found in a history whose workouts have none
//   (history.ts);
// - "plan": the plan's rows as a training plan, streamed exercise by exercise as the plan
//   functions do (plan.ts, PlanEvent).
// It also runs before there is an account, so requests are limited per network and in total per
// day (start_plan_request: kind "history" for the first three, "import" for a plan).
import { envLimit, refuseAiRequest, reply } from '../_shared/common.ts';
import { contextText } from '../_shared/exercise-reading.ts';
import { PLAN_TEXT_MAX } from '../_shared/limits.ts';
import { MODELS } from '../_shared/models.ts';
import { askWithRetry, type StructuredRequest } from '../_shared/openai.ts';
import { isAppLanguage } from '../_shared/plan-events.ts';
import {
  type CatalogRow,
  loadCatalog,
  planEventResponse,
  takePlanRequest,
} from '../_shared/plans.ts';
import {
  CATEGORIZE_INSTRUCTIONS,
  categorizeContent,
  categorizeSchema,
  MAP_INSTRUCTIONS,
  mapContent,
  mappedNames,
  mapSchema,
  type ModelName,
  NAME_INSTRUCTIONS,
  nameSamples,
  routineNames,
  routineNamesSchema,
  routinesContent,
  routineSamples,
  type SheetKind,
  sheetKinds,
  sheetSamples,
} from './history.ts';
import { buildSchema, INSTRUCTIONS, planReader } from './plan.ts';

/** Per attempt. */
const OPENAI_TIMEOUT_MS = 60_000;
/**
 * Requests per network (hashed IP) and in total in 24 hours. One import takes about four (one
 * categorize, one or two maps, maybe a name), each a paid model call.
 */
const IP_LIMIT = envLimit('HISTORY_IMPORT_IP_LIMIT', 40);
const DAILY_LIMIT = envLimit('HISTORY_IMPORT_DAILY_LIMIT', 4000);
/** Characters of the samples the model reads in step 1. */
const MAX_SAMPLE_TEXT = 120_000;

/** A plan: for both attempts together (see planEventResponse); the function may run 150 s. */
const PLAN_TIMEOUT_MS = 120_000;
/** Plans read per network (hashed IP) and in total in 24 hours; each one is a paid model call. */
const PLAN_IP_LIMIT = envLimit('PLAN_IMPORT_IP_LIMIT', 10);
const PLAN_DAILY_LIMIT = envLimit('PLAN_IMPORT_DAILY_LIMIT', 1000);

type Step =
  | { step: 'categorize'; file: string; sheets: NonNullable<ReturnType<typeof sheetSamples>> }
  | { step: 'map'; names: NonNullable<ReturnType<typeof nameSamples>> }
  | { step: 'name'; routines: NonNullable<ReturnType<typeof routineSamples>> };

/** The request's step with what it needs, or null when the body isn't one. */
function stepOf(body: Record<string, unknown> | null): Step | null {
  if (body?.step === 'categorize' && typeof body.file === 'string') {
    const sheets = sheetSamples(body.sheets);
    return sheets ? { step: 'categorize', file: body.file.slice(0, 200), sheets } : null;
  }
  if (body?.step === 'map') {
    const names = nameSamples(body.names);
    return names ? { step: 'map', names } : null;
  }
  if (body?.step === 'name') {
    const routines = routineSamples(body.routines);
    return routines ? { step: 'name', routines } : null;
  }
  return null;
}

/** The model request for the step; `catalog` only for "map". */
function modelRequest(
  step: Step,
  language: string,
  catalog: CatalogRow[],
): Omit<StructuredRequest, 'timeoutMs'> {
  const base = { model: MODELS.readFile };
  if (step.step === 'categorize') {
    return {
      ...base,
      instructions: CATEGORIZE_INSTRUCTIONS,
      content: [{ type: 'input_text', text: categorizeContent(step.file, step.sheets) }],
      name: 'workout_file',
      schema: categorizeSchema(step.sheets.map((s) => s.name)),
    };
  }
  if (step.step === 'map') {
    return {
      ...base,
      instructions: MAP_INSTRUCTIONS,
      content: [
        { type: 'input_text', text: contextText(catalog, language) },
        { type: 'input_text', text: mapContent(step.names) },
      ],
      name: 'exercise_names',
      schema: mapSchema(catalog.map((e) => e.id)),
    };
  }
  return {
    ...base,
    instructions: NAME_INSTRUCTIONS,
    content: [{ type: 'input_text', text: routinesContent(language, step.routines) }],
    name: 'routine_names',
    schema: routineNamesSchema,
  };
}

/** The model's parsed answer as the app gets it. */
function result(step: Step, parsed: unknown, catalog: CatalogRow[]) {
  if (step.step === 'categorize') {
    return { sheets: sheetKinds(parsed as { sheets: SheetKind[] }, step.sheets) };
  }
  if (step.step === 'map') {
    const answer = parsed as { exercises: ModelName[] };
    return { names: mappedNames(answer, step.names, catalog, () => crypto.randomUUID()) };
  }
  return { names: routineNames(parsed as { names: string[] }, step.routines.length) };
}

/** The "plan" step: the plan's rows with the catalog, streamed as the plan is read. */
async function readPlan(req: Request, name: unknown, text: unknown, language: string) {
  if (typeof name !== 'string' || typeof text !== 'string' || !text.trim()) {
    return reply(400, { error: 'bad_request' });
  }
  if (text.length > PLAN_TEXT_MAX) return reply(413, { error: 'too_large' });

  const taken = await takePlanRequest(req, 'import', {
    perNetwork: PLAN_IP_LIMIT,
    perDay: PLAN_DAILY_LIMIT,
  });
  if ('refused' in taken) return taken.refused;
  const { giveBack } = taken;

  let catalog: CatalogRow[];
  try {
    catalog = await loadCatalog();
  } catch (error) {
    console.error('Loading the catalog failed', error);
    await giveBack();
    return reply(500, { error: 'failed' });
  }

  return planEventResponse({
    request: {
      instructions: INSTRUCTIONS,
      content: [
        { type: 'input_text', text: contextText(catalog, language) },
        { type: 'input_text', text: `File "${name.slice(0, 200)}":\n${text}` },
      ],
      name: 'training_plan',
      schema: buildSchema(catalog.map((e) => e.id)),
      timeoutMs: PLAN_TIMEOUT_MS,
      model: MODELS.readPlan,
    },
    reader: () => planReader(catalog, () => crypto.randomUUID()),
    giveBack,
    noPlan: 'not_a_plan',
    label: 'import',
  });
}

Deno.serve(async (req) => {
  const refused = refuseAiRequest(req);
  if (refused) return refused;

  const body = await req.json().catch(() => null);
  const language = body?.language;
  if (body?.step === 'plan' && isAppLanguage(language)) {
    return readPlan(req, body.name, body.text, language);
  }
  const step = stepOf(body);
  if (!step || !isAppLanguage(language)) return reply(400, { error: 'bad_request' });
  if (
    step.step === 'categorize' &&
    categorizeContent(step.file, step.sheets).length > MAX_SAMPLE_TEXT
  ) {
    return reply(413, { error: 'too_large' });
  }

  const taken = await takePlanRequest(req, 'history', {
    perNetwork: IP_LIMIT,
    perDay: DAILY_LIMIT,
  });
  if ('refused' in taken) return taken.refused;
  const { giveBack } = taken;

  let catalog: CatalogRow[] = [];
  if (step.step === 'map') {
    try {
      catalog = await loadCatalog();
    } catch (error) {
      console.error('Loading the catalog failed', error);
      await giveBack();
      return reply(500, { error: 'failed' });
    }
  }

  const answer = await askWithRetry(
    { ...modelRequest(step, language, catalog), timeoutMs: OPENAI_TIMEOUT_MS },
    `Reading the history (${step.step})`,
  );
  if ('upstream' in answer) {
    // Refused before the model ran: nothing was billed.
    await giveBack();
    return reply(502, { error: 'failed', upstream: answer.upstream });
  }
  if ('error' in answer || 'incomplete' in answer || 'refusal' in answer) {
    console.error(`Reading the history (${step.step}) failed`, answer);
    return reply(502, { error: 'failed' });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(answer.text);
  } catch (error) {
    console.error(`Reading the history (${step.step}): no JSON in the answer`, error);
    return reply(502, { error: 'failed' });
  }
  return reply(200, result(step, parsed, catalog));
});
