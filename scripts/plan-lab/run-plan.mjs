// One plan as the plan lab makes it: generate-plan's own prompt, schema and plan builder
// (supabase/functions/generate-plan/generate.ts), sent straight to OpenAI with a variant's model,
// reasoning effort and prompt changes, and timed at each step of the stream (sent, accepted,
// thinking, writing, first exercise, done). The finished plan is checked as the eval checks it.
import { ROUTINE_NAME_MAX } from '../../supabase/functions/_shared/limits.ts';
import { cut, planName } from '../../supabase/functions/_shared/plan-events.ts';
import { PlanStream } from '../../supabase/functions/_shared/plan-stream.ts';
import { exerciseSeconds } from '../../supabase/functions/_shared/rest.ts';
import {
  buildSchema,
  contextText,
  equipmentOf,
  INSTRUCTIONS,
  parseAnswers,
  planBuilder,
  usableExercises,
} from '../../supabase/functions/generate-plan/generate.ts';
import { CHECKS, minutesOf } from '../plan-generate-eval/checks.mjs';

const OPENAI_URL = 'https://api.openai.com/v1/responses';

/**
 * What production sends: generate-plan's defaults (OPENAI_GENERATE_MODEL and _REASONING_EFFORT
 * aren't set), Fast mode on (PLAN_GENERATE_FAST).
 */
export const PRODUCTION = { model: 'gpt-6.1-sol', effort: 'low', fast: true };

/** The Responses API request as openai.ts builds it, with the variant's settings. */
function requestBody(variant, { instructions, content, name, schema }) {
  const reasoning = {
    ...(variant.effort ? { effort: variant.effort } : {}),
    ...(variant.summary ? { summary: 'auto' } : {}),
  };
  return {
    model: variant.model,
    instructions,
    input: [{ role: 'user', content }],
    text: { format: { type: 'json_schema', name, strict: true, schema } },
    ...(Object.keys(reasoning).length ? { reasoning } : {}),
    ...(variant.fast ? { service_tier: 'fast' } : {}),
    stream: true,
    store: false,
  };
}

const usageOf = (response) => {
  const usage = response?.usage ?? {};
  return {
    input: usage.input_tokens ?? 0,
    cached: usage.input_tokens_details?.cached_tokens ?? 0,
    output: usage.output_tokens ?? 0,
    reasoning: usage.output_tokens_details?.reasoning_tokens ?? 0,
    tier: response?.service_tier ?? null,
  };
};

/**
 * Streams one model answer. `onText` gets the answer as it is written; `emit` gets the first time
 * (ms since `t0`) of each step of `call`, the reasoning summary and the usage. Resolves with the
 * usage; throws with OpenAI's error or when the stream breaks off.
 */
async function streamAnswer(body, { key, t0, call, emit, signal, onText }) {
  const reached = new Set();
  // The model may think in several reasoning items: "thought" is when the last one ended.
  const mark = (name) => {
    if (reached.has(name) && name !== 'thought') return;
    reached.add(name);
    emit({ type: 'mark', call, name, ms: Math.round(performance.now() - t0) });
  };
  mark('sent');
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    throw new Error(
      `OpenAI ${response.status} (${call}): ${(await response.text()).slice(0, 400)}`,
    );
  }
  mark('accepted');
  let buffer = '';
  let summaryParts = 0;
  // A reader rather than `for await`, which Safari's streams don't support.
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { value: chunk, done } = await reader.read();
    if (done) break;
    buffer += chunk;
    let end;
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const data = buffer
        .slice(0, end)
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n');
      buffer = buffer.slice(end + 2);
      if (!data || data === '[DONE]') continue;
      const event = JSON.parse(data);
      const item = event.item?.type;
      // Every event but the text pieces, for the run's trace.
      if (!event.type.endsWith('.delta')) {
        const name = item ? `${event.type} (${item})` : event.type;
        emit({ type: 'trace', call, name, ms: Math.round(performance.now() - t0) });
      }
      if (event.type === 'response.output_item.added' && item === 'reasoning') mark('thinking');
      else if (event.type === 'response.output_item.done' && item === 'reasoning') mark('thought');
      else if (event.type === 'response.output_item.added' && item === 'message') mark('message');
      else if (event.type === 'response.reasoning_summary_part.added') {
        if (summaryParts++) emit({ type: 'summary', call, text: '\n\n' });
      } else if (event.type === 'response.reasoning_summary_text.delta') {
        emit({ type: 'summary', call, text: event.delta });
      } else if (event.type === 'response.output_text.delta') {
        mark('writing');
        onText(event.delta);
      } else if (event.type === 'response.refusal.delta') {
        throw new Error(`The model refused (${call})`);
      } else if (event.type === 'response.completed') {
        mark('done');
        const usage = usageOf(event.response);
        emit({ type: 'usage', call, usage });
        return usage;
      } else if (['response.incomplete', 'response.failed', 'error'].includes(event.type)) {
        throw new Error(`OpenAI stopped (${call}): ${data.slice(0, 400)}`);
      }
    }
  }
  throw new Error(`The OpenAI stream broke off (${call})`);
}

