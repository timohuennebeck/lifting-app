// Reads the exercises of one workout from what the user said, for the voice input next to "+"
// wherever exercises are edited. The app sends the text speech recognition made of the user's
// words; the model gets it with the exercise catalog and answers in a fixed shape, which becomes
// the exercises the app adds (with their sets, and the ones the catalog lacks). It also runs
// before there is an account (a plan set up in onboarding), so requests are limited per network
// and in total per day (start_plan_request, kind "voice").
import { reply } from '../_shared/common.ts';
import { askStructured, openAiConfigured, type StructuredRequest } from '../_shared/openai.ts';
import { LANGUAGES } from '../_shared/plan-events.ts';
import { type CatalogRow, envLimit, loadCatalog, takePlanRequest } from '../_shared/plans.ts';
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
/** OpenAI's Fast mode (twice the token price); PLAN_VOICE_FAST=false turns it off. */
const FAST = Deno.env.get('PLAN_VOICE_FAST') !== 'false';
/** Characters of text (the app's MAX_SPOKEN). */
const MAX_TEXT = 4000;
/** OpenAI's HTTP statuses worth a second attempt: timeout, conflict, rate limit, overload. */
const PASSING_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504]);

/**
 * The model's answer, with one more attempt when the first fails for a passing reason (overload,
 * a broken connection). `error` is a thrown timeout or network error, which may have been billed.
 */
async function ask(request: StructuredRequest) {
  for (let attempt = 1; ; attempt++) {
    const answer = await askStructured(request).catch((error: unknown) => ({ error }));
    const passing =
      'error' in answer || ('upstream' in answer && PASSING_STATUSES.has(answer.upstream));
    if (!passing || attempt === 2) return answer;
    console.error('Reading the exercises failed (attempt 1)', answer);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
  if (!openAiConfigured()) {
    console.error('OPENAI_API_KEY is not set (supabase/functions/.env)');
    return reply(500, { error: 'not_configured' });
  }

  const body = await req.json().catch(() => null);
  const language = LANGUAGES.includes(body?.language) ? body.language : 'de';
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text) return reply(400, { error: 'bad_request' });
  if (text.length > MAX_TEXT) return reply(413, { error: 'too_large' });

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

  const answer = await ask({
    instructions: INSTRUCTIONS,
    content: [
      { type: 'input_text', text: contextText(catalog, language) },
      { type: 'input_text', text: `What the user said:\n${text}` },
    ],
    name: 'workout_exercises',
    schema: buildSchema(catalog.map((e) => e.id)),
    timeoutMs: OPENAI_TIMEOUT_MS,
    fast: FAST,
  });
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

  const parsed = JSON.parse(answer.text) as ModelAnswer;
  return reply(
    200,
    spokenExercises(parsed, catalog, () => crypto.randomUUID()),
  );
});
