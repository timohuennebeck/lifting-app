// deno test --allow-env supabase/functions/_shared/coach-chat.test.ts
// Runs coach-chat against a small in-memory stand-in for the Supabase API and a scripted OpenAI
// that streams, and checks who gets an answer, what the model is sent, what the app receives and
// what is saved.
import { assert, assertEquals } from 'jsr:@std/assert@1';

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {};
// deno-lint-ignore no-explicit-any
const rpcCalls: { name: string; body: any }[] = [];
// deno-lint-ignore no-explicit-any
const openAiRequests: any[] = [];
let openAiReplies: Response[] = [];
let slot: Row = { run: 'run-1' };

const ALICE = '00000000-0000-0000-0000-00000000000a';
const CHAT = '10000000-0000-0000-0000-000000000001';

/** coach_history for Alice: three bench sessions and two weigh-ins. */
const HISTORY = {
  workouts: ['2026-10-05', '2026-10-12', '2026-10-19'].map((day, i) => ({
    name: 'Push',
    started_at: `${day}T17:00:00+00:00`,
    finished_at: `${day}T18:00:00+00:00`,
    exercises: [{ exercise_id: 'bench-press', sets: [[100 + i * 2.5, 5, null, 2]] }],
  })),
  weights: [
    ['2026-10-01', 80.4],
    ['2026-10-20', 79.8],
  ],
  checks: [],
  exercises: [
    {
      id: 'bench-press',
      name: { en: 'Bench Press', de: 'Bankdrücken' },
      measures: ['weight', 'reps'],
      muscles: { chest: 0.6, triceps: 0.25, front_delts: 0.15 },
      equipment: 'barbell',
      assisted: false,
      cardio: false,
    },
  ],
  custom_exercises: [],
};