// ---------- variants of the prompt ----------

/**
 * The two rules in INSTRUCTIONS that make the model add up minutes; "Budget" replaces them with
 * this one and gives the numbers (budgetText).
 */
const TIME_RULES = ['- Fits the session length.', '- Uses that length too:'];
const BUDGET_RULE =
  "- Fits the session budget below, which the app worked out from the session length and the catalog's rest times (no need to add up minutes): keep each routine within its exercises and working sets, and use at least the lower end. Rather leave out an isolation exercise than go below 2 sets. With long sessions, first give the main exercises more sets (up to 5), then add exercises.";

function withBudgetRule(instructions) {
  const lines = instructions.split('\n');
  const at = lines.findIndex((line) => line.startsWith(TIME_RULES[0]));
  if (at < 0 || !lines[at + 1]?.startsWith(TIME_RULES[1])) {
    throw new Error("generate.ts's time rules changed: update TIME_RULES in run-plan.mjs.");
  }
  lines.splice(at, 2, BUDGET_RULE);
  return lines.join('\n');
}

/** Sets per exercise the instructions give each experience, as a typical and a highest number. */
const SETS = {
  none: [2.5, 3],
  beginner: [2.5, 3],
  intermediate: [3.5, 4],
  advanced: [4, 5],
};
/** Exercises a routine has at most: 6 for none and beginner (the instructions), else planBuilder's. */
const MAX_EXERCISES = { none: 6, beginner: 6, intermediate: 10, advanced: 10 };
/** The goal's rep ranges make rest longer (restAfterSet): heavy sets get more. */
const REST_FACTOR = { hypertrophy: 1, strength: 1.25, strength_hypertrophy: 1.1 };

/**
 * What fits a session, as the app works it out (rest.ts): the catalog's median rest for the goal,
 * the experience's sets per exercise, and from there the exercises and working sets that fill
 * 80-100% of the session.
 */
export function budgetText(answers, catalog) {
  const rests = catalog.map((e) => e.rest_seconds).sort((a, b) => a - b);
  const rest = (rests[Math.floor(rests.length / 2)] ?? 90) * REST_FACTOR[answers.goal];
  const experience = answers.experience ?? 'beginner';
  const [typical, most] = SETS[experience];
  const seconds = answers.sessionMinutes * 60;
  const setUp = exerciseSeconds(0, rest);
  const perSet = exerciseSeconds(1, rest) - setUp;
  const exercises = Math.min(
    MAX_EXERCISES[experience],
    Math.max(2, Math.round(seconds / exerciseSeconds(typical, rest))),
  );
  const fits = (share) => Math.floor((seconds * share - exercises * setUp) / perSet);
  const high = Math.max(exercises * 2, Math.min(exercises * most, fits(1)));
  const low = Math.max(exercises * 2, Math.min(high, fits(0.8)));
  return `Session budget for ${answers.sessionMinutes} minutes: each routine about ${exercises} exercises with ${low}-${high} working sets in total.`;
}

const CATALOG_HEADER = '\nCatalog (id | names | equipment | main muscles | rest in seconds):\n';

/**
 * contextText with one name per exercise (the app language's) instead of up to three, and without
 * the rest column when the budget already holds what it was for.
 */
