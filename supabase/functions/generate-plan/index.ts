// Builds a training plan from the plan flow's answers, in onboarding and in the app (goal, focus,
// equipment, workouts a week, session length, experience; no name or body data). The model picks
// from the exercises the user's equipment allows and answers in a fixed shape; the plan streams to
// the app as the import's does (see PlanEvent), checked part by part (planBuilder). It also runs
// before there is an account, so plans are limited per network and in total per day
// (start_plan_request, kind "generate").
import { envLimit, refuseAiRequest, reply } from '../_shared/common.ts';
import { MODELS } from '../_shared/models.ts';
import { isAppLanguage } from '../_shared/plan-events.ts';
import {
  loadCatalog,
  loadEquipment,
  planEventResponse,
  takePlanRequest,
} from '../_shared/plans.ts';
import {
  buildSchema,
  contextText,
  equipmentOf,
  INSTRUCTIONS,
  parseAnswers,
  planBuilder,
  usableExercises,
} from './generate.ts';

/** For both attempts together (see planEventResponse); the function may run 150 s at most. */
const OPENAI_TIMEOUT_MS = 120_000;
/** Plans per network (hashed IP) and in total in 24 hours; each one is a paid model call. */
const IP_LIMIT = envLimit('PLAN_GENERATE_IP_LIMIT', 10);
const DAILY_LIMIT = envLimit('PLAN_GENERATE_DAILY_LIMIT', 1000);

Deno.serve(async (req) => {
  const refused = refuseAiRequest(req);
  if (refused) return refused;

  const body = await req.json().catch(() => null);
  const language = body?.language;
  const answers = parseAnswers(body?.answers);
  if (!answers || !isAppLanguage(language)) return reply(400, { error: 'bad_request' });

  const taken = await takePlanRequest(req, 'generate', {
    perNetwork: IP_LIMIT,
    perDay: DAILY_LIMIT,
  });
  if ('refused' in taken) return taken.refused;
  const { giveBack } = taken;

  let catalog;
  let have;
  try {
    have = equipmentOf(answers, await loadEquipment());
    catalog = usableExercises(await loadCatalog(), have, answers);
  } catch (error) {
    console.error('Loading the catalog failed', error);
    await giveBack();
    return reply(500, { error: 'failed' });
  }

  return planEventResponse({
    request: {
      instructions: INSTRUCTIONS,
      content: [{ type: 'input_text', text: contextText(answers, have, catalog, language) }],
      name: 'training_plan',
      schema: buildSchema(catalog.map((e) => e.id)),
      timeoutMs: OPENAI_TIMEOUT_MS,
      model: MODELS.generatePlan,
    },
    reader: () => planBuilder(answers, catalog),
    giveBack,
    noPlan: 'failed',
    label: 'plan',
  });
});