function reset({ birthDate = '1995-04-01', consent = '2026-10-01T00:00:00Z' } = {}) {
  rpcCalls.length = 0;
  openAiRequests.length = 0;
  openAiReplies = [];
  slot = { run: 'run-1' };
  db.profiles = [
    {
      id: ALICE,
      birth_date: birthDate,
      unit_preference: 'metric',
      goal: 'hypertrophy',
      experience: 'intermediate',
      focus: ['chest'],
      equipment: 'gym',
      active_plan_id: null,
      language: 'de',
      coach_consent_at: consent,
    },
  ];
  db.coach_chats = [];
  db.coach_messages = [];
  db.coach_runs = [{ id: 'run-1', user_id: ALICE, status: 'pending' }];
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** A streamed Responses API answer: its text in pieces, then the finished response. */
function streamed(output: unknown[], text = '') {
  const events = [
    ...(text ? [text.slice(0, 5), text.slice(5)] : []).map((delta) => ({
      type: 'response.output_text.delta',
      delta,
    })),
    {
      type: 'response.completed',
      response: {
        status: 'completed',
        output,
        service_tier: 'fast',
        usage: {
          input_tokens: 3000,
          output_tokens: 60,
          input_tokens_details: { cached_tokens: 2500 },
        },
      },
    },
  ];
  return new Response(events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join(''), {
    headers: { 'Content-Type': 'text/event-stream', 'openai-processing-ms': '900' },
  });
}

const callsTool = (name: string, args: Row) =>
  streamed([
    { type: 'reasoning', id: 'rs_1', encrypted_content: 'x' },
    { type: 'function_call', call_id: 'call_1', name, arguments: JSON.stringify(args) },
  ]);
const answers = (text: string) =>
  streamed([{ type: 'message', content: [{ type: 'output_text', text }] }], text);

/** PostgREST filters as supabase-js writes them: eq. and in.(…). */
function matches(row: Row, params: URLSearchParams) {
  for (const [key, value] of params) {
    if (['select', 'limit', 'order'].includes(key)) continue;
    if (value.startsWith('eq.') && String(row[key]) !== value.slice(3)) return false;
    if (value.startsWith('in.(') && !value.slice(4, -1).split(',').includes(String(row[key]))) {
      return false;
    }
  }
  return true;
}

globalThis.fetch = async (input, init) => {
  const url = new URL(String(input instanceof Request ? input.url : input));
  const method = init?.method ?? 'GET';
  const body = init?.body ? JSON.parse(String(init.body)) : undefined;
  if (url.hostname === 'api.openai.com') {
    openAiRequests.push(body);
    return openAiReplies.shift() ?? json({ error: 'no reply scripted' }, 500);
  }
  if (url.pathname === '/auth/v1/user') {
    const token = new Headers(init?.headers).get('Authorization')?.replace('Bearer ', '');
    return token === 'alice-token' ? json({ id: ALICE }) : json({ message: 'invalid' }, 401);
  }
  const rpc = /^\/rest\/v1\/rpc\/(\w+)/.exec(url.pathname);
  if (rpc) {
    rpcCalls.push({ name: rpc[1], body });
    if (rpc[1] === 'start_coach_run') return json(slot);
    if (rpc[1] === 'coach_history') return json(HISTORY);
    // save_coach_answer, as the database does it.
    if (!db.coach_chats.some((c) => c.id === body.p_chat_id)) {
      db.coach_chats.push({ id: body.p_chat_id, user_id: body.p_user_id });
    }
    db.coach_messages.push(
      {
        id: body.p_question_id,
        chat_id: body.p_chat_id,
        role: 'user',
        content: body.p_question,
        created_at: '1',
      },
      {
        id: body.p_answer_id,
        chat_id: body.p_chat_id,
        role: 'coach',
        content: body.p_answer,
        created_at: '2',
      },
    );
    Object.assign(
      db.coach_runs.find((r) => r.id === body.p_run_id)!,
      {
        status: 'ok',
        answer_id: body.p_answer_id,
        calls: body.p_calls,
      },
    );
    return json(null);
  }
  const table = url.pathname.replace('/rest/v1/', '');
  const rows = (db[table] ??= []);
  const found = rows.filter((r) => matches(r, url.searchParams));
  if (method === 'GET') {
    if (url.searchParams.get('order')?.endsWith('.desc')) found.reverse();
    const single = new Headers(init?.headers).get('Accept')?.includes('vnd.pgrst.object');
    return single ? (found[0] ? json(found[0]) : json(null, 406)) : json(found);
  }
  if (method === 'PATCH') {
    found.forEach((r) => Object.assign(r, body));
    return new Response(null, { status: 204 });
  }
  if (method === 'DELETE') {
    db[table] = rows.filter((r) => !found.includes(r));
    return new Response(null, { status: 204 });
  }
  return json({}, 500);
};

Deno.env.set('SUPABASE_URL', 'http://supabase.test');
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
Deno.env.set('OPENAI_API_KEY', 'test-key');

// The function registers its handler with Deno.serve when imported; keep it instead.
let handler: (req: Request) => Promise<Response> = () => Promise.reject();
Object.defineProperty(Deno, 'serve', {
  value: (h: typeof handler) => {
    handler = h;
  },
});
await import('../coach-chat/index.ts');

const ask = (body: Row, token = 'alice-token') =>
  handler(
    new Request('http://functions.test/coach-chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeZone: 'Europe/Berlin', language: 'de', ...body }),
    }),
  );

/** The server-sent events of a streamed answer. */
async function eventsOf(response: Response) {
  const text = await response.text();
  return text
    .split('\n\n')
    .filter(Boolean)
    .map((event) => JSON.parse(event.replace(/^data: /, '')));
}

Deno.test(
  'refuses before anything reaches OpenAI: sign-in, question, age, consent, limits',
  async () => {
    reset();
    assertEquals((await ask({ question: 'Hallo' }, 'wrong')).status, 401);
    assertEquals((await ask({ question: '' })).status, 400);
    assertEquals((await ask({ question: 'x'.repeat(501) })).status, 400);
    assertEquals((await ask({ question: 'Hallo', chatId: 'nope' })).status, 400);
    reset({ birthDate: '2011-01-01' });
    assertEquals(await (await ask({ question: 'Hallo' })).json(), { error: 'too_young' });
    reset({ consent: null as unknown as string });
    assertEquals(await (await ask({ question: 'Hallo' })).json(), { error: 'consent_required' });
    reset();
    assertEquals((await ask({ question: 'Hallo', chatId: CHAT })).status, 404);
    slot = { limit: 'daily', retry_at: '2026-11-03T14:30:00+00:00' };
    const limited = await ask({ question: 'Hallo' });
    assertEquals(limited.status, 429);
    assertEquals(await limited.json(), {
      error: 'limit',
      limit: 'daily',
      count: 20,
      retryAt: '2026-11-03T14:30:00+00:00',
    });
    assertEquals(openAiRequests.length, 0);
  },
);

