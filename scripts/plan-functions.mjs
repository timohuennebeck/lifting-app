// What the plan tests (plan-import-eval, plan-generate-eval) share: calling a plan function as the
// app does, the catalog, and running a few requests at a time.

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
    return { status: response.status, seconds: seconds(), plan: null, error };
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
        if (event.type === 'plan') plan = { name: event.name, days: [], newExercises: [] };
        else if (event.type === 'day') plan.days.push({ ...event.day, exercises: [] });
        else if (event.type === 'exercise') {
          first ??= seconds();
          plan.days.at(-1).exercises.push(event.exercise);
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