function leanContext(text, withoutRest) {
  const [head, rows] = text.split(CATALOG_HEADER);
  if (rows == null) throw new Error("generate.ts's catalog header changed: update run-plan.mjs.");
  const lines = rows.split('\n').map((line) => {
    const [id, names, equipment, muscles, rest] = line.split(' | ');
    return [id, names.split(' / ')[0], equipment, muscles, ...(withoutRest ? [] : [rest])].join(
      ' | ',
    );
  });
  const columns = `id | name | equipment | main muscles${withoutRest ? '' : ' | rest in seconds'}`;
  return `${head}\nCatalog (${columns}):\n${lines.join('\n')}`;
}

/** The instructions and the user message for the variant, and the budget it adds (or null). */
function promptFor(variant, answers, have, catalog, language) {
  let context = contextText(answers, have, catalog, language);
  if (variant.catalog === 'lean') context = leanContext(context, variant.budget);
  const budget = variant.budget ? budgetText(answers, catalog) : null;
  return {
    instructions: variant.budget ? withBudgetRule(INSTRUCTIONS) : INSTRUCTIONS,
    content: [
      { type: 'input_text', text: context },
      ...(budget ? [{ type: 'input_text', text: budget }] : []),
    ],
    budget,
  };
}

// ---------- the split: the week first, then each routine at the same time ----------

const OUTLINE_TASK =
  'This request: plan the week only, by all the rules above (split, order, weekly balance, focus, experience, session length). For each routine in order: its name, what it trains (muscles or areas, and the focus muscles it gets extra work for), its one or two main lifts (catalog ids) and how many exercises it gets. Each routine is then written on its own from this outline, all at the same time, so give routines of the same type different main lifts.';

function outlineSchema(ids) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'routines'],
    properties: {
      name: { type: 'string' },
      routines: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'trains', 'main_lifts', 'exercises'],
          properties: {
            name: { type: 'string' },
            trains: { type: 'string' },
            main_lifts: { type: 'array', items: { type: 'string', enum: ids } },
            exercises: { type: 'integer' },
          },
        },
      },
    },
  };
}

const routineTask = (week, index, routine) =>
  `Week outline:\n${week}\n\nThis request: write routine ${index + 1} ("${routine.name}") only, by all the rules above for a routine: its main lifts first, then accessories and isolation work, about ${routine.exercises} exercises. Answer with a plan of exactly this one routine. The other routines are written at the same time from the same outline; vary from those of the same type.`;

// ---------- one run ----------

/**
 * Makes a plan from `answers` with `variant` and reports it to `emit` as it comes: the prompt,
 * each call's steps, the plan's name, routines and exercises, the first exercise (as the app shows
 * it: routine 1's), and lastly the result with the checks. `catalog` holds the active exercises,
 * `equipment` the active equipment by id.
 */