Deno.test(
  'streams the steps, chart and text, then saves the question with its answer',
  async () => {
    reset({ consent: null as unknown as string });
    openAiReplies = [
      callsTool('trend', {
        metric: 'e1rm',
        exercise_id: 'bench-press',
        from: null,
        to: null,
        show_records: false,
      }),
      answers('Dein 1RM liegt bei **122,5 kg**.'),
    ];
    // Sending the first question with consent records it.
    const response = await ask({ question: 'Wie läuft mein Bankdrücken?', consent: true });
    assertEquals(response.headers.get('Content-Type'), 'text/event-stream');
    const events = await eventsOf(response);
    assert(db.profiles[0].coach_consent_at);

    const [start, ...rest] = events;
    assertEquals(start.type, 'start');
    assertEquals(
      rest.map((e) => e.type),
      ['searched', 'found', 'text', 'text', 'done'],
    );
    assertEquals(rest[0], { type: 'searched', tool: 'trend', of: 'workouts', count: 3 });
    assertEquals(rest[1].chart.type, 'trend');
    assertEquals(rest[2].text + rest[3].text, 'Dein 1RM liegt bei **122,5 kg**.');

    // The model got the settings, the German exercise name and the tool result.
    assertEquals(openAiRequests[0].model, 'gpt-6.1-sol');
    assertEquals(openAiRequests[0].service_tier, 'fast');
    assertEquals(openAiRequests[0].reasoning, { effort: 'low' });
    assert(openAiRequests[0].instructions.includes('bench-press · Bankdrücken'));
    const output = openAiRequests[1].input.find((i: Row) => i.type === 'function_call_output');
    // The last session: 105 kg × 5, so 105 × (1 + 5/30).
    assertEquals(JSON.parse(output.output).last.value, 122.5);

    const save = rpcCalls.find((c) => c.name === 'save_coach_answer')!.body;
    assertEquals(save.p_chat_id, start.chatId);
    assertEquals(save.p_question_id, start.questionId);
    assertEquals(save.p_answer_id, start.answerId);
    assertEquals(save.p_question, 'Wie läuft mein Bankdrücken?');
    assertEquals(save.p_chart.type, 'trend');
    assertEquals(save.p_calls[0].name, 'trend');
    assertEquals(save.p_usage.fast, true);
  },
);

Deno.test('a follow-up replays the chat with its tool calls', async () => {
  reset();
  openAiReplies = [
    callsTool('trend', {
      metric: 'body_weight',
      exercise_id: null,
      from: null,
      to: null,
      show_records: false,
    }),
    answers('Du hast **0,6 kg** abgenommen.'),
  ];
  const first = (
    await eventsOf(await ask({ question: 'Wie hat sich mein Gewicht entwickelt?' }))
  )[0];
  openAiReplies = [answers('In den letzten 2 Wochen kaum.')];
  openAiRequests.length = 0;
  const events = await eventsOf(await ask({ question: 'Und nur zuletzt?', chatId: first.chatId }));
  assertEquals(events.at(-1).type, 'done');
  const input = openAiRequests[0].input as Row[];
  assertEquals(
    input.map((i) => i.role ?? i.type),
    ['user', 'function_call', 'function_call_output', 'assistant', 'user'],
  );
  assertEquals(input[0].content, 'Wie hat sich mein Gewicht entwickelt?');
  assertEquals(JSON.parse(String(input[1].arguments)).metric, 'body_weight');
  assertEquals(input[3].content, 'Du hast **0,6 kg** abgenommen.');
});

Deno.test('an answer OpenAI rejects gives the slot back and saves nothing', async () => {
  reset();
  openAiReplies = [json({ error: { message: 'bad request' } }, 400)];
  const events = await eventsOf(await ask({ question: 'Wie läuft mein Bankdrücken?' }));
  assertEquals(
    events.map((e) => e.type),
    ['start', 'error'],
  );
  assertEquals(db.coach_runs.length, 0);
  assertEquals(db.coach_messages.length, 0);
});
