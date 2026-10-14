// Builds a training plan from the onboarding answers (goal, focus, equipment, workouts a week,
// session length, experience; no name or body data). The model picks from the exercises the user's
// equipment allows and answers in a fixed shape; the plan streams to the app as the import's does
// (see PlanEvent), checked part by part (planBuilder). It runs before there is an account, so
// plans are limited per network and in total per day (start_plan_request, kind "generate").
import { reply } from '../_shared/common.ts';
import { openAiConfigured, type StreamedAnswer, streamStructured } from '../_shared/openai.ts';
import type { ImportedRoutine, PlanEvent } from '../_shared/plan-events.ts';
import { PlanStream } from '../_shared/plan-stream.ts';
import {
  envLimit,
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
  type ModelExercise,
  type ModelRoutine,
  parseAnswers,
  planBuilder,
  usableExercises,
} from './generate.ts';

const OPENAI_TIMEOUT_MS = 120_000;
/** Plans per network (hashed IP) and in total in 24 hours; each one is a paid model call. */
const IP_LIMIT = envLimit('PLAN_GENERATE_IP_LIMIT', 10);
const DAILY_LIMIT = envLimit('PLAN_GENERATE_DAILY_LIMIT', 1000);
/** OpenAI's Fast mode (twice the token price); PLAN_GENERATE_FAST=false turns it off. */
const FAST = Deno.env.get('PLAN_GENERATE_FAST') !== 'false';
const LANGUAGES = ['de', 'en', 'pt-PT', 'pt-BR'];

Deno.serve(async (req) => {
  if (req.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
  if (!openAiConfigured()) {
    console.error('OPENAI_API_KEY is not set (supabase/functions/.env)');
    return reply(500, { error: 'not_configured' });
  }

  const body = await req.json().catch(() => null);
  const language = LANGUAGES.includes(body?.language) ? body.language : 'de';
  const answers = parseAnswers(body?.answers);
  if (!answers) return reply(400, { error: 'bad_request' });

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
    catalog = usableExercises(await loadCatalog(), have);
  } catch (error) {
    console.error('Loading the catalog failed', error);
    await giveBack();
    return reply(500, { error: 'failed' });
  }

  // Stops the model when the app goes away (the stream below is cancelled), so the rest of the
  // answer isn't paid for. Not req.signal: Deno also aborts that once a response is delivered.
  const stop = new AbortController();
  let started: Awaited<ReturnType<typeof streamStructured>>;
  try {
    started = await streamStructured(
      {
        instructions: INSTRUCTIONS,
        content: [{ type: 'input_text', text: contextText(answers, have, catalog, language) }],
        name: 'training_plan',
        schema: buildSchema(catalog.map((e) => e.id)),
        timeoutMs: OPENAI_TIMEOUT_MS,
        fast: FAST,
      },
      stop.signal,
    );
  } catch (error) {
    // A timeout may still have been billed, so the plan stays counted.
    console.error('OpenAI request failed', error);
    return reply(502, { error: 'failed' });
  }
  if ('upstream' in started) {
    await giveBack();
    return reply(502, { error: 'failed', upstream: started.upstream });
  }

  const { answer } = started;
  const builder = planBuilder(answers, catalog);
  return planEventResponse((send) => sendPlan(answer, builder, send, giveBack), stop, 'plan');
});

/**
 * Reads the streamed answer into the app's events (see PlanEvent) and sends them. An answer that
 * fails before its first word gives the request back, as a failed request does.
 */
async function sendPlan(
  answer: AsyncGenerator<StreamedAnswer>,
  builder: ReturnType<typeof planBuilder>,
  send: (event: PlanEvent) => void,
  giveBack: () => PromiseLike<unknown>,
) {
  const stream = new PlanStream<ModelRoutine, ModelExercise>();
  // A routine waits for its first exercise.
  let routine: ImportedRoutine | null = null;
  let exercises = 0;
  let written = false;
  for await (const step of answer) {
    if ('refusal' in step) {
      console.warn('The model refused the plan');
      return send({ type: 'error', error: 'failed' });
    }
    if ('incomplete' in step) {
      console.error('The plan did not complete', step.incomplete);
      if (!written) await giveBack();
      return send({ type: 'error', error: 'failed' });
    }
    if ('done' in step) {
      return send(exercises ? { type: 'done' } : { type: 'error', error: 'failed' });
    }
    written = true;
    for (const piece of stream.push(step.text)) {
      if (piece.kind === 'start') {
        send({ type: 'plan', name: builder.planName(piece.name) });
      } else if (piece.kind === 'routine') {
        routine = builder.routine(piece.routine);
        // A routine past the workouts a week: the plan is complete, and leaving stops the model.
        if (!routine) {
          return send(exercises ? { type: 'done' } : { type: 'error', error: 'failed' });
        }
      } else {
        const exercise = builder.exercise(piece.exercise);
        if (!exercise) continue;
        if (routine) send({ type: 'routine', routine });
        routine = null;
        send({ type: 'exercise', exercise });
        exercises++;
      }
    }
  }
}
