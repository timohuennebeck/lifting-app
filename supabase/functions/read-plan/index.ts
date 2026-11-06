// Reads a training plan for the workout import (in onboarding and in the app). The app reads the
// file itself (a CSV export or a spreadsheet's sheets) and sends the plan's rows as text; the
// model gets them with the exercise catalog and answers in a fixed shape, which becomes the plan
// the user reviews. The answer is streamed: each exercise goes to the app as soon as the model has
// written it (see `PlanEvent`). It also runs before there is an account, so imports are limited
// per network and in total per day (start_plan_request).
import { envFlag, envLimit, refuseAiRequest, reply } from '../_shared/common.ts';
import { isAppLanguage } from '../_shared/plan-events.ts';
import {
  type CatalogRow,
  loadCatalog,
  planEventResponse,
  takePlanRequest,
} from '../_shared/plans.ts';
import { buildSchema, contextText, INSTRUCTIONS, planReader } from './plan.ts';

/** For both attempts together (see planEventResponse); the function may run 150 s at most. */
const OPENAI_TIMEOUT_MS = 120_000;
/** Imports per network (hashed IP) and in total in 24 hours; each one is a paid model call. */
const IP_LIMIT = envLimit('PLAN_IMPORT_IP_LIMIT', 10);
const DAILY_LIMIT = envLimit('PLAN_IMPORT_DAILY_LIMIT', 1000);
/** OpenAI's Fast mode for the import (twice the token price); PLAN_IMPORT_FAST=false turns it off. */
const FAST = envFlag('PLAN_IMPORT_FAST');
/** Characters of the plan's text the model reads. */
const MAX_TEXT = 60_000;

Deno.serve(async (req) => {
  const refused = refuseAiRequest(req);
  if (refused) return refused;

  const body = await req.json().catch(() => null);
  const language = body?.language;
  const name = body?.name;
  const text = body?.text;
  if (typeof name !== 'string' || typeof text !== 'string' || !text.trim()) {
    return reply(400, { error: 'bad_request' });
  }
  if (!isAppLanguage(language)) return reply(400, { error: 'bad_request' });
  if (text.length > MAX_TEXT) return reply(413, { error: 'too_large' });

  const taken = await takePlanRequest(req, 'import', { perNetwork: IP_LIMIT, perDay: DAILY_LIMIT });
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
      timeoutMs: OPENAI_TIMEOUT_MS,
      fast: FAST,
    },
    reader: () => planReader(catalog, () => crypto.randomUUID()),
    giveBack,
    noPlan: 'not_a_plan',
    label: 'import',
  });
});
