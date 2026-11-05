// deno test --allow-env supabase/functions/_shared/account.test.ts
// Checks the Pro check without a RevenueCat key (refused on a hosted project, let through on the
// local stack, logged either way) and when RevenueCat can't be reached (let through).
import { assert, assertEquals } from 'jsr:@std/assert@1';

import { hasPro } from './account.ts';

const ALICE = '00000000-0000-0000-0000-00000000000a';
const HOSTED = 'https://abcdefghijklmnopqrst.supabase.co';

/** Sets the variables, deleting those given as undefined. */
function setEnv(env: Record<string, string | undefined>) {
  for (const [name, value] of Object.entries(env)) {
    if (value === undefined) Deno.env.delete(name);
    else Deno.env.set(name, value);
  }
}

/**
 * Alice's Pro check with these variables and RevenueCat's `answer`, and what it logged and
 * fetched. Puts the variables, fetch and console.error back afterwards.
 */
async function check(
  env: Record<string, string | undefined>,
  answer = () => Promise.reject<Response>(new Error('unexpected fetch')),
) {
  const before = Object.fromEntries(Object.keys(env).map((name) => [name, Deno.env.get(name)]));
  const { fetch } = globalThis;
  const { error } = console;
  const logged: string[] = [];
  const fetched: string[] = [];
  setEnv(env);
  globalThis.fetch = (input) => {
    fetched.push(String(input));
    return answer();
  };
  console.error = (...args: unknown[]) => logged.push(args.join(' '));
  try {
    return { pro: await hasPro(ALICE), logged, fetched };
  } finally {
    setEnv(before);
    globalThis.fetch = fetch;
    console.error = error;
  }
}

Deno.test('without a RevenueCat key, a hosted project refuses everyone and logs it', async () => {
  for (const url of [HOSTED, 'https://localhost.example.com', 'not a url', undefined]) {
    const { pro, logged, fetched } = await check({
      REVENUECAT_SECRET_KEY: undefined,
      SUPABASE_URL: url,
    });
    assertEquals(pro, false, String(url));
    assertEquals(fetched, []);
    assertEquals(logged.length, 1);
    assert(logged[0].startsWith('REVENUECAT_SECRET_KEY is not set'), logged[0]);
  }
});

Deno.test('without a key, the local stack lets everyone through and logs it', async () => {
  for (const url of ['http://kong:8000', 'http://127.0.0.1:54321', 'http://localhost:54321']) {
    const { pro, logged, fetched } = await check({
      REVENUECAT_SECRET_KEY: undefined,
      SUPABASE_URL: url,
    });
    assertEquals(pro, true, url);
    assertEquals(fetched, []);
    assertEquals(logged.length, 1);
    assert(logged[0].startsWith('REVENUECAT_SECRET_KEY is not set'), logged[0]);
  }
});

Deno.test("when RevenueCat can't be reached, the request goes through", async () => {
  const answers = [
    () => Promise.reject<Response>(new Error('network down')),
    () => Promise.resolve(new Response('overloaded', { status: 503 })),
  ];
  for (const answer of answers) {
    const { pro, fetched } = await check(
      { REVENUECAT_SECRET_KEY: 'revenuecat-key', SUPABASE_URL: HOSTED },
      answer,
    );
    assertEquals(pro, true);
    assertEquals(fetched, [`https://api.revenuecat.com/v1/subscribers/${ALICE}`]);
  }
});
