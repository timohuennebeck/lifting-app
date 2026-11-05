// deno test --allow-env supabase/functions/_shared/support-functions.test.ts
// Runs translate-ticket-messages and send-team-reply against a small in-memory stand-in for the
// Supabase API and a fake OpenAI, and checks what they read, translate and save.
import { assertEquals } from 'jsr:@std/assert@1';

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {};
// deno-lint-ignore no-explicit-any
const calls: { table: string; method: string; body?: any; url: string }[] = [];
const ALICE = '00000000-0000-0000-0000-00000000000a';
const TICKET = '10000000-0000-0000-0000-000000000001';
const M1 = '20000000-0000-0000-0000-000000000001';
const M2 = '20000000-0000-0000-0000-000000000002';

function reset() {
  calls.length = 0;
  db.profiles = [{ id: ALICE, language: 'ko' }];
  db.tickets = [{ id: TICKET, user_id: ALICE }];
  db.ticket_messages = [
    { id: M1, user_id: ALICE, author: 'user', content: '구독이 사라졌어요', language: null },
    {
      id: M2,
      user_id: ALICE,
      author: 'team',
      content: 'Bitte stell die Käufe wieder her.',
      language: 'de',
    },
  ];
  db.ticket_message_translations = [];
}

/** PostgREST filters as supabase-js writes them: eq., is.null and in.(…). */
function matches(row: Row, params: URLSearchParams) {
  for (const [key, value] of params) {
    if (['select', 'on_conflict', 'limit', 'order'].includes(key)) continue;
    const field = row[key];
    if (value.startsWith('eq.') && String(field) !== value.slice(3)) return false;
    if (value === 'is.null' && field !== null) return false;
    if (value.startsWith('in.(')) {
      const list = value
        .slice(4, -1)
        .split(',')
        .map((v) => v.replace(/^"|"$/g, ''));
      if (!list.includes(String(field))) return false;
    }
  }
  return true;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** What OpenAI answers: the "translation" names its target, the source is guessed from the text. */
function openAi(body: { instructions: string; input: { content: { text: string }[] }[] }) {
  const text = body.input[0].content[0].text;
  const target = /into (\w+)/.exec(body.instructions)?.[1] ?? '?';
  const source = /[가-힣]/.test(text) ? 'ko' : /[äöüß]|Bitte|Danke/.test(text) ? 'de' : 'en';
  const sameAsTarget =
    { German: 'de', Korean: 'ko', English: 'en', Spanish: 'es', French: 'fr' }[target] === source;
  const answer = {
    source_language: source,
    translation: sameAsTarget ? text : `[${target}] ${text}`,
  };
  return json({
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(answer) }] }],
  });
}

globalThis.fetch = async (input, init) => {
  const url = new URL(String(input instanceof Request ? input.url : input));
  const method = init?.method ?? 'GET';
  const body = init?.body ? JSON.parse(String(init.body)) : undefined;
  if (url.hostname === 'api.openai.com') return openAi(body);
  if (url.pathname === '/auth/v1/user') {
    const token = new Headers(init?.headers).get('Authorization')?.replace('Bearer ', '');
    if (token === 'support-token')
      return json({ id: 'support', app_metadata: { role: 'support' } });
    if (token === 'user-token') return json({ id: ALICE, app_metadata: { provider: 'apple' } });
    return json({ message: 'invalid' }, 401);
  }
  const rpc = /^\/rest\/v1\/rpc\/(\w+)/.exec(url.pathname);
  if (rpc) {
    calls.push({ table: `rpc:${rpc[1]}`, method, body, url: url.search });
    const id = '30000000-0000-0000-0000-000000000003';
    db.ticket_messages.push({
      id,
      user_id: ALICE,
      author: 'team',
      content: body.p_content,
      language: body.p_language,
    });
    if (body.p_translation) {
      db.ticket_message_translations.push({
        message_id: id,
        user_id: ALICE,
        language: body.p_translation_language,
        content: body.p_translation,
      });
    }
    return json(id);
  }
  const table = url.pathname.replace('/rest/v1/', '');
  calls.push({ table, method, body, url: url.search });
  const rows = (db[table] ??= []);
  if (method === 'GET') {
    const found = rows.filter((r) => matches(r, url.searchParams));
    const single = new Headers(init?.headers).get('Accept')?.includes('vnd.pgrst.object');
    return single ? (found[0] ? json(found[0]) : json(null, 406)) : json(found);
  }
  if (method === 'PATCH') {
    rows.filter((r) => matches(r, url.searchParams)).forEach((r) => Object.assign(r, body));
    return new Response(null, { status: 204 });
  }
  if (method === 'POST') {
    for (const row of [body].flat()) {
      const exists = rows.some(
        (r) => r.message_id === row.message_id && r.language === row.language,
      );
      if (!exists) rows.push(row);
    }
    return new Response(null, { status: 201 });
  }
  return json({}, 500);
};

Deno.env.set('SUPABASE_URL', 'http://supabase.test');
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
Deno.env.set('OPENAI_API_KEY', 'test-key');
Deno.env.set('TRANSLATION_WEBHOOK_SECRET', 'hook-secret');

// Each function registers its handler with Deno.serve when imported; keep the handlers instead.
const handlers: ((req: Request) => Promise<Response>)[] = [];
Object.defineProperty(Deno, 'serve', {
  value: (handler: (req: Request) => Promise<Response>) => {
    handlers.push(handler);
    return {};
  },
});
await import('../translate-ticket-messages/index.ts');
await import('../send-team-reply/index.ts');
const [translate, sendReply] = handlers;