export async function runPlan(
  { answers: raw, language, variant, catalog: rows, equipment, key },
  send,
  signal,
) {
  const t0 = performance.now();
  /** Each call's steps (ms), kept for the result too. */
  const timings = {};
  const emit = (event) => {
    if (event.type === 'mark') (timings[event.call] ??= {})[event.name] = event.ms;
    send(event);
  };
  const now = () => Math.round(performance.now() - t0);
  const answers = parseAnswers(raw);
  if (!answers) throw new Error("generate-plan wouldn't take these answers (parseAnswers).");
  const have = equipmentOf(answers, [...equipment.values()]);
  const catalog = usableExercises(rows, have, answers);
  const ids = catalog.map((e) => e.id);
  const byId = new Map(rows.map((e) => [e.id, e]));
  const prompt = promptFor(variant, answers, have, catalog, language);
  emit({
    type: 'prompt',
    instructions: prompt.instructions,
    input: prompt.content.map((c) => c.text).join('\n\n'),
    budget: prompt.budget,
    exercises: catalog.length,
  });

  // A failing call stops the others too.
  const stop = new AbortController();
  const abort = () => stop.abort();
  signal.addEventListener('abort', abort);
  const context = { key, t0, emit, signal: stop.signal };
  const plan = { name: '', routines: [] };
  /** Each call's tokens and tier, by call ("plan"; or "outline", "routine 1", …). */
  const usage = {};
  let first = null;

  const addExercise = (index, exercise) => {
    plan.routines[index].exercises.push(exercise);
    const row = byId.get(exercise.exerciseId);
    const { targetMin: min, targetMax: max, rir } = exercise.sets[0];
    const name = row?.name?.[language] ?? row?.name?.en ?? exercise.exerciseId;
    emit({
      type: 'exercise',
      routine: index,
      exercise: { id: exercise.exerciseId, name, sets: exercise.sets.length, min, max, rir },
    });
    if (index === 0 && first == null) {
      first = now();
      emit({ type: 'first_exercise', ms: first });
    }
  };
  const addRoutine = (name) => {
    plan.routines.push({ name, exercises: [] });
    emit({ type: 'routine', index: plan.routines.length - 1, name });
  };
  const setName = (name) => {
    plan.name = planName(name);
    emit({ type: 'plan', name: plan.name });
  };

  /** Production's way: one call, read as attemptPlan in _shared/plans.ts reads it. */
  async function single() {
    const builder = planBuilder(answers, catalog);
    const stream = new PlanStream();
    // A routine waits for its first exercise; past the workouts a week the rest is ignored
    // (production stops the model there, which is rare).
    let waiting = null;
    let complete = false;
    const body = requestBody(variant, {
      ...prompt,
      name: 'training_plan',
      schema: buildSchema(ids),
    });
    usage.plan = await streamAnswer(body, {
      ...context,
      call: 'plan',
      onText: (text) => {
        if (complete) return;
        for (const piece of stream.push(text)) {
          if (piece.kind === 'start') setName(piece.name);
          else if (piece.kind === 'routine') {
            waiting = builder.routine(piece.routine);
            if (!waiting) {
              complete = true;
              return;
            }
          } else {
            const read = builder.exercise(piece.exercise);
            if (!read) continue;
            if (waiting) addRoutine(waiting.name);
            waiting = null;
            addExercise(plan.routines.length - 1, read.exercise);
          }
        }
      },
    });
  }

  /** The week's outline first, then one call per routine, all at once. */
  async function split() {
    let text = '';
    usage.outline = await streamAnswer(
      requestBody(variant, {
        instructions: prompt.instructions,
        content: [...prompt.content, { type: 'input_text', text: OUTLINE_TASK }],
        name: 'week_outline',
        schema: outlineSchema(ids),
      }),
      { ...context, call: 'outline', onText: (delta) => (text += delta) },
    );
    const outline = JSON.parse(text);
    const routines = outline.routines.slice(0, answers.sessionsPerWeek);
    setName(outline.name);
    for (const routine of routines) addRoutine(cut(routine.name, ROUTINE_NAME_MAX) || '–');
    emit({ type: 'outline', routines });
    const week = routines
      .map(
        (r, i) =>
          `${i + 1}. ${r.name}: trains ${r.trains}; main lifts ${r.main_lifts.join(', ') || '–'}; ${r.exercises} exercises`,
      )
      .join('\n');
    await Promise.all(
      routines.map(async (routine, index) => {
        const builder = planBuilder(answers, catalog);
        builder.routine({ name: routine.name });
        const stream = new PlanStream();
        let seen = 0;
        usage[`routine ${index + 1}`] = await streamAnswer(
          requestBody(variant, {
            instructions: prompt.instructions,
            content: [
              ...prompt.content,
              { type: 'input_text', text: routineTask(week, index, routine) },
            ],
            name: 'training_plan',
            schema: buildSchema(ids),
          }),
          {
            ...context,
            call: `routine ${index + 1}`,
            onText: (delta) => {
              for (const piece of stream.push(delta)) {
                if (piece.kind === 'routine') seen++;
                if (piece.kind !== 'exercise' || seen !== 1) continue;
                const read = builder.exercise(piece.exercise);
                if (read) addExercise(index, read.exercise);
              }
            },
          },
        );
      }),
    );
  }

  try {
    await (variant.strategy === 'split' ? split() : single());
  } catch (error) {
    stop.abort();
    throw error;
  } finally {
    signal.removeEventListener('abort', abort);
  }

  const done = { name: plan.name, routines: plan.routines.filter((r) => r.exercises.length) };
  const checks = Object.fromEntries(
    Object.entries(CHECKS).map(([name, check]) => [
      name,
      check({ answers }, done, byId, equipment),
    ]),
  );
  const result = {
    type: 'result',
    ms: now(),
    first,
    plan: done,
    minutes: done.routines.map((r) => Math.round(minutesOf(r, byId))),
    checks,
    usage,
    timings,
  };
  emit(result);
  return result;
}
