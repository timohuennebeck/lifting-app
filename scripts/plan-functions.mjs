// What the plan tests (plan-import-eval, plan-generate-eval) share: calling a plan function as the
// app does, the catalog, and running a few requests at a time.

/** The Supabase project from .env: its URL and publishable key. Exits without them. */
export function supabaseEnv() {
  const { EXPO_PUBLIC_SUPABASE_URL: url, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key } = process.env;
  if (!url || !key) {
    console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.');
    process.exit(1);
  }
  return { url, key };
}

/**
 * One request to a plan function (read-plan, generate-plan). It streams the plan as server-sent
 * events (PlanEvent in supabase/functions/_shared/plan-events.ts); they are put together like the
 * app does. `first` is when the first exercise arrived, `seconds` the end.
 */
export async function streamPlan(url, key, body) {
  const started = performance.now();
  const seconds = () => (performance.now() - started) / 1000;
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    return { status: 0, seconds: seconds(), plan: null, error: error.cause?.code ?? error.message };
  }
  if (!response.ok) {
    const answer = await response.json().catch(() => ({}));
    // The function answers { error }; the runtime and gateway { code, message } or { message }.
    const error = answer.error ?? [answer.code, answer.message].filter(Boolean).join(': ');
    return {
      status: response.status,
      seconds: seconds(),
      plan: null,
      error,
      upstream: answer.upstream,
    };
  }
  let plan = null;
  let first = null;
  let error = 'cut_off';
  let buffer = '';
  try {
    read: for await (const chunk of response.body.pipeThrough(new TextDecoderStream())) {
      buffer += chunk;
      let end;
      while ((end = buffer.indexOf('\n\n')) >= 0) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (!line.startsWith('data:')) continue;
        const event = JSON.parse(line.slice(5));
        if (event.type === 'plan') plan = { name: event.name, routines: [], newExercises: [] };
        else if (event.type === 'routine') plan.routines.push({ ...event.routine, exercises: [] });
        else if (event.type === 'exercise') {
          first ??= seconds();
          plan.routines.at(-1).exercises.push(event.exercise);
          if (event.newExercise) plan.newExercises.push(event.newExercise);
        } else {
          error = event.type === 'error' ? event.error : null;
          break read;
        }
      }
    }
  } catch (cause) {
    error = cause.message;
  }
  return { status: 200, first, seconds: seconds(), plan: error ? null : plan, error };
}

/**
 * Why no further request can succeed, or null: the limit, the functions not served (no
 * connection; 502, 503 or 504 from the gateway), no OpenAI key, or OpenAI refusing the key or
 * the quota (401, 403, 429), which would fail every plan alike.
 */
function stopReason({ status, error, upstream }) {
  if (status === 429) return { limit: true };
  if (status === 0 || status === 503 || status === 504 || (status === 502 && !upstream)) {
    return { down: `${status || 'no connection'} ${error ?? ''}`.trim() };
  }
  if (error === 'not_configured') {
    return { down: 'not_configured', hint: 'Set OPENAI_API_KEY in supabase/functions/.env.' };
  }
  if ([401, 403, 429].includes(upstream)) {
    return {
      down: `OpenAI answered ${upstream}`,
      hint: 'Check the key, the billing and the rate limits at platform.openai.com.',
    };
  }
  return null;
}

/**
 * Sends requests with `call` (e.g. streamPlan) until one shows that the rest can't succeed (see
 * stopReason): from then on `send` resolves to null, so the rest is skipped instead of scored as
 * failures. `stopped()` says why: { limit: true } or { down, hint? }.
 */
export function untilStopped(call) {
  let stopped = null;
  return {
    stopped: () => stopped,
    async send(body) {
      if (stopped) return null;
      const result = await call(body);
      stopped = stopReason(result);
      return stopped ? null : result;
    },
  };
}

/** A failed request's status and error, e.g. "(500 failed)"; empty for a plan. */
export const failure = ({ plan, status, error }) =>
  plan ? '' : ` (${[status, error].filter(Boolean).join(' ')})`;

/** When the first exercise arrived and when the plan was complete. */
export const timing = ({ first, seconds }) =>
  `${first == null ? '–' : `${first.toFixed(1)} s`} / ${seconds.toFixed(1)} s`;

/** A catalog table's rows (exercises, equipment) by id, with these columns; empty on failure. */
export async function loadCatalog(supabaseUrl, key, table, columns) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}`, {
      headers: { apikey: key },
    });
    if (!response.ok) throw new Error(String(response.status));
    return new Map((await response.json()).map((e) => [e.id, e]));
  } catch (error) {
    console.warn(`The ${table} could not be read (${error.message}).`);
    return new Map();
  }
}

/** Runs `run` over the items, `parallel` at a time; takes no new ones once `stopped()`. */
export async function pool(items, run, parallel, stopped) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(parallel, items.length) }, async () => {
      while (next < items.length && !stopped()) {
        const i = next++;
        results[i] = await run(items[i]);
      }
    }),
  );
  return results.filter(Boolean);
}
