// Reads the exercises of one workout from what the user said, for the voice input next to "+"
// wherever exercises are edited. The app sends the text speech recognition made of the user's
// words; the model gets it with the exercise catalog and answers in a fixed shape, which becomes
// the exercises the app adds (with their sets, and the ones the catalog lacks). It also runs
// before there is an account (a plan set up in onboarding), so requests are limited per network
// and in total per day (start_plan_request, kind "voice").
import { envLimit, refuseAiRequest, reply } from '../_shared/common.ts';
import { SPOKEN_TEXT_MAX } from '../_shared/limits.ts';
import { MODELS } from '../_shared/models.ts';
import { askWithRetry } from '../_shared/openai.ts';
import { isAppLanguage } from '../_shared/plan-events.ts';
import { type CatalogRow, loadCatalog, takePlanRequest } from '../_shared/plans.ts';
import {
  buildSchema,
  contextText,
  INSTRUCTIONS,
  type ModelAnswer,
  spokenExercises,
} from './exercises.ts';

/** Per attempt; short lists come back in seconds. */
const OPENAI_TIMEOUT_MS = 45_000;
/** Requests per network (hashed IP) and in total in 24 hours: short, but made often. */
const IP_LIMIT = envLimit('PLAN_VOICE_IP_LIMIT', 60);
const DAILY_LIMIT = envLimit('PLAN_VOICE_DAILY_LIMIT', 5000);

Deno.serve(async (req) => {
  const refused = refuseAiRequest(req);
  if (refused) return refused;

  const body = await req.json().catch(() => null);
  const language = body?.language;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text || !isAppLanguage(language)) return reply(400, { error: 'bad_request' });
  if (text.length > SPOKEN_TEXT_MAX) return reply(413, { error: 'too_large' });

  const taken = await takePlanRequest(req, 'voice', { perNetwork: IP_LIMIT, perDay: DAILY_LIMIT });
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

  const answer = await askWithRetry(
    {
      instructions: INSTRUCTIONS,
      content: [
        { type: 'input_text', text: contextText(catalog, language) },
        { type: 'input_text', text: `What the user said:\n${text}` },
      ],
      name: 'workout_exercises',
      schema: buildSchema(catalog.map((e) => e.id)),
      timeoutMs: OPENAI_TIMEOUT_MS,
      model: MODELS.readSpoken,
    },
    'Reading the exercises',
  );
  if ('upstream' in answer) {
    // Refused before the model ran: nothing was billed.
    await giveBack();
    return reply(502, { error: 'failed', upstream: answer.upstream });
  }
  if ('error' in answer || 'incomplete' in answer) {
    console.error('Reading the exercises failed', answer);
    return reply(502, { error: 'failed' });
  }
  // A refusal reads as nothing said that is an exercise.
  if ('refusal' in answer) return reply(200, { exercises: [], newExercises: [] });

  let parsed: ModelAnswer;
  try {
    parsed = JSON.parse(answer.text) as ModelAnswer;
  } catch (error) {
    console.error('Reading the exercises: no JSON in the answer', error);
    return reply(502, { error: 'failed' });
  }
  return reply(
    200,
    spokenExercises(parsed, catalog, () => crypto.randomUUID()),
  );
});
