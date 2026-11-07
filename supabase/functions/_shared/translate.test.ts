// deno test --allow-env supabase/functions/_shared/translate.test.ts
// The OpenAI call is faked: the tests check the request sent and how answers are read.
import { assert, assertEquals, assertMatch, assertStringIncludes } from 'jsr:@std/assert@1';

Deno.env.set('OPENAI_API_KEY', 'test-key');
import { isAppLanguage } from './plan-events.ts';
const { instructions, sameLanguage, translateText } = await import('./translate.ts');

interface Sent {
  model: string;
  instructions: string;
  reasoning?: unknown;
  store: boolean;
  input: { content: { text: string }[] }[];
}

/** Fakes OpenAI's answer for one call and returns what was sent. */
function fakeOpenAi(answer: unknown, status = 200) {
  const sent: Sent[] = [];
  globalThis.fetch = (_url, init) => {
    sent.push(JSON.parse(String(init?.body)));
    return Promise.resolve(new Response(JSON.stringify(answer), { status }));
  };
  return sent;
}

const answer = (json: unknown) => ({
  status: 'completed',
  output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(json) }] }],
  usage: { input_tokens: 420, output_tokens: 60 },
});

Deno.test('the same language ignores the region', () => {
  assertEquals(sameLanguage('pt-BR', 'pt-PT'), true);
  assertEquals(sameLanguage('de-AT', 'de'), true);
  assertEquals(sameLanguage('ko', 'en'), false);
});

Deno.test('translates with GPT-6 Luna, no reasoning, nothing stored', async () => {
  const sent = fakeOpenAi(answer({ source_language: 'ko', translation: 'Mein Abo ist weg.' }));
  const result = await translateText('구독이 사라졌어요', 'de');
  assertEquals(result, { source: 'ko', translation: 'Mein Abo ist weg.' });
  assertEquals(sent[0].model, 'gpt-6-luna');
  assertEquals(sent[0].reasoning, { effort: 'none' });
  assertEquals(sent[0].store, false);
  assertEquals(sent[0].input[0].content[0].text, '구독이 사라졌어요');
  assertMatch(
    sent[0].instructions,
    /German\. When the text addresses its reader, use the informal "du"/,
  );
});

Deno.test('a text already in the target language needs no translation', async () => {
  fakeOpenAi(answer({ source_language: 'pt-BR', translation: 'Oi!' }));
  assertEquals(await translateText('Oi!', 'pt-PT'), { source: 'pt-BR', translation: null });
});

Deno.test('failures leave the message untranslated', async () => {
  fakeOpenAi({ error: 'overloaded' }, 529);
  assertEquals(await translateText('Hallo', 'en'), null);
  fakeOpenAi({
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'no' }] }],
  });
  assertEquals(await translateText('Hallo', 'en'), null);
  fakeOpenAi({
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: 'not json' }] }],
  });
  assertEquals(await translateText('Hallo', 'en'), null);
  globalThis.fetch = () => Promise.reject(new Error('network down'));
  assertEquals(await translateText('Hallo', 'en'), null);
});

Deno.test('es and fr are app languages', () => {
  assert(isAppLanguage('es'));
  assert(isAppLanguage('fr'));
  assert(!isAppLanguage('it'));
});

Deno.test('a regional tag is the same language', () => {
  assertEquals(sameLanguage('es-419', 'es'), true);
  assertEquals(sameLanguage('fr-CA', 'fr'), true);
  assertEquals(sameLanguage('es', 'fr'), false);
});

Deno.test('the translator is told the tone in Spanish and French', () => {
  assertStringIncludes(instructions('es'), 'Spanish');
  assertStringIncludes(instructions('es'), '"tú"');
  assertStringIncludes(instructions('fr'), 'French');
  assertStringIncludes(instructions('fr'), '"tu"');
});