const post = (handler: typeof translate, body: unknown, headers: Record<string, string>) =>
  handler(
    new Request('http://functions.test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
  );
const translationsOf = (id: string) =>
  db.ticket_message_translations
    .filter((t) => t.message_id === id)
    .map((t) => [t.language, t.content]);

Deno.test("a user's message goes into the team's language, its own is noted", async () => {
  reset();
  const res = await post(translate, { message_id: M1 }, { 'X-Webhook-Secret': 'hook-secret' });
  assertEquals(res.status, 200);
  assertEquals(translationsOf(M1), [['de', '[German] 구독이 사라졌어요']]);
  assertEquals(db.ticket_messages[0].language, 'ko');
});

Deno.test("a team reply goes into the user's app language, once", async () => {
  reset();
  await post(translate, { message_id: M2 }, { 'X-Webhook-Secret': 'hook-secret' });
  await post(translate, { message_id: M2 }, { 'X-Webhook-Secret': 'hook-secret' });
  assertEquals(translationsOf(M2), [['ko', '[Korean] Bitte stell die Käufe wieder her.']]);
  assertEquals(
    calls.filter((c) => c.table === 'ticket_message_translations' && c.method === 'POST').length,
    1,
  );
});

Deno.test('switching the app language translates the team replies into it', async () => {
  reset();
  await post(translate, { user_id: ALICE, language: 'en' }, { 'X-Webhook-Secret': 'hook-secret' });
  assertEquals(translationsOf(M2), [['en', '[English] Bitte stell die Käufe wieder her.']]);
  // User messages aren't touched by a language switch.
  assertEquals(translationsOf(M1), []);
});

Deno.test('a wrong secret or a user token is turned away', async () => {
  reset();
  assertEquals(
    (await post(translate, { message_id: M1 }, { 'X-Webhook-Secret': 'nope' })).status,
    401,
  );
  const asUser = await post(
    translate,
    { message_ids: [M1], language: 'en' },
    { Authorization: 'Bearer user-token' },
  );
  assertEquals(asUser.status, 401);
  assertEquals(
    (
      await post(
        sendReply,
        { ticket_id: TICKET, content: 'Hi' },
        { Authorization: 'Bearer user-token' },
      )
    ).status,
    401,
  );
  assertEquals(db.ticket_message_translations.length, 0);
});

Deno.test('the desk asks for its language and gets the translations back', async () => {
  reset();
  const res = await post(
    translate,
    { message_ids: [M1, M2], language: 'en' },
    { Authorization: 'Bearer support-token' },
  );
  assertEquals(res.status, 200);
  const { translations } = await res.json();
  // Translated side by side, so in any order.
  assertEquals(translations.map((t: Row) => `${t.message_id} ${t.language}`).sort(), [
    `${M1} en`,
    `${M2} en`,
  ]);
  assertEquals(
    (
      await post(
        translate,
        { message_ids: [M1], language: 'it' },
        { Authorization: 'Bearer support-token' },
      )
    ).status,
    400,
  );
});

Deno.test("a team reply is saved with the user's translation in one call", async () => {
  reset();
  const res = await post(
    sendReply,
    { ticket_id: TICKET, content: '  Danke, wir prüfen das!  ' },
    { Authorization: 'Bearer support-token' },
  );
  assertEquals(res.status, 200);
  assertEquals(await res.json(), {
    id: '30000000-0000-0000-0000-000000000003',
    language: 'ko',
    translated: true,
  });
  const rpc = calls.find((c) => c.table === 'rpc:insert_team_reply');
  assertEquals(rpc?.body, {
    p_ticket_id: TICKET,
    p_content: 'Danke, wir prüfen das!',
    p_language: 'de',
    p_translation_language: 'ko',
    p_translation: '[Korean] Danke, wir prüfen das!',
  });
  assertEquals(
    (
      await post(
        sendReply,
        { ticket_id: TICKET, content: ' ' },
        { Authorization: 'Bearer support-token' },
      )
    ).status,
    400,
  );
});

Deno.test("a team reply is saved with a Spanish user's translation", async () => {
  reset();
  db.profiles = [{ id: ALICE, language: 'es' }];
  await post(
    sendReply,
    { ticket_id: TICKET, content: 'Danke, wir prüfen das!' },
    { Authorization: 'Bearer support-token' },
  );
  const rpc = calls.find((c) => c.table === 'rpc:insert_team_reply');
  assertEquals(rpc?.body.p_translation_language, 'es');
});

Deno.test("a team reply is saved with a French user's translation", async () => {
  reset();
  db.profiles = [{ id: ALICE, language: 'fr' }];
  await post(
    sendReply,
    { ticket_id: TICKET, content: 'Danke, wir prüfen das!' },
    { Authorization: 'Bearer support-token' },
  );
  const rpc = calls.find((c) => c.table === 'rpc:insert_team_reply');
  assertEquals(rpc?.body.p_translation_language, 'fr');
});

Deno.test('a reply already in the user language is saved without a translation', async () => {
  reset();
  await post(
    sendReply,
    { ticket_id: TICKET, content: '감사합니다' },
    { Authorization: 'Bearer support-token' },
  );
  const rpc = calls.find((c) => c.table === 'rpc:insert_team_reply');
  assertEquals([rpc?.body.p_language, rpc?.body.p_translation], ['ko', null]);
});
