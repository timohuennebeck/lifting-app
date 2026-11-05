// deno test --allow-env supabase/functions/_shared/coach-transcribe.test.ts
// Runs coach-transcribe against a small stand-in for the Supabase API and a fake OpenAI, and checks
// who gets a transcription, what OpenAI is sent and that a failed one hands its slot back.
import { assert, assertEquals, assertNotEquals } from 'jsr:@std/assert@1';

type Row = Record<string, unknown>;
const ALICE = '00000000-0000-0000-0000-00000000000a';
let profile: Row | null = null;
/** start_plan_request's answer: the slot's id, or null at the limit. */
let slot: number | null = 7;
/** Whether RevenueCat lists Alice's Pro entitlement. */
let pro = true;
// deno-lint-ignore no-explicit-any
const rpcCalls: { name: string; body: any }[] = [];
const deleted: string[] = [];
const openAiForms: FormData[] = [];
let openAiReplies: Response[] = [];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function reset(birthDate: string | null = '1995-04-01') {
  profile = { birth_date: birthDate };
  slot = 7;
  pro = true;
  rpcCalls.length = 0;
  deleted.length = 0;
  openAiForms.length = 0;
  openAiReplies = [];
}

globalThis.fetch = async (input, init) => {
  const url = new URL(String(input instanceof Request ? input.url : input));
  if (url.hostname === 'api.openai.com') {
    openAiForms.push(init?.body as FormData);
    return openAiReplies.shift() ?? json({ error: 'no reply scripted' }, 500);
  }
  if (url.hostname === 'api.revenuecat.com') {
    return json({ subscriber: { entitlements: pro ? { pro: { expires_date: null } } : {} } });
  }
  if (url.pathname === '/auth/v1/user') {
    const token = new Headers(init?.headers).get('Authorization')?.replace('Bearer ', '');
    return token === 'alice-token' ? json({ id: ALICE }) : json({ message: 'invalid' }, 401);
  }
  const rpc = /^\/rest\/v1\/rpc\/(\w+)/.exec(url.pathname);
  if (rpc) {
    rpcCalls.push({ name: rpc[1], body: JSON.parse(String(init?.body)) });
    return json(slot);
  }
  if (url.pathname === '/rest/v1/profiles') return profile ? json(profile) : json(null, 406);
  if (url.pathname === '/rest/v1/plan_requests' && init?.method === 'DELETE') {
    deleted.push(url.searchParams.get('id') ?? '');
    return new Response(null, { status: 204 });
  }
  return json({}, 500);
};

Deno.env.set('SUPABASE_URL', 'http://supabase.test');
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'service-key');
Deno.env.set('OPENAI_API_KEY', 'test-key');
Deno.env.set('REVENUECAT_SECRET_KEY', 'revenuecat-key');

let handler: (req: Request) => Promise<Response> = () => Promise.reject();
Object.defineProperty(Deno, 'serve', {
  value: (h: typeof handler) => {
    handler = h;
  },
});
await import('../coach-transcribe/index.ts');

/** "Hallo" as a stand-in recording. */
const AUDIO = btoa('Hallo');
const send = (body: Row, token = 'alice-token') =>
  handler(
    new Request('http://functions.test/coach-transcribe', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: AUDIO, mimeType: 'audio/m4a', language: 'de', ...body }),
    }),
  );

Deno.test('a recording comes back as text, with the coach topic as context', async () => {
  reset();
  openAiReplies = [json({ text: ' Bin ich beim Bankdrücken stärker geworden? ' })];
  const response = await send({});
  assertEquals(response.status, 200);
  assertEquals(await response.json(), { text: 'Bin ich beim Bankdrücken stärker geworden?' });
  const form = openAiForms[0];
  assertEquals(form.get('model'), 'gpt-transcribe');
  assertEquals((form.get('file') as File).name, 'question.m4a');
  assertEquals(await (form.get('file') as File).text(), 'Hallo');
  assert(String(form.get('prompt')).includes('Bankdrücken'));
  // One transcription of the user's day, keyed by a hash of their id.
  assertEquals(rpcCalls[0].name, 'start_plan_request');
  assertEquals(rpcCalls[0].body.p_kind, 'transcribe');
  assertEquals(rpcCalls[0].body.p_ip_limit, 100);
  assertNotEquals(rpcCalls[0].body.p_ip_hash, ALICE);
  assertEquals(deleted, []);
});

Deno.test('only signed-in Pro users of 16 and more with a known birth date get one', async () => {
  reset();
  assertEquals((await send({}, 'nobody')).status, 401);
  reset('2015-01-01');
  const young = await send({});
  assertEquals(young.status, 403);
  assertEquals(await young.json(), { error: 'too_young' });
  reset();
  pro = false;
  const free = await send({});
  assertEquals(free.status, 403);
  assertEquals(await free.json(), { error: 'not_pro' });
  reset(null);
  assertEquals((await send({})).status, 403);
  assertEquals(openAiForms.length, 0);
  assertEquals(rpcCalls.length, 0);
});

Deno.test('a recording of an unknown kind, without audio or language is refused', async () => {
  reset();
  assertEquals((await send({ mimeType: 'video/mp4' })).status, 400);
  assertEquals((await send({ mimeType: 'audio/webm' })).status, 400);
  assertEquals((await send({ audio: '' })).status, 400);
  assertEquals((await send({ language: undefined })).status, 400);
  assertEquals((await send({ language: 'it' })).status, 400);
  assertEquals(openAiForms.length, 0);
  assertEquals(rpcCalls.length, 0);
});

Deno.test('at the day limit the user is told so and OpenAI is not asked', async () => {
  reset();
  slot = null;
  const response = await send({});
  assertEquals(response.status, 429);
  assertEquals(await response.json(), { error: 'limit' });
  assertEquals(openAiForms.length, 0);
});

Deno.test('a transcription OpenAI fails hands its slot back', async () => {
  reset();
  openAiReplies = [json({ error: 'overloaded' }, 503)];
  const response = await send({});
  assertEquals(response.status, 502);
  assertEquals(deleted, ['eq.7']);
});
