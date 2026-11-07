// Shared by the Edge Functions, which all run with verify_jwt = false (config.toml). Those that
// need a signed-in user (assess-progress, revoke-apple-token) check the token themselves with
// `requestUser`, which works with the asymmetric signing keys.
import { createClient } from 'jsr:@supabase/supabase-js@2';

import { openAiConfigured } from './openai.ts';

export const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export const reply = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Whether a value from a request is a UUID (any case), as ids are. */
export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && UUID.test(value);

/** The answer to a request a function that asks OpenAI can't take: not a POST, or no key set. */
export function refuseAiRequest(req: Request, headers: Record<string, string> = {}) {
  if (req.method !== 'POST') return reply(405, { error: 'method_not_allowed' }, headers);
  if (!openAiConfigured()) {
    console.error('OPENAI_API_KEY is not set (supabase/functions/.env)');
    return reply(500, { error: 'not_configured' }, headers);
  }
  return null;
}

/** A whole number from the environment; the default when unset, empty or not a number. */
export function envLimit(name: string, fallback: number) {
  const value = Number(Deno.env.get(name) || NaN);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

/** The user the request's bearer token belongs to; null without a valid one. */
export async function requestUser(req: Request) {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data } = await admin.auth.getUser(token);
  return data.user;
}
